import { request } from './request'
import { ApiDeck, ApiDeckUpdated, ApiDeckDeleted } from '@/types/api/deck'

/**
 * 获取当前用户所有卡组（含统计摘要，不含嵌套卡片）。
 * GET /api/decks
 */
export const getDecks = (): Promise<ApiDeck[]> =>
  request<ApiDeck[]>('GET', '/decks')

/**
 * 创建卡组。
 * POST /api/decks
 */
export const createDeck = (name: string): Promise<ApiDeck> =>
  request<ApiDeck>('POST', '/decks', { name })

/**
 * 修改卡组名称。
 * PUT /api/decks/:deckId
 */
export const updateDeck = (deckId: string, name: string): Promise<ApiDeckUpdated> =>
  request<ApiDeckUpdated>('PUT', `/decks/${deckId}`, { name })

/**
 * 删除卡组（级联删除其下所有卡片）。
 * DELETE /api/decks/:deckId
 */
export const deleteDeck = (deckId: string): Promise<ApiDeckDeleted> =>
  request<ApiDeckDeleted>('DELETE', `/decks/${deckId}`)
