// Preview entry that bundles only this scene (used while scenes are built in parallel).
import { Composition, registerRoot } from "remotion";
import { Walk } from "../scenes/Walk";

registerRoot(() => (
  <Composition
    id="Walk"
    component={Walk}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={525}
    defaultProps={{ style: { backgroundColor: "#0b1020" } }}
  />
));
