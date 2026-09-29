import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Card, Col, Empty, Progress, Row, Space, Tag, Typography } from 'antd'
import ReactECharts from 'echarts-for-react'
import { CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons'
import { EVALUATION_DIMENSIONS, type ScenarioEvaluation } from '../services/types'
import { useIsMobile, useIsTabletOrBelow } from '../hooks/useBreakpoint'

const { Paragraph, Text, Title } = Typography

/* P1：本页改为纯受控组件 —— 评估结果与场景标题由容器注入
   （reportId/evaluation/scenarioTitle），跳转走 onNavigate。
   react-router 的 useParams/useLocation 与 sessionStorage 读写全部上移到容器：
   容器优先用「场景页刚传来的结果」，刷新/深链时回退到 sessionStorage 恢复。
   ⚠️ 所有 hooks 已移到条件 return **之前** —— 旧版 useRef/useState 在
   `if (!evaluation) return` 之后，一旦 evaluation 由空变有会触发
   "Rendered more hooks than during the previous render" 崩溃。 */

export interface EvaluationProps {
  /** 报告编号（原路由参数 /evaluation/:id，即 scenario_id） */
  reportId: string
  /** 评估结果；null = 未能恢复（容器的内存态与 sessionStorage 都没有） */
  evaluation: ScenarioEvaluation | null
  scenarioTitle?: string
  onNavigate: (to: string) => void
}

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

function Evaluation({ reportId, evaluation, scenarioTitle = '', onNavigate }: EvaluationProps) {
  const isNarrow = useIsMobile()
  const isTabletOrBelow = useIsTabletOrBelow()

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

  /* 雷达图容器宽度测量（钩子必须无条件调用，置于条件 return 之前）。
     实测 canvas 宽度低于约 300px 时，`overflow: 'none'` 会让轴名被画布边缘裁掉
     （1024px 断点下 canvas 仅 ~290px、轴名「需求澄清」被切成「求澄清」）。
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

  if (!evaluation) {
    /* 真的没有数据时的降级：只会在「换一个浏览器/关掉标签页后拿链接直接打开」出现，
       因为正常刷新由容器的 sessionStorage 兜住了。给出可执行的下一步，而不是只说"数据不存在"。 */
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
                  {reportId ? `（报告编号 ${reportId}）` : ''}。
                  关闭标签页或更换浏览器后再打开本链接，就会看到这个提示。
                </Text>
              </Space>
            }
          >
            <Space>
              <a onClick={() => onNavigate('/scenario')}>回到场景训练</a>
              <a onClick={() => onNavigate('/progress')}>查看学习进度</a>
            </Space>
          </Empty>
        </Card>
      </div>
    )
  }

  const tone = scoreTone(evaluation.overall_score)
  const radarValues = dimensionRows.map((row) => row.percent)

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
          <a onClick={() => onNavigate('/scenario')}>
            <ReloadOutlined /> 再来一次
          </a>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        title="分数口径"
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
                title={`风险行为扣分 −${evaluation.penalty}`}
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
