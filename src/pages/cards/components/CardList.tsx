import { View, Text, ScrollView } from '@tarojs/components'
import { Card } from '@/types'
import { getDisplayStatus, isDue, getStatusColor } from '@/utils/sm2'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'

interface CardListProps {
  cards: Card[]
  onCardClick: (card: Card) => void
  onEdit: (card: Card) => void
  onDelete: (card: Card) => void
}

export default function CardList({ cards, onCardClick, onEdit, onDelete }: CardListProps) {
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
                onCardClick(card)
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
              </View>
            </View>

            <View className='card-swipe-actions'>
              <View className='card-swipe-btn card-swipe-btn--edit' onClick={() => onEdit(card)}>
                <Text>编辑</Text>
              </View>
              <View className='card-swipe-btn card-swipe-btn--delete' onClick={() => onDelete(card)}>
                <Text>删除</Text>
              </View>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}
