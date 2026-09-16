import ReactECharts from 'echarts-for-react'

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
  const option = {
    radar: {
      indicator: dimensions.map((dimension) => ({ name: dimension.name, max: 100 })),
      shape: 'polygon' as const,
      splitNumber: 5,
      axisName: { color: '#595959', fontSize: 12 },
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

  return <ReactECharts option={option} style={{ height }} />
}

export default RadarChart
