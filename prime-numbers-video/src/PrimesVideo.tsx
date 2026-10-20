import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useVideoConfig } from "remotion";
import { Cryptography } from "./scenes/Cryptography";
import { Definition } from "./scenes/Definition";
import { Distribution } from "./scenes/Distribution";
import { Euclid } from "./scenes/Euclid";
import { Factorization } from "./scenes/Factorization";
import { Intro } from "./scenes/Intro";
import { OpenProblems } from "./scenes/OpenProblems";
import { Outro } from "./scenes/Outro";
import { Sieve } from "./scenes/Sieve";

// 9 scenes totalling 78 s, minus 8 fades of 15 frames: 2220 frames at 30 fps.
export const PrimesVideo = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Intro" durationInFrames={6 * fps}>
        <Intro
          style={{
            backgroundColor: "#0b1020",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Definition" durationInFrames={7 * fps}>
        <Definition
          style={{
            backgroundColor: "#0b1020",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "0 160px",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Sieve" durationInFrames={12 * fps}>
        <Sieve
          style={{
            backgroundColor: "#0b1020",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 140px",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence
        name="Factorization"
        durationInFrames={8 * fps}
      >
        <Factorization
          style={{
            backgroundColor: "#0b1020",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Euclid" durationInFrames={12 * fps}>
        <Euclid
          style={{
            backgroundColor: "#0b1020",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "0 160px",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Distribution" durationInFrames={9 * fps}>
        <Distribution
          style={{
            backgroundColor: "#0b1020",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "0 140px",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Cryptography" durationInFrames={8 * fps}>
        <Cryptography
          style={{
            backgroundColor: "#0b1020",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "0 160px",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence
        name="Open problems"
        durationInFrames={10 * fps}
      >
        <OpenProblems
          style={{
            backgroundColor: "#0b1020",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Outro" durationInFrames={6 * fps}>
        <Outro
          style={{
            backgroundColor: "#0b1020",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
