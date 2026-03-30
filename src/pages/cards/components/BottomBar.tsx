import { View, Text } from '@tarojs/components'

interface BottomBarProps {
  count: number
  filter: string
  disabled: boolean
  ready?: boolean
  onStartReview: () => void
}

export default function BottomBar({ count, filter, disabled, ready = true, onStartReview }: BottomBarProps) {
  const label = filter === '未学' ? '开始学习' : '开始复习'
  return (
    <View className={`cards-bottom${ready ? '' : ' cards-bottom--entering'}`}>
      <View
        className={`cards-btn cards-btn--primary ${disabled ? 'cards-btn--disabled' : ''}`}
        onClick={disabled ? undefined : onStartReview}
      >
        <Text className='cards-btn__text'>{label} · {count} 张</Text>
      </View>
    </View>
  )
}
