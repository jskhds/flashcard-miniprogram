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
  onSaveAndContinue?: () => void
  onDelete?: () => void
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
  onSaveAndContinue,
  onDelete,
}: CardEditFormProps) {
  return (
    <View className='card-edit-page'>
      <View className='card-edit-field'>
        <Text className='card-edit-field__label'>正面（问题）</Text>
        <View className={`card-edit-field__box ${frontError ? 'card-edit-field__box--error' : ''}`}>
          <Textarea
            className='card-edit-textarea card-edit-textarea--front'
            value={front}
            onInput={e => onFrontChange(e.detail.value)}
            placeholder='输入问题或关键词...'
            maxlength={500}
          />
        </View>
        {frontError ? <Text className='card-edit-field__error'>{frontError}</Text> : null}
      </View>

      <View className='card-edit-field'>
        <Text className='card-edit-field__label'>背面（答案）</Text>
        <View className='card-edit-field__box'>
          <Textarea
            className='card-edit-textarea card-edit-textarea--back'
            value={back}
            onInput={e => onBackChange(e.detail.value)}
            placeholder='输入答案或解释...'
            maxlength={500}
          />
        </View>
      </View>

      {isEdit && onDelete && (
        <View className='card-edit-delete-btn' onClick={onDelete}>
          <Text className='card-edit-delete-btn__text'>删除卡片</Text>
        </View>
      )}

      {isEdit ? (
        <View
          className={`card-edit-save-btn ${!isValid ? 'card-edit-save-btn--disabled' : ''}`}
          onClick={onSave}
        >
          <Text className='card-edit-save-btn__text'>保存</Text>
        </View>
      ) : (
        <View className='card-edit-bottom'>
          <View
            className={`card-edit-save-btn card-edit-save-btn--secondary ${!isValid ? 'card-edit-save-btn--disabled' : ''}`}
            onClick={onSaveAndContinue}
          >
            <Text className='card-edit-save-btn__text'>保存并继续</Text>
          </View>
          <View
            className={`card-edit-save-btn card-edit-save-btn--primary ${!isValid ? 'card-edit-save-btn--disabled' : ''}`}
            onClick={onSave}
          >
            <Text className='card-edit-save-btn__text'>创建卡片</Text>
          </View>
        </View>
      )}
    </View>
  )
}
