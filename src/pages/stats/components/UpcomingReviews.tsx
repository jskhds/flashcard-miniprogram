import { View, Text } from '@tarojs/components'

interface UpcomingItem {
  label: string
  count: number
  isToday: boolean
}

interface UpcomingReviewsProps {
  items: UpcomingItem[]
}

export default function UpcomingReviews({ items }: UpcomingReviewsProps) {
  const maxCount = Math.max(...items.map(i => i.count), 1)

  return (
    <View className='stats-card'>
      <Text className='stats-card-title'>近7天复习计划</Text>
      <View className='upcoming-rows'>
        {items.map((item, i) => (
          <View key={i} className='upcoming-row'>
            <Text className={`upcoming-label ${item.isToday ? 'upcoming-label--today' : ''}`}>{item.label}</Text>
            <View className='upcoming-bar-track'>
              <View
                className={`upcoming-bar-fill ${item.isToday ? 'upcoming-bar-fill--today' : ''}`}
                style={{ width: `${Math.round((item.count / maxCount) * 100)}%` }}
              />
            </View>
            <Text className='upcoming-count'>{item.count}张</Text>
          </View>
        ))}
      </View>
      <Text className='upcoming-hint'>基于 SM-2 算法预测，仅含已学卡片</Text>
    </View>
  )
}
