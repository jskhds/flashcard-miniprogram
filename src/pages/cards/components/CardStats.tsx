import { View, Text } from '@tarojs/components'

interface CardStatsProps {
  totalCount: number
  masteredCount: number
  dueCount: number
}

export default function CardStats({ totalCount, masteredCount, dueCount }: CardStatsProps) {
  const masteryRate = totalCount > 0 ? Math.round(masteredCount / totalCount * 100) : 0
  const stats = [
    { value: `${totalCount}`, label: '总卡片' },
    { value: `${masteryRate}%`, label: '掌握率' },
    { value: `${dueCount}`, label: '今日待复习' },
  ]
  return (
    <View className='cards-stats'>
      {stats.map(s => (
        <View key={s.label} className='cards-stat-item'>
          <Text className='cards-stat-count'>{s.value}</Text>
          <Text className='cards-stat-label'>{s.label}</Text>
        </View>
      ))}
    </View>
  )
}
