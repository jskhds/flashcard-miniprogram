# Flashcard Mini Program

微信小程序闪卡应用，SM-2 复习算法。前端 React + TS，后端 Node.js。当前项目是前端。

## 信任优先级(最重要)

- 代码 > 文档。文档和代码冲突时以代码为准。
- 具体实现看源码,文档只用于理解设计意图和业务背景。
- 发现文档明显过期,告诉我,我会更新。

## 技术栈

- 框架: React + TypeScript
- 平台: 微信小程序 Taro
- 样式: SCSS
- 包管理: npm
- 代码质量: Husky v9 + lint-staged + ESLint + Prettier

## 项目文档

- 目录： `./docs/*.md`
- 产品说明: `./docs/overview.md`
- 未决问题: `./docs/todo.md`

## 开发计划

- 当前开发计划: `../docs/plan.md`(包含前后端,你只需关注标记为前端的 step)
- 涉及前后端交互的 step,先向我确认接口约定,不要自行推测
- 历史开发计划: `../docs/plan/archive/*.md`(供参考,不必主动读)

## 产品需求

- 各功能的 PRD 在 `../docs/prd/{功能域}/`。
- 改动涉及业务规则时,先读对应 PRD;
- 新增或修改业务规则时,提醒我更新 PRD。

## 常用命令

## 代码约定

- 代码输出规范参考 `.claude/rules/code-rules.md` 和常见的 js 代码规范

## 与我协作

- 用中文
- 复杂改动先给方案
- 不确定就问,别猜

## 代码质量工具（pre-commit）

Husky v9 → lint-staged → ESLint --fix + Prettier --write

- 配置文件：`.husky/pre-commit`、`.eslintrc.cjs`、`.prettierrc`
- 触发范围：`src/**/*.{ts,tsx}` 走 ESLint + Prettier；`src/**/*.scss` 只走 Prettier

## 截图策略

- 只在完成所有修改后截一次图
- 不要在过程中或每次小改动后截图
- 如果我要额外截图,会明确说"截个图看看"
