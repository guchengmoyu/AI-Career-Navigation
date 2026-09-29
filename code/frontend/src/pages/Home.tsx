import { Alert, Card, Col, Empty, List, Progress, Row, Skeleton, Statistic, Tag, Typography } from 'antd'
import {
  ClockCircleOutlined,
  FireOutlined,
  RiseOutlined,
  RobotOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import RadarChart from '../components/charts/RadarChart'
import type { CareerProfile, ProgressSummary } from '../services/types'

const { Paragraph, Text } = Typography

/* P1：本页改为纯受控组件 —— 数据（profile/progress）与跳转（onNavigate）
   全部由容器 App.tsx 注入，页面内不再有任何 fetch / react-router 依赖。 */

export interface HomeProps {
  profile: CareerProfile | null
  progress: ProgressSummary | null
  /** 容器侧任一数据源加载失败时的错误文案；有错优先展示错误页 */
  error?: string
  /** 画像服务降级返回了 MOCK（json.fallback=true）——数字不是真实画像 */
  degraded?: boolean
  onNavigate: (to: string) => void
}

/* 事件类型 -> 展示色。与进度页保持同一套映射。 */
const eventColors: Record<string, string> = {
  task_completed: 'blue',
  task_complete: 'blue',
  course_completed: 'cyan',
  project_completed: 'purple',
  skill_practice: 'green',
  inactivity: 'orange',
  profile_recalculated: 'purple',
  reminder_response: 'lime',
  plan_adjusted: 'gold',
  interview_result: 'magenta',
  application_submitted: 'volcano',
  job_saved: 'gold',
  job_viewed: 'geekblue',
  feedback_submitted: 'pink',
  project_started: 'green',
  course_started: 'cyan',
  skill_assessment: 'purple',
  onboarding: 'blue',
  manual_update: 'geekblue',
  scenario_complete: 'cyan',
  goal_changed: 'gold',
  consent_withdrawn: 'red',
}

/* 事件类型 -> 中文标签，避免直接暴露英文枚举（与进度页一致）。
   除演示用户 USER-G001 的 17 种外，补齐库内其余 5 种真实枚举
   （task_complete/manual_update/scenario_complete/goal_changed/consent_withdrawn）。 */
const eventLabels: Record<string, string> = {
  task_completed: '完成任务',
  task_complete: '完成任务',
  course_completed: '完成课程',
  project_completed: '完成项目',
  skill_practice: '技能练习',
  inactivity: '学习中辍',
  profile_recalculated: '画像重算',
  reminder_response: '响应提醒',
  plan_adjusted: '调整计划',
  interview_result: '面试反馈',
  application_submitted: '投递申请',
  job_saved: '收藏岗位',
  job_viewed: '浏览岗位',
  feedback_submitted: '提交反馈',
  project_started: '启动项目',
  course_started: '开始课程',
  skill_assessment: '能力测评',
  onboarding: '完成录入',
  manual_update: '手动更新',
  scenario_complete: '完成训练',
  goal_changed: '调整目标',
  consent_withdrawn: '撤回授权',
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

/* 后端分数为浮点数，统一保留 1 位并去掉多余 0（Number 归一，防止字符串/NaN 抛错） */
function fmtScore(value: number): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return '–'
  return String(Number(n.toFixed(1)))
}

function Home({ profile, progress, error = '', degraded = false, onNavigate }: HomeProps) {
  if (error) return <Alert type="error" showIcon title="总览加载失败" description={error} />
  if (!profile || !progress) return <div className="page-container"><Skeleton active paragraph={{ rows: 8 }} /></div>

  /* 最弱维度 —— 用作"下一步建议"的依据，避免写死文案。
     `?? []`：降级 MOCK / 后端字段缺失时 dimensions 可能不存在，裸 spread 会抛错。 */
  const weakest = [...(profile.dimensions ?? [])].sort((a, b) => a.score - b.score)[0]
  const activePath = progress.active_path
  const recentEvents = progress.recent_events.slice(0, 6)

  return (
    <div className="page-container">
      <h1 className="page-title">成长总览</h1>

      {/* 画像服务降级（200 + MOCK）时的醒目提示：下面的数字不是真实画像 */}
      {degraded && (
        <Alert
          type="warning"
          showIcon
          title="当前为降级模拟数据"
          description="画像服务暂时取不到数据库数据，已降级为服务端 MOCK 兜底，以下数字不代表真实画像；刷新后会自动重试。"
          style={{ marginBottom: 16 }}
        />
      )}

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
        title="当前为匿名模拟用户演示"
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
              styles={{ content: {  color: 'var(--color-primary)'  } }}
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
              styles={{ content: {  color: 'var(--color-success)'  } }}
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
              styles={{ content: {  color: 'var(--color-warning)'  } }}
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
            extra={<a onClick={() => onNavigate('/profile')}>查看详细画像 →</a>}
          >
            <RadarChart dimensions={profile.dimensions} height={330} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            className="card"
            title="学习路径进度"
            extra={<a onClick={() => onNavigate('/path')}>查看完整路径 →</a>}
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
                <a onClick={() => onNavigate('/path')}>去生成学习路径</a>
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
                      <Tag color={eventColors[event.event_type] || 'default'}>{eventLabels[event.event_type] || event.event_type}</Tag>
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
