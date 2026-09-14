import { Row, Col, Card, Descriptions, Tag, List, Progress } from 'antd'
import RadarChart from '../components/charts/RadarChart'

// TODO: 替换为 MCP 工具 calculate_career_profile 的实际返回数据
const mockProfile = {
  overallScore: 62.5,
  dimensionScores: {
    professional_skill: 75,
    soft_skill: 60,
    leadership: 45,
    innovation: 70,
    learning_ability: 80,
  },
  strengths: ['学习能力强', '逻辑思维好', '编程基础扎实'],
  weaknesses: ['项目经验不足', '沟通表达待提升'],
  recommendedDirections: [
    { position: 'AI 工程师', matchScore: 82 },
    { position: '数据分析师', matchScore: 78 },
    { position: '全栈开发', matchScore: 65 },
  ],
}

const dimensionLabels: Record<string, string> = {
  professional_skill: '专业技能',
  soft_skill: '软技能',
  leadership: '领导力',
  innovation: '创新力',
  learning_ability: '学习力',
}

function Profile() {
  return (
    <div className="page-container">
      <h1 className="page-title">职业画像</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 雷达图 */}
        <Col xs={24} lg={12}>
          <Card className="card" title="五维能力评估" extra={<Tag color="blue">综合 {mockProfile.overallScore} 分</Tag>}>
            <RadarChart scores={mockProfile.dimensionScores} height={350} />
          </Card>
        </Col>

        {/* 各维度分数 */}
        <Col xs={24} lg={12}>
          <Card className="card" title="维度详情">
            {Object.entries(mockProfile.dimensionScores).map(([key, value]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{dimensionLabels[key]}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
                <Progress
                  percent={value}
                  showInfo={false}
                  strokeColor={`var(--color-dim-${key === 'professional_skill' ? 'professional' : key === 'soft_skill' ? 'soft' : key === 'learning_ability' ? 'learning' : key})`}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 优势 */}
        <Col xs={24} md={8}>
          <Card className="card" title="✅ 优势">
            <List
              dataSource={mockProfile.strengths}
              renderItem={(item) => <List.Item><Tag color="green">{item}</Tag></List.Item>}
            />
          </Card>
        </Col>

        {/* 待提升 */}
        <Col xs={24} md={8}>
          <Card className="card" title="📈 待提升">
            <List
              dataSource={mockProfile.weaknesses}
              renderItem={(item) => <List.Item><Tag color="orange">{item}</Tag></List.Item>}
            />
          </Card>
        </Col>

        {/* 推荐方向 */}
        <Col xs={24} md={8}>
          <Card className="card" title="🎯 推荐方向">
            <List
              dataSource={mockProfile.recommendedDirections}
              renderItem={(item) => (
                <List.Item>
                  <Descriptions size="small" column={1} style={{ width: '100%' }}>
                    <Descriptions.Item label={item.position}>
                      <Progress percent={item.matchScore} size="small" strokeColor="var(--color-primary)" />
                    </Descriptions.Item>
                  </Descriptions>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile
