import { Audio } from "@remotion/media";
import {
  Easing,
  Img,
  Interactive,
  interpolate,
  interpolateColors,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Tex } from "../components/Tex";
import "../fonts";
import { imToY, PANEL, reToX } from "../geometry";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Real axis (Im s = 0) and imaginary axis (Re s = 0) in frame pixels.
const AXIS_Y = imToY(0);
const AXIS_X = reToX(0);
const RE_TICKS = [-4, -3, -2, -1, 0, 1, 2, 3];

// Grid, panel frame, real-axis ticks and tick labels of the ζ(s) panel. From 26.6 s,
// while the domain colouring fades in, it settles into exactly the picture the Zeros
// scene starts from (grid at 70 %, white ticks). One template, generated from PANEL.
const PanelGrid = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const imGrid = [5, 10, 15, 20, 25, 30, 35];
  const gridIn = interpolate(frame, [0.5 * fps, 1.4 * fps], [0, 1], CLAMP);
  const gridOpacity =
    gridIn * interpolate(frame, [26.6 * fps, 27.9 * fps], [1, 0.7], CLAMP);

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
      }}
    >
      {RE_TICKS.map((re) => (
        <line
          key={`gx${re}`}
          x1={reToX(re)}
          x2={reToX(re)}
          y1={PANEL.top}
          y2={PANEL.top + PANEL.height}
          stroke="#1d2542"
          strokeOpacity={gridOpacity}
          strokeWidth={2}
        />
      ))}
      {imGrid.map((im) => (
        <line
          key={`gy${im}`}
          x1={PANEL.left}
          x2={PANEL.left + PANEL.width}
          y1={imToY(im)}
          y2={imToY(im)}
          stroke="#1d2542"
          strokeOpacity={gridOpacity}
          strokeWidth={2}
        />
      ))}
    </svg>
  );
};

const PanelTicks = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = interpolate(frame, [1.3 * fps, 2 * fps], [0, 1], CLAMP);
  const stroke = interpolateColors(
    frame,
    [26.6 * fps, 27.9 * fps],
    ["#6b759a", "#ffffff"],
  );
  const strokeOpacity =
    appear * interpolate(frame, [26.6 * fps, 27.9 * fps], [1, 0.8], CLAMP);

  return (
    <>
      <svg
        viewBox="0 0 1920 1080"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
        }}
      >
        {RE_TICKS.map((re) => (
          <line
            key={`tx${re}`}
            x1={reToX(re)}
            x2={reToX(re)}
            y1={AXIS_Y - 8}
            y2={AXIS_Y + 8}
            stroke={stroke}
            strokeOpacity={strokeOpacity}
            strokeWidth={3}
          />
        ))}
        <rect
          x={PANEL.left}
          y={PANEL.top}
          width={PANEL.width}
          height={PANEL.height}
          fill="none"
          stroke="#26304f"
          strokeWidth={3}
          opacity={interpolate(frame, [0.5 * fps, 1.2 * fps], [0, 1], CLAMP)}
        />
      </svg>
      {RE_TICKS.map((re) => (
        <div
          key={`lx${re}`}
          style={{
            position: "absolute",
            left: reToX(re) - 40,
            top: 962,
            width: 80,
            display: "flex",
            // The last tick sits on the panel edge: keep its label inside.
            justifyContent: re === 3 ? "flex-start" : "center",
            opacity: appear,
          }}
        >
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              fontSize: 28,
              lineHeight: "28px",
              padding: "0px 6px",
              borderRadius: 8,
              backgroundColor: "rgba(11, 16, 32, 0.72)",
              color: "#ffffff",
            }}
          >
            {re < 0 ? `−${-re}` : re}
          </div>
        </div>
      ))}
      {[10, 20, 30].map((im) => (
        <div
          key={`ly${im}`}
          style={{
            position: "absolute",
            right: 1920 - PANEL.left + 14,
            top: imToY(im) - 16,
            fontFamily: "JetBrains Mono",
            fontWeight: 500,
            fontSize: 28,
            lineHeight: "32px",
            color: "#9aa4c7",
            opacity: appear,
          }}
        >
          {im}
        </div>
      ))}
    </>
  );
};

// Rings that briefly mark the dark points of the colouring (the zeros) while the
// narration says «точки, где она равна нулю»; gone before the end state.
const ZeroRings = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // r: final ring radius (the trivial zeros get smaller rings, clear of the tick labels).
  const points = [
    { re: 0.5, im: 14.134725, r: 26 },
    { re: 0.5, im: 21.02204, r: 26 },
    { re: 0.5, im: 25.010858, r: 26 },
    { re: 0.5, im: 30.424876, r: 26 },
    { re: 0.5, im: 32.935062, r: 26 },
    { re: -2, im: 0, r: 17 },
    { re: -4, im: 0, r: 17 },
  ];
  const fadeOut = interpolate(frame, [32.6 * fps, 33.1 * fps], [1, 0], CLAMP);

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
      }}
    >
      {points.map((p, i) => {
        const start = 30.4 * fps + i * 3;
        const grow = interpolate(frame, [start, start + 0.5 * fps], [0, 1], {
          ...CLAMP,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
        return (
          <circle
            key={`${p.re}-${p.im}`}
            cx={reToX(p.re)}
            cy={imToY(p.im)}
            r={p.r * (0.4 + 0.6 * grow)}
            fill="none"
            stroke="#ffffff"
            strokeWidth={3}
            opacity={grow * fadeOut}
          />
        );
      })}
    </svg>
  );
};

const PlaneInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {/* ---------- The plane: panel at PANEL (x 1060–1780, y 90–990) ---------- */}
      <Interactive.Div
        name="Panel surface"
        style={{
          position: "absolute",
          left: 1060,
          top: 90,
          width: 720,
          height: 900,
          backgroundColor: "#10172e",
          opacity: interpolate(
            frame,
            [0.5 * fps, 1.2 * fps, 26.6 * fps, 27.9 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />
      <Interactive.Div
        name="Shaded half-plane"
        from={11.6 * fps}
        style={{
          position: "absolute",
          top: 90,
          height: 900,
          left: interpolate(frame, [17.3 * fps, 19 * fps], [1600, 1060], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
          }),
          width: interpolate(frame, [17.3 * fps, 19 * fps], [180, 720], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
          }),
          backgroundColor: "rgba(90, 200, 250, 0.2)",
          opacity: interpolate(
            frame,
            [11.7 * fps, 12.4 * fps, 26.6 * fps, 27.9 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />
      <Img
        name="Zeta domain colouring"
        src={staticFile("zeta-domain.png")}
        style={{
          position: "absolute",
          left: 1060,
          top: 90,
          width: 720,
          height: 900,
          opacity: interpolate(frame, [26.6 * fps, 27.9 * fps], [0, 0.85], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <PanelGrid />

      <Interactive.Svg
        name="Axes"
        viewBox="0 0 1920 1080"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
        }}
      >
        <Interactive.Line
          name="Dashed line Re s = 1"
          from={11.6 * fps}
          x1={reToX(1)}
          x2={reToX(1)}
          y1={PANEL.top}
          y2={interpolate(
            frame,
            [11.7 * fps, 12.5 * fps],
            [PANEL.top, PANEL.top + PANEL.height],
            CLAMP,
          )}
          style={{
            stroke: "#5ac8fa",
            strokeWidth: 4,
            strokeDasharray: "16 12",
            opacity: interpolate(frame, [26.6 * fps, 27.6 * fps], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        <Interactive.Line
          name="Real axis"
          x1={PANEL.left}
          x2={PANEL.left + PANEL.width}
          y1={AXIS_Y}
          y2={AXIS_Y}
          style={{
            strokeWidth: 3,
            stroke: interpolateColors(
              frame,
              [26.6 * fps, 27.9 * fps],
              ["#6b759a", "#ffffff"],
            ),
            strokeOpacity: interpolate(
              frame,
              [26.6 * fps, 27.9 * fps],
              [1, 0.8],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            strokeDasharray: 720,
            strokeDashoffset: interpolate(
              frame,
              [0.6 * fps, 1.6 * fps],
              [720, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.inOut(Easing.cubic),
              },
            ),
          }}
        />
        <Interactive.Line
          name="Imaginary axis"
          x1={AXIS_X}
          x2={AXIS_X}
          y1={PANEL.top + PANEL.height}
          y2={PANEL.top}
          style={{
            strokeWidth: 3,
            stroke: interpolateColors(
              frame,
              [26.6 * fps, 27.9 * fps],
              ["#6b759a", "#ffffff"],
            ),
            strokeOpacity: interpolate(
              frame,
              [26.6 * fps, 27.9 * fps],
              [1, 0.8],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            strokeDasharray: 900,
            strokeDashoffset: interpolate(
              frame,
              [0.8 * fps, 1.8 * fps],
              [900, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.inOut(Easing.cubic),
              },
            ),
          }}
        />
        <Interactive.Line
          name="Projection to real axis"
          from={8.4 * fps}
          x1={reToX(1.8)}
          x2={reToX(1.8)}
          y1={imToY(12)}
          y2={interpolate(
            frame,
            [8.4 * fps, 9.1 * fps],
            [imToY(12), AXIS_Y],
            CLAMP,
          )}
          style={{
            stroke: "#9aa4c7",
            strokeWidth: 3,
            strokeDasharray: "10 9",
            opacity: interpolate(frame, [16.4 * fps, 16.9 * fps], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        <Interactive.Line
          name="Real part segment"
          from={8.4 * fps}
          x1={AXIS_X}
          x2={interpolate(
            frame,
            [9 * fps, 9.8 * fps],
            [AXIS_X, reToX(1.8)],
            CLAMP,
          )}
          y1={AXIS_Y}
          y2={AXIS_Y}
          style={{
            stroke: "#f5c542",
            strokeWidth: 7,
            strokeLinecap: "round",
            opacity: interpolate(
              frame,
              [9 * fps, 9.2 * fps, 16.4 * fps, 16.9 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        />
        <Interactive.Circle
          name="Projection foot"
          from={8.4 * fps}
          cx={reToX(1.8)}
          cy={AXIS_Y}
          r={9}
          style={{
            fill: "#f5c542",
            opacity: interpolate(
              frame,
              [9 * fps, 9.2 * fps, 16.4 * fps, 16.9 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        />
      </Interactive.Svg>
      <PanelTicks />
      <ZeroRings />

      <Interactive.Div
        name="Axis label Re s"
        style={{
          position: "absolute",
          right: 150,
          top: 896.6,
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 28,
          lineHeight: "28px",
          padding: "2px 8px",
          borderRadius: 8,
          backgroundColor: "rgba(11, 16, 32, 0.72)",
          color: interpolateColors(
            frame,
            [10.4 * fps, 10.8 * fps, 16.4 * fps, 16.9 * fps],
            ["#ffffff", "#f5c542", "#f5c542", "#ffffff"],
          ),
          opacity: interpolate(frame, [1.6 * fps, 2.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Re s
      </Interactive.Div>
      <Interactive.Div
        name="Axis label Im s"
        style={{
          position: "absolute",
          right: 874,
          top: 94,
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 28,
          lineHeight: "32px",
          color: "#ffffff",
          opacity: interpolate(frame, [1.6 * fps, 2.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Im s
      </Interactive.Div>

      <Tex
        name="Sigma label"
        from={8.4 * fps}
        tex={String.raw`\sigma`}
        style={{
          position: "absolute",
          left: 1532,
          top: 852,
          fontSize: 64,
          color: "#f5c542",
          opacity: interpolate(
            frame,
            [9.3 * fps, 9.8 * fps, 16.4 * fps, 16.9 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />

      <Interactive.Div
        name="Point s"
        from={4.7 * fps}
        style={{
          position: "absolute",
          left: 1690,
          top: 800.5,
          width: 0,
          height: 0,
          opacity: interpolate(
            frame,
            [4.7 * fps, 5 * fps, 16.4 * fps, 16.9 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
          scale: interpolate(frame, [4.7 * fps, 5.3 * fps], [0.4, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 14 }),
            output: "perceptual-scale",
          }),
          translate: interpolate(
            frame,
            [5.4 * fps, 6.4 * fps, 7.4 * fps],
            ["0px 0px", "-117px -71px", "-18px -142px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            },
          ),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -14,
            top: -14,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#5ac8fa",
            border: "3px solid #ffffff",
            boxSizing: "border-box",
            boxShadow: "0 0 24px 6px rgba(90, 200, 250, 0.55)",
          }}
        />
        <Tex
          name="Point label"
          tex={String.raw`s = \sigma + it`}
          style={{
            position: "absolute",
            right: 30,
            top: -44,
            fontSize: 64,
            color: "#ffffff",
            padding: "0px 18px",
            borderRadius: 16,
            backgroundColor: "rgba(11, 16, 32, 0.85)",
          }}
        />
      </Interactive.Div>

      {/* Expanding coral rings that draw the eye to s = 1: at «кроме одной точки»
          and again at «эс, равного единице». Gone long before the end state. */}
      <Track name="Pole pulses">
        <Interactive.Div
          name="Pole pulse 1"
          from={22.2 * fps}
          durationInFrames={1.2 * fps}
          style={{
            position: "absolute",
            left: 1555,
            top: 897.6,
            width: 90,
            height: 90,
            borderRadius: 45,
            border: "4px solid #ff6b6b",
            boxSizing: "border-box",
            boxShadow: "0 0 14px rgba(255, 107, 107, 0.6)",
            scale: interpolate(frame, [22.2 * fps, 23.2 * fps], [0.25, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
              output: "perceptual-scale",
            }),
            opacity: interpolate(frame, [22.2 * fps, 23.2 * fps], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        <Interactive.Div
          name="Pole pulse 2"
          from={24.1 * fps}
          durationInFrames={1.2 * fps}
          style={{
            position: "absolute",
            left: 1555,
            top: 897.6,
            width: 90,
            height: 90,
            borderRadius: 45,
            border: "4px solid #ff6b6b",
            boxSizing: "border-box",
            boxShadow: "0 0 14px rgba(255, 107, 107, 0.6)",
            scale: interpolate(frame, [24.1 * fps, 25.1 * fps], [0.25, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
              output: "perceptual-scale",
            }),
            opacity: interpolate(frame, [24.1 * fps, 25.1 * fps], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </Track>

      <Interactive.Svg
        name="Pole cross"
        from={22.2 * fps}
        width={36}
        height={36}
        viewBox="0 0 36 36"
        style={{
          position: "absolute",
          left: 1582,
          top: 924.6,
          opacity: interpolate(frame, [22.2 * fps, 22.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [22.2 * fps, 22.8 * fps], [0.3, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      >
        <path
          d="M 7 7 L 29 29 M 29 7 L 7 29"
          stroke="#ff6b6b"
          strokeWidth={6}
          strokeLinecap="round"
        />
      </Interactive.Svg>
      <Interactive.Div
        name="Pole label"
        from={22.4 * fps}
        style={{
          position: "absolute",
          left: 1214,
          top: 846,
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 44,
          lineHeight: "56px",
          padding: "2px 18px",
          borderRadius: 14,
          color: "#ff6b6b",
          backgroundColor: "rgba(11, 16, 32, 0.85)",
          whiteSpace: "nowrap",
          opacity: interpolate(
            frame,
            [22.4 * fps, 22.9 * fps, 26.6 * fps, 27.1 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        <span style={{ fontStyle: "italic" }}>s</span> = 1 — полюс
      </Interactive.Div>

      {/* ---------- Left column (x 140–960) ---------- */}
      <Interactive.Div
        name="Kicker"
        style={{
          position: "absolute",
          left: 140,
          top: 170,
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 44,
          letterSpacing: 8,
          textTransform: "uppercase",
          color: "#f5c542",
          opacity: interpolate(
            frame,
            [0.5 * fps, 1.1 * fps, 33 * fps, 33.4 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        Комплексная плоскость
      </Interactive.Div>

      <div
        style={{
          position: "absolute",
          left: 140,
          top: 290,
          width: 820,
          height: 280,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Track name="Formulas">
          <Tex
            name="Zeta of s"
            from={3.3 * fps}
            durationInFrames={5.1 * fps}
            tex={String.raw`\zeta(\textcolor{#5ac8fa}{s})`}
            style={{
              fontSize: 120,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [3.3 * fps, 3.8 * fps, 8.1 * fps, 8.4 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: interpolate(
                frame,
                [3.3 * fps, 4.1 * fps],
                ["0px 30px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          />
          <Tex
            name="Sigma is Re s"
            from={8.4 * fps}
            durationInFrames={3.2 * fps}
            tex={String.raw`\textcolor{#f5c542}{\sigma} = \operatorname{Re} s`}
            style={{
              fontSize: 110,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [8.4 * fps, 8.9 * fps, 11.3 * fps, 11.6 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: interpolate(
                frame,
                [8.4 * fps, 9.2 * fps],
                ["0px 30px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          />
          <Tex
            name="Dirichlet series"
            from={11.6 * fps}
            durationInFrames={5.6 * fps}
            tex={String.raw`\sum_{n=1}^{\infty} \frac{1}{n^{s}}`}
            display
            style={{
              fontSize: 78,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [11.6 * fps, 12.1 * fps, 16.9 * fps, 17.2 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: interpolate(
                frame,
                [11.6 * fps, 12.4 * fps],
                ["0px 30px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          />
          <Tex
            name="Zeta everywhere"
            from={17.2 * fps}
            durationInFrames={9.3 * fps}
            tex={String.raw`\zeta(\textcolor{#5ac8fa}{s})`}
            style={{
              fontSize: 120,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [17.2 * fps, 17.7 * fps, 26.2 * fps, 26.5 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: interpolate(
                frame,
                [17.2 * fps, 18 * fps],
                ["0px 30px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          />
          <Interactive.Div
            name="Zeta zeros formula"
            from={28.1 * fps}
            durationInFrames={5.9 * fps}
            style={{
              display: "flex",
              alignItems: "baseline",
              opacity: interpolate(
                frame,
                [28.1 * fps, 28.6 * fps, 33 * fps, 33.4 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: interpolate(
                frame,
                [28.1 * fps, 28.9 * fps],
                ["0px 30px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          >
            <Tex
              name="Zeta of s (zeros)"
              tex={String.raw`\zeta(\textcolor{#5ac8fa}{s})`}
              style={{ fontSize: 120, color: "#ffffff" }}
            />
            <Tex
              name="Equals zero"
              tex={String.raw`{}= 0`}
              style={{
                fontSize: 120,
                color: "#ffffff",
                opacity: interpolate(frame, [31.4 * fps, 31.8 * fps], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                translate: interpolate(
                  frame,
                  [31.4 * fps, 32 * fps],
                  ["-24px 0px", "0px 0px"],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                  },
                ),
              }}
            />
          </Interactive.Div>
        </Track>
      </div>

      <div
        style={{
          position: "absolute",
          left: 140,
          top: 640,
          width: 820,
        }}
      >
        <Track name="Captions">
          <Interactive.Div
            name="Caption complex numbers"
            from={4.7 * fps}
            durationInFrames={3.7 * fps}
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 60,
              lineHeight: 1.2,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [4.7 * fps, 5.2 * fps, 8.1 * fps, 8.4 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: interpolate(
                frame,
                [4.7 * fps, 5.5 * fps],
                ["0px 30px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          >
            Комплексные числа —{" "}
            <span style={{ color: "#5ac8fa" }}>точки на плоскости</span>
          </Interactive.Div>
          <Interactive.Div
            name="Caption real part"
            from={8.4 * fps}
            durationInFrames={3.2 * fps}
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 60,
              lineHeight: 1.2,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [8.4 * fps, 8.9 * fps, 11.3 * fps, 11.6 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: interpolate(
                frame,
                [8.4 * fps, 9.2 * fps],
                ["0px 30px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          >
            Горизонталь —{" "}
            <span style={{ color: "#f5c542" }}>действительная часть</span>
          </Interactive.Div>
          <Interactive.Div
            name="Caption series converges"
            from={11.6 * fps}
            durationInFrames={5.6 * fps}
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 60,
              lineHeight: 1.2,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [11.6 * fps, 12.1 * fps, 16.9 * fps, 17.2 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: interpolate(
                frame,
                [11.6 * fps, 12.4 * fps],
                ["0px 30px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          >
            Здесь ряд сходится:{" "}
            <span style={{ color: "#5ac8fa", whiteSpace: "nowrap" }}>
              Re <i>s</i> &gt; 1
            </span>
          </Interactive.Div>
          <Interactive.Div
            name="Caption whole plane"
            from={17.2 * fps}
            durationInFrames={9.3 * fps}
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 60,
              lineHeight: 1.2,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [17.2 * fps, 17.7 * fps, 26.2 * fps, 26.5 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: interpolate(
                frame,
                [17.2 * fps, 18 * fps],
                ["0px 30px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          >
            Та же функция —{" "}
            <span style={{ color: "#5ac8fa", whiteSpace: "nowrap" }}>
              на всей плоскости
            </span>
          </Interactive.Div>
          <Interactive.Div
            name="Caption zeros"
            from={28.1 * fps}
            durationInFrames={5.9 * fps}
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 60,
              lineHeight: 1.2,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [28.1 * fps, 28.6 * fps, 33 * fps, 33.4 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: interpolate(
                frame,
                [28.1 * fps, 28.9 * fps],
                ["0px 30px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          >
            <span style={{ color: "#5ac8fa" }}>
              Нули ζ(<i>s</i>)
            </span>{" "}
            — тёмные точки, где сходятся все цвета
          </Interactive.Div>
        </Track>
      </div>

      <Track name="Voiceover">
        <Audio
          name="plane-1"
          src={staticFile("voiceover/plane-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="plane-2"
          src={staticFile("voiceover/plane-2.mp3")}
          from={8.3 * fps}
        />
        <Audio
          name="plane-3"
          src={staticFile("voiceover/plane-3.mp3")}
          from={16.4 * fps}
        />
        <Audio
          name="plane-4"
          src={staticFile("voiceover/plane-4.mp3")}
          from={26.5 * fps}
        />
      </Track>
    </>
  );
};

export const Plane = Interactive.create({
  Component: PlaneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
