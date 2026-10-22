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
import zeros from "../data/zeros.json";
import "../fonts";

// Backdrop: the critical line with the first nontrivial zeros drifting up it, spaced by
// their true heights. One template, not individually edited elements.
const DriftingZeros = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const pxPerUnit = 9;
  const drift = frame * 0.9;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 958,
          top: 0,
          width: 4,
          height,
          background:
            "linear-gradient(to top, rgba(245,197,66,0) 0%, rgba(245,197,66,0.28) 40%, rgba(245,197,66,0) 100%)",
          opacity: interpolate(frame, [0, 20], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      />
      {zeros.slice(0, 40).map((t, i) => {
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
              opacity:
                0.35 *
                interpolate(frame, [i * 2, i * 2 + 20], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const IntroInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <DriftingZeros />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Interactive.Div
          name="Kicker"
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#f5c542",
            opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Теория чисел
        </Interactive.Div>
        <Interactive.Div
          name="Headline"
          style={{
            fontFamily: "Unbounded",
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 1.1,
            color: "#ffffff",
            marginTop: 24,
            textShadow: "0 0 60px rgba(11, 16, 32, 0.9)",
            opacity: interpolate(frame, [0.5 * fps, 1.1 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [0.5 * fps, 1.7 * fps], [0.85, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
          }}
        >
          Гипотеза Римана
        </Interactive.Div>
        <Interactive.Div
          name="Subtitle"
          from={2.3 * fps}
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 60,
            color: "#9aa4c7",
            marginTop: 36,
            opacity: interpolate(frame, [2.3 * fps, 3 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [2.3 * fps, 3.1 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          Главная нерешённая задача математики
        </Interactive.Div>
        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 64,
            height: 96,
            alignItems: "center",
          }}
        >
          <Interactive.Div
            name="Open since"
            from={4.9 * fps}
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 48,
              color: "#f5c542",
              border: "3px solid #f5c542",
              borderRadius: 24,
              padding: "12px 36px",
              opacity: interpolate(frame, [4.9 * fps, 5.4 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(frame, [4.9 * fps, 5.5 * fps], [0.7, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({ damping: 14 }),
                output: "perceptual-scale",
              }),
            }}
          >
            открыта с 1859 года
          </Interactive.Div>
          <Interactive.Div
            name="Prize"
            from={7.4 * fps}
            style={{
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              fontSize: 52,
              color: "#0b1020",
              backgroundColor: "#f5c542",
              borderRadius: 24,
              padding: "12px 36px",
              opacity: interpolate(frame, [7.4 * fps, 7.9 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(frame, [7.4 * fps, 8 * fps], [0.7, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({ damping: 14 }),
                output: "perceptual-scale",
              }),
            }}
          >
            приз 1 000 000 $
          </Interactive.Div>
        </div>
      </AbsoluteFill>
      <Track name="Voiceover">
        <Audio
          name="intro-1"
          src={staticFile("voiceover/intro-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="intro-2"
          src={staticFile("voiceover/intro-2.mp3")}
          from={2.1 * fps}
        />
      </Track>
    </>
  );
};

export const Intro = Interactive.create({
  Component: IntroInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
