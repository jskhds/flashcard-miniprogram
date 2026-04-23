/* eslint-disable no-undef */
import { useState, useEffect, useRef, useCallback } from "react";
import Taro, { useRouter } from "@tarojs/taro";
import { getCards, createCard, updateCard, deleteCard } from "@/api/cards";
import { lookupWord } from "@/api/lookup";
import { fetchTTS } from "@/api/tts";
import { loginReady } from "@/utils/loginReady";
import CardEditForm, { type WordLookup } from "./components/CardEditForm";
import "./index.scss";

declare const wx: any;

export default function CardEdit() {
  const router = useRouter();
  const deckId = router.params.deckId as string;
  const cardId = router.params.cardId as string;
  const isEdit = !!cardId;
  const isJa = (router.params.deckType ?? "general") === "ja";

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [reading, setReading] = useState("");
  const [romaji, setRomaji] = useState("");
  const [pitch, setPitch] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [frontError, setFrontError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<WordLookup | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioRef = useRef<Taro.InnerAudioContext | null>(null);

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: isEdit ? "编辑卡片" : "新建卡片" });
    if (isEdit) {
      loginReady.then(async () => {
        const cards = await getCards(deckId);
        const card = cards.find(c => c._id === cardId);
        if (card) {
          setFront(card.front);
          setBack(card.back);
          setReading(card.reading ?? "");
          setRomaji(card.romaji ?? "");
          setPitch(card.pitch != null ? String(card.pitch) : "");
          setMeaning(card.meaning ?? "");
          setExample(card.example ?? "");
        }
      });
    }
    return () => {
      audioRef.current?.stop();
      audioRef.current?.destroy();
      audioRef.current = null;
    };
  }, []);

  const isValid = front.trim().length > 0 && back.trim().length > 0;

  const buildFields = () => ({
    front: front.trim(),
    back: back.trim(),
    reading: reading.trim() || undefined,
    romaji: romaji.trim() || undefined,
    pitch: pitch !== "" ? Number(pitch) : undefined,
    meaning: meaning.trim() || undefined,
    example: example.trim() || undefined,
  });

  const handleLookup = async () => {
    if (!front.trim() || lookupLoading) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      await loginReady;
      const res = await lookupWord(front.trim());
      setLookupResult({ reading: res.reading, romaji: res.romaji, meaning: res.meaning });
    } catch (e: any) {
      Taro.showToast({ title: e.message ?? "查词失败", icon: "none" });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleLookupImport = () => {
    if (!lookupResult) return;
    setReading(lookupResult.romaji);
    setRomaji(lookupResult.romaji);
    setMeaning(lookupResult.meaning);
    if (!back.trim()) setBack(lookupResult.meaning);
    setLookupResult(null);
  };

  const handlePlayReadingTTS = async () => {
    if (!reading.trim() || ttsLoading) return;
    setTtsLoading(true);
    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current.destroy();
      audioRef.current = null;
    }
    try {
      const { audio } = await fetchTTS(front.trim());
      const fs = wx.getFileSystemManager();
      const dir = wx.env.USER_DATA_PATH;
      await new Promise<void>(resolve => {
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
          fail: (e: any) => reject(new Error(e.errMsg)),
        });
      });
      const ctx = Taro.createInnerAudioContext();
      ctx.obeyMuteSwitch = false;
      audioRef.current = ctx;
      ctx.src = tmpPath;
      ctx.play();
    } catch (e: any) {
      Taro.showToast({ title: e.message ?? "TTS 失败", icon: "none" });
    } finally {
      setTtsLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!isValid) return;
    try {
      await createCard(deckId, buildFields());
      Taro.showToast({ title: "已创建，继续添加", icon: "success" });
      setFront("");
      setBack("");
      setReading("");
      setRomaji("");
      setPitch("");
      setMeaning("");
      setExample("");
      setFrontError("");
      setLookupResult(null);
    } catch (e: any) {
      setFrontError(e.message ?? "创建失败");
    }
  };

  const handleSave = async () => {
    if (!isValid) return;
    try {
      if (isEdit) {
        await updateCard(deckId, cardId, buildFields());
      } else {
        await createCard(deckId, buildFields());
      }
      Taro.showToast({ title: isEdit ? "已保存" : "卡片已创建", icon: "success" });
      Taro.navigateBack();
    } catch (e: any) {
      setFrontError(e.message ?? "保存失败");
    }
  };

  const handleFrontChange = useCallback((val: string) => {
    setFront(val);
    setFrontError("");
  }, []);

  const handleReadingChange = useCallback((val: string) => {
    setReading(val);
    setRomaji(val);
  }, []);

  const handleDelete = () => {
    Taro.showModal({
      title: "删除卡片",
      content: "确认删除这张卡片？",
      confirmText: "删除",
      confirmColor: "#FF3B30",
      success: async res => {
        if (res.confirm) {
          await deleteCard(deckId, cardId);
          Taro.showToast({ title: "已删除", icon: "success" });
          Taro.navigateBack();
        }
      },
    });
  };

  return (
    <CardEditForm
      isJa={isJa}
      frontField={{ value: front, error: frontError, onChange: handleFrontChange }}
      backField={{ value: back, onChange: setBack }}
      lookup={{
        loading: lookupLoading,
        result: lookupResult,
        onTrigger: handleLookup,
        onImport: handleLookupImport,
        onDismiss: () => setLookupResult(null),
      }}
      readingField={{
        value: reading,
        ttsLoading,
        onChange: handleReadingChange,
        onPlayTTS: handlePlayReadingTTS,
      }}
      exampleField={{ value: example, onChange: setExample }}
      actions={{
        isEdit,
        isValid,
        onSave: handleSave,
        onSaveAndContinue: handleSaveAndContinue,
        onDelete: handleDelete,
      }}
    />
  );
}
