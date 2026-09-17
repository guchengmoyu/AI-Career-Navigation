import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Descriptions,
  Form,
  Modal,
  Popconfirm,
  Progress,
  Radio,
  Row,
  Skeleton,
  Space,
  Spin,
  Statistic,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  message,
} from 'antd'
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  ProjectOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import {
  DEMO_USER_ID,
  PATH_ROLE_OPTIONS,
  makeIdempotencyKey,
  pathApi,
  progressApi,
  type LearningPathResult,
  type PathTask,
  type TaskStatus,
} from '../services/api'

const { Text } = Typography

/* 后端返回的分数是浮点数，差值可能带出 64.60000000000006 这类表示噪声，
   统一保留 1 位后去掉多余的 0，避免直接展示给用户。 */
function fmtScore(value: number): string {
  return Number(value.toFixed(1)).toString()
}

/* 「调整目标」的默认参数。
   保持与首次加载完全一致，这样用户打开弹窗但不改动岗位时，
   重新生成得到的路径与当前展示的一模一样 —— 不会出现"点了确定结果变了却又说不上哪里变了"。
   ⚠️ horizon_years / weekly_hours / priority 三个参数**后端当前不生效**
      （实测：horizon 传 1/3/5 阶段数恒为 3；weekly_hours 传 6/12/40 总时长恒为 45/125；
      priority 传 speed/depth/balanced 结果完全相同），
      因此弹窗里**不暴露这三个字段**，否则用户调完毫无变化，
      反而制造新的"点了没反应"。 */
const DEFAULT_ROLE_ID = 'ROLE-AI-ALG'
const DEFAULT_HORIZON_YEARS = 3
const DEFAULT_WEEKLY_HOURS = 12
const DEFAULT_PRIORITY = 'balanced' as const

const icons: Record<string, React.ReactNode> = {
  course: <BookOutlined />,
  project: <ProjectOutlined />,
  practice: <ExperimentOutlined />,
}
function taskIcon(task: PathTask) {
  return icons[task.task_type] || <ClockCircleOutlined />
}

const branchLabels: Record<string, string> = {
  fast_gap: '快速补差路线',
  project_driven: '项目驱动路线',
}

/* 任务状态的中文标签。服务端 `update_task` 只接受这三个值
   （实测传未知值会被 zod 拦成 400），故这里与 TaskStatus 一一对应。 */
const taskStatusLabels: Record<TaskStatus, string> = {
  pending: '未开始',
  in_progress: '进行中',
  completed: '已完成',
}

function Path() {
  const [result, setResult] = useState<LearningPathResult | null>(null)
  const [error, setError] = useState('')
  /* 调整目标弹窗（文档 3.5：支持"调整目标"触发路径重新生成） */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [targetRoleId, setTargetRoleId] = useState(DEFAULT_ROLE_ID)
  const [regenerating, setRegenerating] = useState(false)
  const [regenError, setRegenError] = useState('')

  /* ── 以下是"写入侧"状态（A 档第 2 项：接三个写接口中的两个）───────────────
     服务端的进度是**可写但易失**的（`persistence_mode` 实测为 `local_file_ephemeral`，
     容器重启即回到初始快照），所以：
     1. 页面**不出现"永久保存"字样**，只描述"本次演示会话内生效"；
     2. 激活与勾选都以**服务端返回值为准**覆盖本地状态（见 activatePath / toggleTask），
        不做"本地先斩后奏"，避免页面进度和真实进度漂移。 */

  /** 当前已激活的 path_id。null = 还没有激活任何路径。
   *  ⚠️ 它不是"用户选了哪条路线"，而是"服务端认哪条"。未激活时任务勾选框必须禁用，
   *  否则 `update_task` 必然 404（`未在激活路径中找到任务`）。 */
  const [activePathId, setActivePathId] = useState<string | null>(null)
  /** 正在激活中的 path_id（按钮转圈用） */
  const [activatingId, setActivatingId] = useState<string | null>(null)
  /** 正在提交状态变更的任务 id 集合（勾选框转圈用；用 Set 支持并发点多个任务） */
  const [savingTaskIds, setSavingTaskIds] = useState<Set<string>>(new Set())

  /** 任务状态的本地覆盖层：`task_id -> status`。
   *  为什么需要它：`pathApi.generate` 返回的任务状态是**生成那一刻**的快照，
   *  用户勾选完成之后若只改 result 里的对象会破坏"不可变"，而重新 generate 又会
   *  把两条路线整套换掉、失去当前视图。故用一个薄薄的覆盖层记录最新状态。
   *  权威来源优先级：服务端返回值 > 覆盖层 > generate 快照。 */
  const [taskStatusOverride, setTaskStatusOverride] = useState<Record<string, TaskStatus>>({})

  /** 读取某个任务的**当前生效状态**（含本地覆盖） */
  const statusOf = useCallback(
    (task: PathTask): TaskStatus => {
      const local = taskStatusOverride[task.task_id]
      if (local) return local
      return (task.status as TaskStatus) ?? 'pending'
    },
    [taskStatusOverride],
  )

  /* 首次加载与"重新生成"走同一条链路，避免两处出现不一致的默认参数。
     `interactive` 用来区分两件事：
     - 首次加载（false）：失败时占满页面显示错误，因为此时没有任何内容可看；
     - 用户点确定后（true）：失败时保留旧路径、只在弹窗里提示，用户不至于"点了确定反而丢内容"。 */
  const loadPath = useCallback(
    async (roleId: string, interactive: boolean) => {
      if (interactive) {
        setRegenerating(true)
        setRegenError('')
      }
      try {
        const data = await pathApi.generate({
          user_id: DEMO_USER_ID,
          target_role_id: roleId,
          horizon_years: DEFAULT_HORIZON_YEARS,
          weekly_hours: DEFAULT_WEEKLY_HOURS,
          priority: DEFAULT_PRIORITY,
        })
        setResult(data)

        /* ⚠️ 服务端的 active_path 是**跨页面/跨刷新存活**的（存在服务端内存里），
           而 activePathId 是本组件状态。若不回读，就会出现：
           后端明明已激活某条路径、刷新后页面却显示"尚未生效"、勾选框全灰 ——
           用户被迫重复激活一遍。这里主动从 summary 对齐一次。
           （生成新路径后旧的 active_path 可能已失效，故必须重新读而不是沿用旧值。） */
        try {
          const summary = await progressApi.getSummary(DEMO_USER_ID)
          const serverActiveId = summary.active_path?.path_id ?? null
          /* 只有当服务端认的路径确实是本条结果里的某一条时才算数 */
          const belongsHere = data.branches.some((branch) => branch.path_id === serverActiveId)
          setActivePathId(belongsHere ? serverActiveId : null)

          /* 已激活的那条路线，其任务状态要**以服务端为准**：
             summary.active_path 只有计数，拿不到逐任务状态，
             所以这里按 path_id 再激活一次（幂等，不会重复推进度）把完整结构取回来。
             ⚠️ 用固定的幂等 key 前缀 + path_id，保证重复刷新不会产生副作用。 */
          if (belongsHere && serverActiveId) {
            const activated = await progressApi.activatePath(
              DEMO_USER_ID,
              serverActiveId,
              `resync-${serverActiveId}`,
            )
            setTaskStatusOverride(
              Object.fromEntries(
                (activated.active_path?.phases ?? [])
                  .flatMap((phase) => phase.tasks)
                  .map((task) => [task.task_id, (task.status as TaskStatus) ?? 'pending']),
              ),
            )
          }
        } catch {
          /* 回读失败不影响主流程（路径已显示），退化为"未激活"即可 */
          setActivePathId(null)
        }
        /* 覆盖层清空：generate 返回的是新的权威快照，本地覆盖已无意义。
           注意覆盖层的键是新 task_id，与旧键不冲突，但留着是脏数据。 */
        setTaskStatusOverride({})
        if (interactive) setDialogOpen(false)
      } catch (reason) {
        const message = (reason as Error).message
        if (interactive) setRegenError(message)
        else setError(message)
      } finally {
        if (interactive) setRegenerating(false)
      }
    },
    [],
  )

  useEffect(() => {
    void loadPath(DEFAULT_ROLE_ID, false)
  }, [loadPath])

  const openDialog = () => {
    /* 打开时以**当前生效的目标岗位**为默认值：重新打开弹窗不会被上次的临时选择带偏 */
    setTargetRoleId(result?.target_role_id ?? DEFAULT_ROLE_ID)
    setRegenError('')
    setDialogOpen(true)
  }

  const confirmTarget = () => {
    if (targetRoleId === result?.target_role_id) {
      /* 目标没变就别白跑一次接口（也避免用户以为"重新生成了"其实什么都没发生） */
      setDialogOpen(false)
      return
    }
    void loadPath(targetRoleId, true)
  }

  /* ── 写接口 1/2：激活路径 ──────────────────────────────────────────────
     这是更新任务的**前置条件**。激活成功后：
     - 记下 activePathId（勾选框据此启用）；
     - 用服务端回吐的整条路径**覆盖本地任务状态**（那里是最新且权威的）；
     - 清空覆盖层，因为服务端数据已经是新的基准了。 */
  const activatePath = async (pathId: string) => {
    setActivatingId(pathId)
    try {
      const data = await progressApi.activatePath(
        DEMO_USER_ID,
        pathId,
        makeIdempotencyKey('activate'),
      )
      setActivePathId(data.active_path?.path_id ?? pathId)
      /* 服务端返回的是完整 branch 结构（含每个 task 的 status）→ 用它作为新的权威基准 */
      setTaskStatusOverride(
        Object.fromEntries(
          (data.active_path?.phases ?? [])
            .flatMap((phase) => phase.tasks)
            .map((task) => [task.task_id, (task.status as TaskStatus) ?? 'pending']),
        ),
      )
      message.success('已设为当前路径，现在可以勾选任务完成情况了')
    } catch (reason) {
      /* 激活失败时**不**设置 activePathId —— 保持勾选框禁用，
         否则用户会对着必然 404 的勾选框一顿点。 */
      message.error(`激活失败：${(reason as Error).message}`)
    } finally {
      setActivatingId(null)
    }
  }

  /* ── 写接口 2/2：更新任务状态 ─────────────────────────────────────────
     乐观更新 + 失败回滚：先改本地让勾选立刻响应，请求失败再改回去并报错。
     之所以敢乐观：勾选框是幂等语义的（再点一次就是反过来），且失败会明确回滚。 */
  const toggleTask = async (task: PathTask, nextChecked: boolean) => {
    const nextStatus: TaskStatus = nextChecked ? 'completed' : 'pending'
    const prevStatus = statusOf(task)
    if (prevStatus === nextStatus) return

    setTaskStatusOverride((prev) => ({ ...prev, [task.task_id]: nextStatus }))
    setSavingTaskIds((prev) => new Set(prev).add(task.task_id))
    try {
      await progressApi.updateTask(
        DEMO_USER_ID,
        task.task_id,
        nextStatus,
        makeIdempotencyKey(`task-${task.task_id}`),
      )
    } catch (reason) {
      setTaskStatusOverride((prev) => {
        const next = { ...prev }
        /* 回滚到操作前的状态；若等于 generate 快照的值就干脆删掉这个覆盖键 */
        if (prevStatus === ((task.status as TaskStatus) ?? 'pending')) delete next[task.task_id]
        else next[task.task_id] = prevStatus
        return next
      })
      message.error(`保存失败：${(reason as Error).message}`)
    } finally {
      setSavingTaskIds((prev) => {
        const next = new Set(prev)
        next.delete(task.task_id)
        return next
      })
    }
  }

  if (error) return <Alert type="error" showIcon message="路径生成失败" description={error} />
  if (!result) return <div className="page-container"><Skeleton active paragraph={{ rows: 10 }} /></div>

  return (
    <div className="page-container">
      {/* 页头：标题 + 操作位（文档 3.5：[调整目标]） */}
      <div className="page-head">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          学习路径
        </h1>
        {/* 用 Button 而非裸 <a>：既有明确的点击热区与键盘可达性，
            也不再有"看起来能点、点了毫无反应"的观感问题 */}
        <Button icon={<SettingOutlined />} onClick={openDialog}>
          调整目标
        </Button>
      </div>

      <Alert
        type="info"
        showIcon
        message={`目标岗位：${result.target_role_name}`}
        description={result.disclaimer}
        /* 这里放一个"重新生成"，是为了让整页成为**本地可复现的闭环**：
           运行期数据存在内存里，容器一重启服务端就回到初始快照，
           停在空态时用户没有任何办法自己把内容调回来。
           （正式环境接入持久化后此按钮可去掉，与下方说明一并处理。） */
        action={
          <Popconfirm
            title="重新生成学习路径"
            description="将按当前目标岗位重新生成两条路线，当前展示的路径会被替换。"
            okText="重新生成"
            cancelText="取消"
            onConfirm={() => void loadPath(result.target_role_id, false)}
          >
            <Button size="small">重新生成</Button>
          </Popconfirm>
        }
        style={{ marginBottom: 16 }}
      />

      {/* 差距分析（数据前置，先讲清楚为什么这样排路径）
          左右两卡等高，避免条目数不同导致右侧空出一截 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }} className="row-equal-height">
        <Col xs={24} md={12}>
          <Card className="card" title="关键差距">
            {result.gap_analysis.critical_gaps.slice(0, 5).map((gap) => (
              <div key={gap.skill_id} className="gap-row">
                <Text strong>{gap.skill_name}</Text>
                <Text type="secondary">
                  {fmtScore(gap.current_score)} → {fmtScore(gap.required_score)}
                  <Tag color="red" style={{ marginInlineStart: 8 }}>
                    差 {fmtScore(gap.gap)}
                  </Tag>
                </Text>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="card" title="次要差距">
            {result.gap_analysis.minor_gaps.slice(0, 5).map((gap) => (
              <div key={gap.skill_id} className="gap-row">
                <Text strong>{gap.skill_name}</Text>
                <Text type="secondary">
                  {fmtScore(gap.current_score)} → {fmtScore(gap.required_score)}
                  <Tag color="orange" style={{ marginInlineStart: 8 }}>
                    差 {fmtScore(gap.gap)}
                  </Tag>
                </Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Tabs
        items={result.branches.map((branch) => {
          /* 顶部总进度（文档 3.5）：按已完成任务数 / 总任务数计算。
             `statusOf` 让本地刚勾选的状态立刻反映到进度条上。 */
          const allTasks = branch.phases.flatMap((phase) => phase.tasks)
          const doneTasks = allTasks.filter((task) => statusOf(task) === 'completed').length
          const totalHours = branch.total_estimated_hours
          const isActiveBranch = activePathId === branch.path_id

          return {
            key: branch.path_id,
            label: (
              /* 已激活的那条路线在 Tab 上打标，用户切走后回来也能一眼认出哪条在生效 */
              <Space size={4}>
                <span>{branchLabels[branch.branch_type] ?? branch.title}</span>
                {isActiveBranch && <Tag color="green">当前</Tag>}
              </Space>
            ),
            children: (
              <>
                {/* 激活入口：不激活就没法更新任务（服务端会 404），
                    所以这一步必须显式、可见，不能让用户点勾选框才发现"没反应"。 */}
                <Alert
                  type={isActiveBranch ? 'success' : 'warning'}
                  showIcon
                  message={
                    isActiveBranch
                      ? '这条路线是当前生效路径'
                      : '这条路线尚未生效'
                  }
                  description={
                    isActiveBranch
                      ? '可以勾选任务完成了，进度会反映到「学习进度」页（仅本次演示会话内，容器重启后回到初始状态）。'
                      : '设为当前路径后才能勾选任务完成情况；同一时刻只有一条路线生效。'
                  }
                  action={
                    isActiveBranch ? undefined : (
                      <Button
                        type="primary"
                        size="small"
                        loading={activatingId === branch.path_id}
                        onClick={() => void activatePath(branch.path_id)}
                      >
                        设为当前路径
                      </Button>
                    )
                  }
                  style={{ marginBottom: 16 }}
                />

                {/* 三张统计卡与首页同款配色语言：主色蓝 / 成长绿 / 激励橙 */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }} className="row-equal-height">
                  <Col xs={24} sm={12} lg={8}>
                    <Card
                      className="card stat-card-tone"
                      style={{ '--tone-color': 'var(--color-primary)' } as React.CSSProperties}
                    >
                      <Statistic
                        title="周期"
                        value={branch.horizon_years}
                        suffix="年"
                        prefix={<ClockCircleOutlined style={{ color: 'var(--color-primary)' }} />}
                        valueStyle={{ color: 'var(--color-primary)' }}
                      />
                      {/* 空槽位：与其它页面统计卡的副文案槽位保持一致的行高节奏 */}
                      <div className="stat-sub" aria-hidden="true" />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={8}>
                    <Card
                      className="card stat-card-tone"
                      style={{ '--tone-color': 'var(--color-success)' } as React.CSSProperties}
                    >
                      <Statistic
                        title="每周上限"
                        value={branch.weekly_hours}
                        suffix="小时"
                        prefix={<ExperimentOutlined style={{ color: 'var(--color-success)' }} />}
                        valueStyle={{ color: 'var(--color-success)' }}
                      />
                      <div className="stat-sub" aria-hidden="true" />
                    </Card>
                  </Col>
                  <Col xs={24} sm={24} lg={8}>
                    <Card
                      className="card stat-card-tone"
                      style={{ '--tone-color': 'var(--color-warning)' } as React.CSSProperties}
                    >
                      <Statistic
                        title="预计总投入"
                        value={totalHours}
                        suffix="小时"
                        prefix={<ProjectOutlined style={{ color: 'var(--color-warning)' }} />}
                        valueStyle={{ color: 'var(--color-warning)' }}
                      />
                      <div className="stat-sub" aria-hidden="true" />
                    </Card>
                  </Col>
                </Row>

                {/* 总进度条（文档 3.5：顶部总进度一目了然） */}
                <Card className="card" style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>总进度</Text>
                    <Text type="secondary">
                      已完成 {doneTasks} / {allTasks.length} 个任务
                    </Text>
                  </div>
                  <Progress
                    percent={
                      allTasks.length ? Math.round((doneTasks / allTasks.length) * 100) : 0
                    }
                    strokeColor="var(--color-primary)"
                  />
                </Card>

                {branch.phases.map((phase) => {
                  const phaseDone = phase.tasks.filter(
                    (task) => statusOf(task) === 'completed',
                  ).length
                  const isActive = phaseDone > 0 && phaseDone < phase.tasks.length
                  const isDone = phase.tasks.length > 0 && phaseDone === phase.tasks.length
                  const statusText = isDone ? '已完成' : isActive ? '进行中' : '未开始'
                  const statusColor = isDone ? 'green' : isActive ? 'blue' : 'default'

                  return (
                    <Card
                      key={phase.phase_order}
                      className="card"
                      style={{ marginBottom: 16 }}
                      title={
                        <Space>
                          <span>
                            阶段 {phase.phase_order}：{phase.title}
                          </span>
                          <Tag color={statusColor}>{statusText}</Tag>
                        </Space>
                      }
                      extra={<Tag>{phase.duration_months} 个月</Tag>}
                    >
                      {/* 里程碑：契约里 milestones 是纯字符串数组、无完成状态字段，
                          故此处不用勾选框伪装状态，仅展示里程碑名称。 */}
                      <div style={{ marginBottom: 12 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          里程碑
                        </Text>
                        <div style={{ marginTop: 6 }}>
                          {phase.milestones.map((milestone) => (
                            <Tag key={milestone}>{milestone}</Tag>
                          ))}
                        </div>
                      </div>

                      <Collapse
                        ghost
                        defaultActiveKey={isActive ? ['tasks'] : []}
                        items={[
                          {
                            key: 'tasks',
                            label: `任务详情（${phaseDone}/${phase.tasks.length}）`,
                            children: (
                              <Timeline
                                items={phase.tasks.map((task) => {
                                  const taskStatus = statusOf(task)
                                  const isCompleted = taskStatus === 'completed'
                                  /* 未激活路径时勾选框**禁用**：服务端此时必然返回
                                     `404 TASK_NOT_FOUND`，与其让用户点了报错，
                                     不如提前变灰并用 tooltip 说清原因。 */
                                  const disabled = !isActiveBranch
                                  return {
                                    dot: isCompleted ? (
                                      <CheckCircleOutlined
                                        style={{ color: 'var(--color-success)' }}
                                      />
                                    ) : (
                                      taskIcon(task)
                                    ),
                                    children: (
                                      <div className="task-row">
                                        <Tooltip
                                          title={
                                            disabled ? '请先点上方「设为当前路径」' : undefined
                                          }
                                        >
                                          <Checkbox
                                            checked={isCompleted}
                                            disabled={disabled}
                                            onChange={(event) =>
                                              void toggleTask(task, event.target.checked)
                                            }
                                            aria-label={`标记「${task.title}」为${
                                              isCompleted ? '未开始' : '已完成'
                                            }`}
                                          />
                                        </Tooltip>
                                        <div className="task-row-main">
                                          <Text
                                            strong
                                            delete={isCompleted}
                                            type={isCompleted ? 'secondary' : undefined}
                                          >
                                            {task.title}
                                          </Text>
                                          <Text type="secondary">
                                            {'　'}
                                            {task.estimated_hours}h · {task.skill_id}
                                          </Text>
                                          {task.provider && (
                                            <Tag style={{ marginLeft: 8 }}>{task.provider}</Tag>
                                          )}
                                          {savingTaskIds.has(task.task_id) && (
                                            <Spin size="small" style={{ marginLeft: 8 }} />
                                          )}
                                        </div>
                                        {/* 状态标签只在非 pending 时出现 —— 全部任务都挂一个
                                            「未开始」会让列表变得很吵 */}
                                        {taskStatus !== 'pending' && (
                                          <Tag
                                            color={isCompleted ? 'green' : 'blue'}
                                            style={{ marginInlineStart: 'auto' }}
                                          >
                                            {taskStatusLabels[taskStatus]}
                                          </Tag>
                                        )}
                                      </div>
                                    ),
                                  }
                                })}
                              />
                            ),
                          },
                        ]}
                      />
                    </Card>
                  )
                })}
              </>
            ),
          }
        })}
      />

      <Descriptions size="small" column={1} style={{ marginTop: 8 }}>
        <Descriptions.Item label="说明">
          <Text type="secondary">
            路径由 MCP 服务按目标岗位与差距分析生成，仅作演示；
            任务完成情况会写入演示会话（容器重启后回到初始状态）。
          </Text>
        </Descriptions.Item>
      </Descriptions>

      {/* 调整目标（文档 3.5）：选定新的目标岗位后重新生成两条路线。
          只暴露「岗位」一个字段 —— 其余三个参数后端暂未生效，放上来只会制造"调了没反应"。 */}
      <Modal
        title="调整目标"
        open={dialogOpen}
        okText="重新生成路径"
        cancelText="取消"
        confirmLoading={regenerating}
        onOk={confirmTarget}
        onCancel={() => setDialogOpen(false)}
      >
        {regenError && (
          <Alert
            type="error"
            showIcon
            message="重新生成失败"
            description={regenError}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form layout="vertical">
          <Form.Item label="目标岗位" style={{ marginBottom: 8 }}>
            <Radio.Group
              value={targetRoleId}
              onChange={(event) => setTargetRoleId(String(event.target.value))}
            >
              <Space direction="vertical">
                {PATH_ROLE_OPTIONS.map((role) => (
                  <Radio key={role.role_id} value={role.role_id}>
                    {role.name}
                    <Text type="secondary" style={{ fontSize: 12, marginInlineStart: 8 }}>
                      {role.role_id}
                    </Text>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ fontSize: 12 }}>
          切换岗位会按该岗位的能力要求重新做差距分析，并生成「快速补差」与「项目驱动」两条路线。
          （当前可选项为数据集内置的 3 个岗位，岗位列表接口尚未提供。）
        </Text>
      </Modal>
    </div>
  )
}

export default Path
