import { View, Text } from '@tarojs/components'

interface DeckStat {
  name: string
  rate: number
  total: number
  mastered: number
}

interface DeckMasteryBarsProps {
  deckStats: DeckStat[]
}

export default function DeckMasteryBars({ deckStats }: DeckMasteryBarsProps) {
  if (deckStats.length === 0) return null

  return (
    <View className='stats-card'>
      <Text className='stats-card-title'>卡组掌握率</Text>
      <View className='stats-deck-bars'>
        {deckStats.map((d, i) => (
          <View key={i} className='stats-deck-bar-item'>
            <View className='stats-deck-bar-label-row'>
              <Text className='stats-deck-bar-name' numberOfLines={1}>{d.name}</Text>
              <Text className='stats-deck-bar-pct'>{d.rate}%</Text>
            </View>
            <View className='stats-deck-bar-track'>
              <View className='stats-deck-bar-fill' style={{ width: `${d.rate}%` }} />
            </View>
            <Text className='stats-deck-bar-sub'>掌握 {d.mastered}/{d.total}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
