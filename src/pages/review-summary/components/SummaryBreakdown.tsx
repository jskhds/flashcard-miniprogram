import { View, Text } from '@tarojs/components'

interface SummaryBreakdownProps {
  total: number
  know: number
  fuzzy: number
  unknown: number
}

export default function SummaryBreakdown({ total, know, fuzzy, unknown }: SummaryBreakdownProps) {
  const pct = (n: number) => total > 0 ? Math.round(n / total * 100) : 0

  return (
    <View className='summary-breakdown'>
      <View className='summary-item summary-item--know'>
        <View className='summary-item__top'>
          <Text className='summary-item__count'>{know}</Text>
          <Text className='summary-item__pct'>{pct(know)}%</Text>
        </View>
        <Text className='summary-item__label'>掌握</Text>
        <View className='summary-item__bar'>
          <View className='summary-item__fill' style={{ width: `${pct(know)}%`, background: '#34C759' }} />
        </View>
      </View>

      <View className='summary-item summary-item--fuzzy'>
        <View className='summary-item__top'>
          <Text className='summary-item__count'>{fuzzy}</Text>
          <Text className='summary-item__pct'>{pct(fuzzy)}%</Text>
        </View>
        <Text className='summary-item__label'>模糊</Text>
        <View className='summary-item__bar'>
          <View className='summary-item__fill' style={{ width: `${pct(fuzzy)}%`, background: '#FF9500' }} />
        </View>
      </View>

      <View className='summary-item summary-item--unknown'>
        <View className='summary-item__top'>
          <Text className='summary-item__count'>{unknown}</Text>
          <Text className='summary-item__pct'>{pct(unknown)}%</Text>
        </View>
        <Text className='summary-item__label'>不会</Text>
        <View className='summary-item__bar'>
          <View className='summary-item__fill' style={{ width: `${pct(unknown)}%`, background: '#FF3B30' }} />
        </View>
      </View>
    </View>
  )
}
