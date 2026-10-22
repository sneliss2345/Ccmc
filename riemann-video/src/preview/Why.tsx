// Preview entry that bundles only this scene (used while scenes are built in parallel).
import { Composition, registerRoot } from "remotion";
import { Why } from "../scenes/Why";

registerRoot(() => (
  <Composition
    id="Why"
    component={Why}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={1305}
    defaultProps={{ style: { backgroundColor: "#0b1020" } }}
  />
));
