import { Audio } from "@remotion/media";
import { Interactive, staticFile, Track, useVideoConfig } from "remotion";
import "../fonts";

const PlaneInner = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Track name="Voiceover">
        <Audio
          name="plane-1"
          src={staticFile("voiceover/plane-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="plane-2"
          src={staticFile("voiceover/plane-2.mp3")}
          from={8.3 * fps}
        />
        <Audio
          name="plane-3"
          src={staticFile("voiceover/plane-3.mp3")}
          from={16.4 * fps}
        />
        <Audio
          name="plane-4"
          src={staticFile("voiceover/plane-4.mp3")}
          from={26.5 * fps}
        />
      </Track>
    </>
  );
};

export const Plane = Interactive.create({
  Component: PlaneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
