import { Audio } from "@remotion/media";
import { Interactive, staticFile, Track, useVideoConfig } from "remotion";
import "../fonts";

const MusicInner = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Track name="Voiceover">
        <Audio
          name="music-1"
          src={staticFile("voiceover/music-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="music-2"
          src={staticFile("voiceover/music-2.mp3")}
          from={5.8 * fps}
        />
        <Audio
          name="music-3"
          src={staticFile("voiceover/music-3.mp3")}
          from={11 * fps}
        />
        <Audio
          name="music-4"
          src={staticFile("voiceover/music-4.mp3")}
          from={17.5 * fps}
        />
        <Audio
          name="music-5"
          src={staticFile("voiceover/music-5.mp3")}
          from={23.6 * fps}
        />
      </Track>
    </>
  );
};

export const Music = Interactive.create({
  Component: MusicInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
