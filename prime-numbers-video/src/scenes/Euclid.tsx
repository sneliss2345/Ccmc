import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";

const EuclidInner = () => {
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
        Евклид · около 300 г. до н. э.
      </Interactive.Div>
      <Interactive.Div
        name="Headline"
        style={{
          fontFamily: "Unbounded",
          fontWeight: 700,
          fontSize: 88,
          lineHeight: 1.15,
          color: "#ffffff",
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
        Простых бесконечно много
      </Interactive.Div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginTop: 56,
          height: 380,
        }}
      >
        <Interactive.Div
          name="Proof: assume"
          from={1.4 * fps}
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 58,
            color: "#e6e9f5",
            opacity: interpolate(frame, [1.4 * fps, 1.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: "#f5c542" }}>1.</span> Пусть простых конечно: p
          <sub>1</sub>, p<sub>2</sub>, …, p<sub>n</sub>
        </Interactive.Div>
        <Interactive.Div
          name="Proof: construct"
          from={3 * fps}
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 58,
            color: "#e6e9f5",
            opacity: interpolate(frame, [3 * fps, 3.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: "#f5c542" }}>2.</span> Возьмём N = p<sub>1</sub>{" "}
          · p<sub>2</sub> · … · p<sub>n</sub> + 1
        </Interactive.Div>
        <Interactive.Div
          name="Proof: remainder"
          from={4.6 * fps}
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 58,
            color: "#e6e9f5",
            opacity: interpolate(frame, [4.6 * fps, 5.1 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: "#f5c542" }}>3.</span> N делится на любое p
          <sub>i</sub> с остатком 1
        </Interactive.Div>
        <Interactive.Div
          name="Proof: contradiction"
          from={6.2 * fps}
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 58,
            color: "#e6e9f5",
            opacity: interpolate(frame, [6.2 * fps, 6.7 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: "#f5c542" }}>4.</span> Его простой делитель —
          новый.{" "}
          <span style={{ color: "#ff6b6b", fontWeight: 700 }}>
            Противоречие!
          </span>
        </Interactive.Div>
      </div>
      <Interactive.Div
        name="Examples"
        from={8.2 * fps}
        style={{
          fontFamily: "JetBrains Mono",
          fontWeight: 500,
          fontSize: 50,
          lineHeight: 1.5,
          color: "#e6e9f5",
          backgroundColor: "#151c33",
          border: "3px solid #26304f",
          borderRadius: 28,
          padding: "24px 44px",
          marginTop: 24,
          opacity: interpolate(frame, [8.2 * fps, 8.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [8.2 * fps, 9 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        2·3·5·7 + 1 = <span style={{ color: "#f5c542" }}>211</span>
        <span style={{ color: "#9aa4c7" }}> — простое</span>
        <br />
        2·3·5·7·11·13 + 1 = <span style={{ color: "#f5c542" }}>59 · 509</span>
        <span style={{ color: "#9aa4c7" }}> — новые простые</span>
      </Interactive.Div>
    </>
  );
};

export const Euclid = Interactive.create({
  Component: EuclidInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
