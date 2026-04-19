import { Component } from 'react'
import Taro from '@tarojs/taro'
import { login } from '@/api/auth'
import { getToken } from '@/api/token'
import { resolveLogin, rejectLogin } from '@/utils/loginReady'
import './styles/app.scss'

class App extends Component {
  componentDidMount() {
    this.initLogin()
  }

  initLogin = async () => {
    try {
      if (!getToken()) {
        const { code } = await Taro.login()
        await login(code)
        console.log('[App] 登录成功')
      } else {
        console.log('[App] 已有 token，跳过登录')
      }
      resolveLogin()
    } catch (e) {
      console.error('[App] 登录失败', e)
      rejectLogin(e)
    }
  }

  componentDidShow() {}
  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App
