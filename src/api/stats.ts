import { request, buildQuery } from './request'
import { OverviewStats, HistoryStats, DeckStatsResponse } from '@/types/api/stats'

/**
 * 首页统计摘要（todayDue、streak、deckCount、totalCards）。
 * GET /api/stats/overview
 */
export const getOverview = (): Promise<OverviewStats> =>
  request<OverviewStats>('GET', '/stats/overview')

/**
 * 复习历史，支持两种模式：
 *   - 近 N 天滚动窗口：传 days（7 或 30）
 *   - 自然月日历：传 year + month（需同时提供）
 * GET /api/stats/history[?days=7|30 | ?year=&month=]
 */
export const getHistory = (params: {
  days?: 7 | 30
  year?: number
  month?: number
}): Promise<HistoryStats> => {
  const query = buildQuery({ days: params.days, year: params.year, month: params.month })
  return request<HistoryStats>('GET', `/stats/history${query}`)
}

/**
 * 各卡组掌握率进度条数据。
 * GET /api/stats/decks
 */
export const getDeckStats = (): Promise<DeckStatsResponse> =>
  request<DeckStatsResponse>('GET', '/stats/decks')
