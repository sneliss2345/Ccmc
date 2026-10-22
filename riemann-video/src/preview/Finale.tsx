// Preview entry that bundles only this scene (used while scenes are built in parallel).
import { Composition, registerRoot } from "remotion";
import { Finale } from "../scenes/Finale";

registerRoot(() => (
  <Composition
    id="Finale"
    component={Finale}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={645}
    defaultProps={{ style: { backgroundColor: "#0b1020" } }}
  />
));
