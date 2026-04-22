# 全局组件文档（src/components/）

---

## DeckNameModal — 卡组名称输入模态框

**路径**：`src/components/DeckNameModal/index.tsx`

### 用途

卡组的新建和编辑操作共用同一个模态框组件，由 `useDeckCRUD` hook 驱动状态。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `show` | `boolean` | 是否显示 |
| `title` | `string` | 标题文字（"新建卡组" 或 "编辑卡组"） |
| `value` | `string` | 输入框当前值 |
| `error` | `string` | 错误提示文字，显示在输入框下方 |
| `onConfirm` | `() => void` | 点击确认 / 按回车触发 |
| `onClose` | `() => void` | 点击遮罩 / 取消触发 |
| `onChange` | `(val: string) => void` | 输入框内容变化 |

### 功能细节

- **自动聚焦**：模态框显示时 Input 自动 focus，打开即可输入
- **长度限制**：`maxLength={30}`
- **键盘高度适配**：监听 `Taro.onKeyboardHeightChange`，动态调整模态框 `marginBottom`，防止软键盘遮挡
- **关闭方式**：点击遮罩半透明背景 → `onClose`；点击"取消"按钮 → `onClose`
- **提交方式**：点击"确认"按钮或 Input `confirmType="done"` → `onConfirm`

### 错误展示

```
[卡组名称输入框]
错误提示文字（红色，出现在输入框下方）
```

---

## ProgressBar — 通用进度条

**路径**：`src/components/ProgressBar/index.tsx`

### 用途

在多个页面（decks、home、stats）复用的横向进度条，通过 className 参数适配不同场景的样式。

### Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `rate` | `number` | 是 | 进度百分比（0-100） |
| `wrapperClass` | `string` | 否 | 外层容器 className |
| `barClass` | `string` | 否 | 进度条轨道 className |
| `fillClass` | `string` | 否 | 填充块 className |
| `label` | `string` | 否 | 显示在进度条旁的文字标签 |
| `labelClass` | `string` | 否 | 标签 className |

### 渲染结构

```tsx
<View className={wrapperClass}>
  <View className={barClass}>
    <View className={fillClass} style={{ width: `${rate}%` }} />
  </View>
  {label && <Text className={labelClass}>{label}</Text>}
</View>
```

### 使用示例

```tsx
// decks 页卡组掌握率
<ProgressBar
  rate={deck.stats.masteryRate}
  wrapperClass='deck-progress'
  barClass='deck-progress__bar'
  fillClass='deck-progress__fill'
  label={`${deck.stats.masteryRate}%`}
  labelClass='deck-progress__label'
/>

// stats 页状态分布（不带 label）
<ProgressBar
  rate={masteredRate}
  fillClass='progress-fill--green'
/>
```
