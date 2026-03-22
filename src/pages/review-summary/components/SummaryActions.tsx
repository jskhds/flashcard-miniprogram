import { View, Text } from '@tarojs/components'

interface SummaryActionsProps {
  retryCount: number
  onRetry: () => void
  onBack: () => void
}

export default function SummaryActions({ retryCount, onRetry, onBack }: SummaryActionsProps) {
  return (
    <View className='summary-actions'>
      {retryCount > 0 && (
        <View className='summary-btn summary-btn--retry' onClick={onRetry}>
          <Text className='summary-btn__text'>再复习一遍 · {retryCount} 张</Text>
        </View>
      )}
      <View className='summary-btn summary-btn--back' onClick={onBack}>
        <Text className='summary-btn__text'>返回卡组</Text>
      </View>
    </View>
  )
}
