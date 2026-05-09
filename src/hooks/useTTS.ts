import { useState, useRef, useCallback } from "react";
import Taro from "@tarojs/taro";
import { fetchTTS } from "@/api/tts";

/* eslint-disable no-undef */
declare const wx: any;

export function useTTS() {
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioRef = useRef<Taro.InnerAudioContext | null>(null);
  const bufferUrlRef = useRef<string | null>(null);
  const cacheRef = useRef<Map<string, ArrayBuffer>>(new Map());

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current.destroy();
      audioRef.current = null;
    }
    if (bufferUrlRef.current) {
      wx.revokeBufferURL(bufferUrlRef.current);
      bufferUrlRef.current = null;
    }
  }, []);

  const playTTS = async (text: string) => {
    if (!text || ttsLoading) return;
    stopAudio();

    let buffer = cacheRef.current.get(text);
    if (!buffer) {
      setTtsLoading(true);
      try {
        const { audio } = await fetchTTS(text);
        buffer = wx.base64ToArrayBuffer(audio);
        cacheRef.current.set(text, buffer);
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

    const ctx = Taro.createInnerAudioContext();
    audioRef.current = ctx;
    ctx.obeyMuteSwitch = false;
    ctx.onError((res: any) => {
      Taro.showToast({ title: `播放错误: ${res.errMsg}`, icon: "none" });
    });
    ctx.src = url;
    setTimeout(() => ctx.play());
  };

  return { ttsLoading, playTTS, stopAudio };
}
