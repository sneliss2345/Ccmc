// Preview entry that bundles only this scene (used while scenes are built in parallel).
import { Composition, registerRoot } from "remotion";
import { Plane } from "../scenes/Plane";

registerRoot(() => (
  <Composition
    id="Plane"
    component={Plane}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={1020}
    defaultProps={{ style: { backgroundColor: "#0b1020" } }}
  />
));
