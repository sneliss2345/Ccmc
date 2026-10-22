import { Audio } from "@remotion/media";
import {
  Easing,
  Interactive,
  interpolate,
  staticFile,
  Track,
  useVideoConfig,
  useCurrentFrame,
} from "remotion";
import { Tex } from "../components/Tex";
import "../fonts";

// Basel bar: a value v sits at x = 180 + 940 · v inside the scene, so the
// target π²/6 ≈ 1.6449 lands at x ≈ 1726.
const BAR_K = 940;
const BAR_TERMS = 150;
const BAR_TERM_LIST = Array.from({ length: BAR_TERMS }, (_, i) => {
  const n = i + 1;
  let before = 0;
  for (let m = 1; m < n; m++) {
    before += 1 / (m * m);
  }
  return {
    n,
    before,
    value: 1 / (n * n),
    // Terms arrive ever faster and pile up against the target.
    start: 13.8 + 2.8 * (1 - 1 / Math.sqrt(n)),
  };
});
const BAR_LABELS: Record<number, string> = { 1: "1", 2: "1/4", 3: "1/9" };

// Template graphic: the stacked segments 1, 1/4, 1/9, … of the partial sums.
const PartialSumSegments = ({
  frame,
  fps,
}: {
  readonly frame: number;
  readonly fps: number;
}) => {
  return (
    <>
      {BAR_TERM_LIST.map(({ n, before, value, start }) => {
        const grow = interpolate(
          frame,
          [start * fps, (start + (n === 1 ? 0.6 : 0.35)) * fps],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        );
        const label = BAR_LABELS[n];
        return (
          <div
            key={n}
            style={{
              position: "absolute",
              left: before * BAR_K,
              top: 0,
              height: "100%",
              width: value * BAR_K * grow,
              backgroundColor: n % 2 === 1 ? "#f5c542" : "#c7962a",
              boxShadow: n < 4 ? "inset -2px 0 0 rgba(11, 16, 32, 0.55)" : "",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              fontSize: 36,
              color: "#0b1020",
            }}
          >
            {label ? (
              <span style={{ opacity: grow > 0.8 ? 1 : 0 }}>{label}</span>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

const ZetaInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {/* ---------- zeta-1: the series, term by term ---------- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 170,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Interactive.Div
          name="s badge"
          from={1 * fps}
          durationInFrames={11.6 * fps}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            padding: "4px 44px 8px 44px",
            borderRadius: 32,
            border: "3px solid #f5c542",
            backgroundColor: "#151c33",
            opacity: interpolate(
              frame,
              [1 * fps, 1.4 * fps, 12.2 * fps, 12.6 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            scale: interpolate(frame, [1 * fps, 1.6 * fps], [0.7, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 14 }),
              output: "perceptual-scale",
            }),
          }}
        >
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 56,
              color: "#9aa4c7",
            }}
          >
            число
          </span>
          <Tex
            name="s symbol"
            tex={String.raw`s`}
            style={{ fontSize: 100, color: "#f5c542" }}
          />
        </Interactive.Div>
      </div>

      <Interactive.Div
        name="Zeta series"
        durationInFrames={20.9 * fps}
        style={{
          position: "absolute",
          left: 239,
          top: 440,
          display: "flex",
          alignItems: "baseline",
          opacity: interpolate(frame, [20.5 * fps, 20.9 * fps], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [12.4 * fps, 13.2 * fps],
            ["0px 0px", "0px -350px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            },
          ),
          scale: interpolate(frame, [12.4 * fps, 13.2 * fps], [1, 0.75], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
            output: "perceptual-scale",
          }),
        }}
      >
        <Tex
          name="Zeta equals one"
          from={4.2 * fps}
          tex={String.raw`\vphantom{\frac{1}{2^{s}}}\zeta(\textcolor{#f5c542}{s}) = 1`}
          display
          style={{
            fontSize: 92,
            color: "#ffffff",
            opacity: interpolate(frame, [4.2 * fps, 4.6 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [4.2 * fps, 4.9 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        />
        <Tex
          name="Term 1/2^s"
          from={5.3 * fps}
          tex={String.raw`{} + \frac{1}{2^{\textcolor{#f5c542}{s}}}`}
          display
          style={{
            fontSize: 92,
            color: "#ffffff",
            opacity: interpolate(frame, [5.3 * fps, 5.7 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [5.3 * fps, 6 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        />
        <Tex
          name="Term 1/3^s"
          from={7.3 * fps}
          tex={String.raw`{} + \frac{1}{3^{\textcolor{#f5c542}{s}}}`}
          display
          style={{
            fontSize: 92,
            color: "#ffffff",
            opacity: interpolate(frame, [7.3 * fps, 7.7 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [7.3 * fps, 8 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        />
        <Tex
          name="Term 1/4^s and dots"
          from={9.5 * fps}
          tex={String.raw`{} + \frac{1}{4^{\textcolor{#f5c542}{s}}} + \cdots`}
          display
          style={{
            fontSize: 92,
            color: "#ffffff",
            opacity: interpolate(frame, [9.5 * fps, 9.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [9.5 * fps, 10.2 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        />
      </Interactive.Div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 730,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Interactive.Div
          name="Zeta caption"
          from={10.9 * fps}
          durationInFrames={1.7 * fps}
          style={{
            fontFamily: "Unbounded",
            fontWeight: 800,
            fontSize: 96,
            color: "#f5c542",
            opacity: interpolate(
              frame,
              [10.9 * fps, 11.3 * fps, 12.2 * fps, 12.6 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            translate: interpolate(
              frame,
              [10.9 * fps, 11.6 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          дзета-функция
        </Interactive.Div>
      </div>

      {/* ---------- zeta-2: Basel problem ---------- */}
      <Interactive.Div
        name="Basel row"
        durationInFrames={20.9 * fps}
        style={{
          position: "absolute",
          left: 175,
          top: 345,
          display: "flex",
          alignItems: "baseline",
          opacity: interpolate(frame, [20.5 * fps, 20.9 * fps], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Tex
          name="Zeta of 2 series"
          from={13.3 * fps}
          tex={String.raw`\vphantom{\frac{\pi^2}{6}}\zeta(\textcolor{#f5c542}{2}) = 1 + \frac{1}{4} + \frac{1}{9} + \frac{1}{16} + \cdots`}
          display
          style={{
            fontSize: 68,
            color: "#ffffff",
            opacity: interpolate(frame, [13.3 * fps, 13.7 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [13.3 * fps, 14 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        />
        <Tex
          name="Basel value"
          from={14.7 * fps}
          tex={String.raw`{} = \textcolor{#f5c542}{\frac{\pi^2}{6}} \approx 1{,}6449`}
          display
          style={{
            fontSize: 68,
            color: "#ffffff",
            opacity: interpolate(frame, [14.7 * fps, 15.1 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [14.7 * fps, 15.4 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        />
      </Interactive.Div>

      <Interactive.Div
        name="Partial sums bar"
        from={13.6 * fps}
        durationInFrames={7.3 * fps}
        style={{
          position: "absolute",
          left: 180,
          top: 685,
          width: 1546,
          height: 100,
          borderRadius: 14,
          overflow: "hidden",
          backgroundColor: "#151c33",
          opacity: interpolate(
            frame,
            [13.6 * fps, 14 * fps, 20.5 * fps, 20.9 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        <PartialSumSegments frame={frame} fps={fps} />
      </Interactive.Div>

      <Interactive.Div
        name="Target line"
        from={14.7 * fps}
        durationInFrames={6.2 * fps}
        style={{
          position: "absolute",
          left: 1723,
          top: 655,
          width: 0,
          height: 160,
          borderLeft: "6px dashed #f5c542",
          opacity: interpolate(
            frame,
            [14.7 * fps, 15.1 * fps, 20.5 * fps, 20.9 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />
      <Tex
        name="Target label"
        from={14.7 * fps}
        durationInFrames={6.2 * fps}
        tex={String.raw`\pi^2/6 \approx 1{,}6449`}
        style={{
          position: "absolute",
          right: 214,
          top: 575,
          fontSize: 64,
          color: "#f5c542",
          opacity: interpolate(
            frame,
            [14.7 * fps, 15.1 * fps, 20.5 * fps, 20.9 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 860,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Interactive.Div
          name="Euler credit"
          from={18.6 * fps}
          durationInFrames={2.3 * fps}
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 56,
            color: "#ffffff",
            backgroundColor: "#151c33",
            border: "3px solid #26304f",
            borderRadius: 28,
            padding: "16px 48px",
            opacity: interpolate(
              frame,
              [18.6 * fps, 19 * fps, 20.5 * fps, 20.9 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            translate: interpolate(
              frame,
              [18.6 * fps, 19.3 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          Леонард Эйлер,{" "}
          <span
            style={{
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              color: "#f5c542",
            }}
          >
            1734
          </span>
        </Interactive.Div>
      </div>

      {/* ---------- zeta-3: Euler product ---------- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 110,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Interactive.Div
          name="Euler product kicker"
          from={25 * fps}
          durationInFrames={8.4 * fps}
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#f5c542",
            opacity: interpolate(
              frame,
              [25 * fps, 25.5 * fps, 32.9 * fps, 33.3 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          Произведение Эйлера
        </Interactive.Div>
      </div>

      <Interactive.Div
        name="Euler product row"
        durationInFrames={33.4 * fps}
        style={{
          position: "absolute",
          left: 445,
          top: 195,
          display: "flex",
          alignItems: "baseline",
          opacity: interpolate(frame, [32.9 * fps, 33.3 * fps], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          // The sum starts centred and makes room when the product arrives.
          translate: interpolate(
            frame,
            [25.1 * fps, 25.8 * fps],
            ["330px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            },
          ),
        }}
      >
        <Tex
          name="Dirichlet sum"
          from={21 * fps}
          tex={String.raw`\vphantom{\prod_{p}\frac{1}{1-p^{-s}}}\sum_{n=1}^{\infty} \frac{1}{n^{s}}`}
          display
          style={{
            fontSize: 92,
            color: "#ffffff",
            opacity: interpolate(frame, [21 * fps, 21.4 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [21 * fps, 21.7 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        />
        <Tex
          name="Euler product"
          from={25.1 * fps}
          tex={String.raw`{} = \prod_{p} \frac{1}{1-p^{-s}}`}
          display
          style={{
            fontSize: 92,
            color: "#ffffff",
            opacity: interpolate(frame, [25.1 * fps, 25.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [25.1 * fps, 25.8 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        />
      </Interactive.Div>

      <Interactive.Div
        name="Over all primes"
        from={27.5 * fps}
        durationInFrames={5.9 * fps}
        style={{
          position: "absolute",
          left: 788,
          top: 535,
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 44,
          color: "#9aa4c7",
          opacity: interpolate(
            frame,
            [27.5 * fps, 27.9 * fps, 32.9 * fps, 33.3 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        по всем простым{" "}
        <span style={{ fontFamily: "KaTeX_Math", fontStyle: "italic" }}>p</span>
      </Interactive.Div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 635,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tex
          name="Expanded product"
          from={27.9 * fps}
          durationInFrames={5.4 * fps}
          tex={String.raw`= \frac{1}{1-\textcolor{#f5c542}{2}^{-s}} \cdot \frac{1}{1-\textcolor{#f5c542}{3}^{-s}} \cdot \frac{1}{1-\textcolor{#f5c542}{5}^{-s}} \cdot \frac{1}{1-\textcolor{#f5c542}{7}^{-s}} \cdots`}
          display
          style={{
            fontSize: 68,
            color: "#ffffff",
            clipPath: `inset(-20% ${interpolate(
              frame,
              [27.9 * fps, 29.1 * fps],
              [100, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.inOut(Easing.cubic),
              },
            )}% -20% 0)`,
            opacity: interpolate(frame, [32.9 * fps, 33.3 * fps], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 860,
          display: "flex",
          justifyContent: "center",
          gap: 56,
        }}
      >
        <Interactive.Div
          name="Chip 12"
          from={30.7 * fps}
          durationInFrames={2.6 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 56,
            color: "#ffffff",
            backgroundColor: "#151c33",
            border: "3px solid #26304f",
            borderRadius: 28,
            padding: "16px 44px",
            opacity: interpolate(
              frame,
              [30.7 * fps, 31.1 * fps, 32.9 * fps, 33.3 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            scale: interpolate(frame, [30.7 * fps, 31.3 * fps], [0.7, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 14 }),
              output: "perceptual-scale",
            }),
          }}
        >
          12 = <span style={{ color: "#f5c542" }}>2·2·3</span>
        </Interactive.Div>
        <Interactive.Div
          name="Chip 60"
          from={31.1 * fps}
          durationInFrames={2.2 * fps}
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 56,
            color: "#ffffff",
            backgroundColor: "#151c33",
            border: "3px solid #26304f",
            borderRadius: 28,
            padding: "16px 44px",
            opacity: interpolate(
              frame,
              [31.1 * fps, 31.5 * fps, 32.9 * fps, 33.3 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            scale: interpolate(frame, [31.1 * fps, 31.7 * fps], [0.7, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 14 }),
              output: "perceptual-scale",
            }),
          }}
        >
          60 = <span style={{ color: "#f5c542" }}>2·2·3·5</span>
        </Interactive.Div>
      </div>

      {/* ---------- zeta-4: the bridge ---------- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 115,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tex
          name="Bridge zeta"
          from={33.4 * fps}
          tex={String.raw`\zeta(s)`}
          style={{
            fontSize: 130,
            color: "#ffffff",
            opacity: interpolate(frame, [33.4 * fps, 33.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [33.4 * fps, 34.2 * fps], [0.85, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
          }}
        />
      </div>

      <Interactive.Svg
        name="Bridge arc"
        from={35 * fps}
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <path
          d="M 500 600 C 500 260, 1420 260, 1420 600"
          pathLength={1}
          fill="none"
          stroke="#f5c542"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray="1 1"
          strokeDashoffset={interpolate(frame, [35 * fps, 35.9 * fps], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
          })}
          style={{ filter: "drop-shadow(0 0 14px rgba(245, 197, 66, 0.55))" }}
        />
      </Interactive.Svg>

      <Interactive.Div
        name="All numbers card"
        from={35.8 * fps}
        style={{
          position: "absolute",
          left: 160,
          top: 600,
          width: 680,
          height: 250,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          backgroundColor: "#151c33",
          border: "3px solid #26304f",
          borderRadius: 30,
          opacity: interpolate(frame, [35.8 * fps, 36.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [35.8 * fps, 36.5 * fps],
            ["0px 30px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 56,
            color: "#9aa4c7",
          }}
        >
          все числа
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 56,
            color: "#ffffff",
          }}
        >
          1, 2, 3, 4, 5, …
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Primes card"
        from={37 * fps}
        style={{
          position: "absolute",
          left: 1080,
          top: 600,
          width: 680,
          height: 250,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          backgroundColor: "#151c33",
          border: "3px solid #f5c542",
          borderRadius: 30,
          opacity: interpolate(frame, [37 * fps, 37.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [37 * fps, 37.7 * fps],
            ["0px 30px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 56,
            color: "#9aa4c7",
          }}
        >
          простые
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 56,
            color: "#f5c542",
          }}
        >
          2, 3, 5, 7, …
        </div>
      </Interactive.Div>

      <Track name="Voiceover">
        <Audio
          name="zeta-1"
          src={staticFile("voiceover/zeta-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="zeta-2"
          src={staticFile("voiceover/zeta-2.mp3")}
          from={12.5 * fps}
        />
        <Audio
          name="zeta-3"
          src={staticFile("voiceover/zeta-3.mp3")}
          from={20.9 * fps}
        />
        <Audio
          name="zeta-4"
          src={staticFile("voiceover/zeta-4.mp3")}
          from={33.3 * fps}
        />
      </Track>
    </>
  );
};

export const Zeta = Interactive.create({
  Component: ZetaInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
