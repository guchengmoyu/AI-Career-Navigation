import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
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
  Statistic,
  Tabs,
  Tag,
  Timeline,
  Typography,
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
  pathApi,
  type LearningPathResult,
  type PathTask,
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

function Path() {
  const [result, setResult] = useState<LearningPathResult | null>(null)
  const [error, setError] = useState('')
  /* 调整目标弹窗（文档 3.5：支持"调整目标"触发路径重新生成） */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [targetRoleId, setTargetRoleId] = useState(DEFAULT_ROLE_ID)
  const [regenerating, setRegenerating] = useState(false)
  const [regenError, setRegenError] = useState('')

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
          /* 顶部总进度（文档 3.5）：按已完成任务数 / 总任务数计算 */
          const allTasks = branch.phases.flatMap((phase) => phase.tasks)
          const doneTasks = allTasks.filter((task) => task.status === 'completed').length
          const totalHours = branch.total_estimated_hours

          return {
            key: branch.path_id,
            label: branchLabels[branch.branch_type] ?? branch.title,
            children: (
              <>
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
                    (task) => task.status === 'completed',
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
                                items={phase.tasks.map((task) => ({
                                  dot:
                                    task.status === 'completed' ? (
                                      <CheckCircleOutlined
                                        style={{ color: 'var(--color-success)' }}
                                      />
                                    ) : (
                                      taskIcon(task)
                                    ),
                                  children: (
                                    <div>
                                      <Text strong>{task.title}</Text>
                                      <Text type="secondary">
                                        {'　'}
                                        {task.estimated_hours}h · {task.skill_id}
                                      </Text>
                                      {task.provider && (
                                        <Tag style={{ marginLeft: 8 }}>{task.provider}</Tag>
                                      )}
                                    </div>
                                  ),
                                }))}
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
            路径由 MCP 服务按目标岗位与差距分析生成，仅作演示；任务状态来自模拟事件流。
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
