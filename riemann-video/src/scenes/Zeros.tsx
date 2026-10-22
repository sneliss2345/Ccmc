import { Audio } from "@remotion/media";
import { Interactive, staticFile, Track, useVideoConfig } from "remotion";
import "../fonts";

const ZerosInner = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Track name="Voiceover">
        <Audio
          name="zeros-1"
          src={staticFile("voiceover/zeros-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="zeros-2"
          src={staticFile("voiceover/zeros-2.mp3")}
          from={8.5 * fps}
        />
        <Audio
          name="zeros-3"
          src={staticFile("voiceover/zeros-3.mp3")}
          from={15.1 * fps}
        />
        <Audio
          name="zeros-4"
          src={staticFile("voiceover/zeros-4.mp3")}
          from={24.3 * fps}
        />
        <Audio
          name="zeros-5"
          src={staticFile("voiceover/zeros-5.mp3")}
          from={31.8 * fps}
        />
      </Track>
    </>
  );
};

export const Zeros = Interactive.create({
  Component: ZerosInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
