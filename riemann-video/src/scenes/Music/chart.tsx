import { Easing, interpolate } from "remotion";
import explicit from "../../data/explicit-formula.json";

// Plot box of the π(x) chart: x 0–100 left→right, y 0–26 bottom→top.
export const PLOT = {
  left: 330,
  right: 1750,
  top: 110,
  bottom: 680,
};

const X_MAX = 100;
const Y_MAX = 26;

export const xToPx = (x: number) =>
  PLOT.left + (x / X_MAX) * (PLOT.right - PLOT.left);
export const yToPx = (y: number) =>
  PLOT.bottom - (y / Y_MAX) * (PLOT.bottom - PLOT.top);

const X_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const Y_TICKS = [0, 5, 10, 15, 20, 25];

// Riemann's formula is shown from x = 2: below that the smooth part has a
// spurious dip towards x = 1 that says nothing about the primes.
const FIRST = explicit.x.findIndex((x) => x >= 2 - 1e-9);

type ApproxKey = "0" | "1" | "2" | "3" | "5" | "10" | "20" | "50" | "100";
const approx: Record<ApproxKey, number[]> = explicit.approx;

// π(x) as a staircase: horizontal runs and a vertical riser at every prime.
export const STAIR_D = (() => {
  const { x, pi } = explicit;
  let d = `M ${xToPx(0)} ${yToPx(0)}`;
  for (let i = 1; i < x.length; i++) {
    if (pi[i] !== pi[i - 1]) {
      d += ` H ${xToPx(x[i]).toFixed(1)} V ${yToPx(pi[i]).toFixed(1)}`;
    }
  }
  return `${d} H ${xToPx(X_MAX)}`;
})();

// Wave strip geometry: the same x mapping as the chart, own vertical scale.
export const STRIP = { width: PLOT.right - PLOT.left, height: 64 };
const STRIP_PX_PER_UNIT = 80;

// wave_k = approx[k-1] − approx[k]: what the k-th zero pair adds to the curve.
const wavePath = (prev: ApproxKey, next: ApproxKey) => {
  const a = approx[prev];
  const b = approx[next];
  const pts: string[] = [];
  for (let i = FIRST; i < explicit.x.length; i++) {
    const w = Math.max(-0.39, Math.min(0.39, a[i] - b[i]));
    const px = xToPx(explicit.x[i]) - PLOT.left;
    const py = STRIP.height / 2 - w * STRIP_PX_PER_UNIT;
    pts.push(`${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return `M ${pts.join(" L ")}`;
};

export const WAVE_PATHS = [
  wavePath("0", "1"),
  wavePath("1", "2"),
  wavePath("2", "3"),
];

export type CurveMorph = {
  readonly from: ApproxKey;
  readonly to: ApproxKey;
  readonly range: [number, number];
};

// The cyan curve of Riemann's formula, blended element-wise between the
// approximations with N zero pairs. Morphs are applied in order; the last one
// that has started decides the shape.
export const curvePath = (
  frame: number,
  start: ApproxKey,
  morphs: CurveMorph[],
) => {
  let a = approx[start];
  let b = approx[start];
  let p = 0;
  for (const m of morphs) {
    if (frame >= m.range[0]) {
      a = approx[m.from];
      b = approx[m.to];
      p = interpolate(frame, m.range, [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      });
    }
  }
  const pts: string[] = [];
  for (let i = FIRST; i < explicit.x.length; i++) {
    const y = a[i] + (b[i] - a[i]) * p;
    pts.push(`${xToPx(explicit.x[i]).toFixed(1)} ${yToPx(y).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")}`;
};

// Grid lines, axes and ticks of the chart. One template, no animation of its own.
export const ChartLines = () => {
  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {X_TICKS.slice(1).map((x) => (
        <line
          key={`gx${x}`}
          x1={xToPx(x)}
          x2={xToPx(x)}
          y1={PLOT.top}
          y2={PLOT.bottom}
          stroke="#1d2542"
          strokeWidth={2}
        />
      ))}
      {Y_TICKS.slice(1).map((y) => (
        <line
          key={`gy${y}`}
          x1={PLOT.left}
          x2={PLOT.right}
          y1={yToPx(y)}
          y2={yToPx(y)}
          stroke="#1d2542"
          strokeWidth={2}
        />
      ))}
      <line
        x1={PLOT.left}
        x2={PLOT.right}
        y1={PLOT.bottom}
        y2={PLOT.bottom}
        stroke="#6b759a"
        strokeWidth={3}
      />
      <line
        x1={PLOT.left}
        x2={PLOT.left}
        y1={PLOT.top}
        y2={PLOT.bottom}
        stroke="#6b759a"
        strokeWidth={3}
      />
      {X_TICKS.map((x) => (
        <line
          key={`tx${x}`}
          x1={xToPx(x)}
          x2={xToPx(x)}
          y1={PLOT.bottom}
          y2={PLOT.bottom + 10}
          stroke="#6b759a"
          strokeWidth={3}
        />
      ))}
      {Y_TICKS.map((y) => (
        <line
          key={`ty${y}`}
          x1={PLOT.left - 10}
          x2={PLOT.left}
          y1={yToPx(y)}
          y2={yToPx(y)}
          stroke="#6b759a"
          strokeWidth={3}
        />
      ))}
    </svg>
  );
};

// Tick labels of both axes.
export const ChartTickLabels = () => {
  return (
    <>
      {X_TICKS.map((x) => (
        <div
          key={`lx${x}`}
          style={{
            position: "absolute",
            left: xToPx(x) - 50,
            top: PLOT.bottom + 18,
            width: 100,
            textAlign: "center",
            fontFamily: "JetBrains Mono",
            fontWeight: 500,
            fontSize: 30,
            lineHeight: "36px",
            color: "#9aa4c7",
          }}
        >
          {x}
        </div>
      ))}
      {Y_TICKS.map((y) => (
        <div
          key={`ly${y}`}
          style={{
            position: "absolute",
            right: 1920 - PLOT.left + 20,
            top: yToPx(y) - 18,
            fontFamily: "JetBrains Mono",
            fontWeight: 500,
            fontSize: 30,
            lineHeight: "36px",
            color: "#9aa4c7",
          }}
        >
          {y}
        </div>
      ))}
    </>
  );
};
