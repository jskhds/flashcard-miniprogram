import { View, Text } from '@tarojs/components'

interface StreakOverviewProps {
  current: number
  longest: number
  masteryRate: number
}

export default function StreakOverview({ current, longest, masteryRate }: StreakOverviewProps) {
  return (
    <View className='streak-overview'>
      <View className='streak-overview-card'>
        <Text className='streak-overview-label'>当前连续</Text>
        <View className='streak-overview-num-row'>
          <Text className='streak-overview-value streak-overview-value--accent'>{current}</Text>
          <Text className='streak-overview-unit streak-overview-unit--accent'>天</Text>
        </View>
        <Text className='streak-overview-icon'>🔥</Text>
      </View>

      <View className='streak-overview-card'>
        <Text className='streak-overview-label'>历史最长</Text>
        <View className='streak-overview-num-row'>
          <Text className='streak-overview-value'>{longest}</Text>
          <Text className='streak-overview-unit'>天</Text>
        </View>
        <Text className='streak-overview-icon'>🏆</Text>
      </View>

      <View className='streak-overview-card'>
        <Text className='streak-overview-label'>总掌握率</Text>
        <View className='streak-overview-num-row'>
          <Text className='streak-overview-value streak-overview-value--green'>{masteryRate}</Text>
          <Text className='streak-overview-unit streak-overview-unit--green'>%</Text>
        </View>
        <Text className='streak-overview-icon'>📈</Text>
      </View>
    </View>
  )
}
