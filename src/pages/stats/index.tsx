import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getDecks, getStreak, getReviewHistory, getDateStr } from '@/utils/storage'
import { getDisplayStatus } from '@/utils/sm2'
import { ReviewRecord } from '@/types'
import StreakOverview from './components/StreakOverview'
import ProgressBreakdown from './components/ProgressBreakdown'
import UpcomingReviews from './components/UpcomingReviews'
import CalendarHeatmap from './components/CalendarHeatmap'
import './index.scss'

function tsToDateStr(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Stats() {
  const [decks, setDecks] = useState(() => getDecks())
  const [streak, setStreak] = useState(() => getStreak())
  const [reviewHistory, setReviewHistory] = useState<ReviewRecord[]>(() => getReviewHistory())

  Taro.useDidShow(() => {
    setDecks(getDecks())
    setStreak(getStreak())
    setReviewHistory(getReviewHistory())
  })

  const allCards = decks.flatMap(d => d.cards)
  const total = allCards.length
  const newCount = allCards.filter(c => getDisplayStatus(c) === '未学').length
  const unknown = allCards.filter(c => getDisplayStatus(c) === '不会').length
  const fuzzy = allCards.filter(c => getDisplayStatus(c) === '模糊').length
  const mastered = allCards.filter(c => getDisplayStatus(c) === '掌握').length
  const masteryRate = total > 0 ? Math.round((mastered / total) * 100) : 0

  const upcoming = Array.from({ length: 7 }, (_, i) => {
    const dateStr = getDateStr(i)
    const prevDateStr = i === 0 ? '' : getDateStr(i - 1)
    const count = allCards.filter(c => {
      if (c.repetitions === 0) return false
      const d = tsToDateStr(c.nextReview)
      return i === 0 ? d <= dateStr : d > prevDateStr && d <= dateStr
    }).length
    return {
      label: i === 0 ? '今' : i === 1 ? '明' : `+${i}`,
      count,
      isToday: i === 0,
    }
  })

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const historyMap = reviewHistory.reduce((acc, r) => { acc[r.date] = r.count; return acc }, {} as Record<string, number>)
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return { day: d, count: historyMap[dateStr] || 0 }
  })
  const maxMonthCount = Math.max(...calendarDays.map(d => d.count), 1)

  return (
    <View className='stats-page'>
      <View className='stats-header'>
        <Text className='stats-title'>学习统计</Text>
      </View>

      <StreakOverview current={streak.current} longest={streak.longest} masteryRate={masteryRate} />
      <ProgressBreakdown newCount={newCount} unknown={unknown} fuzzy={fuzzy} mastered={mastered} />
      <UpcomingReviews items={upcoming} />
      <CalendarHeatmap
        year={year}
        month={month}
        days={calendarDays}
        firstDayOfWeek={firstDayOfWeek}
        maxCount={maxMonthCount}
      />
    </View>
  )
}
