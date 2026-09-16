import { useEffect, useState } from 'react'
import { Alert, Avatar, Button, Card, Col, Input, List, Progress, Row, Space, Spin, Tag, Typography } from 'antd'
import { RobotOutlined, SendOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { DEMO_USER_ID, scenarioApi, type Scenario, type ScenarioEvaluation } from '../services/api'

const { Paragraph, Text } = Typography
const { TextArea } = Input
interface Message { role: 'user' | 'assistant'; content: string }
const moduleColors: Record<string, string> = { 'SCN-REMOTE': 'blue', 'SCN-AI-OFFICE': 'purple', 'SCN-CROSS-ROLE': 'cyan' }

function ScenarioPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selected, setSelected] = useState<Scenario | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [evaluation, setEvaluation] = useState<ScenarioEvaluation | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { scenarioApi.list().then((result) => setScenarios(result.scenarios)).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)) }, [])
  const choose = async (scenario: Scenario) => {
    setError(''); setEvaluation(null); setMessages([]); setSelected(scenario)
    try { const result = await scenarioApi.start(scenario.scenario_id, DEMO_USER_ID); setSessionId(result.session_id); setMessages([{ role: 'assistant', content: result.scenario.initial_prompt }]) }
    catch (reason) { setError((reason as Error).message) }
  }
  const send = async () => {
    if (!input.trim() || !sessionId) return
    const answer = input; setInput(''); setMessages((current) => [...current, { role: 'user', content: answer }])
    try {
      const result = await scenarioApi.evaluate(sessionId, DEMO_USER_ID, answer); setEvaluation(result)
      setMessages((current) => [...current, { role: 'assistant', content: `评估完成：${result.overall_score} 分。${result.improvement_suggestions.join('；') || '已覆盖主要行动要点。'}` }])
    } catch (reason) { setError((reason as Error).message) }
  }
  if (loading) return <Spin tip="正在加载训练场景" fullscreen />
  return <div className="page-container">
    <h1 className="page-title">场景训练</h1>{error && <Alert type="error" message={error} closable style={{ marginBottom: 12 }} />}
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}><Card title="训练场景"><List dataSource={scenarios} renderItem={(item) => <List.Item onClick={() => void choose(item)} style={{ cursor: 'pointer', background: selected?.scenario_id === item.scenario_id ? 'var(--color-bg-page)' : 'transparent', padding: 12 }}><List.Item.Meta avatar={<VideoCameraOutlined />} title={item.title} description={<Space><Tag color={moduleColors[item.module_id]}>{item.module_name}</Tag><Tag>{item.difficulty}</Tag></Space>} /></List.Item>} /></Card></Col>
      <Col xs={24} lg={16}><Card title={selected?.title || '选择一个场景开始训练'}>
        {selected ? <><Paragraph type="secondary">{selected.context}</Paragraph><div style={{ minHeight: 260, maxHeight: 420, overflow: 'auto' }}>{messages.map((message, index) => <div key={index} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}><Space align="start">{message.role === 'assistant' && <Avatar icon={<RobotOutlined />} />}<div style={{ maxWidth: 560, padding: '8px 12px', background: message.role === 'user' ? '#1677FF' : '#F5F5F5', color: message.role === 'user' ? '#fff' : undefined, borderRadius: 8 }}>{message.content}</div>{message.role === 'user' && <Avatar icon={<UserOutlined />} />}</Space></div>)}</div>
          {evaluation && <Alert type={evaluation.overall_score >= 80 ? 'success' : 'warning'} message={`综合得分 ${evaluation.overall_score}`} description={<><Progress percent={evaluation.overall_score} /><Text>能力变化仅为建议，尚未写入画像。</Text></>} style={{ marginBottom: 12 }} />}
          <Space.Compact style={{ width: '100%' }}><TextArea value={input} onChange={(event) => setInput(event.target.value)} placeholder="说明你会确认什么、如何行动、如何保护隐私并复盘" autoSize={{ minRows: 2, maxRows: 5 }} /><Button type="primary" icon={<SendOutlined />} onClick={() => void send()} disabled={Boolean(evaluation)}>提交评估</Button></Space.Compact></> : <div style={{ textAlign: 'center', padding: 80 }}><VideoCameraOutlined style={{ fontSize: 56 }} /><div>从左侧选择一个训练场景</div></div>}
      </Card></Col>
    </Row>
  </div>
}

export default ScenarioPage
