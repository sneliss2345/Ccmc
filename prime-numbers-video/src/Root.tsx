import { Composition, Folder } from "remotion";
import { FactorTree } from "./components/FactorTree";
import { ProblemCard } from "./components/ProblemCard";
import { PrimesVideo } from "./PrimesVideo";
import { Cryptography } from "./scenes/Cryptography";
import { Definition } from "./scenes/Definition";
import { Distribution } from "./scenes/Distribution";
import { Euclid } from "./scenes/Euclid";
import { Factorization } from "./scenes/Factorization";
import { Intro } from "./scenes/Intro";
import { OpenProblems } from "./scenes/OpenProblems";
import { Outro } from "./scenes/Outro";
import { Sieve } from "./scenes/Sieve";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PrimesVideo"
        component={PrimesVideo}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={5640}
      />
      <Folder name="Scenes">
        <Composition
          id="Intro"
          component={Intro}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={225}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        />
        <Composition
          id="Definition"
          component={Definition}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={555}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "0 160px",
            },
          }}
        />
        <Composition
          id="Sieve"
          component={Sieve}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={1080}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 140px",
            },
          }}
        />
        <Composition
          id="Factorization"
          component={Factorization}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={615}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        />
        <Composition
          id="Euclid"
          component={Euclid}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={870}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "0 160px",
            },
          }}
        />
        <Composition
          id="Distribution"
          component={Distribution}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={810}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "0 140px",
            },
          }}
        />
        <Composition
          id="Cryptography"
          component={Cryptography}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={675}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "0 160px",
            },
          }}
        />
        <Composition
          id="OpenProblems"
          component={OpenProblems}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={705}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        />
        <Composition
          id="Outro"
          component={Outro}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={225}
          defaultProps={{
            style: {
              backgroundColor: "#0b1020",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        />
      </Folder>
      <Folder name="Elements">
        <Composition
          id="FactorTree"
          component={FactorTree}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={90}
          defaultProps={{
            root: 60,
            left: 6,
            right: 10,
            leftA: 2,
            leftB: 3,
            rightA: 2,
            rightB: 5,
          }}
        />
        <Composition
          id="ProblemCard"
          component={ProblemCard}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={90}
          defaultProps={{
            title: "Гипотеза Римана",
            formula: "Re s = ½",
            children: "Где лежат нули дзета-функции ζ(s)? Приз — $1 000 000",
            style: {
              backgroundColor: "#151c33",
            },
          }}
        />
      </Folder>
    </>
  );
};
