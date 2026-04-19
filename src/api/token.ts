import Taro from '@tarojs/taro'

const TOKEN_KEY = 'flashcard_token'

export const getToken = (): string => Taro.getStorageSync(TOKEN_KEY) ?? ''

export const setToken = (token: string): void => {
  Taro.setStorageSync(TOKEN_KEY, token)
}

export const clearToken = (): void => {
  Taro.removeStorageSync(TOKEN_KEY)
}
