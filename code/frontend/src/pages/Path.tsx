import { useState } from 'react'
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
  DEFAULT_ROLE_ID,
  PATH_ROLE_OPTIONS,
  type LearningPathResult,
  type PathTask,
  type TaskStatus,
} from '../services/types'

const { Text } = Typography

/* P1：本页改为纯受控组件 ——
   - 路径数据（result）、激活状态（activePathId）、任务状态（taskStatus）由容器注入；
   - 生成/激活/勾选通过 onGenerate / onActivate / onToggleTask 回调回到容器
     （容器负责 HTTP、幂等键、乐观更新与回滚，成功后把新状态回流到本页）；
   - 页内只保留**瞬时 UI 态**：弹窗、输入、转圈、交互失败的提示文案。
   原 loadPath/activatePath/toggleTask 的业务逻辑已上移到 App.tsx，语义不变。 */

export interface PathPageProps {
  /** 容器生成的路径结果；null = 尚在首次生成中（展示骨架屏） */
  result: LearningPathResult | null
  /** 首次生成失败（容器侧）；交互式失败由本页就地展示，不经过该 prop */
  error?: string
  /** 服务端认哪条路径为激活路径（不是"用户选了哪条"）。null = 未激活。 */
  activePathId: string | null
  /** 任务状态覆盖层：`task_id -> status`，权威优先级见容器注释。 */
  taskStatus: Record<string, TaskStatus>
  /** 按目标岗位（再）生成路径；失败时 reject，由调用方决定呈现方式 */
  onGenerate: (roleId: string) => Promise<void>
  /** 把某条路线设为当前生效路径；失败时 reject */
  onActivate: (pathId: string) => Promise<void>
  /** 更新任务状态（容器内乐观更新 + 失败回滚）；失败时 reject */
  onToggleTask: (taskId: string, status: TaskStatus) => Promise<void>
}

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

function Path({
  result,
  error = '',
  activePathId,
  taskStatus,
  onGenerate,
  onActivate,
  onToggleTask,
}: PathPageProps) {
  /* 调整目标弹窗（文档 3.5：支持"调整目标"触发路径重新生成） */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [targetRoleId, setTargetRoleId] = useState(DEFAULT_ROLE_ID)
  const [regenerating, setRegenerating] = useState(false)
  const [regenError, setRegenError] = useState('')
  /* 首次生成之后的交互式失败（如「重新生成」按钮）：保留当前内容、页内提示 */
  const [localError, setLocalError] = useState('')
  /** 正在激活中的 path_id（按钮转圈用） */
  const [activatingId, setActivatingId] = useState<string | null>(null)
  /** 正在提交状态变更的任务 id 集合（勾选框转圈用；用 Set 支持并发点多个任务） */
  const [savingTaskIds, setSavingTaskIds] = useState<Set<string>>(new Set())

  /* 读取某个任务的**当前生效状态**（容器覆盖层 > generate 快照） */
  const statusOf = (task: PathTask): TaskStatus =>
    taskStatus[task.task_id] ?? (task.status as TaskStatus) ?? 'pending'

  const openDialog = () => {
    /* 打开时以**当前生效的目标岗位**为默认值：重新打开弹窗不会被上次的临时选择带偏 */
    setTargetRoleId(result?.target_role_id ?? DEFAULT_ROLE_ID)
    setRegenError('')
    setDialogOpen(true)
  }

  const confirmTarget = async () => {
    if (targetRoleId === result?.target_role_id) {
      /* 目标没变就别白跑一次接口（也避免用户以为"重新生成了"其实什么都没发生） */
      setDialogOpen(false)
      return
    }
    /* 用户点确定后：失败时保留旧路径、只在弹窗里提示，
       用户不至于"点了确定反而丢内容" */
    setRegenerating(true)
    setRegenError('')
    try {
      await onGenerate(targetRoleId)
      setDialogOpen(false)
    } catch (reason) {
      setRegenError((reason as Error).message)
    } finally {
      setRegenerating(false)
    }
  }

  /* 「重新生成」（页内 Popconfirm）：失败占满页面显示错误 —— 与原 loadPath(interactive=false) 一致 */
  const regenerate = () => {
    if (!result) return
    onGenerate(result.target_role_id).catch((reason: Error) => setLocalError(reason.message))
  }

  /* ── 写接口 1/2：激活路径（容器侧完成 HTTP + 状态回流，这里只做呈现）──
     激活失败时容器**不会**更新 activePathId —— 保持勾选框禁用，
     否则用户会对着必然 404 的勾选框一顿点。 */
  const activatePath = async (pathId: string) => {
    setActivatingId(pathId)
    try {
      await onActivate(pathId)
      message.success('已设为当前路径，现在可以勾选任务完成情况了')
    } catch (reason) {
      message.error(`激活失败：${(reason as Error).message}`)
    } finally {
      setActivatingId(null)
    }
  }

  /* ── 写接口 2/2：更新任务状态。
     乐观更新由容器完成（同步生效 → 勾选立刻响应），失败也由容器回滚；
     本页只负责转圈与报错。 */
  const toggleTask = (task: PathTask, nextChecked: boolean) => {
    const nextStatus: TaskStatus = nextChecked ? 'completed' : 'pending'
    if (statusOf(task) === nextStatus) return

    setSavingTaskIds((prev) => new Set(prev).add(task.task_id))
    onToggleTask(task.task_id, nextStatus)
      .catch((reason: Error) => message.error(`保存失败：${reason.message}`))
      .finally(() => {
        setSavingTaskIds((prev) => {
          const next = new Set(prev)
          next.delete(task.task_id)
          return next
        })
      })
  }

  const shownError = error || localError
  if (shownError) return <Alert type="error" showIcon title="路径生成失败" description={shownError} />
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
        title={`目标岗位：${result.target_role_name}`}
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
            onConfirm={regenerate}
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
                  title={
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
                        styles={{ content: {  color: 'var(--color-primary)'  } }}
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
                        styles={{ content: {  color: 'var(--color-success)'  } }}
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
                        styles={{ content: {  color: 'var(--color-warning)'  } }}
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
                                              toggleTask(task, event.target.checked)
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
        onOk={() => void confirmTarget()}
        onCancel={() => setDialogOpen(false)}
      >
        {regenError && (
          <Alert
            type="error"
            showIcon
            title="重新生成失败"
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

/* 后端返回的分数是浮点数，差值可能带出 64.60000000000006 这类表示噪声，
   统一保留 1 位后去掉多余的 0，避免直接展示给用户。 */
function fmtScore(value: number): string {
  return Number(value.toFixed(1)).toString()
}

export default Path
