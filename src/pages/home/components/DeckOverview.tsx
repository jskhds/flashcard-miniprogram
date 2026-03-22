import { useState, useRef } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Deck } from '../../../types'
import { isDue, getDisplayStatus } from '../../../utils/sm2'
import ProgressBar from '../../../components/ProgressBar'

interface DeckOverviewProps {
  decks: Deck[]
  onEdit: (deck: Deck) => void
  onDelete: (deck: Deck) => void
  onCreateDeck: () => void
}

function getMasteredRate(deck: Deck) {
  if (deck.cards.length === 0) return 0
  const mastered = deck.cards.filter(c => getDisplayStatus(c) === '掌握').length
  return Math.round((mastered / deck.cards.length) * 100)
}

export default function DeckOverview({ decks, onEdit, onDelete, onCreateDeck }: DeckOverviewProps) {
  const [swipeOpen, setSwipeOpen] = useState<string | null>(null)
  const touchStartX = useRef(0)

  function handleTouchStart(e: any) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: any, deckId: string) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) setSwipeOpen(deckId)
    else if (dx > 40) setSwipeOpen(null)
  }

  if (decks.length === 0) {
    return (
      <View className='home-empty'>
        <Text className='home-empty__emoji'>📚</Text>
        <Text className='home-empty__title'>还没有卡组</Text>
        <Text className='home-empty__desc'>创建你的第一个闪卡卡组，开始高效学习</Text>
        <View className='home-empty__btn' onClick={onCreateDeck}>
          <Text className='home-empty__btn-text'>创建卡组</Text>
        </View>
      </View>
    )
  }

  const previewDecks = decks.slice(0, 3)

  return (
    <View className='home-decks'>
      <View className='home-section-header'>
        <Text className='home-section-title'>我的卡组</Text>
        <Text
          className='home-section-more'
          onClick={() => Taro.switchTab({ url: '/pages/decks/index' })}
        >
          全部 →
        </Text>
      </View>

      {previewDecks.map(deck => {
        const rate = getMasteredRate(deck)
        const dueCount = deck.cards.filter(c => isDue(c)).length
        const isOpen = swipeOpen === deck.id
        return (
          <View
            key={deck.id}
            className='home-deck-card-wrapper'
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, deck.id)}
          >
            <View
              className={`home-deck-card ${isOpen ? 'home-deck-card--swiped' : ''}`}
              onClick={() => {
                if (isOpen) { setSwipeOpen(null); return }
                Taro.navigateTo({ url: `/pages/cards/index?deckId=${deck.id}` })
              }}
            >
              <View className='home-deck-card__top'>
                <Text className='home-deck-card__name'>{deck.name}</Text>
                <View className='home-deck-card__meta'>
                  <Text className='home-deck-card__count'>{deck.cards.length} 张</Text>
                  {dueCount > 0 && (
                    <View className='home-deck-card__due'>
                      <Text className='home-deck-card__due-text'>{dueCount} 到期</Text>
                    </View>
                  )}
                </View>
              </View>
              <ProgressBar
                rate={rate}
                wrapperClass='home-deck-progress'
                barClass='home-deck-progress__bar'
                fillClass='home-deck-progress__fill'
                label={`${rate}% 掌握`}
                labelClass='home-deck-progress__label'
              />
            </View>

            <View className='home-deck-swipe-actions'>
              <View className='home-deck-swipe-btn home-deck-swipe-btn--edit' onClick={() => onEdit(deck)}>
                <Text>编辑</Text>
              </View>
              <View className='home-deck-swipe-btn home-deck-swipe-btn--delete' onClick={() => onDelete(deck)}>
                <Text>删除</Text>
              </View>
            </View>
          </View>
        )
      })}

      {/* FAB */}
      <View className='home-fab' onClick={onCreateDeck}>
        <Text className='home-fab__icon'>+</Text>
      </View>
    </View>
  )
}
