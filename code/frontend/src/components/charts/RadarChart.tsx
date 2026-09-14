import ReactECharts from 'echarts-for-react'

interface RadarChartProps {
  scores: {
    professional_skill: number
    soft_skill: number
    leadership: number
    innovation: number
    learning_ability: number
  }
  height?: number
}

const dimensionMeta = [
  { key: 'professional_skill', label: '专业技能', color: '#1677FF' },
  { key: 'soft_skill', label: '软技能', color: '#52C41A' },
  { key: 'leadership', label: '领导力', color: '#FAAD14' },
  { key: 'innovation', label: '创新力', color: '#722ED1' },
  { key: 'learning_ability', label: '学习力', color: '#13C2C2' },
]

function RadarChart({ scores, height = 300 }: RadarChartProps) {
  const option = {
    radar: {
      indicator: dimensionMeta.map((d) => ({
        name: d.label,
        max: 100,
      })),
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: '#595959',
        fontSize: 13,
      },
      splitLine: { lineStyle: { color: '#E8E8E8' } },
      splitArea: { show: false },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: dimensionMeta.map((d) => scores[d.key as keyof typeof scores]),
            name: '能力评分',
            areaStyle: {
              color: 'rgba(22, 119, 255, 0.15)',
            },
            lineStyle: {
              color: '#1677FF',
              width: 2,
            },
            itemStyle: {
              color: '#1677FF',
            },
          },
        ],
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: (params: { value: number[] }) => {
        return dimensionMeta
          .map((d, i) => `${d.label}: ${params.value[i]}`)
          .join('<br/>')
      },
    },
  }

  return <ReactECharts option={option} style={{ height }} />
}

export default RadarChart
