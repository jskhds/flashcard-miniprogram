import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Deck } from '@/types'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import DeckCard from '@/components/DeckCard'

interface DeckOverviewProps {
  decks: Deck[]
  onEdit: (deck: Deck) => void
  onDelete: (deck: Deck) => void
}

export default function DeckOverview({ decks, onEdit, onDelete }: DeckOverviewProps) {
  const { swipeOpen, setSwipeOpen, handleTouchStart, handleTouchEnd } = useSwipeGesture()

  if (decks.length === 0) {
    return (
      <View className='home-empty'>
        <Text className='home-empty__emoji'>📚</Text>
        <Text className='home-empty__title'>还没有卡组</Text>
        <Text className='home-empty__desc'>创建你的第一个闪卡卡组，开始高效学习</Text>
      </View>
    )
  }

  const previewDecks = decks.slice(0, 3)

  return (
    <View className='home-decks'>
      <View className='home-section-header'>
        <Text className='home-section-title'>★ 收藏的卡组</Text>
        <Text
          className='home-section-more'
          onClick={() => Taro.switchTab({ url: '/pages/decks/index' })}
        >
          查看全部
        </Text>
      </View>

      {previewDecks.map(deck => (
        <DeckCard
          key={deck.id}
          deck={deck}
          isOpen={swipeOpen === deck.id}
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => handleTouchEnd(e, deck.id)}
          onClose={() => setSwipeOpen(null)}
          onEdit={onEdit}
          onDelete={onDelete}
          showFooter
        />
      ))}
    </View>
  )
}
