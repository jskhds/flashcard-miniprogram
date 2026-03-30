import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { updateStreak, setReviewSession, getSummaryResults, clearSummaryResults, getDecks } from '@/utils/storage'
import { Card, ReviewResult } from '@/types'
import SummaryHeader from './components/SummaryHeader'
import SummaryBreakdown from './components/SummaryBreakdown'
import SummaryActions from './components/SummaryActions'
import './index.scss'

interface SummaryData {
  results: ReviewResult[]
  deckId: string
  cards: Card[]
}

export default function ReviewSummary() {
  const [data] = useState<SummaryData | null>(() => {
    const raw = getSummaryResults<SummaryData>()
    if (raw) {
      clearSummaryResults()
      return raw
    }
    return null
  })
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    setStreak(updateStreak().current)
  }, [])

  if (!data) {
    return <View className='summary-page'><Text>加载中...</Text></View>
  }

  const total = data.results.length
  const know = data.results.filter(r => r.quality === 5).length
  const fuzzy = data.results.filter(r => r.quality === 3).length
  const unknown = data.results.filter(r => r.quality === 0).length
  const knowRate = total > 0 ? Math.round((know / total) * 100) : 0

  function handleRetry() {
    const retryCardIds = new Set(data!.results.filter(r => r.quality < 5).map(r => r.cardId))
    if (retryCardIds.size === 0) {
      Taro.showToast({ title: '全部掌握！无需再次复习', icon: 'success' })
      return
    }
    // Read fresh cards from storage so SM-2 data reflects the latest review
    const allDecks = getDecks()
    const sourceCards = data!.deckId
      ? (allDecks.find(d => d.id === data!.deckId)?.cards ?? [])
      : allDecks.flatMap(d => d.cards)
    const retryCards = sourceCards.filter(c => retryCardIds.has(c.id))
    setReviewSession({ cards: retryCards, deckId: data!.deckId })
    Taro.redirectTo({ url: '/pages/review/index' })
  }

  function handleBack() {
    Taro.navigateBack()
  }

  return (
    <View className='summary-page'>
      <SummaryHeader knowRate={knowRate} streak={streak} />

      <View className='summary-big'>
        <Text className='summary-big__number'>{total}</Text>
        <Text className='summary-big__label'>张卡片已复习</Text>
      </View>

      <SummaryBreakdown total={total} know={know} fuzzy={fuzzy} unknown={unknown} />

      <SummaryActions
        retryCount={fuzzy + unknown}
        onRetry={handleRetry}
        onBack={handleBack}
      />
    </View>
  )
}
