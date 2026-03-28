import { useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getDeckById, saveDecks, getDecks, setReviewSession } from '@/utils/storage'
import { getDisplayStatus } from '@/utils/sm2'
import { DisplayStatus, Card } from '@/types'
import CardStats from './components/CardStats'
import FilterChips from './components/FilterChips'
import CardList from './components/CardList'
import BottomBar from './components/BottomBar'
import './index.scss'

type FilterType = '全部' | DisplayStatus

export default function Cards() {
  const router = useRouter()
  const deckId = router.params.deckId as string
  const [deck, setDeck] = useState(() => getDeckById(deckId))
  const [filter, setFilter] = useState<FilterType>('全部')

  Taro.useDidShow(() => { setDeck(getDeckById(deckId)) })

  if (!deck) {
    return <View className='cards-page'><Text>卡组不存在</Text></View>
  }

  const cards = deck.cards
  const statusCounts = cards.reduce((acc, c) => {
    const s = getDisplayStatus(c)
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {} as Record<DisplayStatus, number>)

  const filteredCards = filter === '全部' ? cards : cards.filter(c => getDisplayStatus(c) === filter)

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
          }
        }
      }
    })
  }

  function handleStartReview() {
    if (cards.length === 0) { Taro.showToast({ title: '暂无卡片', icon: 'none' }); return }
    setReviewSession({ cards, deckId })
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  function handleCardClick(card: Card) {
    setReviewSession({ cards: [card], deckId })
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  function handleCardEdit(card: Card) {
    Taro.navigateTo({ url: `/pages/card-edit/index?deckId=${deckId}&cardId=${card.id}` })
  }

  return (
    <View className='cards-page'>
      <View className='cards-header'>
        <Text className='cards-deck-name'>{deck.name}</Text>
        <Text className='cards-total'>{cards.length} 张卡片</Text>
      </View>
      <CardStats statusCounts={statusCounts} />
      <FilterChips
        active={filter}
        statusCounts={statusCounts}
        totalCount={cards.length}
        onSelect={setFilter}
      />
      <CardList cards={filteredCards} onCardClick={handleCardClick} onEdit={handleCardEdit} onDelete={(card) => handleDelete(card.id)} />
      <BottomBar deckId={deckId} cardCount={cards.length} onStartReview={handleStartReview} />
    </View>
  )
}
