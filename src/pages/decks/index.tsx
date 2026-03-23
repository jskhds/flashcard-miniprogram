import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getDecks, saveDecks, deleteDeck } from '@/utils/storage'
import { createDeck } from '@/utils/sm2'
import { Deck } from '@/types'
import DeckList from './components/DeckList'
import DeckNameModal from '@/components/DeckNameModal'
import './index.scss'

export default function Decks() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [modalName, setModalName] = useState('')
  const [nameError, setNameError] = useState('')

  Taro.useDidShow(() => { setDecks(getDecks()) })

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
    setEditingDeck(null)
    setModalName('')
    setNameError('')
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
        }
      }
    })
  }

  return (
    <View className='decks-page'>
      <View className='decks-header'>
        <Text className='decks-title'>我的卡组</Text>
        <Text className='decks-subtitle'>{decks.length} 个卡组</Text>
      </View>

      <DeckList decks={decks} onEdit={openEdit} onDelete={handleDelete} />

      <View className='decks-fab' onClick={openCreate}>
        <Text className='decks-fab__icon'>+</Text>
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
