import { Audio } from "@remotion/media";
import { Interactive, staticFile, Track, useVideoConfig } from "remotion";
import "../fonts";

const FinaleInner = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Track name="Voiceover">
        <Audio
          name="finale-1"
          src={staticFile("voiceover/finale-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="finale-2"
          src={staticFile("voiceover/finale-2.mp3")}
          from={6.3 * fps}
        />
        <Audio
          name="finale-3"
          src={staticFile("voiceover/finale-3.mp3")}
          from={12.9 * fps}
        />
      </Track>
    </>
  );
};

export const Finale = Interactive.create({
  Component: FinaleInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
