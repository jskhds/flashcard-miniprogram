import { View, Text } from '@tarojs/components'

interface ProgressBarProps {
  rate: number
  wrapperClass: string
  barClass: string
  fillClass: string
  label?: string
  labelClass?: string
}

export default function ProgressBar({
  rate,
  wrapperClass,
  barClass,
  fillClass,
  label,
  labelClass,
}: ProgressBarProps) {
  return (
    <View className={wrapperClass}>
      <View className={barClass}>
        <View className={fillClass} style={{ width: `${rate}%` }} />
      </View>
      {label !== undefined && labelClass && (
        <Text className={labelClass}>{label}</Text>
      )}
    </View>
  )
}
