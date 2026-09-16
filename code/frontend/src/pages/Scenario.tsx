import { useEffect, useState } from 'react'
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Input,
  List,
  Progress,
  Row,
  Segmented,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd'
import { RobotOutlined, SendOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { DEMO_USER_ID, scenarioApi, type Scenario, type ScenarioEvaluation } from '../services/api'

const { Paragraph, Text } = Typography
const { TextArea } = Input

interface Message {
  role: 'user' | 'assistant'
  content: string
}

/* 场景模块 -> 展示色与短标签（文档 3.6 顶部的模块筛选） */
const moduleMeta: Record<string, { color: string; short: string }> = {
  'SCN-REMOTE': { color: 'blue', short: '远程协作' },
  'SCN-AI-OFFICE': { color: 'purple', short: 'AI 办公' },
  'SCN-CROSS-ROLE': { color: 'cyan', short: '跨岗沟通' },
}

/* 难度枚举统一为 beginner / intermediate / advanced */
const difficultyMeta: Record<string, { label: string; color: string }> = {
  beginner: { label: '初级', color: 'green' },
  intermediate: { label: '中级', color: 'orange' },
  advanced: { label: '高级', color: 'red' },
}

/* 后端分数为浮点数，统一保留 1 位并去掉多余 0 */
function fmtScore(value: number): string {
  return Number(value.toFixed(1)).toString()
}

function ScenarioPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selected, setSelected] = useState<Scenario | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [evaluation, setEvaluation] = useState<ScenarioEvaluation | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [moduleFilter, setModuleFilter] = useState('全部')

  useEffect(() => {
    scenarioApi
      .list()
      .then((result) => setScenarios(result.scenarios))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false))
  }, [])

  const choose = async (scenario: Scenario) => {
    setError('')
    setEvaluation(null)
    setMessages([])
    setSelected(scenario)
    try {
      const result = await scenarioApi.start(scenario.scenario_id, DEMO_USER_ID)
      setSessionId(result.session_id)
      setMessages([{ role: 'assistant', content: result.scenario.initial_prompt }])
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  const send = async () => {
    if (!input.trim() || !sessionId) return
    const answer = input
    setInput('')
    setMessages((current) => [...current, { role: 'user', content: answer }])
    try {
      const result = await scenarioApi.evaluate(sessionId, DEMO_USER_ID, answer)
      setEvaluation(result)
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: `评估完成：${fmtScore(result.overall_score)} 分。${
            result.improvement_suggestions.join('；') || '已覆盖主要行动要点。'
          }`,
        },
      ])
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  if (loading) return <div className="page-container"><Skeleton active paragraph={{ rows: 10 }} /></div>

  /* 模块筛选：全部 / 各模块短标签 */
  const moduleOptions = ['全部', ...new Set(scenarios.map((item) => item.module_id))]
  const visible = scenarios.filter(
    (item) =>
      moduleFilter === '全部' ||
      item.module_id === moduleFilter ||
      moduleMeta[item.module_id]?.short === moduleFilter,
  )

  return (
    <div className="page-container">
      <h1 className="page-title">场景训练</h1>

      {error && <Alert type="error" message={error} closable style={{ marginBottom: 12 }} />}

      {/* 模块筛选（文档 3.6 顶部标签行） */}
      <Segmented
        options={moduleOptions.map((key) =>
          key === '全部' ? '全部' : moduleMeta[key]?.short ?? key,
        )}
        value={moduleFilter === '全部' ? '全部' : moduleMeta[moduleFilter]?.short ?? moduleFilter}
        onChange={(value) => {
          const matched = moduleOptions.find(
            (key) => key === '全部' || (moduleMeta[key]?.short ?? key) === value,
          )
          setModuleFilter(matched ?? '全部')
        }}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="card" title={`训练场景（${visible.length}）`}>
            {visible.length ? (
              <List
                dataSource={visible}
                pagination={{ pageSize: 6, size: 'small', hideOnSinglePage: true }}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => void choose(item)}
                    className={
                      selected?.scenario_id === item.scenario_id
                        ? 'scenario-item scenario-item-active'
                        : 'scenario-item'
                    }
                  >
                    <List.Item.Meta
                      avatar={<VideoCameraOutlined />}
                      title={item.title}
                      description={
                        <Space size={4} wrap>
                          <Tag color={moduleMeta[item.module_id]?.color}>
                            {item.module_name}
                          </Tag>
                          <Tag color={difficultyMeta[item.difficulty]?.color}>
                            {difficultyMeta[item.difficulty]?.label ?? item.difficulty}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该模块下暂无场景" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card className="card" title={selected?.title || '选择一个场景开始训练'}>
            {selected ? (
              <>
                <Paragraph type="secondary">{selected.context}</Paragraph>

                <div className="chat-area">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={
                        message.role === 'user' ? 'chat-row chat-row-user' : 'chat-row'
                      }
                    >
                      <Space align="start">
                        {message.role === 'assistant' && <Avatar icon={<RobotOutlined />} />}
                        <div className={message.role === 'user' ? 'bubble bubble-user' : 'bubble'}>
                          {message.content}
                        </div>
                        {message.role === 'user' && <Avatar icon={<UserOutlined />} />}
                      </Space>
                    </div>
                  ))}
                  {!messages.length && (
                    <Text type="secondary">正在准备场景开场白…</Text>
                  )}
                </div>

                {evaluation && (
                  <Alert
                    type={evaluation.overall_score >= 80 ? 'success' : 'warning'}
                    message={`综合得分 ${fmtScore(evaluation.overall_score)}`}
                    description={
                      <>
                        <Progress percent={evaluation.overall_score} />
                        {evaluation.highlights.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {evaluation.highlights.map((item) => (
                              <Tag color="green" key={item}>
                                {item}
                              </Tag>
                            ))}
                          </div>
                        )}
                        <Text>能力变化仅为建议，尚未写入画像。</Text>
                      </>
                    }
                    style={{ marginBottom: 12 }}
                  />
                )}

                <Space.Compact style={{ width: '100%' }}>
                  <TextArea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="说明你会确认什么、如何行动、如何保护隐私并复盘"
                    autoSize={{ minRows: 2, maxRows: 5 }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => void send()}
                    disabled={Boolean(evaluation)}
                  >
                    提交评估
                  </Button>
                </Space.Compact>
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="从上方模块筛选后，选择一个训练场景开始"
                style={{ padding: '48px 0' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ScenarioPage
