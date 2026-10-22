import { AbsoluteFill } from "remotion";
import { Tex } from "./components/Tex";
import "./fonts";

export const TexTest = () => (
  <AbsoluteFill style={{ backgroundColor: "#0b1020", justifyContent: "center", alignItems: "center", gap: 40, color: "#ffffff" }}>
    <Tex name="a" tex={String.raw`\zeta(s) = 1 + \frac{1}{2^s} + \frac{1}{3^s} + \frac{1}{4^s} + \cdots`} style={{ fontSize: 80 }} />
    <Tex name="b" tex={String.raw`\sum_{n=1}^{\infty} \frac{1}{n^s} = \prod_{p} \frac{1}{1 - p^{-s}}`} style={{ fontSize: 80, color: "#f5c542" }} />
    <Tex name="c" tex={String.raw`\pi(x) = \operatorname{Li}(x) + O\!\left(\sqrt{x}\,\ln x\right)`} style={{ fontSize: 64 }} />
    <div style={{ fontFamily: "Inter", fontSize: 48 }}>Все нетривиальные нули лежат на прямой <Tex name="d" tex={String.raw`\operatorname{Re} s = \tfrac12`} style={{ display: "inline-block", fontSize: 52 }} /></div>
  </AbsoluteFill>
);
