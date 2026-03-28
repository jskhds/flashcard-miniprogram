import { View, Text } from '@tarojs/components'

interface BottomBarProps {
  dueCount: number
  disabled: boolean
  onStartReview: () => void
}

export default function BottomBar({ dueCount, disabled, onStartReview }: BottomBarProps) {
  return (
    <View className='cards-bottom'>
      <View
        className={`cards-btn cards-btn--primary ${disabled ? 'cards-btn--disabled' : ''}`}
        onClick={onStartReview}
      >
        <Text className='cards-btn__text'>开始复习 · {dueCount} 张</Text>
      </View>
    </View>
  )
}
