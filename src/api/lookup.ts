import { request } from './request'

export interface LookupResult {
  reading: string
  romaji: string
  pitch: null
  meaning: string
  example: string
}

export const lookupWord = (word: string): Promise<LookupResult> =>
  request<LookupResult>('GET', `/lookup?word=${encodeURIComponent(word)}`)
