import { request } from './request'
import { ApiCard, ApiCardStatus, ApiCardUpdated, ApiCardDeleted } from '@/types/api/card'

/**
 * 获取卡组内所有卡片，可按 status 过滤。
 * GET /api/decks/:deckId/cards[?status=new|learning|review]
 */
export const getCards = (deckId: string, status?: ApiCardStatus): Promise<ApiCard[]> => {
  const query = status ? `?status=${status}` : ''
  return request<ApiCard[]>('GET', `/decks/${deckId}/cards${query}`)
}

/**
 * 新建卡片。
 * POST /api/decks/:deckId/cards
 */
export const createCard = (deckId: string, front: string, back: string): Promise<ApiCard> =>
  request<ApiCard>('POST', `/decks/${deckId}/cards`, { front, back })

/**
 * 修改卡片正背面内容（不改 SM-2 数据）。
 * PUT /api/decks/:deckId/cards/:cardId
 */
export const updateCard = (
  deckId: string,
  cardId: string,
  front: string,
  back: string,
): Promise<ApiCardUpdated> =>
  request<ApiCardUpdated>('PUT', `/decks/${deckId}/cards/${cardId}`, { front, back })

/**
 * 删除卡片。
 * DELETE /api/decks/:deckId/cards/:cardId
 */
export const deleteCard = (deckId: string, cardId: string): Promise<ApiCardDeleted> =>
  request<ApiCardDeleted>('DELETE', `/decks/${deckId}/cards/${cardId}`)
