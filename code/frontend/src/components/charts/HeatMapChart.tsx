import ReactECharts from 'echarts-for-react'

interface HeatMapChartProps { events: { event_time: string }[]; height?: number }

function HeatMapChart({ events, height = 200 }: HeatMapChartProps) {
  const counts = new Map<string, number>()
  for (const event of events) {
    const day = event.event_time.slice(0, 10)
    counts.set(day, (counts.get(day) || 0) + 1)
  }
  const end = new Date(events[0]?.event_time || '2026-09-15T00:00:00+08:00')
  const start = new Date(end); start.setDate(start.getDate() - 83)
  const data: [string, number][] = []
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const day = cursor.toISOString().slice(0, 10); data.push([day, counts.get(day) || 0])
  }
  const option = {
    tooltip: { formatter: (params: { value: [string, number] }) => `${params.value[0]}<br/>成长事件: ${params.value[1]}` },
    visualMap: {
      min: 0, max: Math.max(5, ...data.map((item) => item[1])), type: 'piecewise', orient: 'horizontal', right: 0, top: 0,
      pieces: [{ min: 0, max: 0, label: '无', color: '#EBEDF0' }, { min: 1, max: 1, label: '低', color: '#C6E48B' }, { min: 2, max: 2, label: '', color: '#7BC96F' }, { min: 3, max: 3, label: '中', color: '#239A3B' }, { min: 4, label: '高', color: '#196127' }],
      textStyle: { fontSize: 11 },
    },
    calendar: {
      range: [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)], cellSize: ['auto', 16], itemStyle: { borderWidth: 3, borderColor: '#fff' },
      yearLabel: { show: false }, monthLabel: { fontSize: 12 }, dayLabel: { firstDay: 1, nameMap: ['日', '一', '二', '三', '四', '五', '六'], fontSize: 11 },
    },
    series: [{ type: 'heatmap', coordinateSystem: 'calendar', data }],
  }
  return <ReactECharts option={option} style={{ height }} />
}

export default HeatMapChart
