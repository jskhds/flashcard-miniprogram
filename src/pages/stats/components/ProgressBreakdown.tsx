import { View, Text } from '@tarojs/components'

interface ProgressBreakdownProps {
  newCount: number
  unknown: number
  fuzzy: number
  mastered: number
}

export default function ProgressBreakdown({ newCount, unknown, fuzzy, mastered }: ProgressBreakdownProps) {
  const total = newCount + unknown + fuzzy + mastered
  if (total === 0) return null

  return (
    <View className='stats-card'>
      <Text className='stats-card-title'>整体学习进度</Text>

      <View className='progress-bar-seg'>
        {newCount > 0 && <View className='progress-bar-seg__fill progress-bar-seg__fill--new' style={{ flex: newCount }} />}
        {unknown > 0 && <View className='progress-bar-seg__fill progress-bar-seg__fill--unknown' style={{ flex: unknown }} />}
        {fuzzy > 0 && <View className='progress-bar-seg__fill progress-bar-seg__fill--fuzzy' style={{ flex: fuzzy }} />}
        {mastered > 0 && <View className='progress-bar-seg__fill progress-bar-seg__fill--mastered' style={{ flex: mastered }} />}
      </View>

      <View className='progress-chips'>
        <View className='progress-chip progress-chip--new'>
          <View className='progress-chip__dot' />
          <Text className='progress-chip__num'>{newCount}</Text>
          <Text className='progress-chip__label'>未学</Text>
        </View>
        <View className='progress-chip progress-chip--unknown'>
          <View className='progress-chip__dot' />
          <Text className='progress-chip__num'>{unknown}</Text>
          <Text className='progress-chip__label'>不会</Text>
        </View>
        <View className='progress-chip progress-chip--fuzzy'>
          <View className='progress-chip__dot' />
          <Text className='progress-chip__num'>{fuzzy}</Text>
          <Text className='progress-chip__label'>模糊</Text>
        </View>
        <View className='progress-chip progress-chip--mastered'>
          <View className='progress-chip__dot' />
          <Text className='progress-chip__num'>{mastered}</Text>
          <Text className='progress-chip__label'>掌握</Text>
        </View>
      </View>
    </View>
  )
}
