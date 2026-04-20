import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getFavoritedIds, setReviewSession, getStreak } from '@/utils/storage'
import { getDecks as apiGetDecks } from '@/api/decks'
import { getCards } from '@/api/cards'
import { getDueCards } from '@/api/review'
import { getOverview } from '@/api/stats'
import { ApiDeck } from '@/types/api/deck'
import { loginReady } from '@/utils/loginReady'
import TodayStats from './components/TodayStats'
import HomeDeckRow from './components/HomeDeckRow'
import './index.scss'

type DeckWithFav = ApiDeck & { favorited: boolean }

export default function Home() {
  const [decks, setDecks] = useState<DeckWithFav[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [totalCards, setTotalCards] = useState(0)
  const [masteryRate, setMasteryRate] = useState(0)
  const [activeItems, setActiveItems] = useState<{ deck: DeckWithFav; dueCount: number; newCount: number }[]>([])

  Taro.useDidShow(() => { loadData() })

  const loadData = async () => {
    await loginReady
    const [allDecks, overview] = await Promise.all([apiGetDecks(), getOverview()])

    const favIds = new Set(getFavoritedIds())
    const decksWithFav: DeckWithFav[] = allDecks.map(d => ({ ...d, favorited: favIds.has(d._id) }))
    setDecks(decksWithFav)

    setStreak(overview.streak)
    setTodayCount(overview.todayDue)
    setTotalCards(overview.totalCards)

    const totalMastered = allDecks.reduce((s, d) => s + d.stats.mastered, 0)
    const total = overview.totalCards
    setMasteryRate(total > 0 ? Math.round((totalMastered / total) * 100) : 0)

    const favDecks = decksWithFav.filter(d => d.favorited)
    setActiveItems(favDecks.map(d => ({
      deck: d,
      dueCount: d.stats.due,
      newCount: Math.max(0, d.stats.total - d.stats.mastered - d.stats.due),
    })))
  }

  const handleExtraPractice = async () => {
    const favDecks = decks.filter(d => d.favorited)
    const allCards = (await Promise.all(favDecks.map(d => getCards(d._id)))).flat()
    if (allCards.length === 0) { Taro.showToast({ title: '暂无卡片', icon: 'none' }); return }
    setReviewSession({ cards: allCards, deckId: '' })
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  const handleDeckStart = async (deck: DeckWithFav) => {
    let { cards } = await getDueCards(deck._id)
    if (cards.length === 0) {
      cards = await getCards(deck._id)
    }
    if (cards.length === 0) {
      Taro.showToast({ title: '该卡组暂无卡片', icon: 'none' })
      return
    }
    setReviewSession({ cards, deckId: deck._id })
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  const handleStartAll = async () => {
    const { cards } = await getDueCards()
    if (cards.length === 0) {
      Taro.showToast({ title: '暂无待复习卡片', icon: 'none' })
      return
    }
    const favDecks = decks.filter(d => d.favorited)
    setReviewSession({ cards, deckId: '', deckIds: favDecks.map(d => d._id) })
    Taro.navigateTo({ url: '/pages/review/index' })
  }

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
                key={deck._id}
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
          <View className='home-bottom-row'>
            <View className='home-review-btn home-review-btn--disabled'>
              <Text className='home-review-btn__text'>今日已完成 ✓</Text>
            </View>
            <View className='home-extra-btn' onClick={handleExtraPractice}>
              <Text className='home-extra-btn__text'>额外练习</Text>
            </View>
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
