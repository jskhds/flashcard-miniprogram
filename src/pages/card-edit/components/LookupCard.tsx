import { View, Text } from '@tarojs/components'

interface LookupCardProps {
  front: string
  lookupResult: { reading: string; romaji: string; meaning: string }
  onImport: () => void
  onDismiss: () => void
}

export default function LookupCard({ front, lookupResult, onImport, onDismiss }: LookupCardProps) {
  return (
    <View className='card-edit-lookup-card'>
      <View className='card-edit-lookup-card__header'>
        <Text className='card-edit-lookup-card__title'>查词结果</Text>
        <View className='card-edit-lookup-card__source'>
          <Text className='card-edit-lookup-card__source-text'>Jisho</Text>
        </View>
      </View>
      <View className='card-edit-lookup-card__main'>
        <Text className='card-edit-lookup-card__word'>{front.trim()}</Text>
        <Text className='card-edit-lookup-card__read'>{lookupResult.romaji}</Text>
      </View>
      <Text className='card-edit-lookup-card__meaning'>{lookupResult.meaning}</Text>
      <View className='card-edit-lookup-card__actions'>
        <View className='card-edit-lookup-card__btn card-edit-lookup-card__btn--import' onClick={onImport}>
          <Text>导入到卡片</Text>
        </View>
        <View className='card-edit-lookup-card__btn card-edit-lookup-card__btn--dismiss' onClick={onDismiss}>
          <Text>忽略</Text>
        </View>
      </View>
    </View>
  )
}
