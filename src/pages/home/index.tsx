import { useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import { getDecks, saveDecks, deleteDeck } from '../../utils/storage'
import { getDisplayStatus, isDue, createDeck } from '../../utils/sm2'
import { Deck } from '../../types'
import './index.scss'

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [deckNameError, setDeckNameError] = useState('')
  const [swipeOpen, setSwipeOpen] = useState<string | null>(null)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const touchStartX = useRef(0)

  useEffect(() => {
    loadData()
  }, [])

  // 页面显示时重新加载（从其他页面返回）
  Taro.useDidShow(() => {
    loadData()
  })

  function loadData() {
    const allDecks = getDecks()
    setDecks(allDecks)

    // 计算今日到期卡片数量（nextReview <= now）
    const dueCount = allDecks.reduce((sum, deck) => {
      return sum + deck.cards.filter(c => isDue(c)).length
    }, 0)
    setTodayCount(dueCount)

    // 读取 streak
    try {
      const streakData = Taro.getStorageSync('flashcard_streak')
      if (streakData) {
        const parsed = JSON.parse(streakData)
        setStreak(parsed.current || 0)
      }
    } catch {}
  }

  function handleTouchStart(e: any) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: any, deckId: string) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) setSwipeOpen(deckId)
    else if (dx > 40) setSwipeOpen(null)
  }

  function handleDeleteDeck(deck: Deck) {
    Taro.showModal({
      title: '删除卡组',
      content: `确认删除「${deck.name}」？卡组内所有卡片将一并删除，无法恢复。`,
      confirmText: '删除',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          deleteDeck(deck.id)
          setSwipeOpen(null)
          loadData()
        }
      }
    })
  }

  function handleEditDeck(deck: Deck) {
    setEditingDeck(deck)
    setNewDeckName(deck.name)
    setSwipeOpen(null)
    setShowCreateModal(true)
  }

  function getTotalCards() {
    return decks.reduce((sum, d) => sum + d.cards.length, 0)
  }

  function getDeckMasteredRate(deck: Deck) {
    if (deck.cards.length === 0) return 0
    const mastered = deck.cards.filter(c => getDisplayStatus(c) === '掌握').length
    return Math.round((mastered / deck.cards.length) * 100)
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

  function handleCreateDeck() {
    const name = newDeckName.trim()
    if (!name) {
      setDeckNameError('请输入卡组名称')
      return
    }
    const allDecks = getDecks()
    if (allDecks.some(d => d.name === name && d.id !== editingDeck?.id)) {
      setDeckNameError('已存在同名卡组')
      return
    }
    if (editingDeck) {
      const idx = allDecks.findIndex(d => d.id === editingDeck.id)
      if (idx !== -1) allDecks[idx].name = name
    } else {
      allDecks.push(createDeck(name))
    }
    saveDecks(allDecks)
    setShowCreateModal(false)
    setNewDeckName('')
    setDeckNameError('')
    setEditingDeck(null)
    loadData()
    Taro.showToast({ title: editingDeck ? '已更新' : '卡组创建成功', icon: 'success' })
  }

  const previewDecks = decks.slice(0, 3)

  return (
    <View className='home-page'>
      {/* Header */}
      <View className='home-header'>
        <View className='home-greeting'>
          <Text className='home-greeting__title'>今日复习</Text>
          {streak > 0 && (
            <View className='home-streak'>
              <Text className='home-streak__fire'>🔥</Text>
              <Text className='home-streak__text'>{streak} 天连续</Text>
            </View>
          )}
        </View>

        <View className='home-count'>
          <Text className='home-count__number'>{todayCount}</Text>
          <Text className='home-count__label'>张待复习</Text>
        </View>
      </View>

      {/* Start Review Button */}
      <View
        className={`home-review-btn ${todayCount === 0 ? 'home-review-btn--disabled' : ''}`}
        onClick={handleStartReview}
      >
        <Text className='home-review-btn__text'>
          {todayCount === 0 ? '今日无到期卡片' : `开始今日复习 · ${todayCount} 张`}
        </Text>
      </View>

      {/* Total Stats */}
      <View className='home-stats'>
        <View className='home-stats__item'>
          <Text className='home-stats__value'>{decks.length}</Text>
          <Text className='home-stats__label'>卡组</Text>
        </View>
        <View className='home-stats__divider' />
        <View className='home-stats__item'>
          <Text className='home-stats__value'>{getTotalCards()}</Text>
          <Text className='home-stats__label'>总卡片</Text>
        </View>
        <View className='home-stats__divider' />
        <View className='home-stats__item'>
          <Text className='home-stats__value'>{streak}</Text>
          <Text className='home-stats__label'>连续天数</Text>
        </View>
      </View>

      {/* Deck Preview */}
      {decks.length > 0 ? (
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
            const rate = getDeckMasteredRate(deck)
            const dueCount = deck.cards.filter(c => isDue(c)).length
            const isOpen = swipeOpen === deck.id
            return (
              <View
                key={deck.id}
                className='home-deck-card-wrapper'
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, deck.id)}
              >
                <View
                  className={`home-deck-card ${isOpen ? 'home-deck-card--swiped' : ''}`}
                  onClick={() => {
                    if (isOpen) { setSwipeOpen(null); return }
                    Taro.navigateTo({ url: `/pages/cards/index?deckId=${deck.id}` })
                  }}
                >
                  <View className='home-deck-card__top'>
                    <Text className='home-deck-card__name'>{deck.name}</Text>
                    <View className='home-deck-card__meta'>
                      <Text className='home-deck-card__count'>{deck.cards.length} 张</Text>
                      {dueCount > 0 && (
                        <View className='home-deck-card__due'>
                          <Text className='home-deck-card__due-text'>{dueCount} 到期</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className='home-deck-progress'>
                    <View className='home-deck-progress__bar'>
                      <View
                        className='home-deck-progress__fill'
                        style={{ width: `${rate}%` }}
                      />
                    </View>
                    <Text className='home-deck-progress__label'>{rate}% 掌握</Text>
                  </View>
                </View>

                <View className='home-deck-swipe-actions'>
                  <View className='home-deck-swipe-btn home-deck-swipe-btn--edit' onClick={() => handleEditDeck(deck)}>
                    <Text>编辑</Text>
                  </View>
                  <View className='home-deck-swipe-btn home-deck-swipe-btn--delete' onClick={() => handleDeleteDeck(deck)}>
                    <Text>删除</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      ) : (
        <View className='home-empty'>
          <Text className='home-empty__emoji'>📚</Text>
          <Text className='home-empty__title'>还没有卡组</Text>
          <Text className='home-empty__desc'>创建你的第一个闪卡卡组，开始高效学习</Text>
          <View className='home-empty__btn' onClick={() => setShowCreateModal(true)}>
            <Text className='home-empty__btn-text'>创建卡组</Text>
          </View>
        </View>
      )}

      {/* Create Deck FAB */}
      {decks.length > 0 && (
        <View className='home-fab' onClick={() => setShowCreateModal(true)}>
          <Text className='home-fab__icon'>+</Text>
        </View>
      )}

      {/* Create Deck Modal */}
      {showCreateModal && (
        <View className='modal-overlay' onClick={() => { setShowCreateModal(false); setNewDeckName(''); setDeckNameError(''); setKeyboardHeight(0); setEditingDeck(null) }}>
          <View
            className='modal-sheet'
            style={{ marginBottom: keyboardHeight ? `${keyboardHeight}px` : '0' }}
            onClick={e => e.stopPropagation()}
          >
            <Text className='modal-title'>{editingDeck ? '编辑卡组' : '新建卡组'}</Text>
            <Input
              className={`modal-input ${deckNameError ? 'modal-input--error' : ''}`}
              value={newDeckName}
              onInput={e => { setNewDeckName(e.detail.value); setDeckNameError('') }}
              onKeyboardHeightChange={e => setKeyboardHeight(e.detail.height)}
              placeholder='输入卡组名称...'
              maxlength={30}
              adjustPosition={false}
              autoFocus
            />
            {deckNameError ? <Text className='modal-error'>{deckNameError}</Text> : null}
            <View className='modal-actions'>
              <View
                className='modal-btn modal-btn--cancel'
                onClick={() => { setShowCreateModal(false); setNewDeckName(''); setDeckNameError(''); setKeyboardHeight(0); setEditingDeck(null) }}
              >
                <Text>取消</Text>
              </View>
              <View
                className={`modal-btn modal-btn--confirm ${!newDeckName.trim() ? 'modal-btn--disabled' : ''}`}
                onClick={handleCreateDeck}
              >
                <Text>{editingDeck ? '保存' : '创建'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
