import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

interface BottomBarProps {
  deckId: string
  cardCount: number
  onStartReview: () => void
}

export default function BottomBar({ deckId, cardCount, onStartReview }: BottomBarProps) {
  return (
    <View className='cards-bottom'>
      <View
        className='cards-btn cards-btn--secondary'
        onClick={() => Taro.navigateTo({ url: `/pages/card-edit/index?deckId=${deckId}` })}
      >
        <Text className='cards-btn__text'>+ 新增卡片</Text>
      </View>
      <View
        className={`cards-btn cards-btn--primary ${cardCount === 0 ? 'cards-btn--disabled' : ''}`}
        onClick={onStartReview}
      >
        <Text className='cards-btn__text'>开始复习 · 全部 {cardCount} 张</Text>
      </View>
    </View>
  )
}
