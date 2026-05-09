import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import Signature from "mini-smooth-signature";
import { CanvasConfig } from "../types";
import "./draw.scss";

export interface DrawHandle {
  clear: () => void;
}

interface DrawProps {
  config: CanvasConfig;
  onStrokeEnd?: (points: [number, number][]) => void;
}

const Draw = forwardRef<DrawHandle, DrawProps>(function Draw({ config, onStrokeEnd }, ref) {
  const signatureRef = useRef<Signature | null>(null);
  const canvasRef = useRef<{ left: number; top: number } | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const currentPoints = useRef<[number, number][]>([]);

  useImperativeHandle(ref, () => ({
    clear: () => signatureRef.current?.clear(),
  }));

  const initSignature = () => {
    Taro.createSelectorQuery()
      .select("#signature")
      .fields({ node: true, size: true })
      .exec(res => {
        const canvas = res[0].node;
        canvas.width = config.width * config.scale;
        canvas.height = config.height * config.scale;
        const ctx = canvas.getContext("2d");
        ctxRef.current = ctx;
        signatureRef.current = new Signature(ctx, {
          width: config.width,
          height: config.height,
          scale: config.scale,
          bgColor: "transparent",
          color: "#000",
        });
      });
  };

  const setCanvasPos = () => {
    Taro.createSelectorQuery()
      .select("#signature")
      .boundingClientRect()
      .exec(res => {
        const rect = res[0] as Taro.NodesRef.BoundingClientRectCallbackResult;
        if (rect) {
          canvasRef.current = { left: rect.left, top: rect.top };
        }
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    Taro.nextTick(() => {
      initSignature();
      setCanvasPos();
    });
  }, []);

  const getCanvasCoords = (pageX: number, pageY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    return { x: pageX, y: pageY };
  };

  const handleTouchStart = (e: { touches: { x: number; y: number }[] }) => {
    const touch = e.touches[0];
    const { x, y } = getCanvasCoords(touch.x, touch.y);
    currentPoints.current = [[x, y]];
    signatureRef.current?.onDrawStart(x, y);
  };

  const handleTouchMove = (e: { touches: { x: number; y: number }[] }) => {
    const touch = e.touches[0];
    const { x, y } = getCanvasCoords(touch.x, touch.y);
    currentPoints.current.push([x, y]);
    signatureRef.current?.onDrawMove(x, y);
  };

  const handleTouchEnd = () => {
    signatureRef.current?.onDrawEnd();
    const points = currentPoints.current;
    currentPoints.current = [];
    if (points.length > 2) {
      onStrokeEnd?.(points);
    }
  };

  return (
    <Canvas
      id="signature"
      type="2d"
      className="draw-canvas"
      style={`width: ${config.width}px; height: ${config.height}px;`}
      disableScroll
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
});

export default Draw;
