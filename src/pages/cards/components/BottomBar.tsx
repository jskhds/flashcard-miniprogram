import { View, Text } from '@tarojs/components'

interface BottomBarProps {
  count: number
  filter: string
  disabled: boolean
  ready?: boolean
  completedToday?: boolean
  onStartReview: () => void
  onExtraPractice?: () => void
}

export default function BottomBar({ count, filter, disabled, ready = true, completedToday = false, onStartReview, onExtraPractice }: BottomBarProps) {
  const isDisabled = disabled || completedToday
  const label = (filter === '未学' || filter === '全部') ? '开始学习' : '开始复习'

  return (
    <View className={`cards-bottom${ready ? '' : ' cards-bottom--entering'}`}>
      <View
        className={`cards-btn cards-btn--primary ${isDisabled ? 'cards-btn--disabled' : ''}`}
        onClick={isDisabled ? undefined : onStartReview}
      >
        <Text className='cards-btn__text'>
          {completedToday ? '今日已完成 ✓' : `${label} · ${count} 张`}
        </Text>
      </View>
      {completedToday && onExtraPractice && (
        <View className='cards-btn cards-btn--secondary' onClick={onExtraPractice}>
          <Text className='cards-btn__text'>额外练习</Text>
        </View>
      )}
    </View>
  )
}
