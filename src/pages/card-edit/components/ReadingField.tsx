import { View, Text, Input } from '@tarojs/components'

interface ReadingFieldProps {
  reading: string
  ttsLoading: boolean
  onChange: (val: string) => void
  onPlayTTS: () => void
}

export default function ReadingField({ reading, ttsLoading, onChange, onPlayTTS }: ReadingFieldProps) {
  return (
    <View className='card-edit-field'>
      <View className='card-edit-field__label-row'>
        <Text className='card-edit-field__label'>读音</Text>
        <Text className='card-edit-field__badge'>选填</Text>
      </View>
      <View className='card-edit-reading-box'>
        <Input
          className='card-edit-reading-input'
          value={reading}
          onInput={e => onChange(e.detail.value)}
          placeholder='如：にほん'
        />
        <View
          className={`card-edit-tts-btn ${!reading.trim() ? 'card-edit-tts-btn--disabled' : ''} ${ttsLoading ? 'card-edit-tts-btn--loading' : ''}`}
          onClick={reading.trim() && !ttsLoading ? onPlayTTS : undefined}
        >
          <Text className='card-edit-tts-icon'>{ttsLoading ? '···' : '▶'}</Text>
        </View>
      </View>
    </View>
  )
}
