# Hooks 模块文档（src/hooks/）

---

## useDeckCRUD.ts — 卡组增删改

**路径**：`src/hooks/useDeckCRUD.ts`

### 用途

管理卡组名称输入模态框的状态与 CRUD 逻辑，抽离自 `decks/index.tsx`，保持页面组件简洁。

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `onSuccess` | `() => void` | 创建 / 编辑 / 删除成功后的回调（通常重新加载列表） |

### 返回值

| 字段 | 类型 | 说明 |
|------|------|------|
| `showModal` | `boolean` | 是否显示模态框 |
| `editingDeck` | `ApiDeck \| null` | 当前编辑的卡组，`null` 表示新建模式 |
| `modalName` | `string` | 输入框当前值 |
| `nameError` | `string` | 输入框错误提示文字 |
| `setModalName` | `Dispatch<string>` | 绑定输入框 onChange |
| `setNameError` | `Dispatch<string>` | 清除错误 |
| `openCreate` | `() => void` | 打开新建模态框（清空状态） |
| `openEdit` | `(deck: ApiDeck) => void` | 打开编辑模态框（预填名称） |
| `closeModal` | `() => void` | 关闭并重置所有状态 |
| `handleSave` | `() => Promise<void>` | 保存按钮 handler |
| `handleDelete` | `(deck: ApiDeck) => void` | 删除按钮 handler（弹出确认框） |

### handleSave 流程

```
1. 校验 modalName.trim() 非空，否则 setNameError('请输入卡组名称')
2. editingDeck 存在 → updateDeck(id, name)；否则 → createDeck(name)
3. 成功 → closeModal() + onSuccess()
4. 失败 → setNameError(e.message)（直接显示后端错误，如"已存在同名卡组"）
```

### handleDelete 流程

```
1. Taro.showModal 弹出确认对话框
2. 用户确认 → deleteDeck(id) → onSuccess()
3. 失败 → Taro.showToast 显示错误信息
```

### 使用示例

```typescript
const { showModal, openCreate, handleSave, ... } = useDeckCRUD(refresh)

// 页面 JSX
<Button onClick={openCreate}>新建卡组</Button>
<DeckNameModal show={showModal} onConfirm={handleSave} ... />
```

---

## useSwipeGesture.ts — 左滑手势识别

**路径**：`src/hooks/useSwipeGesture.ts`

### 用途

在列表页（卡组列表、卡片列表）实现列表项左滑展开操作按钮（编辑 / 删除），防止与垂直滚动冲突。

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `onLock?` | `() => void` | 识别为水平滑动时调用，用于禁用父容器垂直滚动 |
| `onUnlock?` | `() => void` | 手势结束时调用，恢复垂直滚动 |

### 返回值

| 字段 | 类型 | 说明 |
|------|------|------|
| `swipeOpen` | `string \| null` | 当前展开操作按钮的列表项 ID |
| `setSwipeOpen` | `Dispatch<string \| null>` | 手动设置（如点击其他区域收起） |
| `handleTouchStart` | `TouchEventHandler` | 绑定到列表项 onTouchStart |
| `handleTouchMove` | `TouchEventHandler` | 绑定到列表项 onTouchMove |
| `handleTouchEnd` | `TouchEventHandler` | 绑定到列表项 onTouchEnd |

### 核心逻辑

```
handleTouchStart: 记录起始坐标
handleTouchMove:
  ├─ 首次移动：计算 dx / dy
  ├─ |dy/dx| > 1：判定为垂直滚动，不拦截
  └─ |dx| >= 40 且水平方向：识别为左滑，onLock()，展开操作按钮
handleTouchEnd:
  └─ onUnlock()，恢复滚动
```

**阈值**：水平位移 ≥ 40px 触发滑开。

### 使用示例

```typescript
const { swipeOpen, setSwipeOpen, handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture(
  () => scrollRef.current?.setScrollEnabled(false),
  () => scrollRef.current?.setScrollEnabled(true),
)

// 列表项
<View
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  <DeckCard id={deck._id} swipeOpen={swipeOpen === deck._id} />
</View>
```
