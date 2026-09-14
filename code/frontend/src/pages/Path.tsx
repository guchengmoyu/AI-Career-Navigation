import { Card, Timeline, Tag, Row, Col, Descriptions, Typography } from 'antd'
import {
  BookOutlined,
  ProjectOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

const { Text } = Typography

// TODO: 替换为 MCP 工具 generate_learning_path 的实际返回数据
const mockPath = {
  title: 'AI 工程师成长路径（3 年规划）',
  gapAnalysis: {
    criticalGaps: [
      { skill: '深度学习', current: 0, target: 80, gap: 80 },
      { skill: '大模型基础', current: 0, target: 70, gap: 70 },
    ],
    minorGaps: [
      { skill: 'Python', current: 75, target: 90, gap: 15 },
      { skill: '数据结构与算法', current: 60, target: 80, gap: 20 },
    ],
  },
  phases: [
    {
      order: 1,
      title: '基础能力建设',
      duration: '12 个月',
      milestones: ['完成 Python 进阶', '掌握线性代数基础', '通过数据结构考核'],
      tasks: [
        { title: 'Python 编程进阶', type: 'course', hours: 40, status: 'done' },
        { title: '线性代数基础', type: 'course', hours: 36, status: 'doing' },
        { title: '数据结构刷题 50 道', type: 'practice', hours: 25, status: 'todo' },
      ],
    },
    {
      order: 2,
      title: '专业技能深化',
      duration: '12 个月',
      milestones: ['完成 ML 项目', '掌握深度学习框架', '发表技术博客'],
      tasks: [
        { title: '机器学习实战', type: 'project', hours: 60, status: 'todo' },
        { title: 'PyTorch 深度学习', type: 'course', hours: 48, status: 'todo' },
      ],
    },
    {
      order: 3,
      title: '综合能力提升',
      duration: '12 个月',
      milestones: ['完成大模型应用项目', '具备独立方案设计能力'],
      tasks: [
        { title: '大模型应用开发', type: 'project', hours: 80, status: 'todo' },
        { title: '系统设计与架构', type: 'course', hours: 40, status: 'todo' },
      ],
    },
  ],
}

const typeIcons: Record<string, React.ReactNode> = {
  course: <BookOutlined />,
  project: <ProjectOutlined />,
  practice: <ExperimentOutlined />,
}

const typeColors: Record<string, string> = {
  course: 'blue',
  project: 'purple',
  practice: 'cyan',
}

function Path() {
  return (
    <div className="page-container">
      <h1 className="page-title">学习路径</h1>

      <Card className="card" title={mockPath.title} style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card type="inner" title="🔴 关键差距" size="small">
              {mockPath.gapAnalysis.criticalGaps.map((g) => (
                <div key={g.skill} style={{ marginBottom: 8 }}>
                  <Text strong>{g.skill}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    当前 {g.current} → 目标 {g.target}（差距 {g.gap}）
                  </Text>
                </div>
              ))}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card type="inner" title="🟡 次要差距" size="small">
              {mockPath.gapAnalysis.minorGaps.map((g) => (
                <div key={g.skill} style={{ marginBottom: 8 }}>
                  <Text strong>{g.skill}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    当前 {g.current} → 目标 {g.target}（差距 {g.gap}）
                  </Text>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </Card>

      {mockPath.phases.map((phase) => (
        <Card
          key={phase.order}
          className="card"
          title={`阶段 ${phase.order}：${phase.title}`}
          extra={<Tag>{phase.duration}</Tag>}
          style={{ marginBottom: 16 }}
        >
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="里程碑">
              {phase.milestones.map((m, i) => (
                <Tag key={i} color="green" style={{ marginBottom: 4 }}>{m}</Tag>
              ))}
            </Descriptions.Item>
          </Descriptions>

          <Timeline
            style={{ marginTop: 16 }}
            items={phase.tasks.map((task) => ({
              dot: task.status === 'done'
                ? <CheckCircleOutlined style={{ color: 'var(--color-success)' }} />
                : <ClockCircleOutlined style={{ color: 'var(--color-text-tertiary)' }} />,
              children: (
                <div>
                  <Tag icon={typeIcons[task.type]} color={typeColors[task.type]}>
                    {task.type === 'course' ? '课程' : task.type === 'project' ? '项目' : '练习'}
                  </Tag>
                  <Text strong>{task.title}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>{task.hours}h</Text>
                </div>
              ),
            }))}
          />
        </Card>
      ))}
    </div>
  )
}

export default Path
