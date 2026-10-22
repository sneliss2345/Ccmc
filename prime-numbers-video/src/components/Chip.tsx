import type React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const ChipInner = ({
  children,
  style,
}: {
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 32px",
        borderRadius: 20,
        whiteSpace: "nowrap",
        opacity: interpolate(frame, [0, 0.25 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(frame, [0, 0.5 * fps], [0.6, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 12 }),
          output: "perceptual-scale",
        }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Chip = Interactive.create({
  Component: ChipInner,
  layout: "none",
  schema: {
    ...Interactive.textSchema,
    ...Interactive.backgroundSchema,
    ...Interactive.borderRadiusSchema,
    ...Interactive.childrenSchema,
  },
});
