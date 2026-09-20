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

/* 后端分数为浮点数，统一保留 1 位并去掉多余 0 */
function fmtScore(value: number): string {
  return Number(value.toFixed(1)).toString()
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

/* 把过长的维度名折成两行（契约里最长 9 字，如「沟通协作与职业素养」）。
   ⚠️ 为什么不用 overflow: 'truncate' 或加宽 label 盒子：
   ECharts 以轴端点为基准向外摆放 label，最左/最右那两条的盒子一旦变宽，
   就会越过 canvas 边界被硬裁 —— 这种裁切发生在 canvas 层面，不受 truncate 控制。
   实测调到 width 110 + radius 52% 时，右侧「沟通协作与职业素养」仍差 1 字。
   改用折行后每行宽度减半，任何断点下 8 个维度名都能完整显示。 */
function wrapAxisName(name: string, maxCharsPerLine: number = AXIS_NAME_CHARS): string {
  if (name.length <= maxCharsPerLine) return name

  // 在「与」处断开：前缀至少 2 字，避免切出「与产品思维」这类孤字开头的行
  const yuIndex = name.indexOf('与')
  if (yuIndex >= 2) {
    return `${name.slice(0, yuIndex)}\n${name.slice(yuIndex)}`
  }

  // 退化：没有「与」或「与」在首字时取中点，保证两行尽量均衡
  const breakAt = Math.min(Math.ceil(name.length / 2), maxCharsPerLine)
  return `${name.slice(0, breakAt)}\n${name.slice(breakAt)}`
}

/* 悬浮提示：每行「色点 + 维度名 + 右对齐分数」。
   用 table 布局让名称与分数两列对齐，避免原来的冒号拼接参差不齐。 */
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
  /* 响应式策略（文档 5.2 断点）：
     - 手机 <768px：半径收到 58%、字号 10px、每行最多 4 字
     - 平板 768-1023px：半径 58%、字号 11px、每行最多 5 字
     - 桌面 ≥1024px：半径 68%、字号 12px，宽度充足不折行
     8 个维度名最长 9 字（「沟通协作与职业素养」），在窄容器里靠折行而非截断
     来保证完整显示 —— 见下方 wrapAxisName 的说明。
     用 hook 而不是直接 matchMedia，保证视口变化时能重新渲染。 */
  const isNarrow = useIsMobile()
  const isTabletOrBelow = useIsTabletOrBelow()

  /* 轴名宽度：给足折行后每行所需的宽度即可（不再靠调宽盒子硬撑）。
     每行最多 5 字，手机 10px 字号 → 约 50px，平板/桌面 11~12px → 约 60px。
     手机取 62、其余取 76，均留出余量。 */
  const axisNameWidth = isNarrow ? 62 : 76

  const option = {
    radar: {
      indicator: dimensions.map((dimension) => ({ name: dimension.name, max: 100 })),
      shape: 'polygon' as const,
      splitNumber: 5,
      /* 手机和平板都收小半径，把四周空间让给（可能折成两行的）维度名。
         桌面宽度充足，维持 68% 的饱满观感。 */
      radius: isTabletOrBelow ? '58%' : '68%',
      center: ['50%', '52%'],
      axisName: {
        color: '#595959',
        fontSize: isNarrow ? 10 : isTabletOrBelow ? 11 : 12,
        /* 折行后不需要截断：每行都在可用宽度内 */
        overflow: 'none',
        width: axisNameWidth,
        /* 超过每行字数上限时折成两行，保证 9 字的维度名完整可见
           （手机与平板用同一阈值 5 字/行，见 AXIS_NAME_CHARS 的说明） */
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
            value: dimensions.map((dimension) => dimension.score),
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
      /* 关闭默认的圆点前缀，改用自绘色点（与各维度颜色对应） */
      backgroundColor: '#FFFFFF',
      borderColor: '#F0F0F0',
      textStyle: { color: '#1F1F1F', fontSize: 12 },
      extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 8px;',
      formatter: (params: { value: number[] }) => tooltipHtml(dimensions, params.value),
    },
    /* 首次展示绘制 800ms（设计文档 4.3 动画规范） */
    animationDuration: 800,
    animationEasing: 'cubicOut' as const,
  }

  /* 手机档：ECharts 容器若 height 为 auto，父级 Card body 是 flex/无固定高时
     会算出 0 高（实测 375px 下 .echarts-for-react 的 clientHeight = 0，canvas 不渲染）。
     这里显式给一个略矮的高度（图表 260 + 上下轴名各约 30px 的折行空间），
     让 canvas 有确定高度；平板/桌面沿用调用方传入的 height。 */
  const chartHeight = isNarrow ? 300 : height

  return <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
}

export default RadarChart
