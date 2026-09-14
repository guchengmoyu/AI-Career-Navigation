import ReactECharts from 'echarts-for-react'

interface TrendChartProps {
  height?: number
}

// TODO: 替换为 API 实际返回的趋势数据
const mockTrendData = {
  dates: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
  series: [
    { name: '专业技能', color: '#1677FF', data: [45, 48, 52, 58, 62, 68, 72, 75] },
    { name: '软技能', color: '#52C41A', data: [40, 42, 43, 48, 50, 55, 58, 60] },
    { name: '领导力', color: '#FAAD14', data: [30, 30, 32, 35, 38, 40, 42, 45] },
    { name: '创新力', color: '#722ED1', data: [50, 52, 55, 58, 60, 63, 66, 70] },
    { name: '学习力', color: '#13C2C2', data: [55, 58, 62, 65, 68, 72, 76, 80] },
  ],
}

function TrendChart({ height = 300 }: TrendChartProps) {
  const option = {
    tooltip: { trigger: 'axis' },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 12 },
    },
    grid: { top: 16, right: 16, bottom: 40, left: 40 },
    xAxis: {
      type: 'category' as const,
      data: mockTrendData.dates,
      axisLine: { lineStyle: { color: '#D9D9D9' } },
      axisLabel: { color: '#8C8C8C' },
    },
    yAxis: {
      type: 'value' as const,
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F0F0F0' } },
      axisLabel: { color: '#8C8C8C' },
    },
    series: mockTrendData.series.map((s) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: s.color, width: 2 },
      itemStyle: { color: s.color },
    })),
  }

  return <ReactECharts option={option} style={{ height }} />
}

export default TrendChart
