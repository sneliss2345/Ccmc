import { Audio } from "@remotion/media";
import { Interactive, staticFile, Track, useVideoConfig } from "remotion";
import "../fonts";

const PrimesInner = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Track name="Voiceover">
        <Audio
          name="primes-1"
          src={staticFile("voiceover/primes-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="primes-2"
          src={staticFile("voiceover/primes-2.mp3")}
          from={8.3 * fps}
        />
        <Audio
          name="primes-3"
          src={staticFile("voiceover/primes-3.mp3")}
          from={14.9 * fps}
        />
        <Audio
          name="primes-4"
          src={staticFile("voiceover/primes-4.mp3")}
          from={22.5 * fps}
        />
      </Track>
    </>
  );
};

export const Primes = Interactive.create({
  Component: PrimesInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
