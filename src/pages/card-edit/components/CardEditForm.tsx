import { View, Text, Textarea, Input } from '@tarojs/components'
import type { LookupResult } from '@/api/lookup'
import LookupCard from './LookupCard'
import ReadingField from './ReadingField'
import FormActions from './FormActions'

export type WordLookup = Pick<LookupResult, 'reading' | 'romaji' | 'meaning'>

interface CardEditFormProps {
  isJa: boolean

  frontField: {
    value: string
    error: string
    onChange: (val: string) => void
  }

  backField: {
    value: string
    onChange: (val: string) => void
  }

  lookup: {
    loading: boolean
    result: WordLookup | null
    onTrigger: () => void
    onImport: () => void
    onDismiss: () => void
  }

  readingField: {
    value: string
    ttsLoading: boolean
    onChange: (val: string) => void
    onPlayTTS: () => void
  }

  exampleField: {
    value: string
    onChange: (val: string) => void
  }

  actions: {
    isEdit: boolean
    isValid: boolean
    onSave: () => void
    onSaveAndContinue?: () => void
    onDelete?: () => void
  }
}

export default function CardEditForm({
  isJa,
  frontField,
  backField,
  lookup,
  readingField,
  exampleField,
  actions,
}: CardEditFormProps) {
  return (
    <View className="card-edit-page">
      <View className="card-edit-field">
        <View className="card-edit-field__label-row">
          <Text className="card-edit-field__label">
            {isJa ? '正面（假名 / 单词）' : '正面（问题）'}
          </Text>
          {isJa && frontField.value && (
            <View
              className={`card-edit-lookup-btn ${lookup.loading ? 'card-edit-lookup-btn--loading' : ''}`}
              onClick={lookup.onTrigger}
            >
              <Text className="card-edit-lookup-btn__text">
                {lookup.loading ? '查询中...' : '查词'}
              </Text>
            </View>
          )}
        </View>
        <View
          className={`card-edit-field__box ${frontField.error ? 'card-edit-field__box--error' : ''}`}
        >
          <Textarea
            className="card-edit-textarea card-edit-textarea--front"
            value={frontField.value}
            onInput={e => frontField.onChange(e.detail.value)}
            placeholder="输入问题或关键词..."
            maxlength={500}
          />
        </View>
        {frontField.error ? (
          <Text className="card-edit-field__error">{frontField.error}</Text>
        ) : null}
      </View>

      {isJa && lookup.result && (
        <LookupCard
          front={frontField.value.trim()}
          lookupResult={lookup.result}
          onImport={lookup.onImport}
          onDismiss={lookup.onDismiss}
        />
      )}

      {isJa && (
        <ReadingField
          reading={readingField.value}
          ttsLoading={readingField.ttsLoading}
          onChange={readingField.onChange}
          onPlayTTS={readingField.onPlayTTS}
        />
      )}

      <View className="card-edit-field">
        <Text className="card-edit-field__label">{isJa ? '背面（释义）' : '背面（答案）'}</Text>
        <View className="card-edit-field__box">
          <Textarea
            className="card-edit-textarea card-edit-textarea--back"
            value={backField.value}
            onInput={e => backField.onChange(e.detail.value)}
            placeholder="输入答案或解释..."
            maxlength={500}
          />
        </View>
      </View>

      {isJa && (
        <View className="card-edit-field">
          <View className="card-edit-field__label-row">
            <Text className="card-edit-field__label">例句</Text>
            <Text className="card-edit-field__badge">选填</Text>
          </View>
          <View className="card-edit-field__box card-edit-field__box--single">
            <Input
              className="card-edit-single-input"
              value={exampleField.value}
              onInput={e => exampleField.onChange(e.detail.value)}
              placeholder="输入例句..."
            />
          </View>
        </View>
      )}

      <FormActions
        isEdit={actions.isEdit}
        isValid={actions.isValid}
        onSave={actions.onSave}
        onSaveAndContinue={actions.onSaveAndContinue}
        onDelete={actions.onDelete}
      />
    </View>
  )
}
