import { useState, useEffect, useRef } from "react";
import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { getReviewSession, clearReviewSession, setSummaryResults } from "@/utils/storage";
import { submitReview } from "@/api/review";
import { fetchTTS } from "@/api/tts";
import { ApiCard } from "@/types/api/card";
import { ReviewQuality, ReviewResult } from "@/types";
import ReviewProgress from "./components/ReviewProgress";
import ReviewCard from "./components/ReviewCard";
import RatingButtons from "./components/RatingButtons";
import "./index.scss";
/* eslint-disable no-undef */
declare const wx: any;
export default function Review() {
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [deckId, setDeckId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioRef = useRef<Taro.InnerAudioContext | null>(null);
  const bufferUrlRef = useRef<string | null>(null);
  const ttsBufferCache = useRef<Map<string, ArrayBuffer>>(new Map());

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
      audioRef.current?.destroy();
      audioRef.current = null;
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current.destroy();
      audioRef.current = null;
    }
    if (bufferUrlRef.current) {
      wx.revokeBufferURL(bufferUrlRef.current);
      bufferUrlRef.current = null;
    }
  };

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

  const playUrl = (url: string) => {
    const ctx = Taro.createInnerAudioContext();

    audioRef.current = ctx;
    ctx.onError((res: any) => {
      Taro.showToast({ title: `播放错误: ${res.errMsg}`, icon: "none" });
    });
    ctx.src = url;
    setTimeout(() => {
      ctx.play();
    });
  };

  const handlePlayTTS = async () => {
    if (!currentCard || ttsLoading) return;
    const text = currentCard.reading || currentCard.front || currentCard.back;

    stopAudio();

    let buffer = ttsBufferCache.current.get(text);
    if (!buffer) {
      setTtsLoading(true);
      try {
        const { audio } = await fetchTTS(text);
        buffer = wx.base64ToArrayBuffer(audio);
        ttsBufferCache.current.set(text, buffer);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "TTS 失败";
        Taro.showToast({ title: msg, icon: "none" });
        setTtsLoading(false);
        return;
      }
      setTtsLoading(false);
    }

    const url = wx.createBufferURL(buffer);
    bufferUrlRef.current = url;
    playUrl(url);
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
