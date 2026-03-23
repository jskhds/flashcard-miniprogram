import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { getDeckById, saveDecks, getDecks } from '@/utils/storage'
import { createCard } from '@/utils/sm2'
import CardEditForm from './components/CardEditForm'

export default function CardEdit() {
  const router = useRouter()
  const deckId = router.params.deckId as string
  const cardId = router.params.cardId as string
  const isEdit = !!cardId

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [frontError, setFrontError] = useState('')

  useEffect(() => {
    if (isEdit) {
      const deck = getDeckById(deckId)
      const card = deck?.cards.find(c => c.id === cardId)
      if (card) { setFront(card.front); setBack(card.back) }
    }
    Taro.setNavigationBarTitle({ title: isEdit ? '编辑卡片' : '新建卡片' })
  }, [])

  const isValid = front.trim().length > 0 && back.trim().length > 0

  function handleSave() {
    if (!isValid) return
    const allDecks = getDecks()
    const deck = allDecks.find(d => d.id === deckId)
    if (!deck) { Taro.showToast({ title: '卡组不存在', icon: 'none' }); return }

    const trimmedFront = front.trim()
    if (deck.cards.some(c => c.front === trimmedFront && c.id !== cardId)) {
      setFrontError('该卡组内已有相同正面内容的卡片')
      return
    }

    if (isEdit) {
      const card = deck.cards.find(c => c.id === cardId)
      if (card) { card.front = trimmedFront; card.back = back.trim() }
    } else {
      deck.cards.push(createCard(trimmedFront, back.trim()))
    }

    saveDecks(allDecks)
    Taro.showToast({ title: isEdit ? '已保存' : '卡片已创建', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 800)
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
    />
  )
}
