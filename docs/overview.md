# 前端项目整体介绍

## 项目简介

闪卡（Flashcard）微信小程序，使用 SM-2 间隔重复算法辅助记忆学习。  
用户可创建卡组、管理卡片，每日按计划复习到期卡片，并通过统计页追踪学习进度。

- **前端框架**：Taro 4 + React 18 + TypeScript
- **运行平台**：微信小程序
- **后端地址**：`http://localhost:3000/api`（开发环境）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Taro 4.x |
| UI 库 | Taro 内置组件（View / Text / Input / Textarea / Canvas） |
| 语言 | TypeScript |
| 状态管理 | React Hooks（useState / useEffect） |
| 样式 | SCSS + Design Token（token.scss 色彩变量） |
| HTTP | Taro.request（封装在 api/request.ts） |
| 本地存储 | wx.getStorageSync / setStorageSync |
| 算法 | SM-2 间隔重复（后端执行，前端仅展示派生状态） |

---

## 目录结构

```
src/
├── app.tsx              # 应用入口，处理微信登录流程
├── app.config.ts        # 路由配置、tabBar、全局样式
├── app.scss             # 全局样式重置
├── api/                 # 所有 HTTP 请求函数
│   ├── request.ts       # 请求基础封装（自动注入 Bearer token）
│   ├── token.ts         # Token 读写（localStorage）
│   ├── auth.ts          # 登录接口
│   ├── decks.ts         # 卡组 CRUD
│   ├── cards.ts         # 卡片 CRUD
│   ├── review.ts        # 获取到期卡片 / 提交复习评分
│   └── stats.ts         # 统计数据（overview / history / decks）
├── types/
│   ├── index.ts         # 本地公共类型（Card / Deck / ReviewQuality 等）
│   └── api/             # 后端返回类型
│       ├── auth.ts
│       ├── deck.ts
│       ├── card.ts
│       ├── review.ts
│       └── stats.ts
├── utils/
│   ├── loginReady.ts    # 登录就绪 Promise（解决竞态）
│   ├── sm2.ts           # SM-2 算法 + 状态派生（前端展示逻辑）
│   └── storage.ts       # 本地存储适配层
├── hooks/
│   ├── useDeckCRUD.ts   # 卡组增删改模态框状态管理
│   └── useSwipeGesture.ts  # 列表项左滑手势识别
├── components/
│   ├── DeckNameModal/   # 卡组名称输入模态框
│   └── ProgressBar/     # 通用进度条
└── pages/
    ├── home/            # 首页（今日学习计划）
    ├── decks/           # 卡组管理列表
    ├── cards/           # 单卡组卡片列表
    ├── card-edit/       # 新建 / 编辑卡片
    ├── review/          # 复习流程
    ├── review-summary/  # 复习总结
    └── stats/           # 学习统计
```

---

## 路由配置（app.config.ts）

| 路径 | 页面 | 说明 |
|------|------|------|
| `pages/home/index` | 首页 | tabBar 第 1 个 |
| `pages/decks/index` | 卡组管理 | tabBar 第 2 个 |
| `pages/stats/index` | 学习统计 | tabBar 第 3 个 |
| `pages/cards/index` | 卡片列表 | 从卡组页跳转 |
| `pages/card-edit/index` | 卡片编辑 | 从卡片列表跳转 |
| `pages/review/index` | 复习流程 | 通过 session 中转数据 |
| `pages/review-summary/index` | 复习总结 | 通过 session 中转数据 |

**tabBar**：首页 / 卡组 / 统计（3 个底部 Tab）  
**视觉主题**：米白背景 `#FFF8F0`，橙色高亮 `#F4845F`，暖棕文字 `#A0907E`

---

## 核心架构决策

### 1. 登录竞态：loginReady Promise

小程序启动时，`app.tsx` 的 `componentDidMount` 异步完成微信登录（wx.login → 后端换 token）。  
各页面在 `loadData` 里首先 `await loginReady`，确保 token 就绪后再发起 API 请求。

```
app.tsx                         page/index.tsx
  └─ wx.login()                   └─ loadData()
  └─ POST /api/auth/login              └─ await loginReady  ← 等待登录完成
  └─ setToken(jwt)                     └─ 发起业务 API 请求
  └─ resolveLogin()  ─────────────────→ loginReady resolved
```

### 2. favorited 本地持久化

后端 `ApiDeck` 无 `favorited` 字段，收藏状态存于本地存储（key: `flashcard_favorited_ids`，值为 `_id[]`）。  
页面加载时合并：`DeckWithFav = ApiDeck & { favorited: boolean }`。

### 3. SM-2 计算全在后端

前端复习页只收集评分数组 `{ cardId, quality }[]`，最后一张卡片完成后调 `submitReview`，  
后端执行 SM-2 并返回更新后的 streak 和卡片间隔。前端 `sm2.ts` 中的 `calculateNextReview` 仅用于本地数据兼容展示。

### 4. 页面间数据中转（ReviewSession）

卡片复习流程跨页面（cards → review → review-summary），数据通过本地存储中转：

- `setReviewSession({ cards, deckId })` → 跳转 review 页
- review 页读取后立即 `clearReviewSession()`
- 复习完成后 `setSummaryResults({ results, deckId, streak })` → 跳转 review-summary 页

### 5. 今日已完成 + 额外练习

SM-2 对"不会"的卡片也会设置 `nextReview = 明天`，导致用户当天无法再复习已学卡片。  
解决方案：当 `getDueCards` 返回空时，提供"额外练习"出口，加载全量卡片练习，不影响 SM-2 调度。

---

## 全局数据流

### 登录流程
```
app.tsx componentDidMount
  → 检查本地 token
  → 无 token：wx.login() → 获取 code
  → POST /api/auth/login { code }
  → setToken(jwt)
  → resolveLogin()
```

### 复习流程（完整）
```
cards/home 页面
  → getDueCards(deckId?) 或 getCards(deckId)
  → setReviewSession({ cards, deckId })
  → navigateTo('/pages/review/index')

review 页面
  → getReviewSession() → clearReviewSession()
  → 逐张翻卡评分，收集 results: { cardId, quality }[]
  → submitReview(deckId, results)
  → setSummaryResults({ results, deckId, streak })
  → redirectTo('/pages/review-summary/index')

review-summary 页面
  → getSummaryResults() → clearSummaryResults()
  → 展示本轮汇总
```

### 统计页加载（两轮并行）
```
第一轮：Promise.all([getOverview(), getHistory({year, month}), getDecks()])
第二轮：Promise.all(allDecks.map(d => getCards(d._id))).flat()
  → 本地计算 4 种状态分布（getDisplayStatus）
  → 本地计算未来 7 天复习计划（nextReview 日期分布）
```

---

## 本地存储 Key 一览

| Key | 用途 | 状态 |
|-----|------|------|
| `flashcard_token` | JWT 登录凭证 | 使用中 |
| `flashcard_favorited_ids` | 收藏卡组的 `_id[]` | 使用中 |
| `flashcard_review_session` | 复习页 ↔ 总结页数据中转 | 使用中 |
| `flashcard_summary_results` | 总结页展示数据 | 使用中 |
| `flashcard_streak` | 本地 streak（仅 `longest` 字段有效） | 使用中 |
| `flashcard_decks` | 原本地卡组数据 | 废弃（已走 API） |
| `flashcard_review_history` | 原本地复习历史 | 废弃（已走 API） |

---

## ReviewQuality 枚举

```typescript
export enum ReviewQuality {
  Again = 0,  // 不会：重置间隔，卡片退回 new 状态
  Hard  = 3,  // 模糊：间隔小幅增长（× ease × 0.7）
  Good  = 5,  // 掌握：间隔正常增长（× ease）
}
```

---

## 文件统计

| 类别 | 数量 |
|------|------|
| API 模块 | 7 个文件 |
| 类型定义 | 6 个文件 |
| 工具函数 | 3 个文件 |
| 自定义 Hooks | 2 个文件 |
| 全局组件 | 2 个组件目录 |
| 页面 | 7 个页面 |
| 页面子组件 | 17 个组件 |
