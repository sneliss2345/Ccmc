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
import { Chip } from "../components/Chip";
import "../fonts";

const CryptographyInner = () => {
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
        Зачем это нужно
      </Interactive.Div>
      <Interactive.Div
        name="Headline"
        style={{
          fontFamily: "Unbounded",
          fontWeight: 700,
          fontSize: 96,
          lineHeight: 1.15,
          color: "#ffffff",
          marginTop: 24,
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
        Простые числа охраняют интернет
      </Interactive.Div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
          marginTop: 72,
          height: 120,
        }}
      >
        <Interactive.Div
          name="Multiply"
          from={4.6 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 84,
            color: "#ffffff",
            width: 820,
            opacity: interpolate(frame, [4.6 * fps, 5.1 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: "#f5c542" }}>61</span> ×{" "}
          <span style={{ color: "#f5c542" }}>53</span> = 3233
        </Interactive.Div>
        <Chip
          name="Easy"
          from={7.9 * fps}
          style={{
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: 52,
            color: "#0b1020",
            backgroundColor: "#7ee0a1",
          }}
        >
          умножить — легко
        </Chip>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
          marginTop: 28,
          height: 120,
        }}
      >
        <Interactive.Div
          name="Factor"
          from={11.3 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 84,
            color: "#ffffff",
            width: 820,
            opacity: interpolate(frame, [11.3 * fps, 11.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          3233 = <span style={{ color: "#ff6b6b" }}>?</span> ×{" "}
          <span style={{ color: "#ff6b6b" }}>?</span>
        </Interactive.Div>
        <Chip
          name="Hard"
          from={14.6 * fps}
          style={{
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: 52,
            color: "#0b1020",
            backgroundColor: "#ff6b6b",
          }}
        >
          разложить — трудно
        </Chip>
      </div>
      <Interactive.Div
        name="RSA"
        from={16.2 * fps}
        style={{
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 56,
          lineHeight: 1.3,
          color: "#9aa4c7",
          marginTop: 72,
          maxWidth: 1500,
          opacity: interpolate(frame, [16.2 * fps, 16.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        На этом стоит шифрование RSA — только простые там из сотен цифр
      </Interactive.Div>
      <Track name="Voiceover">
        <Audio
          name="Зачем это нужно"
          src={staticFile("voiceover/cryptography-1.mp3")}
          from={0.6 * fps}
        />
        <Audio
          name="Умножить легко"
          src={staticFile("voiceover/cryptography-2.mp3")}
          from={4.6 * fps}
        />
        <Audio
          name="Разложить трудно"
          src={staticFile("voiceover/cryptography-3.mp3")}
          from={11.3 * fps}
        />
        <Audio
          name="RSA"
          src={staticFile("voiceover/cryptography-4.mp3")}
          from={16.2 * fps}
        />
      </Track>
    </>
  );
};

export const Cryptography = Interactive.create({
  Component: CryptographyInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
