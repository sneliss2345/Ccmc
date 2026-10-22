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
import zeros from "../data/zeros.json";
import "../fonts";

// Timeline geometry: years map linearly onto x, so the gaps between the events are true
// to scale (1859 → 326, 1900 → 650, 2000 → 1440).
const RAIL_Y = 450;
const yearToX = (year: number) => 326 + (year - 1859) * 7.9;
const DECADES = Array.from({ length: 18 }, (_, i) => 1850 + i * 10);

// Decade ticks along the rail. Template-like, so generated rather than edited one by one.
const DecadeTicks = () => {
  return (
    <>
      {DECADES.map((year) => {
        const major = year % 50 === 0;
        return (
          <line
            key={year}
            x1={yearToX(year)}
            x2={yearToX(year)}
            y1={RAIL_Y - (major ? 18 : 11)}
            y2={RAIL_Y + (major ? 18 : 11)}
            stroke="#6b759a"
            strokeWidth={major ? 4 : 3}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
};

// Backdrop of the last line: the critical line with the first nontrivial zeros drifting up
// it (the same picture the video opened with). One template, not individually edited.
// It is masked out behind the title block so that it never runs through the text.
const CriticalLineBackdrop = ({ start }: { readonly start: number }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const pxPerUnit = 9;
  const drift = Math.max(0, frame - start) * 0.9;

  return (
    <AbsoluteFill
      style={{
        maskImage:
          "linear-gradient(to bottom, #000 0px, #000 140px, transparent 225px, transparent 830px, #000 915px, #000 1080px)",
        opacity: interpolate(frame, [start, start + 30], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 958,
          top: 0,
          width: 4,
          height,
          background:
            "linear-gradient(to top, rgba(245,197,66,0) 0%, rgba(245,197,66,0.4) 10%, rgba(245,197,66,0.4) 90%, rgba(245,197,66,0) 100%)",
        }}
      />
      {zeros.slice(0, 40).map((t) => {
        const y = height + 40 - ((t * pxPerUnit + drift) % (height + 80));
        return (
          <div
            key={t}
            style={{
              position: "absolute",
              left: 960 - 7,
              top: y - 7,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#5ac8fa",
              boxShadow: "0 0 18px 4px rgba(90, 200, 250, 0.45)",
              opacity: 0.35,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const FinaleInner = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <>
      <Interactive.Div
        name="Timeline"
        durationInFrames={13.4 * fps}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          opacity: interpolate(frame, [12.9 * fps, 13.3 * fps], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [12.9 * fps, 13.3 * fps],
            ["0px 0px", "0px -40px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            },
          ),
        }}
      >
        <Interactive.Svg
          name="Timeline rail"
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
            <linearGradient
              id="finale-rail-fade"
              gradientUnits="userSpaceOnUse"
              x1={140}
              x2={1780}
              y1={0}
              y2={0}
            >
              <stop offset="0" stopColor="#26304f" stopOpacity={0} />
              <stop offset="0.08" stopColor="#26304f" stopOpacity={1} />
              <stop offset="0.92" stopColor="#26304f" stopOpacity={1} />
              <stop offset="1" stopColor="#26304f" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="finale-today-fade"
              gradientUnits="userSpaceOnUse"
              x1={1440}
              x2={1740}
              y1={0}
              y2={0}
            >
              <stop offset="0" stopColor="#f5c542" stopOpacity={0.9} />
              <stop offset="1" stopColor="#f5c542" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Interactive.Line
            name="Rail"
            x1={140}
            x2={1780}
            y1={RAIL_Y}
            y2={RAIL_Y}
            style={{
              stroke: "url(#finale-rail-fade)",
              strokeWidth: 6,
            }}
          />
          <DecadeTicks />
          <Interactive.Line
            name="Progress"
            x1={326}
            x2={interpolate(
              frame,
              [0.6 * fps, 1.2 * fps, 6.3 * fps, 7 * fps],
              [326, 650, 650, 1440],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.inOut(Easing.cubic),
              },
            )}
            y1={RAIL_Y}
            y2={RAIL_Y}
            style={{
              stroke: "#f5c542",
              strokeWidth: 8,
              strokeLinecap: "round",
            }}
          />
          <Interactive.Line
            name="Until today"
            from={7 * fps}
            x1={1440}
            x2={interpolate(frame, [7 * fps, 8 * fps], [1440, 1740], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}
            y1={RAIL_Y}
            y2={RAIL_Y}
            style={{
              stroke: "url(#finale-today-fade)",
              strokeWidth: 8,
              strokeDasharray: "18 14",
            }}
          />
          <Interactive.Circle
            name="Node 1859"
            cx={326}
            cy={RAIL_Y}
            r={20}
            style={{
              fill: "#f5c542",
              stroke: "#0b1020",
              strokeWidth: 6,
              filter: "drop-shadow(0 0 14px rgba(245, 197, 66, 0.7))",
            }}
          />
          <Interactive.Circle
            name="Node 1900"
            from={1 * fps}
            cx={650}
            cy={RAIL_Y}
            r={interpolate(frame, [1 * fps, 1.6 * fps], [0, 20], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 14 }),
            })}
            style={{
              fill: "#f5c542",
              stroke: "#0b1020",
              strokeWidth: 6,
              filter: "drop-shadow(0 0 14px rgba(245, 197, 66, 0.7))",
            }}
          />
          <Interactive.Circle
            name="Node 2000"
            from={6.8 * fps}
            cx={1440}
            cy={RAIL_Y}
            r={interpolate(frame, [6.8 * fps, 7.4 * fps], [0, 20], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 14 }),
            })}
            style={{
              fill: "#f5c542",
              stroke: "#0b1020",
              strokeWidth: 6,
              filter: "drop-shadow(0 0 14px rgba(245, 197, 66, 0.7))",
            }}
          />
        </Interactive.Svg>

        {/* 1859: Riemann's paper (already on screen when the scene opens). */}
        <Interactive.Div
          name="Year 1859"
          style={{
            position: "absolute",
            left: 26,
            top: 316,
            width: 600,
            textAlign: "center",
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 96,
            lineHeight: 1,
            color: "#ffffff",
          }}
        >
          1859
        </Interactive.Div>
        <Interactive.Div
          name="Riemann"
          style={{
            position: "absolute",
            left: 26,
            top: 506,
            width: 600,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 56,
            lineHeight: 1.2,
            color: "#ffffff",
          }}
        >
          Риман
        </Interactive.Div>
        <Interactive.Div
          name="Hypothesis"
          style={{
            position: "absolute",
            left: 26,
            top: 580,
            width: 600,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 46,
            lineHeight: 1.2,
            color: "#9aa4c7",
          }}
        >
          гипотеза
        </Interactive.Div>

        {/* 1900: Hilbert's problems, at «тысяча девятисотом». */}
        <Interactive.Div
          name="Year 1900"
          from={1 * fps}
          style={{
            position: "absolute",
            left: 350,
            top: 316,
            width: 600,
            textAlign: "center",
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 96,
            lineHeight: 1,
            color: "#ffffff",
            opacity: interpolate(frame, [1 * fps, 1.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [1 * fps, 1.8 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          1900
        </Interactive.Div>
        <Interactive.Div
          name="Hilbert"
          from={1.2 * fps}
          style={{
            position: "absolute",
            left: 350,
            top: 506,
            width: 600,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 56,
            lineHeight: 1.2,
            color: "#ffffff",
            opacity: interpolate(frame, [1.2 * fps, 1.7 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [1.2 * fps, 2 * fps],
              ["0px -24px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          Гильберт
        </Interactive.Div>
        <Interactive.Div
          name="Eighth problem"
          from={1.4 * fps}
          style={{
            position: "absolute",
            left: 350,
            top: 580,
            width: 600,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 46,
            lineHeight: 1.2,
            color: "#9aa4c7",
            opacity: interpolate(frame, [1.4 * fps, 1.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [1.4 * fps, 2.2 * fps],
              ["0px -24px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          8-я проблема
        </Interactive.Div>

        {/* 2000: the Clay prize, at «двухтысячном»; the prize lights up at «миллион». */}
        <Interactive.Div
          name="Year 2000"
          from={6.8 * fps}
          style={{
            position: "absolute",
            left: 1140,
            top: 316,
            width: 600,
            textAlign: "center",
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 96,
            lineHeight: 1,
            color: "#ffffff",
            opacity: interpolate(frame, [6.8 * fps, 7.3 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [6.8 * fps, 7.6 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          2000
        </Interactive.Div>
        <Interactive.Div
          name="Clay Institute"
          from={7.4 * fps}
          style={{
            position: "absolute",
            left: 1140,
            top: 506,
            width: 600,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 52,
            lineHeight: 1.2,
            color: "#ffffff",
            opacity: interpolate(frame, [7.4 * fps, 7.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [7.4 * fps, 8.2 * fps],
              ["0px -24px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          Математический
          <br />
          институт Клэя
        </Interactive.Div>
        <div
          style={{
            position: "absolute",
            left: 1140,
            top: 660,
            width: 600,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Interactive.Div
            name="Prize"
            from={8 * fps}
            style={{
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              fontSize: 60,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              border: "3px solid #f5c542",
              borderRadius: 24,
              padding: "10px 34px",
              color: interpolateColors(
                frame,
                [11.5 * fps, 11.8 * fps],
                ["#f5c542", "#0b1020"],
              ),
              backgroundColor: interpolateColors(
                frame,
                [11.5 * fps, 11.8 * fps],
                ["rgba(245, 197, 66, 0)", "rgba(245, 197, 66, 1)"],
              ),
              boxShadow: `0 0 ${interpolate(
                frame,
                [11.5 * fps, 11.8 * fps],
                [0, 48],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              )}px rgba(245, 197, 66, 0.55)`,
              opacity: interpolate(frame, [8 * fps, 8.5 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(
                frame,
                [8 * fps, 8.6 * fps, 11.5 * fps, 11.8 * fps, 12.2 * fps],
                [0.7, 1, 1, 1.12, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.inOut(Easing.cubic),
                  output: "perceptual-scale",
                },
              ),
            }}
          >
            {"1\u202f000\u202f000\u202f$"}
          </Interactive.Div>
        </div>
      </Interactive.Div>

      {/* Final title: the open question, from «Лежат ли все нетривиальные нули…». */}
      <CriticalLineBackdrop start={13.2 * fps} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 250,
          width: 1920,
          height: 260,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Tex
          name="Re s = 1/2 ?"
          from={13.2 * fps}
          tex={String.raw`\operatorname{Re} s = \tfrac12\ ?`}
          display
          style={{
            fontSize: 200,
            color: "#f5c542",
            opacity: interpolate(frame, [13.2 * fps, 13.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [13.2 * fps, 14.4 * fps], [0.85, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
          }}
        />
      </div>
      <Interactive.Div
        name="Riemann hypothesis"
        from={13.8 * fps}
        style={{
          position: "absolute",
          left: 0,
          top: 574,
          width: 1920,
          textAlign: "center",
          fontFamily: "Unbounded",
          fontWeight: 800,
          fontSize: 104,
          lineHeight: 1.15,
          color: "#ffffff",
          opacity: interpolate(frame, [13.8 * fps, 14.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [13.8 * fps, 14.6 * fps],
            ["0px 30px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Гипотеза Римана
      </Interactive.Div>
      <Interactive.Div
        name="No answer yet"
        from={17.3 * fps}
        style={{
          position: "absolute",
          left: 0,
          top: 744,
          width: 1920,
          textAlign: "center",
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 64,
          lineHeight: 1.2,
          color: "#9aa4c7",
          opacity: interpolate(frame, [17.3 * fps, 17.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [17.3 * fps, 18.1 * fps],
            ["0px 30px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        ответа пока нет
      </Interactive.Div>

      {/* Fade to black over the last 0.8 s. */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000000",
          opacity: interpolate(
            frame,
            [durationInFrames - 0.8 * fps, durationInFrames - 1],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />

      <Track name="Voiceover">
        <Audio
          name="finale-1"
          src={staticFile("voiceover/finale-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="finale-2"
          src={staticFile("voiceover/finale-2.mp3")}
          from={6.3 * fps}
        />
        <Audio
          name="finale-3"
          src={staticFile("voiceover/finale-3.mp3")}
          from={12.9 * fps}
        />
      </Track>
    </>
  );
};

export const Finale = Interactive.create({
  Component: FinaleInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
