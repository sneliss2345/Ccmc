// Preview entry that bundles only this scene (used while scenes are built in parallel).
import { Composition, registerRoot } from "remotion";
import { Zeros } from "../scenes/Zeros";

registerRoot(() => (
  <Composition
    id="Zeros"
    component={Zeros}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={1200}
    defaultProps={{ style: { backgroundColor: "#0b1020" } }}
  />
));
