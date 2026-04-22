import { View, Text, Textarea, Input } from "@tarojs/components";

interface CardEditFormProps {
  front: string;
  back: string;
  reading: string;
  romaji: string;
  pitch: string;
  meaning: string;
  example: string;
  frontError: string;
  isEdit: boolean;
  isValid: boolean;
  isJa: boolean;
  lookupLoading: boolean;
  ttsLoading: boolean;
  lookupResult: { reading: string; romaji: string; meaning: string } | null;
  onFrontChange: (val: string) => void;
  onBackChange: (val: string) => void;
  onReadingChange: (val: string) => void;
  onRomajiChange: (val: string) => void;
  onPitchChange: (val: string) => void;
  onMeaningChange: (val: string) => void;
  onExampleChange: (val: string) => void;
  onLookup: () => void;
  onLookupImport: () => void;
  onLookupDismiss: () => void;
  onPlayReadingTTS: () => void;
  onSave: () => void;
  onSaveAndContinue?: () => void;
  onDelete?: () => void;
}

export default function CardEditForm({
  front,
  back,
  reading,
  example,
  frontError,
  isEdit,
  isValid,
  isJa,
  lookupLoading,
  ttsLoading,
  lookupResult,
  onFrontChange,
  onBackChange,
  onReadingChange,
  onExampleChange,
  onLookup,
  onLookupImport,
  onLookupDismiss,
  onPlayReadingTTS,
  onSave,
  onSaveAndContinue,
  onDelete,
}: CardEditFormProps) {
  return (
    <View className="card-edit-page">
      {/* 正面 */}
      <View className="card-edit-field">
        <View className="card-edit-field__label-row">
          <Text className="card-edit-field__label">
            {isJa ? "正面（假名 / 单词）" : "正面（问题）"}
          </Text>
          {isJa && front && (
            <View
              className={`card-edit-lookup-btn ${
                lookupLoading ? "card-edit-lookup-btn--loading" : ""
              }`}
              onClick={onLookup}
            >
              <Text className="card-edit-lookup-btn__text">
                {lookupLoading ? "查询中..." : "查词"}
              </Text>
            </View>
          )}
        </View>
        <View
          className={`card-edit-field__box ${
            frontError ? "card-edit-field__box--error" : ""
          }`}
        >
          <Textarea
            className="card-edit-textarea card-edit-textarea--front"
            value={front}
            onInput={(e) => onFrontChange(e.detail.value)}
            placeholder="输入问题或关键词..."
            maxlength={500}
          />
        </View>
        {frontError ? (
          <Text className="card-edit-field__error">{frontError}</Text>
        ) : null}
      </View>

      {/* 查词结果卡 */}
      {isJa && lookupResult && (
        <View className="card-edit-lookup-card">
          <View className="card-edit-lookup-card__header">
            <Text className="card-edit-lookup-card__title">查词结果</Text>
            <View className="card-edit-lookup-card__source">
              <Text className="card-edit-lookup-card__source-text">Jisho</Text>
            </View>
          </View>
          <View className="card-edit-lookup-card__main">
            <Text className="card-edit-lookup-card__word">{front.trim()}</Text>
            <Text className="card-edit-lookup-card__read">
              {lookupResult.romaji}
            </Text>
          </View>
          <Text className="card-edit-lookup-card__meaning">
            {lookupResult.meaning}
          </Text>
          <View className="card-edit-lookup-card__actions">
            <View
              className="card-edit-lookup-card__btn card-edit-lookup-card__btn--import"
              onClick={onLookupImport}
            >
              <Text>导入到卡片</Text>
            </View>
            <View
              className="card-edit-lookup-card__btn card-edit-lookup-card__btn--dismiss"
              onClick={onLookupDismiss}
            >
              <Text>忽略</Text>
            </View>
          </View>
        </View>
      )}

      {/* 读音（isJa only） */}
      {isJa && (
        <View className="card-edit-field">
          <View className="card-edit-field__label-row">
            <Text className="card-edit-field__label">读音</Text>
            <Text className="card-edit-field__badge">选填</Text>
          </View>
          <View className="card-edit-reading-box">
            <Input
              className="card-edit-reading-input"
              value={reading}
              onInput={(e) => onReadingChange(e.detail.value)}
              placeholder="如：にほん"
            />
            <View
              className={`card-edit-tts-btn ${
                !reading.trim() ? "card-edit-tts-btn--disabled" : ""
              } ${ttsLoading ? "card-edit-tts-btn--loading" : ""}`}
              onClick={
                reading.trim() && !ttsLoading ? onPlayReadingTTS : undefined
              }
            >
              <Text className="card-edit-tts-icon">
                {ttsLoading ? "···" : "▶"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 背面 */}
      <View className="card-edit-field">
        <Text className="card-edit-field__label">
          {isJa ? "背面（释义）" : "背面（答案）"}
        </Text>
        <View className="card-edit-field__box">
          <Textarea
            className="card-edit-textarea card-edit-textarea--back"
            value={back}
            onInput={(e) => onBackChange(e.detail.value)}
            placeholder="输入答案或解释..."
            maxlength={500}
          />
        </View>
      </View>

      {/* 例句（isJa only） */}
      {isJa && (
        <View className="card-edit-field">
          <View className="card-edit-field__label-row">
            <Text className="card-edit-field__label">例句</Text>
            <Text className="card-edit-field__badge">选填</Text>
          </View>
          <View className="card-edit-field__box card-edit-field__box--single">
            <Input
              className="card-edit-single-input"
              value={example}
              onInput={(e) => onExampleChange(e.detail.value)}
              placeholder="输入例句..."
            />
          </View>
        </View>
      )}

      {isEdit && onDelete && (
        <View className="card-edit-delete-btn" onClick={onDelete}>
          <Text className="card-edit-delete-btn__text">删除卡片</Text>
        </View>
      )}

      {isEdit ? (
        <View
          className={`card-edit-save-btn ${
            !isValid ? "card-edit-save-btn--disabled" : ""
          }`}
          onClick={onSave}
        >
          <Text className="card-edit-save-btn__text">保存</Text>
        </View>
      ) : (
        <View className="card-edit-bottom">
          <View
            className={`card-edit-save-btn card-edit-save-btn--secondary ${
              !isValid ? "card-edit-save-btn--disabled" : ""
            }`}
            onClick={onSaveAndContinue}
          >
            <Text className="card-edit-save-btn__text">保存并继续</Text>
          </View>
          <View
            className={`card-edit-save-btn card-edit-save-btn--primary ${
              !isValid ? "card-edit-save-btn--disabled" : ""
            }`}
            onClick={onSave}
          >
            <Text className="card-edit-save-btn__text">创建卡片</Text>
          </View>
        </View>
      )}
    </View>
  );
}
