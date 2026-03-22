import { View, Text } from '@tarojs/components'
import { ReviewQuality } from '../../../types'

interface RatingButtonsProps {
  onRate: (quality: ReviewQuality) => void
}

export default function RatingButtons({ onRate }: RatingButtonsProps) {
  return (
    <View className='review-ratings'>
      <Text className='review-ratings__label'>我的掌握程度</Text>
      <View className='review-ratings__buttons'>
        <View className='review-rate-btn review-rate-btn--unknown' onClick={() => onRate(0)}>
          <Text className='review-rate-btn__icon'>✗</Text>
          <Text className='review-rate-btn__label'>不会</Text>
        </View>
        <View className='review-rate-btn review-rate-btn--fuzzy' onClick={() => onRate(3)}>
          <Text className='review-rate-btn__icon'>△</Text>
          <Text className='review-rate-btn__label'>模糊</Text>
        </View>
        <View className='review-rate-btn review-rate-btn--know' onClick={() => onRate(5)}>
          <Text className='review-rate-btn__icon'>✓</Text>
          <Text className='review-rate-btn__label'>掌握</Text>
        </View>
      </View>
    </View>
  )
}
