import { Audio } from "@remotion/media";
import { loadFont as loadPTSerif } from "@remotion/google-fonts/PTSerif";
import {
  Easing,
  Interactive,
  interpolate,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Tex } from "../components/Tex";
import "../fonts";

// Serif face for the facsimile of Riemann's 1859 paper.
loadPTSerif("normal", {
  weights: ["400", "700"],
  subsets: ["latin", "cyrillic"],
});

const PaperInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {/* Line 2: ζ(s) rises from behind the paper as the paper sinks away.
          It sits below the card in the stacking order, so the opaque card hides it until it emerges. */}
      <Interactive.Div
        name="Zeta glow"
        from={10.4 * fps}
        style={{
          position: "absolute",
          left: 510,
          top: 130,
          width: 900,
          height: 600,
          background:
            "radial-gradient(closest-side, rgba(245, 197, 66, 0.2) 0%, rgba(245, 197, 66, 0.06) 55%, rgba(245, 197, 66, 0) 100%)",
          opacity: interpolate(frame, [10.6 * fps, 11.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [10.6 * fps, 17 * fps], [0.85, 1.1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
            output: "perceptual-scale",
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 230,
          width: 1920,
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Tex
          name="Zeta symbol"
          from={10.2 * fps}
          tex={String.raw`\zeta(s)`}
          display
          style={{
            fontSize: 220,
            color: "#f5c542",
            filter: "drop-shadow(0 0 28px rgba(245, 197, 66, 0.55))",
            opacity: interpolate(frame, [10.2 * fps, 10.6 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [10.4 * fps, 11.6 * fps],
              ["0px 260px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.inOut(Easing.cubic),
              },
            ),
            scale: interpolate(frame, [10.4 * fps, 11.6 * fps], [0.7, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
              output: "perceptual-scale",
            }),
          }}
        />
      </div>

      {/* Line 1: the year builds up digit by digit as it is spoken, then moves left. */}
      <Interactive.Div
        name="Year"
        style={{
          position: "absolute",
          left: 140,
          top: 130,
          width: 620,
          height: 640,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Unbounded",
          fontWeight: 800,
          fontSize: 176,
          lineHeight: 1,
          color: "#f5c542",
          textShadow: "0 0 60px rgba(245, 197, 66, 0.35)",
          opacity: interpolate(frame, [9.6 * fps, 9.8 * fps], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [2.5 * fps, 3.2 * fps, 9.6 * fps, 9.9 * fps],
            ["510px 90px", "0px 0px", "0px 0px", "-60px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            },
          ),
          scale: interpolate(frame, [2.5 * fps, 3.2 * fps], [1.25, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
            output: "perceptual-scale",
          }),
        }}
      >
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [0.6 * fps, 0.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [0.6 * fps, 1.1 * fps],
              ["0px 40px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          1
        </span>
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [1 * fps, 1.3 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [1 * fps, 1.5 * fps],
              ["0px 40px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          8
        </span>
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [1.5 * fps, 1.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [1.5 * fps, 2 * fps],
              ["0px 40px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          5
        </span>
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [2 * fps, 2.3 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [2 * fps, 2.5 * fps],
              ["0px 40px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          9
        </span>
      </Interactive.Div>

      {/* Line 1, «опубликовал короткую статью»: the paper slides up.
          Line 2: it glides to the centre and sinks away, uncovering ζ(s). */}
      <Interactive.Div
        name="Paper card"
        from={3.1 * fps}
        style={{
          position: "absolute",
          left: 820,
          top: 130,
          width: 960,
          height: 640,
          boxSizing: "border-box",
          padding: "40px 64px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#151c33",
          border: "3px solid #26304f",
          borderRadius: 28,
          boxShadow: "0 40px 90px rgba(0, 0, 0, 0.45)",
          opacity: interpolate(
            frame,
            [3.1 * fps, 3.6 * fps, 11 * fps, 11.5 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
          translate: interpolate(
            frame,
            [3.1 * fps, 4 * fps, 9.7 * fps, 10.4 * fps, 11.4 * fps],
            ["0px 160px", "0px 0px", "0px 0px", "-340px 90px", "-340px 650px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            },
          ),
        }}
      >
        <Interactive.Div
          name="Journal"
          style={{
            fontFamily: "PT Serif",
            fontWeight: 400,
            fontSize: 40,
            lineHeight: 1.3,
            letterSpacing: 1,
            color: "#9aa4c7",
            textAlign: "center",
          }}
        >
          Monatsberichte der Berliner Akademie
          <br />
          November 1859
        </Interactive.Div>
        <div
          style={{
            width: 200,
            height: 3,
            flexShrink: 0,
            backgroundColor: "#3a4670",
            marginTop: 34,
            marginBottom: 34,
          }}
        />
        <Interactive.Div
          name="German title"
          style={{
            fontFamily: "PT Serif",
            fontWeight: 700,
            fontSize: 62,
            lineHeight: 1.22,
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          Ueber die Anzahl der Primzahlen unter einer gegebenen Grösse.
        </Interactive.Div>
        <div
          style={{
            width: 200,
            height: 3,
            flexShrink: 0,
            backgroundColor: "#3a4670",
            marginTop: 34,
            marginBottom: 30,
          }}
        />
        <Interactive.Div
          name="Author"
          style={{
            fontFamily: "PT Serif",
            fontWeight: 400,
            fontSize: 50,
            letterSpacing: 3,
            color: "#ffffff",
          }}
        >
          B. Riemann
        </Interactive.Div>
      </Interactive.Div>

      {/* Line 1, «О числе…»: the Russian title under the card. */}
      <Interactive.Div
        name="Russian title"
        from={5.1 * fps}
        style={{
          position: "absolute",
          left: 820,
          top: 806,
          width: 960,
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 50,
          lineHeight: 1.25,
          color: "#ffffff",
          textAlign: "center",
          opacity: interpolate(
            frame,
            [5.1 * fps, 5.6 * fps, 9.6 * fps, 9.8 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
          translate: interpolate(
            frame,
            [5.1 * fps, 5.9 * fps],
            ["0px 30px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <span style={{ color: "#f5c542" }}>«</span>О числе простых чисел,
        <br />
        не превышающих данной величины
        <span style={{ color: "#f5c542" }}>»</span>
      </Interactive.Div>

      {/* Line 2, «дзэта-функцией»: the caption. */}
      <Interactive.Div
        name="Zeta caption"
        from={14.4 * fps}
        style={{
          position: "absolute",
          left: 140,
          top: 690,
          width: 1640,
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 64,
          color: "#ffffff",
          textAlign: "center",
          opacity: interpolate(frame, [14.4 * fps, 14.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [14.4 * fps, 15.2 * fps],
            ["0px 30px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        дзета-функция Римана
      </Interactive.Div>

      <Track name="Voiceover">
        <Audio
          name="paper-1"
          src={staticFile("voiceover/paper-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="paper-2"
          src={staticFile("voiceover/paper-2.mp3")}
          from={9.6 * fps}
        />
      </Track>
    </>
  );
};

export const Paper = Interactive.create({
  Component: PaperInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
