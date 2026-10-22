import { Composition, Folder } from "remotion";
import { RiemannVideo } from "./RiemannVideo";
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

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RiemannVideo"
        component={RiemannVideo}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={8850}
      />
      <Folder name="Scenes">
        <Composition
          id="Intro"
          component={Intro}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={285}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
            },
          }}
        />
        <Composition
          id="Primes"
          component={Primes}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={885}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
            },
          }}
        />
        <Composition
          id="Paper"
          component={Paper}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={510}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
            },
          }}
        />
        <Composition
          id="Zeta"
          component={Zeta}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={1170}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
            },
          }}
        />
        <Composition
          id="Plane"
          component={Plane}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={1020}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
            },
          }}
        />
        <Composition
          id="Zeros"
          component={Zeros}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={1200}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
            },
          }}
        />
        <Composition
          id="Walk"
          component={Walk}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={525}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
            },
          }}
        />
        <Composition
          id="Music"
          component={Music}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={1005}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
            },
          }}
        />
        <Composition
          id="Evidence"
          component={Evidence}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={450}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
            },
          }}
        />
        <Composition
          id="Why"
          component={Why}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={1305}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
            },
          }}
        />
        <Composition
          id="Finale"
          component={Finale}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={645}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
            },
          }}
        />
      </Folder>
    </>
  );
};
