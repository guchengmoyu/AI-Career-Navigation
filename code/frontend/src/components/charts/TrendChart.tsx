import ReactECharts from 'echarts-for-react'

/* 与 RadarChart 共用一套维度调色板（global.css 的 --dim-palette-1..8 同值），
   保证同一维度在雷达图与趋势图上颜色一致。 */
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

export interface TrendSeries {
  /** 维度名称，如「编程与计算基础」 */
  name: string
  /** 与 xAxis 等长的分数序列 */
  data: number[]
}

interface TrendChartProps {
  /** 横轴刻度，如 ['W1','W2',...] */
  categories: string[]
  /** 各维度随时间的分数变化 */
  series: TrendSeries[]
  height?: number
  /** 只展示前 N 条曲线，避免 8 维全画导致图例拥挤 */
  limit?: number
}

/* 能力变化折线图（设计文档 3.4：展示成长轨迹）。
   数据由调用方传入 —— 后端契约当前没有历史趋势接口，
   故本组件不做任何 mock，缺数据时应由父组件决定不渲染。 */
function TrendChart({ categories, series, height = 300, limit = 4 }: TrendChartProps) {
  const shown = series.slice(0, limit)
  const maxValue = Math.max(100, ...shown.flatMap((item) => item.data))

  const option = {
    tooltip: { trigger: 'axis' },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 12 },
      /* 维度名较长，图例换行展示 */
      type: 'scroll',
    },
    grid: { top: 16, right: 24, bottom: 48, left: 44 },
    xAxis: {
      type: 'category' as const,
      data: categories,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#D9D9D9' } },
      axisLabel: { color: '#8C8C8C' },
    },
    yAxis: {
      type: 'value' as const,
      max: maxValue,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F0F0F0' } },
      axisLabel: { color: '#8C8C8C' },
    },
    series: shown.map((item, index) => {
      const color = DIM_PALETTE[index % DIM_PALETTE.length]
      return {
        name: item.name,
        type: 'line',
        data: item.data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color, width: 2 },
        itemStyle: { color },
        /* 首次展示时 800ms 绘制（设计文档 4.3 动画规范） */
        animationDuration: 800,
        animationEasing: 'cubicOut' as const,
      }
    }),
  }

  return <ReactECharts option={option} style={{ height }} />
}

export default TrendChart
