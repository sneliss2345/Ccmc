import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Chip } from "../components/Chip";
import "../fonts";

const DefinitionInner = () => {
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
        Что такое простое число
      </Interactive.Div>
      <Interactive.Div
        name="Headline"
        style={{
          fontFamily: "Unbounded",
          fontWeight: 700,
          fontSize: 104,
          lineHeight: 1.15,
          color: "#ffffff",
          marginTop: 28,
          maxWidth: 1500,
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
        Делится только на 1 и на себя
      </Interactive.Div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          marginTop: 80,
          height: 130,
        }}
      >
        <Interactive.Div
          name="Primes label"
          from={1.6 * fps}
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 56,
            color: "#f5c542",
            width: 380,
          }}
        >
          Простые:
        </Interactive.Div>
        <Chip
          name="2"
          from={1.8 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 88,
            color: "#0b1020",
            backgroundColor: "#f5c542",
          }}
        >
          2
        </Chip>
        <Chip
          name="3"
          from={2.05 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 88,
            color: "#0b1020",
            backgroundColor: "#f5c542",
          }}
        >
          3
        </Chip>
        <Chip
          name="5"
          from={2.3 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 88,
            color: "#0b1020",
            backgroundColor: "#f5c542",
          }}
        >
          5
        </Chip>
        <Chip
          name="7"
          from={2.55 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 88,
            color: "#0b1020",
            backgroundColor: "#f5c542",
          }}
        >
          7
        </Chip>
        <Chip
          name="11"
          from={2.8 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 88,
            color: "#0b1020",
            backgroundColor: "#f5c542",
          }}
        >
          11
        </Chip>
        <Chip
          name="13"
          from={3.05 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 88,
            color: "#0b1020",
            backgroundColor: "#f5c542",
          }}
        >
          13
        </Chip>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          marginTop: 40,
          height: 110,
        }}
      >
        <Interactive.Div
          name="Composites label"
          from={4 * fps}
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 56,
            color: "#9aa4c7",
            width: 380,
          }}
        >
          Составные:
        </Interactive.Div>
        <Chip
          name="6 = 2 · 3"
          from={4.2 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 500,
            fontSize: 60,
            color: "#ffffff",
            backgroundColor: "#1a2240",
          }}
        >
          6 = 2 · 3
        </Chip>
        <Chip
          name="9 = 3 · 3"
          from={4.6 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 500,
            fontSize: 60,
            color: "#ffffff",
            backgroundColor: "#1a2240",
          }}
        >
          9 = 3 · 3
        </Chip>
        <Chip
          name="12 = 3 · 4"
          from={5 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 500,
            fontSize: 60,
            color: "#ffffff",
            backgroundColor: "#1a2240",
          }}
        >
          12 = 3 · 4
        </Chip>
      </div>
    </>
  );
};

export const Definition = Interactive.create({
  Component: DefinitionInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
