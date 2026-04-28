// pages/stroke-practice/index.tsx
import { useEffect, useRef, useState } from "react";
import { Text, View } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";

import Draw, { DrawHandle } from "./components/draw";
import TextSample from "./components/textSample";
import { CanvasConfig } from "./types";
import { matchStroke, StrokeRef, MatchResult } from "../../utils/strokeMatcher";
import { fetchStrokeData } from "../../api/strokeData";

import "./index.scss";

const canvasConfig: CanvasConfig = {
  width: 320,
  height: 320,
  scale: 2,
};

export default function StrokePractice() {
  const { params } = useRouter();
  const char = decodeURIComponent(params.char ?? "");

  const drawRef = useRef<DrawHandle>(null);
  const passedStrokes = useRef<[number, number][][]>([]);

  const [loading, setLoading] = useState(true);
  const [strokes, setStrokes] = useState<StrokeRef[] | null>(null);
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [result, setResult] = useState<MatchResult | null>(null);

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
  const isComplete = !loading && total > 0 && strokeIndex >= total;

  const handleStrokeEnd = (points: [number, number][]) => {
    if (!strokes || strokeIndex >= total) return;
    const r = matchStroke(points, strokes[strokeIndex], canvasConfig.width);
    setResult(r);
    if (r.passed) {
      passedStrokes.current = [...passedStrokes.current, points];
      setStrokeIndex(prev => prev + 1);
    } else {
      drawRef.current?.clear();
      passedStrokes.current = [];
      setStrokeIndex(0);
    }
  };

  const handleRestart = () => {
    drawRef.current?.clear();
    passedStrokes.current = [];
    setStrokeIndex(0);
    setResult(null);
  };

  if (loading) {
    return (
      <View className="stroke-practice-page stroke-practice-page--center">
        <Text className="stroke-loading">加载中…</Text>
      </View>
    );
  }

  if (isComplete) {
    return (
      <View className="stroke-practice-page stroke-practice-page--center">
        <Text className="stroke-complete-char">{char}</Text>
        <Text className="stroke-complete-text">完成 🎉</Text>
        <View className="btn-clear" onClick={handleRestart}>
          重新练习
        </View>
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
      </View>

      <View className="canvas-container">
        <TextSample config={canvasConfig} strokes={strokes!} />
        <Draw ref={drawRef} config={canvasConfig} onStrokeEnd={handleStrokeEnd} />
      </View>

      <View className="controls">
        <View className="btn-clear" onClick={handleRestart}>
          重新开始
        </View>
      </View>

      {result && (
        <View className={`match-result ${result.passed ? "passed" : "failed"}`}>
          <Text>{result.passed ? "✓ 通过" : "✗ 再试一次"}</Text>
          <Text className="score">得分 {(result.score * 100).toFixed(0)}</Text>
        </View>
      )}
    </View>
  );
}
