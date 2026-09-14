import { Row, Col, Card, Statistic, Table, Tag } from 'antd'
import { FireOutlined, BookOutlined, ClockCircleOutlined } from '@ant-design/icons'
import HeatMapChart from '../components/charts/HeatMapChart'

// TODO: 替换为 MCP 工具 getGrowthEvents 的实际返回数据
const mockStats = {
  totalHours: 128,
  completedTasks: 12,
  streakDays: 7,
}

const mockRecentEvents = [
  { date: '2025-10-10', type: 'task', title: '完成 Python 进阶课程', points: 15 },
  { date: '2025-10-09', type: 'chat', title: '与 AI 讨论机器学习方案', points: 5 },
  { date: '2025-10-08', type: 'scenario', title: '远程协作场景训练', points: 20 },
  { date: '2025-10-07', type: 'manual', title: '阅读《深度学习》笔记', points: 10 },
  { date: '2025-10-06', type: 'task', title: 'SQL 刷题 10 道', points: 10 },
]

const typeColors: Record<string, string> = {
  task: 'blue',
  chat: 'cyan',
  scenario: 'purple',
  manual: 'green',
}

const columns = [
  { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    render: (t: string) => <Tag color={typeColors[t]}>{t}</Tag>,
  },
  { title: '内容', dataIndex: 'title', key: 'title' },
  {
    title: '积分',
    dataIndex: 'points',
    key: 'points',
    width: 80,
    render: (p: number) => <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>+{p}</span>,
  },
]

function Progress() {
  return (
    <div className="page-container">
      <h1 className="page-title">学习进度</h1>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={8}>
          <Card className="card">
            <Statistic
              title="累计学习时长"
              value={mockStats.totalHours}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: 'var(--color-primary)' }} />}
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="card">
            <Statistic
              title="完成任务"
              value={mockStats.completedTasks}
              suffix="项"
              prefix={<BookOutlined style={{ color: 'var(--color-success)' }} />}
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="card">
            <Statistic
              title="连续学习"
              value={mockStats.streakDays}
              suffix="天"
              prefix={<FireOutlined style={{ color: 'var(--color-warning)' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 热力图 */}
      <Card className="card" title="学习活跃度（近 12 周）" style={{ marginBottom: 24 }}>
        <HeatMapChart height={200} />
      </Card>

      {/* 近期事件 */}
      <Card className="card" title="近期成长事件">
        <Table
          dataSource={mockRecentEvents}
          columns={columns}
          rowKey="date"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

export default Progress
