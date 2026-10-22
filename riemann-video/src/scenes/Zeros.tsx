import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
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
import { imToY, PANEL, reToX } from "../geometry";
import "../fonts";

// Panel geometry shared by the axes template (same picture as the end of Plane).
const PANEL_BOTTOM = PANEL.top + PANEL.height;
const PANEL_RIGHT = PANEL.left + PANEL.width;
const RE_TICKS = [-4, -3, -2, -1, 0, 1, 2, 3];
const IM_GRID = [5, 10, 15, 20, 25, 30, 35];

// Grid lines, axes and tick marks of the ζ(s) panel. One template from the geometry.
const PanelLines = () => {
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {RE_TICKS.map((re) => (
          <line
            key={`gx${re}`}
            x1={reToX(re)}
            x2={reToX(re)}
            y1={PANEL.top}
            y2={PANEL_BOTTOM}
            stroke="#1d2542"
            strokeOpacity={0.7}
            strokeWidth={2}
          />
        ))}
        {IM_GRID.map((im) => (
          <line
            key={`gy${im}`}
            x1={PANEL.left}
            x2={PANEL_RIGHT}
            y1={imToY(im)}
            y2={imToY(im)}
            stroke="#1d2542"
            strokeOpacity={0.7}
            strokeWidth={2}
          />
        ))}
        <line
          x1={PANEL.left}
          x2={PANEL_RIGHT}
          y1={imToY(0)}
          y2={imToY(0)}
          stroke="#ffffff"
          strokeOpacity={0.8}
          strokeWidth={3}
        />
        <line
          x1={reToX(0)}
          x2={reToX(0)}
          y1={PANEL.top}
          y2={PANEL_BOTTOM}
          stroke="#ffffff"
          strokeOpacity={0.8}
          strokeWidth={3}
        />
        {RE_TICKS.map((re) => (
          <line
            key={`tx${re}`}
            x1={reToX(re)}
            x2={reToX(re)}
            y1={imToY(0) - 8}
            y2={imToY(0) + 8}
            stroke="#ffffff"
            strokeOpacity={0.8}
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
        />
      </svg>
    </AbsoluteFill>
  );
};

// Tick and axis labels, drawn above every overlay so lines never cross them.
const PanelLabels = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // The tick labels of the two trivial zeros turn coral when they are named.
  const highlight: Record<number, number> = { [-2]: 2.9, [-4]: 4.1 };

  return (
    <AbsoluteFill>
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
              color:
                re in highlight
                  ? interpolateColors(
                      frame,
                      [highlight[re] * fps, (highlight[re] + 0.4) * fps],
                      ["#ffffff", "#ff6b6b"],
                    )
                  : "#ffffff",
            }}
          >
            {re < 0 ? `−${-re}` : re}
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          right: 1920 - PANEL.left + 14,
          top: PANEL.top + 4,
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 28,
          lineHeight: "32px",
          color: "#ffffff",
        }}
      >
        Im s
      </div>
      <div
        style={{
          position: "absolute",
          right: 1920 - PANEL_RIGHT + 10,
          top: imToY(0) - 46,
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 28,
          lineHeight: "28px",
          padding: "2px 8px",
          borderRadius: 8,
          backgroundColor: "rgba(11, 16, 32, 0.72)",
          color: "#ffffff",
        }}
      >
        Re s
      </div>
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
          }}
        >
          {im}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// Expanding cyan rings around the five nontrivial zeros: a pulse at "нули" (zeros-4) and at
// "нетривиальные" (zeros-5). Template graphics over the zero heights.
const ZeroPulses = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heights = [14.134725, 21.02204, 25.010858, 30.424876, 32.935062];
  const pulses = [25.2, 34.0];

  return (
    <AbsoluteFill>
      {pulses.flatMap((t) =>
        heights.map((im) => {
          const p = interpolate(frame, [t * fps, (t + 0.9) * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const size = 22 + p * 76;
          return (
            <div
              key={`${t}-${im}`}
              style={{
                position: "absolute",
                left: reToX(0.5) - size / 2,
                top: imToY(im) - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                border: "4px solid #5ac8fa",
                boxSizing: "border-box",
                boxShadow: "0 0 12px rgba(90, 200, 250, 0.6)",
                opacity: p > 0 && p < 1 ? 1 - p : 0,
              }}
            />
          );
        }),
      )}
    </AbsoluteFill>
  );
};

const ZerosInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {/* ── Panel: the end state of Plane, visible from frame 0 ── */}
      <Img
        name="Zeta domain"
        src={staticFile("zeta-domain.png")}
        style={{
          position: "absolute",
          left: 1060,
          top: 90,
          width: 720,
          height: 900,
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1060,
          top: 90,
          width: 450,
          height: 900,
          backgroundColor: "#0b1020",
          opacity: interpolate(frame, [10 * fps, 10.6 * fps], [0, 0.5], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1600,
          top: 90,
          width: 180,
          height: 900,
          backgroundColor: "#0b1020",
          opacity: interpolate(frame, [10 * fps, 10.6 * fps], [0, 0.5], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <PanelLines />
      <Interactive.Div
        name="Critical strip"
        from={10 * fps}
        style={{
          position: "absolute",
          left: 1508,
          top: 90,
          width: 94,
          height: 900,
          boxSizing: "border-box",
          backgroundColor: "rgba(255, 236, 180, 0.2)",
          borderLeft: "4px solid #f5c542",
          borderRight: "4px solid #f5c542",
          boxShadow: "0 0 24px rgba(245, 197, 66, 0.35)",
          clipPath: "inset(0px -40px)",
          opacity: interpolate(
            frame,
            [10 * fps, 10.6 * fps, 24.4 * fps, 25.4 * fps],
            [0, 1, 1, 0.45],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      />
      <Interactive.Div
        name="Critical line"
        from={24.3 * fps}
        style={{
          position: "absolute",
          left: 1552,
          bottom: 90,
          width: 6,
          height: interpolate(frame, [24.4 * fps, 25.6 * fps], [0, 900], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
          }),
          borderRadius: 3,
          backgroundColor: "#f5c542",
          boxShadow: "0 0 22px 8px rgba(245, 197, 66, 0.75)",
          // Keep the glow sideways only, so it never bleeds past the panel's top/bottom edge.
          clipPath: "inset(0px -40px)",
        }}
      />
      <Interactive.Svg
        name="Pole"
        width={36}
        height={36}
        viewBox="0 0 36 36"
        style={{ position: "absolute", left: 1582, top: 924.6 }}
      >
        <path
          d="M 7 7 L 29 29 M 29 7 L 7 29"
          stroke="#ff6b6b"
          strokeWidth={6}
          strokeLinecap="round"
        />
      </Interactive.Svg>

      {/* ── zeros-1: trivial zeros ── */}
      <Interactive.Div
        name="Trivial zero −2"
        from={2.9 * fps}
        style={{
          position: "absolute",
          left: 1312,
          top: 924.6,
          width: 36,
          height: 36,
          borderRadius: 18,
          boxSizing: "border-box",
          border: "5px solid #ff6b6b",
          backgroundColor: "rgba(11, 16, 32, 0.75)",
          boxShadow: "0 0 18px rgba(255, 107, 107, 0.8)",
          scale: interpolate(frame, [2.9 * fps, 3.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Interactive.Div
        name="Trivial zero −4"
        from={4.1 * fps}
        style={{
          position: "absolute",
          left: 1132,
          top: 924.6,
          width: 36,
          height: 36,
          borderRadius: 18,
          boxSizing: "border-box",
          border: "5px solid #ff6b6b",
          backgroundColor: "rgba(11, 16, 32, 0.75)",
          boxShadow: "0 0 18px rgba(255, 107, 107, 0.8)",
          scale: interpolate(frame, [4.1 * fps, 4.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Interactive.Div
        name="More trivial zeros"
        from={5.5 * fps}
        style={{
          position: "absolute",
          right: 800,
          top: 922.6,
          height: 40,
          display: "flex",
          alignItems: "center",
          gap: 6,
          opacity: interpolate(frame, [5.5 * fps, 5.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [5.5 * fps, 6.3 * fps],
            ["40px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 36,
            lineHeight: "40px",
            color: "#ff6b6b",
          }}
        >
          −6, −8, …
        </div>
        <svg width={150} height={28} viewBox="0 0 150 28">
          <path
            d="M 146 14 L 6 14 M 18 3 L 4 14 L 18 25"
            stroke="#ff6b6b"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </Interactive.Div>

      {/* ── zeros-3: the first nontrivial zeros, each at its word ── */}
      <Interactive.Div
        name="Zero 14.13"
        from={17.9 * fps}
        style={{
          position: "absolute",
          left: 1544,
          top: 596.9,
          width: 22,
          height: 22,
          borderRadius: 11,
          boxSizing: "border-box",
          border: "3px solid #ffffff",
          backgroundColor: "#5ac8fa",
          boxShadow: "0 0 20px 6px rgba(90, 200, 250, 0.75)",
          scale: interpolate(frame, [17.9 * fps, 18.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Interactive.Div
        name="Zero 21.02"
        from={20.6 * fps}
        style={{
          position: "absolute",
          left: 1544,
          top: 433.7,
          width: 22,
          height: 22,
          borderRadius: 11,
          boxSizing: "border-box",
          border: "3px solid #ffffff",
          backgroundColor: "#5ac8fa",
          boxShadow: "0 0 20px 6px rgba(90, 200, 250, 0.75)",
          scale: interpolate(frame, [20.6 * fps, 21.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Interactive.Div
        name="Zero 25.01"
        from={21.7 * fps}
        style={{
          position: "absolute",
          left: 1544,
          top: 339.3,
          width: 22,
          height: 22,
          borderRadius: 11,
          boxSizing: "border-box",
          border: "3px solid #ffffff",
          backgroundColor: "#5ac8fa",
          boxShadow: "0 0 20px 6px rgba(90, 200, 250, 0.75)",
          scale: interpolate(frame, [21.7 * fps, 22.3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Interactive.Div
        name="Zero 30.42"
        from={23.1 * fps}
        style={{
          position: "absolute",
          left: 1544,
          top: 211,
          width: 22,
          height: 22,
          borderRadius: 11,
          boxSizing: "border-box",
          border: "3px solid #ffffff",
          backgroundColor: "#5ac8fa",
          boxShadow: "0 0 20px 6px rgba(90, 200, 250, 0.75)",
          scale: interpolate(frame, [23.1 * fps, 23.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Interactive.Div
        name="Zero 32.94"
        from={23.3 * fps}
        style={{
          position: "absolute",
          left: 1544,
          top: 151.6,
          width: 22,
          height: 22,
          borderRadius: 11,
          boxSizing: "border-box",
          border: "3px solid #ffffff",
          backgroundColor: "#5ac8fa",
          boxShadow: "0 0 20px 6px rgba(90, 200, 250, 0.75)",
          scale: interpolate(frame, [23.3 * fps, 23.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <ZeroPulses />

      {/* Zero labels: left of the strip, dark backing, short leader to the dot */}
      <Interactive.Div
        name="Label 14.13"
        from={17.9 * fps}
        style={{
          position: "absolute",
          right: 376,
          top: 583.9,
          display: "flex",
          alignItems: "center",
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 34,
          lineHeight: "40px",
          color: "#5ac8fa",
          opacity: interpolate(frame, [17.9 * fps, 18.3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [17.9 * fps, 18.6 * fps],
            ["-24px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            padding: "4px 14px",
            borderRadius: 12,
            backgroundColor: "rgba(11, 16, 32, 0.88)",
          }}
        >
          ½ + 14,13i
        </div>
        <div style={{ width: 40, height: 3, backgroundColor: "#5ac8fa" }} />
      </Interactive.Div>
      <Interactive.Div
        name="Label 21.02"
        from={20.6 * fps}
        style={{
          position: "absolute",
          right: 376,
          top: 420.7,
          display: "flex",
          alignItems: "center",
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 34,
          lineHeight: "40px",
          color: "#5ac8fa",
          opacity: interpolate(frame, [20.6 * fps, 21 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [20.6 * fps, 21.3 * fps],
            ["-24px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            padding: "4px 14px",
            borderRadius: 12,
            backgroundColor: "rgba(11, 16, 32, 0.88)",
          }}
        >
          ½ + 21,02i
        </div>
        <div style={{ width: 40, height: 3, backgroundColor: "#5ac8fa" }} />
      </Interactive.Div>
      <Interactive.Div
        name="Label 25.01"
        from={21.7 * fps}
        style={{
          position: "absolute",
          right: 376,
          top: 326.3,
          display: "flex",
          alignItems: "center",
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 34,
          lineHeight: "40px",
          color: "#5ac8fa",
          opacity: interpolate(frame, [21.7 * fps, 22.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [21.7 * fps, 22.4 * fps],
            ["-24px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            padding: "4px 14px",
            borderRadius: 12,
            backgroundColor: "rgba(11, 16, 32, 0.88)",
          }}
        >
          ½ + 25,01i
        </div>
        <div style={{ width: 40, height: 3, backgroundColor: "#5ac8fa" }} />
      </Interactive.Div>
      <Interactive.Div
        name="Label 30.42"
        from={23.1 * fps}
        style={{
          position: "absolute",
          right: 376,
          top: 198,
          display: "flex",
          alignItems: "center",
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 34,
          lineHeight: "40px",
          color: "#5ac8fa",
          opacity: interpolate(frame, [23.1 * fps, 23.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [23.1 * fps, 23.8 * fps],
            ["-24px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            padding: "4px 14px",
            borderRadius: 12,
            backgroundColor: "rgba(11, 16, 32, 0.88)",
          }}
        >
          ½ + 30,42i
        </div>
        <div style={{ width: 40, height: 3, backgroundColor: "#5ac8fa" }} />
      </Interactive.Div>
      <Interactive.Div
        name="Label 32.94"
        from={23.3 * fps}
        style={{
          position: "absolute",
          right: 376,
          top: 138.6,
          display: "flex",
          alignItems: "center",
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 34,
          lineHeight: "40px",
          color: "#5ac8fa",
          opacity: interpolate(frame, [23.3 * fps, 23.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [23.3 * fps, 24 * fps],
            ["-24px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            padding: "4px 14px",
            borderRadius: 12,
            backgroundColor: "rgba(11, 16, 32, 0.88)",
          }}
        >
          ½ + 32,94i
        </div>
        <div style={{ width: 40, height: 3, backgroundColor: "#5ac8fa" }} />
      </Interactive.Div>

      <PanelLabels />

      {/* ── Left column (x 140–960): legend that builds up line by line ── */}
      <Tex
        name="Zeros equation"
        tex={String.raw`\zeta(s) = 0`}
        display
        style={{
          position: "absolute",
          left: 140,
          top: 120,
          fontSize: 96,
          color: "#ffffff",
          opacity: interpolate(
            frame,
            [0.6 * fps, 1 * fps, 7.3 * fps, 7.7 * fps, 31.8 * fps, 32.1 * fps],
            [0, 1, 1, 0.5, 0.5, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          translate: interpolate(
            frame,
            [6.5 * fps, 7.2 * fps],
            ["0px 300px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            },
          ),
        }}
      />
      <Interactive.Div
        name="Trivial caption"
        from={7.3 * fps}
        style={{
          position: "absolute",
          left: 140,
          top: 300,
          display: "flex",
          alignItems: "center",
          gap: 28,
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 56,
          lineHeight: "68px",
          color: "#ffffff",
          opacity: interpolate(
            frame,
            [
              7.3 * fps,
              7.7 * fps,
              10 * fps,
              10.4 * fps,
              31.8 * fps,
              32.1 * fps,
            ],
            [0, 1, 1, 0.5, 0.5, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          translate: interpolate(
            frame,
            [7.3 * fps, 8 * fps],
            ["-30px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            boxSizing: "border-box",
            border: "5px solid #ff6b6b",
            backgroundColor: "rgba(255, 107, 107, 0.3)",
            flexShrink: 0,
          }}
        />
        тривиальные нули
      </Interactive.Div>
      <Interactive.Div
        name="Trivial values"
        from={7.4 * fps}
        style={{
          position: "absolute",
          left: 204,
          top: 380,
          fontFamily: "JetBrains Mono",
          fontWeight: 500,
          fontSize: 44,
          lineHeight: "52px",
          color: "#ff6b6b",
          opacity: interpolate(
            frame,
            [
              7.4 * fps,
              7.8 * fps,
              10 * fps,
              10.4 * fps,
              31.8 * fps,
              32.1 * fps,
            ],
            [0, 1, 1, 0.5, 0.5, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          translate: interpolate(
            frame,
            [7.4 * fps, 8.1 * fps],
            ["-30px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        s = −2, −4, −6, …
      </Interactive.Div>
      <Interactive.Div
        name="Strip caption"
        from={10 * fps}
        style={{
          position: "absolute",
          left: 140,
          top: 480,
          display: "flex",
          alignItems: "center",
          gap: 28,
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 56,
          lineHeight: "68px",
          color: "#ffffff",
          opacity: interpolate(
            frame,
            [
              10 * fps,
              10.4 * fps,
              15.2 * fps,
              15.6 * fps,
              31.8 * fps,
              32.1 * fps,
            ],
            [0, 1, 1, 0.5, 0.5, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          translate: interpolate(
            frame,
            [10 * fps, 10.7 * fps],
            ["-30px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            width: 36,
            height: 52,
            boxSizing: "border-box",
            borderLeft: "4px solid #f5c542",
            borderRight: "4px solid #f5c542",
            backgroundColor: "rgba(255, 236, 180, 0.3)",
            flexShrink: 0,
          }}
        />
        критическая полоса
      </Interactive.Div>
      <Tex
        name="Strip inequality"
        from={12.2 * fps}
        tex={String.raw`0 < \operatorname{Re} s < 1`}
        style={{
          position: "absolute",
          left: 204,
          top: 560,
          fontSize: 64,
          color: "#ffffff",
          opacity: interpolate(
            frame,
            [
              12.2 * fps,
              12.6 * fps,
              15.2 * fps,
              15.6 * fps,
              31.8 * fps,
              32.1 * fps,
            ],
            [0, 1, 1, 0.5, 0.5, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          translate: interpolate(
            frame,
            [12.2 * fps, 12.9 * fps],
            ["-30px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      />
      <Interactive.Div
        name="Nontrivial caption"
        from={15.2 * fps}
        style={{
          position: "absolute",
          left: 140,
          top: 690,
          display: "flex",
          alignItems: "center",
          gap: 28,
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 56,
          lineHeight: "68px",
          color: "#ffffff",
          opacity: interpolate(
            frame,
            [
              15.2 * fps,
              15.6 * fps,
              28.9 * fps,
              29.3 * fps,
              31.8 * fps,
              32.1 * fps,
            ],
            [0, 1, 1, 0.5, 0.5, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          translate: interpolate(
            frame,
            [15.2 * fps, 15.9 * fps],
            ["-30px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              boxSizing: "border-box",
              border: "3px solid #ffffff",
              backgroundColor: "#5ac8fa",
              boxShadow: "0 0 16px 4px rgba(90, 200, 250, 0.7)",
            }}
          />
        </div>
        нетривиальные нули
      </Interactive.Div>
      <Interactive.Div
        name="Critical line caption"
        from={28.9 * fps}
        style={{
          position: "absolute",
          left: 140,
          top: 800,
          display: "flex",
          alignItems: "center",
          gap: 28,
          opacity: interpolate(
            frame,
            [28.9 * fps, 29.3 * fps, 31.8 * fps, 32.1 * fps],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          translate: interpolate(
            frame,
            [28.9 * fps, 29.6 * fps],
            ["-30px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            width: 36,
            height: 80,
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 5,
              height: 80,
              borderRadius: 3,
              backgroundColor: "#f5c542",
              boxShadow: "0 0 14px 4px rgba(245, 197, 66, 0.6)",
            }}
          />
        </div>
        <Tex
          name="Critical line formula"
          tex={String.raw`\operatorname{Re} s = \tfrac12`}
          style={{ fontSize: 72, color: "#f5c542" }}
        />
      </Interactive.Div>

      {/* ── zeros-5: the statement card replaces the legend ── */}
      <Interactive.Div
        name="Hypothesis card"
        from={31.8 * fps}
        style={{
          position: "absolute",
          left: 140,
          top: 232,
          width: 820,
          height: 616,
          boxSizing: "border-box",
          padding: "56px 60px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#151c33",
          border: "3px solid #26304f",
          borderRadius: 30,
          opacity: interpolate(frame, [32.1 * fps, 32.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [32.1 * fps, 32.9 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <Interactive.Div
          name="Hypothesis kicker"
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 44,
            lineHeight: "54px",
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#f5c542",
          }}
        >
          Гипотеза Римана
        </Interactive.Div>
        {/* Nested "from" is relative to the card (which starts at 31.8 s); the inline
            interpolations below use the scene frame, so they keep absolute times. */}
        <Interactive.Div
          name="Hypothesis statement"
          from={1.9 * fps}
          style={{
            marginTop: 32,
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 60,
            lineHeight: "74px",
            color: "#ffffff",
            opacity: interpolate(frame, [33.7 * fps, 34.2 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [33.7 * fps, 34.4 * fps],
              ["0px 24px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          Все <span style={{ color: "#5ac8fa" }}>нетривиальные</span>
          <br />
          <span style={{ color: "#5ac8fa" }}>нули</span> ζ(s) лежат
          <br />
          на прямой
        </Interactive.Div>
        <Tex
          name="Hypothesis formula"
          from={3.8 * fps}
          tex={String.raw`\operatorname{Re} s = \tfrac12`}
          display
          style={{
            marginTop: 28,
            fontSize: 100,
            color: "#f5c542",
            opacity: interpolate(frame, [35.6 * fps, 36.1 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [35.6 * fps, 36.3 * fps], [0.85, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
          }}
        />
      </Interactive.Div>

      <Track name="Voiceover">
        <Audio
          name="zeros-1"
          src={staticFile("voiceover/zeros-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="zeros-2"
          src={staticFile("voiceover/zeros-2.mp3")}
          from={8.5 * fps}
        />
        <Audio
          name="zeros-3"
          src={staticFile("voiceover/zeros-3.mp3")}
          from={15.1 * fps}
        />
        <Audio
          name="zeros-4"
          src={staticFile("voiceover/zeros-4.mp3")}
          from={24.3 * fps}
        />
        <Audio
          name="zeros-5"
          src={staticFile("voiceover/zeros-5.mp3")}
          from={31.8 * fps}
        />
      </Track>
    </>
  );
};

export const Zeros = Interactive.create({
  Component: ZerosInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
