import { View, Text } from '@tarojs/components'
import { Card } from '@/types'

interface ReviewCardProps {
  card: Card
  isFlipped: boolean
  isSliding: boolean
  onFlip: () => void
}

export default function ReviewCard({ card, isFlipped, isSliding, onFlip }: ReviewCardProps) {
  return (
    <View className='review-card-container'>
      <View className='review-card-frame'>
        <View
          className={`review-card ${isFlipped ? 'review-card--flipped' : ''} ${isSliding ? 'review-card--sliding' : ''}`}
        >
          <View className='review-card__face review-card__front'>
            <View className='review-card__deco review-card__deco--tr' />
            <View className='review-card__deco review-card__deco--bl' />
            <Text className='review-card__content'>{card.front}</Text>
          </View>
          <View className='review-card__face review-card__back'>
            <View className='review-card__back-question'>
              <View className='review-card__back-label-row'>
                <View className='review-card__back-label-bar' />
                <Text className='review-card__back-label'>问题</Text>
              </View>
              <Text className='review-card__back-question-text'>{card.front}</Text>
            </View>
            <View className='review-card__back-answer'>
              <View className='review-card__deco review-card__deco--tr' />
              <Text className='review-card__back-answer-text'>{card.back}</Text>
            </View>
          </View>
        </View>
        <View className='review-card-tap-area' onClick={onFlip} />
      </View>
      {!isFlipped && (
        <Text className='review-flip-hint__text'>轻触卡片查看答案</Text>
      )}
    </View>
  )
}
