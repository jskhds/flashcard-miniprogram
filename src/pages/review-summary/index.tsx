import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { updateStreak, setReviewSession } from '../../utils/storage'
import { Card, ReviewQuality } from '../../types'
import './index.scss'

interface ReviewResult {
  cardId: string
  quality: ReviewQuality
}

interface SummaryData {
  results: ReviewResult[]
  deckId: string
  cards: Card[]
}

export default function ReviewSummary() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const raw = Taro.getStorageSync('flashcard_summary_results')
    if (raw) {
      const parsed: SummaryData = JSON.parse(raw)
      setData(parsed)
      Taro.removeStorageSync('flashcard_summary_results')
    }

    // Update streak
    const updatedStreak = updateStreak()
    setStreak(updatedStreak.current)
  }, [])

  if (!data) {
    return (
      <View className='summary-page'>
        <Text>加载中...</Text>
      </View>
    )
  }

  const total = data.results.length
  const know = data.results.filter(r => r.quality === 5).length
  const fuzzy = data.results.filter(r => r.quality === 3).length
  const unknown = data.results.filter(r => r.quality === 0).length
  const knowRate = total > 0 ? Math.round((know / total) * 100) : 0

  function handleRetry() {
    // 仅重复不会+模糊的卡片
    const retryCardIds = new Set(
      data!.results.filter(r => r.quality < 5).map(r => r.cardId)
    )
    const retryCards = data!.cards.filter(c => retryCardIds.has(c.id))

    if (retryCards.length === 0) {
      Taro.showToast({ title: '全部掌握！无需再次复习', icon: 'success' })
      return
    }

    setReviewSession({ cards: retryCards, deckId: data!.deckId })
    Taro.redirectTo({ url: '/pages/review/index' })
  }

  function handleBack() {
    if (data?.deckId) {
      Taro.navigateTo({ url: `/pages/cards/index?deckId=${data.deckId}` })
    } else {
      Taro.switchTab({ url: '/pages/home/index' })
    }
  }

  const getMessage = () => {
    if (knowRate >= 80) return '太棒了！继续保持！'
    if (knowRate >= 50) return '不错！再加把劲！'
    return '没关系，多练几次就好！'
  }

  return (
    <View className='summary-page'>
      {/* Header */}
      <View className='summary-header'>
        <Text className='summary-emoji'>
          {knowRate >= 80 ? '🎉' : knowRate >= 50 ? '💪' : '📖'}
        </Text>
        <Text className='summary-title'>本轮复习完成</Text>
        <Text className='summary-message'>{getMessage()}</Text>

        {streak > 0 && (
          <View className='summary-streak'>
            <Text className='summary-streak__text'>🔥 连续 {streak} 天复习</Text>
          </View>
        )}
      </View>

      {/* Big Number */}
      <View className='summary-big'>
        <Text className='summary-big__number'>{total}</Text>
        <Text className='summary-big__label'>张卡片已复习</Text>
      </View>

      {/* Result Breakdown */}
      <View className='summary-breakdown'>
        <View className='summary-item summary-item--know'>
          <View className='summary-item__top'>
            <Text className='summary-item__count'>{know}</Text>
            <Text className='summary-item__pct'>{total > 0 ? Math.round(know/total*100) : 0}%</Text>
          </View>
          <Text className='summary-item__label'>掌握</Text>
          <View className='summary-item__bar'>
            <View
              className='summary-item__fill'
              style={{ width: `${total > 0 ? (know/total*100) : 0}%`, background: '#34C759' }}
            />
          </View>
        </View>

        <View className='summary-item summary-item--fuzzy'>
          <View className='summary-item__top'>
            <Text className='summary-item__count'>{fuzzy}</Text>
            <Text className='summary-item__pct'>{total > 0 ? Math.round(fuzzy/total*100) : 0}%</Text>
          </View>
          <Text className='summary-item__label'>模糊</Text>
          <View className='summary-item__bar'>
            <View
              className='summary-item__fill'
              style={{ width: `${total > 0 ? (fuzzy/total*100) : 0}%`, background: '#FF9500' }}
            />
          </View>
        </View>

        <View className='summary-item summary-item--unknown'>
          <View className='summary-item__top'>
            <Text className='summary-item__count'>{unknown}</Text>
            <Text className='summary-item__pct'>{total > 0 ? Math.round(unknown/total*100) : 0}%</Text>
          </View>
          <Text className='summary-item__label'>不会</Text>
          <View className='summary-item__bar'>
            <View
              className='summary-item__fill'
              style={{ width: `${total > 0 ? (unknown/total*100) : 0}%`, background: '#FF3B30' }}
            />
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className='summary-actions'>
        {(fuzzy + unknown) > 0 && (
          <View className='summary-btn summary-btn--retry' onClick={handleRetry}>
            <Text className='summary-btn__text'>再复习一遍 · {fuzzy + unknown} 张</Text>
          </View>
        )}
        <View className='summary-btn summary-btn--back' onClick={handleBack}>
          <Text className='summary-btn__text'>返回卡组</Text>
        </View>
      </View>
    </View>
  )
}
