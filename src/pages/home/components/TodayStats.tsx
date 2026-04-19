import { View, Text } from '@tarojs/components'

interface TodayStatsProps {
  todayCount: number
  streak: number
  deckCount: number
  totalCards: number
  onStartReview: () => void
}

export default function TodayStats({
  todayCount,
  streak,
  deckCount,
  totalCards,
  onStartReview,
}: TodayStatsProps) {
  return (
    <>
      {/* Header */}
      <View className='home-header'>
        <View className='home-greeting'>
          <Text className='home-greeting__title'>今日复习</Text>
          {streak > 0 && (
            <View className='home-streak'>
              <Text className='home-streak__fire'>🔥</Text>
              <Text className='home-streak__text'>{streak} 天连续</Text>
            </View>
          )}
        </View>
        <View className='home-count'>
          <Text className='home-count__number'>{todayCount}</Text>
          <Text className='home-count__label'>张待复习</Text>
        </View>
      </View>

      {/* Review Button */}
      <View
        className={`home-review-btn ${todayCount === 0 ? 'home-review-btn--disabled' : ''}`}
        onClick={onStartReview}
      >
        <Text className='home-review-btn__text'>
          {todayCount === 0 ? '今日无到期卡片' : `开始今日复习 · ${todayCount} 张`}
        </Text>
      </View>

      {/* Stats Bar */}
      <View className='home-stats'>
        <View className='home-stats__item'>
          <Text className='home-stats__value'>{deckCount}</Text>
          <Text className='home-stats__label'>卡组</Text>
        </View>
        <View className='home-stats__divider' />
        <View className='home-stats__item'>
          <Text className='home-stats__value'>{totalCards}</Text>
          <Text className='home-stats__label'>总卡片</Text>
        </View>
        <View className='home-stats__divider' />
        <View className='home-stats__item'>
          <Text className='home-stats__value'>{streak}</Text>
          <Text className='home-stats__label'>连续天数</Text>
        </View>
      </View>
    </>
  )
}
