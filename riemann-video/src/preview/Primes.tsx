// Preview entry that bundles only this scene (used while scenes are built in parallel).
import { Composition, registerRoot } from "remotion";
import { Primes } from "../scenes/Primes";

registerRoot(() => (
  <Composition
    id="Primes"
    component={Primes}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={885}
    defaultProps={{ style: { backgroundColor: "#0b1020" } }}
  />
));
