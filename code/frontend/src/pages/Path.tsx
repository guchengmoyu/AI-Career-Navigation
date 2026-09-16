import { useEffect, useState } from 'react'
import {
  Alert,
  Card,
  Col,
  Collapse,
  Descriptions,
  Progress,
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
import { DEMO_USER_ID, pathApi, type LearningPathResult, type PathTask } from '../services/api'

const { Text } = Typography

/* 后端返回的分数是浮点数，差值可能带出 64.60000000000006 这类表示噪声，
   统一保留 1 位后去掉多余的 0，避免直接展示给用户。 */
function fmtScore(value: number): string {
  return Number(value.toFixed(1)).toString()
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

function Path() {
  const [result, setResult] = useState<LearningPathResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    pathApi
      .generate({
        user_id: DEMO_USER_ID,
        target_role_id: 'ROLE-AI-ALG',
        horizon_years: 3,
        weekly_hours: 12,
        priority: 'balanced',
      })
      .then(setResult)
      .catch((reason: Error) => setError(reason.message))
  }, [])

  if (error) return <Alert type="error" showIcon message="路径生成失败" description={error} />
  if (!result) return <div className="page-container"><Skeleton active paragraph={{ rows: 10 }} /></div>

  return (
    <div className="page-container">
      {/* 页头：标题 + 操作位（文档 3.5：[调整目标]） */}
      <div className="page-head">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          学习路径
        </h1>
        <a>
          <SettingOutlined /> 调整目标
        </a>
      </div>

      <Alert
        type="info"
        showIcon
        message={`目标岗位：${result.target_role_name}`}
        description={result.disclaimer}
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
    </div>
  )
}

export default Path
