import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getReviewSession, clearReviewSession, updateDeck, getDecks, saveDecks, addReviewRecord, getTodayStr } from '../../utils/storage'
import { calculateNextReview } from '../../utils/sm2'
import { Card, ReviewQuality } from '../../types'
import './index.scss'

interface ReviewResult {
  cardId: string
  quality: ReviewQuality
}

export default function Review() {
  const [cards, setCards] = useState<Card[]>([])
  const [deckId, setDeckId] = useState<string>('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  const [results, setResults] = useState<ReviewResult[]>([])
  const [done, setDone] = useState(false)

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

  function handleFlip() {
    if (!isFlipped) {
      setIsFlipped(true)
    }
  }

  function handleRate(quality: ReviewQuality) {
    if (!currentCard) return

    const updatedCard = calculateNextReview(currentCard, quality)
    const newResults = [...results, { cardId: currentCard.id, quality }]
    setResults(newResults)

    // Update card in storage
    const allDecks = getDecks()
    const deck = allDecks.find(d => d.id === deckId || d.cards.some(c => c.id === currentCard.id))
    if (deck) {
      const cardIdx = deck.cards.findIndex(c => c.id === currentCard.id)
      if (cardIdx !== -1) {
        deck.cards[cardIdx] = updatedCard
      }
      saveDecks(allDecks)
    }

    // Slide to next
    if (currentIndex < cards.length - 1) {
      setIsSliding(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
        setIsSliding(false)
      }, 280)
    } else {
      // All done
      const count = newResults.length
      addReviewRecord(getTodayStr(), count)

      setIsSliding(true)
      setTimeout(() => {
        Taro.setStorageSync('flashcard_summary_results', JSON.stringify({
          results: newResults,
          deckId,
          cards
        }))
        Taro.redirectTo({ url: '/pages/review-summary/index' })
      }, 300)
    }
  }

  if (done || cards.length === 0) {
    return (
      <View className='review-page'>
        <View className='review-loading'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='review-page'>
      {/* Progress */}
      <View className='review-progress'>
        <View className='review-progress__bar'>
          <View className='review-progress__fill' style={{ width: `${progress}%` }} />
        </View>
        <Text className='review-progress__text'>{currentIndex + 1} / {cards.length}</Text>
      </View>

      {/* Card */}
      <View className='review-card-container'>
        <View
          className={`review-card ${isFlipped ? 'review-card--flipped' : ''} ${isSliding ? 'review-card--sliding' : ''}`}
          onClick={handleFlip}
        >
          {/* Front */}
          <View className='review-card__face review-card__front'>
            <Text className='review-card__hint'>点击翻转查看答案</Text>
            <Text className='review-card__content'>{currentCard?.front}</Text>
          </View>

          {/* Back */}
          <View className='review-card__face review-card__back'>
            <View className='review-card__back-front'>
              <Text className='review-card__content review-card__content--small'>{currentCard?.front}</Text>
            </View>
            <View className='review-card__divider' />
            <Text className='review-card__content'>{currentCard?.back}</Text>
          </View>
        </View>
      </View>

      {/* Rating Buttons (shown only after flip) */}
      {isFlipped && (
        <View className='review-ratings'>
          <Text className='review-ratings__label'>我的掌握程度</Text>
          <View className='review-ratings__buttons'>
            <View
              className='review-rate-btn review-rate-btn--unknown'
              onClick={() => handleRate(0)}
            >
              <Text className='review-rate-btn__icon'>✗</Text>
              <Text className='review-rate-btn__label'>不会</Text>
            </View>
            <View
              className='review-rate-btn review-rate-btn--fuzzy'
              onClick={() => handleRate(3)}
            >
              <Text className='review-rate-btn__icon'>△</Text>
              <Text className='review-rate-btn__label'>模糊</Text>
            </View>
            <View
              className='review-rate-btn review-rate-btn--know'
              onClick={() => handleRate(5)}
            >
              <Text className='review-rate-btn__icon'>✓</Text>
              <Text className='review-rate-btn__label'>掌握</Text>
            </View>
          </View>
        </View>
      )}

      {/* Hint when not flipped */}
      {!isFlipped && (
        <View className='review-flip-hint'>
          <Text className='review-flip-hint__text'>轻触卡片查看答案</Text>
        </View>
      )}
    </View>
  )
}
