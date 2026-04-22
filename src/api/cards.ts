import { request } from './request'
import { ApiCard, ApiCardStatus, ApiCardUpdated, ApiCardDeleted } from '@/types/api/card'

interface CardFields {
  front: string
  back: string
  reading?: string
  romaji?: string
  pitch?: number
  meaning?: string
  example?: string
}

export const getCards = (deckId: string, status?: ApiCardStatus): Promise<ApiCard[]> => {
  const query = status ? `?status=${status}` : ''
  return request<ApiCard[]>('GET', `/decks/${deckId}/cards${query}`)
}

export const createCard = (deckId: string, fields: CardFields): Promise<ApiCard> =>
  request<ApiCard>('POST', `/decks/${deckId}/cards`, fields)

export const updateCard = (
  deckId: string,
  cardId: string,
  fields: CardFields,
): Promise<ApiCardUpdated> =>
  request<ApiCardUpdated>('PUT', `/decks/${deckId}/cards/${cardId}`, fields)

export const deleteCard = (deckId: string, cardId: string): Promise<ApiCardDeleted> =>
  request<ApiCardDeleted>('DELETE', `/decks/${deckId}/cards/${cardId}`)

export const batchCreateCards = (deckId: string, cards: CardFields[]): Promise<{ created: number }> =>
  request<{ created: number }>('POST', `/decks/${deckId}/cards/batch`, { cards })
