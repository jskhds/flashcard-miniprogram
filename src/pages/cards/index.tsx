import { useState, useRef } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { getDeckById, saveDecks, getDecks } from '../../utils/storage'
import { getDisplayStatus, isDue } from '../../utils/sm2'
import { Card, DisplayStatus } from '../../types'
import './index.scss'

type FilterType = '全部' | '未学' | '不会' | '模糊' | '掌握'

export default function Cards() {
  const router = useRouter()
  const deckId = router.params.deckId as string
  const [deck, setDeck] = useState(() => getDeckById(deckId))
  const [filter, setFilter] = useState<FilterType>('全部')
  const [swipeOpen, setSwipeOpen] = useState<string | null>(null)
  const touchStartX = useRef<number>(0)

  Taro.useDidShow(() => {
    setDeck(getDeckById(deckId))
  })

  if (!deck) {
    return (
      <View className='cards-page'>
        <Text>卡组不存在</Text>
      </View>
    )
  }

  const cards = deck.cards
  const filters: FilterType[] = ['全部', '未学', '不会', '模糊', '掌握']

  const statusCounts = cards.reduce((acc, c) => {
    const s = getDisplayStatus(c)
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {} as Record<DisplayStatus, number>)

  const filteredCards = filter === '全部'
    ? cards
    : cards.filter(c => getDisplayStatus(c) === filter)

  function handleDelete(cardId: string) {
    Taro.showModal({
      title: '删除卡片',
      content: '确认删除这张卡片？',
      confirmText: '删除',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          const allDecks = getDecks()
          const d = allDecks.find(x => x.id === deckId)
          if (d) {
            d.cards = d.cards.filter(c => c.id !== cardId)
            saveDecks(allDecks)
            setDeck(getDeckById(deckId))
            setSwipeOpen(null)
          }
        }
      }
    })
  }

  function handleStartReview() {
    if (cards.length === 0) {
      Taro.showToast({ title: '暂无卡片', icon: 'none' })
      return
    }
    Taro.setStorageSync('flashcard_review_session', JSON.stringify({
      cards,
      deckId
    }))
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  function handleTouchStart(e: any) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: any, cardId: string) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) setSwipeOpen(cardId)
    else if (dx > 40) setSwipeOpen(null)
  }

  const getStatusColor = (s: DisplayStatus) => {
    if (s === '掌握') return '#34C759'
    if (s === '模糊') return '#FF9500'
    if (s === '不会') return '#FF3B30'
    return '#C7C7CC'
  }

  return (
    <View className='cards-page'>
      {/* Header */}
      <View className='cards-header'>
        <Text className='cards-deck-name'>{deck.name}</Text>
        <Text className='cards-total'>{cards.length} 张卡片</Text>
      </View>

      {/* Stats Row */}
      <View className='cards-stats'>
        {(['未学', '不会', '模糊', '掌握'] as DisplayStatus[]).map(s => (
          <View key={s} className='cards-stat-item'>
            <View
              className='cards-stat-dot'
              style={{ background: getStatusColor(s) }}
            />
            <Text className='cards-stat-count'>{statusCounts[s] || 0}</Text>
            <Text className='cards-stat-label'>{s}</Text>
          </View>
        ))}
      </View>

      {/* Filter Chips */}
      <ScrollView scrollX className='cards-filters'>
        {filters.map(f => (
          <View
            key={f}
            className={`cards-filter-chip ${filter === f ? 'cards-filter-chip--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            <Text className='cards-filter-chip__text'>
              {f} {f !== '全部' ? `(${statusCounts[f as DisplayStatus] || 0})` : `(${cards.length})`}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Card List */}
      {filteredCards.length === 0 ? (
        <View className='cards-empty'>
          <Text className='cards-empty__text'>暂无卡片</Text>
        </View>
      ) : (
        <ScrollView scrollY className='cards-list'>
          {filteredCards.map(card => {
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
                    Taro.navigateTo({
                      url: `/pages/card-edit/index?deckId=${deckId}&cardId=${card.id}`
                    })
                  }}
                >
                  <View className='card-item__content'>
                    <View className='card-item__header'>
                      <View
                        className='card-item__status-dot'
                        style={{ background: getStatusColor(status) }}
                      />
                      <Text className='card-item__status-text' style={{ color: getStatusColor(status) }}>
                        {status}
                      </Text>
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
                  <View
                    className='card-swipe-btn card-swipe-btn--delete'
                    onClick={() => handleDelete(card.id)}
                  >
                    <Text>删除</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </ScrollView>
      )}

      {/* Bottom Buttons */}
      <View className='cards-bottom'>
        <View
          className='cards-btn cards-btn--secondary'
          onClick={() => Taro.navigateTo({ url: `/pages/card-edit/index?deckId=${deckId}` })}
        >
          <Text className='cards-btn__text'>+ 新增卡片</Text>
        </View>
        <View
          className={`cards-btn cards-btn--primary ${cards.length === 0 ? 'cards-btn--disabled' : ''}`}
          onClick={handleStartReview}
        >
          <Text className='cards-btn__text'>开始复习 · 全部 {cards.length} 张</Text>
        </View>
      </View>
    </View>
  )
}
