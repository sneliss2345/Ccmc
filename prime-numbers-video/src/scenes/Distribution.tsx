import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";
import { isPrime, smallestPrimeFactors } from "../primes";

const X_MAX = 1000;
const Y_MAX = 180;
const CHART_WIDTH = 1000;
const CHART_HEIGHT = 560;
const PLOT_LEFT = 90;
const PLOT_BOTTOM = 60;
const PLOT_WIDTH = CHART_WIDTH - PLOT_LEFT - 50;
const PLOT_HEIGHT = CHART_HEIGHT - PLOT_BOTTOM - 20;

const toX = (x: number) => PLOT_LEFT + (x / X_MAX) * PLOT_WIDTH;
const toY = (y: number) => 20 + PLOT_HEIGHT - (y / Y_MAX) * PLOT_HEIGHT;

const SMALLEST_FACTOR = smallestPrimeFactors(X_MAX);

// π(x) as a step function: one step up at every prime.
const PI_PATH = (() => {
  let count = 0;
  let d = `M ${toX(0)} ${toY(0)}`;
  for (let n = 2; n <= X_MAX; n++) {
    if (isPrime(n, SMALLEST_FACTOR)) {
      count++;
      d += ` H ${toX(n).toFixed(2)} V ${toY(count).toFixed(2)}`;
    }
  }
  return d + ` H ${toX(X_MAX)}`;
})();

const ESTIMATE_PATH = (() => {
  const points: string[] = [];
  for (let x = 3; x <= X_MAX; x += 5) {
    points.push(`${toX(x).toFixed(2)} ${toY(x / Math.log(x)).toFixed(2)}`);
  }
  return `M ${points.join(" L ")}`;
})();

const X_TICKS = [0, 250, 500, 750, 1000];
const Y_TICKS = [0, 50, 100, 150];

const Chart = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = interpolate(frame, [1.4 * fps, 5.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const axesIn = interpolate(frame, [0.8 * fps, 1.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      width={CHART_WIDTH}
      height={CHART_HEIGHT}
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
    >
      <defs>
        <clipPath id="reveal">
          <rect
            x={0}
            y={0}
            width={PLOT_LEFT + reveal * PLOT_WIDTH + 4}
            height={CHART_HEIGHT}
          />
        </clipPath>
      </defs>
      <g style={{ opacity: axesIn }}>
        {Y_TICKS.map((y) => (
          <g key={y}>
            <line
              x1={toX(0)}
              x2={toX(X_MAX)}
              y1={toY(y)}
              y2={toY(y)}
              stroke="#1d2542"
              strokeWidth={2}
            />
            <text
              x={PLOT_LEFT - 18}
              y={toY(y)}
              textAnchor="end"
              dominantBaseline="central"
              fontFamily="JetBrains Mono"
              fontSize={28}
              fill="#6b759a"
            >
              {y}
            </text>
          </g>
        ))}
        {X_TICKS.map((x) => (
          <text
            key={x}
            x={toX(x)}
            y={CHART_HEIGHT - 18}
            textAnchor="middle"
            fontFamily="JetBrains Mono"
            fontSize={28}
            fill="#6b759a"
          >
            {x}
          </text>
        ))}
      </g>
      <g clipPath="url(#reveal)">
        <path
          d={ESTIMATE_PATH}
          fill="none"
          stroke="#5ac8fa"
          strokeWidth={5}
          strokeDasharray="14 12"
          strokeLinecap="round"
        />
        <path
          d={PI_PATH}
          fill="none"
          stroke="#f5c542"
          strokeWidth={5}
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

const DistributionInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <Interactive.Div
        name="Kicker"
        style={{
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 44,
          letterSpacing: 10,
          textTransform: "uppercase",
          color: "#f5c542",
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Теорема о распределении простых · 1896
      </Interactive.Div>
      <Interactive.Div
        name="Headline"
        style={{
          fontFamily: "Unbounded",
          fontWeight: 700,
          fontSize: 96,
          lineHeight: 1.15,
          color: "#ffffff",
          marginTop: 24,
          opacity: interpolate(frame, [0.3 * fps, 1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.3 * fps, 1.1 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Чем дальше, тем реже
      </Interactive.Div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 60,
          marginTop: 40,
        }}
      >
        <Chart />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 44,
            width: 580,
          }}
        >
          <Interactive.Div
            name="Legend: π(x)"
            from={1.4 * fps}
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 44,
              lineHeight: 1.3,
              color: "#9aa4c7",
              borderLeft: "8px solid #f5c542",
              paddingLeft: 28,
              opacity: interpolate(frame, [1.4 * fps, 2 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono",
                fontWeight: 700,
                fontSize: 64,
                color: "#f5c542",
              }}
            >
              π(x)
            </span>
            <br />
            сколько простых не больше x
          </Interactive.Div>
          <Interactive.Div
            name="Legend: x / ln x"
            from={2.4 * fps}
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 44,
              lineHeight: 1.3,
              color: "#9aa4c7",
              borderLeft: "8px dashed #5ac8fa",
              paddingLeft: 28,
              opacity: interpolate(frame, [2.4 * fps, 3 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono",
                fontWeight: 700,
                fontSize: 64,
                color: "#5ac8fa",
              }}
            >
              x / ln x
            </span>
            <br />
            предсказание Гаусса
          </Interactive.Div>
          <Interactive.Div
            name="Values at 1000"
            from={5.6 * fps}
            style={{
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              fontSize: 48,
              lineHeight: 1.4,
              color: "#ffffff",
              opacity: interpolate(frame, [5.6 * fps, 6.2 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            π(1000) = <span style={{ color: "#f5c542" }}>168</span>
            <br />
            1000 / ln 1000 ≈ <span style={{ color: "#5ac8fa" }}>145</span>
          </Interactive.Div>
        </div>
      </div>
    </>
  );
};

export const Distribution = Interactive.create({
  Component: DistributionInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
