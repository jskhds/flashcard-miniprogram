import { View, Text, Textarea } from '@tarojs/components'

interface CardEditFormProps {
  front: string
  back: string
  frontError: string
  isEdit: boolean
  isValid: boolean
  onFrontChange: (val: string) => void
  onBackChange: (val: string) => void
  onSave: () => void
}

export default function CardEditForm({
  front,
  back,
  frontError,
  isEdit,
  isValid,
  onFrontChange,
  onBackChange,
  onSave,
}: CardEditFormProps) {
  return (
    <View className='card-edit-page'>
      <View className='card-edit-form'>
        <View className='card-edit-field'>
          <View className='card-edit-field__header'>
            <Text className='card-edit-field__label'>正面</Text>
            <Text className='card-edit-field__count'>{front.length}/500</Text>
          </View>
          <Textarea
            className={`card-edit-textarea ${frontError ? 'card-edit-textarea--error' : ''}`}
            value={front}
            onInput={e => onFrontChange(e.detail.value)}
            placeholder='输入问题或关键词...'
            maxlength={500}
            autoHeight
          />
          {frontError ? <Text className='card-edit-field__error'>{frontError}</Text> : null}
        </View>

        <View className='card-edit-divider'>
          <View className='card-edit-divider__line' />
          <Text className='card-edit-divider__text'>↕</Text>
          <View className='card-edit-divider__line' />
        </View>

        <View className='card-edit-field'>
          <View className='card-edit-field__header'>
            <Text className='card-edit-field__label'>背面</Text>
            <Text className='card-edit-field__count'>{back.length}/500</Text>
          </View>
          <Textarea
            className='card-edit-textarea'
            value={back}
            onInput={e => onBackChange(e.detail.value)}
            placeholder='输入答案或解释...'
            maxlength={500}
            autoHeight
          />
        </View>
      </View>

      <Text className='card-edit-tip'>💡 建议每张卡片聚焦一个知识点，便于记忆</Text>

      <View
        className={`card-edit-save-btn ${!isValid ? 'card-edit-save-btn--disabled' : ''}`}
        onClick={onSave}
      >
        <Text className='card-edit-save-btn__text'>
          {isEdit ? '保存修改' : '创建卡片'}
        </Text>
      </View>
    </View>
  )
}
