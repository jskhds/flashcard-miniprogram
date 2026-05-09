import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { getReviewSession, clearReviewSession, setSummaryResults } from "@/utils/storage";
import { submitReview } from "@/api/review";
import { ApiCard } from "@/types/api/card";
import { ReviewQuality, ReviewResult } from "@/types";
import { useTTS } from "@/hooks/useTTS";
import ReviewProgress from "./components/ReviewProgress";
import ReviewCard from "./components/ReviewCard";
import RatingButtons from "./components/RatingButtons";
import "./index.scss";

export default function Review() {
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [deckId, setDeckId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const { ttsLoading, playTTS, stopAudio } = useTTS();

  useEffect(() => {
    const session = getReviewSession<{ cards: ApiCard[]; deckId: string }>();
    if (!session || session.cards.length === 0) {
      Taro.showToast({ title: "没有卡片可以复习", icon: "none" });
      setTimeout(() => Taro.navigateBack(), 800);
      return;
    }
    setCards(session.cards);
    setDeckId(session.deckId || "");
    clearReviewSession();

    return () => {
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  const handleRate = async (quality: ReviewQuality) => {
    if (!currentCard || isSliding) return;

    stopAudio();
    const newResults: ReviewResult[] = [...results, { cardId: currentCard._id, quality }];
    setResults(newResults);

    if (currentIndex < cards.length - 1) {
      setIsSliding(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        setIsSliding(false);
      }, 280);
    } else {
      setIsSliding(true);
      setTimeout(async () => {
        const res = await submitReview(deckId, newResults);
        setSummaryResults({ results: newResults, deckId, streak: res.streak });
        Taro.redirectTo({ url: "/pages/review-summary/index" });
      }, 300);
    }
  };

  const handlePlayTTS = () => {
    if (!currentCard) return;
    playTTS(currentCard.front || currentCard.reading || currentCard.back);
  };

  const handleFlip = () => {
    setIsFlipped(f => !f);
    if (isFlipped) stopAudio();
  };

  if (cards.length === 0) {
    return (
      <View className="review-page">
        <View className="review-loading">
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="review-page">
      {cards.length > 1 && (
        <ReviewProgress current={currentIndex + 1} total={cards.length} progress={progress} />
      )}
      <ReviewCard
        card={currentCard}
        isFlipped={isFlipped}
        isSliding={isSliding}
        ttsLoading={ttsLoading}
        onFlip={handleFlip}
        onPlayTTS={handlePlayTTS}
      />
      {isFlipped && <RatingButtons onRate={handleRate} />}
    </View>
  );
}
