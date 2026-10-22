import {
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PRIMES } from "./math";

// Strip of number tiles 1–60: 3 rows × 20 columns, 72 px tiles, 8 px column gap,
// 20 px row gap (room for the coral gap markers between rows). Centred: 1592 px wide.
export const STRIP = { left: 164, top: 460, tile: 72, stepX: 80, stepY: 92 };

const SMALL_PRIMES = PRIMES.filter((p) => p <= 60);

// Composite runs between 23→29, 31→37 and 47→53 («далеко»).
const FAR_RUNS: Record<number, number> = {
  24: 0,
  25: 1,
  26: 2,
  27: 3,
  28: 4,
  32: 0,
  33: 1,
  34: 2,
  35: 3,
  36: 4,
  48: 0,
  49: 1,
  50: 2,
  51: 3,
  52: 4,
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Scene times in seconds (word onsets from the voiceover).
const ENTER = 0.3; // tiles fade in, one frame apart
const LIGHT_START = 1.4; // «простых»: primes light up one by one…
const LIGHT_STEP = 0.33; // …across the line, the last one at ≈ 6.7 s
const ONE_DIM = 3.74; // «единицы»: 1 is not prime
const SCATTER = 8.45; // «разбросаны хаотично»: primes jiggle
const FAR = 13.22; // «далеко»

export const NumberTiles = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {Array.from({ length: 60 }, (_, i) => {
        const n = i + 1;
        const primeIndex = SMALL_PRIMES.indexOf(n);
        const isPrime = primeIndex >= 0;
        const lightAt = (LIGHT_START + primeIndex * LIGHT_STEP) * fps;
        const lit = isPrime
          ? interpolate(frame, [lightAt, lightAt + 6], [0, 1], clamp)
          : 0;
        const pop = isPrime
          ? interpolate(
              frame,
              [lightAt, lightAt + 0.15 * fps, lightAt + 0.45 * fps],
              [1, 1.18, 1],
              clamp,
            )
          : 1;
        const jiggleAt = (SCATTER + random(`primes-jiggle-${n}`) * 0.9) * fps;
        const jiggle = isPrime
          ? interpolate(
              frame,
              [jiggleAt, jiggleAt + 0.18 * fps, jiggleAt + 0.42 * fps],
              [1, 1.12, 1],
              clamp,
            )
          : 1;
        const runPos = FAR_RUNS[n];
        const far =
          runPos === undefined
            ? 0
            : interpolate(
                frame,
                [FAR * fps + runPos * 2, FAR * fps + runPos * 2 + 8],
                [0, 1],
                clamp,
              );
        const enter = interpolate(
          frame,
          [ENTER * fps + i, ENTER * fps + i + 8],
          [0, 1],
          clamp,
        );
        const dim =
          n === 1
            ? interpolate(
                frame,
                [ONE_DIM * fps, ONE_DIM * fps + 10],
                [1, 0.45],
                clamp,
              )
            : 1;

        const background =
          runPos === undefined
            ? interpolateColors(lit, [0, 1], ["#151c33", "#f5c542"])
            : interpolateColors(far, [0, 1], ["#151c33", "#38283b"]);
        const border =
          runPos === undefined
            ? interpolateColors(lit, [0, 1], ["#26304f", "#f5c542"])
            : interpolateColors(far, [0, 1], ["#26304f", "#ff6b6b"]);
        const color =
          runPos === undefined
            ? interpolateColors(lit, [0, 1], ["#9aa4c7", "#0b1020"])
            : interpolateColors(far, [0, 1], ["#9aa4c7", "#ff6b6b"]);

        return (
          <div
            key={n}
            style={{
              position: "absolute",
              left: STRIP.left + (i % 20) * STRIP.stepX,
              top: STRIP.top + Math.floor(i / 20) * STRIP.stepY,
              width: STRIP.tile,
              height: STRIP.tile,
              boxSizing: "border-box",
              borderRadius: 14,
              border: `3px solid ${border}`,
              backgroundColor: background,
              boxShadow: `0 0 ${26 * lit}px rgba(245, 197, 66, ${0.5 * lit})`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              fontSize: 34,
              color,
              opacity: enter * dim,
              translate: `0px ${(1 - enter) * 14}px`,
              scale: String(pop * jiggle),
            }}
          >
            {n}
          </div>
        );
      })}
    </>
  );
};
