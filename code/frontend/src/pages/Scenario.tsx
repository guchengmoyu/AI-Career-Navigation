import { useState } from 'react'
import { Row, Col, Card, List, Tag, Button, Input, Typography, Space, Avatar } from 'antd'
import {
  VideoCameraOutlined,
  RobotOutlined,
  UserOutlined,
  SendOutlined,
} from '@ant-design/icons'

const { Text, Paragraph } = Typography
const { TextArea } = Input

// TODO: 替换为 MCP 工具 getScenario 的实际返回数据
const mockScenarios = [
  {
    id: 'SCN-REMOTE-001',
    title: '远程团队晨会沟通',
    type: 'remote_collab',
    difficulty: 'medium',
    duration: '15 分钟',
    description: '你是一名远程团队成员，需要在晨会中汇报项目进度并协调跨时区任务。',
  },
  {
    id: 'SCN-AI-001',
    title: '使用 AI 工具完成代码审查',
    type: 'ai_assisted',
    difficulty: 'hard',
    duration: '20 分钟',
    description: '你需要借助 AI 代码审查工具，分析一段遗留代码并提出重构建议。',
  },
  {
    id: 'SCN-CROSS-001',
    title: '与产品经理沟通需求',
    type: 'cross_role',
    difficulty: 'easy',
    duration: '10 分钟',
    description: '产品经理提出了一个模糊需求，你需要通过提问澄清技术实现细节。',
  },
]

const typeMap: Record<string, { label: string; color: string }> = {
  remote_collab: { label: '远程协作', color: 'blue' },
  ai_assisted: { label: 'AI 辅助办公', color: 'purple' },
  cross_role: { label: '跨岗位沟通', color: 'cyan' },
}

const diffMap: Record<string, { label: string; color: string }> = {
  easy: { label: '入门', color: 'green' },
  medium: { label: '进阶', color: 'orange' },
  hard: { label: '挑战', color: 'red' },
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function Scenario() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')

  const selectedScenario = mockScenarios.find((s) => s.id === selectedId)

  const handleSend = () => {
    if (!inputValue.trim()) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: inputValue },
      { role: 'assistant', content: '（场景模拟引擎响应占位 — 接入 MCP startScenario 后替换）' },
    ])
    setInputValue('')
  }

  return (
    <div className="page-container">
      <h1 className="page-title">场景训练</h1>

      <Row gutter={[16, 16]}>
        {/* 左侧：场景列表 */}
        <Col xs={24} lg={8}>
          <Card className="card" title="训练场景">
            <List
              dataSource={mockScenarios}
              renderItem={(item) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    background: selectedId === item.id ? 'var(--color-bg-page)' : 'transparent',
                    borderRadius: 'var(--radius-btn)',
                    padding: '12px',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => { setSelectedId(item.id); setMessages([]) }}
                >
                  <List.Item.Meta
                    avatar={<VideoCameraOutlined style={{ fontSize: 20, color: 'var(--color-primary)' }} />}
                    title={item.title}
                    description={
                      <Space size={4}>
                        <Tag color={typeMap[item.type].color}>{typeMap[item.type].label}</Tag>
                        <Tag color={diffMap[item.difficulty].color}>{diffMap[item.difficulty].label}</Tag>
                        <Text type="secondary">{item.duration}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 右侧：对话区域 */}
        <Col xs={24} lg={16}>
          <Card
            className="card"
            title={selectedScenario ? selectedScenario.title : '选择一个场景开始训练'}
            style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
          >
            {selectedScenario ? (
              <>
                <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                  {selectedScenario.description}
                </Paragraph>

                {/* 消息列表 */}
                <div style={{ flex: 1, overflow: 'auto', marginBottom: 16, padding: '0 4px' }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', marginTop: 80 }}>
                      <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                      <div>发送消息开始场景模拟</div>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          marginBottom: 12,
                        }}
                      >
                        <Space align="start" direction={msg.role === 'user' ? 'horizontal' : 'horizontal'}>
                          {msg.role === 'assistant' && <Avatar icon={<RobotOutlined />} style={{ background: 'var(--color-primary)' }} />}
                          <div style={{
                            maxWidth: 400,
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-card)',
                            background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-bg-page)',
                            color: msg.role === 'user' ? '#fff' : 'var(--color-text-primary)',
                          }}>
                            {msg.content}
                          </div>
                          {msg.role === 'user' && <Avatar icon={<UserOutlined />} style={{ background: 'var(--color-success)' }} />}
                        </Space>
                      </div>
                    ))
                  )}
                </div>

                {/* 输入框 */}
                <Space.Compact style={{ width: '100%' }}>
                  <TextArea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="输入你的回复..."
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSend() } }}
                    style={{ flex: 1 }}
                  />
                  <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
                    发送
                  </Button>
                </Space.Compact>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', marginTop: 120 }}>
                <VideoCameraOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <div>从左侧选择一个训练场景</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Scenario
