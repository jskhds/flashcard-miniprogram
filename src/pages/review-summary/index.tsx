import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { setReviewSession, getSummaryResults, clearSummaryResults } from '@/utils/storage'
import { getDueCards } from '@/api/review'
import { ReviewResult } from '@/types'
import SummaryHeader from './components/SummaryHeader'
import SummaryBreakdown from './components/SummaryBreakdown'
import SummaryActions from './components/SummaryActions'
import './index.scss'

interface SummaryData {
  results: ReviewResult[]
  deckId: string
  streak: { current: number; longest: number; lastDate: string }
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
    if (data?.streak) {
      setStreak(data.streak.current)
    }
  }, [])

  if (!data) {
    return <View className='summary-page'><Text>加载中...</Text></View>
  }

  const total = data.results.length
  const know = data.results.filter(r => r.quality === 5).length
  const fuzzy = data.results.filter(r => r.quality === 3).length
  const unknown = data.results.filter(r => r.quality === 0).length
  const knowRate = total > 0 ? Math.round((know / total) * 100) : 0

  const handleRetry = async () => {
    const retryCardIds = new Set(data.results.filter(r => r.quality < 5).map(r => r.cardId))
    if (retryCardIds.size === 0) {
      Taro.showToast({ title: '全部掌握！无需再次复习', icon: 'success' })
      return
    }
    const { cards } = await getDueCards(data.deckId || undefined)
    const retryCards = cards.filter(c => retryCardIds.has(c._id))
    if (retryCards.length === 0) {
      Taro.showToast({ title: '暂无待复习卡片', icon: 'none' })
      return
    }
    setReviewSession({ cards: retryCards, deckId: data.deckId })
    Taro.redirectTo({ url: '/pages/review/index' })
  }

  const handleBack = () => {
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
