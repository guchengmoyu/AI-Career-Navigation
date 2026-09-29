import { Alert, Card, Col, Empty, Row, Skeleton, Statistic, Table, Tag } from 'antd'
import { BookOutlined, ClockCircleOutlined, FireOutlined, RiseOutlined } from '@ant-design/icons'
import HeatMapChart from '../components/charts/HeatMapChart'
import type { ProgressSummary } from '../services/types'

/* P1：本页改为纯受控组件 —— summary 由容器 App.tsx 注入（激活路径/勾选任务后
   容器会刷新 summary 并回流到本页），页内不再 fetch。 */

export interface ProgressPageProps {
  summary: ProgressSummary | null
  /** 容器侧加载失败时的错误文案 */
  error?: string
}

/* 事件类型 -> 展示色。与首页保持同一套映射。 */
const eventColors: Record<string, string> = {
  task_completed: 'blue',
  task_complete: 'blue',
  course_completed: 'cyan',
  project_completed: 'purple',
  skill_practice: 'green',
  inactivity: 'orange',
  profile_recalculated: 'purple',
  reminder_response: 'lime',
  plan_adjusted: 'gold',
  interview_result: 'magenta',
  application_submitted: 'volcano',
  job_saved: 'gold',
  job_viewed: 'geekblue',
  feedback_submitted: 'pink',
  project_started: 'green',
  course_started: 'cyan',
  skill_assessment: 'purple',
  onboarding: 'blue',
  manual_update: 'geekblue',
  scenario_complete: 'cyan',
  goal_changed: 'gold',
  consent_withdrawn: 'red',
}

/* 事件类型 -> 中文标签，避免直接暴露英文枚举。
   除演示用户 USER-G001 的 17 种外，补齐库内其余 5 种真实枚举
   （task_complete/manual_update/scenario_complete/goal_changed/consent_withdrawn）。 */
const eventLabels: Record<string, string> = {
  task_completed: '完成任务',
  task_complete: '完成任务',
  course_completed: '完成课程',
  project_completed: '完成项目',
  skill_practice: '技能练习',
  inactivity: '学习中辍',
  profile_recalculated: '画像重算',
  reminder_response: '响应提醒',
  plan_adjusted: '调整计划',
  interview_result: '面试反馈',
  application_submitted: '投递申请',
  job_saved: '收藏岗位',
  job_viewed: '浏览岗位',
  feedback_submitted: '提交反馈',
  project_started: '启动项目',
  course_started: '开始课程',
  skill_assessment: '能力测评',
  onboarding: '完成录入',
  manual_update: '手动更新',
  scenario_complete: '完成训练',
  goal_changed: '调整目标',
  consent_withdrawn: '撤回授权',
}

function ProgressPage({ summary, error = '' }: ProgressPageProps) {
  if (error) return <Alert type="error" showIcon title="进度加载失败" description={error} />
  if (!summary) return <div className="page-container"><Skeleton active paragraph={{ rows: 10 }} /></div>

  const columns = [
    {
      title: '日期',
      dataIndex: 'event_time',
      key: 'date',
      width: 120,
      render: (value: string) => new Date(value).toLocaleDateString('zh-CN'),
    },
    {
      title: '类型',
      dataIndex: 'event_type',
      key: 'type',
      width: 140,
      render: (value: string) => (
        <Tag color={eventColors[value] || 'default'}>{eventLabels[value] || value}</Tag>
      ),
    },
    { title: '内容', dataIndex: 'detail', key: 'detail' },
    {
      title: '积分',
      key: 'points',
      width: 80,
      render: (_: unknown, event: ProgressSummary['recent_events'][number]) =>
        `+${event.points_earned || Math.max(0, event.score_delta * 2)}`,
    },
  ]

  return (
    <div className="page-container">
      <h1 className="page-title">学习进度</h1>

      <Alert
        type="warning"
        showIcon
        title="演示状态可能随容器重启清空"
        description={`${summary.disclaimer} 当前存储：${summary.persistence_mode}`}
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
              title="累计学习时长"
              value={summary.total_learning_hours}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: 'var(--color-primary)' }} />}
              styles={{ content: {  color: 'var(--color-primary)'  } }}
            />
            {/* 空槽位：与"连续学习"卡的副文案占位对齐，保证三张卡数字在同一水平线上 */}
            <div className="stat-sub" aria-hidden="true" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="card stat-card-tone"
            style={{ '--tone-color': 'var(--color-success)' } as React.CSSProperties}
          >
            <Statistic
              title="完成任务"
              value={summary.completed_tasks}
              suffix="项"
              prefix={<BookOutlined style={{ color: 'var(--color-success)' }} />}
              styles={{ content: {  color: 'var(--color-success)'  } }}
            />
            {/* 空槽位：与"连续学习"卡的副文案占位对齐 */}
            <div className="stat-sub" aria-hidden="true" />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card
            className="card stat-card-tone"
            style={{ '--tone-color': 'var(--color-warning)' } as React.CSSProperties}
          >
            <Statistic
              title="连续学习"
              value={summary.streak_days}
              suffix="天"
              prefix={<FireOutlined style={{ color: 'var(--color-warning)' }} />}
              styles={{ content: {  color: 'var(--color-warning)'  } }}
            />
            <div className="stat-sub">累计积分 {summary.points_earned}</div>
          </Card>
        </Col>
      </Row>

      <Card className="card" title="学习活跃度（近 12 周）" style={{ marginBottom: 16 }}>
        <HeatMapChart events={summary.recent_events} />
      </Card>

      <Card className="card" title="近期成长事件">
        {summary.recent_events.length ? (
          <Table
            dataSource={summary.recent_events}
            columns={columns}
            rowKey="event_id"
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                <RiseOutlined /> 暂无成长事件记录
              </span>
            }
          />
        )}
      </Card>
    </div>
  )
}

export default ProgressPage
