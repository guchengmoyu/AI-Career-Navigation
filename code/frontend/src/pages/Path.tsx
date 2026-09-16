import { useEffect, useState } from 'react'
import { Alert, Card, Col, Descriptions, Row, Spin, Tabs, Tag, Timeline, Typography } from 'antd'
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined, ExperimentOutlined, ProjectOutlined } from '@ant-design/icons'
import { DEMO_USER_ID, pathApi, type LearningPathResult, type PathTask } from '../services/api'

const { Text } = Typography
const icons: Record<string, React.ReactNode> = { course: <BookOutlined />, project: <ProjectOutlined />, practice: <ExperimentOutlined /> }
function taskIcon(task: PathTask) { return icons[task.task_type] || <ClockCircleOutlined /> }

function Path() {
  const [result, setResult] = useState<LearningPathResult | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { pathApi.generate({ user_id: DEMO_USER_ID, target_role_id: 'ROLE-AI-ALG', horizon_years: 3, weekly_hours: 12, priority: 'balanced' }).then(setResult).catch((reason: Error) => setError(reason.message)) }, [])
  if (error) return <Alert type="error" showIcon message="路径生成失败" description={error} />
  if (!result) return <Spin tip="正在生成双路线学习计划" fullscreen />
  return (
    <div className="page-container">
      <h1 className="page-title">学习路径</h1>
      <Alert type="info" showIcon message={`目标岗位：${result.target_role_name}`} description={result.disclaimer} style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={12}><Card title="🔴 关键差距">{result.gap_analysis.critical_gaps.slice(0, 5).map((gap) => <div key={gap.skill_id}><Text strong>{gap.skill_name}</Text><Text type="secondary">　{gap.current_score} → {gap.required_score}（差 {gap.gap}）</Text></div>)}</Card></Col>
        <Col xs={24} md={12}><Card title="🟡 次要差距">{result.gap_analysis.minor_gaps.slice(0, 5).map((gap) => <div key={gap.skill_id}><Text strong>{gap.skill_name}</Text><Text type="secondary">　{gap.current_score} → {gap.required_score}（差 {gap.gap}）</Text></div>)}</Card></Col>
      </Row>
      <Tabs items={result.branches.map((branch) => ({
        key: branch.path_id,
        label: branch.branch_type === 'fast_gap' ? '快速补差路线' : '项目驱动路线',
        children: <>
          <Descriptions bordered size="small" column={{ xs: 1, md: 3 }} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="周期">{branch.horizon_years} 年</Descriptions.Item><Descriptions.Item label="每周上限">{branch.weekly_hours} 小时</Descriptions.Item><Descriptions.Item label="预计投入">{branch.total_estimated_hours} 小时</Descriptions.Item>
          </Descriptions>
          {branch.phases.map((phase) => <Card key={phase.phase_order} title={`阶段 ${phase.phase_order}：${phase.title}`} extra={<Tag>{phase.duration_months} 个月</Tag>} style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 12 }}>{phase.milestones.map((milestone) => <Tag key={milestone} color="green">{milestone}</Tag>)}</div>
            <Timeline items={phase.tasks.map((task) => ({ dot: task.status === 'completed' ? <CheckCircleOutlined /> : taskIcon(task), children: <div><Text strong>{task.title}</Text><Text type="secondary">　{task.estimated_hours}h · {task.skill_id}</Text>{task.provider && <Tag style={{ marginLeft: 8 }}>{task.provider}</Tag>}</div> }))} />
          </Card>)}
        </>,
      }))} />
    </div>
  )
}

export default Path
