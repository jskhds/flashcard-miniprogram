import { View, Text } from '@tarojs/components'

interface StatsOverviewProps {
  totalReviewed: number
  activeDays: number
  dailyAvg: number
}

export default function StatsOverview({ totalReviewed, activeDays, dailyAvg }: StatsOverviewProps) {
  return (
    <View className='stats-overview'>
      <View className='stats-overview-item'>
        <Text className='stats-overview-value'>{totalReviewed}</Text>
        <Text className='stats-overview-label'>复习次数</Text>
      </View>
      <View className='stats-overview-divider' />
      <View className='stats-overview-item'>
        <Text className='stats-overview-value'>{activeDays}</Text>
        <Text className='stats-overview-label'>活跃天数</Text>
      </View>
      <View className='stats-overview-divider' />
      <View className='stats-overview-item'>
        <Text className='stats-overview-value'>{dailyAvg}</Text>
        <Text className='stats-overview-label'>日均复习</Text>
      </View>
    </View>
  )
}
