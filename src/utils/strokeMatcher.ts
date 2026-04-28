/**
 * 笔画匹配模块 — DTW（动态时间规整）算法
 *
 * 算法流程：
 *   1. 方向预检：快速排除起始方向偏差 >60° 的明显错误
 *   2. 归一化：将用户笔迹缩放到与参考笔画相同的 [0,1]² 空间
 *   3. DTW：O(n·m) DP，计算两条路径的最优对齐代价
 *   4. 评分：代价归一化到 [0,1]，≥ PASS_THRESHOLD 视为通过
 */

export interface StrokeRef {
  points: [number, number][];
  startAngle: number;
  startX: number;
  startY: number;
}

export interface MatchResult {
  passed: boolean;
  score: number;
}

const PASS_THRESHOLD = 0.62;
const ANGLE_TOLERANCE = Math.PI / 2.5; // ±72°，包容写法差异
const START_TOLERANCE = 0.2; // 起点允许偏差 20%（320px 画布对应 64px）

// ── 内部工具 ────────────────────────────────────────────────

function dist(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/** 等距重采样为 n 个点（保持轨迹形状，消除采样速率差异） */
function resample(points: [number, number][], n: number): [number, number][] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array(n).fill(points[0]);

  // 计算累计弧长
  const cumLen: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    cumLen.push(cumLen[i - 1] + dist(points[i - 1], points[i]));
  }
  const total = cumLen[cumLen.length - 1];
  if (total === 0) return Array(n).fill(points[0]);

  const result: [number, number][] = [];
  let idx = 0;
  for (let k = 0; k < n; k++) {
    const target = (k / (n - 1)) * total;
    while (idx < cumLen.length - 2 && cumLen[idx + 1] < target) idx++;
    const seg = cumLen[idx + 1] - cumLen[idx];
    const t = seg === 0 ? 0 : (target - cumLen[idx]) / seg;
    const p = points[idx];
    const q = points[Math.min(idx + 1, points.length - 1)];
    result.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
  }
  return result;
}

/** 将点列表归一化到 [0,1]²，保持宽高比 */
function normalize(points: [number, number][]): [number, number][] {
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const range = Math.max(maxX - minX, maxY - minY);
  if (range === 0) return points.map(() => [0.5, 0.5]);
  return points.map(([x, y]) => [(x - minX) / range, (y - minY) / range]);
}

/** DTW 距离（O(n·m) DP） */
function dtwDistance(p: [number, number][], q: [number, number][]): number {
  const n = p.length;
  const m = q.length;

  // 用两行滚动数组降低内存（不需要回溯路径）
  let prev = new Float64Array(m).fill(Infinity);
  let curr = new Float64Array(m).fill(Infinity);

  prev[0] = dist(p[0], q[0]);
  for (let j = 1; j < m; j++) {
    prev[j] = prev[j - 1] + dist(p[0], q[j]);
  }

  for (let i = 1; i < n; i++) {
    curr[0] = prev[0] + dist(p[i], q[0]);
    for (let j = 1; j < m; j++) {
      curr[j] = dist(p[i], q[j]) + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }

  return prev[m - 1];
}

/** 计算用户笔迹起始方向角（取前几个点的切线） */
function calcAngle(points: [number, number][]): number {
  const n = Math.min(5, points.length);
  if (n < 2) return 0;
  return Math.atan2(points[n - 1][1] - points[0][1], points[n - 1][0] - points[0][0]);
}

/** 角度差（归一化到 [-π, π]） */
function angleDiff(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return Math.abs(d);
}

// ── 对外接口 ────────────────────────────────────────────────

/**
 * 将用户在 canvas 上画的点（像素坐标）与参考笔画做匹配。
 * @param userPoints  用户笔迹点序列，单位为 canvas 像素
 * @param ref         参考笔画（来自 stroke-data JSON，已归一化）
 * @param canvasSize  canvas 边长（像素）
 */
export function matchStroke(
  userPoints: [number, number][],
  ref: StrokeRef,
  canvasSize: number
): MatchResult {
  if (userPoints.length < 3) return { passed: false, score: 0 };

  // 将用户点转换到 [0,1] 空间（按 canvasSize 缩放）
  const userNorm: [number, number][] = userPoints.map(([x, y]) => [x / canvasSize, y / canvasSize]);

  // 起始位置检查：落笔点必须在参考起点附近
  const startDist = dist(userNorm[0], [ref.startX, ref.startY]);
  if (startDist > START_TOLERANCE) {
    return { passed: false, score: 0 };
  }

  // 方向预检
  const userAngle = calcAngle(userNorm);
  if (angleDiff(userAngle, ref.startAngle) > ANGLE_TOLERANCE) {
    return { passed: false, score: 0 };
  }

  // 归一化 + 重采样到相同点数（40 点）
  const N = 40;
  const userResampled = resample(normalize(userNorm), N);
  const refResampled = resample(normalize(ref.points as [number, number][]), N);

  // DTW
  const rawDist = dtwDistance(userResampled, refResampled);

  // 归一化到 [0,1]：最大可能距离约为 N * √2（对角线×点数）
  const maxDist = N * Math.SQRT2;
  const score = Math.max(0, 1 - rawDist / maxDist);

  return { passed: score >= PASS_THRESHOLD, score: +score.toFixed(3) };
}
