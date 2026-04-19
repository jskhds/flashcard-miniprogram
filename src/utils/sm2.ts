import { Card, Deck, ReviewQuality, DisplayStatus } from '@/types'

/**
 * SM-2 间隔重复算法
 * q=0: 不会 — 重置
 * q=3: 模糊 — 缩短间隔
 * q=5: 掌握 — 正常间隔增长
 */
export function calculateNextReview(card: Card, q: ReviewQuality): Card {
  const now = Date.now()
  let { ease, interval, repetitions } = card

  // 更新 ease factor（SM-2 公式）
  // ease' = ease + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  const newEase = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  ease = Math.max(1.3, newEase)

  if (q === 0) {
    // 不会：重置
    repetitions = 0
    interval = 1
  } else if (q === 3) {
    // 模糊：增加复习次数但缩短间隔
    repetitions += 1
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 3
    } else {
      interval = Math.max(1, Math.round(interval * ease * 0.7))
    }
  } else {
    // q === 5，掌握：正常 SM-2
    repetitions += 1
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * ease)
    }
  }

  const nextReview = now + interval * 24 * 60 * 60 * 1000

  // 更新 status
  let status: Card['status']
  if (repetitions === 0) {
    status = 'new'
  } else if (interval <= 7) {
    status = 'learning'
  } else {
    status = 'review'
  }

  return {
    ...card,
    ease,
    interval,
    repetitions,
    nextReview,
    status
  }
}

/**
 * 从 SM-2 数据派生展示状态
 */
export function getDisplayStatus(card: Card): DisplayStatus {
  if (card.repetitions === 0) return '未学'
  if (card.interval <= 1) return '不会'
  if (card.interval <= 3) return '模糊'
  return '掌握'
}

/**
 * 判断卡片是否到期需要复习
 */
export function isDue(card: Card): boolean {
  return card.nextReview <= Date.now()
}

/**
 * 创建新卡片默认值
 */
export function createCard(front: string, back: string): Card {
  const now = Date.now()
  return {
    id: `card_${now}_${Math.random().toString(36).slice(2, 8)}`,
    front,
    back,
    ease: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: now,
    status: 'new',
    createdAt: now
  }
}

/**
 * 计算卡组统计信息
 */
export function getDeckStats(deck: Deck) {
  const total = deck.cards.length
  if (total === 0) return { total, mastered: 0, rate: 0, due: 0 }
  const mastered = deck.cards.filter(c => getDisplayStatus(c) === '掌握').length
  const due = deck.cards.filter(c => isDue(c)).length
  return { total, mastered, rate: Math.round((mastered / total) * 100), due }
}

/**
 * 将展示状态映射为对应颜色
 */
export function getStatusColor(status: DisplayStatus): string {
  if (status === '掌握') return '#34C759'
  if (status === '模糊') return '#FF9500'
  if (status === '不会') return '#FF3B30'
  return '#C7C7CC'
}

/**
 * 创建新卡组
 */
export function createDeck(name: string) {
  return {
    id: `deck_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    createdAt: Date.now(),
    cards: [] as Card[]
  }
}
