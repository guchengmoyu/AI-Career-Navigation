import { useEffect, useRef } from 'react'

interface ChatPanelProps {
  /** 百宝箱智能体的 Web 发布地址 */
  agentUrl?: string
  height?: string | number
}

/**
 * 嵌入百宝箱智能体对话窗口
 *
 * 百宝箱企业版发布智能体后会提供一个 Web 地址，
 * 通过 iframe 嵌入到前端页面的"AI 对话"入口中。
 *
 * 使用方式：
 *   <ChatPanel agentUrl="https://your-agent-url.box.antgroup.com" />
 */
function ChatPanel({ agentUrl, height = '100%' }: ChatPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // 监听 iframe 消息，可用于获取智能体的回复数据
    const handler = (event: MessageEvent) => {
      // TODO: 根据百宝箱实际消息格式处理
      console.log('Agent message:', event.data)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  if (!agentUrl) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8C8C8C',
        flexDirection: 'column',
        gap: 8,
      }}>
        <span style={{ fontSize: 32 }}>🤖</span>
        <span>AI 对话功能待接入百宝箱智能体</span>
        <span style={{ fontSize: 12 }}>在 ChatPanel 组件中传入 agentUrl 即可</span>
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      src={agentUrl}
      style={{
        width: '100%',
        height,
        border: 'none',
        borderRadius: 8,
      }}
      title="AI 职业导航对话"
      allow="microphone"
    />
  )
}

export default ChatPanel
