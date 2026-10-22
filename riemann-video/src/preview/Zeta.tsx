// Preview entry that bundles only this scene (used while scenes are built in parallel).
import { Composition, registerRoot } from "remotion";
import { Zeta } from "../scenes/Zeta";

registerRoot(() => (
  <Composition
    id="Zeta"
    component={Zeta}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={1170}
    defaultProps={{ style: { backgroundColor: "#0b1020" } }}
  />
));
