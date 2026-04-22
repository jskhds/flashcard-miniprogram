import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import { getCards, deleteCard } from '@/api/cards'
import { getDueCards } from '@/api/review'
import { setReviewSession, getDeckType } from '@/utils/storage'
import { loginReady } from '@/utils/loginReady'
import { getDisplayStatus } from '@/utils/sm2'
import { DisplayStatus } from '@/types'
import { ApiCard } from '@/types/api/card'
import CardStats from './components/CardStats'
import FilterChips from './components/FilterChips'
import CardList from './components/CardList'
import BottomBar from './components/BottomBar'
import './index.scss'

type FilterType = '全部' | DisplayStatus

export default function Cards() {
  const router = useRouter()
  const deckId = router.params.deckId as string
  const deckName = decodeURIComponent(router.params.deckName ?? '')
  const [cards, setCards] = useState<ApiCard[]>([])
  const [filter, setFilter] = useState<FilterType>('全部')
  const [search, setSearch] = useState('')
  const [btnReady, setBtnReady] = useState(false)

  const loadCards = async () => {
    await loginReady
    const data = await getCards(deckId)
    setCards(data)
  }

  Taro.useDidShow(() => { loadCards() })

  useEffect(() => {
    const id = setTimeout(() => setBtnReady(true), 350)
    return () => clearTimeout(id)
  }, [])

  const isDue = (card: ApiCard) => new Date(card.nextReview) <= new Date()

  const statusCounts = cards.reduce((acc, c) => {
    const s = getDisplayStatus(c)
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {} as Record<DisplayStatus, number>)

  const masteredCount = statusCounts['掌握'] || 0
  const dueCount = cards.filter(isDue).length

  const filteredCards = (
    filter === '全部'
      ? cards
      : cards.filter(c => getDisplayStatus(c) === filter)
  ).filter(c => !search || c.front.includes(search) || c.back.includes(search))

  const handleDelete = (card: ApiCard) => {
    Taro.showModal({
      title: '删除卡片',
      content: '是否确认删除？删除后无法恢复。',
      cancelText: '取消',
      confirmText: '删除',
      confirmColor: '#FF3B30',
      success: async (res) => {
        if (res.confirm) {
          await deleteCard(deckId, card._id)
          const data = await getCards(deckId)
          setCards(data)
        }
      }
    })
  }

  const isTodayDone = filter === '全部' && dueCount === 0 && cards.length > 0

  const handleStartReview = async () => {
    if (filter === '全部') {
      const { cards: dueCards } = await getDueCards(deckId)
      if (dueCards.length === 0) return
      setReviewSession({ cards: dueCards, deckId })
    } else {
      if (filteredCards.length === 0) { Taro.showToast({ title: '暂无卡片', icon: 'none' }); return }
      setReviewSession({ cards: filteredCards, deckId })
    }
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  const handleExtraPractice = () => {
    setReviewSession({ cards, deckId })
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  const handleCardClick = (card: ApiCard) => {
    setReviewSession({ cards: [card], deckId })
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  const handleCardEdit = (card: ApiCard) => {
    const deckType = getDeckType(deckId)
    Taro.navigateTo({ url: `/pages/card-edit/index?deckId=${deckId}&cardId=${card._id}&deckType=${deckType}` })
  }

  const handleAddCard = () => {
    const deckType = getDeckType(deckId)
    Taro.navigateTo({ url: `/pages/card-edit/index?deckId=${deckId}&deckType=${deckType}` })
  }

  return (
    <View className='cards-page'>
      <View className='cards-header'>
        <Text className='cards-deck-name'>{deckName}</Text>
        <View className='cards-add-btn' onClick={handleAddCard}>
          <Text className='cards-add-btn__icon'>+</Text>
        </View>
      </View>
      <CardStats totalCount={cards.length} masteredCount={masteredCount} dueCount={dueCount} />
      <FilterChips
        active={filter}
        statusCounts={statusCounts}
        totalCount={cards.length}
        onSelect={setFilter}
      />
      <View className='cards-search'>
        <Input
          className='cards-search__input'
          placeholder='🔍  搜索卡片'
          value={search}
          onInput={e => setSearch(e.detail.value)}
        />
      </View>
      <CardList cards={filteredCards} onCardClick={handleCardClick} onEdit={handleCardEdit} onDelete={handleDelete} />
      <BottomBar count={filteredCards.length} filter={filter} disabled={filteredCards.length === 0} ready={btnReady} completedToday={isTodayDone} onStartReview={handleStartReview} onExtraPractice={handleExtraPractice} />
    </View>
  )
}
