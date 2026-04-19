import { View, Text, ScrollView } from '@tarojs/components'
import { DisplayStatus } from '@/types'

type FilterType = '全部' | DisplayStatus

const FILTERS: FilterType[] = ['全部', '未学', '不会', '模糊', '掌握']

interface FilterChipsProps {
  active: FilterType
  statusCounts: Record<string, number>
  totalCount: number
  onSelect: (f: FilterType) => void
}

export default function FilterChips({ active, statusCounts, totalCount, onSelect }: FilterChipsProps) {
  return (
    <ScrollView scrollX className='cards-filters'>
      {FILTERS.map(f => (
        <View
          key={f}
          className={`cards-filter-chip ${active === f ? 'cards-filter-chip--active' : ''}`}
          onClick={() => onSelect(f)}
        >
          <Text className='cards-filter-chip__text'>
            {f} {f === '全部' ? `(${totalCount})` : `(${statusCounts[f] || 0})`}
          </Text>
        </View>
      ))}
    </ScrollView>
  )
}
