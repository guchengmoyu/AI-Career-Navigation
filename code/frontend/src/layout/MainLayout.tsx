import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Space, Button, theme } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  BranchesOutlined,
  PlayCircleOutlined,
  RiseOutlined,
  RobotOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useIsMobile } from '../hooks/useBreakpoint'

const { Header, Sider, Content } = Layout

/* 侧栏尺寸对齐 10_UI设计文档.md 2.1：桌面 200px，折叠 64px。
   与 styles/global.css 的 --sidebar-width / --sidebar-width-collapsed 保持一致。 */
const SIDER_WIDTH = 200
const SIDER_COLLAPSED_WIDTH = 64
const HEADER_HEIGHT = 56

/* 主导航定义。抽成正交的 `navRoutes` 供侧边栏 Menu 与移动端底部 Tab 共用，
   避免两处各写一份导致路由/文案漂移（文档 3.10 要求两套导航入口一致）。 */
const navRoutes: {
  key: string
  icon: React.ReactNode
  label: string
  /** 移动端底部 Tab 的短标签（窄屏放不下四字） */
  tabLabel: string
}[] = [
  { key: '/', icon: <HomeOutlined />, label: '成长总览', tabLabel: '总览' },
  { key: '/profile', icon: <UserOutlined />, label: '职业画像', tabLabel: '画像' },
  { key: '/path', icon: <BranchesOutlined />, label: '学习路径', tabLabel: '路径' },
  { key: '/scenario', icon: <PlayCircleOutlined />, label: '场景训练', tabLabel: '训练' },
  { key: '/progress', icon: <RiseOutlined />, label: '学习进度', tabLabel: '进度' },
]

const menuItems: MenuProps['items'] = navRoutes.map(({ key, icon, label }) => ({
  key,
  icon,
  label,
}))

/* 路由 -> 页面标题。Header 需要展示当前页标题（文档 2.1：顶部导航栏含 Logo、页面标题）。 */
const pageTitles: Record<string, string> = Object.fromEntries(
  navRoutes.map(({ key, label }) => [key, label]),
)

const userMenuItems: MenuProps['items'] = [
  { key: 'profile', label: '个人信息' },
  { key: 'settings', label: '偏好设置' },
  { type: 'divider' },
  { key: 'logout', label: '退出登录' },
]

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  /* 跟随视口宽度切换桌面 / 移动布局（文档 5.2 断点） */
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()

  /* 切到移动端时自动展开侧栏状态，避免从折叠态带过去 */
  useEffect(() => {
    if (isMobile) setCollapsed(false)
  }, [isMobile])

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  const currentTitle = isMobile
    ? 'AI 职业导航'
    : pageTitles[location.pathname] ?? 'AI 职业导航'
  const siderWidth = collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 桌面端侧边栏；移动端隐藏，改用底部 Tab（文档 3.10） */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={SIDER_WIDTH}
          collapsedWidth={SIDER_COLLAPSED_WIDTH}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            background: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div
            style={{
              height: HEADER_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              gap: 8,
            }}
          >
            <RobotOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            {!collapsed && (
              <span style={{ fontSize: 16, fontWeight: 600, color: token.colorText }}>
                AI 职业导航
              </span>
            )}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={onMenuClick}
            style={{ borderRight: 'none', marginTop: 8 }}
          />
        </Sider>
      )}

      <Layout
        style={
          isMobile
            ? undefined
            : { marginLeft: siderWidth, transition: 'margin-left 0.2s' }
        }
      >
        <Header
          style={{
            background: token.colorBgContainer,
            padding: isMobile ? '0 12px' : '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            height: HEADER_HEIGHT,
            lineHeight: 'normal',
          }}
        >
          <Space size={isMobile ? 8 : 12} align="center">
            {/* 移动端无侧栏，改为展示品牌标识（文档 3.10 顶部示意） */}
            {isMobile ? (
              <>
                <RobotOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: token.colorText }}>
                  {currentTitle}
                </span>
              </>
            ) : (
              <>
                <Button
                  type="text"
                  aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
                  onClick={() => setCollapsed(!collapsed)}
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  style={{ fontSize: 16, color: token.colorTextSecondary }}
                />
                <span style={{ fontSize: 16, fontWeight: 600, color: token.colorText }}>
                  {currentTitle}
                </span>
              </>
            )}
          </Space>

          <Space size={isMobile ? 8 : 16} align="center">
            <Button
              type="primary"
              /* 移动端只留图标与极短文案，避免 Header 拥挤 */
              icon={<RobotOutlined />}
              size={isMobile ? 'small' : 'middle'}
              onClick={() => { /* TODO: 打开 AI 对话（百宝箱智能体） */ }}
            >
              {isMobile ? '对话' : 'AI 对话'}
            </Button>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                size={isMobile ? 28 : 'default'}
                style={{ backgroundColor: token.colorPrimary, cursor: 'pointer' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ minHeight: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
          <Outlet />
        </Content>
      </Layout>

      {/* 移动端底部 Tab 栏（文档 3.10 / 5.2：单列布局 + 底部 Tab） */}
      {isMobile && (
        <nav className="mobile-tabbar" aria-label="主导航">
          {navRoutes.map(({ key, icon, tabLabel }) => {
            const active = location.pathname === key
            return (
              <button
                key={key}
                type="button"
                className={`mobile-tabbar-item${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => navigate(key)}
              >
                <span className="mobile-tabbar-icon">{icon}</span>
                <span className="mobile-tabbar-label">{tabLabel}</span>
              </button>
            )
          })}
        </nav>
      )}
    </Layout>
  )
}

export default MainLayout
