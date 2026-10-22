import "katex/dist/katex.min.css";
import katex from "katex";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, Interactive } from "remotion";

const KATEX_FONTS = [
  "KaTeX_Main",
  "KaTeX_Math",
  "KaTeX_Size1",
  "KaTeX_Size2",
  "KaTeX_Size3",
  "KaTeX_AMS",
];

// KaTeX declares its faces in CSS and the browser fetches them lazily, so hold
// the frame until they are loaded or the first frames render with fallbacks.
const useKatexFonts = () => {
  const [handle] = useState(() => delayRender("Loading KaTeX fonts"));
  useEffect(() => {
    Promise.all(
      KATEX_FONTS.flatMap((family) => [
        document.fonts.load(`400 40px ${family}`),
        document.fonts.load(`italic 400 40px ${family}`),
      ]),
    )
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

const TexInner = ({
  tex,
  display = false,
  style,
}: {
  readonly tex: string;
  readonly display?: boolean;
  readonly style?: React.CSSProperties;
}) => {
  useKatexFonts();
  const html = useMemo(
    () =>
      // \displaystyle gives full-size fractions and limits without KaTeX's
      // display-mode block margins, so layout stays under our control.
      katex.renderToString(display ? `\\displaystyle ${tex}` : tex, {
        displayMode: false,
        output: "html",
        throwOnError: false,
        strict: false,
      }),
    [tex, display],
  );

  return (
    <div
      style={{ whiteSpace: "nowrap", ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/** A LaTeX formula rendered with KaTeX. Size and color come from `style`. */
export const Tex = Interactive.create({
  Component: TexInner,
  layout: "none",
  schema: {
    ...Interactive.textSchema,
    tex: { type: "string", default: "", description: "LaTeX" },
    display: {
      type: "boolean",
      default: false,
      description: "Display style (large fractions)",
    },
  },
});
