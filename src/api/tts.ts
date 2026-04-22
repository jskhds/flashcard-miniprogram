import { request } from './request'

export const fetchTTS = (text: string): Promise<{ audio: string; format: string }> =>
  request<{ audio: string; format: string }>('POST', '/tts', { text })
