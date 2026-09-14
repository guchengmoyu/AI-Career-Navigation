import ReactECharts from 'echarts-for-react'

interface HeatMapChartProps {
  height?: number
}

function getVirtualData(): [string, number][] {
  // 生成近 12 周（84 天）的模拟学习活跃度数据
  const data: [string, number][] = []
  const today = new Date()
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    // 随机生成 0-5 的学习活跃度，周末概率更高
    const day = d.getDay()
    const base = (day === 0 || day === 6) ? 3 : 1
    const value = Math.floor(Math.random() * (base + 2))
    data.push([dateStr, value])
  }
  return data
}

function HeatMapChart({ height = 200 }: HeatMapChartProps) {
  const data = getVirtualData()

  const option = {
    tooltip: {
      formatter: (params: { value: [string, number] }) => {
        return `${params.value[0]}<br/>学习活跃度: ${params.value[1]}`
      },
    },
    visualMap: {
      min: 0,
      max: 5,
      type: 'piecewise',
      orient: 'horizontal',
      right: 0,
      top: 0,
      pieces: [
        { min: 0, max: 0, label: '无', color: '#EBEDF0' },
        { min: 1, max: 1, label: '低', color: '#C6E48B' },
        { min: 2, max: 2, label: '', color: '#7BC96F' },
        { min: 3, max: 3, label: '中', color: '#239A3B' },
        { min: 4, max: 5, label: '高', color: '#196127' },
      ],
      textStyle: { fontSize: 11 },
    },
    calendar: {
      range: (() => {
        const end = new Date()
        const start = new Date(end)
        start.setDate(start.getDate() - 83)
        return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
      })(),
      cellSize: ['auto', 16],
      itemStyle: {
        borderWidth: 3,
        borderColor: '#fff',
      },
      yearLabel: { show: false },
      monthLabel: { fontSize: 12 },
      dayLabel: {
        firstDay: 1,
        nameMap: ['日', '一', '二', '三', '四', '五', '六'],
        fontSize: 11,
      },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data,
      },
    ],
  }

  return <ReactECharts option={option} style={{ height }} />
}

export default HeatMapChart
