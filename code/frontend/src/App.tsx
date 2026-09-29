/* ─────────────────────────────────────────────────────────────────────────
   P1 · 应用容器（重写）

   职责（原分散在各页面里的数据逻辑全部上移到这里）：
   1. hash 导航：'#/profile' 等，替代 react-router（已从依赖中剥离）；
   2. 数据获取：profile / progress summary / scenario 列表 / path 首次生成；
   3. 写操作：activatePath、updateTask（乐观更新 + 失败回滚）；
   4. 评估报告上下文：内存 nav state + sessionStorage 兜底（原 Evaluation 页逻辑）。

   页面（src/pages/*）此后**不发任何请求、不 import react-router、
   不引用 import.meta.env** —— 每个页面都是纯受控组件，可直接被
   P2 的 UMD 卡片打包复用，数据由宿主工作流经 props 注入。
   ───────────────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import ErrorBoundary from './ErrorBoundary'
import MainLayout from './layout/MainLayout'
import Home from './pages/Home'
import Profile from './pages/Profile'
import PathPage from './pages/Path'
import ScenarioPage from './pages/Scenario'
import Evaluation from './pages/Evaluation'
import ProgressPage from './pages/Progress'
import { DEMO_USER_ID, makeIdempotencyKey, pathApi, profileApi, progressApi, scenarioApi } from './services/api'
import {
  DEFAULT_HORIZON_YEARS,
  DEFAULT_PRIORITY,
  DEFAULT_ROLE_ID,
  DEFAULT_WEEKLY_HOURS,
  type CareerProfile,
  type LearningPathResult,
  type ProgressSummary,
  type Scenario,
  type ScenarioEvaluation,
  type TaskStatus,
} from './services/types'

/* ── 评估报告的会话级持久化（原 Evaluation.tsx 的逻辑，P1 上移）────────────
   评估结果**服务端不落库**（`update_applied` 恒为 false，也无回查接口），
   刷新后要恢复内容只能靠客户端自己存。用 sessionStorage 而非 localStorage：
   报告属于"当次会话产物"，关掉标签页就该消失，与后端的临时态语义一致。 */
const STORAGE_PREFIX = 'a02:evaluation:'

function readStored(scenarioId: string): ScenarioEvaluation | null {
  if (!scenarioId || typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + scenarioId)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ScenarioEvaluation
    /* 最小校验：确认是同一场景且形状正确，避免半截数据让页面白屏 */
    if (!parsed || parsed.scenario_id !== scenarioId || typeof parsed.overall_score !== 'number') {
      return null
    }
    return parsed
  } catch {
    /* 存的东西坏了就当作没有，不要让 JSON.parse 的异常冒到渲染层 */
    return null
  }
}

function writeStored(value: ScenarioEvaluation) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + value.scenario_id, JSON.stringify(value))
  } catch {
    /* 隐私模式/配额满时会抛异常。存不下只是丢刷新能力，不该影响正常浏览 */
  }
}

/* ── 极简 hash 路由（替代 react-router）──────────────────────────────────
   保持与原 BrowserRouter 相同的路径键（'/'、'/profile'…、'/evaluation/:id'），
   只是载体从 pathname 换成 hash，刷新/深链依然可用，且无任何依赖。 */
const EVAL_PREFIX = '/evaluation/'

function currentHashRoute(): string {
  const raw = window.location.hash.replace(/^#/, '')
  return raw.startsWith('/') ? raw : '/'
}

function App() {
  /* ── 路由态 ─────────────────────────────────────────────────────────── */
  const [route, setRoute] = useState<string>(() => currentHashRoute())

  useEffect(() => {
    const onHashChange = () => setRoute(currentHashRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((to: string) => {
    const next = to.startsWith('/') ? to : `/${to}`
    if (currentHashRoute() === next) {
      /* 同路径幂等：手动写 hash 不会触发 hashchange，这里补一次状态同步 */
      setRoute(next)
    } else {
      window.location.hash = next
    }
  }, [])

  /* ── 全局数据（页面不再自行 fetch，全部由本容器注入）─────────────────── */
  const [profile, setProfile] = useState<CareerProfile | null>(null)
  const [profileError, setProfileError] = useState('')
  /** 服务端是否降级返回 MOCK（json.fallback=true）。
   *  后端 DB 异常时会 200 + 空 MOCK —— 不是真数据，页面必须明确提示，
   *  否则用户会把兜底数据当成自己的画像。 */
  const [profileDegraded, setProfileDegraded] = useState(false)
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [summaryError, setSummaryError] = useState('')
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [scenariosLoading, setScenariosLoading] = useState(true)
  const [scenariosError, setScenariosError] = useState('')

  const refreshSummary = useCallback(
    () =>
      progressApi
        .getSummary(DEMO_USER_ID)
        .then(setSummary)
        .catch((reason: Error) => setSummaryError(reason.message)),
    [],
  )

  useEffect(() => {
    profileApi
      .get(DEMO_USER_ID)
      .then(({ data, fallback }) => {
        setProfile(data)
        setProfileDegraded(fallback)
      })
      .catch((reason: Error) => setProfileError(reason.message))
    void refreshSummary()
    scenarioApi
      .list(DEMO_USER_ID)
      .then((result) => setScenarios(result.scenarios))
      .catch((reason: Error) => setScenariosError(reason.message))
      .finally(() => setScenariosLoading(false))
  }, [refreshSummary])

  /* ── 学习路径：数据 + 写操作（原 Path.tsx 的 loadPath/activate/toggle 上移）── */
  const [pathResult, setPathResult] = useState<LearningPathResult | null>(null)
  const [pathError, setPathError] = useState('')
  /** 服务端认哪条路径为激活路径（不是"用户选了哪条"）。 */
  const [activePathId, setActivePathId] = useState<string | null>(null)
  /** 任务状态覆盖层：`task_id -> status`。
   *  权威优先级：服务端返回值 > 本覆盖层 > generate 快照（result 里的 task.status）。 */
  const [taskStatus, setTaskStatus] = useState<Record<string, TaskStatus>>({})
  /** 首次生成是否已发起/完成 —— 防止路由重渲染触发重复 generate */
  const pathAttemptedRef = useRef(false)

  /** 读取某条任务在 generate 快照里的状态（覆盖层的回滚基准）。 */
  const snapshotStatusOf = (taskId: string): TaskStatus => {
    for (const branch of pathResult?.branches ?? []) {
      for (const phase of branch.phases) {
        for (const task of phase.tasks) {
          if (task.task_id === taskId) return (task.status as TaskStatus) ?? 'pending'
        }
      }
    }
    return 'pending'
  }

  /** 生成路径 + 回读服务端激活状态（原 loadPath，逻辑保持一致）。
   *  失败**不**写 pathError —— 由调用方决定怎么呈现：
   *  首次加载 catch 后写 pathError；交互式由页面在弹窗/页内提示。 */
  const generatePath = useCallback(async (roleId: string): Promise<void> => {
    const data = await pathApi.generate({
      user_id: DEMO_USER_ID,
      target_role_id: roleId,
      horizon_years: DEFAULT_HORIZON_YEARS,
      weekly_hours: DEFAULT_WEEKLY_HOURS,
      priority: DEFAULT_PRIORITY,
    })
    setPathResult(data)
    setPathError('')

    /* ⚠️ 服务端的 active_path 是**跨页面/跨刷新存活**的，不回读就会出现
       "后端明明已激活、刷新后页面却显示尚未生效、勾选框全灰"。 */
    try {
      const fresh = await progressApi.getSummary(DEMO_USER_ID)
      setSummary(fresh)
      const serverActiveId = fresh.active_path?.path_id ?? null
      /* 只有当服务端认的路径确实是本条结果里的某一条时才算数 */
      const belongsHere = data.branches.some((branch) => branch.path_id === serverActiveId)
      setActivePathId(belongsHere ? serverActiveId : null)

      if (belongsHere && serverActiveId) {
        /* 已激活路线的任务状态以服务端为准：按 path_id 再激活一次
           （幂等 key 固定前缀 + path_id，重复刷新不产生副作用）取回完整结构。 */
        const activated = await progressApi.activatePath(
          DEMO_USER_ID,
          serverActiveId,
          `resync-${serverActiveId}`,
        )
        setTaskStatus(
          Object.fromEntries(
            (activated.active_path?.phases ?? [])
              .flatMap((phase) => phase.tasks)
              .map((task) => [task.task_id, (task.status as TaskStatus) ?? 'pending']),
          ),
        )
      } else {
        /* generate 返回的是新的权威快照，旧覆盖层已无意义 */
        setTaskStatus({})
      }
    } catch {
      /* 回读失败不影响主流程（路径已显示），退化为"未激活"即可 */
      setActivePathId(null)
      setTaskStatus({})
    }
  }, [])

  /* 进入 /path 时首次生成（对应原 Path 页面挂载即 load）。
     ref 保证同一次停留只发一次；离开路由时 cleanup 复位，
     再次进入会重新生成 —— 与原「页面挂载即 load」的行为一致。 */
  useEffect(() => {
    if (route !== '/path') return
    if (pathAttemptedRef.current) return
    pathAttemptedRef.current = true
    generatePath(DEFAULT_ROLE_ID).catch((reason: Error) => setPathError(reason.message))
    return () => {
      pathAttemptedRef.current = false
    }
  }, [route, generatePath])

  /** 写接口 1/2：激活路径（失败时**不**改 activePathId，保持勾选框禁用）。 */
  const activatePath = useCallback(
    async (pathId: string): Promise<void> => {
      const data = await progressApi.activatePath(DEMO_USER_ID, pathId, makeIdempotencyKey('activate'))
      setActivePathId(data.active_path?.path_id ?? pathId)
      /* 服务端返回完整 branch 结构（含每个 task 的 status）→ 作为新的权威基准 */
      setTaskStatus(
        Object.fromEntries(
          (data.active_path?.phases ?? [])
            .flatMap((phase) => phase.tasks)
            .map((task) => [task.task_id, (task.status as TaskStatus) ?? 'pending']),
        ),
      )
      void refreshSummary()
    },
    [refreshSummary],
  )

  /** 写接口 2/2：更新任务状态。乐观更新 + 失败回滚（原 toggleTask 逻辑）。 */
  const toggleTask = async (taskId: string, nextStatus: TaskStatus): Promise<void> => {
    const prev = taskStatus[taskId] ?? snapshotStatusOf(taskId)
    if (prev === nextStatus) return

    setTaskStatus((current) => ({ ...current, [taskId]: nextStatus }))
    try {
      await progressApi.updateTask(
        DEMO_USER_ID,
        taskId,
        nextStatus,
        makeIdempotencyKey(`task-${taskId}`),
      )
      void refreshSummary()
    } catch (reason) {
      setTaskStatus((current) => {
        const next = { ...current }
        /* 回滚到操作前的状态；若等于 generate 快照的值就干脆删掉这个覆盖键 */
        if (prev === snapshotStatusOf(taskId)) delete next[taskId]
        else next[taskId] = prev
        return next
      })
      throw reason
    }
  }

  /* ── 场景训练 / 评估报告 ─────────────────────────────────────────────── */
  const [evalNav, setEvalNav] = useState<{ evaluation: ScenarioEvaluation; scenarioTitle: string } | null>(null)

  const startScenario = useCallback(async (scenarioId: string) => {
    const result = await scenarioApi.start(scenarioId, DEMO_USER_ID)
    return { sessionId: result.session_id, initialPrompt: result.scenario.initial_prompt }
  }, [])

  const evaluateScenario = useCallback(
    (sessionId: string, responseText: string) =>
      scenarioApi.evaluate(sessionId, DEMO_USER_ID, responseText),
    [],
  )

  /** 打开评估报告：内存 state（即时渲染）+ sessionStorage（刷新兜底）+ hash 路由。 */
  const openEvaluation = useCallback(
    (evaluation: ScenarioEvaluation, scenarioTitle: string) => {
      setEvalNav({ evaluation, scenarioTitle })
      writeStored(evaluation)
      navigate(`${EVAL_PREFIX}${evaluation.scenario_id}`)
    },
    [navigate],
  )

  /* ── 路由 -> 页面装配 ────────────────────────────────────────────────── */
  const evaluationId = route.startsWith(EVAL_PREFIX)
    ? decodeURIComponent(route.slice(EVAL_PREFIX.length))
    : ''

  /* 报告数据优先级：场景页刚传来的（evalNav） > sessionStorage 恢复（刷新/深链） */
  const evaluation: ScenarioEvaluation | null = !evaluationId
    ? null
    : evalNav && evalNav.evaluation.scenario_id === evaluationId
      ? evalNav.evaluation
      : readStored(evaluationId)
  /* 场景标题优先级：跳转时携带的 > 从已加载的场景列表反查（刷新场景） */
  const evaluationTitle =
    evalNav && evalNav.evaluation.scenario_id === evaluationId
      ? evalNav.scenarioTitle
      : (scenarios.find((item) => item.scenario_id === evaluationId)?.title ?? '')

  let page: ReactNode
  if (evaluationId) {
    page = (
      <Evaluation
        reportId={evaluationId}
        evaluation={evaluation}
        scenarioTitle={evaluationTitle}
        onNavigate={navigate}
      />
    )
  } else if (route === '/profile') {
    page = <Profile profile={profile} error={profileError} degraded={profileDegraded} />
  } else if (route === '/path') {
    page = (
      <PathPage
        result={pathResult}
        error={pathError}
        activePathId={activePathId}
        taskStatus={taskStatus}
        onGenerate={generatePath}
        onActivate={activatePath}
        onToggleTask={toggleTask}
      />
    )
  } else if (route === '/scenario') {
    page = (
      <ScenarioPage
        scenarios={scenarios}
        loading={scenariosLoading}
        error={scenariosError}
        onStart={startScenario}
        onEvaluate={evaluateScenario}
        onOpenEvaluation={openEvaluation}
      />
    )
  } else if (route === '/progress') {
    page = <ProgressPage summary={summary} error={summaryError} />
  } else {
    /* '/' 及未知路径（原 <Route path="*" Navigate to="/"> 的语义） */
    page = (
      <Home
        profile={profile}
        progress={summary}
        error={profileError || summaryError}
        degraded={profileDegraded}
        onNavigate={navigate}
      />
    )
  }

  /* 批 2：顶层错误边界 —— 子组件（图表/页面）渲染异常时显示可恢复的错误卡片，
     不再整页白屏（React 19 默认无错误边界，异常会卸载整棵树）。 */
  return (
    <ErrorBoundary>
      <MainLayout route={route} onNavigate={navigate}>
        {page}
      </MainLayout>
    </ErrorBoundary>
  )
}

export default App
