import { View, Text } from '@tarojs/components'

interface TodayStatsProps {
  todayCount: number
  streak: number
  deckCount: number
  totalCards: number
  masteryRate: number
}

export default function TodayStats({ todayCount, streak, deckCount, totalCards, masteryRate }: TodayStatsProps) {
  return (
    <View className='home-hero'>
      <View className='home-hero__top'>
        <Text className='home-hero__due'>
          今日待学习 <Text className='home-hero__due-num'>{todayCount}</Text> 张
        </Text>
        <View className='home-hero__streak'>
          <Text className='home-hero__streak-text'>🔥 {streak} 天连续</Text>
        </View>
      </View>
      <View className='home-hero__divider' />
      <View className='home-hero__stats'>
        <View className='home-hero__stat'>
          <Text className='home-hero__stat-value'>{totalCards}</Text>
          <Text className='home-hero__stat-label'>已学</Text>
        </View>
        <View className='home-hero__stat-sep' />
        <View className='home-hero__stat'>
          <Text className='home-hero__stat-value'>{masteryRate}%</Text>
          <Text className='home-hero__stat-label'>掌握率</Text>
        </View>
        <View className='home-hero__stat-sep' />
        <View className='home-hero__stat'>
          <Text className='home-hero__stat-value'>{deckCount}</Text>
          <Text className='home-hero__stat-label'>卡组数</Text>
        </View>
      </View>
    </View>
  )
}
