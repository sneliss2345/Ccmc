import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";

const OutroInner = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <>
      <Interactive.Div
        name="Sequence of primes"
        style={{
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 76,
          letterSpacing: 4,
          color: "#f5c542",
          opacity: interpolate(frame, [0, 0.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0, 1.2 * fps],
            ["-80px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        2, 3, 5, 7, 11, 13, 17, 19, 23, …
      </Interactive.Div>
      <Interactive.Div
        name="Line 1"
        style={{
          fontFamily: "Unbounded",
          fontWeight: 800,
          fontSize: 116,
          lineHeight: 1.15,
          color: "#ffffff",
          marginTop: 72,
          opacity: interpolate(frame, [0.8 * fps, 1.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.8 * fps, 1.6 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Просты в определении.
      </Interactive.Div>
      <Interactive.Div
        name="Line 2"
        style={{
          fontFamily: "Unbounded",
          fontWeight: 800,
          fontSize: 116,
          lineHeight: 1.15,
          color: "#f5c542",
          marginTop: 12,
          opacity: interpolate(frame, [1.8 * fps, 2.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [1.8 * fps, 2.6 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Бесконечны в загадках.
      </Interactive.Div>
      <AbsoluteFill
        style={{
          backgroundColor: "#000000",
          opacity: interpolate(
            frame,
            [durationInFrames - 0.8 * fps, durationInFrames - 1],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      />
    </>
  );
};

export const Outro = Interactive.create({
  Component: OutroInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
