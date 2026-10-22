// Preview entry that bundles only this scene (used while scenes are built in parallel).
import { Composition, registerRoot } from "remotion";
import { Intro } from "../scenes/Intro";

registerRoot(() => (
  <Composition
    id="Intro"
    component={Intro}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={285}
    defaultProps={{ style: { backgroundColor: "#0b1020" } }}
  />
));
