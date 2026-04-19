export type ApiCardStatus = 'new' | 'learning' | 'review'

export interface ApiCard {
  _id: string
  front: string
  back: string
  ease: number
  interval: number
  repetitions: number
  nextReview: string     // ISO 日期字符串
  status: ApiCardStatus
  createdAt: string      // ISO 日期字符串
  deckId?: string        // getDueCards 响应中包含
}

export interface ApiCardUpdated {
  _id: string
  front: string
  back: string
}

export interface ApiCardDeleted {
  deleted: boolean
}
