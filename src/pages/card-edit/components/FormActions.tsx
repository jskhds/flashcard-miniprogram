import { View, Text } from '@tarojs/components'

interface FormActionsProps {
  isEdit: boolean
  isValid: boolean
  onSave: () => void
  onSaveAndContinue?: () => void
  onDelete?: () => void
}

export default function FormActions({
  isEdit,
  isValid,
  onSave,
  onSaveAndContinue,
  onDelete,
}: FormActionsProps) {
  return (
    <View>
      {isEdit && onDelete && (
        <View className="card-edit-delete-btn" onClick={onDelete}>
          <Text className="card-edit-delete-btn__text">删除卡片</Text>
        </View>
      )}
      {isEdit ? (
        <View
          className={`card-edit-save-btn ${!isValid ? 'card-edit-save-btn--disabled' : ''}`}
          onClick={onSave}
        >
          <Text className="card-edit-save-btn__text">保存</Text>
        </View>
      ) : (
        <View className="card-edit-bottom">
          <View
            className={`card-edit-save-btn card-edit-save-btn--secondary ${!isValid ? 'card-edit-save-btn--disabled' : ''}`}
            onClick={onSaveAndContinue}
          >
            <Text className="card-edit-save-btn__text">保存并继续</Text>
          </View>
          <View
            className={`card-edit-save-btn card-edit-save-btn--primary ${!isValid ? 'card-edit-save-btn--disabled' : ''}`}
            onClick={onSave}
          >
            <Text className="card-edit-save-btn__text">创建卡片</Text>
          </View>
        </View>
      )}
    </View>
  )
}
