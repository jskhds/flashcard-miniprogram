import { useState } from 'react'
import Taro from '@tarojs/taro'
import { getDecks, saveDecks, deleteDeck } from '@/utils/storage'
import { createDeck } from '@/utils/sm2'
import { Deck } from '@/types'

export function useDeckCRUD(onSuccess: () => void) {
  const [showModal, setShowModal] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [modalName, setModalName] = useState('')
  const [nameError, setNameError] = useState('')

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
    const isEditing = !!editingDeck
    if (isEditing) {
      const idx = allDecks.findIndex(d => d.id === editingDeck!.id)
      if (idx !== -1) allDecks[idx].name = name
    } else {
      allDecks.push(createDeck(name))
    }
    saveDecks(allDecks)
    closeModal()
    onSuccess()
    Taro.showToast({ title: isEditing ? '已更新' : '创建成功', icon: 'success' })
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
          onSuccess()
        }
      }
    })
  }

  return {
    showModal,
    editingDeck,
    modalName,
    nameError,
    setModalName,
    setNameError,
    openCreate,
    openEdit,
    closeModal,
    handleSave,
    handleDelete,
  }
}
