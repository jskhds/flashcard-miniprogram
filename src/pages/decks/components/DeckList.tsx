import { View, Text } from '@tarojs/components'
import { Deck } from '@/types'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import DeckCard from './DeckCard'

interface DeckListProps {
  decks: Deck[]
  search?: string
  onEdit: (deck: Deck) => void
  onDelete: (deck: Deck) => void
  onFavorite: (deck: Deck) => void
  onLockScroll?: () => void
  onUnlockScroll?: () => void
}

export default function DeckList({ decks, search, onEdit, onDelete, onFavorite, onLockScroll, onUnlockScroll }: DeckListProps) {
  const { swipeOpen, setSwipeOpen, handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture(onLockScroll, onUnlockScroll)

  const displayed = decks
    .filter(d => !search || d.name.includes(search))
    .sort((a, b) => (b.favorited ? 1 : 0) - (a.favorited ? 1 : 0))

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
      {displayed.map(deck => (
        <DeckCard
          key={deck.id}
          deck={deck}
          isOpen={swipeOpen === deck.id}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={(e) => handleTouchEnd(e, deck.id)}
          onClose={() => setSwipeOpen(null)}
          onEdit={onEdit}
          onDelete={onDelete}
          onFavorite={onFavorite}
          showFooter
        />
      ))}
    </View>
  )
}
