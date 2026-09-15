import ReactECharts from 'echarts-for-react'

interface RadarChartProps {
  dimensions: { dimension_id: string; name: string; score: number }[]
  height?: number
}

function RadarChart({ dimensions, height = 300 }: RadarChartProps) {
  const option = {
    radar: {
      indicator: dimensions.map((dimension) => ({ name: dimension.name, max: 100 })), shape: 'polygon', splitNumber: 5,
      axisName: { color: '#595959', fontSize: 12 }, splitLine: { lineStyle: { color: '#E8E8E8' } }, splitArea: { show: false },
    },
    series: [{ type: 'radar', data: [{
      value: dimensions.map((dimension) => dimension.score), name: '能力评分',
      areaStyle: { color: 'rgba(22, 119, 255, 0.15)' }, lineStyle: { color: '#1677FF', width: 2 }, itemStyle: { color: '#1677FF' },
    }] }],
    tooltip: { trigger: 'item', formatter: (params: { value: number[] }) => dimensions.map((dimension, index) => `${dimension.name}: ${params.value[index]}`).join('<br/>') },
  }
  return <ReactECharts option={option} style={{ height }} />
}

export default RadarChart
