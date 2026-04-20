import { View, Text } from '@tarojs/components'
import { ApiDeck } from '@/types/api/deck'
import './HomeDeckRow.scss'

interface HomeDeckRowProps {
  deck: ApiDeck
  dueCount: number
  newCount: number
  onClick: () => void
}

export default function HomeDeckRow({ deck, dueCount, newCount, onClick }: HomeDeckRowProps) {
  return (
    <View className='home-deck-row' onClick={onClick}>
      <View className='home-deck-row__info'>
        <Text className='home-deck-row__name'>{deck.name}</Text>
        <Text className='home-deck-row__sub'>{deck.stats.total} 张 · {deck.stats.masteryRate}% 掌握率</Text>
      </View>
      <View className='home-deck-row__badges'>
        {dueCount > 0 && (
          <View className='home-deck-row__badge home-deck-row__badge--due'>
            <Text className='home-deck-row__badge-text'>{dueCount} 复习</Text>
          </View>
        )}
        {newCount > 0 && (
          <View className='home-deck-row__badge home-deck-row__badge--new'>
            <Text className='home-deck-row__badge-text home-deck-row__badge-text--new'>{newCount} 新</Text>
          </View>
        )}
      </View>
    </View>
  )
}
