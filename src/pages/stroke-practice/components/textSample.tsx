import { useEffect } from "react";
import Taro from "@tarojs/taro";
import { Canvas } from "@tarojs/components";
import { CanvasConfig } from "../types";
import { StrokeRef } from "../../../utils/strokeMatcher";
import "./textSample.scss";

interface TextSampleProps {
  config: CanvasConfig;
  strokes: StrokeRef[];
}

export default function TextSample({ config, strokes }: TextSampleProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          strokes.forEach((stroke, idx) => drawStroke(ctx, stroke, idx + 1, config.width));
        });
    });
  }, []);

  const drawStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: StrokeRef,
    num: number,
    canvasWidth: number
  ) => {
    const { points, startX, startY } = stroke;
    if (points.length === 0) return;

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

  return (
    <Canvas
      id="reference-canvas"
      type="2d"
      className="reference-canvas"
      style={`width: ${config.width}px; height: ${config.height}px;`}
    />
  );
}
