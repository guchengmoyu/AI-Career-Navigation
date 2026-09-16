import { useEffect, useState } from 'react'
import { Alert, Card, Col, List, message, Progress, Row, Skeleton, Space, Tag, Typography } from 'antd'
import { ReloadOutlined, ShareAltOutlined } from '@ant-design/icons'
import RadarChart from '../components/charts/RadarChart'
import { DEMO_USER_ID, profileApi, type CareerProfile } from '../services/api'

const { Paragraph, Text } = Typography

/* 与 RadarChart / TrendChart 同一套维度调色板 */
const DIM_PALETTE = [
  '#1677FF', '#13C2C2', '#52C41A', '#FAAD14',
  '#FA8C16', '#EB2F96', '#722ED1', '#2F54EB',
]

/* 后端分数为浮点数，统一保留 1 位并去掉多余 0，避免 75.36000000000001 这类噪声 */
function fmtScore(value: number): string {
  return Number(value.toFixed(1)).toString()
}

function Profile() {
  const [profile, setProfile] = useState<CareerProfile | null>(null)
  const [error, setError] = useState('')
  /* antd 6 的 message 需要挂一个 contextHolder 才能继承 ConfigProvider 的主题与中文语境，
     直接用静态 `message.xxx` 会告警且拿不到主题。 */
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    profileApi.get(DEMO_USER_ID).then(setProfile).catch((reason: Error) => setError(reason.message))
  }, [])

  if (error) return <Alert type="error" showIcon message="画像加载失败" description={error} />
  if (!profile) return <div className="page-container"><Skeleton active paragraph={{ rows: 10 }} /></div>

  const sorted = [...profile.dimensions].sort((a, b) => b.score - a.score)

  return (
    <div className="page-container">
      {contextHolder}
      {/* 页头：标题 + 操作位（文档 3.4：[重新测评] [分享]） */}
      <div className="page-head">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          职业画像
        </h1>
        <Space>
          <Tag color="blue" style={{ marginInlineEnd: 0 }}>
            人格码 {profile.persona_code}
          </Tag>
          <a onClick={() => window.location.reload()}>
            <ReloadOutlined /> 重新测评
          </a>
          <a
            onClick={() => {
              /* 原来的实现是 `void navigator.clipboard?.writeText(...)`：
                 一是复制成功后**没有任何反馈**（用户以为按钮坏了），
                 二是剪贴板 API 在非 HTTPS / 无权限时**静默失败**，同样毫无提示。
                 这里补上两条：成功给成功提示，失败则兜底为"手动复制"提示框。 */
              const copy = async () => {
                try {
                  /* navigator.clipboard 在非安全上下文（http 且非 localhost）下为 undefined */
                  if (!navigator.clipboard) throw new Error('clipboard unavailable')
                  await navigator.clipboard.writeText(window.location.href)
                  messageApi.success('画像链接已复制到剪贴板')
                } catch {
                  messageApi.warning('当前环境不支持自动复制，请手动复制地址栏链接')
                }
              }
              void copy()
            }}
          >
            <ShareAltOutlined /> 分享
          </a>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        message="模拟数据演示"
        description={profile.disclaimer}
        style={{ marginBottom: 16 }}
      />

      {/* 核心区：雷达图 + 右侧文字解读（文档 3.4 左右分栏）
          两卡等高，避免右侧内容较短时下方留出大片空白 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }} className="row-equal-height">
        <Col xs={24} lg={12}>
          <Card className="card" title="八维能力雷达图">
            <RadarChart dimensions={profile.dimensions} height={380} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            className="card"
            title="综合解读"
            extra={<Text strong style={{ fontSize: 16 }}>{fmtScore(profile.overall_score)} / 100</Text>}
          >
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ color: 'var(--color-success)' }}>
                优势
              </Text>
              <div style={{ marginTop: 8 }}>
                {profile.strengths.length ? (
                  profile.strengths.map((item) => (
                    <Tag color="green" key={item} style={{ marginBottom: 6 }}>
                      {item}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">暂无</Text>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ color: 'var(--color-warning)' }}>
                待提升
              </Text>
              <div style={{ marginTop: 8 }}>
                {profile.improvement_priorities.length ? (
                  profile.improvement_priorities.map((item) => (
                    <Tag color="orange" key={item} style={{ marginBottom: 6 }}>
                      {item}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">暂无</Text>
                )}
              </div>
            </div>

            <div>
              <Text strong>推荐方向（模拟）</Text>
              <List
                size="small"
                style={{ marginTop: 8 }}
                dataSource={profile.role_matches}
                renderItem={(item) => (
                  <List.Item>
                    <span>
                      {item.rank}. {item.name}
                    </span>
                    <Text type="secondary">匹配 {fmtScore(item.match_score)}%</Text>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 维度详情：按分数降序，用同一套调色板与雷达图呼应 */}
      <Card className="card" title="维度详情" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {sorted.map((dimension, index) => (
            <Col xs={24} sm={12} lg={8} key={dimension.dimension_id}>
              <div className="dim-item">
                <div className="dim-item-head">
                  <span>
                    <span
                      className="dim-dot"
                      style={{ background: DIM_PALETTE[index % DIM_PALETTE.length] }}
                    />
                    {dimension.name}
                  </span>
                  <Text strong>{fmtScore(dimension.score)}</Text>
                </div>
                <Progress
                  percent={dimension.score}
                  showInfo={false}
                  strokeColor={DIM_PALETTE[index % DIM_PALETTE.length]}
                />
                <div className="dim-item-meta">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dimension.dimension_id} · 证据 {dimension.evidence_count} 项 · 置信度{' '}
                    {dimension.confidence.toFixed(2)}
                  </Text>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* AI 深度分析（文档 3.4：底部用自然语言解读数据） */}
      <Card className="card" title="AI 深度分析">
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          以下解读基于当前八维评分自动生成，仅供参考。
        </Paragraph>
        <Paragraph style={{ marginBottom: 8 }}>
          你在「{sorted[0].name}」维度得分最高（{fmtScore(sorted[0].score)}{' '}
          分），这是当前最可依赖的能力基础；而「{sorted[sorted.length - 1].name}」相对薄弱（
          {fmtScore(sorted[sorted.length - 1].score)} 分），建议优先安排训练。
        </Paragraph>
        <Text strong>建议重点提升：</Text>
        <ol style={{ margin: '8px 0 0', paddingInlineStart: 20 }}>
          {profile.improvement_priorities.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </Card>
    </div>
  )
}

export default Profile
