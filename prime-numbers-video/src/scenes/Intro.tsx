import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";

const FLOATING_PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113,
];

// Decorative backdrop, intentionally generated as one template.
const FloatingPrimes = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {FLOATING_PRIMES.map((prime, i) => {
        const x = random(`x-${i}`) * width;
        const y = random(`y-${i}`) * height;
        const size = 36 + random(`s-${i}`) * 90;
        const speed = 0.3 + random(`v-${i}`) * 0.7;
        return (
          <div
            key={prime}
            style={{
              position: "absolute",
              left: x,
              top: y - frame * speed,
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              fontSize: size,
              color: "#f5c542",
              opacity:
                0.05 +
                0.08 *
                  random(`o-${i}`) *
                  interpolate(frame, [0, 30], [0, 1], {
                    extrapolateRight: "clamp",
                  }),
            }}
          >
            {prime}
          </div>
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
      <FloatingPrimes />
      <Interactive.Div
        name="Kicker"
        style={{
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 40,
          letterSpacing: 12,
          textTransform: "uppercase",
          color: "#f5c542",
          opacity: interpolate(frame, [0.2 * fps, 1 * fps], [0, 1], {
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
          fontSize: 160,
          lineHeight: 1.1,
          color: "#ffffff",
          marginTop: 24,
          scale: interpolate(frame, [0.4 * fps, 1.6 * fps], [0.8, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
          opacity: interpolate(frame, [0.4 * fps, 1.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Простые числа
      </Interactive.Div>
      <Interactive.Div
        name="Subtitle"
        style={{
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 64,
          color: "#9aa4c7",
          marginTop: 32,
          opacity: interpolate(frame, [1.4 * fps, 2.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [1.4 * fps, 2.2 * fps],
            ["0px 30px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Атомы арифметики
      </Interactive.Div>
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
