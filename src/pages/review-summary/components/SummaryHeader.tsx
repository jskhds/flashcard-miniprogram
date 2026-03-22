import { View, Text } from '@tarojs/components'

interface SummaryHeaderProps {
  knowRate: number
  streak: number
}

export default function SummaryHeader({ knowRate, streak }: SummaryHeaderProps) {
  const emoji = knowRate >= 80 ? '🎉' : knowRate >= 50 ? '💪' : '📖'
  const message = knowRate >= 80 ? '太棒了！继续保持！' : knowRate >= 50 ? '不错！再加把劲！' : '没关系，多练几次就好！'

  return (
    <View className='summary-header'>
      <Text className='summary-emoji'>{emoji}</Text>
      <Text className='summary-title'>本轮复习完成</Text>
      <Text className='summary-message'>{message}</Text>
      {streak > 0 && (
        <View className='summary-streak'>
          <Text className='summary-streak__text'>🔥 连续 {streak} 天复习</Text>
        </View>
      )}
    </View>
  )
}
