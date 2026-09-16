import { useEffect, useState } from 'react'
import { Alert, Card, Col, List, Progress, Row, Spin, Tag } from 'antd'
import RadarChart from '../components/charts/RadarChart'
import { DEMO_USER_ID, profileApi, type CareerProfile } from '../services/api'

function Profile() {
  const [profile, setProfile] = useState<CareerProfile | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { profileApi.get(DEMO_USER_ID).then(setProfile).catch((reason: Error) => setError(reason.message)) }, [])
  if (error) return <Alert type="error" showIcon message="画像加载失败" description={error} />
  if (!profile) return <Spin tip="正在计算八维职业画像" fullscreen />
  return (
    <div className="page-container">
      <h1 className="page-title">职业画像</h1>
      <Alert type="info" showIcon message="模拟数据演示" description={profile.disclaimer} style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="card" title="八维能力评估" extra={<Tag color="blue">综合 {profile.overall_score} 分</Tag>}>
            <RadarChart dimensions={profile.dimensions} height={380} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="card" title={`维度详情 · ${profile.persona_code}`}>
            {profile.dimensions.map((dimension) => (
              <div key={dimension.dimension_id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{dimension.name}</span><strong>{dimension.score}</strong></div>
                <Progress percent={dimension.score} showInfo={false} strokeColor="#1677FF" />
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>证据技能 {dimension.evidence_count} 项 · 置信度 {dimension.confidence}</div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Card className="card" title="✅ 优势"><List dataSource={profile.strengths} renderItem={(item) => <List.Item><Tag color="green">{item}</Tag></List.Item>} /></Card></Col>
        <Col xs={24} md={8}><Card className="card" title="📈 优先提升"><List dataSource={profile.improvement_priorities} renderItem={(item) => <List.Item><Tag color="orange">{item}</Tag></List.Item>} /></Card></Col>
        <Col xs={24} md={8}><Card className="card" title="🎯 模拟岗位方向"><List dataSource={profile.role_matches} renderItem={(item) => <List.Item style={{ display: 'block' }}><div>{item.rank}. {item.name}</div><Progress percent={item.match_score} size="small" /></List.Item>} /></Card></Col>
      </Row>
    </div>
  )
}

export default Profile
