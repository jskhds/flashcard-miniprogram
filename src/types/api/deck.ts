export interface ApiDeckStats {
  total: number
  due: number
  mastered: number
  masteryRate: number
}

export interface ApiDeck {
  _id: string
  name: string
  createdAt: string      // ISO 日期字符串
  stats: ApiDeckStats
}

export interface ApiDeckUpdated {
  _id: string
  name: string
}

export interface ApiDeckDeleted {
  deletedCards: number
}
