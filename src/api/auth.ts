import { request } from './request'
import { setToken } from './token'
import { LoginResponse } from '@/types/api/auth'

/**
 * 微信登录：传入 wx.login() 的 code，换取 JWT 并自动缓存。
 * POST /api/auth/login
 */
export const login = async (code: string): Promise<LoginResponse> => {
  const data = await request<LoginResponse>('POST', '/auth/login', { code })
  setToken(data.token)
  return data
}
