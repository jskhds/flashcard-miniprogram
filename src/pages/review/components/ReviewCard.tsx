import { View, Text, ScrollView } from "@tarojs/components";
import { ApiCard } from "@/types/api/card";

interface ReviewCardProps {
  card: ApiCard;
  isFlipped: boolean;
  isSliding: boolean;
  ttsLoading: boolean;
  onFlip: () => void;
  onPlayTTS: () => void;
}

function getFrontFontSize(len: number): string {
  if (len > 80) return "28rpx";
  if (len > 40) return "36rpx";
  return "40rpx";
}

function getAnswerFontSize(len: number): string {
  if (len > 80) return "28rpx";
  if (len > 40) return "36rpx";
  if (len > 20) return "48rpx";
  if (len > 5) return "64rpx";
  return "96rpx";
}

export default function ReviewCard({
  card,
  isFlipped,
  isSliding,
  ttsLoading,
  onFlip,
  onPlayTTS,
}: ReviewCardProps) {
  const hasReading = !!card.reading;

  return (
    <View className="review-card-container">
      <View className="review-card-frame" onClick={onFlip}>
        <View
          className={`review-card ${isFlipped ? "review-card--flipped" : ""} ${
            isSliding ? "review-card--sliding" : ""
          }`}
        >
          {/* 正面 */}
          <View className="review-card__face review-card__front">
            <View className="review-card__deco review-card__deco--tr" />
            <View className="review-card__deco review-card__deco--bl" />
            <ScrollView scrollY className="review-card__scroll">
              <View className="review-card__scroll-inner">
                <Text
                  className="review-card__content"
                  style={{ fontSize: getFrontFontSize(card.front.length) }}
                >
                  {card.front}
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* 背面 */}
          <View className="review-card__face review-card__back">
            {/* 问题行：横排一行 */}
            <View className="review-card__back-question">
              <View className="review-card__back-label-bar" />
              <Text className="review-card__back-label">问题</Text>
              <Text
                className="review-card__back-question-text"
                style={{ fontSize: getFrontFontSize(card.front.length) }}
              >
                {card.front}
              </Text>
            </View>

            <View className="review-card__answer-card">
              {/* 答案行：独占一行 */}

              <Text
                className="review-card__answer-text"
                style={{ fontSize: getAnswerFontSize(card.back.length) }}
              >
                {card.back}
              </Text>
              {hasReading && <View className="review-card__divider" />}

              {card.romaji && (
                <View className="review-card__reading-row">
                  <Text className="review-card__reading">{card.romaji}</Text>
                  <View
                    className={`review-card__tts-btn ${
                      ttsLoading ? "review-card__tts-btn--loading" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayTTS();
                    }}
                  >
                    <Text className="review-card__tts-icon">
                      {ttsLoading ? "···" : "▶"}
                    </Text>
                  </View>
                </View>
              )}

              {/* 笔顺占位 */}
              <View className="review-card__divider" />
              <View className="review-card__stroke-section">
                <View className="review-card__stroke-header">
                  <Text className="review-card__stroke-label">笔顺</Text>
                  <View className="review-card__stroke-btns">
                    <View className="review-card__stroke-btn">
                      <Text className="review-card__stroke-btn-text">播放</Text>
                    </View>
                    <View className="review-card__stroke-btn">
                      <Text className="review-card__stroke-btn-text">重播</Text>
                    </View>
                  </View>
                </View>
                <View className="review-card__stroke-canvas" />
              </View>
            </View>
          </View>
        </View>
      </View>
      {!isFlipped && (
        <Text className="review-flip-hint__text">轻触卡片查看答案</Text>
      )}
    </View>
  );
}
