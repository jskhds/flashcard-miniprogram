import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getDecks, setReviewSession, getStreak } from '@/utils/storage'
import { isDue, getDeckStats } from '@/utils/sm2'
import { Deck } from '@/types'
import { useDeckCRUD } from '@/hooks/useDeckCRUD'
import TodayStats from './components/TodayStats'
import DeckOverview from './components/DeckOverview'
import DeckNameModal from '@/components/DeckNameModal'
import './index.scss'

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [streak, setStreak] = useState(0)

  const {
    showModal, editingDeck, modalName, nameError,
    setModalName, setNameError,
    openCreate, openEdit, closeModal, handleSave, handleDelete,
  } = useDeckCRUD(loadData)

  Taro.useDidShow(() => { loadData() })

  function loadData() {
    const allDecks = getDecks()
    setDecks(allDecks)
    const dueCount = allDecks.reduce((sum, d) => sum + d.cards.filter(c => isDue(c)).length, 0)
    setTodayCount(dueCount)
    setStreak(getStreak().current)
  }

  function handleStartReview() {
    if (todayCount === 0) {
      Taro.showToast({ title: '今日无到期卡片', icon: 'none' })
      return
    }
    const allDueCards = decks.flatMap(d => d.cards.filter(c => isDue(c)))
    const session = {
      cards: allDueCards,
      source: 'home',
      deckIds: [...new Set(allDueCards.map(c => decks.find(d => d.cards.some(dc => dc.id === c.id))?.id ?? ''))]
    }
    setReviewSession(session)
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  const totalCards = decks.reduce((s, d) => s + d.cards.length, 0)
  const masteredCards = decks.reduce((s, d) => s + getDeckStats(d).mastered, 0)
  const masteryRate = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0

  return (
    <View className='home-page'>
      <TodayStats
        todayCount={todayCount}
        streak={streak}
        deckCount={decks.length}
        totalCards={totalCards}
        masteryRate={masteryRate}
      />
      <DeckOverview
        decks={decks}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
      <View className='home-bottom'>
        <View
          className={`home-review-btn ${todayCount === 0 ? 'home-review-btn--disabled' : ''}`}
          onClick={handleStartReview}
        >
          <Text className='home-review-btn__text'>
            {todayCount === 0 ? '今日无到期卡片' : `▶ 开始今日复习`}
          </Text>
        </View>
        <View className='home-create-btn' onClick={openCreate}>
          <Text className='home-create-btn__text'>⊕ 新建卡组</Text>
        </View>
      </View>
      {showModal && (
        <DeckNameModal
          title={editingDeck ? '编辑卡组' : '新建卡组'}
          value={modalName}
          error={nameError}
          confirmText={editingDeck ? '保存' : '创建'}
          onInput={(val) => { setModalName(val); setNameError('') }}
          onConfirm={handleSave}
          onClose={closeModal}
        />
      )}
    </View>
  )
}
