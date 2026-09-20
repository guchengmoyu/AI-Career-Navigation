import { useEffect, useState } from 'react'
import { Alert, Card, Col, Empty, List, Progress, Row, Skeleton, Statistic, Tag, Typography } from 'antd'
import {
  ClockCircleOutlined,
  FireOutlined,
  RiseOutlined,
  RobotOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import RadarChart from '../components/charts/RadarChart'
import { DEMO_USER_ID, profileApi, progressApi, type CareerProfile, type ProgressSummary } from '../services/api'

const { Paragraph, Text } = Typography

/* 事件类型 -> 展示色。与进度页保持同一套映射。 */
const eventColors: Record<string, string> = {
  task_completed: 'blue',
  course_completed: 'cyan',
  project_completed: 'purple',
  skill_practice: 'green',
  inactivity: 'orange',
}

/* 按当前时间给出问候语（文档 3.3：顶部 AI 问候语与建议，体现陪伴感）。 */
function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

/* 后端分数为浮点数，统一保留 1 位并去掉多余 0 */
function fmtScore(value: number): string {
  return Number(value.toFixed(1)).toString()
}

function Home() {
  const [profile, setProfile] = useState<CareerProfile | null>(null)
  const [progress, setProgress] = useState<ProgressSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([profileApi.get(DEMO_USER_ID), progressApi.getSummary(DEMO_USER_ID)])
      .then(([profileResult, progressResult]) => { setProfile(profileResult); setProgress(progressResult) })
      .catch((reason: Error) => setError(reason.message))
  }, [])

  if (error) return <Alert type="error" showIcon message="总览加载失败" description={error} />
  if (!profile || !progress) return <div className="page-container"><Skeleton active paragraph={{ rows: 8 }} /></div>

  /* 最弱维度 —— 用作"下一步建议"的依据，避免写死文案。 */
  const weakest = [...profile.dimensions].sort((a, b) => a.score - b.score)[0]
  const activePath = progress.active_path
  const recentEvents = progress.recent_events.slice(0, 6)

  return (
    <div className="page-container">
      <h1 className="page-title">成长总览</h1>

      {/* 顶部：AI 问候 + 建议（文档 3.3 第一屏要素） */}
      <Card className="card hero-card" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <RobotOutlined style={{ fontSize: 20, color: 'var(--color-primary)' }} />
              <Text strong style={{ fontSize: 18 }}>
                {greeting()}，匿名同学
              </Text>
            </div>
            <Paragraph type="secondary" style={{ marginBottom: 4 }}>
              你已经连续学习 <Text strong>{progress.streak_days}</Text> 天，累计投入{' '}
              <Text strong>{progress.total_learning_hours}</Text> 小时。
            </Paragraph>
            {weakest && (
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                <Tag color="blue">AI 建议</Tag>
                当前「{weakest.name}」最薄弱（{fmtScore(weakest.score)} 分），建议优先安排这一维度的训练。
              </Paragraph>
            )}
          </Col>
        </Row>
      </Card>

      <Alert
        type="info"
        showIcon
        message="当前为匿名模拟用户演示"
        description={profile.disclaimer}
        style={{ marginBottom: 16 }}
      />

      {/* 三个核心数据卡（文档 3.3：综合评分 / 学习时长 / 任务进度）
          三张卡用不同功能色区分：奖杯-主色蓝（能力/成就）、时钟-成长绿（时间投入）、火苗-激励橙（活跃度）。
          颜色取自设计文档 1.2 既有的色板，不引入体系外的新色。 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }} className="row-equal-height">
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="card stat-card-tone"
            style={{ '--tone-color': 'var(--color-primary)' } as React.CSSProperties}
          >
            <Statistic
              title="综合能力分"
              value={profile.overall_score}
              precision={1}
              suffix="分"
              prefix={<TrophyOutlined style={{ color: 'var(--color-primary)' }} />}
              valueStyle={{ color: 'var(--color-primary)' }}
            />
            {/* 空槽位：与右侧两张卡的副文案占位对齐，保证三张卡数字在同一水平线上 */}
            <div className="stat-sub" aria-hidden="true" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="card stat-card-tone" style={{ '--tone-color': 'var(--color-success)' } as React.CSSProperties}>
            <Statistic
              title="累计学习时长"
              value={progress.total_learning_hours}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: 'var(--color-success)' }} />}
              valueStyle={{ color: 'var(--color-success)' }}
            />
            <div className="stat-sub">连续学习 {progress.streak_days} 天</div>
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card className="card stat-card-tone" style={{ '--tone-color': 'var(--color-warning)' } as React.CSSProperties}>
            <Statistic
              title="任务进度"
              value={progress.completed_tasks}
              suffix={activePath ? `/ ${activePath.total_tasks}` : '项'}
              prefix={<FireOutlined style={{ color: 'var(--color-warning)' }} />}
              valueStyle={{ color: 'var(--color-warning)' }}
            />
            <div className="stat-sub">
              {activePath ? (
                <Progress
                  percent={activePath.progress_percent}
                  size="small"
                  strokeColor="var(--color-warning)"
                  style={{ marginBottom: 0 }}
                />
              ) : (
                <span>未关联学习路径</span>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 雷达图 + 学习路径进度 左右分栏（文档 3.3）
          用 .row-equal-height 让同一行两张卡等高，避免下方留出突兀空白 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }} className="row-equal-height">
        <Col xs={24} lg={12}>
          <Card
            className="card"
            title="八维能力雷达图"
            extra={<a href="/profile">查看详细画像 →</a>}
          >
            <RadarChart dimensions={profile.dimensions} height={330} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            className="card"
            title="学习路径进度"
            extra={<a href="/path">查看完整路径 →</a>}
          >
            {activePath ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <Text strong>{activePath.title}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress percent={activePath.progress_percent} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    已完成 {activePath.completed_tasks} / {activePath.total_tasks} 个任务
                  </Text>
                </div>
                <List
                  size="small"
                  dataSource={profile.dimensions.slice(0, 4)}
                  renderItem={(dimension) => (
                    <List.Item>
                      <span>{dimension.name}</span>
                      <Text type="secondary">{fmtScore(dimension.score)} 分</Text>
                    </List.Item>
                  )}
                />
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="尚未生成学习路径"
                style={{ padding: '24px 0' }}
              >
                <a href="/path">去生成学习路径</a>
              </Empty>
            )}
          </Card>
        </Col>
      </Row>

      {/* 最近活动（文档 3.3：时间线式成长记录） */}
      <Card className="card" title="最近活动">
        {recentEvents.length ? (
          <List
            dataSource={recentEvents}
            renderItem={(event) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<RiseOutlined style={{ color: 'var(--color-primary)' }} />}
                  title={event.detail}
                  description={
                    <span>
                      {new Date(event.event_time).toLocaleDateString('zh-CN')} ·{' '}
                      <Tag color={eventColors[event.event_type] || 'default'}>{event.event_type}</Tag>
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无成长记录" />
        )}
      </Card>
    </div>
  )
}

export default Home
