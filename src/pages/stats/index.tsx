import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getReviewHistory, getDecks, getDateStr } from '@/utils/storage'
import { getDisplayStatus } from '@/utils/sm2'
import { ReviewRecord } from '@/types'
import StatsOverview from './components/StatsOverview'
import LineChart from './components/LineChart'
import DeckMasteryBars from './components/DeckMasteryBars'
import CalendarHeatmap from './components/CalendarHeatmap'
import './index.scss'

type Period = '7天' | '30天'

export default function Stats() {
  const [period, setPeriod] = useState<Period>('7天')
  const [reviewHistory, setReviewHistory] = useState<ReviewRecord[]>([])
  const [decks, setDecks] = useState(() => getDecks())

  Taro.useDidShow(() => {
    setReviewHistory(getReviewHistory())
    setDecks(getDecks())
  })

  const days = period === '7天' ? 7 : 30
  const dateRange = Array.from({ length: days }, (_, i) => getDateStr(-(days - 1 - i)))
  const historyMap = reviewHistory.reduce((acc, r) => { acc[r.date] = r.count; return acc }, {} as Record<string, number>)

  const chartData = dateRange.map(date => ({
    date,
    count: historyMap[date] || 0,
    label: date.slice(5).replace('-', '/'),
  }))

  const totalReviewed = chartData.reduce((s, d) => s + d.count, 0)
  const activeDays = chartData.filter(d => d.count > 0).length
  const dailyAvg = activeDays > 0 ? Math.round(totalReviewed / activeDays) : 0

  const deckStats = decks.map(deck => {
    const total = deck.cards.length
    if (total === 0) return { name: deck.name, rate: 0, total, mastered: 0 }
    const mastered = deck.cards.filter(c => getDisplayStatus(c) === '掌握').length
    return { name: deck.name, rate: Math.round((mastered / total) * 100), total, mastered }
  })

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
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

      <View className='stats-toggle'>
        {(['7天', '30天'] as Period[]).map(p => (
          <View
            key={p}
            className={`stats-toggle-btn ${period === p ? 'stats-toggle-btn--active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            <Text className='stats-toggle-btn__text'>{p}</Text>
          </View>
        ))}
      </View>

      <StatsOverview totalReviewed={totalReviewed} activeDays={activeDays} dailyAvg={dailyAvg} />
      <LineChart chartData={chartData} days={days} />
      <DeckMasteryBars deckStats={deckStats} />
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
