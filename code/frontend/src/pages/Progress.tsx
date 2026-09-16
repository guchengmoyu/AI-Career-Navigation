import { useEffect, useState } from 'react'
import { Alert, Card, Col, Row, Spin, Statistic, Table, Tag } from 'antd'
import { BookOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons'
import HeatMapChart from '../components/charts/HeatMapChart'
import { DEMO_USER_ID, progressApi, type ProgressSummary } from '../services/api'

const eventColors: Record<string, string> = { task_completed: 'blue', course_completed: 'cyan', project_completed: 'purple', skill_practice: 'green', inactivity: 'orange' }

function ProgressPage() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { progressApi.getSummary(DEMO_USER_ID).then(setSummary).catch((reason: Error) => setError(reason.message)) }, [])
  if (error) return <Alert type="error" showIcon message="进度加载失败" description={error} />
  if (!summary) return <Spin tip="正在汇总成长进度" fullscreen />
  const columns = [
    { title: '日期', dataIndex: 'event_time', key: 'date', width: 120, render: (value: string) => value.slice(0, 10) },
    { title: '类型', dataIndex: 'event_type', key: 'type', width: 160, render: (value: string) => <Tag color={eventColors[value] || 'default'}>{value}</Tag> },
    { title: '内容', dataIndex: 'detail', key: 'detail' },
    { title: '积分', key: 'points', width: 80, render: (_: unknown, event: ProgressSummary['recent_events'][number]) => `+${event.points_earned || Math.max(0, event.score_delta * 2)}` },
  ]
  return <div className="page-container">
    <h1 className="page-title">学习进度</h1>
    <Alert type="warning" showIcon message="演示状态可能随容器重启清空" description={`${summary.disclaimer} 当前存储：${summary.persistence_mode}`} style={{ marginBottom: 16 }} />
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={8}><Card><Statistic title="累计学习时长" value={summary.total_learning_hours} suffix="小时" prefix={<ClockCircleOutlined />} /></Card></Col>
      <Col xs={8}><Card><Statistic title="完成任务" value={summary.completed_tasks} suffix="项" prefix={<BookOutlined />} /></Card></Col>
      <Col xs={8}><Card><Statistic title="连续学习" value={summary.streak_days} suffix="天" prefix={<FireOutlined />} /></Card></Col>
    </Row>
    <Card title="学习活跃度（近12周）" style={{ marginBottom: 24 }}><HeatMapChart events={summary.recent_events} /></Card>
    <Card title="近期成长事件"><Table dataSource={summary.recent_events} columns={columns} rowKey="event_id" pagination={false} size="small" /></Card>
  </div>
}

export default ProgressPage
