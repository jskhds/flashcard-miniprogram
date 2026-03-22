import { View, Text } from '@tarojs/components'
import { Card } from '../../../types'

interface ReviewCardProps {
  card: Card
  isFlipped: boolean
  isSliding: boolean
  onFlip: () => void
}

export default function ReviewCard({ card, isFlipped, isSliding, onFlip }: ReviewCardProps) {
  return (
    <View className='review-card-container'>
      <View
        className={`review-card ${isFlipped ? 'review-card--flipped' : ''} ${isSliding ? 'review-card--sliding' : ''}`}
        onClick={onFlip}
      >
        <View className='review-card__face review-card__front'>
          <Text className='review-card__hint'>点击翻转查看答案</Text>
          <Text className='review-card__content'>{card.front}</Text>
        </View>
        <View className='review-card__face review-card__back'>
          <View className='review-card__back-front'>
            <Text className='review-card__content review-card__content--small'>{card.front}</Text>
          </View>
          <View className='review-card__divider' />
          <Text className='review-card__content'>{card.back}</Text>
        </View>
      </View>
    </View>
  )
}
