import { useState, useRef } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import { getDecks, saveDecks, deleteDeck } from '../../utils/storage'
import { getDisplayStatus, isDue, createDeck } from '../../utils/sm2'
import { Deck } from '../../types'
import './index.scss'

export default function Decks() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [modalName, setModalName] = useState('')
  const [swipeOpen, setSwipeOpen] = useState<string | null>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [nameError, setNameError] = useState('')
  const touchStartX = useRef<number>(0)

  Taro.useDidShow(() => {
    setDecks(getDecks())
  })

  function getDeckStats(deck: Deck) {
    const total = deck.cards.length
    if (total === 0) return { total, mastered: 0, rate: 0, due: 0 }
    const mastered = deck.cards.filter(c => getDisplayStatus(c) === '掌握').length
    const due = deck.cards.filter(c => isDue(c)).length
    return { total, mastered, rate: Math.round((mastered / total) * 100), due }
  }

  function handleCreateOrEdit() {
    const name = modalName.trim()
    if (!name) {
      setNameError('请输入卡组名称')
      return
    }
    const allDecks = getDecks()
    const duplicate = allDecks.some(d => d.name === name && d.id !== editingDeck?.id)
    if (duplicate) {
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
    setDecks(allDecks)
    closeModal()
    Taro.showToast({ title: editingDeck ? '已更新' : '创建成功', icon: 'success' })
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
          setDecks(getDecks())
          setSwipeOpen(null)
        }
      }
    })
  }

  function openEdit(deck: Deck) {
    setEditingDeck(deck)
    setModalName(deck.name)
    setShowCreateModal(true)
    setSwipeOpen(null)
  }

  function closeModal() {
    setShowCreateModal(false)
    setEditingDeck(null)
    setModalName('')
    setNameError('')
    setKeyboardHeight(0)
  }

  function handleTouchStart(e: any) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: any, deckId: string) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) {
      setSwipeOpen(deckId)
    } else if (dx > 40) {
      setSwipeOpen(null)
    }
  }

  return (
    <View className='decks-page'>
      <View className='decks-header'>
        <Text className='decks-title'>我的卡组</Text>
        <Text className='decks-subtitle'>{decks.length} 个卡组</Text>
      </View>

      {decks.length === 0 ? (
        <View className='decks-empty'>
          <Text className='decks-empty__emoji'>🗂️</Text>
          <Text className='decks-empty__title'>还没有卡组</Text>
          <Text className='decks-empty__desc'>点击右下角 + 号创建第一个卡组</Text>
        </View>
      ) : (
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
                    if (isOpen) { setSwipeOpen(null); return }
                    Taro.navigateTo({ url: `/pages/cards/index?deckId=${deck.id}` })
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

                    <View className='deck-item__progress'>
                      <View className='deck-progress-bar'>
                        <View
                          className='deck-progress-bar__fill'
                          style={{ width: `${stats.rate}%` }}
                        />
                      </View>
                      <Text className='deck-item__rate'>{stats.rate}%</Text>
                    </View>

                    <View className='deck-item__footer'>
                      <Text className='deck-item__footer-text'>
                        掌握 {stats.mastered}/{stats.total}
                      </Text>
                      <Text className='deck-item__arrow'>›</Text>
                    </View>
                  </View>
                </View>

                {/* Swipe Actions */}
                <View className='deck-swipe-actions'>
                  <View className='deck-swipe-btn deck-swipe-btn--edit' onClick={() => openEdit(deck)}>
                    <Text>编辑</Text>
                  </View>
                  <View className='deck-swipe-btn deck-swipe-btn--delete' onClick={() => handleDelete(deck)}>
                    <Text>删除</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* FAB */}
      <View className='decks-fab' onClick={() => { setModalName(''); setShowCreateModal(true) }}>
        <Text className='decks-fab__icon'>+</Text>
      </View>

      {/* Modal */}
      {showCreateModal && (
        <View className='modal-overlay' onClick={closeModal}>
          <View
            className='modal-sheet'
            style={{ marginBottom: keyboardHeight ? `${keyboardHeight}px` : '0' }}
            onClick={e => e.stopPropagation()}
          >
            <Text className='modal-title'>{editingDeck ? '编辑卡组' : '新建卡组'}</Text>
            <Input
              className={`modal-input ${nameError ? 'modal-input--error' : ''}`}
              value={modalName}
              onInput={e => { setModalName(e.detail.value); setNameError('') }}
              onKeyboardHeightChange={e => setKeyboardHeight(e.detail.height)}
              placeholder='输入卡组名称...'
              maxlength={30}
              adjustPosition={false}
              autoFocus
            />
            {nameError ? <Text className='modal-error'>{nameError}</Text> : null}
            <View className='modal-actions'>
              <View className='modal-btn modal-btn--cancel' onClick={closeModal}>
                <Text>取消</Text>
              </View>
              <View
                className={`modal-btn modal-btn--confirm ${!modalName.trim() ? 'modal-btn--disabled' : ''}`}
                onClick={handleCreateOrEdit}
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
