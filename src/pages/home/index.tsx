import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getDecks, setReviewSession, getStreak } from '@/utils/storage'
import { isDue, getDeckStats } from '@/utils/sm2'
import { Deck } from '@/types'
import TodayStats from './components/TodayStats'
import HomeDeckRow from './components/HomeDeckRow'
import './index.scss'

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [reviewItems, setReviewItems] = useState<{ deck: Deck; count: number }[]>([])

  Taro.useDidShow(() => { loadData() })

  function loadData() {
    const allDecks = getDecks()
    setDecks(allDecks)

    const rItems = allDecks
      .map(d => ({ deck: d, count: d.cards.filter(c => c.repetitions > 0 && isDue(c)).length }))
      .filter(x => x.count > 0)

    setReviewItems(rItems)

    const dueCount = rItems.reduce((s, x) => s + x.count, 0)
    setTodayCount(dueCount)
    setStreak(getStreak().current)
  }

  function handleDeckStart(deck: Deck) {
    const cards = deck.cards.filter(c => c.repetitions > 0 && isDue(c))
    setReviewSession({ cards, source: 'deck', deckIds: [deck.id] })
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  function handleStartAll() {
    const cards = reviewItems.flatMap(x => x.deck.cards.filter(c => c.repetitions > 0 && isDue(c)))
    const deckIds = reviewItems.map(x => x.deck.id)
    setReviewSession({ cards, source: 'home', deckIds })
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  const totalCards = decks.reduce((s, d) => s + d.cards.length, 0)
  const masteredCards = decks.reduce((s, d) => s + getDeckStats(d).mastered, 0)
  const masteryRate = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0
  const hasContent = decks.length > 0

  return (
    <View className='home-page'>
      <TodayStats
        todayCount={todayCount}
        streak={streak}
        deckCount={decks.length}
        totalCards={totalCards}
        masteryRate={masteryRate}
      />

      <View className='home-deck-list'>
        {!hasContent ? (
          <View className='home-empty'>
            <Text className='home-empty__emoji'>🗂️</Text>
            <Text className='home-empty__title'>还没有卡组</Text>
            <Text className='home-empty__desc'>去卡组页创建卡组并添加卡片吧</Text>
          </View>
        ) : reviewItems.length === 0 ? (
          <View className='home-empty'>
            <Text className='home-empty__emoji'>📭</Text>
            <Text className='home-empty__title'>今日无待复习卡片</Text>
          </View>
        ) : (
          <>
            {reviewItems.map(({ deck, count }) => (
              <HomeDeckRow
                key={deck.id}
                deck={deck}
                count={count}
                onClick={() => handleDeckStart(deck)}
              />
            ))}
            <Text className='home-deck-hint'>点击卡组可单独复习</Text>
          </>
        )}
      </View>

      <View className='home-bottom'>
        {!hasContent ? (
          <View className='home-review-btn' onClick={() => {
            Taro.setStorageSync('pendingDeckCreate', true)
            Taro.switchTab({ url: '/pages/decks/index' })
          }}>
            <Text className='home-review-btn__text'>去添加卡组</Text>
          </View>
        ) : reviewItems.length === 0 ? (
          <View className='home-review-btn' onClick={() => Taro.switchTab({ url: '/pages/decks/index' })}>
            <Text className='home-review-btn__text'>去卡组学习新内容</Text>
          </View>
        ) : (
          <View className='home-review-btn' onClick={handleStartAll}>
            <Text className='home-review-btn__text'>▶ 开始今日复习</Text>
          </View>
        )}
      </View>
    </View>
  )
}
