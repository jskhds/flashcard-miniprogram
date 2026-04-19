// app.tsx 是 Taro 入口文件，命名导出在小程序环境下不可靠。
// 单独存放登录就绪 Promise，供 app.tsx 写入、各页面读取。

let _resolve: () => void
let _reject: (err: unknown) => void

export const loginReady = new Promise<void>((resolve, reject) => {
  _resolve = resolve
  _reject = reject
})

export const resolveLogin = () => _resolve()
export const rejectLogin = (err: unknown) => _reject(err)
