// pages/stroke-practice/index.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";

import Draw, { DrawHandle } from "./components/draw";
import TextSample, { TextSampleHandle } from "./components/textSample";
import { CanvasConfig } from "./types";
import { matchStroke, StrokeRef } from "../../utils/strokeMatcher";
import { fetchStrokeData } from "../../api/strokeData";

import "./index.scss";

export default function StrokePractice() {
  const { params } = useRouter();
  const char = decodeURIComponent(params.char ?? "");

  const drawRef = useRef<DrawHandle>(null);
  const textSampleRef = useRef<TextSampleHandle>(null);

  const canvasConfig = useMemo((): CanvasConfig => {
    const { windowWidth, pixelRatio } = Taro.getWindowInfo();
    const pagePaddingPx = Math.round((80 / 750) * windowWidth);
    const size = windowWidth - pagePaddingPx;
    return { width: size, height: size, scale: Math.min(pixelRatio || 2, 3) };
  }, []);

  const [loading, setLoading] = useState(true);
  const [strokes, setStrokes] = useState<StrokeRef[] | null>(null);
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [mode, setMode] = useState<"guided" | "blind">("guided");
  const [failCount, setFailCount] = useState(0);
  const isDoneRef = useRef(false);

  useEffect(() => {
    if (!char) {
      Taro.showToast({ title: "字符无效", icon: "none" });
      setTimeout(() => Taro.navigateBack(), 800);
      return;
    }
    fetchStrokeData(char)
      .then(data => {
        if (!data.strokes?.length) {
          Taro.showToast({ title: "笔顺数据为空", icon: "none" });
          setTimeout(() => Taro.navigateBack(), 800);
          return;
        }
        setStrokes(data.strokes);
        setLoading(false);
      })
      .catch(() => {
        Taro.showToast({ title: "加载笔顺数据失败", icon: "none" });
        setTimeout(() => Taro.navigateBack(), 800);
      });
  }, [char]);

  const total = strokes?.length ?? 0;

  const handleStrokeEnd = (points: [number, number][]) => {
    if (!strokes || isDoneRef.current || strokeIndex >= total) return;
    const r = matchStroke(points, strokes[strokeIndex], canvasConfig.width);
    if (r.passed) {
      const nextIndex = strokeIndex + 1;
      setFailCount(0);
      if (nextIndex >= total) {
        isDoneRef.current = true;
        // 直接同步绘制所有笔画为实线，不依赖 React re-render 时序
        textSampleRef.current?.markAllSolid();
        drawRef.current?.clear();
        setStrokeIndex(nextIndex);
        Taro.showToast({ title: "完成 🎉", icon: "none", duration: 1500 });
        setTimeout(() => {
          isDoneRef.current = false;
          drawRef.current?.clear();
          setStrokeIndex(0);
          setFailCount(0);
        }, 1500);
      } else {
        drawRef.current?.clear();
        setStrokeIndex(nextIndex);
      }
    } else {
      drawRef.current?.clear();
      setFailCount(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    isDoneRef.current = false;
    drawRef.current?.clear();
    setStrokeIndex(0);
    setFailCount(0);
  };

  const handleModeToggle = () => {
    isDoneRef.current = false;
    setMode(m => (m === "guided" ? "blind" : "guided"));
    drawRef.current?.clear();
    setStrokeIndex(0);
    setFailCount(0);
  };

  if (loading) {
    return (
      <View className="stroke-practice-page stroke-practice-page--center">
        <Text className="stroke-loading">加载中…</Text>
      </View>
    );
  }

  return (
    <View className="stroke-practice-page">
      <View className="stroke-header">
        <Text className="stroke-char">{char}</Text>
        <Text className="stroke-hint">
          第 {strokeIndex + 1} / {total} 笔
        </Text>
        <View className="mode-toggle" onClick={handleModeToggle}>
          {mode === "guided" ? "盲写" : "引导"}
        </View>
      </View>

      <View className="canvas-card">
        <View
          className="canvas-container"
          style={`width: ${canvasConfig.width}px; height: ${canvasConfig.height}px;`}
        >
          <TextSample
            ref={textSampleRef}
            config={canvasConfig}
            strokes={strokes!}
            mode={mode}
            passedCount={strokeIndex}
            failCount={failCount}
          />
          <Draw ref={drawRef} config={canvasConfig} onStrokeEnd={handleStrokeEnd} />
        </View>
      </View>

      <View className="controls">
        <View className="btn-restart" onClick={handleRestart}>
          重新开始
        </View>
      </View>
    </View>
  );
}
