import { Row, Col, Card, Statistic, Progress, List, Tag } from 'antd'
import {
  UserOutlined,
  BranchesOutlined,
  TrophyOutlined,
  FireOutlined,
} from '@ant-design/icons'
import RadarChart from '../components/charts/RadarChart'
import TrendChart from '../components/charts/TrendChart'

// TODO: 替换为 API 实际数据
const mockProfile = {
  overallScore: 62.5,
  dimensionScores: {
    professional_skill: 75,
    soft_skill: 60,
    leadership: 45,
    innovation: 70,
    learning_ability: 80,
  },
}

const mockRecentTasks = [
  { id: 1, title: '完成 Python 进阶课程', status: 'done', type: 'course' },
  { id: 2, title: '机器学习实战项目', status: 'doing', type: 'project' },
  { id: 3, title: '阅读《深度学习》第 3 章', status: 'doing', type: 'reading' },
  { id: 4, title: '完成 SQL 刷题 20 道', status: 'todo', type: 'practice' },
]

const statusMap: Record<string, { color: string; text: string }> = {
  done: { color: 'green', text: '已完成' },
  doing: { color: 'blue', text: '进行中' },
  todo: { color: 'default', text: '待开始' },
}

function Home() {
  return (
    <div className="page-container">
      <h1 className="page-title">成长总览</h1>

      {/* 顶部统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card className="card">
            <Statistic
              title="综合能力分"
              value={mockProfile.overallScore}
              precision={1}
              suffix="分"
              prefix={<TrophyOutlined style={{ color: 'var(--color-primary)' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card">
            <Statistic
              title="已完成任务"
              value={12}
              prefix={<FireOutlined style={{ color: 'var(--color-success)' }} />}
              suffix="项"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card">
            <Statistic
              title="学习路径进度"
              value={35}
              suffix="%"
              prefix={<BranchesOutlined style={{ color: 'var(--color-warning)' }} />}
            />
            <Progress percent={35} showInfo={false} strokeColor="var(--color-warning)" size="small" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card">
            <Statistic
              title="连续学习天数"
              value={7}
              prefix={<UserOutlined style={{ color: 'var(--color-dim-learning)' }} />}
              suffix="天"
            />
          </Card>
        </Col>
      </Row>

      {/* 中部：雷达图 + 趋势图 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={10}>
          <Card className="card" title="能力雷达图">
            <RadarChart scores={mockProfile.dimensionScores} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card className="card" title="能力变化趋势">
            <TrendChart height={300} />
          </Card>
        </Col>
      </Row>

      {/* 底部：近期任务 */}
      <Card className="card" title="近期学习任务">
        <List
          dataSource={mockRecentTasks}
          renderItem={(item) => (
            <List.Item
              extra={<Tag color={statusMap[item.status].color}>{statusMap[item.status].text}</Tag>}
            >
              {item.title}
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default Home
