# 类型定义文档（src/types/）

类型分两层：`types/index.ts` 定义本地业务类型，`types/api/` 定义后端响应类型。

---

## types/index.ts — 本地公共类型

**路径**：`src/types/index.ts`

### CardStatus
```typescript
type CardStatus = 'new' | 'learning' | 'review'
```
卡片后端存储状态，由 SM-2 间隔决定。

### DisplayStatus
```typescript
type DisplayStatus = '未学' | '不会' | '模糊' | '掌握'
```
前端展示状态，由 `utils/sm2.getDisplayStatus()` 从 `repetitions` + `interval` 派生：
- `repetitions === 0` → 未学
- `interval <= 1` → 不会
- `interval <= 3` → 模糊
- `interval > 3` → 掌握

### ReviewQuality（枚举）
```typescript
enum ReviewQuality {
  Again = 0,  // 不会
  Hard  = 3,  // 模糊
  Good  = 5,  // 掌握
}
```

### Card（本地卡片类型）
```typescript
interface Card {
  id: string
  front: string
  back: string
  ease: number           // SM-2 ease factor，默认 2.5
  interval: number       // 复习间隔（天）
  repetitions: number    // 成功复习次数
  nextReview: number     // 下次复习时间戳（ms）
  status: CardStatus
  createdAt: number      // 时间戳（ms）
}
```

> 注意：本地 `Card` 与后端 `ApiCard` 的关键差异：
> - ID：`id` vs `_id`
> - nextReview：`number`（时间戳）vs `string`（ISO）
> - createdAt：`number`（时间戳）vs `string`（ISO）

### Deck（本地卡组类型）
```typescript
interface Deck {
  id: string
  name: string
  createdAt: number
  cards: Card[]          // 嵌套卡片（API 版无此字段）
  favorited?: boolean
}
```

### ReviewRecord
```typescript
interface ReviewRecord {
  date: string   // 'YYYY-MM-DD'
  count: number  // 当天复习数量
}
```

### StreakData
```typescript
interface StreakData {
  current: number   // 当前连续天数
  longest: number   // 历史最长连续天数
  lastDate: string  // 最后更新日期 'YYYY-MM-DD'
}
```

### ReviewResult（评分记录，用于 submitReview）
```typescript
interface ReviewResult {
  cardId: string
  quality: ReviewQuality
}
```

---

## types/api/auth.ts

**路径**：`src/types/api/auth.ts`

```typescript
interface LoginResponse {
  token: string
  isNewUser: boolean
}
```

---

## types/api/deck.ts

**路径**：`src/types/api/deck.ts`

```typescript
interface ApiDeckStats {
  total: number        // 总卡片数
  due: number          // 今日到期数
  mastered: number     // 已掌握数
  masteryRate: number  // 掌握率（0-100）
}

interface ApiDeck {
  _id: string
  name: string
  createdAt: string    // ISO 日期字符串
  stats: ApiDeckStats
}

interface ApiDeckUpdated {
  _id: string
  name: string
}

interface ApiDeckDeleted {
  deletedCards: number  // 被一并删除的卡片数量
}
```

---

## types/api/card.ts

**路径**：`src/types/api/card.ts`

```typescript
type ApiCardStatus = 'new' | 'learning' | 'review'

interface ApiCard {
  _id: string
  front: string
  back: string
  ease: number
  interval: number
  repetitions: number
  nextReview: string    // ISO 日期字符串
  status: ApiCardStatus
  createdAt: string     // ISO 日期字符串
  deckId?: string       // 仅在 getDueCards 响应中包含（跨卡组时标识归属）
}

interface ApiCardUpdated {
  _id: string
  front: string
  back: string
}

interface ApiCardDeleted {
  deleted: boolean
}
```

> 判断是否到期：`new Date(card.nextReview) <= new Date()`

---

## types/api/review.ts

**路径**：`src/types/api/review.ts`

```typescript
enum ReviewQuality {
  Again = 0,
  Hard  = 3,
  Good  = 5,
}

interface ReviewResultItem {
  cardId: string
  quality: ReviewQuality
}

interface DueCardsResponse {
  cards: ApiCard[]
  total: number
}

interface UpdatedCardSM2 {
  _id: string
  ease: number
  interval: number
  repetitions: number
  nextReview: string
  status: ApiCardStatus
}

interface SubmitReviewResponse {
  reviewed: number
  streak: {
    current: number
    longest: number
    lastDate: string
  }
  updatedCards: UpdatedCardSM2[]
}
```

---

## types/api/stats.ts

**路径**：`src/types/api/stats.ts`

```typescript
interface OverviewStats {
  todayDue: number     // 今日到期卡片总数
  streak: number       // 当前连续复习天数
  deckCount: number    // 卡组总数
  totalCards: number   // 卡片总数
}

interface HistoryRecord {
  date: string         // 'YYYY-MM-DD'
  count: number        // 当天复习数
}

interface HistoryStats {
  records: HistoryRecord[]
  totalReviewed: number  // 区间内总复习数
  activeDays: number     // 有复习记录的天数
  dailyAvg: number       // 日均复习数
}

interface DeckStatItem {
  deckId: string
  name: string
  total: number
  mastered: number
  masteryRate: number
}

interface DeckStatsResponse {
  deckStats: DeckStatItem[]
}
```
