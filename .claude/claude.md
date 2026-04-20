## Screenshot Policy

Only take a screenshot once after completing all requested changes.
Do not take screenshots during the process or between individual edits.
If I want an extra screenshot, I will explicitly say "截个图看看".

---

## 项目概览

Taro 4 + React + TypeScript 微信小程序闪卡应用。

- **前端**：`/Users/jialilou/Downloads/workspace/flashcardCC/miniprogram`
- **后端**：`/Users/jialilou/Downloads/workspace/flashcardCC/flashcard-backend`
- **后端地址**：`http://localhost:3000/api`（开发环境，微信开发者工具需勾选"不校验合法域名"）
- **Git 远程**：`git@github.com:jskhds/flashcard-miniprogram.git`（master 分支）

---

## 目录结构

```
src/
├── api/           # 所有请求函数（每个模块一个文件）
│   ├── auth.ts    # POST /api/auth/login
│   ├── decks.ts   # GET/POST/PUT/DELETE /api/decks
│   ├── cards.ts   # GET/POST/PUT/DELETE /api/decks/:id/cards
│   ├── review.ts  # GET /api/review/due, POST /api/review/submit
│   ├── stats.ts   # GET /api/stats/overview|history|decks
│   ├── request.ts # 基础请求封装（自动注入 Bearer token，抛出 code !== 0）
│   └── token.ts   # getToken / setToken / clearToken（wx.getStorageSync）
├── types/
│   ├── index.ts   # 公共类型（ReviewQuality enum 从 api/review 重导出）
│   └── api/       # 后端返回类型（ApiDeck、ApiCard、ReviewQuality 等）
├── utils/
│   ├── loginReady.ts  # 登录就绪 Promise（解决首次加载竞态）
│   ├── sm2.ts         # getDisplayStatus / getStatusColor（纯前端展示逻辑）
│   └── storage.ts     # 本地存储工具（session 中转 + favorited IDs）
├── hooks/
│   └── useDeckCRUD.ts # 卡组增删改（已对接 API）
└── pages/
    ├── home/          # 首页
    ├── decks/         # 卡组列表
    ├── cards/         # 卡片列表
    ├── card-edit/     # 新建/编辑卡片
    ├── review/        # 复习页
    ├── review-summary/ # 复习总结
    └── stats/         # 统计页
```

---

## 关键类型差异（本地 vs API）

| 字段 | 本地 `Deck` | API `ApiDeck` |
|------|------------|---------------|
| ID | `id: string` | `_id: string` |
| 卡片 | `cards: Card[]`（嵌套） | 无（stats 摘要代替） |
| 创建时间 | `createdAt: number`（时间戳） | `createdAt: string`（ISO） |
| 收藏 | `favorited?: boolean` | 无（本地存储） |

| 字段 | 本地 `Card` | API `ApiCard` |
|------|------------|---------------|
| ID | `id: string` | `_id: string` |
| 下次复习 | `nextReview: number`（时间戳） | `nextReview: string`（ISO） |

---

## 核心设计决策

### 1. 登录竞态：loginReady Promise
`app.tsx` 登录完成后调 `resolveLogin()`，所有页面在 `loadData` 里先 `await loginReady`，确保 token 就绪再发请求。

### 2. favorited 本地持久化
后端 `ApiDeck` 无 `favorited` 字段。用 `storage.getFavoritedIds()` / `setFavoritedIds()` 存储 `_id[]`，页面加载时合并：
```typescript
type DeckWithFav = ApiDeck & { favorited: boolean }
```

### 3. SM-2 计算全部在后端
复习页只收集 `{ cardId: card._id, quality }`，最后一张评完后调 `submitReview(deckId, results)`，后端返回更新后的 SM-2 数据和 streak。

### 4. 卡片页"全部"tab 行为
- 有今日到期卡 → 按钮"开始学习"，调 `getDueCards`
- 今日已全部复习 → 按钮变为"今日已完成 ✓"（置灰）+ "额外练习"（全量卡片）
- 状态 tab（不会/模糊/掌握）→ 直接用筛选卡片，不受 nextReview 限制

### 5. 首页学习计划点击降级
`handleDeckStart`：先调 `getDueCards(deckId)`，若返回空则降级到 `getCards(deckId)` 全量卡片，静默开始"额外练习"，无提示。

### 6. 卡组名传参（无单卡组查询接口）
后端无 `GET /api/decks/:deckId`，cards 页通过路由参数获取卡组名：
```
/pages/cards/index?deckId=${deck._id}&deckName=${encodeURIComponent(deck.name)}
```

### 7. stats 页加载策略
两轮并行请求：
1. `Promise.all([getOverview(), getHistory({year, month}), getDecks()])`
2. `Promise.all(allDecks.map(d => getCards(d._id))).flat()` → 计算 4 项状态分布和 7 天计划

---

## 本地存储（storage.ts）仍在使用的 key

| Key | 用途 |
|-----|------|
| `flashcard_favorited_ids` | 收藏卡组的 `_id[]` |
| `flashcard_review_session` | 复习页 ↔ 总结页数据中转（`ApiCard[]`） |
| `flashcard_summary_results` | 总结页数据（results + streak） |
| `flashcard_streak` | 本地 streak 记录（仅用 `longest`，current 由后端返回） |

不再使用：`flashcard_decks`、`flashcard_review_history`（已全部走 API）

---

## ReviewQuality 枚举

```typescript
export enum ReviewQuality {
  Again = 0,  // 不会，重置间隔
  Hard  = 3,  // 模糊，间隔小幅增长
  Good  = 5,  // 掌握，间隔正常增长
}
```

---

## 开发启动

```bash
# 后端
cd flashcard-backend && npm run dev

# 前端（微信开发者工具打开 miniprogram/dist 或配置编译输出）
cd miniprogram && npm run dev:weapp
```

微信开发者工具：详情 → 本地设置 → 勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」
