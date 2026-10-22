import { Audio } from "@remotion/media";
import { Interactive, staticFile, Track, useVideoConfig } from "remotion";
import "../fonts";

const WhyInner = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Track name="Voiceover">
        <Audio
          name="why-1"
          src={staticFile("voiceover/why-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="why-2"
          src={staticFile("voiceover/why-2.mp3")}
          from={9.7 * fps}
        />
        <Audio
          name="why-3"
          src={staticFile("voiceover/why-3.mp3")}
          from={23.1 * fps}
        />
        <Audio
          name="why-4"
          src={staticFile("voiceover/why-4.mp3")}
          from={31.1 * fps}
        />
      </Track>
    </>
  );
};

export const Why = Interactive.create({
  Component: WhyInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
