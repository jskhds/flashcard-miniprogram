/* eslint-disable no-undef */
declare const wx: any;
import { useState, useEffect, useRef } from "react";
import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import {
  getReviewSession,
  clearReviewSession,
  setSummaryResults,
} from "@/utils/storage";
import { submitReview } from "@/api/review";
import { fetchTTS } from "@/api/tts";
import { BASE_URL } from "@/api/request";
import { ApiCard } from "@/types/api/card";
import { ReviewQuality, ReviewResult } from "@/types";
import ReviewProgress from "./components/ReviewProgress";
import ReviewCard from "./components/ReviewCard";
import RatingButtons from "./components/RatingButtons";
import "./index.scss";

const KANA_AUDIO_SET = new Set([
  "a",
  "i",
  "u",
  "e",
  "o",
  "ba",
  "be",
  "bi",
  "bo",
  "bu",
  "bya",
  "byo",
  "byu",
  "ci",
  "cu",
  "cya",
  "cyo",
  "cyu",
  "da",
  "de",
  "di",
  "do",
  "du",
  "e",
  "ga",
  "ge",
  "gi",
  "go",
  "gu",
  "gya",
  "gyo",
  "gyu",
  "ha",
  "he",
  "hi",
  "ho",
  "hu",
  "hya",
  "hyo",
  "hyu",
  "ka",
  "ke",
  "ki",
  "ko",
  "ku",
  "kya",
  "kyo",
  "kyu",
  "ma",
  "me",
  "mi",
  "mo",
  "mu",
  "mya",
  "myo",
  "myu",
  "n",
  "na",
  "ne",
  "ni",
  "no",
  "nu",
  "nya",
  "nyo",
  "nyu",
  "pa",
  "pe",
  "pi",
  "po",
  "pu",
  "pya",
  "pyo",
  "pyu",
  "ra",
  "re",
  "ri",
  "ro",
  "ru",
  "rya",
  "ryo",
  "ryu",
  "sa",
  "se",
  "si",
  "so",
  "su",
  "sya",
  "syo",
  "syu",
  "ta",
  "te",
  "to",
  "u",
  "wa",
  "ya",
  "yo",
  "yu",
  "za",
  "ze",
  "zi",
  "zo",
  "zu",
  "zya",
  "zyo",
  "zyu",
]);

export default function Review() {
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [deckId, setDeckId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioRef = useRef<Taro.InnerAudioContext | null>(null);

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
  };

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  const handleRate = async (quality: ReviewQuality) => {
    if (!currentCard || isSliding) return;

    stopAudio();
    const newResults: ReviewResult[] = [
      ...results,
      { cardId: currentCard._id, quality },
    ];
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
    ctx.obeyMuteSwitch = false;
    audioRef.current = ctx;
    ctx.onError((res: any) => {
      Taro.showToast({ title: `播放错误: ${res.errMsg}`, icon: "none" });
    });
    ctx.src = url;
    ctx.play();
  };

  const playBase64 = async (audio: string) => {
    const fs = wx.getFileSystemManager();
    const dir = wx.env.USER_DATA_PATH;
    await new Promise<void>((resolve) => {
      fs.readdir({
        dirPath: dir,
        success: ({ files }: { files: string[] }) => {
          files
            .filter((f: string) => f.startsWith("tts_"))
            .forEach((f: string) => {
              try {
                fs.unlinkSync(`${dir}/${f}`);
              } catch (_) {}
            });
          resolve();
        },
        fail: () => resolve(),
      });
    });
    const tmpPath = `${dir}/tts_${Date.now()}.mp3`;
    await new Promise<void>((resolve, reject) => {
      fs.writeFile({
        filePath: tmpPath,
        data: audio,
        encoding: "base64",
        success: () => resolve(),
        fail: (err: any) => reject(new Error(err.errMsg)),
      });
    });
    playUrl(tmpPath);
  };

  const handlePlayTTS = async () => {
    if (!currentCard || ttsLoading) return;
    setTtsLoading(true);
    stopAudio();

    try {
      if (currentCard.romaji && KANA_AUDIO_SET.has(currentCard.romaji)) {
        const audioBase = BASE_URL.replace("/api", "");
        playUrl(`${audioBase}/audio/${currentCard.romaji}.mp3`);
        return;
      }
      const text = currentCard.front || currentCard.back;
      const { audio } = await fetchTTS(text);
      await playBase64(audio);
    } catch (e: any) {
      Taro.showToast({ title: e.message ?? "TTS 失败", icon: "none" });
    } finally {
      setTtsLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped((f) => !f);
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
        <ReviewProgress
          current={currentIndex + 1}
          total={cards.length}
          progress={progress}
        />
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
