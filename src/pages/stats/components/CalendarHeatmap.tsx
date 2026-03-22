import { View, Text } from '@tarojs/components'

interface CalendarDay {
  day: number
  count: number
}

interface CalendarHeatmapProps {
  year: number
  month: number
  days: CalendarDay[]
  firstDayOfWeek: number
  maxCount: number
}

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']

function getHeatColor(count: number, maxCount: number) {
  if (count === 0) return '#F2E8DB'
  const intensity = count / maxCount
  if (intensity < 0.25) return '#FAC4AE'
  if (intensity < 0.5) return '#F4845F'
  if (intensity < 0.75) return '#E06040'
  return '#C04030'
}

export default function CalendarHeatmap({ year, month, days, firstDayOfWeek, maxCount }: CalendarHeatmapProps) {
  return (
    <View className='stats-card'>
      <Text className='stats-card-title'>{year}年{month + 1}月 学习热力图</Text>
      <View className='stats-calendar'>
        {WEEK_LABELS.map(d => (
          <View key={d} className='stats-cal-header'>
            <Text className='stats-cal-header-text'>{d}</Text>
          </View>
        ))}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <View key={`empty-${i}`} className='stats-cal-cell stats-cal-cell--empty' />
        ))}
        {days.map(({ day, count }) => (
          <View
            key={day}
            className='stats-cal-cell'
            style={{ background: getHeatColor(count, maxCount) }}
          >
            <Text className='stats-cal-day'>{day}</Text>
            {count > 0 && <Text className='stats-cal-count'>{count}</Text>}
          </View>
        ))}
      </View>
    </View>
  )
}
