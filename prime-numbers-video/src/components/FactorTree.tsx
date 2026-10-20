import type React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { isPrime, smallestPrimeFactors } from "../primes";

const SMALLEST_FACTOR = smallestPrimeFactors(1000);

const RADIUS = 52;

// Node centers inside the 640 × 400 viewBox.
const ROOT = { x: 320, y: 60 };
const LEVEL_1 = [
  { x: 170, y: 205 },
  { x: 470, y: 205 },
];
const LEVEL_2 = [
  { x: 95, y: 345 },
  { x: 245, y: 345 },
  { x: 395, y: 345 },
  { x: 545, y: 345 },
];

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const Edge = ({
  from,
  to,
  progress,
}: {
  readonly from: { x: number; y: number };
  readonly to: { x: number; y: number };
  readonly progress: number;
}) => (
  <path
    d={`M ${from.x} ${from.y + RADIUS} L ${to.x} ${to.y - RADIUS}`}
    pathLength={1}
    stroke="#3a4570"
    strokeWidth={5}
    strokeLinecap="round"
    strokeDasharray={1}
    strokeDashoffset={1 - progress}
    fill="none"
  />
);

const Node = ({
  value,
  at,
  progress,
}: {
  readonly value: number;
  readonly at: { x: number; y: number };
  readonly progress: number;
}) => {
  const prime = isPrime(value, SMALLEST_FACTOR);
  return (
    <g
      style={{
        opacity: progress,
        scale: String(0.6 + 0.4 * progress),
        transformOrigin: `${at.x}px ${at.y}px`,
      }}
    >
      <circle
        cx={at.x}
        cy={at.y}
        r={RADIUS}
        fill={prime ? "#f5c542" : "#151c33"}
        stroke={prime ? "#f5c542" : "#3a4570"}
        strokeWidth={4}
      />
      <text
        x={at.x}
        y={at.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="JetBrains Mono"
        fontWeight={700}
        fontSize={value >= 100 ? 36 : 46}
        fill={prime ? "#0b1020" : "#ffffff"}
      >
        {value}
      </text>
    </g>
  );
};

type FactorTreeProps = {
  readonly root: number;
  readonly left: number;
  readonly right: number;
  readonly leftA: number;
  readonly leftB: number;
  readonly rightA: number;
  readonly rightB: number;
  readonly style?: React.CSSProperties;
};

const FactorTreeInner = ({
  root,
  left,
  right,
  leftA,
  leftB,
  rightA,
  rightB,
  style,
}: FactorTreeProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const rootIn = interpolate(frame, [0, 0.4 * fps], [0, 1], {
    ...CLAMP,
    easing: ease,
  });
  const edges1 = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], CLAMP);
  const level1In = interpolate(frame, [0.6 * fps, 1 * fps], [0, 1], {
    ...CLAMP,
    easing: ease,
  });
  const edges2 = interpolate(frame, [1 * fps, 1.5 * fps], [0, 1], CLAMP);
  const level2In = interpolate(frame, [1.3 * fps, 1.7 * fps], [0, 1], {
    ...CLAMP,
    easing: ease,
  });

  return (
    <svg width={640} height={400} viewBox="0 0 640 400" style={style}>
      <Edge from={ROOT} to={LEVEL_1[0]} progress={edges1} />
      <Edge from={ROOT} to={LEVEL_1[1]} progress={edges1} />
      <Edge from={LEVEL_1[0]} to={LEVEL_2[0]} progress={edges2} />
      <Edge from={LEVEL_1[0]} to={LEVEL_2[1]} progress={edges2} />
      <Edge from={LEVEL_1[1]} to={LEVEL_2[2]} progress={edges2} />
      <Edge from={LEVEL_1[1]} to={LEVEL_2[3]} progress={edges2} />
      <Node value={root} at={ROOT} progress={rootIn} />
      <Node value={left} at={LEVEL_1[0]} progress={level1In} />
      <Node value={right} at={LEVEL_1[1]} progress={level1In} />
      <Node value={leftA} at={LEVEL_2[0]} progress={level2In} />
      <Node value={leftB} at={LEVEL_2[1]} progress={level2In} />
      <Node value={rightA} at={LEVEL_2[2]} progress={level2In} />
      <Node value={rightB} at={LEVEL_2[3]} progress={level2In} />
    </svg>
  );
};

export const FactorTree = Interactive.create({
  Component: FactorTreeInner,
  layout: "none",
  schema: {
    root: {
      type: "number",
      default: 60,
      description: "Число",
      min: 2,
      step: 1,
      hiddenFromList: false,
    },
    left: {
      type: "number",
      default: 6,
      description: "Левый множитель",
      min: 2,
      step: 1,
      hiddenFromList: false,
    },
    right: {
      type: "number",
      default: 10,
      description: "Правый множитель",
      min: 2,
      step: 1,
      hiddenFromList: false,
    },
    leftA: {
      type: "number",
      default: 2,
      description: "Лист 1",
      min: 2,
      step: 1,
      hiddenFromList: false,
    },
    leftB: {
      type: "number",
      default: 3,
      description: "Лист 2",
      min: 2,
      step: 1,
      hiddenFromList: false,
    },
    rightA: {
      type: "number",
      default: 2,
      description: "Лист 3",
      min: 2,
      step: 1,
      hiddenFromList: false,
    },
    rightB: {
      type: "number",
      default: 5,
      description: "Лист 4",
      min: 2,
      step: 1,
      hiddenFromList: false,
    },
  },
});
