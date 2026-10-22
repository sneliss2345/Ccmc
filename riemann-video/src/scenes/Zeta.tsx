import { Audio } from "@remotion/media";
import { Interactive, staticFile, Track, useVideoConfig } from "remotion";
import "../fonts";

const ZetaInner = () => {
  const { fps } = useVideoConfig();

  return (
    <>
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
