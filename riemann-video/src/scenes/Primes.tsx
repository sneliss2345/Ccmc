import { Audio } from "@remotion/media";
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
import { StaircaseChart } from "./Primes/Chart";
import { NumberTiles } from "./Primes/Tiles";

const PrimesInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {/* primes-1, primes-2: the number strip 1–60 with the primes in gold */}
      <Interactive.Div
        name="Number strip"
        durationInFrames={15.5 * fps}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          opacity: interpolate(frame, [14.9 * fps, 15.25 * fps], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [14.9 * fps, 15.25 * fps],
            ["0px 0px", "0px -40px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            },
          ),
        }}
      >
        <Interactive.Div
          name="Kicker"
          style={{
            position: "absolute",
            left: 0,
            top: 230,
            width: 1920,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#f5c542",
            opacity: interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Простые числа
        </Interactive.Div>
        <NumberTiles />
        <Interactive.Svg
          name="One is not prime"
          from={3.7 * fps}
          width={72}
          height={72}
          viewBox="0 0 72 72"
          style={{
            position: "absolute",
            left: 164,
            top: 460,
            overflow: "visible",
          }}
        >
          <Interactive.Path
            name="Slash over 1"
            d="M 12 60 L 60 12"
            fill="none"
            stroke="#ff6b6b"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={68}
            strokeDashoffset={interpolate(
              frame,
              [3.7 * fps, 4.1 * fps],
              [68, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            )}
          />
        </Interactive.Svg>
        <Interactive.Svg
          name="Twin bracket"
          from={11.4 * fps}
          width={180}
          height={34}
          viewBox="0 0 180 34"
          style={{
            position: "absolute",
            left: 990,
            top: 418,
            overflow: "visible",
          }}
        >
          <Interactive.Path
            name="Bracket over 11 and 13"
            d="M 10 32 L 10 6 L 170 6 L 170 32"
            fill="none"
            stroke="#f5c542"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={212}
            strokeDashoffset={interpolate(
              frame,
              [11.4 * fps, 12 * fps],
              [212, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.inOut(Easing.cubic),
              },
            )}
          />
        </Interactive.Svg>
        <Interactive.Div
          name="Near label"
          from={11.4 * fps}
          style={{
            position: "absolute",
            left: 880,
            top: 348,
            width: 400,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 52,
            color: "#f5c542",
            opacity: interpolate(frame, [11.4 * fps, 11.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [11.4 * fps, 12 * fps],
              ["0px 16px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          рядом
        </Interactive.Div>
        <Interactive.Div
          name="Gap 23–29"
          from={13.2 * fps}
          style={{
            position: "absolute",
            left: 404,
            top: 631,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#ff6b6b",
            width: interpolate(frame, [13.2 * fps, 13.6 * fps], [0, 392], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        />
        <Interactive.Div
          name="Gap 31–37"
          from={13.2 * fps}
          style={{
            position: "absolute",
            left: 1044,
            top: 631,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#ff6b6b",
            width: interpolate(frame, [13.2 * fps, 13.6 * fps], [0, 392], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        />
        <Interactive.Div
          name="Gap 47–53"
          from={13.2 * fps}
          style={{
            position: "absolute",
            left: 724,
            top: 723,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#ff6b6b",
            width: interpolate(frame, [13.2 * fps, 13.6 * fps], [0, 392], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        />
      </Interactive.Div>

      {/* Captions under the strip: they take turns in the same spot */}
      <Track name="Strip captions">
        <Interactive.Div
          name="Definition"
          from={5.3 * fps}
          durationInFrames={3 * fps}
          style={{
            position: "absolute",
            left: 140,
            top: 780,
            width: 1640,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 56,
            color: "#ffffff",
            opacity: interpolate(
              frame,
              [5.3 * fps, 5.8 * fps, 7.9 * fps, 8.3 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            translate: interpolate(
              frame,
              [5.3 * fps, 5.9 * fps],
              ["0px 20px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          делятся только на 1 и на себя
        </Interactive.Div>
        <Interactive.Div
          name="Far label"
          from={13.2 * fps}
          durationInFrames={2.2 * fps}
          style={{
            position: "absolute",
            left: 720,
            top: 744,
            width: 400,
            textAlign: "center",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 52,
            color: "#ff6b6b",
            opacity: interpolate(
              frame,
              [13.2 * fps, 13.7 * fps, 14.9 * fps, 15.25 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            translate: interpolate(
              frame,
              [13.2 * fps, 13.8 * fps],
              ["0px -16px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          далеко
        </Interactive.Div>
      </Track>

      {/* primes-3: the staircase π(x), then the zoom-out with li(x). The chart is
          centred while the staircase is built, sits left of the legend while it
          shows, and is centred again (dimmed) behind the question. */}
      <Interactive.Div
        name="Chart"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          opacity: interpolate(
            frame,
            [15.2 * fps, 15.7 * fps, 22.5 * fps, 23.1 * fps],
            [0, 1, 1, 0.3],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
          translate: interpolate(
            frame,
            [18.6 * fps, 19.4 * fps, 22.5 * fps, 23.3 * fps],
            ["216px 0px", "0px 0px", "0px 0px", "216px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            },
          ),
        }}
      >
        <StaircaseChart />
        <Interactive.Div
          name="Pi legend"
          from={18.8 * fps}
          style={{
            position: "absolute",
            left: 1330,
            top: 290,
            width: 460,
            opacity: interpolate(
              frame,
              [18.8 * fps, 19.3 * fps, 22.5 * fps, 23 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            translate: interpolate(
              frame,
              [18.8 * fps, 19.4 * fps],
              ["30px 0px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg width={64} height={20} viewBox="0 0 64 20">
              <path
                d="M 3 17 H 22 V 10 H 42 V 3 H 61"
                fill="none"
                stroke="#f5c542"
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Tex
              name="Pi of x"
              tex={String.raw`\pi(x)`}
              style={{ fontSize: 68, color: "#f5c542" }}
            />
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 44,
              lineHeight: 1.25,
              color: "#ffffff",
              marginTop: 8,
            }}
          >
            сколько простых ≤ x
          </div>
        </Interactive.Div>
        <Interactive.Div
          name="Li legend"
          from={20.8 * fps}
          style={{
            position: "absolute",
            left: 1330,
            top: 530,
            width: 460,
            opacity: interpolate(
              frame,
              [20.8 * fps, 21.3 * fps, 22.5 * fps, 23 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            translate: interpolate(
              frame,
              [20.8 * fps, 21.4 * fps],
              ["30px 0px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg width={64} height={20} viewBox="0 0 64 20">
              <path
                d="M 5 10 H 59"
                fill="none"
                stroke="#5ac8fa"
                strokeWidth={5}
                strokeDasharray="12 9"
                strokeLinecap="round"
              />
            </svg>
            <Tex
              name="Li of x"
              tex={String.raw`\operatorname{li}(x)`}
              style={{ fontSize: 68, color: "#5ac8fa" }}
            />
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 44,
              lineHeight: 1.25,
              color: "#ffffff",
              marginTop: 8,
            }}
          >
            плавная кривая
          </div>
        </Interactive.Div>
      </Interactive.Div>

      {/* primes-4: the question over the dimmed chart, then Riemann */}
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 170,
          width: 1600,
          height: 760,
          background:
            "radial-gradient(closest-side, rgba(11, 16, 32, 0.85) 0%, rgba(11, 16, 32, 0.6) 55%, rgba(11, 16, 32, 0) 100%)",
          opacity: interpolate(frame, [22.5 * fps, 23.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <Interactive.Div
        name="Question"
        from={22.5 * fps}
        style={{
          position: "absolute",
          left: 140,
          top: 290,
          width: 1640,
          textAlign: "center",
          fontFamily: "Unbounded",
          fontWeight: 800,
          fontSize: 104,
          lineHeight: 1.15,
          color: "#ffffff",
          textShadow: "0 0 60px rgba(11, 16, 32, 0.9)",
          opacity: interpolate(frame, [22.5 * fps, 23 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [22.5 * fps, 23.3 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Как описать
        <br />
        лестницу точно?
      </Interactive.Div>
      <Interactive.Div
        name="German mathematician"
        from={25.9 * fps}
        style={{
          position: "absolute",
          left: 140,
          top: 600,
          width: 1640,
          textAlign: "center",
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 52,
          color: "#9aa4c7",
          opacity: interpolate(frame, [25.9 * fps, 26.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [25.9 * fps, 26.5 * fps],
            ["0px 20px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        немецкий математик
      </Interactive.Div>
      <Interactive.Div
        name="Riemann"
        from={27 * fps}
        style={{
          position: "absolute",
          left: 140,
          top: 676,
          width: 1640,
          textAlign: "center",
          fontFamily: "Unbounded",
          fontWeight: 700,
          fontSize: 96,
          color: "#f5c542",
          textShadow: "0 0 50px rgba(245, 197, 66, 0.35)",
          opacity: interpolate(frame, [27 * fps, 27.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [27 * fps, 27.8 * fps], [0.85, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
        }}
      >
        Бернхард Риман
      </Interactive.Div>

      <Track name="Voiceover">
        <Audio
          name="primes-1"
          src={staticFile("voiceover/primes-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="primes-2"
          src={staticFile("voiceover/primes-2.mp3")}
          from={8.3 * fps}
        />
        <Audio
          name="primes-3"
          src={staticFile("voiceover/primes-3.mp3")}
          from={14.9 * fps}
        />
        <Audio
          name="primes-4"
          src={staticFile("voiceover/primes-4.mp3")}
          from={22.5 * fps}
        />
      </Track>
    </>
  );
};

export const Primes = Interactive.create({
  Component: PrimesInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
