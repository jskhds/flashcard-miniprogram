import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text, Textarea } from '@tarojs/components'
import { getDeckById, saveDecks, getDecks } from '../../utils/storage'
import { createCard } from '../../utils/sm2'
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
    if (isEdit) {
      const deck = getDeckById(deckId)
      const card = deck?.cards.find(c => c.id === cardId)
      if (card) {
        setFront(card.front)
        setBack(card.back)
      }
    }

    Taro.setNavigationBarTitle({ title: isEdit ? '编辑卡片' : '新建卡片' })
  }, [])

  const isValid = front.trim().length > 0 && back.trim().length > 0

  function handleSave() {
    if (!isValid) return

    const allDecks = getDecks()
    const deck = allDecks.find(d => d.id === deckId)
    if (!deck) {
      Taro.showToast({ title: '卡组不存在', icon: 'none' })
      return
    }

    const trimmedFront = front.trim()
    const duplicate = deck.cards.some(c => c.front === trimmedFront && c.id !== cardId)
    if (duplicate) {
      setFrontError('该卡组内已有相同正面内容的卡片')
      return
    }

    if (isEdit) {
      const card = deck.cards.find(c => c.id === cardId)
      if (card) {
        card.front = trimmedFront
        card.back = back.trim()
      }
    } else {
      deck.cards.push(createCard(trimmedFront, back.trim()))
    }

    saveDecks(allDecks)
    Taro.showToast({ title: isEdit ? '已保存' : '卡片已创建', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 800)
  }

  return (
    <View className='card-edit-page'>
      <View className='card-edit-form'>
        {/* Front */}
        <View className='card-edit-field'>
          <View className='card-edit-field__header'>
            <Text className='card-edit-field__label'>正面</Text>
            <Text className='card-edit-field__count'>{front.length}/500</Text>
          </View>
          <Textarea
            className={`card-edit-textarea ${frontError ? 'card-edit-textarea--error' : ''}`}
            value={front}
            onInput={e => { setFront(e.detail.value); setFrontError('') }}
            placeholder='输入问题或关键词...'
            maxlength={500}
            autoHeight
          />
          {frontError ? <Text className='card-edit-field__error'>{frontError}</Text> : null}
        </View>

        {/* Divider */}
        <View className='card-edit-divider'>
          <View className='card-edit-divider__line' />
          <Text className='card-edit-divider__text'>↕</Text>
          <View className='card-edit-divider__line' />
        </View>

        {/* Back */}
        <View className='card-edit-field'>
          <View className='card-edit-field__header'>
            <Text className='card-edit-field__label'>背面</Text>
            <Text className='card-edit-field__count'>{back.length}/500</Text>
          </View>
          <Textarea
            className='card-edit-textarea'
            value={back}
            onInput={e => setBack(e.detail.value)}
            placeholder='输入答案或解释...'
            maxlength={500}
            autoHeight
          />
        </View>
      </View>

      {/* Tips */}
      <Text className='card-edit-tip'>💡 建议每张卡片聚焦一个知识点，便于记忆</Text>

      {/* Save Button */}
      <View
        className={`card-edit-save-btn ${!isValid ? 'card-edit-save-btn--disabled' : ''}`}
        onClick={handleSave}
      >
        <Text className='card-edit-save-btn__text'>
          {isEdit ? '保存修改' : '创建卡片'}
        </Text>
      </View>
    </View>
  )
}
