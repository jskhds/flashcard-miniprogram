import { View, Text } from '@tarojs/components'

interface TodayStatsProps {
  todayCount: number
  streak: number
  deckCount: number
  totalCards: number
  masteryRate: number
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return '早上好'
  if (hour >= 12 && hour < 18) return '下午好'
  return '晚上好'
}

export default function TodayStats({ todayCount, streak, deckCount, totalCards, masteryRate }: TodayStatsProps) {
  return (
    <>
      <Text className='home-greeting'>{getGreeting()}</Text>
      <View className='home-hero'>
        <View className='home-hero__top'>
          <Text className='home-hero__due'>
            今日待复习 <Text className='home-hero__due-num'>{todayCount}</Text> 张
          </Text>
          <View className='home-hero__streak'>
            <Text className='home-hero__streak-text'>🔥 {streak} 天连续</Text>
          </View>
        </View>
        <View className='home-hero__divider' />
        <View className='home-hero__stats'>
          <View className='home-hero__stat'>
            <Text className='home-hero__stat-value'>{totalCards}</Text>
            <Text className='home-hero__stat-label'>已学总数</Text>
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
    </>
  )
}
