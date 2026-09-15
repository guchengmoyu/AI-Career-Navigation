import { useEffect, useState } from 'react'
import { Alert, Card, Col, List, Progress, Row, Spin, Statistic, Tag } from 'antd'
import { BranchesOutlined, FireOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons'
import RadarChart from '../components/charts/RadarChart'
import { DEMO_USER_ID, profileApi, progressApi, type CareerProfile, type ProgressSummary } from '../services/api'

function Home() {
  const [profile, setProfile] = useState<CareerProfile | null>(null)
  const [progress, setProgress] = useState<ProgressSummary | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([profileApi.get(DEMO_USER_ID), progressApi.getSummary(DEMO_USER_ID)])
      .then(([profileResult, progressResult]) => { setProfile(profileResult); setProgress(progressResult) })
      .catch((reason: Error) => setError(reason.message))
  }, [])
  if (error) return <Alert type="error" showIcon message="总览加载失败" description={error} />
  if (!profile || !progress) return <Spin tip="正在汇总模拟成长数据" fullscreen />
  return <div className="page-container">
    <h1 className="page-title">成长总览</h1>
    <Alert type="info" showIcon message="当前为匿名模拟用户演示" description={profile.disclaimer} style={{ marginBottom: 16 }} />
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={6}><Card><Statistic title="综合能力分" value={profile.overall_score} precision={1} suffix="分" prefix={<TrophyOutlined />} /></Card></Col>
      <Col xs={12} sm={6}><Card><Statistic title="已完成任务" value={progress.completed_tasks} suffix="项" prefix={<FireOutlined />} /></Card></Col>
      <Col xs={12} sm={6}><Card><Statistic title="学习路径进度" value={progress.active_path?.progress_percent || 0} suffix="%" prefix={<BranchesOutlined />} /><Progress percent={progress.active_path?.progress_percent || 0} showInfo={false} /></Card></Col>
      <Col xs={12} sm={6}><Card><Statistic title="连续学习天数" value={progress.streak_days} suffix="天" prefix={<UserOutlined />} /></Card></Col>
    </Row>
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}><Card title="八维能力雷达图"><RadarChart dimensions={profile.dimensions} height={330} /></Card></Col>
      <Col xs={24} lg={12}><Card title="近期成长事件"><List dataSource={progress.recent_events.slice(0, 8)} renderItem={(event) => <List.Item extra={<Tag>{event.event_time.slice(0, 10)}</Tag>}>{event.detail}</List.Item>} /></Card></Col>
    </Row>
  </div>
}

export default Home
