import { Audio } from "@remotion/media";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Track,
} from "remotion";
import { FactorTree } from "../components/FactorTree";
import "../fonts";

const FactorizationInner = () => {
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
        Основная теорема арифметики
      </Interactive.Div>
      <Interactive.Div
        name="Headline"
        style={{
          fontFamily: "Unbounded",
          fontWeight: 700,
          fontSize: 88,
          lineHeight: 1.15,
          color: "#ffffff",
          textAlign: "center",
          maxWidth: 1500,
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
        Разложение на простые единственно
      </Interactive.Div>
      <div
        style={{
          display: "flex",
          gap: 160,
          marginTop: 48,
          height: 400,
        }}
      >
        <FactorTree
          name="60 = 6 × 10"
          from={8.8 * fps}
          root={60}
          left={6}
          right={10}
          leftA={2}
          leftB={3}
          rightA={2}
          rightB={5}
        />
        <FactorTree
          name="60 = 4 × 15"
          from={11.7 * fps}
          root={60}
          left={4}
          right={15}
          leftA={2}
          leftB={2}
          rightA={3}
          rightB={5}
        />
      </div>
      <Interactive.Div
        name="Result"
        from={16.8 * fps}
        style={{
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 80,
          color: "#ffffff",
          marginTop: 40,
          opacity: interpolate(frame, [16.8 * fps, 17.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [16.8 * fps, 17.6 * fps], [0.85, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 14 }),
            output: "perceptual-scale",
          }),
        }}
      >
        60 = <span style={{ color: "#f5c542" }}>2 · 2 · 3 · 5</span>
      </Interactive.Div>
      <Track name="Voiceover">
        <Audio
          name="Основная теорема"
          src={staticFile("voiceover/factorization-1.mp3")}
          from={0.6 * fps}
        />
        <Audio
          name="Шесть на десять"
          src={staticFile("voiceover/factorization-2.mp3")}
          from={8.8 * fps}
        />
        <Audio
          name="Четыре на пятнадцать"
          src={staticFile("voiceover/factorization-3.mp3")}
          from={11.7 * fps}
        />
        <Audio
          name="Два, два, три и пять"
          src={staticFile("voiceover/factorization-4.mp3")}
          from={14.3 * fps}
        />
      </Track>
    </>
  );
};

export const Factorization = Interactive.create({
  Component: FactorizationInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
