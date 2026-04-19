import { View, Text } from '@tarojs/components'

interface ChartDataItem {
  date: string
  count: number
  label: string
}

interface LineChartProps {
  chartData: ChartDataItem[]
  days: number
}

const SVG_W = 600
const SVG_H = 160
const PAD_X = 10
const PAD_Y = 16

export default function LineChart({ chartData, days }: LineChartProps) {
  const maxCount = Math.max(...chartData.map(d => d.count), 1)
  const chartW = SVG_W - PAD_X * 2
  const chartH = SVG_H - PAD_Y * 2

  const points = chartData.map((d, i) => ({
    x: PAD_X + (i / (chartData.length - 1)) * chartW,
    y: PAD_Y + chartH - (d.count / maxCount) * chartH,
    count: d.count,
    label: d.label,
  }))

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const area = `${PAD_X},${PAD_Y + chartH} ${polyline} ${PAD_X + chartW},${PAD_Y + chartH}`

  const xLabels = chartData.filter((_, i) => days === 7 ? true : i % 5 === 0 || i === days - 1)

  return (
    <View className='stats-card'>
      <Text className='stats-card-title'>复习趋势</Text>
      <View className='stats-chart'>
        <svg width='100%' viewBox={`0 0 ${SVG_W} ${SVG_H}`} className='stats-svg'>
          {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
            <line
              key={i}
              x1={PAD_X} y1={PAD_Y + chartH * (1 - frac)}
              x2={PAD_X + chartW} y2={PAD_Y + chartH * (1 - frac)}
              stroke='#EDE0D0' strokeWidth='1'
            />
          ))}
          {points.length > 1 && <polygon points={area} fill='rgba(244, 132, 95, 0.12)' />}
          {points.length > 1 && (
            <polyline
              points={polyline}
              fill='none' stroke='#F4845F' strokeWidth='3'
              strokeLinecap='round' strokeLinejoin='round'
            />
          )}
          {points.map((p, i) => (
            <circle
              key={i} cx={p.x} cy={p.y} r='5'
              fill={p.count > 0 ? '#F4845F' : '#F2E8DB'}
              stroke='#F4845F' strokeWidth='2'
            />
          ))}
        </svg>
        <View className='stats-x-labels'>
          {xLabels.map((d, i) => (
            <Text key={i} className='stats-x-label'>{d.label}</Text>
          ))}
        </View>
      </View>
    </View>
  )
}
