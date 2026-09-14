import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
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

const menuItems: MenuProps['items'] = [
  { key: '/', icon: <HomeOutlined />, label: '成长总览' },
  { key: '/profile', icon: <UserOutlined />, label: '职业画像' },
  { key: '/path', icon: <BranchesOutlined />, label: '学习路径' },
  { key: '/scenario', icon: <PlayCircleOutlined />, label: '场景训练' },
  { key: '/progress', icon: <RiseOutlined />, label: '学习进度' },
]

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

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#fff',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid var(--color-border)',
          gap: 8,
        }}>
          <RobotOutlined style={{ fontSize: 24, color: 'var(--color-primary)' }} />
          {!collapsed && (
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
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

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: 56,
        }}>
          <span
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 18, cursor: 'pointer', color: 'var(--color-text-secondary)' }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>

          <Space size={16}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); /* TODO: 打开AI对话 */ }}
              style={{
                padding: '4px 12px',
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: 'var(--radius-btn)',
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              <RobotOutlined /> AI 对话
            </a>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                style={{ backgroundColor: 'var(--color-primary)', cursor: 'pointer' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ padding: 0, minHeight: 'calc(100vh - 56px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
