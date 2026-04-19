import { useState } from 'react'
import Taro from '@tarojs/taro'
import { createDeck, updateDeck, deleteDeck } from '@/api/decks'
import { ApiDeck } from '@/types/api/deck'

export function useDeckCRUD(onSuccess: () => void) {
  const [showModal, setShowModal] = useState(false)
  const [editingDeck, setEditingDeck] = useState<ApiDeck | null>(null)
  const [modalName, setModalName] = useState('')
  const [nameError, setNameError] = useState('')

  const openCreate = () => {
    setEditingDeck(null)
    setModalName('')
    setNameError('')
    setShowModal(true)
  }

  const openEdit = (deck: ApiDeck) => {
    setEditingDeck(deck)
    setModalName(deck.name)
    setNameError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDeck(null)
    setModalName('')
    setNameError('')
  }

  const handleSave = async () => {
    const name = modalName.trim()
    if (!name) { setNameError('请输入卡组名称'); return }

    try {
      if (editingDeck) {
        await updateDeck(editingDeck._id, name)
        Taro.showToast({ title: '已更新', icon: 'success' })
      } else {
        await createDeck(name)
        Taro.showToast({ title: '创建成功', icon: 'success' })
      }
      closeModal()
      onSuccess()
    } catch (e: any) {
      // 后端返回的错误信息（如"已存在同名卡组"）直接显示在输入框下
      setNameError(e.message ?? '操作失败')
    }
  }

  const handleDelete = (deck: ApiDeck) => {
    Taro.showModal({
      title: '删除卡组',
      content: `确认删除「${deck.name}」？卡组内所有卡片将一并删除，无法恢复。`,
      confirmText: '删除',
      confirmColor: '#FF3B30',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteDeck(deck._id)
            onSuccess()
          } catch (e: any) {
            Taro.showToast({ title: e.message ?? '删除失败', icon: 'none' })
          }
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
