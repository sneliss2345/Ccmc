import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
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
import "../fonts";
import {
  ChartLines,
  ChartTickLabels,
  curvePath,
  PLOT,
  STAIR_D,
  WAVE_PATHS,
} from "./Music/chart";

const MusicInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Riemann's curve: smooth part only, then +1 zero pair at «волны»,
  // then 3 → 10 → 100 pairs at «три», «десять», «сто».
  const curveD = curvePath(frame, "0", [
    { from: "0", to: "1", range: [7.5 * fps, 8.3 * fps] },
    { from: "1", to: "3", range: [11.5 * fps, 12.2 * fps] },
    { from: "3", to: "10", range: [12.3 * fps, 13 * fps] },
    { from: "10", to: "100", range: [13.1 * fps, 13.8 * fps] },
  ]);

  return (
    <>
      <Interactive.Div
        name="Chart"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          opacity: interpolate(frame, [23.6 * fps, 24.2 * fps], [1, 0.12], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Interactive.Div
          name="Chart axes"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1920,
            height: 1080,
            opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <ChartLines />
          <ChartTickLabels />
        </Interactive.Div>
        <Interactive.Svg
          name="Chart curves"
          width={1920}
          height={1080}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <defs>
            <clipPath id="music-plot-clip">
              <rect
                x={PLOT.left}
                y={PLOT.top - 20}
                width={PLOT.right - PLOT.left + 10}
                height={PLOT.bottom - PLOT.top + 20}
              />
            </clipPath>
          </defs>
          <Interactive.Path
            name="Staircase π(x)"
            d={STAIR_D}
            fill="none"
            stroke="#f5c542"
            strokeWidth={7}
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            style={{
              filter: "drop-shadow(0 0 8px rgba(245, 197, 66, 0.45))",
              opacity: interpolate(frame, [0.6 * fps, 0.8 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              strokeDashoffset: interpolate(
                frame,
                [0.6 * fps, 3.4 * fps],
                [1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.inOut(Easing.cubic),
                },
              ),
            }}
          />
          <g clipPath="url(#music-plot-clip)">
            <Interactive.Path
              name="Riemann curve"
              d={curveD}
              fill="none"
              stroke="#5ac8fa"
              strokeWidth={4.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              style={{
                filter: "drop-shadow(0 0 8px rgba(90, 200, 250, 0.6))",
                opacity: interpolate(frame, [6.4 * fps, 6.6 * fps], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                strokeDashoffset: interpolate(
                  frame,
                  [6.4 * fps, 7.3 * fps],
                  [1, 0],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.inOut(Easing.cubic),
                  },
                ),
              }}
            />
          </g>
        </Interactive.Svg>
        <Interactive.Div
          name="Legend π(x)"
          style={{
            position: "absolute",
            left: 370,
            top: 152,
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "4px 20px",
            borderRadius: 16,
            backgroundColor: "rgba(11, 16, 32, 0.88)",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 44,
            lineHeight: "60px",
            color: "#ffffff",
            opacity: interpolate(
              frame,
              [0.8 * fps, 1.3 * fps, 23.6 * fps, 24 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          <div
            style={{
              width: 56,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#f5c542",
            }}
          />
          π(x)
        </Interactive.Div>
        <Interactive.Div
          name="Legend Riemann curve"
          style={{
            position: "absolute",
            left: 370,
            top: 262,
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "4px 20px",
            borderRadius: 16,
            backgroundColor: "rgba(11, 16, 32, 0.88)",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 44,
            lineHeight: "60px",
            color: "#ffffff",
            opacity: interpolate(
              frame,
              [6.4 * fps, 6.9 * fps, 23.6 * fps, 24 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          <div
            style={{
              width: 56,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#5ac8fa",
            }}
          />
          формула Римана
        </Interactive.Div>
        <Interactive.Div
          name="Zero counter"
          style={{
            position: "absolute",
            right: 190,
            top: 476,
            display: "flex",
            alignItems: "center",
            gap: 28,
            padding: "14px 44px",
            borderRadius: 28,
            backgroundColor: "#151c33",
            border: "3px solid #26304f",
            opacity: interpolate(
              frame,
              [11.5 * fps, 11.8 * fps, 23.6 * fps, 24 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            scale: interpolate(frame, [11.5 * fps, 12 * fps], [0.85, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              output: "perceptual-scale",
            }),
          }}
        >
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 60,
              color: "#9aa4c7",
            }}
          >
            нулей:
          </div>
          <div
            style={{
              width: 210,
              height: 130,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Track name="Zero count">
              <Interactive.Div
                name="Count 3"
                from={11.5 * fps}
                durationInFrames={0.8 * fps}
                style={{
                  fontFamily: "JetBrains Mono",
                  fontWeight: 700,
                  fontSize: 112,
                  lineHeight: "130px",
                  color: "#5ac8fa",
                  transformOrigin: "0% 50%",
                  scale: interpolate(
                    frame,
                    [11.5 * fps, 11.9 * fps],
                    [1.2, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.spring({ damping: 200 }),
                      output: "perceptual-scale",
                    },
                  ),
                }}
              >
                3
              </Interactive.Div>
              <Interactive.Div
                name="Count 10"
                from={12.3 * fps}
                durationInFrames={0.8 * fps}
                style={{
                  fontFamily: "JetBrains Mono",
                  fontWeight: 700,
                  fontSize: 112,
                  lineHeight: "130px",
                  color: "#5ac8fa",
                  transformOrigin: "0% 50%",
                  scale: interpolate(
                    frame,
                    [12.3 * fps, 12.7 * fps],
                    [1.2, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.spring({ damping: 200 }),
                      output: "perceptual-scale",
                    },
                  ),
                }}
              >
                10
              </Interactive.Div>
              <Interactive.Div
                name="Count 100"
                from={13.1 * fps}
                style={{
                  fontFamily: "JetBrains Mono",
                  fontWeight: 700,
                  fontSize: 112,
                  lineHeight: "130px",
                  color: "#5ac8fa",
                  transformOrigin: "0% 50%",
                  scale: interpolate(
                    frame,
                    [13.1 * fps, 13.5 * fps],
                    [1.2, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.spring({ damping: 200 }),
                      output: "perceptual-scale",
                    },
                  ),
                }}
              >
                100
              </Interactive.Div>
            </Track>
          </div>
        </Interactive.Div>
      </Interactive.Div>
      <Track name="Under chart">
        <Interactive.Div
          name="Question"
          from={0.5 * fps}
          durationInFrames={7 * fps}
          style={{
            position: "absolute",
            left: 140,
            top: 786,
            width: 1640,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: interpolate(
              frame,
              [0.6 * fps, 1.1 * fps, 7 * fps, 7.4 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          <Interactive.Div
            name="Question line"
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 64,
              lineHeight: 1.25,
              color: "#ffffff",
              translate: interpolate(
                frame,
                [0.6 * fps, 1.4 * fps],
                ["0px 24px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          >
            Зачем нужны <span style={{ color: "#5ac8fa" }}>нули</span>?
          </Interactive.Div>
          <Interactive.Div
            name="Riemann formula line"
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 52,
              lineHeight: 1.25,
              color: "#9aa4c7",
              opacity: interpolate(frame, [2 * fps, 2.5 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(
                frame,
                [2 * fps, 2.8 * fps],
                ["0px 24px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          >
            Риман: точная формула для{" "}
            <span style={{ color: "#f5c542" }}>π(x)</span>
          </Interactive.Div>
        </Interactive.Div>
        <Interactive.Div
          name="Wave strips"
          from={7.5 * fps}
          durationInFrames={10 * fps}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1920,
            height: 1080,
            opacity: interpolate(
              frame,
              [14.3 * fps, 14.8 * fps, 17.1 * fps, 17.5 * fps],
              [1, 0.45, 0.45, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          <Interactive.Div
            name="Wave strip 1"
            style={{
              position: "absolute",
              left: 140,
              top: 762,
              width: 1610,
              height: 64,
              opacity: interpolate(frame, [7.5 * fps, 7.8 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 160,
                textAlign: "right",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 44,
                lineHeight: "64px",
                color: "#5ac8fa",
              }}
            >
              нуль 1
            </div>
            <svg
              width={1420}
              height={64}
              style={{ position: "absolute", left: 190, top: 0 }}
            >
              <line
                x1={0}
                x2={1420}
                y1={32}
                y2={32}
                stroke="#26304f"
                strokeWidth={3}
              />
              <Interactive.Path
                name="Wave 1"
                d={WAVE_PATHS[0]}
                fill="none"
                stroke="#5ac8fa"
                strokeWidth={3.5}
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1 1"
                style={{
                  strokeDashoffset: interpolate(
                    frame,
                    [7.5 * fps, 8.3 * fps],
                    [1, 0],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.inOut(Easing.cubic),
                    },
                  ),
                }}
              />
            </svg>
          </Interactive.Div>
          <Interactive.Div
            name="Wave strip 2"
            style={{
              position: "absolute",
              left: 140,
              top: 838,
              width: 1610,
              height: 64,
              opacity: interpolate(frame, [9 * fps, 9.3 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 160,
                textAlign: "right",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 44,
                lineHeight: "64px",
                color: "#5ac8fa",
              }}
            >
              нуль 2
            </div>
            <svg
              width={1420}
              height={64}
              style={{ position: "absolute", left: 190, top: 0 }}
            >
              <line
                x1={0}
                x2={1420}
                y1={32}
                y2={32}
                stroke="#26304f"
                strokeWidth={3}
              />
              <Interactive.Path
                name="Wave 2"
                d={WAVE_PATHS[1]}
                fill="none"
                stroke="#5ac8fa"
                strokeWidth={3.5}
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1 1"
                style={{
                  strokeDashoffset: interpolate(
                    frame,
                    [9 * fps, 9.7 * fps],
                    [1, 0],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.inOut(Easing.cubic),
                    },
                  ),
                }}
              />
            </svg>
          </Interactive.Div>
          <Interactive.Div
            name="Wave strip 3"
            style={{
              position: "absolute",
              left: 140,
              top: 914,
              width: 1610,
              height: 64,
              opacity: interpolate(frame, [9.7 * fps, 10 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 160,
                textAlign: "right",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 44,
                lineHeight: "64px",
                color: "#5ac8fa",
              }}
            >
              нуль 3
            </div>
            <svg
              width={1420}
              height={64}
              style={{ position: "absolute", left: 190, top: 0 }}
            >
              <line
                x1={0}
                x2={1420}
                y1={32}
                y2={32}
                stroke="#26304f"
                strokeWidth={3}
              />
              <Interactive.Path
                name="Wave 3"
                d={WAVE_PATHS[2]}
                fill="none"
                stroke="#5ac8fa"
                strokeWidth={3.5}
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1 1"
                style={{
                  strokeDashoffset: interpolate(
                    frame,
                    [9.7 * fps, 10.4 * fps],
                    [1, 0],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.inOut(Easing.cubic),
                    },
                  ),
                }}
              />
            </svg>
          </Interactive.Div>
        </Interactive.Div>
        <Interactive.Div
          name="Notes caption"
          from={17.5 * fps}
          durationInFrames={6.5 * fps}
          style={{
            position: "absolute",
            left: 140,
            top: 800,
            width: 1640,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 60,
            lineHeight: 1.3,
            color: "#ffffff",
            opacity: interpolate(
              frame,
              [17.5 * fps, 18.1 * fps, 23.6 * fps, 24 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            translate: interpolate(
              frame,
              [17.5 * fps, 18.3 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          <span style={{ color: "#5ac8fa" }}>нули</span> — ноты, из которых
          звучат <span style={{ color: "#f5c542" }}>простые числа</span>
        </Interactive.Div>
      </Track>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Interactive.Div
          name="Hypothesis card"
          from={23.6 * fps}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "64px 100px",
            borderRadius: 32,
            backgroundColor: "#151c33",
            border: "3px solid #26304f",
            boxShadow: "0 30px 90px rgba(0, 0, 0, 0.5)",
            opacity: interpolate(frame, [23.7 * fps, 24.2 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [23.7 * fps, 24.5 * fps], [0.92, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              output: "perceptual-scale",
            }),
          }}
        >
          <Interactive.Div
            name="Hypothesis kicker"
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 44,
              letterSpacing: 10,
              textTransform: "uppercase",
              color: "#f5c542",
            }}
          >
            Если гипотеза верна:
          </Interactive.Div>
          <Tex
            name="Error term formula"
            tex={String.raw`\textcolor{#f5c542}{\pi(x)} = \operatorname{Li}(x) + O\!\left(\sqrt{x}\,\ln x\right)`}
            display
            style={{
              fontSize: 88,
              color: "#ffffff",
              marginTop: 48,
              opacity: interpolate(frame, [24.2 * fps, 24.8 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(
                frame,
                [24.2 * fps, 25 * fps],
                ["0px 24px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          />
          <Interactive.Div
            name="Error caption"
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 52,
              color: "#9aa4c7",
              marginTop: 48,
              opacity: interpolate(frame, [25.8 * fps, 26.4 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(
                frame,
                [25.8 * fps, 26.6 * fps],
                ["0px 24px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          >
            отклонение не больше, чем примерно{" "}
            <span
              style={{
                color: interpolateColors(
                  frame,
                  [29.8 * fps, 30.3 * fps],
                  ["#ffffff", "#f5c542"],
                ),
              }}
            >
              √x · ln x
            </span>
          </Interactive.Div>
        </Interactive.Div>
      </AbsoluteFill>
      <Track name="Voiceover">
        <Audio
          name="music-1"
          src={staticFile("voiceover/music-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="music-2"
          src={staticFile("voiceover/music-2.mp3")}
          from={5.8 * fps}
        />
        <Audio
          name="music-3"
          src={staticFile("voiceover/music-3.mp3")}
          from={11 * fps}
        />
        <Audio
          name="music-4"
          src={staticFile("voiceover/music-4.mp3")}
          from={17.5 * fps}
        />
        <Audio
          name="music-5"
          src={staticFile("voiceover/music-5.mp3")}
          from={23.6 * fps}
        />
      </Track>
    </>
  );
};

export const Music = Interactive.create({
  Component: MusicInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
