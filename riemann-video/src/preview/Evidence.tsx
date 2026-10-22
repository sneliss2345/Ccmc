// Preview entry that bundles only this scene (used while scenes are built in parallel).
import { Composition, registerRoot } from "remotion";
import { Evidence } from "../scenes/Evidence";

registerRoot(() => (
  <Composition
    id="Evidence"
    component={Evidence}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={450}
    defaultProps={{ style: { backgroundColor: "#0b1020" } }}
  />
));
