import { View, Text, ScrollView } from '@tarojs/components'
import { Card, DisplayStatus } from '@/types'
import { getDisplayStatus, getStatusColor } from '@/utils/sm2'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'

const STATUS_BG: Record<DisplayStatus, string> = {
  '掌握': 'rgba(52, 199, 89, 0.12)',
  '模糊': 'rgba(255, 149, 0, 0.12)',
  '不会': 'rgba(255, 59, 48, 0.12)',
  '未学': 'rgba(199, 199, 204, 0.2)',
}

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
                if (!isOpen) onCardClick(card)
              }}
            >
              <View className='card-item__content'>
                <View className='card-item__left'>
                  <View className='card-item__status-dot' style={{ background: getStatusColor(status) }} />
                  <Text className='card-item__front'>{card.front.slice(0, 60)}{card.front.length > 60 ? '…' : ''}</Text>
                </View>
                <View className='card-item__status-badge' style={{ background: STATUS_BG[status] }}>
                  <Text className='card-item__status-label' style={{ color: getStatusColor(status) }}>{status}</Text>
                </View>
              </View>
            </View>

            {isOpen && (
              <>
                <View className='card-swipe-close-area' onClick={() => setSwipeOpen(null)} />
                <View className='card-swipe-actions'>
                  <View className='card-swipe-btn card-swipe-btn--edit' onClick={() => { setSwipeOpen(null); onEdit(card) }}>
                    <Text>编辑</Text>
                  </View>
                  <View className='card-swipe-btn card-swipe-btn--delete' onClick={() => { setSwipeOpen(null); onDelete(card) }}>
                    <Text>删除</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )
      })}
    </ScrollView>
  )
}
