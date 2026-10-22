// Preview entry that bundles only this scene (used while scenes are built in parallel).
import { Composition, registerRoot } from "remotion";
import { Music } from "../scenes/Music";

registerRoot(() => (
  <Composition
    id="Music"
    component={Music}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={1005}
    defaultProps={{ style: { backgroundColor: "#0b1020" } }}
  />
));
