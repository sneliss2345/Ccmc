import { Audio } from "@remotion/media";
import { Interactive, staticFile, Track, useVideoConfig } from "remotion";
import "../fonts";

const PaperInner = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Track name="Voiceover">
        <Audio
          name="paper-1"
          src={staticFile("voiceover/paper-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="paper-2"
          src={staticFile("voiceover/paper-2.mp3")}
          from={9.6 * fps}
        />
      </Track>
    </>
  );
};

export const Paper = Interactive.create({
  Component: PaperInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
