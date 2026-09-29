import { useState } from 'react'
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
import { ArrowUpOutlined, FileTextOutlined, RobotOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import type { Scenario, ScenarioEvaluation } from '../services/types'

const { Paragraph, Text } = Typography
const { TextArea } = Input

/* P1：本页改为纯受控组件 —— 场景列表由容器注入（scenarios/loading/error），
   start/evaluate 走注入的回调（容器持有 userId 与 HTTP 客户端），
   「查看完整报告」不再用 react-router 导航，改为 onOpenEvaluation 上抛给容器。
   聊天消息、输入框等**瞬时 UI 态**仍留在页面本地。 */

export interface ScenarioPageProps {
  scenarios: Scenario[]
  loading: boolean
  /** 列表加载错误（容器侧） */
  error: string
  /** 发起一次场景会话，返回会话 id 与开场白 */
  onStart: (scenarioId: string) => Promise<{ sessionId: string; initialPrompt: string }>
  /** 提交用户回答并获取评估结果 */
  onEvaluate: (sessionId: string, responseText: string) => Promise<ScenarioEvaluation>
  /** 评估完成后打开报告页（容器负责携带结果 + 路由跳转） */
  onOpenEvaluation: (evaluation: ScenarioEvaluation, scenarioTitle: string) => void
}

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

function ScenarioPage({
  scenarios,
  loading,
  error,
  onStart,
  onEvaluate,
  onOpenEvaluation,
}: ScenarioPageProps) {
  const [selected, setSelected] = useState<Scenario | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [evaluation, setEvaluation] = useState<ScenarioEvaluation | null>(null)
  const [input, setInput] = useState('')
  /* start/evaluate 这类交互动作的失败文案（与列表加载错误 error 分开，互不覆盖） */
  const [actionError, setActionError] = useState('')
  const [moduleFilter, setModuleFilter] = useState('全部')

  const choose = async (scenario: Scenario) => {
    setActionError('')
    setEvaluation(null)
    setMessages([])
    setSelected(scenario)
    try {
      const result = await onStart(scenario.scenario_id)
      setSessionId(result.sessionId)
      setMessages([{ role: 'assistant', content: result.initialPrompt }])
    } catch (reason) {
      setActionError((reason as Error).message)
    }
  }

  const send = async () => {
    if (!input.trim() || !sessionId) return
    const answer = input
    setInput('')
    setMessages((current) => [...current, { role: 'user', content: answer }])
    try {
      const result = await onEvaluate(sessionId, answer)
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
      setActionError((reason as Error).message)
    }
  }

  if (loading) return <div className="page-container"><Skeleton active paragraph={{ rows: 10 }} /></div>

  const shownError = error || actionError

  /* 模块筛选：全部 / 各模块短标签。
     module_id 与展示短标签不是同一个字符串（SCN-REMOTE → 远程协作），
     所以必须把 { label, value } 成对交给 Segmented，让它自己负责回传 value。
     ⚠️ 曾经的写法是 options 只给展示串、onChange 里再反查 module_id，
        反查用 `find(key => key === '全部' || ...)` —— 「全部」排在数组第一位，
        它的第一段条件恒为 true，于是 find 永远返回「全部」，
        三个模块标签全成了 no-op（点击后高亮与列表都不动）。改回成对声明后不再需要反查。 */
  const moduleOptions = [
    { label: '全部', value: '全部' },
    ...Array.from(new Set(scenarios.map((item) => item.module_id))).map((id) => ({
      label: moduleMeta[id]?.short ?? id,
      value: id,
    })),
  ]
  const visible = scenarios.filter(
    (item) => moduleFilter === '全部' || item.module_id === moduleFilter,
  )

  return (
    <div className="page-container">
      <h1 className="page-title">场景训练</h1>

      {shownError && <Alert type="error" title={shownError} closable style={{ marginBottom: 12 }} />}

      {/* 模块筛选（文档 3.6 顶部标签行）。
          onValueChange 直接拿到的就是 module_id（或 '全部'），无需再反查。 */}
      <Segmented
        options={moduleOptions}
        value={moduleFilter}
        onChange={(value) => setModuleFilter(String(value))}
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
                    title={`综合得分 ${fmtScore(evaluation.overall_score)}`}
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
                        {/* 评估报告页入口。评估结果**只存在于内存**（服务端不落库），
                            所以必须把整个对象交给容器（onOpenEvaluation），
                            由容器写入 sessionStorage 并跳转报告页；
                            刷新报告页由 sessionStorage 恢复，那边有对应的降级空态兜底。 */}
                        <div style={{ marginTop: 8 }}>
                          <Button
                            size="small"
                            icon={<FileTextOutlined />}
                            onClick={() =>
                              onOpenEvaluation(evaluation, selected?.title ?? '')
                            }
                          >
                            查看完整报告
                          </Button>
                        </div>
                      </>
                    }
                    style={{ marginBottom: 12 }}
                  />
                )}

                {/* 输入区：整块圆角矩形容器（像 WorkBuddy / 各种 agent 工具的输入框）——
                    容器自身就是那个"矩形框"，内部上边是文字输入区、右下角是圆形发送键。
                    结构 = 容器 padding 10px 12px + 列向 flex(输入框 → 8px 间距 → 按钮行右对齐)。
                    ⚠️ TextArea 要**去掉 antd 自带的边框与底色**（variant="borderless"），
                       否则会在容器里再画一个方框，出现"框中框"。
                    ⚠️ 圆形按钮 32×32：用 `shape="circle"` + `size="middle"`（antd 默认即是 32px），
                       **不要写 width/height** —— 之前 `Space.Compact` 那条
                       `.ant-space-compact > .ant-btn { height: 100% }` 会把它压扁成竖椭圆；
                       现在容器是普通 div、按钮只受 antd 自身规则约束，圆形才立得住。
                    ⚠️ 图标用 ArrowUpOutlined（向上箭头 = 发送），不是 SendOutlined（纸飞机）。
                       按钮无文字 → 必须补 `aria-label`，否则屏幕阅读器读不出用途。 */}
                <div className="composer">
                  <TextArea
                    className="composer-input"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="说明你会确认什么、如何行动、如何保护隐私并复盘"
                    autoSize={{ minRows: 2, maxRows: 5 }}
                    variant="borderless"
                  />
                  <div className="composer-actions">
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<ArrowUpOutlined />}
                      onClick={() => void send()}
                      disabled={Boolean(evaluation)}
                      aria-label="提交评估"
                      title="提交评估"
                    />
                  </div>
                </div>
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
