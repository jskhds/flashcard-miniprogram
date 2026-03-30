import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getDecks, setReviewSession, getStreak } from '@/utils/storage'
import { isDue, getDeckStats } from '@/utils/sm2'
import { Deck, Card } from '@/types'
import TodayStats from './components/TodayStats'
import HomeDeckRow from './components/HomeDeckRow'
import './index.scss'

const DAILY_LIMIT = 20

function getDeckStudyItems(deck: Deck): { due: Card[]; newToStudy: Card[] } {
  const due = deck.cards.filter(c => c.repetitions > 0 && isDue(c))
  const newCards = deck.cards.filter(c => c.repetitions === 0)
  const newAlloc = Math.max(0, DAILY_LIMIT - due.length)
  return { due, newToStudy: newCards.slice(0, newAlloc) }
}

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [activeItems, setActiveItems] = useState<{ deck: Deck; dueCount: number; newCount: number }[]>([])

  Taro.useDidShow(() => { loadData() })

  function loadData() {
    const allDecks = getDecks()
    setDecks(allDecks)
    setStreak(getStreak().current)

    const favDecks = allDecks.filter(d => d.favorited)
    const items = favDecks.map(d => {
      const { due, newToStudy } = getDeckStudyItems(d)
      return { deck: d, dueCount: due.length, newCount: newToStudy.length }
    })
    setActiveItems(items)

    // todayCount = total items in the combined "start all" session
    const allDue = favDecks.flatMap(d => d.cards.filter(c => c.repetitions > 0 && isDue(c)))
    const newAlloc = Math.max(0, DAILY_LIMIT - allDue.length)
    const newCount = favDecks.flatMap(d => d.cards.filter(c => c.repetitions === 0)).slice(0, newAlloc).length
    setTodayCount(allDue.length + newCount)
  }

  function handleDeckStart(deck: Deck) {
    const { due, newToStudy } = getDeckStudyItems(deck)
    setReviewSession({ cards: [...due, ...newToStudy], source: 'deck', deckIds: [deck.id] })
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  function handleStartAll() {
    const favDecks = decks.filter(d => d.favorited)
    const allDue = favDecks.flatMap(d => d.cards.filter(c => c.repetitions > 0 && isDue(c)))
    const newAlloc = Math.max(0, DAILY_LIMIT - allDue.length)
    const allNew = favDecks.flatMap(d => d.cards.filter(c => c.repetitions === 0)).slice(0, newAlloc)
    setReviewSession({ cards: [...allDue, ...allNew], source: 'home', deckIds: favDecks.map(d => d.id) })
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  const totalCards = decks.reduce((s, d) => s + d.cards.length, 0)
  const masteredCards = decks.reduce((s, d) => s + getDeckStats(d).mastered, 0)
  const masteryRate = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0

  const hasFavorited = decks.some(d => d.favorited)
  const hasDecks = decks.length > 0

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
        <Text className='home-section-title'>学习计划</Text>
        {!hasDecks ? (
          <View className='home-empty'>
            <Text className='home-empty__emoji'>🗂️</Text>
            <Text className='home-empty__title'>还没有卡组</Text>
            <Text className='home-empty__desc'>去卡组页创建卡组并添加卡片吧</Text>
          </View>
        ) : !hasFavorited ? (
          <View className='home-no-fav'>
            <Text className='home-no-fav__emoji'>⭐</Text>
            <Text className='home-no-fav__title'>还没有加入学习计划的卡组</Text>
            <Text className='home-no-fav__desc'>在卡组页点击卡组右上角的星标，将它加入每日学习计划</Text>
          </View>
        ) : (
          <>
            {activeItems.map(({ deck, dueCount, newCount }) => (
              <HomeDeckRow
                key={deck.id}
                deck={deck}
                dueCount={dueCount}
                newCount={newCount}
                onClick={() => handleDeckStart(deck)}
              />
            ))}
            <Text className='home-deck-hint'>点击某个卡组可单独学习</Text>
          </>
        )}
      </View>

      <View className='home-bottom'>
        {!hasDecks ? (
          <View className='home-review-btn' onClick={() => {
            Taro.setStorageSync('pendingDeckCreate', true)
            Taro.switchTab({ url: '/pages/decks/index' })
          }}>
            <Text className='home-review-btn__text'>去添加卡组</Text>
          </View>
        ) : !hasFavorited ? (
          <View className='home-review-btn' onClick={() => Taro.switchTab({ url: '/pages/decks/index' })}>
            <Text className='home-review-btn__text'>去收藏卡组</Text>
          </View>
        ) : todayCount === 0 ? (
          <View className='home-review-btn home-review-btn--disabled'>
            <Text className='home-review-btn__text'>今日已完成 ✓</Text>
          </View>
        ) : (
          <View className='home-review-btn' onClick={handleStartAll}>
            <Text className='home-review-btn__text'>▶ 开始今日学习</Text>
          </View>
        )}
      </View>
    </View>
  )
}
