import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Tex } from "../components/Tex";
import zeros from "../data/zeros.json";
import "../fonts";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Point 1 backdrop: cyan zeros streaming up the critical line (spaced by their true
// heights) and dissolving into the fog at the top. A template, not separate elements.
// Its frame is local to the "Point 1" group (0 at 2.8 s of the scene).
const RisingZeros = () => {
  const frame = useCurrentFrame();
  const pxPerUnit = 11;
  const stream = zeros.slice(0, 21);
  const span = (stream[20] - stream[0]) * pxPerUnit;

  return (
    <AbsoluteFill>
      {stream.slice(0, 20).map((t, i) => {
        const y =
          1090 - (((t - stream[0]) * pxPerUnit + 140 + frame * 2.2) % span);
        return (
          <div
            key={t}
            style={{
              position: "absolute",
              left: 960 - 9,
              top: y - 9,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: "#5ac8fa",
              boxShadow: "0 0 20px 5px rgba(90, 200, 250, 0.5)",
              opacity:
                interpolate(y, [420, 720], [0, 1], CLAMP) *
                interpolate(y, [1000, 1080], [1, 0], CLAMP) *
                interpolate(frame, [6 + i * 1.5, 18 + i * 1.5], [0, 1], CLAMP),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Soft drifting blobs that make the top of the line look foggy.
const FogWisps = () => {
  const frame = useCurrentFrame();
  const wisps = [
    { x: 760, y: 360, w: 420, h: 150, phase: 0 },
    { x: 980, y: 330, w: 460, h: 170, phase: 1.7 },
    { x: 860, y: 450, w: 520, h: 160, phase: 3.1 },
    { x: 1060, y: 480, w: 380, h: 140, phase: 4.4 },
    { x: 700, y: 520, w: 360, h: 120, phase: 5.6 },
  ];

  return (
    <AbsoluteFill>
      {wisps.map((w) => (
        <div
          key={w.phase}
          style={{
            position: "absolute",
            left: w.x - w.w / 2 + 40 * Math.sin(frame / 45 + w.phase),
            top: w.y - w.h / 2 + 10 * Math.cos(frame / 60 + w.phase),
            width: w.w,
            height: w.h,
            borderRadius: "50%",
            backgroundColor: "rgba(154, 164, 199, 0.16)",
            filter: "blur(36px)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const CheckIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M5 12.5 L10 17.5 L19 7"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WhyInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <Track name="Points">
        {/* ── 1. Infinitely many zeros ─────────────────────────────── */}
        <Interactive.Div
          name="Point 1"
          from={2.8 * fps}
          durationInFrames={7 * fps}
          style={{
            position: "absolute",
            inset: 0,
            opacity: interpolate(frame, [9.5 * fps, 9.8 * fps], [1, 0], CLAMP),
          }}
        >
          <Interactive.Div
            name="Critical line"
            style={{
              position: "absolute",
              left: 958,
              bottom: 0,
              width: 4,
              height: interpolate(frame, [2.9 * fps, 3.9 * fps], [0, 760], {
                ...CLAMP,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              background:
                "linear-gradient(to top, rgba(245,197,66,0.9) 0%, rgba(245,197,66,0.9) 55%, rgba(245,197,66,0) 100%)",
            }}
          />
          <RisingZeros />
          <Interactive.Div
            name="Fog"
            style={{
              position: "absolute",
              inset: 0,
              opacity: interpolate(
                frame,
                [3.2 * fps, 4.4 * fps],
                [0, 1],
                CLAMP,
              ),
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 320,
                height: 320,
                background:
                  "linear-gradient(to bottom, #0b1020 0%, #0b1020 10%, rgba(11,16,32,0) 100%)",
              }}
            />
            <FogWisps />
          </Interactive.Div>
          <Interactive.Div
            name="Point 1 title"
            style={{
              position: "absolute",
              left: 140,
              right: 140,
              top: 236,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 28,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 60,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [3.1 * fps, 3.5 * fps],
                [0, 1],
                CLAMP,
              ),
              translate: interpolate(
                frame,
                [3.1 * fps, 3.8 * fps],
                ["0px 30px", "0px 0px"],
                { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
              ),
            }}
          >
            <span
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                backgroundColor: "#f5c542",
                color: "#0b1020",
                fontFamily: "Unbounded",
                fontWeight: 800,
                fontSize: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              1
            </span>
            Нулей бесконечно много
          </Interactive.Div>
          <Interactive.Div
            name="Question in fog"
            style={{
              position: "absolute",
              left: 760,
              width: 400,
              top: 330,
              textAlign: "center",
              fontFamily: "Unbounded",
              fontWeight: 800,
              fontSize: 170,
              lineHeight: 1,
              color: "#ffffff",
              textShadow: "0 0 50px rgba(154, 164, 199, 0.8)",
              opacity: interpolate(
                frame,
                [4.2 * fps, 4.8 * fps],
                [0, 0.92],
                CLAMP,
              ),
              scale: interpolate(frame, [4.2 * fps, 5 * fps], [0.6, 1], {
                ...CLAMP,
                easing: Easing.spring({ damping: 14 }),
                output: "perceptual-scale",
              }),
            }}
          >
            ?
          </Interactive.Div>
          <Interactive.Div
            name="Hidden exception"
            style={{
              position: "absolute",
              left: 300,
              width: 620,
              top: 530,
              height: 80,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 26,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 48,
              color: "#ff6b6b",
              opacity:
                interpolate(frame, [5.8 * fps, 6.3 * fps], [0, 1], CLAMP) *
                interpolate(Math.sin(frame / 9), [-1, 1], [0.6, 1], CLAMP),
            }}
          >
            исключение?
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                border: "3px dashed #ff6b6b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#ff6b6b",
                  boxShadow: "0 0 18px 4px rgba(255, 107, 107, 0.5)",
                }}
              />
            </span>
          </Interactive.Div>
          <Interactive.Div
            name="Verified height"
            style={{
              position: "absolute",
              left: 780,
              width: 360,
              top: 700,
              height: 0,
              borderTop: "4px dashed #7ee0a1",
              opacity: interpolate(
                frame,
                [7.4 * fps, 7.8 * fps],
                [0, 1],
                CLAMP,
              ),
            }}
          />
          <Interactive.Div
            name="Verified bracket"
            style={{
              position: "absolute",
              left: 996,
              width: 22,
              bottom: 100,
              height: interpolate(frame, [7.4 * fps, 8 * fps], [0, 280], {
                ...CLAMP,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              borderRight: "4px solid #7ee0a1",
              borderTop: "4px solid #7ee0a1",
              borderBottom: "4px solid #7ee0a1",
              boxSizing: "border-box",
              opacity: interpolate(
                frame,
                [7.4 * fps, 7.6 * fps],
                [0, 1],
                CLAMP,
              ),
            }}
          />
          <Interactive.Div
            name="Verified caption"
            style={{
              position: "absolute",
              left: 1060,
              top: 760,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 52,
              lineHeight: 1.3,
              color: "#7ee0a1",
              opacity: interpolate(
                frame,
                [7.6 * fps, 8.1 * fps],
                [0, 1],
                CLAMP,
              ),
              translate: interpolate(
                frame,
                [7.6 * fps, 8.3 * fps],
                ["24px 0px", "0px 0px"],
                { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
              ),
            }}
          >
            проверено —
            <br />
            <span style={{ fontWeight: 500, fontSize: 48, color: "#9aa4c7" }}>
              лишь конечная часть
            </span>
          </Interactive.Div>
        </Interactive.Div>

        {/* ── 2. Checks can deceive ────────────────────────────────── */}
        <Interactive.Div
          name="Point 2"
          from={9.8 * fps}
          durationInFrames={13.3 * fps}
          style={{
            position: "absolute",
            inset: 0,
            opacity: interpolate(
              frame,
              [22.8 * fps, 23.1 * fps],
              [1, 0],
              CLAMP,
            ),
          }}
        >
          <Interactive.Div
            name="Point 2 title"
            style={{
              position: "absolute",
              left: 140,
              right: 140,
              top: 236,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 28,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 60,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [9.8 * fps, 10.2 * fps],
                [0, 1],
                CLAMP,
              ),
              translate: interpolate(
                frame,
                [9.8 * fps, 10.5 * fps],
                ["0px 30px", "0px 0px"],
                { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
              ),
            }}
          >
            <span
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                backgroundColor: "#f5c542",
                color: "#0b1020",
                fontFamily: "Unbounded",
                fontWeight: 800,
                fontSize: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              2
            </span>
            Проверки обманывают
          </Interactive.Div>
          <Interactive.Div
            name="Claim"
            style={{
              position: "absolute",
              left: 140,
              right: 140,
              top: 336,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
              translate: interpolate(
                frame,
                [19.2 * fps, 19.9 * fps],
                ["0px 170px", "0px 0px"],
                { ...CLAMP, easing: Easing.inOut(Easing.cubic) },
              ),
            }}
          >
            <Tex
              name="Pi below li"
              tex={String.raw`\textcolor{#f5c542}{\pi(x)} < \operatorname{li}(x)`}
              style={{
                fontSize: 104,
                color: "#ffffff",
                opacity: interpolate(
                  frame,
                  [12.7 * fps, 13.2 * fps],
                  [0, 1],
                  CLAMP,
                ),
                translate: interpolate(
                  frame,
                  [12.7 * fps, 13.4 * fps],
                  ["0px 30px", "0px 0px"],
                  { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
                ),
              }}
            />
            <Interactive.Div
              name="Checked up to 10^19"
              style={{
                height: 72,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 16,
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 52,
                color: "#9aa4c7",
                opacity: interpolate(
                  frame,
                  [13.2 * fps, 13.7 * fps],
                  [0, 1],
                  CLAMP,
                ),
              }}
            >
              <span>верно на всех проверенных</span>
              <Tex
                name="x"
                tex="x"
                style={{ fontSize: 60, color: "#ffffff" }}
              />
              <span>
                (до 10
                <sup style={{ fontSize: 34, lineHeight: 0 }}>19</sup>)
              </span>
              <span
                style={{
                  marginLeft: 12,
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "rgba(126, 224, 161, 0.16)",
                  border: "3px solid #7ee0a1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckIcon size={44} color="#7ee0a1" />
              </span>
            </Interactive.Div>
          </Interactive.Div>
          <Interactive.Div
            name="Littlewood card"
            style={{
              position: "absolute",
              left: 240,
              right: 240,
              top: 622,
              boxSizing: "border-box",
              padding: "30px 48px",
              backgroundColor: "#151c33",
              border: "3px solid #26304f",
              borderLeft: "10px solid #ff6b6b",
              borderRadius: 30,
              fontFamily: "Inter",
              opacity: interpolate(
                frame,
                [19.5 * fps, 20 * fps],
                [0, 1],
                CLAMP,
              ),
              translate: interpolate(
                frame,
                [19.5 * fps, 20.2 * fps],
                ["0px 36px", "0px 0px"],
                { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
              ),
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 52, color: "#ffffff" }}>
              <span style={{ color: "#ff6b6b" }}>Литтлвуд, 1914:</span>{" "}
              когда-нибудь нарушится
            </div>
            <div
              style={{
                fontWeight: 500,
                fontSize: 46,
                color: "#9aa4c7",
                marginTop: 8,
              }}
            >
              доказано, но без указания где
            </div>
            <Interactive.Div
              name="Bays-Hudson note"
              style={{
                marginTop: 22,
                paddingTop: 20,
                borderTop: "2px solid #26304f",
                fontWeight: 500,
                fontSize: 40,
                lineHeight: 1.3,
                color: "#9aa4c7",
                opacity: interpolate(
                  frame,
                  [20.1 * fps, 20.6 * fps],
                  [0, 1],
                  CLAMP,
                ),
              }}
            >
              нарушение есть около{" "}
              <span style={{ fontFamily: "JetBrains Mono", color: "#ffffff" }}>
                1,4·10
                <sup style={{ fontSize: 26, lineHeight: 0 }}>316</sup>
              </span>{" "}
              (Бейс и Хадсон, 2000);
              <br />
              первое ли оно — неизвестно
            </Interactive.Div>
          </Interactive.Div>
        </Interactive.Div>

        {/* ── 3. The series fails in the strip; methods hit a ceiling ── */}
        <Interactive.Div
          name="Point 3"
          from={23.1 * fps}
          durationInFrames={8.1 * fps}
          style={{
            position: "absolute",
            inset: 0,
            opacity: interpolate(
              frame,
              [30.9 * fps, 31.2 * fps],
              [1, 0],
              CLAMP,
            ),
          }}
        >
          <Interactive.Div
            name="Point 3 title"
            style={{
              position: "absolute",
              left: 140,
              right: 140,
              top: 236,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 28,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 60,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [23.1 * fps, 23.5 * fps],
                [0, 1],
                CLAMP,
              ),
              translate: interpolate(
                frame,
                [23.1 * fps, 23.8 * fps],
                ["0px 30px", "0px 0px"],
                { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
              ),
            }}
          >
            <span
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                backgroundColor: "#f5c542",
                color: "#0b1020",
                fontFamily: "Unbounded",
                fontWeight: 800,
                fontSize: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              3
            </span>
            Ряд не работает внутри полосы
          </Interactive.Div>
          <Interactive.Div
            name="Series row"
            style={{
              position: "absolute",
              left: 140,
              right: 140,
              top: 336,
              height: 180,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 64,
              translate: `${interpolate(
                frame,
                [26.4 * fps, 27 * fps],
                [280, 0],
                { ...CLAMP, easing: Easing.inOut(Easing.cubic) },
              )}px ${interpolate(frame, [27.5 * fps, 28.2 * fps], [200, 0], {
                ...CLAMP,
                easing: Easing.inOut(Easing.cubic),
              })}px`,
            }}
          >
            <div style={{ position: "relative" }}>
              <Tex
                name="Zeta series"
                tex={String.raw`1 + \frac{1}{2^s} + \frac{1}{3^s} + \frac{1}{4^s} + \dots`}
                display
                style={{
                  fontSize: 68,
                  color: "#ffffff",
                  opacity: interpolate(
                    frame,
                    [24 * fps, 24.5 * fps],
                    [0, 1],
                    CLAMP,
                  ),
                }}
              />
              <Interactive.Div
                name="Series strike"
                style={{
                  position: "absolute",
                  left: -24,
                  right: -24,
                  top: "50%",
                  height: 8,
                  marginTop: -4,
                  borderRadius: 4,
                  backgroundColor: "#ff6b6b",
                  boxShadow: "0 0 16px rgba(255, 107, 107, 0.5)",
                  rotate: "-7deg",
                  clipPath: `inset(0 ${interpolate(
                    frame,
                    [26.6 * fps, 27.1 * fps],
                    [100, 0],
                    { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
                  )}% 0 0)`,
                }}
              />
            </div>
            <Interactive.Div
              name="Diverges in strip"
              style={{
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 56,
                lineHeight: 1.25,
                color: "#ff6b6b",
                opacity: interpolate(
                  frame,
                  [26.9 * fps, 27.4 * fps],
                  [0, 1],
                  CLAMP,
                ),
                translate: interpolate(
                  frame,
                  [26.9 * fps, 27.6 * fps],
                  ["24px 0px", "0px 0px"],
                  { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
                ),
              }}
            >
              расходится
              <br />
              <span style={{ fontWeight: 500, fontSize: 46, color: "#9aa4c7" }}>
                в критической полосе
              </span>
            </Interactive.Div>
          </Interactive.Div>
          <Interactive.Div
            name="Methods hit a ceiling"
            style={{
              position: "absolute",
              left: 140,
              right: 140,
              top: 572,
              textAlign: "center",
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 56,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [28.9 * fps, 29.3 * fps],
                [0, 1],
                CLAMP,
              ),
              translate: interpolate(
                frame,
                [28.9 * fps, 29.6 * fps],
                ["0px 24px", "0px 0px"],
                { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
              ),
            }}
          >
            Методы упираются в потолок
          </Interactive.Div>
          <Interactive.Div
            name="Proven share chart"
            style={{
              position: "absolute",
              inset: 0,
              opacity: interpolate(
                frame,
                [27.9 * fps, 28.3 * fps],
                [0, 1],
                CLAMP,
              ),
            }}
          >
            <Interactive.Div
              name="Bar label"
              style={{
                position: "absolute",
                left: 140,
                top: 676,
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 44,
                color: "#9aa4c7",
              }}
            >
              доказанная доля нулей на прямой
            </Interactive.Div>
            <Interactive.Div
              name="Bar track"
              style={{
                position: "absolute",
                left: 140,
                top: 752,
                width: 1640,
                height: 90,
                boxSizing: "border-box",
                backgroundColor: "#151c33",
                border: "3px solid #26304f",
                borderRadius: 22,
                overflow: "hidden",
              }}
            >
              <Interactive.Div
                name="Bar fill"
                style={{
                  height: "100%",
                  width: `${interpolate(
                    frame,
                    [28.3 * fps, 29.5 * fps],
                    [0, 41.7],
                    { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
                  )}%`,
                  background:
                    "linear-gradient(to right, rgba(90,200,250,0.55), #5ac8fa)",
                }}
              />
            </Interactive.Div>
            <Interactive.Div
              name="Hypothesis mark"
              style={{
                position: "absolute",
                left: 1776,
                top: 732,
                width: 0,
                height: 130,
                borderLeft: "5px dashed #f5c542",
                opacity: interpolate(
                  frame,
                  [28.3 * fps, 28.7 * fps],
                  [0, 1],
                  CLAMP,
                ),
              }}
            />
            <Interactive.Div
              name="Hypothesis label"
              style={{
                position: "absolute",
                right: 140,
                top: 676,
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 44,
                color: "#f5c542",
                opacity: interpolate(
                  frame,
                  [28.3 * fps, 28.7 * fps],
                  [0, 1],
                  CLAMP,
                ),
              }}
            >
              гипотеза Римана ·{" "}
              <span style={{ fontFamily: "JetBrains Mono" }}>100</span>
              {"\u202f%"}
            </Interactive.Div>
            <Interactive.Div
              name="At least 41.7%"
              style={{
                position: "absolute",
                right: 1920 - 824,
                top: 862,
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 46,
                color: "#ffffff",
                opacity: interpolate(
                  frame,
                  [29.2 * fps, 29.6 * fps],
                  [0, 1],
                  CLAMP,
                ),
              }}
            >
              не меньше{" "}
              <span style={{ fontFamily: "JetBrains Mono", color: "#5ac8fa" }}>
                41,7
              </span>
              <span style={{ color: "#5ac8fa" }}>{"\u202f%"}</span>
            </Interactive.Div>
            <Interactive.Div
              name="Ceiling"
              style={{
                position: "absolute",
                left: 862,
                top: 724,
                width: 0,
                height: 146,
                borderLeft: "5px dashed #ff6b6b",
                opacity: interpolate(
                  frame,
                  [29.6 * fps, 30 * fps],
                  [0, 1],
                  CLAMP,
                ),
                translate: interpolate(
                  frame,
                  [29.6 * fps, 30.2 * fps],
                  ["0px -30px", "0px 0px"],
                  { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
                ),
              }}
            />
            <Interactive.Div
              name="Ceiling label"
              style={{
                position: "absolute",
                left: 890,
                top: 862,
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 46,
                color: "#ff6b6b",
                opacity: interpolate(
                  frame,
                  [29.8 * fps, 30.2 * fps],
                  [0, 1],
                  CLAMP,
                ),
              }}
            >
              потолок
            </Interactive.Div>
          </Interactive.Div>
        </Interactive.Div>

        {/* ── 4. Analogues are proven; the operator for ζ is missing ── */}
        <Interactive.Div
          name="Point 4"
          from={31.2 * fps}
          durationInFrames={12.3 * fps}
          style={{ position: "absolute", inset: 0 }}
        >
          <Interactive.Div
            name="Point 4 title"
            style={{
              position: "absolute",
              left: 140,
              right: 140,
              top: 236,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 28,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 60,
              color: "#ffffff",
              opacity: interpolate(
                frame,
                [31.2 * fps, 31.6 * fps],
                [0, 1],
                CLAMP,
              ),
              translate: interpolate(
                frame,
                [31.2 * fps, 31.9 * fps],
                ["0px 30px", "0px 0px"],
                { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
              ),
            }}
          >
            <span
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                backgroundColor: "#f5c542",
                color: "#0b1020",
                fontFamily: "Unbounded",
                fontWeight: 800,
                fontSize: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              4
            </span>
            Аналоги уже доказаны
          </Interactive.Div>
          <Interactive.Div
            name="Finite fields caption"
            style={{
              position: "absolute",
              left: 140,
              right: 140,
              top: 340,
              textAlign: "center",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 48,
              color: "#9aa4c7",
              opacity: interpolate(
                frame,
                [32.1 * fps, 32.6 * fps],
                [0, 1],
                CLAMP,
              ),
              translate: interpolate(
                frame,
                [34.9 * fps, 35.5 * fps],
                ["0px 250px", "0px 0px"],
                { ...CLAMP, easing: Easing.inOut(Easing.cubic) },
              ),
              scale: interpolate(frame, [34.9 * fps, 35.5 * fps], [1.25, 1], {
                ...CLAMP,
                easing: Easing.inOut(Easing.cubic),
                output: "perceptual-scale",
              }),
            }}
          >
            гипотеза для аналогов над конечными полями
          </Interactive.Div>
          <Interactive.Div
            name="Weil card"
            style={{
              position: "absolute",
              left: 140,
              top: 440,
              width: 500,
              height: 440,
              boxSizing: "border-box",
              backgroundColor: "#151c33",
              border: "3px solid #7ee0a1",
              borderRadius: 30,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 40,
              fontFamily: "Inter",
              opacity: interpolate(
                frame,
                [35.4 * fps, 35.8 * fps],
                [0, 1],
                CLAMP,
              ),
              translate: interpolate(
                frame,
                [35.4 * fps, 36.1 * fps],
                ["0px 40px", "0px 0px"],
                { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
              ),
            }}
          >
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                backgroundColor: "rgba(126, 224, 161, 0.14)",
                border: "4px solid #7ee0a1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckIcon size={76} color="#7ee0a1" />
            </div>
            <div
              style={{
                marginTop: 28,
                fontWeight: 600,
                fontSize: 52,
                color: "#ffffff",
              }}
            >
              Андре Вейль
            </div>
            <div
              style={{
                marginTop: 6,
                fontFamily: "JetBrains Mono",
                fontWeight: 700,
                fontSize: 52,
                color: "#9aa4c7",
              }}
            >
              1948
            </div>
            <Interactive.Div
              name="Weil operator found"
              style={{
                marginTop: 22,
                fontWeight: 600,
                fontSize: 44,
                color: "#7ee0a1",
                opacity: interpolate(
                  frame,
                  [36.9 * fps, 37.3 * fps],
                  [0, 1],
                  CLAMP,
                ),
              }}
            >
              оператор найден
            </Interactive.Div>
          </Interactive.Div>
          <Interactive.Div
            name="Deligne card"
            style={{
              position: "absolute",
              left: 710,
              top: 440,
              width: 500,
              height: 440,
              boxSizing: "border-box",
              backgroundColor: "#151c33",
              border: "3px solid #7ee0a1",
              borderRadius: 30,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 40,
              fontFamily: "Inter",
              opacity: interpolate(
                frame,
                [35.9 * fps, 36.3 * fps],
                [0, 1],
                CLAMP,
              ),
              translate: interpolate(
                frame,
                [35.9 * fps, 36.6 * fps],
                ["0px 40px", "0px 0px"],
                { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
              ),
            }}
          >
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                backgroundColor: "rgba(126, 224, 161, 0.14)",
                border: "4px solid #7ee0a1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckIcon size={76} color="#7ee0a1" />
            </div>
            <div
              style={{
                marginTop: 28,
                fontWeight: 600,
                fontSize: 52,
                color: "#ffffff",
              }}
            >
              Пьер Делинь
            </div>
            <div
              style={{
                marginTop: 6,
                fontFamily: "JetBrains Mono",
                fontWeight: 700,
                fontSize: 52,
                color: "#9aa4c7",
              }}
            >
              1974
            </div>
            <Interactive.Div
              name="Deligne operator found"
              style={{
                marginTop: 22,
                fontWeight: 600,
                fontSize: 44,
                color: "#7ee0a1",
                opacity: interpolate(
                  frame,
                  [37.1 * fps, 37.5 * fps],
                  [0, 1],
                  CLAMP,
                ),
              }}
            >
              оператор найден
            </Interactive.Div>
          </Interactive.Div>
          <Interactive.Div
            name="Zeta card"
            style={{
              position: "absolute",
              left: 1280,
              top: 440,
              width: 500,
              height: 440,
              boxSizing: "border-box",
              backgroundColor: "#151c33",
              border: "3px solid #5ac8fa",
              borderRadius: 30,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 40,
              fontFamily: "Inter",
              boxShadow: "0 0 60px rgba(90, 200, 250, 0.18)",
              opacity: interpolate(
                frame,
                [38.4 * fps, 38.8 * fps],
                [0, 1],
                CLAMP,
              ),
              translate: interpolate(
                frame,
                [38.4 * fps, 39.1 * fps],
                ["0px 40px", "0px 0px"],
                { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) },
              ),
            }}
          >
            <Interactive.Div
              name="Operator question"
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                boxSizing: "border-box",
                backgroundColor: "rgba(90, 200, 250, 0.14)",
                border: "4px solid #5ac8fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Unbounded",
                fontWeight: 800,
                fontSize: 64,
                color: "#5ac8fa",
                scale: interpolate(
                  frame,
                  [40.1 * fps, 40.5 * fps, 41.1 * fps],
                  [1, 1.25, 1],
                  {
                    ...CLAMP,
                    easing: Easing.inOut(Easing.cubic),
                    output: "perceptual-scale",
                  },
                ),
              }}
            >
              ?
            </Interactive.Div>
            <Tex
              name="Zeta of s"
              tex={String.raw`\zeta(s)`}
              style={{
                marginTop: 18,
                fontSize: 76,
                lineHeight: 1.1,
                color: "#5ac8fa",
              }}
            />
            <div
              style={{
                marginTop: 18,
                fontWeight: 600,
                fontSize: 44,
                lineHeight: 1.25,
                color: "#ffffff",
                textAlign: "center",
              }}
            >
              нужный оператор
              <br />
              <span style={{ color: "#ff6b6b" }}>не найден</span>
            </div>
          </Interactive.Div>
        </Interactive.Div>
      </Track>

      <Interactive.Div
        name="Heading"
        from={0.5 * fps}
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          top: 96,
          textAlign: "center",
          fontFamily: "Unbounded",
          fontWeight: 800,
          fontSize: 68,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          color: "#ffffff",
          opacity: interpolate(frame, [0.5 * fps, 1 * fps], [0, 1], CLAMP),
          translate: interpolate(
            frame,
            [2.6 * fps, 3.3 * fps],
            ["0px 360px", "0px 0px"],
            { ...CLAMP, easing: Easing.inOut(Easing.cubic) },
          ),
          scale: interpolate(frame, [0.5 * fps, 1.6 * fps], [0.88, 1], {
            ...CLAMP,
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
        }}
      >
        Почему её до сих пор не доказали?
      </Interactive.Div>

      <Track name="Voiceover">
        <Audio
          name="why-1"
          src={staticFile("voiceover/why-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="why-2"
          src={staticFile("voiceover/why-2.mp3")}
          from={9.7 * fps}
        />
        <Audio
          name="why-3"
          src={staticFile("voiceover/why-3.mp3")}
          from={23.1 * fps}
        />
        <Audio
          name="why-4"
          src={staticFile("voiceover/why-4.mp3")}
          from={31.1 * fps}
        />
      </Track>
    </>
  );
};

export const Why = Interactive.create({
  Component: WhyInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
