import Taro from '@tarojs/taro'
import { Deck, ReviewRecord, StreakData } from '@/types'

const KEYS = {
  DECKS: 'flashcard_decks',
  REVIEW_HISTORY: 'flashcard_review_history',
  STREAK: 'flashcard_streak',
  REVIEW_SESSION: 'flashcard_review_session'
}

// ─── Decks ───────────────────────────────────────────────────────────────────

export function getDecks(): Deck[] {
  try {
    const data = Taro.getStorageSync(KEYS.DECKS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveDecks(decks: Deck[]): void {
  try {
    Taro.setStorageSync(KEYS.DECKS, JSON.stringify(decks))
  } catch (e) {
    console.error('saveDecks error', e)
  }
}

export function getDeckById(id: string): Deck | null {
  const decks = getDecks()
  return decks.find(d => d.id === id) ?? null
}

export function updateDeck(updated: Deck): void {
  const decks = getDecks()
  const idx = decks.findIndex(d => d.id === updated.id)
  if (idx !== -1) {
    decks[idx] = updated
    saveDecks(decks)
  }
}

export function deleteDeck(id: string): void {
  const decks = getDecks().filter(d => d.id !== id)
  saveDecks(decks)
}

// ─── Review History ───────────────────────────────────────────────────────────

export function getReviewHistory(): ReviewRecord[] {
  try {
    const data = Taro.getStorageSync(KEYS.REVIEW_HISTORY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addReviewRecord(date: string, count: number): void {
  try {
    const history = getReviewHistory()
    const existing = history.find(r => r.date === date)
    if (existing) {
      existing.count += count
    } else {
      history.push({ date, count })
    }
    Taro.setStorageSync(KEYS.REVIEW_HISTORY, JSON.stringify(history))
  } catch (e) {
    console.error('addReviewRecord error', e)
  }
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export function getStreak(): StreakData {
  try {
    const data = Taro.getStorageSync(KEYS.STREAK)
    return data ? JSON.parse(data) : { current: 0, longest: 0, lastDate: '' }
  } catch {
    return { current: 0, longest: 0, lastDate: '' }
  }
}

export function updateStreak(): StreakData {
  try {
    const today = getTodayStr()
    const streak = getStreak()

    if (streak.lastDate === today) {
      return streak  // 今日已更新
    }

    const yesterday = getDateStr(-1)
    if (streak.lastDate === yesterday) {
      streak.current += 1
    } else {
      streak.current = 1
    }

    streak.longest = Math.max(streak.longest, streak.current)
    streak.lastDate = today

    Taro.setStorageSync(KEYS.STREAK, JSON.stringify(streak))
    return streak
  } catch {
    return { current: 0, longest: 0, lastDate: '' }
  }
}

// ─── Review Session (临时中转) ─────────────────────────────────────────────────

export function setReviewSession(data: any): void {
  try {
    Taro.setStorageSync(KEYS.REVIEW_SESSION, JSON.stringify(data))
  } catch (e) {
    console.error('setReviewSession error', e)
  }
}

export function getReviewSession<T = any>(): T | null {
  try {
    const data = Taro.getStorageSync(KEYS.REVIEW_SESSION)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function clearReviewSession(): void {
  try {
    Taro.removeStorageSync(KEYS.REVIEW_SESSION)
  } catch {}
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTodayStr(): string {
  return getDateStr(0)
}

export function getDateStr(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
