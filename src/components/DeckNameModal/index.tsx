import { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import './index.scss'

interface DeckNameModalProps {
  title: string
  value: string
  error: string
  confirmText: string
  onInput: (val: string) => void
  onConfirm: () => void
  onClose: () => void
}

// Mount/unmount this component via {condition && <DeckNameModal />}.
// keyboardHeight state resets automatically on each mount.
export default function DeckNameModal({
  title,
  value,
  error,
  confirmText,
  onInput,
  onConfirm,
  onClose,
}: DeckNameModalProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  return (
    <View className='modal-overlay' onClick={onClose}>
      <View
        className='modal-sheet'
        style={{ marginBottom: keyboardHeight ? `${keyboardHeight}px` : '0' }}
        onClick={e => e.stopPropagation()}
      >
        <Text className='modal-title'>{title}</Text>
        <Input
          className={`modal-input ${error ? 'modal-input--error' : ''}`}
          value={value}
          onInput={e => onInput(e.detail.value)}
          onKeyboardHeightChange={e => setKeyboardHeight(e.detail.height)}
          placeholder='输入卡组名称...'
          maxlength={30}
          adjustPosition={false}
          autoFocus
        />
        {error ? <Text className='modal-error'>{error}</Text> : null}
        <View className='modal-actions'>
          <View className='modal-btn modal-btn--cancel' onClick={onClose}>
            <Text>取消</Text>
          </View>
          <View
            className={`modal-btn modal-btn--confirm ${!value.trim() ? 'modal-btn--disabled' : ''}`}
            onClick={onConfirm}
          >
            <Text>{confirmText}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
