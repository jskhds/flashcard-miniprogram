import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Deck } from '@/types'
import { getDeckStats } from '@/utils/sm2'
import ProgressBar from '@/components/ProgressBar'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'

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
      {decks.map(deck => {
        const stats = getDeckStats(deck)
        const isOpen = swipeOpen === deck.id
        return (
          <View
            key={deck.id}
            className='deck-item-wrapper'
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, deck.id)}
          >
            <View
              className={`deck-item ${isOpen ? 'deck-item--swiped' : ''}`}
              onClick={() => {
                if (!isOpen) Taro.navigateTo({ url: `/pages/cards/index?deckId=${deck.id}` })
              }}
            >
              <View className='deck-item__content'>
                <View className='deck-item__top'>
                  <Text className='deck-item__name'>{deck.name}</Text>
                  <View className='deck-item__badges'>
                    {stats.due > 0 && (
                      <View className='deck-badge deck-badge--due'>
                        <Text className='deck-badge__text'>{stats.due} 到期</Text>
                      </View>
                    )}
                    <Text className='deck-item__count'>{stats.total} 张</Text>
                  </View>
                </View>
                <ProgressBar
                  rate={stats.rate}
                  wrapperClass='deck-item__progress'
                  barClass='deck-progress-bar'
                  fillClass='deck-progress-bar__fill'
                  label={`${stats.rate}%`}
                  labelClass='deck-item__rate'
                />
                <View className='deck-item__footer'>
                  <Text className='deck-item__footer-text'>掌握 {stats.mastered}/{stats.total}</Text>
                  <Text className='deck-item__arrow'>›</Text>
                </View>
              </View>
            </View>

            {isOpen && (
              <>
                <View className='deck-swipe-close-area' onClick={() => setSwipeOpen(null)} />
                <View className='deck-swipe-actions'>
                  <View className='deck-swipe-btn deck-swipe-btn--edit' onClick={() => { setSwipeOpen(null); onEdit(deck) }}>
                    <Text>编辑</Text>
                  </View>
                  <View className='deck-swipe-btn deck-swipe-btn--delete' onClick={() => { setSwipeOpen(null); onDelete(deck) }}>
                    <Text>删除</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )
      })}
    </View>
  )
}
