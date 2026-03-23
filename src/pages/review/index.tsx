import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getReviewSession, clearReviewSession, getDecks, saveDecks, addReviewRecord, getTodayStr, setSummaryResults } from '@/utils/storage'
import { calculateNextReview } from '@/utils/sm2'
import { Card, ReviewQuality, ReviewResult } from '@/types'
import ReviewProgress from './components/ReviewProgress'
import ReviewCard from './components/ReviewCard'
import RatingButtons from './components/RatingButtons'
import './index.scss'

export default function Review() {
  const [cards, setCards] = useState<Card[]>([])
  const [deckId, setDeckId] = useState<string>('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  const [results, setResults] = useState<ReviewResult[]>([])

  useEffect(() => {
    const session = getReviewSession<{ cards: Card[], deckId: string }>()
    if (!session || session.cards.length === 0) {
      Taro.showToast({ title: '没有卡片可以复习', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 800)
      return
    }
    setCards(session.cards)
    setDeckId(session.deckId || '')
    clearReviewSession()
  }, [])

  const currentCard = cards[currentIndex]
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0

  function handleRate(quality: ReviewQuality) {
    if (!currentCard) return

    const updatedCard = calculateNextReview(currentCard, quality)
    const newResults = [...results, { cardId: currentCard.id, quality }]
    setResults(newResults)

    const allDecks = getDecks()
    const deck = allDecks.find(d => d.cards.some(c => c.id === currentCard.id))
    if (deck) {
      const cardIdx = deck.cards.findIndex(c => c.id === currentCard.id)
      if (cardIdx !== -1) deck.cards[cardIdx] = updatedCard
      saveDecks(allDecks)
    }

    if (currentIndex < cards.length - 1) {
      setIsSliding(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
        setIsSliding(false)
      }, 280)
    } else {
      addReviewRecord(getTodayStr(), newResults.length)
      setIsSliding(true)
      setTimeout(() => {
        setSummaryResults({ results: newResults, deckId, cards })
        Taro.redirectTo({ url: '/pages/review-summary/index' })
      }, 300)
    }
  }

  if (cards.length === 0) {
    return (
      <View className='review-page'>
        <View className='review-loading'><Text>加载中...</Text></View>
      </View>
    )
  }

  return (
    <View className='review-page'>
      <ReviewProgress current={currentIndex + 1} total={cards.length} progress={progress} />
      <ReviewCard
        card={currentCard}
        isFlipped={isFlipped}
        isSliding={isSliding}
        onFlip={() => { if (!isFlipped) setIsFlipped(true) }}
      />
      {isFlipped
        ? <RatingButtons onRate={handleRate} />
        : (
          <View className='review-flip-hint'>
            <Text className='review-flip-hint__text'>轻触卡片查看答案</Text>
          </View>
        )
      }
    </View>
  )
}
