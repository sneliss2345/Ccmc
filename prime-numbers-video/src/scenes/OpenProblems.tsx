import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ProblemCard } from "../components/ProblemCard";
import "../fonts";

const OpenProblemsInner = () => {
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
        Загадки, которые ждут решения
      </Interactive.Div>
      <Interactive.Div
        name="Headline"
        style={{
          fontFamily: "Unbounded",
          fontWeight: 700,
          fontSize: 104,
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
        Открытые вопросы
      </Interactive.Div>
      <div
        style={{
          display: "flex",
          gap: 50,
          marginTop: 64,
          height: 470,
        }}
      >
        <ProblemCard
          name="Riemann hypothesis"
          from={1.4 * fps}
          title="Гипотеза Римана"
          formula="Re s = ½"
          style={{ backgroundColor: "#151c33" }}
        >
          Где лежат нули дзета-функции ζ(s)? Приз — $1 000 000
        </ProblemCard>
        <ProblemCard
          name="Twin primes"
          from={3 * fps}
          title="Простые-близнецы"
          formula="p, p + 2"
          style={{ backgroundColor: "#151c33" }}
        >
          (11, 13), (17, 19), … Бесконечно ли таких пар?
        </ProblemCard>
        <ProblemCard
          name="Goldbach conjecture"
          from={4.6 * fps}
          title="Гипотеза Гольдбаха"
          formula="28 = 5 + 23"
          style={{ backgroundColor: "#151c33" }}
        >
          Всякое чётное число больше 2 — сумма двух простых?
        </ProblemCard>
      </div>
    </>
  );
};

export const OpenProblems = Interactive.create({
  Component: OpenProblemsInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
