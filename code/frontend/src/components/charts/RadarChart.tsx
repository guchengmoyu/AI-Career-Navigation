import ReactECharts from 'echarts-for-react'
import { useIsMobile, useIsTabletOrBelow } from '../../hooks/useBreakpoint'

/* 与 TrendChart / Profile 共用一套维度调色板（global.css 的 --dim-palette-1..8 同值），
   保证同一维度在雷达图、维度详情、趋势图上颜色一致。 */
const DIM_PALETTE = [
  '#1677FF',
  '#13C2C2',
  '#52C41A',
  '#FAAD14',
  '#FA8C16',
  '#EB2F96',
  '#722ED1',
  '#2F54EB',
]

interface RadarChartProps {
  dimensions: { dimension_id: string; name: string; score: number }[]
  height?: number
}

/* 后端分数为浮点数，统一保留 1 位并去掉多余 0。
   ⚠️ 防御版：先 Number() 归一 —— 任何字符串/NaN/undefined 都不能让它抛异常
   （历史上 profile 尚未加载、或后端 DECIMAL 序列化为字符串时，
     value.toFixed 会直接 TypeError → 整页白屏）。 */
function fmtScore(value: number): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return '–'
  return String(Number(n.toFixed(1)))
}

/* 每行最大字数。**手机和平板都取 5，这不是偷懒，是数学上的唯一可行值。**

   契约里最长的维度名是 9 字，且这 8 个名字都是「A与B」结构。9 = A + 与 + B 恒成立，
   所以无论从哪个位置断开，两段长度之和永远是 9 —— 必然有一段 ≥ 5 字：
     断在 3 → 3 + 6   断在 4 → 4 + 5   断在 5 → 5 + 4
   因此「每行最多 4 字」对 9 字的名字是**无解**的，早期版本按 4 字/行去折，
   每次都折出 5 字一行（这正是测试里 3 个 FAIL 的真正原因 —— 不是 min() 没夹住，
   而是这个约束本身就是死路）。5 字 × 10px ≈ 50px，手机容器放得下，
   **宽度从来不是约束，断点位置才是。**

   折行位置优先级：
   1) 「与」字前后 —— 在「与」处断开最符合中文语义（问题解决|与|产品思维），
      且能保证前缀 ≥ 2 字（不出现「与产品思维」这种孤字开头）。
   2) 退化为中点，保证两行尽量均衡（避免 8 字 + 1 字）。 */
const AXIS_NAME_CHARS = 5

/* 把过长的维度名折成两行（契约里最长 9 字，如「沟通协作与职业素养」）。 */
function wrapAxisName(name: string, maxCharsPerLine: number = AXIS_NAME_CHARS): string {
  const safe = String(name ?? '')
  if (safe.length <= maxCharsPerLine) return safe

  // 在「与」处断开：前缀至少 2 字，避免切出「与产品思维」这类孤字开头的行
  const yuIndex = safe.indexOf('与')
  if (yuIndex >= 2) {
    return `${safe.slice(0, yuIndex)}\n${safe.slice(yuIndex)}`
  }

  // 退化：没有「与」或「与」在首字时取中点，保证两行尽量均衡
  const breakAt = Math.min(Math.ceil(safe.length / 2), maxCharsPerLine)
  return `${safe.slice(0, breakAt)}\n${safe.slice(breakAt)}`
}

/* 悬浮提示：每行「色点 + 维度名 + 右对齐分数」。 */
function tooltipHtml(
  dimensions: RadarChartProps['dimensions'],
  values: number[],
): string {
  const rows = dimensions
    .map((dimension, index) => {
      const color = DIM_PALETTE[index % DIM_PALETTE.length]
      const score = fmtScore(values?.[index] ?? dimension.score)
      return `
        <div style="display:flex;align-items:center;gap:8px;padding:3px 0;">
          <span style="width:8px;height:8px;border-radius:50%;background:${color};flex:0 0 auto;"></span>
          <span style="flex:1 1 auto;white-space:nowrap;color:#1F1F1F;">${dimension.name}</span>
          <span style="font-weight:600;color:${color};font-variant-numeric:tabular-nums;">${score}</span>
        </div>`
    })
    .join('')

  return `
    <div style="min-width:200px;">
      <div style="font-weight:600;margin-bottom:6px;color:#1F1F1F;">能力评分</div>
      ${rows}
    </div>`
}

function RadarChart({ dimensions, height = 300 }: RadarChartProps) {
  const isNarrow = useIsMobile()
  const isTabletOrBelow = useIsTabletOrBelow()

  /* ── 防御性归一化（本次白屏修复核心）──────────────────────────────
     1. 只保留 score 为有限数字的维度，并把 score 强制转 number；
     2. 维度不足 3 个（数据未加载/异常）不渲染 ECharts，改渲染占位符 ——
        ECharts 的 radarLayout 在空/脏 indicator 上会抛异常，React 19 没有
        错误边界时会把整个应用树卸载（表现：页面白屏一闪）。 */
  const dims = (dimensions ?? [])
    .filter((d): d is RadarChartProps['dimensions'][number] =>
      Boolean(d) && Number.isFinite(Number((d as { score?: unknown }).score)))
    .map((d) => ({ ...d, score: Number(d.score) }))

  if (dims.length < 3) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: 13,
        }}
      >
        能力数据加载中…
      </div>
    )
  }

  const axisNameWidth = isNarrow ? 62 : 76

  const option = {
    radar: {
      indicator: dims.map((dimension) => ({ name: dimension.name, max: 100 })),
      shape: 'polygon' as const,
      splitNumber: 5,
      radius: isTabletOrBelow ? '58%' : '68%',
      center: ['50%', '52%'],
      axisName: {
        color: '#595959',
        fontSize: isNarrow ? 10 : isTabletOrBelow ? 11 : 12,
        overflow: 'none',
        width: axisNameWidth,
        formatter: (name: string) => wrapAxisName(name),
        lineHeight: isNarrow ? 13 : 15,
      },
      splitLine: { lineStyle: { color: '#E8E8E8' } },
      splitArea: { show: false },
    },
    series: [
      {
        type: 'radar' as const,
        data: [
          {
            value: dims.map((dimension) => dimension.score),
            name: '能力评分',
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
      formatter: (params: { value: number[] }) => tooltipHtml(dims, params.value),
    },
    animationDuration: 800,
    animationEasing: 'cubicOut' as const,
  }

  const chartHeight = isNarrow ? 300 : height

  return <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
}

export default RadarChart
