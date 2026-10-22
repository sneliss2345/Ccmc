import { Audio } from "@remotion/media";
import {
  Easing,
  Interactive,
  interpolate,
  interpolateColors,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";
import { isPrime, smallestPrimeFactors } from "../primes";

const LIMIT = 100;
const SMALLEST_FACTOR = smallestPrimeFactors(LIMIT);
const NUMBERS = Array.from({ length: LIMIT }, (_, i) => i + 1);

// Seconds within the scene, timed to the voiceover lines below: each phase starts with
// its line, the prime lights up as it is named and its multiples are crossed out from
// `cross` seconds into the phase.
const PHASES: Record<
  number,
  { start: number; highlight: number; cross: number }
> = {
  2: { start: 12.6, highlight: 0.2, cross: 1.6 },
  3: { start: 17.3, highlight: 2.2, cross: 2.9 },
  5: { start: 22.6, highlight: 1.2, cross: 1.3 },
  7: { start: 25.3, highlight: 1.4, cross: 1.5 },
};
const CROSS_LENGTH = 1.3;
const ONE_DIMS_AT = 10.7;
const FINAL_START = 28.2;

const PHASE_END: Record<number, number> = {
  2: PHASES[3].start,
  3: PHASES[5].start,
  5: PHASES[7].start,
  7: FINAL_START,
};

const REMAINING_PRIMES = NUMBERS.filter(
  (n) => isPrime(n, SMALLEST_FACTOR) && PHASES[n] === undefined,
);

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// The 10 × 10 grid is one template driven by the sieve, not individually edited cells.
const Cell = ({ n }: { readonly n: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = interpolate(frame, [n * 0.4, n * 0.4 + 10], [0, 1], CLAMP);
  const prime = isPrime(n, SMALLEST_FACTOR);

  let crossed = 0;
  let flash = 0;
  let highlight = 0;
  let bump = 1;
  let ring = 0;

  if (n === 1) {
    crossed = interpolate(
      frame,
      [ONE_DIMS_AT * fps, ONE_DIMS_AT * fps + 8],
      [0, 1],
      CLAMP,
    );
  } else if (prime) {
    const phase = PHASES[n];
    const at = phase
      ? (phase.start + phase.highlight) * fps
      : FINAL_START * fps + REMAINING_PRIMES.indexOf(n);
    highlight = interpolate(frame, [at, at + 8], [0, 1], CLAMP);
    bump = interpolate(frame, [at, at + 5, at + 12], [1, 1.2, 1], CLAMP);
    if (phase) {
      const end = PHASE_END[n] * fps;
      ring = interpolate(
        frame,
        [at, at + 6, end - 6, end],
        [0, 1, 1, 0],
        CLAMP,
      );
    }
  } else {
    const p = SMALLEST_FACTOR[n];
    const progress = (n - p * p) / (LIMIT - p * p);
    const at =
      (PHASES[p].start + PHASES[p].cross + progress * CROSS_LENGTH) * fps;
    crossed = interpolate(frame, [at, at + 6], [0, 1], CLAMP);
    flash = interpolate(frame, [at, at + 3, at + 14], [0, 0.8, 0], CLAMP);
  }

  const background = prime
    ? interpolateColors(highlight, [0, 1], ["#151c33", "#f5c542"])
    : interpolateColors(crossed, [0, 1], ["#151c33", "#0e1326"]);
  const color = prime
    ? interpolateColors(highlight, [0, 1], ["#e6e9f5", "#0b1020"])
    : interpolateColors(crossed, [0, 1], ["#e6e9f5", "#323a5c"]);

  return (
    <div
      style={{
        position: "relative",
        width: 76,
        height: 76,
        borderRadius: 14,
        backgroundColor: background,
        border: `2px solid ${prime && highlight > 0.5 ? "#f5c542" : "#26304f"}`,
        boxShadow: `0 0 ${36 * ring}px ${8 * ring}px rgba(245, 197, 66, ${0.55 * ring})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "JetBrains Mono",
        fontWeight: prime ? 700 : 500,
        fontSize: 32,
        color,
        opacity: appear,
        scale: String(bump),
        boxSizing: "border-box",
      }}
    >
      {n}
      {n !== 1 && !prime ? (
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#ff6b6b",
            opacity: 0.7,
            rotate: "-30deg",
            scale: `${crossed} 1`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 12,
          backgroundColor: "#ff6b6b",
          opacity: flash,
        }}
      />
    </div>
  );
};

const SieveInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <div style={{ width: 780 }}>
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
          III век до н. э.
        </Interactive.Div>
        <Interactive.Div
          name="Title"
          style={{
            fontFamily: "Unbounded",
            fontWeight: 700,
            fontSize: 80,
            lineHeight: 1.15,
            color: "#ffffff",
            marginTop: 24,
            opacity: interpolate(frame, [0.2 * fps, 0.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [0.2 * fps, 1 * fps],
              ["0px 40px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          Решето Эратосфена
        </Interactive.Div>
        <div style={{ marginTop: 64, minHeight: 260 }}>
          <Track name="Steps">
            <Interactive.Div
              name="Step: question"
              from={0.6 * fps}
              durationInFrames={7.5 * fps}
              style={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 60,
                lineHeight: 1.25,
                color: "#e6e9f5",
                opacity: interpolate(frame, [0.6 * fps, 1.0 * fps], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              Как найти все простые числа до 100?
            </Interactive.Div>
            <Interactive.Div
              name="Step: list"
              from={8.1 * fps}
              durationInFrames={4.5 * fps}
              style={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 60,
                lineHeight: 1.25,
                color: "#e6e9f5",
                opacity: interpolate(frame, [8.1 * fps, 8.5 * fps], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              Выпишем числа от 1 до 100. Единица — не простое
            </Interactive.Div>
            <Interactive.Div
              name="Step: 2"
              from={12.6 * fps}
              durationInFrames={4.7 * fps}
              style={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 60,
                lineHeight: 1.25,
                color: "#e6e9f5",
                opacity: interpolate(frame, [12.6 * fps, 13.0 * fps], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              2 — простое. Вычёркиваем числа, кратные{" "}
              <span style={{ color: "#f5c542", fontWeight: 700 }}>2</span>
            </Interactive.Div>
            <Interactive.Div
              name="Step: 3"
              from={17.3 * fps}
              durationInFrames={5.3 * fps}
              style={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 60,
                lineHeight: 1.25,
                color: "#e6e9f5",
                opacity: interpolate(frame, [17.3 * fps, 17.7 * fps], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              Следующее — 3. Вычёркиваем кратные{" "}
              <span style={{ color: "#f5c542", fontWeight: 700 }}>3</span>
            </Interactive.Div>
            <Interactive.Div
              name="Step: 5"
              from={22.6 * fps}
              durationInFrames={2.7 * fps}
              style={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 60,
                lineHeight: 1.25,
                color: "#e6e9f5",
                opacity: interpolate(frame, [22.6 * fps, 23.0 * fps], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              Затем кратные{" "}
              <span style={{ color: "#f5c542", fontWeight: 700 }}>5</span>
            </Interactive.Div>
            <Interactive.Div
              name="Step: 7"
              from={25.3 * fps}
              durationInFrames={2.9 * fps}
              style={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 60,
                lineHeight: 1.25,
                color: "#e6e9f5",
                opacity: interpolate(frame, [25.3 * fps, 25.7 * fps], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              И кратные{" "}
              <span style={{ color: "#f5c542", fontWeight: 700 }}>7</span>
            </Interactive.Div>
            <Interactive.Div
              name="Step: result"
              from={28.2 * fps}
              durationInFrames={7.8 * fps}
              style={{
                fontFamily: "Unbounded",
                fontWeight: 700,
                fontSize: 64,
                lineHeight: 1.25,
                color: "#f5c542",
                scale: interpolate(frame, [28.2 * fps, 28.8 * fps], [0.85, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.spring({ damping: 14 }),
                  output: "perceptual-scale",
                }),
              }}
            >
              Осталось 25 простых чисел
            </Interactive.Div>
          </Track>
          <Interactive.Div
            name="Why stop at 7"
            from={30.9 * fps}
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 48,
              lineHeight: 1.3,
              color: "#9aa4c7",
              marginTop: 24,
              opacity: interpolate(frame, [30.9 * fps, 31.5 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            11² = 121 &gt; 100 — дальше вычёркивать нечего
          </Interactive.Div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 76px)",
          gap: 8,
        }}
      >
        {NUMBERS.map((n) => (
          <Cell key={n} n={n} />
        ))}
      </div>
      <Track name="Voiceover">
        <Audio
          name="Как найти простые"
          src={staticFile("voiceover/sieve-1.mp3")}
          from={0.6 * fps}
        />
        <Audio
          name="Выпишем числа"
          src={staticFile("voiceover/sieve-2.mp3")}
          from={8.1 * fps}
        />
        <Audio
          name="Кратные двум"
          src={staticFile("voiceover/sieve-3.mp3")}
          from={12.6 * fps}
        />
        <Audio
          name="Кратные трём"
          src={staticFile("voiceover/sieve-4.mp3")}
          from={17.3 * fps}
        />
        <Audio
          name="Кратные пяти"
          src={staticFile("voiceover/sieve-5.mp3")}
          from={22.6 * fps}
        />
        <Audio
          name="Кратные семи"
          src={staticFile("voiceover/sieve-6.mp3")}
          from={25.3 * fps}
        />
        <Audio
          name="Осталось 25"
          src={staticFile("voiceover/sieve-7.mp3")}
          from={28.2 * fps}
        />
      </Track>
    </>
  );
};

export const Sieve = Interactive.create({
  Component: SieveInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
