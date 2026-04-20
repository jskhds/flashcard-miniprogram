import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import { getFavoritedIds, setFavoritedIds } from '@/utils/storage'
import { getDecks as apiGetDecks } from '@/api/decks'
import { ApiDeck } from '@/types/api/deck'
import { loginReady } from '@/utils/loginReady'
import { useDeckCRUD } from '@/hooks/useDeckCRUD'
import DeckList from './components/DeckList'
import DeckNameModal from '@/components/DeckNameModal'
import './index.scss'

type DeckWithFav = ApiDeck & { favorited: boolean }

export default function Decks() {
  const [decks, setDecks] = useState<DeckWithFav[]>([])
  const [search, setSearch] = useState('')
  const [scrollLocked, setScrollLocked] = useState(false)

  const refresh = async () => {
    await loginReady
    const apiDecks = await apiGetDecks()
    const favIds = new Set(getFavoritedIds())
    setDecks(apiDecks.map(d => ({ ...d, favorited: favIds.has(d._id) })))
  }

  function handleFavorite(deck: DeckWithFav) {
    if (!deck.favorited && deck.stats.total === 0) {
      Taro.showToast({ title: '请先添加卡片再加入学习计划', icon: 'none', duration: 2000 })
      return
    }
    if (deck.favorited) {
      Taro.showModal({
        title: '移出学习计划',
        content: `将「${deck.name}」从每日学习计划中移除？`,
        cancelText: '取消',
        confirmText: '移出',
        confirmColor: '#FF3B30',
        success: (res) => {
          if (res.confirm) {
            const ids = getFavoritedIds().filter(id => id !== deck._id)
            setFavoritedIds(ids)
            setDecks(prev => prev.map(d => d._id === deck._id ? { ...d, favorited: false } : d))
          }
        }
      })
    } else {
      const ids = [...getFavoritedIds().filter(id => id !== deck._id), deck._id]
      setFavoritedIds(ids)
      setDecks(prev => prev.map(d => d._id === deck._id ? { ...d, favorited: true } : d))
      Taro.showToast({ title: '已加入学习计划', icon: 'none', duration: 1500 })
    }
  }

  const {
    showModal, editingDeck, modalName, nameError,
    setModalName, setNameError,
    openCreate, openEdit, closeModal, handleSave, handleDelete,
  } = useDeckCRUD(refresh)

  Taro.useDidShow(() => {
    refresh()
    if (Taro.getStorageSync('pendingDeckCreate')) {
      Taro.removeStorageSync('pendingDeckCreate')
      openCreate()
    }
  })

  return (
    <View className='decks-page'>
      <View className='decks-header'>
        <Text className='decks-title'>我的卡组</Text>
        <View className='decks-add-btn' onClick={openCreate}>
          <Text className='decks-add-btn__icon'>+</Text>
        </View>
      </View>
      <View className='decks-search'>
        <Input
          className='decks-search__input'
          placeholder='🔍  搜索卡组'
          value={search}
          onInput={e => setSearch(e.detail.value)}
        />
      </View>

      <ScrollView scrollY={!scrollLocked} showScrollbar={false} className='decks-list-scroll'>
        <DeckList decks={decks} search={search} onEdit={openEdit} onDelete={handleDelete} onFavorite={handleFavorite} onLockScroll={() => setScrollLocked(true)} onUnlockScroll={() => setScrollLocked(false)} />
      </ScrollView>

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
