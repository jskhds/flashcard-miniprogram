import Taro from "@tarojs/taro";
import { StreakData } from "@/types";

const KEYS = {
  STREAK: "flashcard_streak",
  REVIEW_SESSION: "flashcard_review_session",
  SUMMARY_RESULTS: "flashcard_summary_results",
};

// ─── Streak ───────────────────────────────────────────────────────────────────

export function getStreak(): StreakData {
  try {
    const data = Taro.getStorageSync(KEYS.STREAK);
    return data ? JSON.parse(data) : { current: 0, longest: 0, lastDate: "" };
  } catch {
    return { current: 0, longest: 0, lastDate: "" };
  }
}

// ─── Review Session (临时中转) ─────────────────────────────────────────────────

export function setReviewSession(data: any): void {
  try {
    Taro.setStorageSync(KEYS.REVIEW_SESSION, JSON.stringify(data));
  } catch (e) {
    console.error("setReviewSession error", e);
  }
}

export function getReviewSession<T = any>(): T | null {
  try {
    const data = Taro.getStorageSync(KEYS.REVIEW_SESSION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearReviewSession(): void {
  try {
    Taro.removeStorageSync(KEYS.REVIEW_SESSION);
  } catch {}
}

// ─── Summary Results (临时中转) ────────────────────────────────────────────────

export function setSummaryResults(data: any): void {
  try {
    Taro.setStorageSync(KEYS.SUMMARY_RESULTS, JSON.stringify(data));
  } catch (e) {
    console.error("setSummaryResults error", e);
  }
}

export function getSummaryResults<T = any>(): T | null {
  try {
    const data = Taro.getStorageSync(KEYS.SUMMARY_RESULTS);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearSummaryResults(): void {
  try {
    Taro.removeStorageSync(KEYS.SUMMARY_RESULTS);
  } catch {}
}

// ─── Deck Type（本地持久化，不走后端）────────────────────────────────────────

const DECK_TYPES_KEY = "flashcard_deck_types";

export type DeckType = "ja" | "general";

export const getDeckType = (deckId: string): DeckType => {
  const map: Record<string, DeckType> = wx.getStorageSync(DECK_TYPES_KEY) || {};
  return map[deckId] ?? "general";
};

export const setDeckType = (deckId: string, type: DeckType): void => {
  const map: Record<string, DeckType> = wx.getStorageSync(DECK_TYPES_KEY) || {};
  map[deckId] = type;
  wx.setStorageSync(DECK_TYPES_KEY, map);
};

// ─── Favorited Deck IDs（本地持久化，不走后端）────────────────────────────────

const FAV_KEY = "flashcard_favorited_ids";

export const getFavoritedIds = (): string[] => {
  return wx.getStorageSync(FAV_KEY) || [];
};

export const setFavoritedIds = (ids: string[]): void => {
  wx.setStorageSync(FAV_KEY, ids);
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDateStr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
