import { useState } from 'react'
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

const { Header, Sider, Content } = Layout

/* 侧栏尺寸对齐 10_UI设计文档.md 2.1：桌面 200px，折叠 64px。
   与 styles/global.css 的 --sidebar-width / --sidebar-width-collapsed 保持一致。 */
const SIDER_WIDTH = 200
const SIDER_COLLAPSED_WIDTH = 64
const HEADER_HEIGHT = 56

const menuItems: MenuProps['items'] = [
  { key: '/', icon: <HomeOutlined />, label: '成长总览' },
  { key: '/profile', icon: <UserOutlined />, label: '职业画像' },
  { key: '/path', icon: <BranchesOutlined />, label: '学习路径' },
  { key: '/scenario', icon: <PlayCircleOutlined />, label: '场景训练' },
  { key: '/progress', icon: <RiseOutlined />, label: '学习进度' },
]

/* 路由 -> 页面标题。Header 需要展示当前页标题（文档 2.1：顶部导航栏含 Logo、页面标题）。 */
const pageTitles: Record<string, string> = {
  '/': '成长总览',
  '/profile': '职业画像',
  '/path': '学习路径',
  '/scenario': '场景训练',
  '/progress': '学习进度',
}

const userMenuItems: MenuProps['items'] = [
  { key: 'profile', label: '个人信息' },
  { key: 'settings', label: '偏好设置' },
  { type: 'divider' },
  { key: 'logout', label: '退出登录' },
]

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  const currentTitle = pageTitles[location.pathname] ?? 'AI 职业导航'
  const siderWidth = collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH

  return (
    <Layout style={{ minHeight: '100vh' }}>
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

      <Layout style={{ marginLeft: siderWidth, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: '0 24px',
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
          <Space size={12} align="center">
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
          </Space>

          <Space size={16} align="center">
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={() => { /* TODO: 打开 AI 对话（百宝箱智能体） */ }}
            >
              AI 对话
            </Button>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
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
    </Layout>
  )
}

export default MainLayout
