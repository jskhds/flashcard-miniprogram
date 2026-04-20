import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { getCards, createCard, updateCard, deleteCard } from '@/api/cards'
import { loginReady } from '@/utils/loginReady'
import CardEditForm from './components/CardEditForm'
import './index.scss'

export default function CardEdit() {
  const router = useRouter()
  const deckId = router.params.deckId as string
  const cardId = router.params.cardId as string
  const isEdit = !!cardId

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [frontError, setFrontError] = useState('')

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: isEdit ? '编辑卡片' : '新建卡片' })
    if (isEdit) {
      loginReady.then(async () => {
        const cards = await getCards(deckId)
        const card = cards.find(c => c._id === cardId)
        if (card) { setFront(card.front); setBack(card.back) }
      })
    }
  }, [])

  const isValid = front.trim().length > 0 && back.trim().length > 0

  const handleSaveAndContinue = async () => {
    if (!isValid) return
    try {
      await createCard(deckId, front.trim(), back.trim())
      Taro.showToast({ title: '已创建，继续添加', icon: 'success' })
      setFront('')
      setBack('')
      setFrontError('')
    } catch (e: any) {
      setFrontError(e.message ?? '创建失败')
    }
  }

  const handleSave = async () => {
    if (!isValid) return
    try {
      if (isEdit) {
        await updateCard(deckId, cardId, front.trim(), back.trim())
      } else {
        await createCard(deckId, front.trim(), back.trim())
      }
      Taro.showToast({ title: isEdit ? '已保存' : '卡片已创建', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 800)
    } catch (e: any) {
      setFrontError(e.message ?? '保存失败')
    }
  }

  const handleDelete = () => {
    Taro.showModal({
      title: '删除卡片',
      content: '确认删除这张卡片？',
      confirmText: '删除',
      confirmColor: '#FF3B30',
      success: async (res) => {
        if (res.confirm) {
          await deleteCard(deckId, cardId)
          Taro.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 800)
        }
      }
    })
  }

  return (
    <CardEditForm
      front={front}
      back={back}
      frontError={frontError}
      isEdit={isEdit}
      isValid={isValid}
      onFrontChange={(val) => { setFront(val); setFrontError('') }}
      onBackChange={setBack}
      onSave={handleSave}
      onSaveAndContinue={handleSaveAndContinue}
      onDelete={handleDelete}
    />
  )
}
