import type React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const ProblemCardInner = ({
  title,
  formula,
  children,
  style,
}: {
  readonly title: string;
  readonly formula: string;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 520,
        height: 470,
        padding: 44,
        boxSizing: "border-box",
        borderRadius: 32,
        border: "3px solid #26304f",
        opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 0.6 * fps], ["0px 60px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: "Unbounded",
          fontWeight: 700,
          fontSize: 42,
          lineHeight: 1.2,
          color: "#ffffff",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 60,
          color: "#f5c542",
          marginTop: 36,
          whiteSpace: "nowrap",
        }}
      >
        {formula}
      </div>
      <div
        style={{
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 40,
          lineHeight: 1.3,
          color: "#9aa4c7",
          marginTop: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const ProblemCard = Interactive.create({
  Component: ProblemCardInner,
  layout: "none",
  schema: {
    ...Interactive.backgroundSchema,
    title: { type: "string", default: "", description: "Заголовок" },
    formula: { type: "string", default: "", description: "Формула" },
    ...Interactive.childrenSchema,
  },
});
