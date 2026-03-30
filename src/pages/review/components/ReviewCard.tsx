import { View, Text, ScrollView } from '@tarojs/components'
import { Card } from '@/types'

interface ReviewCardProps {
  card: Card
  isFlipped: boolean
  isSliding: boolean
  onFlip: () => void
}

function getFrontFontSize(len: number): string {
  if (len > 80) return '28rpx'
  if (len > 40) return '36rpx'
  return '48rpx'
}

function getAnswerFontSize(len: number): string {
  if (len > 80) return '28rpx'
  if (len > 40) return '36rpx'
  if (len > 20) return '48rpx'
  return '64rpx'
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
            <ScrollView scrollY className='review-card__scroll'>
              <View className='review-card__scroll-inner'>
                <Text className='review-card__content' style={{ fontSize: getFrontFontSize(card.front.length) }}>
                  {card.front}
                </Text>
              </View>
            </ScrollView>
          </View>
          <View className='review-card__face review-card__back'>
            <View className='review-card__back-question'>
              <View className='review-card__back-label-row'>
                <View className='review-card__back-label-bar' />
                <Text className='review-card__back-label'>问题</Text>
              </View>
              <Text className='review-card__back-question-text' style={{ fontSize: getFrontFontSize(card.front.length) }}>{card.front}</Text>
            </View>
            <View className='review-card__back-answer'>
              <View className='review-card__deco review-card__deco--tr' />
              <ScrollView scrollY className='review-card__scroll'>
                <View className='review-card__scroll-inner'>
                  <Text className='review-card__back-answer-text' style={{ fontSize: getAnswerFontSize(card.back.length) }}>
                    {card.back}
                  </Text>
                </View>
              </ScrollView>
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
