import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { ApiDeck } from '@/types/api/deck'
import './DeckCard.scss'

type DeckWithFav = ApiDeck & { favorited: boolean }

interface DeckCardProps {
  deck: DeckWithFav
  isOpen: boolean
  onTouchStart: (e: any) => void
  onTouchMove: (e: any) => void
  onTouchEnd: (e: any) => void
  onClose: () => void
  onEdit: (deck: DeckWithFav) => void
  onDelete: (deck: DeckWithFav) => void
  onFavorite?: (deck: DeckWithFav) => void
  showFooter?: boolean
}

function getRateColor(rate: number): string {
  if (rate >= 80) return '#4CAF82'
  if (rate >= 50) return '#F4845F'
  return '#E05252'
}

export default function DeckCard({
  deck, isOpen, onTouchStart, onTouchMove, onTouchEnd, onClose, onEdit, onDelete, onFavorite, showFooter = false
}: DeckCardProps) {
  const { total, due, mastered, masteryRate } = deck.stats
  const rateColor = getRateColor(masteryRate)

  return (
    <View
      className='deck-card-wrapper'
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <View
        className={`deck-card ${isOpen ? 'deck-card--swiped' : ''}`}
        onClick={() => {
          if (!isOpen) Taro.navigateTo({ url: `/pages/cards/index?deckId=${deck._id}&deckName=${encodeURIComponent(deck.name)}` })
        }}
      >
        <View className='deck-card__top'>
          <View className='deck-card__title-col'>
            <Text className='deck-card__name'>{deck.name}</Text>
            {showFooter && (
              <Text className='deck-card__subtitle'>
                {total} 张卡片 · 待复习 {due} 张
              </Text>
            )}
          </View>
          <View className='deck-card__top-right'>
            {!showFooter && <Text className='deck-card__count'>{total} 张</Text>}
            {showFooter && (
              <View
                className='deck-card__star'
                onClick={(e) => { e.stopPropagation(); onFavorite?.(deck) }}
              >
                <Text className={`deck-card__star-icon ${deck.favorited ? 'deck-card__star-icon--active' : ''}`}>
                  {deck.favorited ? '★' : '☆'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className='deck-card__progress-section'>
          {showFooter && (
            <View className='deck-card__progress-header'>
              <Text className='deck-card__progress-label'>掌握率</Text>
              <Text className='deck-card__progress-rate' style={{ color: rateColor }}>{masteryRate}%</Text>
            </View>
          )}
          <View className='deck-card__progress-bar'>
            <View
              className='deck-card__progress-fill'
              style={{ width: `${masteryRate}%`, background: rateColor }}
            />
          </View>
          {!showFooter && (
            <Text className='deck-card__rate'>{masteryRate}%</Text>
          )}
        </View>

        {showFooter && (
          <View className='deck-card__stats'>
            <View className='deck-card__stat-item'>
              <View className='deck-card__stat-dot deck-card__stat-dot--unknown' />
              <Text className='deck-card__stat-text'>待复习 {due}</Text>
            </View>
            <View className='deck-card__stat-item'>
              <View className='deck-card__stat-dot deck-card__stat-dot--know' />
              <Text className='deck-card__stat-text'>掌握 {mastered}</Text>
            </View>
            <View className='deck-card__stat-item'>
              <View className='deck-card__stat-dot deck-card__stat-dot--new' />
              <Text className='deck-card__stat-text'>总计 {total}</Text>
            </View>
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
