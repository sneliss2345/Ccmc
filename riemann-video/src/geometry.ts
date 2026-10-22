// Shared placement of the ζ(s) domain-colouring panel (public/zeta-domain.png), so the
// Plane and Zeros scenes line up exactly across the fade between them.
export const PANEL = {
  left: 1060,
  top: 90,
  width: 720,
  height: 900,
  reMin: -5,
  reMax: 3,
  imMin: -2,
  imMax: 36,
} as const;

/** Horizontal pixel position (in the 1920×1080 frame) of a real part. */
export const reToX = (re: number) =>
  PANEL.left + ((re - PANEL.reMin) / (PANEL.reMax - PANEL.reMin)) * PANEL.width;

/** Vertical pixel position (in the 1920×1080 frame) of an imaginary part. */
export const imToY = (im: number) =>
  PANEL.top + ((PANEL.imMax - im) / (PANEL.imMax - PANEL.imMin)) * PANEL.height;
