# Commit Skill

提交当前项目的所有未提交变更。

## 执行步骤

1. 运行 `git status` 和 `git diff`，了解所有变更内容
2. 按变更类型分组，决定单次提交还是多次提交
3. 依次暂存并提交每个分组

## 分组规则

根据变更文件路径分组：

| 路径 | 分组 |
|------|------|
| `miniprogram/src/pages/` | 页面变更 |
| `miniprogram/src/components/` | 组件变更 |
| `miniprogram/src/hooks/` | Hook 变更 |
| `miniprogram/src/utils/` | 工具函数变更 |
| `miniprogram/src/styles/` | 样式变更 |
| `miniprogram/src/types/` | 类型定义变更 |
| `miniprogram/src/assets/` | 资源文件变更 |
| `miniprogram/config/`、`package.json`、`tsconfig.json`、`project.config.json` | 配置变更 |
| `.claude/` | Claude Code 配置变更 |

同一分组的文件合并为一次提交。跨多个分组时，按分组分批提交。

## Commit Message 格式

使用中文，格式根据变更类型选择：

**页面变更**
```
新增 <页面名称> 页面
修复 <页面名称> 页面 <问题描述>
优化 <页面名称> 页面 <改动描述>
```

**组件变更**
```
新增 <组件名称> 组件
重构 <组件名称> 组件
优化 <组件名称> 组件 <改动描述>
```

**Bug 修复（跨多个文件）**
```
fix: <问题描述>
```

**工具函数 / Hook**
```
新增 <函数/hook 名称>
优化 <函数/hook 名称> <改动描述>
```

**样式 / 类型 / 配置**
```
样式：<改动描述>
类型：<改动描述>
配置：<改动描述>
```

**资源文件**
```
资源：新增/更新 <资源描述>
```

## 注意事项

- 每条 commit message 末尾加 Attribution trailer：
  `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
- 不提交 `miniprogram/dist/`、`node_modules/`、`.DS_Store`
- 若无任何变更，告知用户无需提交
- 使用 HEREDOC 传递 commit message，避免特殊字符转义问题
