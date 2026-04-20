import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getStreak, getDateStr } from '@/utils/storage'
import { getOverview } from '@/api/stats'
import { getHistory } from '@/api/stats'
import { getDecks } from '@/api/decks'
import { getCards } from '@/api/cards'
import { loginReady } from '@/utils/loginReady'
import { getDisplayStatus } from '@/utils/sm2'
import { ApiCard } from '@/types/api/card'
import { HistoryRecord } from '@/types'
import StreakOverview from './components/StreakOverview'
import ProgressBreakdown from './components/ProgressBreakdown'
import UpcomingReviews from './components/UpcomingReviews'
import CalendarHeatmap from './components/CalendarHeatmap'
import './index.scss'

export default function Stats() {
  const now = new Date()
  const [year] = useState(now.getFullYear())
  const [month] = useState(now.getMonth())

  const [streakCurrent, setStreakCurrent] = useState(0)
  const [streakLongest, setStreakLongest] = useState(0)
  const [masteryRate, setMasteryRate] = useState(0)
  const [newCount, setNewCount] = useState(0)
  const [unknown, setUnknown] = useState(0)
  const [fuzzy, setFuzzy] = useState(0)
  const [mastered, setMastered] = useState(0)
  const [upcoming, setUpcoming] = useState<{ label: string; count: number; isToday: boolean }[]>([])
  const [reviewHistory, setReviewHistory] = useState<HistoryRecord[]>([])
  const [calendarDays, setCalendarDays] = useState<{ day: number; count: number }[]>([])
  const [maxMonthCount, setMaxMonthCount] = useState(1)

  Taro.useDidShow(() => { loadData() })

  const loadData = async () => {
    await loginReady

    const [overview, historyRes, allDecks] = await Promise.all([
      getOverview(),
      getHistory({ year, month: month + 1 }),
      getDecks(),
    ])

    // streak：current 来自后端，longest 从本地补充
    setStreakCurrent(overview.streak)
    setStreakLongest(Math.max(getStreak().longest, overview.streak))

    // 第二轮：加载所有卡片
    const allCards: ApiCard[] = (await Promise.all(allDecks.map(d => getCards(d._id)))).flat()

    // 4 项状态分布
    let nc = 0, unk = 0, fuz = 0, mas = 0
    for (const c of allCards) {
      const s = getDisplayStatus(c)
      if (s === '未学') nc++
      else if (s === '不会') unk++
      else if (s === '模糊') fuz++
      else mas++
    }
    const total = allCards.length
    setNewCount(nc)
    setUnknown(unk)
    setFuzzy(fuz)
    setMastered(mas)
    setMasteryRate(total > 0 ? Math.round((mas / total) * 100) : 0)

    // 未来 7 天复习计划
    const upcomingItems = Array.from({ length: 7 }, (_, i) => {
      const dateStr = getDateStr(i)
      const prevDateStr = i === 0 ? '' : getDateStr(i - 1)
      const count = allCards.filter(c => {
        if (c.repetitions === 0) return false
        const d = new Date(c.nextReview).toISOString().slice(0, 10)
        return i === 0 ? d <= dateStr : d > prevDateStr && d <= dateStr
      }).length
      const d = new Date(); d.setDate(d.getDate() + i)
      const label = i === 0 ? '今' : `${d.getMonth() + 1}/${d.getDate()}`
      return { label, count, isToday: i === 0 }
    })
    setUpcoming(upcomingItems)

    // 复习历史（月历热图）
    const records = historyRes.records
    setReviewHistory(records)

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const historyMap = records.reduce((acc, r) => { acc[r.date] = r.count; return acc }, {} as Record<string, number>)
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      return { day: d, count: historyMap[dateStr] || 0 }
    })
    setCalendarDays(days)
    setMaxMonthCount(Math.max(...days.map(d => d.count), 1))
  }

  const firstDayOfWeek = new Date(year, month, 1).getDay()

  return (
    <View className='stats-page'>
      <View className='stats-header'>
        <Text className='stats-title'>学习统计</Text>
      </View>

      <StreakOverview current={streakCurrent} longest={streakLongest} masteryRate={masteryRate} />
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
