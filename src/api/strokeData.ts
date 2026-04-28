import { request } from "./request";
import { StrokeRef } from "../utils/strokeMatcher";

interface RawPoint {
  x: number;
  y: number;
}
interface RawStroke {
  id: number;
  points: RawPoint[];
}
interface RawResponse {
  char: string;
  strokes: RawStroke[];
}

export interface StrokeDataResult {
  char: string;
  strokes: StrokeRef[];
}

const COORD_SIZE = 109; // KanjiVG 坐标系范围

function toStrokeRef(raw: RawStroke): StrokeRef {
  const pts: [number, number][] = raw.points.map(p => [p.x / COORD_SIZE, p.y / COORD_SIZE]);
  const tip = pts[Math.min(4, pts.length - 1)];
  return {
    points: pts,
    startX: pts[0][0],
    startY: pts[0][1],
    startAngle: Math.atan2(tip[1] - pts[0][1], tip[0] - pts[0][0]),
  };
}

export const fetchStrokeData = async (char: string): Promise<StrokeDataResult> => {
  const raw = await request<RawResponse>("GET", `/stroke-data/${encodeURIComponent(char)}`);
  return {
    char: raw.char,
    strokes: raw.strokes.map(toStrokeRef),
  };
};
