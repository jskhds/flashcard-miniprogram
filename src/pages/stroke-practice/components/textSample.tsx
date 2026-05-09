import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Taro from "@tarojs/taro";
import { Canvas } from "@tarojs/components";
import { CanvasConfig } from "../types";
import { StrokeRef } from "../../../utils/strokeMatcher";
import "./textSample.scss";

interface TextSampleProps {
  config: CanvasConfig;
  strokes: StrokeRef[];
  mode: "guided" | "blind";
  passedCount: number;
  failCount: number;
}

export interface TextSampleHandle {
  markAllSolid: () => void;
}

const TextSample = forwardRef<TextSampleHandle, TextSampleProps>(function TextSample(
  { config, strokes, mode, passedCount, failCount },
  ref
) {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    Taro.nextTick(() => {
      Taro.createSelectorQuery()
        .select("#reference-canvas")
        .node()
        .exec(res => {
          if (!res?.[0]) return;
          const canvas = res[0].node;
          const ctx = canvas.getContext("2d");
          canvas.width = config.width * config.scale;
          canvas.height = config.height * config.scale;
          ctx.scale(config.scale, config.scale);
          ctxRef.current = ctx;
          redraw(ctx, mode, passedCount, failCount);
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, config.width, config.height);
    redraw(ctx, mode, passedCount, failCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, passedCount, failCount]);

  useImperativeHandle(ref, () => ({
    markAllSolid: () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.clearRect(0, 0, config.width, config.height);
      drawGrid(ctx, config.width);
      for (let i = 0; i < strokes.length; i++) {
        drawPassedStroke(ctx, strokes[i], config.width);
      }
    },
  }));

  const drawGrid = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.save();
    ctx.strokeStyle = "#F0E4D4";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    const mid = size / 2;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(size, mid);
    ctx.moveTo(mid, 0);
    ctx.lineTo(mid, size);
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size);
    ctx.moveTo(size, 0);
    ctx.lineTo(0, size);
    ctx.stroke();
    ctx.restore();
  };

  const redraw = (
    ctx: CanvasRenderingContext2D,
    currentMode: "guided" | "blind",
    passed: number,
    fails: number
  ) => {
    drawGrid(ctx, config.width);
    for (let i = 0; i < passed; i++) {
      drawPassedStroke(ctx, strokes[i], config.width);
    }
    if (fails >= 4 && passed < strokes.length) {
      if (currentMode === "guided") {
        for (let i = passed + 1; i < strokes.length; i++) {
          drawGuidedStroke(ctx, strokes[i], i + 1, config.width);
        }
      }
      drawRevealedStroke(ctx, strokes[passed], config.width);
    } else {
      if (currentMode === "guided") {
        for (let i = passed; i < strokes.length; i++) {
          drawGuidedStroke(ctx, strokes[i], i + 1, config.width);
        }
      }
      if (fails >= 2 && passed < strokes.length) {
        drawHintArrow(ctx, strokes[passed], config.width);
      }
    }
  };

  const drawPassedStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: StrokeRef,
    canvasWidth: number
  ) => {
    const { points } = stroke;
    if (points.length === 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(points[0][0] * canvasWidth, points[0][1] * canvasWidth);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0] * canvasWidth, points[i][1] * canvasWidth);
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawGuidedStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: StrokeRef,
    num: number,
    canvasWidth: number
  ) => {
    const { points, startX, startY } = stroke;
    if (points.length === 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(points[0][0] * canvasWidth, points[0][1] * canvasWidth);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0] * canvasWidth, points[i][1] * canvasWidth);
    }
    ctx.stroke();
    ctx.restore();
    drawStartMarker(ctx, startX * canvasWidth, startY * canvasWidth, num);
  };

  const drawStartMarker = (ctx: CanvasRenderingContext2D, x: number, y: number, num: number) => {
    ctx.save();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(num.toString(), x, y);
    ctx.restore();
  };

  const drawRevealedStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: StrokeRef,
    canvasWidth: number
  ) => {
    const { points } = stroke;
    if (points.length === 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#f5a623";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(points[0][0] * canvasWidth, points[0][1] * canvasWidth);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0] * canvasWidth, points[i][1] * canvasWidth);
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawHintArrow = (ctx: CanvasRenderingContext2D, stroke: StrokeRef, canvasWidth: number) => {
    const { points } = stroke;
    if (points.length < 2) return;

    const count = Math.max(2, Math.ceil(points.length * 0.35));
    const pts = (points.slice(0, count) as [number, number][]).map(([x, y]): [number, number] => [
      x * canvasWidth,
      y * canvasWidth,
    ]);

    ctx.save();
    ctx.strokeStyle = "#f5a623";
    ctx.fillStyle = "#f5a623";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.stroke();

    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const angle = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
    const arrowSize = 10;

    ctx.beginPath();
    ctx.moveTo(last[0], last[1]);
    ctx.lineTo(
      last[0] - arrowSize * Math.cos(angle - Math.PI / 6),
      last[1] - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      last[0] - arrowSize * Math.cos(angle + Math.PI / 6),
      last[1] - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  return (
    <Canvas
      id="reference-canvas"
      type="2d"
      className="reference-canvas"
      style={`width: ${config.width}px; height: ${config.height}px;`}
    />
  );
});

export default TextSample;
