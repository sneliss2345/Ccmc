import { Audio } from "@remotion/media";
import { Interactive, staticFile, Track, useVideoConfig } from "remotion";
import "../fonts";

const WalkInner = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Track name="Voiceover">
        <Audio
          name="walk-1"
          src={staticFile("voiceover/walk-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="walk-2"
          src={staticFile("voiceover/walk-2.mp3")}
          from={7.3 * fps}
        />
      </Track>
    </>
  );
};

export const Walk = Interactive.create({
  Component: WalkInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
