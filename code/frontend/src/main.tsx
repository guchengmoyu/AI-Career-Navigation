import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './styles/global.css'

/* 主题 token 集中在此，避免颜色/圆角/间距散落在各组件里硬编码。
   取值与 styles/global.css 的 CSS 变量保持同一套设计规范
   （依据：设计文档/10_UI设计文档.md 1.3 色彩体系、5.1 组件设计规范）。 */
const theme = {
  token: {
    colorPrimary: '#1677FF',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    colorInfo: '#1677FF',

    colorText: '#1F1F1F',
    colorTextSecondary: '#595959',
    colorTextTertiary: '#8C8C8C',
    colorBorder: '#D9D9D9',
    colorBorderSecondary: '#F0F0F0',
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F5F7FA',

    borderRadius: 6,
    borderRadiusLG: 8,
    fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif',
    fontSize: 14,

    /* 布局尺寸对齐 10_UI设计文档.md 2.1：Header 56px（侧栏宽度由 Sider 显式指定） */
    controlHeight: 32,
  },
  components: {
    Layout: {
      headerHeight: 56,
      headerPadding: '0 24px',
      headerBg: '#FFFFFF',
      bodyBg: '#F5F7FA',
      siderBg: '#FFFFFF',
    },
    Card: {
      paddingLG: 20,
    },
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN} theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
)
