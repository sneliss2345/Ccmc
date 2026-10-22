import { Audio } from "@remotion/media";
import { useMemo } from "react";
import {
  Easing,
  Interactive,
  interpolate,
  interpolateColors,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Tex } from "../components/Tex";
import criticalLine from "../data/critical-line.json";
import zeros from "../data/zeros.json";
import "../fonts";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// The walk: t climbs 0 → 50 between 1.0 s and 16.0 s, easing in, so the first zeros are
// passed while walk-2 says «снова и снова возвращаются к нулю».
const T_MAX = 50;
const T_STEP = 0.025;
const WALK_START_S = 1;
const WALK_END_S = 16;
const ZEROS = zeros.filter((z) => z < T_MAX);

const walkT = (frame: number, fps: number) =>
  interpolate(frame, [WALK_START_S * fps, WALK_END_S * fps], [0, T_MAX], {
    ...CLAMP,
    easing: Easing.in(Easing.quad),
  });

// Left card: the ruler for the critical line Re s = ½, t = 0 at the bottom, t = 50 at the top.
const RULER_X = 330;
const RULER_Y0 = 920;
const RULER_Y50 = 400;
const rulerY = (t: number) => RULER_Y0 - (t / T_MAX) * (RULER_Y0 - RULER_Y50);
const RULER_TICKS = [0, 10, 20, 30, 40, 50];

// Right card: the plane of values w = ζ(½ + it), isotropic, scaled from the data so that
// the whole curve on t ∈ [0, 50] fits the card with a margin.
const PLANE = { left: 700, top: 220, width: 1080, height: 760 } as const;
const RE_MIN = Math.min(...criticalLine.re);
const RE_MAX = Math.max(...criticalLine.re);
const IM_MIN = Math.min(...criticalLine.im);
const IM_MAX = Math.max(...criticalLine.im);
const PLANE_MARGIN = 46;
const SCALE = Math.min(
  (PLANE.width - 2 * PLANE_MARGIN) / (RE_MAX - RE_MIN),
  (PLANE.height - 2 * PLANE_MARGIN) / (IM_MAX - IM_MIN),
);
const OX = PLANE.left + PLANE.width / 2 - ((RE_MIN + RE_MAX) / 2) * SCALE;
const OY = PLANE.top + PLANE.height / 2 + ((IM_MIN + IM_MAX) / 2) * SCALE;
const wx = (re: number) => OX + re * SCALE;
const wy = (im: number) => OY - im * SCALE;
const GRID_RE = [-3, -2, -1, 1, 2, 3, 4, 5];
const GRID_IM = [-2, -1, 1, 2];

// Pre-projected curve points, so each frame only joins a prefix.
const CURVE_POINTS = criticalLine.re.map(
  (re, i) => `${wx(re).toFixed(1)} ${wy(criticalLine.im[i]).toFixed(1)}`,
);

const valueAt = (t: number) => {
  const pos = Math.min(t / T_STEP, criticalLine.t.length - 1);
  const i = Math.min(Math.floor(pos), criticalLine.t.length - 2);
  const f = pos - i;
  return {
    re: criticalLine.re[i] * (1 - f) + criticalLine.re[i + 1] * f,
    im: criticalLine.im[i] * (1 - f) + criticalLine.im[i + 1] * f,
  };
};

const curvePath = (t: number) => {
  const n = Math.min(Math.floor(t / T_STEP), CURVE_POINTS.length - 1);
  const end = valueAt(t);
  return `M ${CURVE_POINTS.slice(0, n + 1).join(" L ")} L ${wx(end.re).toFixed(1)} ${wy(end.im).toFixed(1)}`;
};

const formatT = (t: number) => t.toFixed(2).replace(".", ",");

const WalkInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = walkT(frame, fps);
  const value = valueAt(t);

  // First frame at which the walk reaches each zero (drives flashes and the counter).
  const crossFrames = useMemo(
    () =>
      ZEROS.map((z) => {
        let f = Math.floor(WALK_START_S * fps);
        while (walkT(f, fps) < z) f++;
        return f;
      }),
    [fps],
  );
  const zerosPassed = crossFrames.filter((f) => frame >= f).length;
  const counterPulse = Math.max(
    1,
    ...crossFrames.map((f) =>
      interpolate(frame, [f - 1, f, f + 0.4 * fps], [1, 1.3, 1], CLAMP),
    ),
  );

  return (
    <>
      <Track name="Captions">
        <Interactive.Div
          name="Caption walk-1"
          from={0.5 * fps}
          durationInFrames={10.2 * fps}
          style={{
            position: "absolute",
            left: 140,
            top: 96,
            height: 96,
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 56,
            color: "#ffffff",
            opacity: interpolate(
              frame,
              [0.5 * fps, 1 * fps, 10.3 * fps, 10.7 * fps],
              [0, 1, 1, 0],
              CLAMP,
            ),
            translate: interpolate(
              frame,
              [0.5 * fps, 1.2 * fps],
              ["0px 24px", "0px 0px"],
              { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
            ),
          }}
        >
          <Tex
            name="Caption formula"
            tex={String.raw`\zeta(\tfrac12 + it)`}
            style={{ fontSize: 68, color: "#5ac8fa" }}
          />
          <span>— куда попадает значение</span>
        </Interactive.Div>
        <Interactive.Div
          name="Caption walk-2"
          from={10.7 * fps}
          style={{
            position: "absolute",
            left: 140,
            top: 96,
            height: 96,
            display: "flex",
            alignItems: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 56,
            color: "#ffffff",
            opacity: interpolate(
              frame,
              [10.7 * fps, 11.1 * fps],
              [0, 1],
              CLAMP,
            ),
            translate: interpolate(
              frame,
              [10.7 * fps, 11.4 * fps],
              ["0px 24px", "0px 0px"],
              { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
            ),
          }}
        >
          каждый проход через 0 —&nbsp;
          <span style={{ color: "#5ac8fa" }}>нуль ζ</span>
        </Interactive.Div>
      </Track>

      {/* Left: the critical line as a ruler */}
      <Interactive.Div
        name="Ruler card"
        from={0.5 * fps}
        style={{
          position: "absolute",
          left: 140,
          top: 220,
          width: 520,
          height: 760,
          boxSizing: "border-box",
          backgroundColor: "#151c33",
          border: "3px solid #26304f",
          borderRadius: 32,
          opacity: interpolate(frame, [0.5 * fps, 1 * fps], [0, 1], CLAMP),
        }}
      />
      <Tex
        name="Ruler label"
        from={0.5 * fps}
        tex={String.raw`\operatorname{Re} s = \tfrac12`}
        style={{
          position: "absolute",
          left: 190,
          top: 250,
          fontSize: 64,
          color: "#f5c542",
          opacity: interpolate(frame, [0.7 * fps, 1.2 * fps], [0, 1], CLAMP),
        }}
      />
      <Interactive.Svg
        name="Ruler"
        from={0.5 * fps}
        viewBox="0 0 1920 1080"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
        }}
      >
        <defs>
          <linearGradient id="walk-ruler-tail" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#f5c542" stopOpacity={1} />
            <stop offset="1" stopColor="#f5c542" stopOpacity={0} />
          </linearGradient>
        </defs>
        {RULER_TICKS.map((tick) => (
          <line
            key={tick}
            x1={RULER_X - 32}
            x2={RULER_X - 3}
            y1={rulerY(tick)}
            y2={rulerY(tick)}
            style={{
              stroke: "#6b759a",
              strokeWidth: 3,
              opacity: interpolate(
                frame,
                [(0.8 + tick / 100) * fps, (1.1 + tick / 100) * fps],
                [0, 1],
                CLAMP,
              ),
            }}
          />
        ))}
        <Interactive.Line
          name="Critical line"
          x1={RULER_X}
          x2={RULER_X}
          y1={RULER_Y0}
          y2={RULER_Y50}
          style={{
            stroke: "#f5c542",
            strokeWidth: 6,
            strokeLinecap: "round",
            strokeDasharray: RULER_Y0 - RULER_Y50,
            strokeDashoffset: interpolate(
              frame,
              [0.6 * fps, 1.4 * fps],
              [RULER_Y0 - RULER_Y50, 0],
              { ...CLAMP, easing: Easing.inOut(Easing.cubic) },
            ),
          }}
        />
        <Interactive.Rect
          name="Critical line continues"
          x={RULER_X - 3}
          y={RULER_Y50 - 56}
          width={6}
          height={56}
          style={{
            fill: "url(#walk-ruler-tail)",
            opacity: interpolate(frame, [1.3 * fps, 1.6 * fps], [0, 1], CLAMP),
          }}
        />
        {ZEROS.map((z, i) => (
          <rect
            key={z}
            x={RULER_X + 3}
            y={rulerY(z) - 3.5}
            width={32}
            height={7}
            rx={3.5}
            style={{
              fill: "#5ac8fa",
              filter:
                frame >= crossFrames[i]
                  ? "drop-shadow(0 0 8px rgba(90, 200, 250, 0.9))"
                  : undefined,
              opacity:
                interpolate(
                  frame,
                  [(1.2 + i * 0.05) * fps, (1.5 + i * 0.05) * fps],
                  [0, 1],
                  CLAMP,
                ) *
                interpolate(
                  frame,
                  [crossFrames[i], crossFrames[i] + 4],
                  [0.45, 1],
                  CLAMP,
                ),
            }}
          />
        ))}
        {ZEROS.map((z, i) => (
          <circle
            key={z}
            cx={RULER_X}
            cy={rulerY(z)}
            r={interpolate(
              frame,
              [crossFrames[i], crossFrames[i] + 0.6 * fps],
              [8, 42],
              CLAMP,
            )}
            style={{
              fill: "none",
              stroke: "#5ac8fa",
              strokeWidth: 3,
              opacity: interpolate(
                frame,
                [
                  crossFrames[i] - 1,
                  crossFrames[i],
                  crossFrames[i] + 0.6 * fps,
                ],
                [0, 0.9, 0],
                CLAMP,
              ),
            }}
          />
        ))}
        <Interactive.Circle
          name="Walking point"
          cx={RULER_X}
          cy={rulerY(t)}
          r={15}
          style={{
            fill: "#f5c542",
            stroke: "#0b1020",
            strokeWidth: 4,
            filter: "drop-shadow(0 0 14px rgba(245, 197, 66, 0.8))",
            opacity: interpolate(frame, [0.9 * fps, 1.1 * fps], [0, 1], CLAMP),
          }}
        />
      </Interactive.Svg>
      {RULER_TICKS.map((tick) => (
        <div
          key={tick}
          style={{
            position: "absolute",
            left: RULER_X - 160,
            top: rulerY(tick) - 20,
            width: 112,
            height: 40,
            lineHeight: "40px",
            textAlign: "right",
            fontFamily: "JetBrains Mono",
            fontWeight: 500,
            fontSize: 32,
            color: "#9aa4c7",
            opacity: interpolate(
              frame,
              [(0.8 + tick / 100) * fps, (1.1 + tick / 100) * fps],
              [0, 1],
              CLAMP,
            ),
          }}
        >
          {tick}
        </div>
      ))}
      <Interactive.Div
        name="t counter"
        from={0.9 * fps}
        style={{
          position: "absolute",
          left: RULER_X + 52,
          top: rulerY(t) - 36,
          height: 72,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          borderRadius: 20,
          border: "3px solid #f5c542",
          backgroundColor: "#0b1020",
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 44,
          color: "#ffffff",
          whiteSpace: "pre",
          opacity: interpolate(frame, [0.9 * fps, 1.2 * fps], [0, 1], CLAMP),
        }}
      >
        <span style={{ color: "#f5c542" }}>t</span> = {formatT(t)}
      </Interactive.Div>

      {/* Right: the plane of values ζ(½ + it) */}
      <Interactive.Div
        name="Value plane card"
        from={0.8 * fps}
        style={{
          position: "absolute",
          left: 700,
          top: 220,
          width: 1080,
          height: 760,
          boxSizing: "border-box",
          backgroundColor: "#151c33",
          borderWidth: 3,
          borderStyle: "solid",
          borderColor: interpolateColors(
            frame,
            [2.6 * fps, 2.9 * fps, 3.8 * fps],
            ["#26304f", "#5ac8fa", "#26304f"],
          ),
          borderRadius: 32,
          opacity: interpolate(frame, [0.8 * fps, 1.3 * fps], [0, 1], CLAMP),
        }}
      />
      <Interactive.Svg
        name="Value plane"
        from={0.8 * fps}
        viewBox="0 0 1920 1080"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          opacity: interpolate(frame, [0.8 * fps, 1.3 * fps], [0, 1], CLAMP),
        }}
      >
        <defs>
          <clipPath id="walk-plane-clip">
            <rect
              x={PLANE.left + 3}
              y={PLANE.top + 3}
              width={PLANE.width - 6}
              height={PLANE.height - 6}
              rx={29}
            />
          </clipPath>
        </defs>
        <g clipPath="url(#walk-plane-clip)">
          {GRID_RE.map((re) => (
            <line
              key={`re${re}`}
              x1={wx(re)}
              x2={wx(re)}
              y1={PLANE.top}
              y2={PLANE.top + PLANE.height}
              style={{ stroke: "#1d2542", strokeWidth: 2 }}
            />
          ))}
          {GRID_IM.map((im) => (
            <line
              key={`im${im}`}
              x1={PLANE.left}
              x2={PLANE.left + PLANE.width}
              y1={wy(im)}
              y2={wy(im)}
              style={{ stroke: "#1d2542", strokeWidth: 2 }}
            />
          ))}
          <Interactive.Line
            name="Real axis"
            x1={PLANE.left}
            x2={PLANE.left + PLANE.width}
            y1={OY}
            y2={OY}
            style={{
              stroke: "#6b759a",
              strokeWidth: 3,
              strokeDasharray: PLANE.width,
              strokeDashoffset: interpolate(
                frame,
                [0.9 * fps, 1.6 * fps],
                [PLANE.width, 0],
                { ...CLAMP, easing: Easing.inOut(Easing.cubic) },
              ),
            }}
          />
          <Interactive.Line
            name="Imaginary axis"
            x1={OX}
            x2={OX}
            y1={PLANE.top + PLANE.height}
            y2={PLANE.top}
            style={{
              stroke: "#6b759a",
              strokeWidth: 3,
              strokeDasharray: PLANE.height,
              strokeDashoffset: interpolate(
                frame,
                [1 * fps, 1.7 * fps],
                [PLANE.height, 0],
                { ...CLAMP, easing: Easing.inOut(Easing.cubic) },
              ),
            }}
          />
          {crossFrames.map((f) => (
            <circle
              key={f}
              cx={OX}
              cy={OY}
              r={interpolate(frame, [f, f + 0.7 * fps], [10, 90], {
                ...CLAMP,
                easing: Easing.out(Easing.cubic),
              })}
              style={{
                fill: "none",
                stroke: "#5ac8fa",
                strokeWidth: 5,
                opacity: interpolate(
                  frame,
                  [f - 1, f, f + 0.7 * fps],
                  [0, 1, 0],
                  CLAMP,
                ),
              }}
            />
          ))}
          <Interactive.Path
            name="Value curve glow"
            d={curvePath(t)}
            style={{
              fill: "none",
              stroke: "#5ac8fa",
              strokeWidth: 14,
              strokeLinejoin: "round",
              strokeLinecap: "round",
              opacity: 0.12,
            }}
          />
          <Interactive.Path
            name="Value curve"
            d={curvePath(t)}
            style={{
              fill: "none",
              stroke: "#5ac8fa",
              strokeWidth: 4,
              strokeLinejoin: "round",
              strokeLinecap: "round",
              opacity: 0.95,
            }}
          />
          <Interactive.Circle
            name="Origin"
            cx={OX}
            cy={OY}
            r={9}
            style={{
              fill: "#ffffff",
              stroke: "#0b1020",
              strokeWidth: 3,
              opacity: interpolate(
                frame,
                [1.2 * fps, 1.5 * fps],
                [0, 1],
                CLAMP,
              ),
            }}
          />
          <Interactive.Circle
            name="Value pulse"
            cx={wx(value.re)}
            cy={wy(value.im)}
            r={interpolate(frame, [4.3 * fps, 5.2 * fps], [16, 70], {
              ...CLAMP,
              easing: Easing.out(Easing.cubic),
            })}
            style={{
              fill: "none",
              stroke: "#5ac8fa",
              strokeWidth: 4,
              opacity: interpolate(
                frame,
                [4.3 * fps, 4.4 * fps, 5.2 * fps],
                [0, 1, 0],
                CLAMP,
              ),
            }}
          />
          <Interactive.Circle
            name="Current value"
            cx={wx(value.re)}
            cy={wy(value.im)}
            r={14}
            style={{
              fill: "#5ac8fa",
              stroke: "#0b1020",
              strokeWidth: 4,
              filter: "drop-shadow(0 0 14px rgba(90, 200, 250, 0.9))",
            }}
          />
        </g>
      </Interactive.Svg>
      <Interactive.Div
        name="Origin label"
        from={1.2 * fps}
        style={{
          position: "absolute",
          left: OX - 68,
          top: OY - 42,
          height: 30,
          lineHeight: "30px",
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 36,
          color: "#ffffff",
          opacity: interpolate(frame, [1.2 * fps, 1.5 * fps], [0, 1], CLAMP),
        }}
      >
        0
      </Interactive.Div>
      <Interactive.Div
        name="Zeros counter"
        from={7.3 * fps}
        style={{
          position: "absolute",
          left: 740,
          top: 252,
          height: 76,
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 48,
          color: "#9aa4c7",
          opacity: interpolate(frame, [7.3 * fps, 7.8 * fps], [0, 1], CLAMP),
          translate: interpolate(
            frame,
            [7.3 * fps, 8 * fps],
            ["0px 20px", "0px 0px"],
            { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
          ),
        }}
      >
        нулей:
        <span
          style={{
            display: "inline-block",
            minWidth: 70,
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 60,
            color: "#5ac8fa",
            scale: counterPulse,
            transformOrigin: "30% 55%",
          }}
        >
          {zerosPassed}
        </span>
      </Interactive.Div>

      <Track name="Voiceover">
        <Audio
          name="walk-1"
          src={staticFile("voiceover/walk-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="walk-2"
          src={staticFile("voiceover/walk-2.mp3")}
          from={7.3 * fps}
        />
      </Track>
    </>
  );
};

export const Walk = Interactive.create({
  Component: WalkInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
