import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";

// Imported by every scene so that each connected composition
// also has its fonts when opened standalone in the Studio.
loadUnbounded("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin", "cyrillic"],
});

// "greek" is needed for π and ζ.
loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic", "greek"],
});

loadJetBrainsMono("normal", {
  weights: ["500", "700"],
  subsets: ["latin", "cyrillic", "greek"],
});
