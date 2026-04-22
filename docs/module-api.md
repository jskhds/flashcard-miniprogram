# API 模块文档（src/api/）

所有 HTTP 请求函数集中在 `src/api/` 目录，每个业务域一个文件。  
所有请求均通过 `request.ts` 封装层发出，自动注入 Bearer token，`code !== 0` 时抛出 Error。

---

## request.ts — 基础请求封装

**路径**：`src/api/request.ts`

### 导出

| 名称 | 签名 | 说明 |
|------|------|------|
| `BASE_URL` | `string` | 后端地址，当前为 `http://localhost:3000/api` |
| `buildQuery` | `(params) => string` | 构建 URL 查询字符串，自动跳过 `undefined` 值 |
| `request<T>` | `(method, path, data?) => Promise<T>` | 统一请求函数 |

### 核心逻辑

```typescript
// 自动附加 token
const token = getToken()
if (token) header['Authorization'] = `Bearer ${token}`

// 统一错误处理
if (body.code !== 0) throw new Error(body.message ?? '请求失败')
return body.data  // 返回 data 字段
```

后端响应格式：`{ code: number, message: string, data: T }`

---

## token.ts — Token 管理

**路径**：`src/api/token.ts`  
**存储 key**：`flashcard_token`

| 函数 | 说明 |
|------|------|
| `getToken(): string \| null` | 读取本地 JWT token |
| `setToken(token: string): void` | 保存 JWT token |
| `clearToken(): void` | 清除 token（登出时调用） |

---

## auth.ts — 登录

**路径**：`src/api/auth.ts`

| 函数 | 签名 | 说明 |
|------|------|------|
| `login` | `(code: string) => Promise<LoginResponse>` | 微信 code 换取 JWT token |

**接口**：
```
POST /api/auth/login
Body: { code: string }
Response: { token: string; isNewUser: boolean }
```

调用时机：`app.tsx` componentDidMount，`wx.login()` 拿到 code 后调用。  
成功后自动调 `setToken()` 缓存 token。

---

## decks.ts — 卡组 CRUD

**路径**：`src/api/decks.ts`

| 函数 | 签名 | 说明 |
|------|------|------|
| `getDecks` | `() => Promise<ApiDeck[]>` | 获取当前用户所有卡组（含统计摘要） |
| `createDeck` | `(name: string) => Promise<ApiDeck>` | 新建卡组 |
| `updateDeck` | `(deckId: string, name: string) => Promise<ApiDeckUpdated>` | 修改卡组名称 |
| `deleteDeck` | `(deckId: string) => Promise<ApiDeckDeleted>` | 删除卡组及其所有卡片 |

**接口列表**：
```
GET    /api/decks
POST   /api/decks                { name }
PUT    /api/decks/:deckId        { name }
DELETE /api/decks/:deckId
```

`ApiDeck` 包含 `stats` 字段：`{ total, due, mastered, masteryRate }`，  
无需再请求 `/api/stats/decks` 即可在卡组列表展示统计摘要。

---

## cards.ts — 卡片 CRUD

**路径**：`src/api/cards.ts`

| 函数 | 签名 | 说明 |
|------|------|------|
| `getCards` | `(deckId: string, status?) => Promise<ApiCard[]>` | 获取卡组内所有卡片，可按 status 过滤 |
| `createCard` | `(deckId, front, back) => Promise<ApiCard>` | 新建卡片 |
| `updateCard` | `(deckId, cardId, front, back) => Promise<ApiCardUpdated>` | 修改正背面（不改 SM-2 数据） |
| `deleteCard` | `(deckId, cardId) => Promise<ApiCardDeleted>` | 删除卡片 |

**接口列表**：
```
GET    /api/decks/:deckId/cards?status=new|learning|review
POST   /api/decks/:deckId/cards            { front, back }
PUT    /api/decks/:deckId/cards/:cardId    { front, back }
DELETE /api/decks/:deckId/cards/:cardId
```

> `status` 参数对应后端存储状态（`new / learning / review`），  
> 前端展示的 `DisplayStatus`（未学 / 不会 / 模糊 / 掌握）由 `utils/sm2.ts` 本地派生。

---

## review.ts — 复习流程

**路径**：`src/api/review.ts`

| 函数 | 签名 | 说明 |
|------|------|------|
| `getDueCards` | `(deckId?: string) => Promise<DueCardsResponse>` | 获取到期卡片（nextReview ≤ now） |
| `submitReview` | `(deckId, results) => Promise<SubmitReviewResponse>` | 提交本轮评分，触发 SM-2 计算 |

**接口列表**：
```
GET /api/review/due?deckId=xxx
Response: { cards: ApiCard[]; total: number }

POST /api/review/submit
Body: { deckId: string; results: { cardId: string; quality: 0|3|5 }[] }
Response: { reviewed: number; streak: { current, longest, lastDate }; updatedCards: [...] }
```

`getDueCards` 不传 `deckId` 时返回该用户所有到期卡片（跨卡组）。  
`submitReview` 是 SM-2 算法的唯一触发点，后端更新 ease / interval / repetitions / nextReview / status。

---

## stats.ts — 统计数据

**路径**：`src/api/stats.ts`

| 函数 | 签名 | 说明 |
|------|------|------|
| `getOverview` | `() => Promise<OverviewStats>` | 首页摘要：今日待学 / streak / 卡组数 / 总卡数 |
| `getHistory` | `(params) => Promise<HistoryStats>` | 复习历史，支持滚动窗口或自然月 |
| `getDeckStats` | `() => Promise<DeckStatsResponse>` | 各卡组掌握率（当前未被页面使用） |

**接口列表**：
```
GET /api/stats/overview
Response: { todayDue: number; streak: number; deckCount: number; totalCards: number }

GET /api/stats/history?year=2024&month=4
GET /api/stats/history?days=7
Response: { records: { date, count }[]; totalReviewed; activeDays; dailyAvg }

GET /api/stats/decks
Response: { deckStats: { deckId, name, total, mastered, masteryRate }[] }
```

> `getHistory` 的 `month` 参数为 1-based（1=一月），与 JS `Date.getMonth()` 的 0-based 不同，调用时需 `+1`。
