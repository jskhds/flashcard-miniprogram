import { View, Text } from '@tarojs/components'
import { Deck } from '@/types'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import DeckCard from '@/components/DeckCard'

interface DeckListProps {
  decks: Deck[]
  onEdit: (deck: Deck) => void
  onDelete: (deck: Deck) => void
}

export default function DeckList({ decks, onEdit, onDelete }: DeckListProps) {
  const { swipeOpen, setSwipeOpen, handleTouchStart, handleTouchEnd } = useSwipeGesture()

  if (decks.length === 0) {
    return (
      <View className='decks-empty'>
        <Text className='decks-empty__emoji'>🗂️</Text>
        <Text className='decks-empty__title'>还没有卡组</Text>
        <Text className='decks-empty__desc'>点击右下角 + 号创建第一个卡组</Text>
      </View>
    )
  }

  return (
    <View className='decks-list'>
      {decks.map(deck => (
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
