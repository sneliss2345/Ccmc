import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useVideoConfig } from "remotion";
import { Evidence } from "./scenes/Evidence";
import { Finale } from "./scenes/Finale";
import { Intro } from "./scenes/Intro";
import { Music } from "./scenes/Music";
import { Paper } from "./scenes/Paper";
import { Plane } from "./scenes/Plane";
import { Primes } from "./scenes/Primes";
import { Walk } from "./scenes/Walk";
import { Why } from "./scenes/Why";
import { Zeros } from "./scenes/Zeros";
import { Zeta } from "./scenes/Zeta";

// 11 scenes with 10 fades of 15 frames: 8850 frames at 30 fps.
// Scene lengths follow the voiceover; see scripts/narration.json.
export const RiemannVideo = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Intro" durationInFrames={9.5 * fps}>
        <Intro style={{ backgroundColor: "#0b1020" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Primes" durationInFrames={29.5 * fps}>
        <Primes style={{ backgroundColor: "#0b1020" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Paper" durationInFrames={17 * fps}>
        <Paper style={{ backgroundColor: "#0b1020" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Zeta" durationInFrames={39 * fps}>
        <Zeta style={{ backgroundColor: "#0b1020" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Plane" durationInFrames={34 * fps}>
        <Plane style={{ backgroundColor: "#0b1020" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Zeros" durationInFrames={40 * fps}>
        <Zeros style={{ backgroundColor: "#0b1020" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Walk" durationInFrames={17.5 * fps}>
        <Walk style={{ backgroundColor: "#0b1020" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Music" durationInFrames={33.5 * fps}>
        <Music style={{ backgroundColor: "#0b1020" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Evidence" durationInFrames={15 * fps}>
        <Evidence style={{ backgroundColor: "#0b1020" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Why" durationInFrames={43.5 * fps}>
        <Why style={{ backgroundColor: "#0b1020" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Finale" durationInFrames={21.5 * fps}>
        <Finale style={{ backgroundColor: "#0b1020" }} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
