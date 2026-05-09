import { describe, it, expect } from "vitest";
import { matchStroke, StrokeRef } from "./strokeMatcher";

const CANVAS = 320;

function makeRef(points: [number, number][]): StrokeRef {
  const tip = points[Math.min(4, points.length - 1)];
  return {
    points,
    startX: points[0][0],
    startY: points[0][1],
    startAngle: Math.atan2(tip[1] - points[0][1], tip[0] - points[0][0]),
  };
}

function scale(points: [number, number][], size = CANVAS): [number, number][] {
  return points.map(([x, y]) => [x * size, y * size]);
}

function hline(n = 10, y = 0.5): [number, number][] {
  return Array.from({ length: n }, (_, i) => [i / (n - 1), y]);
}

describe("matchStroke", () => {
  it("点数不足 3 时直接失败", () => {
    const ref = makeRef(hline());
    expect(
      matchStroke(
        [
          [0, 0],
          [1, 1],
        ],
        ref,
        CANVAS
      ).passed
    ).toBe(false);
  });

  it("落笔点偏离参考起点超过 20% 时失败", () => {
    const ref = makeRef(hline());
    // 参考起点在 (0, 0.5)，用户从 (0.5, 0.5) 开始 → 偏离 50%
    const userPoints = scale([
      [0.5, 0.5],
      [0.6, 0.5],
      [0.7, 0.5],
      [0.8, 0.5],
      [1.0, 0.5],
    ]);
    expect(matchStroke(userPoints, ref, CANVAS).passed).toBe(false);
  });

  it("起始方向偏差超过 72° 时失败", () => {
    // 参考是水平线（→），用户从同起点出发往下画（↓）
    const ref = makeRef(hline());
    const userPoints = scale([
      [0, 0.5],
      [0, 0.6],
      [0, 0.7],
      [0, 0.8],
      [0, 1.0],
    ]);
    expect(matchStroke(userPoints, ref, CANVAS).passed).toBe(false);
  });

  it("完全相同的笔迹通过匹配，得分接近 1", () => {
    const pts = hline();
    const ref = makeRef(pts);
    const userPoints = scale(pts);
    const result = matchStroke(userPoints, ref, CANVAS);
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThan(0.9);
  });

  it("轻微偏差（速度不均匀）仍然通过", () => {
    const ref = makeRef(hline(20));
    // 用户只采了 8 个点，但路径相同
    const userPoints = scale(hline(8));
    const result = matchStroke(userPoints, ref, CANVAS);
    expect(result.passed).toBe(true);
  });

  it("完全反向的笔迹失败", () => {
    const ref = makeRef(hline());
    const reversed = hline().reverse();
    const userPoints = scale(reversed);
    expect(matchStroke(userPoints, ref, CANVAS).passed).toBe(false);
  });

  it("得分归一化在 [0, 1] 范围内", () => {
    const ref = makeRef(hline());
    const userPoints = scale([
      [0.05, 0.52],
      [0.2, 0.55],
      [0.4, 0.48],
      [0.6, 0.51],
      [0.9, 0.5],
    ]);
    const { score } = matchStroke(userPoints, ref, CANVAS);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});
