import { Audio } from "@remotion/media";
import { Interactive, staticFile, Track, useVideoConfig } from "remotion";
import "../fonts";

const EvidenceInner = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Track name="Voiceover">
        <Audio
          name="evidence-1"
          src={staticFile("voiceover/evidence-1.mp3")}
          from={0.5 * fps}
        />
        <Audio
          name="evidence-2"
          src={staticFile("voiceover/evidence-2.mp3")}
          from={7.6 * fps}
        />
      </Track>
    </>
  );
};

export const Evidence = Interactive.create({
  Component: EvidenceInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
