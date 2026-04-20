import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { ApiDeck } from '@/types/api/deck'
import ProgressBar from '@/components/ProgressBar'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'

interface DeckOverviewProps {
  decks: ApiDeck[]
  onEdit: (deck: ApiDeck) => void
  onDelete: (deck: ApiDeck) => void
  onCreateDeck: () => void
}

export default function DeckOverview({ decks, onEdit, onDelete, onCreateDeck }: DeckOverviewProps) {
  const { swipeOpen, setSwipeOpen, handleTouchStart, handleTouchEnd } = useSwipeGesture()

  if (decks.length === 0) {
    return (
      <View className='home-empty'>
        <Text className='home-empty__emoji'>📚</Text>
        <Text className='home-empty__title'>还没有卡组</Text>
        <Text className='home-empty__desc'>创建你的第一个闪卡卡组，开始高效学习</Text>
        <View className='home-empty__btn' onClick={onCreateDeck}>
          <Text className='home-empty__btn-text'>创建卡组</Text>
        </View>
      </View>
    )
  }

  const previewDecks = decks.slice(0, 3)

  return (
    <View className='home-decks'>
      <View className='home-section-header'>
        <Text className='home-section-title'>我的卡组</Text>
        <Text
          className='home-section-more'
          onClick={() => Taro.switchTab({ url: '/pages/decks/index' })}
        >
          全部 →
        </Text>
      </View>

      {previewDecks.map(deck => {
        const isOpen = swipeOpen === deck._id
        return (
          <View
            key={deck._id}
            className='home-deck-card-wrapper'
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, deck._id)}
          >
            <View
              className={`home-deck-card ${isOpen ? 'home-deck-card--swiped' : ''}`}
              onClick={() => {
                if (isOpen) { setSwipeOpen(null); return }
                Taro.navigateTo({ url: `/pages/cards/index?deckId=${deck._id}` })
              }}
            >
              <View className='home-deck-card__top'>
                <Text className='home-deck-card__name'>{deck.name}</Text>
                <View className='home-deck-card__meta'>
                  <Text className='home-deck-card__count'>{deck.stats.total} 张</Text>
                  {deck.stats.due > 0 && (
                    <View className='home-deck-card__due'>
                      <Text className='home-deck-card__due-text'>{deck.stats.due} 到期</Text>
                    </View>
                  )}
                </View>
              </View>
              <ProgressBar
                rate={deck.stats.masteryRate}
                wrapperClass='home-deck-progress'
                barClass='home-deck-progress__bar'
                fillClass='home-deck-progress__fill'
                label={`${deck.stats.masteryRate}% 掌握`}
                labelClass='home-deck-progress__label'
              />
            </View>

            <View className='home-deck-swipe-actions'>
              <View className='home-deck-swipe-btn home-deck-swipe-btn--edit' onClick={() => onEdit(deck)}>
                <Text>编辑</Text>
              </View>
              <View className='home-deck-swipe-btn home-deck-swipe-btn--delete' onClick={() => onDelete(deck)}>
                <Text>删除</Text>
              </View>
            </View>
          </View>
        )
      })}

      <View className='home-fab' onClick={onCreateDeck}>
        <Text className='home-fab__icon'>+</Text>
      </View>
    </View>
  )
}
