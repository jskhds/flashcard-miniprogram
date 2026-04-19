import { request } from './request'
import { DueCardsResponse, ReviewResultItem, SubmitReviewResponse } from '@/types/api/review'

/**
 * 获取到期需复习的卡片（nextReview <= now）。
 * GET /api/review/due[?deckId=xxx]
 */
export const getDueCards = (deckId?: string): Promise<DueCardsResponse> => {
  const query = deckId ? `?deckId=${deckId}` : ''
  return request<DueCardsResponse>('GET', `/review/due${query}`)
}

/**
 * 提交本次复习评分，后端执行 SM-2 并更新 Streak。
 * POST /api/review/submit
 */
export const submitReview = (
  deckId: string,
  results: ReviewResultItem[],
): Promise<SubmitReviewResponse> =>
  request<SubmitReviewResponse>('POST', '/review/submit', { deckId, results })
