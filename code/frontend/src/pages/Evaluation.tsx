import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Card, Col, Empty, Progress, Row, Skeleton, Space, Tag, Typography } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons'
import {
  EVALUATION_DIMENSIONS,
  scenarioApi,
  type Scenario,
  type ScenarioEvaluation,
} from '../services/api'
import { useIsMobile, useIsTabletOrBelow } from '../hooks/useBreakpoint'

const { Paragraph, Text, Title } = Typography

/* 五个评估维度的配色。刻意**不复用**画像那套 DIM_PALETTE ——
   两套维度体系完全不同（这里是 task_completion 等 5 个，画像那边是 DIM-01..08），
   共用调色板会让用户误以为「任务完成」就是画像里的某个 DIM。 */
const EVAL_PALETTE: Record<string, string> = {
  task_completion: '#1677FF',
  clarification: '#13C2C2',
  evidence_and_privacy: '#722ED1',
  collaboration: '#52C41A',
  reflection: '#FAAD14',
}

/* 后端分数为浮点数，统一保留 1 位并去掉多余 0，避免 75.36000000000001 这类噪声 */
function fmtScore(value: number): string {
  return Number(value.toFixed(1)).toString()
}

/* 分数分档：文档 3.8 用 77.5 作示例，这里是「优良 / 合格 / 待提升」的通俗分档。
   只影响文案与颜色，不参与任何计算。 */
function scoreTone(score: number): { color: string; label: string } {
  if (score >= 80) return { color: 'var(--color-success)', label: '表现优秀' }
  if (score >= 60) return { color: 'var(--color-primary)', label: '基本合格' }
  return { color: 'var(--color-warning)', label: '仍需提升' }
}

/* 导航时携带的上下文。只用于改善首屏体验（立即可渲染 + 显示场景标题），
   真正的持久化靠下面的 sessionStorage —— 刷新时路由 state 未必还在，见 readStored 的说明。 */
interface EvaluationNavState {
  evaluation?: ScenarioEvaluation
  scenarioTitle?: string
}

/* 评估结果**服务端不落库**（`update_applied` 恒为 false，也无回查接口），
   所以刷新后要恢复内容只能靠客户端自己存。用 sessionStorage 而非 localStorage：
   报告属于"当次会话产物"，关掉标签页就该消失，与后端的临时态语义一致。
   加前缀避免与其它键冲突。 */
const STORAGE_PREFIX = 'a02:evaluation:'

function readStored(scenarioId: string | undefined): ScenarioEvaluation | null {
  if (!scenarioId || typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + scenarioId)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ScenarioEvaluation
    /* 最小校验：确认是同一场景且形状正确，避免半截数据让页面白屏 */
    if (!parsed || parsed.scenario_id !== scenarioId || typeof parsed.overall_score !== 'number') {
      return null
    }
    return parsed
  } catch {
    /* 存的东西坏了就当作没有，不要让 JSON.parse 的异常冒到渲染层 */
    return null
  }
}

function writeStored(value: ScenarioEvaluation) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + value.scenario_id, JSON.stringify(value))
  } catch {
    /* 隐私模式/配额满时会抛异常。存不下只是丢刷新能力，不该影响正常浏览 */
  }
}

function Evaluation() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const navState = (location.state ?? {}) as EvaluationNavState
  /* 初始值优先取路由 state（从场景页跳进来时无需任何请求即可渲染）；
     拿不到就回退到 sessionStorage（刷新/回退时）—— 两条路都不会发请求。
     `useState` 初值只在首次挂载时求值，所以此处读一次即可，无需 effect。 */
  const [evaluation] = useState<ScenarioEvaluation | null>(
    () => navState.evaluation ?? readStored(id),
  )
  const [scenarioTitle, setScenarioTitle] = useState(navState.scenarioTitle ?? '')
  const [loadingTitle, setLoadingTitle] = useState(false)

  const isNarrow = useIsMobile()
  const isTabletOrBelow = useIsTabletOrBelow()

  /* 把本次结果写入 sessionStorage，使刷新/浏览器回退后仍能恢复。
     放在 effect 里而不是 useState 初始化器里 —— 初始化阶段不应产生副作用
     （StrictMode 下初始化器也会被双调用）。 */
  useEffect(() => {
    if (evaluation) writeStored(evaluation)
  }, [evaluation])

  /* 只补「场景标题」这一件事 —— 它是唯一能在刷新后重新取回的缺失信息
     （评估结果本身服务端不落库，见 update_applied 恒 false，无法回查）。
     这里用列表接口按 id 反查，避免再引一个单场景详情接口。 */
  useEffect(() => {
    if (scenarioTitle || !evaluation?.scenario_id) return
    let cancelled = false
    setLoadingTitle(true)
    scenarioApi
      .list()
      .then((result) => {
        if (cancelled) return
        const found: Scenario | undefined = result.scenarios.find(
          (item) => item.scenario_id === evaluation.scenario_id,
        )
        if (found) setScenarioTitle(found.title)
      })
      /* 标题取不到不影响主内容（分数、维度、建议都在 state 里），静默即可，不打扰用户 */
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoadingTitle(false)
      })
    return () => {
      cancelled = true
    }
  }, [evaluation, scenarioTitle])

  /* 维度归一化：五个维度满分不同（25/20/20/20/15），
     雷达图必须按各自 max_score 折算成百分制，否则「反思 15/15」看起来会比
     「任务完成 25/25」小一圈 —— 两者其实都是满分。
     同时导出列表用的原始分/满分用于展示「18 / 25」这种更好读的形式。 */
  const dimensionRows = useMemo(() => {
    if (!evaluation) return []
    return EVALUATION_DIMENSIONS.map((meta) => {
      const hit = evaluation.dimensions?.[meta.key]
      const score = hit?.score ?? 0
      const maxScore = hit?.max_score ?? meta.maxScore
      return {
        key: meta.key,
        label: meta.label,
        score,
        maxScore,
        percent: maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(1)) : 0,
        color: EVAL_PALETTE[meta.key] ?? '#1677FF',
      }
    })
  }, [evaluation])

  if (!evaluation) {
    /* 真的没有数据时的降级：只会在「换一个浏览器/关掉标签页后拿链接直接打开」出现，
       因为正常刷新由 sessionStorage 兜住了。给出可执行的下一步，而不是只说"数据不存在"。 */
    return (
      <div className="page-container">
        <h1 className="page-title">训练评估报告</h1>
        <Card className="card">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text>本次评估结果未能恢复</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  评估结果不会保存到服务器，仅保留在当次浏览器会话中
                  {id ? `（报告编号 ${id}）` : ''}。
                  关闭标签页或更换浏览器后再打开本链接，就会看到这个提示。
                </Text>
              </Space>
            }
          >
            <Space>
              <a onClick={() => navigate('/scenario')}>回到场景训练</a>
              <a onClick={() => navigate('/progress')}>查看学习进度</a>
            </Space>
          </Empty>
        </Card>
      </div>
    )
  }

  const tone = scoreTone(evaluation.overall_score)
  const radarValues = dimensionRows.map((row) => row.percent)

  /* 雷达图的轴名都是 4~5 个汉字。实测 canvas 宽度低于约 300px 时，
     `overflow: 'none'` 会让轴名被画布边缘裁掉（1024px 断点下 canvas 仅 ~290px、
     轴名「需求澄清」被切成「求澄清」「反思复盘」被切成「反思复」）。
     低于阈值时改用换行 + 更小字号，并把图形半径收一点，给标签留出空间。 */
  const radarBoxRef = useRef<HTMLDivElement | null>(null)
  const [radarWidth, setRadarWidth] = useState(0)

  useEffect(() => {
    const el = radarBoxRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      setRadarWidth(entries[0]?.contentRect.width ?? 0)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* 容器宽度测量出来之前（首帧）按「不折行」渲染，测量后立即修正 */
  const radarTight = radarWidth > 0 && radarWidth < 300

  const radarOption = {
    radar: {
      indicator: dimensionRows.map((row) => ({ name: row.label, max: 100 })),
      shape: 'polygon' as const,
      splitNumber: 5,
      /* 五个维度的名字都是 4~5 字（「证据与隐私」5 字），比画像的 9 字短得多，
         不需要折行处理，半径可以放得更饱满 —— 但窄容器时反过来要收半径。 */
      radius: radarTight ? '52%' : isTabletOrBelow ? '62%' : '70%',
      center: ['50%', '52%'],
      axisName: {
        color: '#595959',
        fontSize: radarTight ? 10 : isNarrow ? 11 : isTabletOrBelow ? 12 : 13,
        /* 窄容器下允许在标签内部换行，避免被画布裁切 */
        overflow: radarTight ? ('break' as const) : ('none' as const),
        width: radarTight ? 48 : undefined,
        lineHeight: 14,
      },
      splitLine: { lineStyle: { color: '#E8E8E8' } },
      splitArea: { show: false },
    },
    series: [
      {
        type: 'radar' as const,
        data: [
          {
            value: radarValues,
            name: '本次得分',
            areaStyle: { color: 'rgba(22, 119, 255, 0.15)' },
            lineStyle: { color: '#1677FF', width: 2 },
            itemStyle: { color: '#1677FF' },
          },
        ],
      },
    ],
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: '#FFFFFF',
      borderColor: '#F0F0F0',
      textStyle: { color: '#1F1F1F', fontSize: 12 },
      extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 8px;',
      /* 悬浮显示**原始分/满分**而非归一化后的百分比 —— 用户看到 100 分会以为满分 100，
         但「反思」满分其实只有 15。用原始分才不会被误读。 */
      formatter: () => {
        const rows = dimensionRows
          .map(
            (row) => `
          <div style="display:flex;align-items:center;gap:8px;padding:3px 0;">
            <span style="width:8px;height:8px;border-radius:50%;background:${row.color};flex:0 0 auto;"></span>
            <span style="flex:1 1 auto;white-space:nowrap;color:#1F1F1F;">${row.label}</span>
            <span style="font-weight:600;color:${row.color};font-variant-numeric:tabular-nums;">${fmtScore(row.score)} / ${row.maxScore}</span>
          </div>`,
          )
          .join('')
        return `<div style="min-width:210px;">
          <div style="font-weight:600;margin-bottom:6px;color:#1F1F1F;">本次得分</div>
          ${rows}
        </div>`
      },
    },
    animationDuration: 800,
    animationEasing: 'cubicOut' as const,
  }

  /* 手机档给 canvas 确定高度（同 RadarChart 踩过的坑：父级算不出高度时 canvas 为 0）。
     大屏下改为 100% 撑满卡片 —— 右卡片（本次成绩）内容多少会影响等高拉伸后的实际高度，
     写死 340px 会在卡片被拉高时于图表下方留下大片空洞。 */
  const chartHeight = isNarrow ? 300 : '100%'

  return (
    <div className="page-container">
      <div className="page-head">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          训练评估报告
          {scenarioTitle ? <Text type="secondary" style={{ fontSize: 15 }}> · {scenarioTitle}</Text> : null}
        </h1>
        <Space>
          <Tag color={evaluation.overall_score >= 80 ? 'green' : evaluation.overall_score >= 60 ? 'blue' : 'orange'} style={{ marginInlineEnd: 0 }}>
            {tone.label}
          </Tag>
          <a onClick={() => navigate('/scenario')}>
            <ReloadOutlined /> 再来一次
          </a>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        message="分数口径"
        description={evaluation.evaluation_rule}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }} className="row-equal-height">
        <Col xs={24} lg={12}>
          <Card className="card" title="能力评估雷达图">
            <div ref={radarBoxRef} className="radar-box">
              <ReactECharts option={radarOption} style={{ height: chartHeight, width: '100%' }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            className="card"
            title="本次成绩"
            extra={
              <Text strong style={{ fontSize: 16, color: tone.color }}>
                {fmtScore(evaluation.overall_score)} / 100
              </Text>
            }
          >
            {/* 卡片在 lg 档与雷达图等高，雷达图（约 300px）通常更高，
                内容若单纯顶对齐会在底部留出近 300px 空白。
                这里让两块标签区各自吸收剩余空间（flex:1），空白均匀分布在
                两段之间，视觉上更接近「卡片被填满」。 */}
            <Progress
              percent={evaluation.overall_score}
              strokeColor={tone.color}
              style={{ marginBottom: 12 }}
            />

            {/* 扣分项：只在真的扣了分时才出现，避免 0 分噪音 */}
            {evaluation.penalty > 0 && (
              <Alert
                type="error"
                showIcon
                icon={<WarningOutlined />}
                message={`风险行为扣分 −${evaluation.penalty}`}
                description={
                  <div>
                    {evaluation.red_flag_hits.map((item) => (
                      <Tag color="red" key={item} style={{ marginBottom: 4 }}>
                        {item}
                      </Tag>
                    ))}
                  </div>
                }
                style={{ marginBottom: 12 }}
              />
            )}

            <div className="score-block">
              <Text strong style={{ color: 'var(--color-success)' }}>
                <CheckCircleOutlined /> 已覆盖（{evaluation.matched_expected_actions.length}）
              </Text>
              <div style={{ marginTop: 8 }}>
                {evaluation.matched_expected_actions.length ? (
                  evaluation.matched_expected_actions.map((item) => (
                    <Tag color="green" key={item} style={{ marginBottom: 6 }}>
                      {item}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">本次未命中任何预期行为，建议重读场景要求</Text>
                )}
              </div>
            </div>

            <div className="score-block">
              <Text strong style={{ color: 'var(--color-warning)' }}>
                <WarningOutlined /> 待改进（{evaluation.missing_expected_actions.length}）
              </Text>
              <div style={{ marginTop: 8 }}>
                {evaluation.missing_expected_actions.length ? (
                  evaluation.missing_expected_actions.map((item) => (
                    <Tag color="orange" key={item} style={{ marginBottom: 6 }}>
                      {item}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">预期行为已全部覆盖</Text>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 维度明细：展示**原始分 / 满分**，与雷达图的归一化值互为补充 */}
      <Card className="card" title="维度明细" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {dimensionRows.map((row) => (
            <Col xs={24} sm={12} lg={8} key={row.key}>
              <div className="dim-item">
                <div className="dim-item-head">
                  <span>
                    <span className="dim-dot" style={{ background: row.color }} />
                    {row.label}
                  </span>
                  <Text strong>
                    {fmtScore(row.score)} <Text type="secondary" style={{ fontWeight: 400 }}>/ {row.maxScore}</Text>
                  </Text>
                </div>
                <Progress percent={row.percent} showInfo={false} strokeColor={row.color} />
                <div className="dim-item-meta">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    达成率 {fmtScore(row.percent)}%
                  </Text>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card className="card" title="改进建议">
            {evaluation.improvement_suggestions.length ? (
              <ol style={{ margin: 0, paddingInlineStart: 20 }}>
                {evaluation.improvement_suggestions.map((item) => (
                  <li key={item} style={{ marginBottom: 6 }}>
                    {item}
                  </li>
                ))}
              </ol>
            ) : (
              <Text type="secondary">本次没有需要补充的要点</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="card" title="你的回答" extra={<Text type="secondary" style={{ fontSize: 12 }}>前 300 字</Text>}>
            <Paragraph type="secondary" style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
              {evaluation.evidence_excerpt || '（无回答内容）'}
            </Paragraph>
          </Card>
        </Col>
      </Row>

      <Card className="card" title="能力变化建议">
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          以下增量仅为<Text strong>建议值</Text>，尚未写入你的职业画像 —— 需在「学习进度」中确认后才会生效。
        </Paragraph>
        {evaluation.proposed_profile_updates.length ? (
          <Row gutter={[16, 16]}>
            {evaluation.proposed_profile_updates.map((item) => (
              <Col xs={24} sm={12} key={item.dimension_id}>
                <div className="dim-item">
                  <div className="dim-item-head">
                    <span>{item.dimension_id}</span>
                    <Text strong style={{ color: item.suggested_delta > 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                      {item.suggested_delta > 0 ? `+${item.suggested_delta}` : '±0'}
                    </Text>
                  </div>
                  <div className="dim-item-meta">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.reason}
                    </Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Text type="secondary">本次没有产生能力变化建议</Text>
        )}
        {loadingTitle && (
          <div style={{ marginTop: 12 }}>
            <Skeleton.Input active size="small" />
          </div>
        )}
      </Card>

      {/* 合规提示：与其它页面口径一致，明确这是合成数据演示 */}
      <Card className="card" style={{ marginTop: 16 }}>
        <Title level={5} style={{ marginTop: 0 }}>
          <ClockCircleOutlined /> 说明
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          本报告基于合成模拟数据生成，评分仅用于演示训练流程，不代表真实的能力测评结论。
          评估结果不做持久化保存，离开本页后需重新训练才能再次生成。
        </Paragraph>
      </Card>
    </div>
  )
}

export default Evaluation
