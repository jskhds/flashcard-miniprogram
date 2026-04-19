export interface OverviewStats {
  todayDue: number
  streak: number
  deckCount: number
  totalCards: number
}

export interface HistoryRecord {
  date: string    // 'YYYY-MM-DD'
  count: number
}

export interface HistoryStats {
  records: HistoryRecord[]
  totalReviewed: number
  activeDays: number
  dailyAvg: number
}

export interface DeckStatItem {
  deckId: string
  name: string
  total: number
  mastered: number
  masteryRate: number
}

export interface DeckStatsResponse {
  deckStats: DeckStatItem[]
}
