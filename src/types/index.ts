export type CardStatus = 'new' | 'learning' | 'review'
export type DisplayStatus = '未学' | '不会' | '模糊' | '掌握'

export interface Card {
  id: string
  front: string
  back: string
  ease: number          // 默认 2.5
  interval: number      // 天数，默认 1
  repetitions: number   // 复习次数，默认 0
  nextReview: number    // timestamp (ms)
  status: CardStatus
  createdAt: number
}

export interface Deck {
  id: string
  name: string
  createdAt: number
  cards: Card[]
}

export interface ReviewRecord {
  date: string    // 'YYYY-MM-DD'
  count: number
}

export interface StreakData {
  current: number
  longest: number
  lastDate: string  // 'YYYY-MM-DD'
}

export interface ReviewSession {
  cards: Card[]
  deckId: string
}

export { ReviewQuality, ReviewResultItem as ReviewResult } from './api/review'
