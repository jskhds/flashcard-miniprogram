# 工具函数文档（src/utils/）

---

## loginReady.ts — 登录就绪 Promise

**路径**：`src/utils/loginReady.ts`

### 导出

| 名称 | 类型 | 说明 |
|------|------|------|
| `loginReady` | `Promise<void>` | 全局登录就绪 Promise，所有页面加载前 await |
| `resolveLogin` | `() => void` | app.tsx 登录成功后调用，解锁所有等待方 |
| `rejectLogin` | `(err: Error) => void` | 登录失败时调用 |

### 原理

```typescript
let resolveLogin!: () => void
let rejectLogin!: (err: Error) => void

export const loginReady = new Promise<void>((resolve, reject) => {
  resolveLogin = resolve
  rejectLogin = reject
})

export { resolveLogin, rejectLogin }
```

**使用规范**：
```typescript
// app.tsx
resolveLogin()  // 登录成功后调用

// 所有业务页面
const loadData = async () => {
  await loginReady  // 等待 token 就绪
  const data = await getDecks()  // 再发请求
}
```

**Why**：Taro 小程序中，页面的 `useDidShow` 可能在 app.tsx 登录完成之前触发，直接发请求会因 token 缺失而 401。

---

## sm2.ts — SM-2 算法与状态派生

**路径**：`src/utils/sm2.ts`

> 注意：SM-2 计算当前已移至后端执行（`submitReview` API）。  
> 此文件中的 `calculateNextReview` 和 `createCard / createDeck` 为本地历史兼容代码；  
> `getDisplayStatus` 和 `getStatusColor` 仍在前端展示逻辑中使用。

### 导出函数

#### `getDisplayStatus(card)` — 派生展示状态
```typescript
function getDisplayStatus(card: { repetitions: number; interval: number }): DisplayStatus
```

| 条件 | 返回 |
|------|------|
| `repetitions === 0` | `'未学'` |
| `interval <= 1` | `'不会'` |
| `interval <= 3` | `'模糊'` |
| `interval > 3` | `'掌握'` |

**使用场景**：cards 页状态 Tab 过滤、stats 页 4 种状态分布计算。

---

#### `getStatusColor(status)` — 状态颜色映射
```typescript
function getStatusColor(status: DisplayStatus): string
```

| 状态 | 颜色 |
|------|------|
| `掌握` | `#34C759`（绿） |
| `模糊` | `#FF9500`（橙） |
| `不会` | `#FF3B30`（红） |
| `未学` | `#C7C7CC`（灰） |

---

#### `calculateNextReview(card, quality)` — SM-2 算法（本地版，已弃用）
```typescript
function calculateNextReview(card: Card, q: ReviewQuality): Card
```

SM-2 间隔规则：
- `q = 0`（不会）：`repetitions = 0, interval = 1`（重置）
- `q = 3`（模糊）：`repetitions += 1`, rep=1→interval=1, rep=2→3, rep≥3→`interval × ease × 0.7`
- `q = 5`（掌握）：`repetitions += 1`, rep=1→interval=1, rep=2→6, rep≥3→`interval × ease`

ease 更新公式：`ease = max(1.3, ease + 0.1 - (5-q) × (0.08 + (5-q) × 0.02))`

status 更新规则：`repetitions=0 → new`, `interval≤7 → learning`, `interval>7 → review`

---

#### `isDue(card)` — 判断是否到期（本地版，已弃用）
```typescript
function isDue(card: Card): boolean
// return card.nextReview <= Date.now()
```

> API 版到期判断：`new Date(card.nextReview) <= new Date()`（nextReview 为 ISO string）

---

#### `createCard(front, back)` — 新卡片初始值（本地版，已弃用）
```typescript
function createCard(front: string, back: string): Card
// 返回 ease=2.5, interval=1, repetitions=0, nextReview=now
```

---

#### `getDeckStats(deck)` — 卡组统计（本地版，已弃用）
```typescript
function getDeckStats(deck: Deck): { total, mastered, rate, due }
```

---

#### `createDeck(name)` — 新卡组初始值（本地版，已弃用）
```typescript
function createDeck(name: string): { id, name, createdAt, cards: [] }
```

---

## storage.ts — 本地存储适配层

**路径**：`src/utils/storage.ts`

封装所有本地存储操作，业务层不直接调用 `Taro.getStorageSync`。

### 存储 Key 对照

| 常量 | Key 字符串 | 用途 |
|------|-----------|------|
| `KEYS.DECKS` | `flashcard_decks` | 废弃（原本地卡组数据） |
| `KEYS.REVIEW_HISTORY` | `flashcard_review_history` | 废弃（原本地复习历史） |
| `KEYS.STREAK` | `flashcard_streak` | 本地 streak（仅 `longest` 字段有意义） |
| `KEYS.REVIEW_SESSION` | `flashcard_review_session` | 复习页 ↔ 总结页数据中转 |
| `KEYS.SUMMARY_RESULTS` | `flashcard_summary_results` | 总结页展示数据 |
| `FAV_KEY` | `flashcard_favorited_ids` | 收藏卡组 `_id[]` |

### 函数列表

#### Decks（废弃，不要写入）
| 函数 | 说明 |
|------|------|
| `getDecks()` | 读取本地卡组（已废弃） |
| `saveDecks(decks)` | 保存本地卡组（已废弃） |
| `getDeckById(id)` | 按 id 查询本地卡组（已废弃） |
| `updateDeck(deck)` | 更新本地卡组（已废弃） |
| `deleteDeck(id)` | 删除本地卡组（已废弃） |

#### Streak
| 函数 | 说明 |
|------|------|
| `getStreak()` | 读取 streak 数据；无数据时返回 `{ current: 0, longest: 0, lastDate: '' }` |
| `updateStreak()` | 更新 streak：lastDate=今天→不变；lastDate=昨天→current++；否则→current=1 |

**当前用法**：`stats` 页调用 `getStreak().longest` 补充后端未返回的历史最长天数。

#### Review Session（页面间数据中转）
| 函数 | 说明 |
|------|------|
| `setReviewSession(data)` | 存储复习会话（cards + deckId） |
| `getReviewSession<T>()` | 读取复习会话 |
| `clearReviewSession()` | 清除（review 页读取后立即清除） |

#### Summary Results（页面间数据中转）
| 函数 | 说明 |
|------|------|
| `setSummaryResults(data)` | 存储复习总结（results + deckId + streak） |
| `getSummaryResults<T>()` | 读取复习总结 |
| `clearSummaryResults()` | 清除（summary 页读取后立即清除） |

#### Favorited Deck IDs
| 函数 | 说明 |
|------|------|
| `getFavoritedIds()` | 读取收藏卡组 id 数组；使用 `wx.getStorageSync`（非 Taro） |
| `setFavoritedIds(ids)` | 保存收藏卡组 id 数组；使用 `wx.setStorageSync`（非 Taro） |

#### Helpers
| 函数 | 签名 | 说明 |
|------|------|------|
| `getTodayStr()` | `() => string` | 今日日期，格式 `YYYY-MM-DD` |
| `getDateStr(offset)` | `(offset: number) => string` | 偏移 N 天的日期，`offset=0` 为今天，`-1` 为昨天 |
