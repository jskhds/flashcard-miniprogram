import { ApiCard, ApiCardStatus } from './card'

export enum ReviewQuality {
  Again = 0,  // 不会，重置间隔
  Hard  = 3,  // 模糊，间隔小幅增长
  Good  = 5,  // 掌握，间隔正常增长
}

export interface ReviewResultItem {
  cardId: string
  quality: ReviewQuality
}

export interface DueCardsResponse {
  cards: ApiCard[]
  total: number
}

export interface UpdatedCardSM2 {
  _id: string
  ease: number
  interval: number
  repetitions: number
  nextReview: string
  status: ApiCardStatus
}

export interface SubmitReviewResponse {
  reviewed: number
  streak: {
    current: number
    longest: number
    lastDate: string
  }
  updatedCards: UpdatedCardSM2[]
}
