import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Deck } from '@/types'
import { getDeckStats } from '@/utils/sm2'
import ProgressBar from '@/components/ProgressBar'
import './index.scss'

interface DeckCardProps {
  deck: Deck
  isOpen: boolean
  onTouchStart: (e: any) => void
  onTouchEnd: (e: any) => void
  onClose: () => void
  onEdit: (deck: Deck) => void
  onDelete: (deck: Deck) => void
  showFooter?: boolean
}

export default function DeckCard({
  deck, isOpen, onTouchStart, onTouchEnd, onClose, onEdit, onDelete, showFooter = false
}: DeckCardProps) {
  const stats = getDeckStats(deck)

  return (
    <View
      className='deck-card-wrapper'
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <View
        className={`deck-card ${isOpen ? 'deck-card--swiped' : ''}`}
        onClick={() => {
          if (!isOpen) Taro.navigateTo({ url: `/pages/cards/index?deckId=${deck.id}` })
        }}
      >
        <View className='deck-card__top'>
          <Text className='deck-card__name'>{deck.name}</Text>
          <View className='deck-card__badges'>
            {stats.due > 0 && (
              <View className='deck-card__due-badge'>
                <Text className='deck-card__due-text'>{stats.due} 到期</Text>
              </View>
            )}
            <Text className='deck-card__count'>{stats.total} 张</Text>
          </View>
        </View>
        <ProgressBar
          rate={stats.rate}
          wrapperClass='deck-card__progress'
          barClass='deck-card__progress-bar'
          fillClass='deck-card__progress-fill'
          label={`${stats.rate}%`}
          labelClass='deck-card__rate'
        />
        {showFooter && (
          <View className='deck-card__footer'>
            <Text className='deck-card__footer-text'>掌握 {stats.mastered}/{stats.total}</Text>
            <Text className='deck-card__arrow'>›</Text>
          </View>
        )}
      </View>

      {isOpen && (
        <>
          <View className='deck-card-close-area' onClick={onClose} />
          <View className='deck-card-swipe-actions'>
            <View className='deck-card-swipe-btn deck-card-swipe-btn--edit' onClick={() => { onClose(); onEdit(deck) }}>
              <Text>编辑</Text>
            </View>
            <View className='deck-card-swipe-btn deck-card-swipe-btn--delete' onClick={() => { onClose(); onDelete(deck) }}>
              <Text>删除</Text>
            </View>
          </View>
        </>
      )}
    </View>
  )
}
