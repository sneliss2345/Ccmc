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
import "../fonts";

// Digit groups separated by narrow no-break spaces (U+202F), Russian style.
const groupDigits = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Proven share as it is shown next to the bar: whole percent while filling to 40 %,
// one decimal (with a comma) on the way to 41,7 %.
const formatShare = (share: number) =>
  share > 40.05
    ? share.toFixed(1).replace(".", ",")
    : Math.round(share).toString();

const EvidenceInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The counter races through the orders of magnitude: 10^0 … 10^13.
  const zerosChecked =
    10 **
    interpolate(frame, [1.2 * fps, 3.4 * fps], [0, 13], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    });

  // Same keyframes and easing as the width of "Share fill".
  const provenShare = interpolate(
    frame,
    [12 * fps, 12.6 * fps, 12.8 * fps, 13.4 * fps],
    [0, 40, 40, 41.7],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  return (
    <>
      <Track name="Kickers">
        <Interactive.Div
          name="Kicker verified"
          from={0.6 * fps}
          durationInFrames={7 * fps}
          style={{
            position: "absolute",
            top: 120,
            left: 140,
            right: 140,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#f5c542",
            opacity: interpolate(
              frame,
              [0.6 * fps, 1.1 * fps, 7.3 * fps, 7.6 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          Проверено компьютерами
        </Interactive.Div>
        <Interactive.Div
          name="Kicker proved"
          from={7.6 * fps}
          style={{
            position: "absolute",
            top: 120,
            left: 140,
            right: 140,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#f5c542",
            opacity: interpolate(frame, [7.6 * fps, 8.1 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Доказано строго
        </Interactive.Div>
      </Track>

      {/* Part 1: verified zeros. The counter is centred together with its ">" sign. */}
      <AbsoluteFill
        style={{
          top: 290,
          height: 190,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingLeft: 124,
        }}
      >
        <div style={{ position: "relative" }}>
          <Interactive.Div
            name="Zero counter"
            from={1.1 * fps}
            durationInFrames={6.5 * fps}
            style={{
              position: "relative",
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              fontSize: 140,
              lineHeight: 1.2,
              color: "#f5c542",
              textShadow: "0 0 48px rgba(245, 197, 66, 0.35)",
              opacity: interpolate(
                frame,
                [1.1 * fps, 1.4 * fps, 7.3 * fps, 7.6 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            {/* Invisible final value reserves the width; the live value is right-aligned. */}
            <span style={{ visibility: "hidden" }}>{"10 000 000 000 000"}</span>
            <span style={{ position: "absolute", right: 0, top: 0 }}>
              {groupDigits(zerosChecked)}
            </span>
          </Interactive.Div>
          <Interactive.Div
            name="Greater than"
            from={1.7 * fps}
            durationInFrames={5.9 * fps}
            style={{
              position: "absolute",
              top: 0,
              right: "100%",
              marginRight: 40,
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              fontSize: 140,
              lineHeight: 1.2,
              color: "#f5c542",
              opacity: interpolate(
                frame,
                [1.7 * fps, 2.1 * fps, 7.3 * fps, 7.6 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              scale: interpolate(frame, [1.7 * fps, 2.3 * fps], [0.6, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({ damping: 14 }),
                output: "perceptual-scale",
              }),
            }}
          >
            {">"}
          </Interactive.Div>
        </div>
      </AbsoluteFill>

      <Interactive.Div
        name="Zeros checked caption"
        from={3.7 * fps}
        durationInFrames={3.9 * fps}
        style={{
          position: "absolute",
          top: 500,
          left: 140,
          right: 140,
          textAlign: "center",
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 64,
          color: "#ffffff",
          opacity: interpolate(
            frame,
            [3.7 * fps, 4.2 * fps, 7.3 * fps, 7.6 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
          translate: interpolate(
            frame,
            [3.7 * fps, 4.5 * fps],
            ["0px 30px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        нулей проверено
      </Interactive.Div>

      <AbsoluteFill
        style={{
          top: 620,
          height: 130,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Interactive.Div
          name="All on the line badge"
          from={5.1 * fps}
          durationInFrames={2.5 * fps}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            padding: "22px 48px 22px 32px",
            backgroundColor: "#151c33",
            border: "3px solid #26304f",
            borderRadius: 32,
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 60,
            color: "#ffffff",
            opacity: interpolate(
              frame,
              [5.1 * fps, 5.5 * fps, 7.3 * fps, 7.6 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            scale: interpolate(frame, [5.1 * fps, 5.7 * fps], [0.85, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
          }}
        >
          <svg width={72} height={72} viewBox="0 0 72 72">
            <circle
              cx={36}
              cy={36}
              r={32}
              fill="none"
              stroke="#7ee0a1"
              strokeWidth={5}
            />
            <path
              d="M 21 37 L 31 47 L 52 25"
              fill="none"
              stroke="#7ee0a1"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            все на прямой <span style={{ color: "#f5c542" }}>Re s = ½</span>
          </span>
        </Interactive.Div>
      </AbsoluteFill>

      <Interactive.Div
        name="Verification sources"
        from={4.4 * fps}
        durationInFrames={3.2 * fps}
        style={{
          position: "absolute",
          top: 880,
          left: 140,
          right: 140,
          textAlign: "center",
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 40,
          color: "#9aa4c7",
          opacity: interpolate(
            frame,
            [4.4 * fps, 4.9 * fps, 7.3 * fps, 7.6 * fps],
            [0, 0.85, 0.85, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        Gourdon & Demichel, 2004 · Platt & Trudgian, 2021
      </Interactive.Div>

      {/* Part 2: proven results, one row per theorem. */}
      <Interactive.Div
        name="Hardy 1914"
        from={8.5 * fps}
        style={{
          position: "absolute",
          top: 250,
          left: 140,
          width: 1640,
          height: 110,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          padding: "0 48px",
          backgroundColor: "#151c33",
          border: "3px solid #26304f",
          borderRadius: 28,
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 56,
          color: "#ffffff",
          opacity: interpolate(frame, [8.5 * fps, 9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [8.5 * fps, 9.3 * fps, 11.2 * fps, 11.8 * fps],
            ["-40px 240px", "0px 240px", "0px 240px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <span style={{ width: 440, fontWeight: 600 }}>
          Харди,{" "}
          <span
            style={{
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              color: "#f5c542",
            }}
          >
            1914
          </span>
        </span>
        <span>
          на прямой{" "}
          <span style={{ color: "#f5c542", fontWeight: 600 }}>
            бесконечно много
          </span>{" "}
          нулей
        </span>
      </Interactive.Div>

      <Interactive.Div
        name="Conrey 1989"
        from={11.7 * fps}
        style={{
          position: "absolute",
          top: 384,
          left: 140,
          width: 1640,
          height: 110,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          padding: "0 48px",
          backgroundColor: "#151c33",
          border: "3px solid #26304f",
          borderRadius: 28,
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 56,
          color: "#ffffff",
          opacity: interpolate(frame, [11.7 * fps, 12.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [11.7 * fps, 12.5 * fps],
            ["-40px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <span style={{ width: 440, fontWeight: 600 }}>
          Конри,{" "}
          <span
            style={{
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              color: "#f5c542",
            }}
          >
            1989
          </span>
        </span>
        <span>
          больше{" "}
          <span
            style={{
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              color: "#f5c542",
            }}
          >
            {"40\u202f%"}
          </span>{" "}
          всех нулей
        </span>
      </Interactive.Div>

      <Interactive.Div
        name="Bound 2020"
        from={12.6 * fps}
        style={{
          position: "absolute",
          top: 518,
          left: 140,
          width: 1640,
          height: 110,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          padding: "0 48px",
          backgroundColor: "#151c33",
          border: "3px solid #26304f",
          borderRadius: 28,
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 56,
          color: "#ffffff",
          opacity: interpolate(frame, [12.6 * fps, 13.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [12.6 * fps, 13.4 * fps],
            ["-40px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <span
          style={{
            width: 440,
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            color: "#f5c542",
          }}
        >
          2020
        </span>
        <span>
          не меньше{" "}
          <span
            style={{
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              color: "#f5c542",
            }}
          >
            {"41,7\u202f%"}
          </span>
        </span>
      </Interactive.Div>

      <Interactive.Div
        name="Share label"
        from={11.9 * fps}
        style={{
          position: "absolute",
          top: 700,
          left: 140,
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 48,
          color: "#9aa4c7",
          opacity: interpolate(frame, [11.9 * fps, 12.3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        доказанная доля нулей на прямой
      </Interactive.Div>

      {/* Bar: plain box holding the track, the unproven remainder and the fill. */}
      <div
        style={{
          position: "absolute",
          top: 780,
          left: 140,
          width: 1640,
          height: 96,
        }}
      >
        <Interactive.Div
          name="Share track"
          from={11.9 * fps}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#151c33",
            border: "3px solid #26304f",
            borderRadius: 24,
            opacity: interpolate(frame, [11.9 * fps, 12.3 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {[0, 50, 100].map((p) => (
            <div
              key={p}
              style={{
                position: "absolute",
                top: "100%",
                left: `${p}%`,
                marginTop: 16,
                translate:
                  p === 0
                    ? "-3px 0px"
                    : p === 100
                      ? "calc(-100% + 3px) 0px"
                      : "-50% 0px",
                fontFamily: "JetBrains Mono",
                fontWeight: 500,
                fontSize: 32,
                color: "#6b759a",
                whiteSpace: "nowrap",
              }}
            >
              {p}
              {"\u202f"}%
            </div>
          ))}
        </Interactive.Div>
        {/* Only a lower bound is proven: the rest of the bar stays unknown. */}
        <Interactive.Div
          name="Unproven remainder"
          from={13.5 * fps}
          style={{
            position: "absolute",
            top: 3,
            bottom: 3,
            left: 684,
            right: 3,
            borderRadius: "0 21px 21px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "repeating-linear-gradient(135deg, rgba(154, 164, 199, 0.16) 0px 12px, rgba(154, 164, 199, 0) 12px 28px)",
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 56,
            color: "#9aa4c7",
            opacity: interpolate(frame, [13.5 * fps, 14 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          ?
        </Interactive.Div>
        <Interactive.Div
          name="Share fill"
          from={11.9 * fps}
          style={{
            position: "absolute",
            top: 3,
            bottom: 3,
            left: 3,
            borderRadius: 21,
            backgroundColor: "#f5c542",
            boxShadow: "0 0 36px rgba(245, 197, 66, 0.35)",
            opacity: interpolate(frame, [11.9 * fps, 12.3 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            width: interpolate(
              frame,
              [12 * fps, 12.6 * fps, 12.8 * fps, 13.4 * fps],
              [0, 654, 654, 681],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.inOut(Easing.cubic),
              },
            ),
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "100%",
              marginLeft: 28,
              display: "flex",
              alignItems: "center",
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              fontSize: 60,
              color: "#f5c542",
              whiteSpace: "nowrap",
            }}
          >
            {formatShare(provenShare)}
            {"\u202f"}%
          </div>
        </Interactive.Div>
      </div>

      <Track name="Voiceover">
        <Audio
          name="evidence-1"
          src={staticFile("voiceover/evidence-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="evidence-2"
          src={staticFile("voiceover/evidence-2.mp3")}
          from={7.6 * fps}
        />
      </Track>
    </>
  );
};

export const Evidence = Interactive.create({
  Component: EvidenceInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
