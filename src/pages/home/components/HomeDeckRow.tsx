import { View, Text } from '@tarojs/components'
import { Deck } from '@/types'
import { getDeckStats } from '@/utils/sm2'
import './HomeDeckRow.scss'

interface HomeDeckRowProps {
  deck: Deck
  count: number
  onClick: () => void
}

export default function HomeDeckRow({ deck, count, onClick }: HomeDeckRowProps) {
  const stats = getDeckStats(deck)

  return (
    <View className='home-deck-row' onClick={onClick}>
      <View className='home-deck-row__info'>
        <Text className='home-deck-row__name'>{deck.name}</Text>
        <Text className='home-deck-row__sub'>{stats.total} 张 · {stats.rate}% 掌握率</Text>
      </View>
      <View className='home-deck-row__badge'>
        <Text className='home-deck-row__badge-text'>{count} 张</Text>
      </View>
    </View>
  )
}
