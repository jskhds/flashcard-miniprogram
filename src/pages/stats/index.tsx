import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { getReviewHistory, getDecks, getDateStr } from '../../utils/storage'
import { getDisplayStatus } from '../../utils/sm2'
import { ReviewRecord } from '../../types'
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

  // Build date range
  const dateRange = Array.from({ length: days }, (_, i) => {
    return getDateStr(-(days - 1 - i))
  })

  // Map history to dict
  const historyMap = reviewHistory.reduce((acc, r) => {
    acc[r.date] = r.count
    return acc
  }, {} as Record<string, number>)

  const chartData = dateRange.map(date => ({
    date,
    count: historyMap[date] || 0,
    label: date.slice(5).replace('-', '/')
  }))

  const maxCount = Math.max(...chartData.map(d => d.count), 1)
  const totalReviewed = chartData.reduce((s, d) => s + d.count, 0)

  // Deck mastery data
  const deckStats = decks.map(deck => {
    const total = deck.cards.length
    if (total === 0) return { name: deck.name, rate: 0, total, mastered: 0 }
    const mastered = deck.cards.filter(c => getDisplayStatus(c) === '掌握').length
    return { name: deck.name, rate: Math.round((mastered / total) * 100), total, mastered }
  })

  // Calendar heatmap for current month
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

  const getHeatColor = (count: number) => {
    if (count === 0) return '#F2E8DB'
    const intensity = count / maxMonthCount
    if (intensity < 0.25) return '#FAC4AE'
    if (intensity < 0.5) return '#F4845F'
    if (intensity < 0.75) return '#E06040'
    return '#C04030'
  }

  // SVG line chart
  const svgWidth = 600
  const svgHeight = 160
  const padX = 10
  const padY = 16
  const chartW = svgWidth - padX * 2
  const chartH = svgHeight - padY * 2

  const points = chartData.map((d, i) => {
    const x = padX + (i / (chartData.length - 1)) * chartW
    const y = padY + chartH - (d.count / maxCount) * chartH
    return { x, y, ...d }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const area = `${padX},${padY + chartH} ${polyline} ${padX + chartW},${padY + chartH}`

  return (
    <View className='stats-page'>
      <View className='stats-header'>
        <Text className='stats-title'>学习统计</Text>
      </View>

      {/* Period Toggle */}
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

      {/* Overview */}
      <View className='stats-overview'>
        <View className='stats-overview-item'>
          <Text className='stats-overview-value'>{totalReviewed}</Text>
          <Text className='stats-overview-label'>复习次数</Text>
        </View>
        <View className='stats-overview-divider' />
        <View className='stats-overview-item'>
          <Text className='stats-overview-value'>
            {chartData.filter(d => d.count > 0).length}
          </Text>
          <Text className='stats-overview-label'>活跃天数</Text>
        </View>
        <View className='stats-overview-divider' />
        <View className='stats-overview-item'>
          <Text className='stats-overview-value'>
            {chartData.filter(d => d.count > 0).length > 0
              ? Math.round(totalReviewed / chartData.filter(d => d.count > 0).length)
              : 0}
          </Text>
          <Text className='stats-overview-label'>日均复习</Text>
        </View>
      </View>

      {/* Line Chart */}
      <View className='stats-card'>
        <Text className='stats-card-title'>复习趋势</Text>
        <View className='stats-chart'>
          <svg
            width='100%'
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className='stats-svg'
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
              <line
                key={i}
                x1={padX}
                y1={padY + chartH * (1 - frac)}
                x2={padX + chartW}
                y2={padY + chartH * (1 - frac)}
                stroke='#EDE0D0'
                strokeWidth='1'
              />
            ))}

            {/* Area fill */}
            {points.length > 1 && (
              <polygon
                points={area}
                fill='rgba(244, 132, 95, 0.12)'
              />
            )}

            {/* Line */}
            {points.length > 1 && (
              <polyline
                points={polyline}
                fill='none'
                stroke='#F4845F'
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            )}

            {/* Dots */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r='5'
                fill={p.count > 0 ? '#F4845F' : '#F2E8DB'}
                stroke='#F4845F'
                strokeWidth='2'
              />
            ))}
          </svg>

          {/* X-axis labels */}
          <View className='stats-x-labels'>
            {chartData
              .filter((_, i) => {
                if (days === 7) return true
                return i % 5 === 0 || i === days - 1
              })
              .map((d, i) => (
                <Text key={i} className='stats-x-label'>{d.label}</Text>
              ))}
          </View>
        </View>
      </View>

      {/* Deck Mastery Bar Chart */}
      {deckStats.length > 0 && (
        <View className='stats-card'>
          <Text className='stats-card-title'>卡组掌握率</Text>
          <View className='stats-deck-bars'>
            {deckStats.map((d, i) => (
              <View key={i} className='stats-deck-bar-item'>
                <View className='stats-deck-bar-label-row'>
                  <Text className='stats-deck-bar-name' numberOfLines={1}>{d.name}</Text>
                  <Text className='stats-deck-bar-pct'>{d.rate}%</Text>
                </View>
                <View className='stats-deck-bar-track'>
                  <View
                    className='stats-deck-bar-fill'
                    style={{ width: `${d.rate}%` }}
                  />
                </View>
                <Text className='stats-deck-bar-sub'>掌握 {d.mastered}/{d.total}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Calendar Heatmap */}
      <View className='stats-card'>
        <Text className='stats-card-title'>
          {year}年{month + 1}月 学习热力图
        </Text>
        <View className='stats-calendar'>
          {/* Day of week headers */}
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <View key={d} className='stats-cal-header'>
              <Text className='stats-cal-header-text'>{d}</Text>
            </View>
          ))}

          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <View key={`empty-${i}`} className='stats-cal-cell stats-cal-cell--empty' />
          ))}

          {/* Day cells */}
          {calendarDays.map(({ day, count }) => (
            <View
              key={day}
              className='stats-cal-cell'
              style={{ background: getHeatColor(count) }}
            >
              <Text className='stats-cal-day'>{day}</Text>
              {count > 0 && (
                <Text className='stats-cal-count'>{count}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
