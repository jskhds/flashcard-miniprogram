import { View, Text } from '@tarojs/components'
import { DisplayStatus } from '@/types'
import { getStatusColor } from '@/utils/sm2'

interface CardStatsProps {
  statusCounts: Record<string, number>
}

const STATUS_LIST: DisplayStatus[] = ['未学', '不会', '模糊', '掌握']

export default function CardStats({ statusCounts }: CardStatsProps) {
  return (
    <View className='cards-stats'>
      {STATUS_LIST.map(s => (
        <View key={s} className='cards-stat-item'>
          <View className='cards-stat-dot' style={{ background: getStatusColor(s) }} />
          <Text className='cards-stat-count'>{statusCounts[s] || 0}</Text>
          <Text className='cards-stat-label'>{s}</Text>
        </View>
      ))}
    </View>
  )
}
