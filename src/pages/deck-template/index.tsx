import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { createDeck } from '@/api/decks'
import { batchCreateCards } from '@/api/cards'
import { loginReady } from '@/utils/loginReady'
import { setDeckType } from '@/utils/storage'
import './index.scss'

interface KanaCard {
  front: string
  back: string
  reading: string
  romaji: string
}

const HIRAGANA: KanaCard[] = [
  { front: 'あ', back: 'a', reading: 'あ' }, { front: 'い', back: 'i', reading: 'い' },
  { front: 'う', back: 'u', reading: 'う' }, { front: 'え', back: 'e', reading: 'え' },
  { front: 'お', back: 'o', reading: 'お' }, { front: 'か', back: 'ka', reading: 'か' },
  { front: 'き', back: 'ki', reading: 'き' }, { front: 'く', back: 'ku', reading: 'く' },
  { front: 'け', back: 'ke', reading: 'け' }, { front: 'こ', back: 'ko', reading: 'こ' },
  { front: 'さ', back: 'sa', reading: 'さ' }, { front: 'し', back: 'shi', reading: 'し' },
  { front: 'す', back: 'su', reading: 'す' }, { front: 'せ', back: 'se', reading: 'せ' },
  { front: 'そ', back: 'so', reading: 'そ' }, { front: 'た', back: 'ta', reading: 'た' },
  { front: 'ち', back: 'chi', reading: 'ち' }, { front: 'つ', back: 'tsu', reading: 'つ' },
  { front: 'て', back: 'te', reading: 'て' }, { front: 'と', back: 'to', reading: 'と' },
  { front: 'な', back: 'na', reading: 'な' }, { front: 'に', back: 'ni', reading: 'に' },
  { front: 'ぬ', back: 'nu', reading: 'ぬ' }, { front: 'ね', back: 'ne', reading: 'ね' },
  { front: 'の', back: 'no', reading: 'の' }, { front: 'は', back: 'ha', reading: 'は' },
  { front: 'ひ', back: 'hi', reading: 'ひ' }, { front: 'ふ', back: 'fu', reading: 'ふ' },
  { front: 'へ', back: 'he', reading: 'へ' }, { front: 'ほ', back: 'ho', reading: 'ほ' },
  { front: 'ま', back: 'ma', reading: 'ま' }, { front: 'み', back: 'mi', reading: 'み' },
  { front: 'む', back: 'mu', reading: 'む' }, { front: 'め', back: 'me', reading: 'め' },
  { front: 'も', back: 'mo', reading: 'も' }, { front: 'や', back: 'ya', reading: 'や' },
  { front: 'ゆ', back: 'yu', reading: 'ゆ' }, { front: 'よ', back: 'yo', reading: 'よ' },
  { front: 'ら', back: 'ra', reading: 'ら' }, { front: 'り', back: 'ri', reading: 'り' },
  { front: 'る', back: 'ru', reading: 'る' }, { front: 'れ', back: 're', reading: 'れ' },
  { front: 'ろ', back: 'ro', reading: 'ろ' }, { front: 'わ', back: 'wa', reading: 'わ' },
  { front: 'を', back: 'wo', reading: 'を' }, { front: 'ん', back: 'n', reading: 'ん' },
]

const KATAKANA: KanaCard[] = [
  { front: 'ア', back: 'a', reading: 'ア' }, { front: 'イ', back: 'i', reading: 'イ' },
  { front: 'ウ', back: 'u', reading: 'ウ' }, { front: 'エ', back: 'e', reading: 'エ' },
  { front: 'オ', back: 'o', reading: 'オ' }, { front: 'カ', back: 'ka', reading: 'カ' },
  { front: 'キ', back: 'ki', reading: 'キ' }, { front: 'ク', back: 'ku', reading: 'ク' },
  { front: 'ケ', back: 'ke', reading: 'ケ' }, { front: 'コ', back: 'ko', reading: 'コ' },
  { front: 'サ', back: 'sa', reading: 'サ' }, { front: 'シ', back: 'shi', reading: 'シ' },
  { front: 'ス', back: 'su', reading: 'ス' }, { front: 'セ', back: 'se', reading: 'セ' },
  { front: 'ソ', back: 'so', reading: 'ソ' }, { front: 'タ', back: 'ta', reading: 'タ' },
  { front: 'チ', back: 'chi', reading: 'チ' }, { front: 'ツ', back: 'tsu', reading: 'ツ' },
  { front: 'テ', back: 'te', reading: 'テ' }, { front: 'ト', back: 'to', reading: 'ト' },
  { front: 'ナ', back: 'na', reading: 'ナ' }, { front: 'ニ', back: 'ni', reading: 'ニ' },
  { front: 'ヌ', back: 'nu', reading: 'ヌ' }, { front: 'ネ', back: 'ne', reading: 'ネ' },
  { front: 'ノ', back: 'no', reading: 'ノ' }, { front: 'ハ', back: 'ha', reading: 'ハ' },
  { front: 'ヒ', back: 'hi', reading: 'ヒ' }, { front: 'フ', back: 'fu', reading: 'フ' },
  { front: 'ヘ', back: 'he', reading: 'ヘ' }, { front: 'ホ', back: 'ho', reading: 'ホ' },
  { front: 'マ', back: 'ma', reading: 'マ' }, { front: 'ミ', back: 'mi', reading: 'ミ' },
  { front: 'ム', back: 'mu', reading: 'ム' }, { front: 'メ', back: 'me', reading: 'メ' },
  { front: 'モ', back: 'mo', reading: 'モ' }, { front: 'ヤ', back: 'ya', reading: 'ヤ' },
  { front: 'ユ', back: 'yu', reading: 'ユ' }, { front: 'ヨ', back: 'yo', reading: 'ヨ' },
  { front: 'ラ', back: 'ra', reading: 'ラ' }, { front: 'リ', back: 'ri', reading: 'リ' },
  { front: 'ル', back: 'ru', reading: 'ル' }, { front: 'レ', back: 're', reading: 'レ' },
  { front: 'ロ', back: 'ro', reading: 'ロ' }, { front: 'ワ', back: 'wa', reading: 'ワ' },
  { front: 'ヲ', back: 'wo', reading: 'ヲ' }, { front: 'ン', back: 'n', reading: 'ン' },
]

const TEMPLATES = [
  { key: 'hiragana', name: '平假名', desc: 'あいうえお・46字', data: HIRAGANA },
  { key: 'katakana', name: '片假名', desc: 'アイウエオ・46字', data: KATAKANA },
]

export default function DeckTemplate() {
  const [importing, setImporting] = useState<string | null>(null)

  Taro.useDidShow(() => {
    Taro.setNavigationBarTitle({ title: '从模板导入' })
  })

  const handleImport = async (tpl: typeof TEMPLATES[0]) => {
    if (importing) return
    setImporting(tpl.key)
    Taro.showLoading({ title: '生成卡片中...' })
    try {
      await loginReady
      const deck = await createDeck(tpl.name)
      setDeckType(deck._id, 'ja')
      await batchCreateCards(deck._id, tpl.data.map(c => ({ ...c, romaji: c.back })))
      Taro.hideLoading()
      Taro.showToast({ title: `已导入 ${tpl.data.length} 张`, icon: 'success' })
      setTimeout(() => {
        Taro.redirectTo({
          url: `/pages/cards/index?deckId=${deck._id}&deckName=${encodeURIComponent(tpl.name)}`
        })
      }, 800)
    } catch (e: any) {
      Taro.hideLoading()
      Taro.showToast({ title: e.message ?? '导入失败', icon: 'none' })
      setImporting(null)
    }
  }

  return (
    <ScrollView scrollY className='deck-template-page'>
      <View className='deck-template-content'>
        {TEMPLATES.map(tpl => (
          <View key={tpl.key} className='deck-template-card'>
            <View className='deck-template-card__header'>
              <Text className='deck-template-card__name'>{tpl.name}</Text>
              <Text className='deck-template-card__desc'>{tpl.desc}</Text>
            </View>
            <View className='deck-template-card__grid'>
              {tpl.data.slice(0, 10).map((item, i) => (
                <View key={i} className='deck-template-card__cell'>
                  <Text className='deck-template-card__kana'>{item.front}</Text>
                  <Text className='deck-template-card__romaji'>{item.back}</Text>
                </View>
              ))}
              <View className='deck-template-card__cell deck-template-card__cell--more'>
                <Text className='deck-template-card__more'>+{tpl.data.length - 10}</Text>
              </View>
            </View>
            <View
              className={`deck-template-card__btn ${importing === tpl.key ? 'deck-template-card__btn--loading' : ''}`}
              onClick={() => handleImport(tpl)}
            >
              <Text className='deck-template-card__btn-text'>
                {importing === tpl.key ? '导入中...' : '一键导入'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
