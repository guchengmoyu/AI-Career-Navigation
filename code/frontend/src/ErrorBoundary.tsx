import { Component, type ReactNode } from 'react'

/* 顶层错误边界（批 2）。
   背景：React 19 默认没有错误边界 —— 任何子组件渲染异常（如 ECharts 在脏数据上抛错）
   会把整个应用树卸载，表现为「页面白屏一闪」。本组件把异常拦在边界内：
   显示可恢复的错误卡片（重试/回首页），控制台保留完整堆栈供排查。

   P1 调整：「回首页」由 `window.location.href = '/'`（整页重载 + 依赖 pathname 路由）
   改为 hash 导航（`#/`）+ 清除错误态 —— 不刷新页面、也不假设部署在域名根路径，
   嵌入宿主应用（P2/P4 卡片）后同样成立。 */

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    console.error('[ErrorBoundary] 渲染异常：', error, info?.componentStack ?? '')
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: 0 }}>页面出错了</h3>
          <p style={{ color: '#888', fontSize: 13, maxWidth: 480 }}>
            {String(this.state.error?.message || this.state.error)}
          </p>
          <div>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #d9d9d9', background: '#fff', cursor: 'pointer' }}
            >
              重试
            </button>
            <button
              type="button"
              onClick={() => {
                this.setState({ error: null })
                window.location.hash = '/'
              }}
              style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, border: '1px solid #1677FF', background: '#1677FF', color: '#fff', cursor: 'pointer' }}
            >
              回首页
            </button>
          </div>
          <p style={{ color: '#bbb', fontSize: 12 }}>（完整堆栈见浏览器控制台）</p>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
