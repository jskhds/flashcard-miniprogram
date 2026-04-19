import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getDecks } from '@/utils/storage'
import { Deck } from '@/types'
import { useDeckCRUD } from '@/hooks/useDeckCRUD'
import DeckList from './components/DeckList'
import DeckNameModal from '@/components/DeckNameModal'
import './index.scss'

export default function Decks() {
  const [decks, setDecks] = useState<Deck[]>([])

  function refresh() { setDecks(getDecks()) }

  const {
    showModal, editingDeck, modalName, nameError,
    setModalName, setNameError,
    openCreate, openEdit, closeModal, handleSave, handleDelete,
  } = useDeckCRUD(refresh)

  Taro.useDidShow(refresh)

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
