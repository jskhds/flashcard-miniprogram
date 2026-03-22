import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { getDecks, saveDecks, deleteDeck } from '../../utils/storage'
import { isDue, createDeck } from '../../utils/sm2'
import { Deck } from '../../types'
import TodayStats from './components/TodayStats'
import DeckOverview from './components/DeckOverview'
import DeckNameModal from '../../components/DeckNameModal'
import './index.scss'

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [modalName, setModalName] = useState('')
  const [nameError, setNameError] = useState('')
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)

  useEffect(() => { loadData() }, [])

  Taro.useDidShow(() => { loadData() })

  function loadData() {
    const allDecks = getDecks()
    setDecks(allDecks)
    const dueCount = allDecks.reduce((sum, d) => sum + d.cards.filter(c => isDue(c)).length, 0)
    setTodayCount(dueCount)
    try {
      const streakData = Taro.getStorageSync('flashcard_streak')
      if (streakData) setStreak(JSON.parse(streakData).current || 0)
    } catch {}
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
    Taro.setStorageSync('flashcard_review_session', JSON.stringify(session))
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  function openCreate() {
    setEditingDeck(null)
    setModalName('')
    setNameError('')
    setShowModal(true)
  }

  function openEdit(deck: Deck) {
    setEditingDeck(deck)
    setModalName(deck.name)
    setNameError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setModalName('')
    setNameError('')
    setEditingDeck(null)
  }

  function handleSave() {
    const name = modalName.trim()
    if (!name) { setNameError('请输入卡组名称'); return }
    const allDecks = getDecks()
    if (allDecks.some(d => d.name === name && d.id !== editingDeck?.id)) {
      setNameError('已存在同名卡组')
      return
    }
    if (editingDeck) {
      const idx = allDecks.findIndex(d => d.id === editingDeck.id)
      if (idx !== -1) allDecks[idx].name = name
    } else {
      allDecks.push(createDeck(name))
    }
    saveDecks(allDecks)
    closeModal()
    loadData()
    Taro.showToast({ title: editingDeck ? '已更新' : '卡组创建成功', icon: 'success' })
  }

  function handleDelete(deck: Deck) {
    Taro.showModal({
      title: '删除卡组',
      content: `确认删除「${deck.name}」？卡组内所有卡片将一并删除，无法恢复。`,
      confirmText: '删除',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          deleteDeck(deck.id)
          loadData()
        }
      }
    })
  }

  return (
    <View className='home-page'>
      <TodayStats
        todayCount={todayCount}
        streak={streak}
        deckCount={decks.length}
        totalCards={decks.reduce((s, d) => s + d.cards.length, 0)}
        onStartReview={handleStartReview}
      />
      <DeckOverview
        decks={decks}
        onEdit={openEdit}
        onDelete={handleDelete}
        onCreateDeck={openCreate}
      />
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
