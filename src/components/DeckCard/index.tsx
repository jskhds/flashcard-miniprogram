import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Deck } from '@/types'
import { getDeckStats, getDisplayStatus } from '@/utils/sm2'
import './index.scss'

interface DeckCardProps {
  deck: Deck
  isOpen: boolean
  onTouchStart: (e: any) => void
  onTouchEnd: (e: any) => void
  onClose: () => void
  onEdit: (deck: Deck) => void
  onDelete: (deck: Deck) => void
  onFavorite?: (deck: Deck) => void
  showFooter?: boolean
}

function getNextReviewText(deck: Deck): string {
  if (deck.cards.length === 0) return '暂无卡片'
  const minNext = Math.min(...deck.cards.map(c => c.nextReview))
  const daysUntil = Math.ceil((minNext - Date.now()) / (24 * 60 * 60 * 1000))
  if (daysUntil <= 0) return '今天'
  if (daysUntil === 1) return '明天'
  return `${daysUntil}天后`
}

function getRateColor(rate: number): string {
  if (rate >= 80) return '#4CAF82'
  if (rate >= 50) return '#F4845F'
  return '#E05252'
}

export default function DeckCard({
  deck, isOpen, onTouchStart, onTouchEnd, onClose, onEdit, onDelete, onFavorite, showFooter = false
}: DeckCardProps) {
  const stats = getDeckStats(deck)
  const fuzzy = deck.cards.filter(c => getDisplayStatus(c) === '模糊').length
  const unknown = deck.cards.filter(c => getDisplayStatus(c) === '不会').length
  const rateColor = getRateColor(stats.rate)

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
          <View className='deck-card__title-col'>
            <Text className='deck-card__name'>{deck.name}</Text>
            {showFooter && (
              <Text className='deck-card__subtitle'>
                {stats.total} 张卡片 · 下次复习 {getNextReviewText(deck)}
              </Text>
            )}
          </View>
          <View className='deck-card__top-right'>
            {!showFooter && <Text className='deck-card__count'>{stats.total} 张</Text>}
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
              <Text className='deck-card__progress-rate' style={{ color: rateColor }}>{stats.rate}%</Text>
            </View>
          )}
          <View className='deck-card__progress-bar'>
            <View
              className='deck-card__progress-fill'
              style={{ width: `${stats.rate}%`, background: rateColor }}
            />
          </View>
          {!showFooter && (
            <Text className='deck-card__rate'>{stats.rate}%</Text>
          )}
        </View>

        {showFooter && (
          <View className='deck-card__stats'>
            <View className='deck-card__stat-item'>
              <View className='deck-card__stat-dot deck-card__stat-dot--know' />
              <Text className='deck-card__stat-text'>掌握 {stats.mastered}</Text>
            </View>
            <View className='deck-card__stat-item'>
              <View className='deck-card__stat-dot deck-card__stat-dot--fuzzy' />
              <Text className='deck-card__stat-text'>模糊 {fuzzy}</Text>
            </View>
            <View className='deck-card__stat-item'>
              <View className='deck-card__stat-dot deck-card__stat-dot--unknown' />
              <Text className='deck-card__stat-text'>不会 {unknown}</Text>
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
