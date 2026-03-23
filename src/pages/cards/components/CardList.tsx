import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Card, DisplayStatus } from '../../../types'
import { getDisplayStatus, isDue } from '../../../utils/sm2'
import { useSwipeGesture } from '../../../hooks/useSwipeGesture'

interface CardListProps {
  cards: Card[]
  deckId: string
  onDelete: (cardId: string) => void
}

function getStatusColor(s: DisplayStatus) {
  if (s === '掌握') return '#34C759'
  if (s === '模糊') return '#FF9500'
  if (s === '不会') return '#FF3B30'
  return '#C7C7CC'
}

export default function CardList({ cards, deckId, onDelete }: CardListProps) {
  const { swipeOpen, setSwipeOpen, handleTouchStart, handleTouchEnd } = useSwipeGesture()

  if (cards.length === 0) {
    return (
      <View className='cards-empty'>
        <Text className='cards-empty__text'>暂无卡片</Text>
      </View>
    )
  }

  return (
    <ScrollView scrollY className='cards-list'>
      {cards.map(card => {
        const status = getDisplayStatus(card)
        const isOpen = swipeOpen === card.id
        return (
          <View
            key={card.id}
            className='card-item-wrapper'
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, card.id)}
          >
            <View
              className={`card-item ${isOpen ? 'card-item--swiped' : ''}`}
              onClick={() => {
                if (isOpen) { setSwipeOpen(null); return }
                Taro.navigateTo({ url: `/pages/card-edit/index?deckId=${deckId}&cardId=${card.id}` })
              }}
            >
              <View className='card-item__content'>
                <View className='card-item__header'>
                  <View className='card-item__status-dot' style={{ background: getStatusColor(status) }} />
                  <Text className='card-item__status-text' style={{ color: getStatusColor(status) }}>{status}</Text>
                  {isDue(card) && card.repetitions > 0 && (
                    <View className='card-item__due-badge'>
                      <Text className='card-item__due-text'>待复习</Text>
                    </View>
                  )}
                </View>
                <Text className='card-item__front'>{card.front.slice(0, 60)}{card.front.length > 60 ? '…' : ''}</Text>
                <Text className='card-item__back'>{card.back.slice(0, 40)}{card.back.length > 40 ? '…' : ''}</Text>
              </View>
            </View>

            <View className='card-swipe-actions'>
              <View
                className='card-swipe-btn card-swipe-btn--edit'
                onClick={() => {
                  setSwipeOpen(null)
                  Taro.navigateTo({ url: `/pages/card-edit/index?deckId=${deckId}&cardId=${card.id}` })
                }}
              >
                <Text>编辑</Text>
              </View>
              <View className='card-swipe-btn card-swipe-btn--delete' onClick={() => onDelete(card.id)}>
                <Text>删除</Text>
              </View>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}
