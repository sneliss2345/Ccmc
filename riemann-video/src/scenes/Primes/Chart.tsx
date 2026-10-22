import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { li, primeCount, PRIMES } from "./math";

// Plot box of the π(x) chart (left/centre; the legend sits to the right of it).
export const PLOT = { left: 300, right: 1230, top: 140, bottom: 860 };
const W = PLOT.right - PLOT.left;
const H = PLOT.bottom - PLOT.top;

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Scene times in seconds (word onsets from the voiceover).
const BUILD = [15.4, 18.9]; // staircase drawn 0 → 100, ends on «лестница»
const ZOOM = [19.5, 21.4]; // «Издалека»: x-range 100 → 10 000
const LI_REVEAL = [20.3, 21.3]; // li(x) drawn left → right during the zoom-out

// Tick steps: nested chains, so a coarser tick is always also a finer one.
const X_STEPS = [10, 20, 100, 200, 1000, 2000];
const Y_STEPS = [5, 10, 50, 100, 500, 1000];

const formatTick = (v: number) =>
  v >= 10000
    ? `${Math.floor(v / 1000)}\u00a0${String((v % 1000) + 1000).slice(1)}`
    : String(v);

// Visible tick values with an opacity: a step shows once its spacing ≥ 150 px.
const ticks = (max: number, pxPerUnit: number, steps: number[]) => {
  const out = new Map<number, number>();
  for (const step of steps) {
    const o = interpolate(step * pxPerUnit, [110, 150], [0, 1], clamp);
    if (o <= 0) {
      continue;
    }
    for (let k = 1; k * step <= max * 1.0001; k++) {
      const v = k * step;
      out.set(v, Math.max(out.get(v) ?? 0, o));
    }
  }
  return Array.from(out.entries());
};

export const StaircaseChart = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const xHead = interpolate(
    frame,
    [BUILD[0] * fps, BUILD[1] * fps],
    [0, 100],
    clamp,
  );
  const zoom = interpolate(frame, [ZOOM[0] * fps, ZOOM[1] * fps], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  // Zoom in log space so every moment of the zoom-out looks alike.
  const xMax = 100 * Math.pow(100, zoom);
  const yMax = 1.13 * li(xMax);
  const sx = (v: number) => PLOT.left + (v / xMax) * W;
  const sy = (v: number) => PLOT.bottom - (v / yMax) * H;

  // π(x) staircase: a riser at every prime.
  const xEnd = xHead >= 100 ? xMax : xHead;
  let stair = `M ${sx(0)} ${sy(0)}`;
  let count = 0;
  for (const p of PRIMES) {
    if (p > xEnd) {
      break;
    }
    count++;
    stair += ` H ${sx(p).toFixed(2)} V ${sy(count).toFixed(2)}`;
  }
  stair += ` H ${sx(xEnd).toFixed(2)}`;

  // li(x), sampled at 600 points from x = 2.
  const liReveal = interpolate(
    frame,
    [LI_REVEAL[0] * fps, LI_REVEAL[1] * fps],
    [0, 1],
    { ...clamp, easing: Easing.inOut(Easing.cubic) },
  );
  const liEnd = 2 + (xMax - 2) * liReveal;
  const liPoints: string[] = [];
  for (let i = 0; i < 600; i++) {
    const x = 2 + ((liEnd - 2) * i) / 599;
    liPoints.push(`${sx(x).toFixed(2)} ${sy(li(x)).toFixed(2)}`);
  }
  const liOpacity = interpolate(
    frame,
    [LI_REVEAL[0] * fps, LI_REVEAL[0] * fps + 6],
    [0, 1],
    clamp,
  );

  const headOpacity = interpolate(
    frame,
    [BUILD[0] * fps, BUILD[0] * fps + 6, BUILD[1] * fps, BUILD[1] * fps + 12],
    [0, 1, 1, 0],
    clamp,
  );
  const primeTickOpacity = interpolate(
    frame,
    [ZOOM[0] * fps - 3, ZOOM[0] * fps + 9],
    [1, 0],
    clamp,
  );

  const xTicks = ticks(xMax, W / xMax, X_STEPS);
  const yTicks = ticks(yMax, H / yMax, Y_STEPS).filter(
    ([v]) => v <= yMax * 0.98,
  );

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <defs>
        <clipPath id="primes-plot-clip">
          <rect
            x={PLOT.left - 6}
            y={PLOT.top - 20}
            width={W + 12}
            height={H + 26}
          />
        </clipPath>
      </defs>
      {xTicks.map(([v, o]) => (
        <g key={`x${v}`} opacity={o}>
          <line
            x1={sx(v)}
            x2={sx(v)}
            y1={PLOT.top}
            y2={PLOT.bottom}
            stroke="#1d2542"
            strokeWidth={2}
          />
          <text
            x={sx(v)}
            y={PLOT.bottom + 54}
            textAnchor="middle"
            fontFamily="JetBrains Mono"
            fontWeight={500}
            fontSize={30}
            fill="#9aa4c7"
          >
            {formatTick(v)}
          </text>
        </g>
      ))}
      {yTicks.map(([v, o]) => (
        <g key={`y${v}`} opacity={o}>
          <line
            x1={PLOT.left}
            x2={PLOT.right}
            y1={sy(v)}
            y2={sy(v)}
            stroke="#1d2542"
            strokeWidth={2}
          />
          <text
            x={PLOT.left - 22}
            y={sy(v) + 10}
            textAnchor="end"
            fontFamily="JetBrains Mono"
            fontWeight={500}
            fontSize={30}
            fill="#9aa4c7"
          >
            {formatTick(v)}
          </text>
        </g>
      ))}
      <text
        x={PLOT.left}
        y={PLOT.bottom + 54}
        textAnchor="middle"
        fontFamily="JetBrains Mono"
        fontWeight={500}
        fontSize={30}
        fill="#9aa4c7"
      >
        0
      </text>
      <line
        x1={PLOT.left}
        x2={PLOT.right + 20}
        y1={PLOT.bottom}
        y2={PLOT.bottom}
        stroke="#6b759a"
        strokeWidth={3}
      />
      <line
        x1={PLOT.left}
        x2={PLOT.left}
        y1={PLOT.bottom}
        y2={PLOT.top - 20}
        stroke="#6b759a"
        strokeWidth={3}
      />
      <text
        x={PLOT.right + 26}
        y={PLOT.bottom - 16}
        fontFamily="JetBrains Mono"
        fontWeight={500}
        fontSize={34}
        fill="#9aa4c7"
      >
        x
      </text>
      {PRIMES.slice(0, primeCount(Math.min(xHead, 100))).map((p) => (
        <line
          key={p}
          x1={sx(p)}
          x2={sx(p)}
          y1={PLOT.bottom + 4}
          y2={PLOT.bottom + 18}
          stroke="#f5c542"
          strokeWidth={3}
          opacity={primeTickOpacity}
        />
      ))}
      <g clipPath="url(#primes-plot-clip)">
        <path
          d={stair}
          fill="none"
          stroke="#f5c542"
          strokeWidth={6}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 10px rgba(245, 197, 66, 0.45))" }}
        />
        {liReveal > 0 ? (
          <path
            d={`M ${liPoints.join(" L ")}`}
            fill="none"
            stroke="#5ac8fa"
            strokeWidth={5}
            strokeDasharray="16 12"
            strokeLinecap="round"
            opacity={liOpacity}
          />
        ) : null}
      </g>
      <circle
        cx={sx(xEnd)}
        cy={sy(primeCount(xEnd))}
        r={10}
        fill="#f5c542"
        opacity={headOpacity}
        style={{ filter: "drop-shadow(0 0 12px rgba(245, 197, 66, 0.9))" }}
      />
    </svg>
  );
};
