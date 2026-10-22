import { Composition } from "remotion";
import { TexTest } from "./TexTest";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="TexTest" component={TexTest} width={1920} height={1080} fps={30} durationInFrames={30} />
    </>
  );
};
