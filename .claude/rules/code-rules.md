# 代码规范

## 基本规范

- 使用 TypeScript，禁止滥用 any，必须声明类型
- 使用 ES6+ 语法，能用箭头函数的必须用箭头函数
- 使用 async/await，不用 callback
- 变量命名用 camelCase，组件名用 PascalCase，常量用 UPPER_SNAKE_CASE
- 文件名用 camelCase（组件文件用 PascalCase）
- 避免超大函数，函数入参控制在五个以内

## 文件结构规范

- 不同页面的 API 调用写在不同文件中，不放到同一文件
- 接口类型定义单独写在 types/ 目录，按模块拆分
- 登录相关逻辑单独写在 api/auth.ts
- 一个组件只做一件事，超过 200 行考虑拆分

## 组件规范

- 使用函数组件 + hooks，不用 class 组件
- 自定义 hooks 放在 src/hooks/ 目录
- 纯展示组件不包含业务逻辑，只接收 props
- props 类型必须用 interface 定义，不用 type alias

## 样式规范

- 使用 SCSS Modules，不写全局样式
- 类名用 camelCase
- 不使用内联 style，除非动态样式

## API 调用规范

- 所有页面发请求前必须 await loginReady
- 统一通过 src/api/ 下的函数调用，不在组件里直接写请求
- 错误处理：catch 后用 Taro.showToast 提示用户

## Taro 规范

- 使用 useDidShow 代替 useEffect 做页面级数据加载
- 页面间传参优先用路由参数，大数据量用 storage 中转
- 图片资源放 src/assets/，不用网络图片做 TabBar 图标
