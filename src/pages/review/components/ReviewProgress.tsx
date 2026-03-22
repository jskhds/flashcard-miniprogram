import { View, Text } from '@tarojs/components'

interface ReviewProgressProps {
  current: number
  total: number
  progress: number
}

export default function ReviewProgress({ current, total, progress }: ReviewProgressProps) {
  return (
    <View className='review-progress'>
      <View className='review-progress__bar'>
        <View className='review-progress__fill' style={{ width: `${progress}%` }} />
      </View>
      <Text className='review-progress__text'>{current} / {total}</Text>
    </View>
  )
}
