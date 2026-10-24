'use strict';
/* Procedural neon art: swarm, bosses, ships, shots, pickups and UI icons. */

const ART = { px: 0, enemy: {}, flash: {}, ship: {}, bolt: {}, misc: {} };
const glowCache = new Map();

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

function glow(hex) {
  let c = glowCache.get(hex);
  if (c) return c;
  c = makeCanvas(64, 64);
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, rgba(hex, 1)); gr.addColorStop(0.22, rgba(hex, 0.5)); gr.addColorStop(0.55, rgba(hex, 0.12)); gr.addColorStop(1, rgba(hex, 0));
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  glowCache.set(hex, c);
  return c;
}

// A sprite drawn in world units around its centre; `half` is the world half-size of the canvas.
function sprite(half, draw) {
  const px = ART.px;
  const size = Math.ceil(half * 2 * px);
  const c = makeCanvas(size, size);
  const g = c.getContext('2d');
  g.translate(size / 2, size / 2);
  g.scale(px, px);
  g.lineJoin = 'round'; g.lineCap = 'round';
  draw(g);
  return { c, s: size / px };
}

function poly(g, n, r, rot) {
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n;
    if (i) g.lineTo(Math.cos(a) * r, Math.sin(a) * r); else g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath();
}

function shapePath(g, shape, r) {
  g.beginPath();
  switch (shape) {
    case 'tri':
      g.moveTo(r, 0); g.lineTo(-r * 0.7, r * 0.82); g.lineTo(-r * 0.7, -r * 0.82); g.closePath(); break;
    case 'diamond':
      g.moveTo(r, 0); g.lineTo(0, r * 0.72); g.lineTo(-r, 0); g.lineTo(0, -r * 0.72); g.closePath(); break;
    case 'hex': poly(g, 6, r, Math.PI / 6); break;
    case 'arrow':
      g.moveTo(r * 1.15, 0); g.lineTo(-r * 0.75, r * 0.82); g.lineTo(-r * 0.3, 0); g.lineTo(-r * 0.75, -r * 0.82); g.closePath(); break;
    case 'eye': g.arc(0, 0, r, 0, TAU); break;
    case 'square': {
      const h = r * 0.8, k = r * 0.26;
      g.moveTo(-h + k, -h); g.lineTo(h - k, -h); g.lineTo(h, -h + k); g.lineTo(h, h - k); g.lineTo(h - k, h); g.lineTo(-h + k, h); g.lineTo(-h, h - k); g.lineTo(-h, -h + k); g.closePath();
      break;
    }
    case 'blob':
      for (let i = 0; i < 3; i++) {
        const a = (i * TAU) / 3 - Math.PI / 2, cx = Math.cos(a) * r * 0.42, cy = Math.sin(a) * r * 0.42;
        g.moveTo(cx + r * 0.58, cy); g.arc(cx, cy, r * 0.58, 0, TAU);
      }
      break;
    case 'ghost':
      g.moveTo(r * 0.15, -r * 0.75);
      g.arc(r * 0.15, 0, r * 0.75, -Math.PI / 2, Math.PI / 2);
      g.lineTo(-r, r * 0.55); g.lineTo(-r * 0.55, r * 0.2); g.lineTo(-r * 1.05, 0); g.lineTo(-r * 0.55, -r * 0.2); g.lineTo(-r, -r * 0.55);
      g.closePath();
      break;
    case 'crate': {
      const h = r * 0.78;
      g.rect(-h, -h * 0.8, h * 2, h * 1.6);
      break;
    }
    case 'queen':
      for (let i = 0; i < 16; i++) {
        const a = (i * TAU) / 16, rr = i % 2 ? r * 0.58 : r;
        if (i) g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else g.moveTo(rr, 0);
      }
      g.closePath();
      break;
    case 'dread': {
      const p = [[1, 0], [0.5, 0.45], [0.1, 0.5], [-0.2, 0.86], [-0.75, 0.86], [-0.6, 0.36], [-0.92, 0.2], [-0.92, -0.2], [-0.6, -0.36], [-0.75, -0.86], [-0.2, -0.86], [0.1, -0.5], [0.5, -0.45]];
      p.forEach(([x, y], i) => (i ? g.lineTo(x * r, y * r) : g.moveTo(x * r, y * r)));
      g.closePath();
      break;
    }
    case 'devourer': g.arc(0, 0, r, 0, TAU); break;
    default: g.arc(0, 0, r, 0, TAU);
  }
}

function shapeDetail(g, shape, r, color) {
  g.fillStyle = color; g.strokeStyle = color;
  switch (shape) {
    case 'tri': case 'arrow':
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.arc(0, 0, r * 0.18, 0, TAU); g.fill(); break;
    case 'diamond':
      g.globalAlpha = 0.75; g.beginPath(); g.moveTo(r * 0.4, 0); g.lineTo(0, r * 0.3); g.lineTo(-r * 0.4, 0); g.lineTo(0, -r * 0.3); g.closePath(); g.fill(); g.globalAlpha = 1; break;
    case 'hex':
      g.lineWidth = Math.max(1, r * 0.08); g.beginPath(); poly(g, 6, r * 0.52, Math.PI / 6); g.stroke();
      g.beginPath(); g.arc(0, 0, r * 0.18, 0, TAU); g.fill(); break;
    case 'eye':
      g.lineWidth = Math.max(1, r * 0.09); g.beginPath(); g.arc(0, 0, r * 0.58, 0, TAU); g.stroke();
      g.beginPath(); g.arc(r * 0.18, 0, r * 0.3, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(r * 0.28, -r * 0.08, r * 0.09, 0, TAU); g.fill(); break;
    case 'square':
      g.lineWidth = Math.max(1, r * 0.08); g.strokeRect(-r * 0.36, -r * 0.36, r * 0.72, r * 0.72);
      for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.beginPath(); g.arc(x * r * 0.56, y * r * 0.56, r * 0.07, 0, TAU); g.fill(); }
      break;
    case 'blob':
      for (let i = 0; i < 3; i++) { const a = (i * TAU) / 3 - Math.PI / 2; g.beginPath(); g.arc(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42, r * 0.14, 0, TAU); g.fill(); }
      break;
    case 'ghost':
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(r * 0.35, -r * 0.25, r * 0.12, 0, TAU); g.arc(r * 0.35, r * 0.25, r * 0.12, 0, TAU); g.fill(); break;
    case 'crate':
      g.lineWidth = Math.max(1, r * 0.1);
      g.beginPath(); g.moveTo(-r * 0.78, -r * 0.62); g.lineTo(r * 0.78, r * 0.62); g.moveTo(r * 0.78, -r * 0.62); g.lineTo(-r * 0.78, r * 0.62); g.stroke();
      g.beginPath(); g.arc(0, 0, r * 0.22, 0, TAU); g.fillStyle = '#fff6d6'; g.fill(); break;
    case 'queen':
      g.fillStyle = '#12061a'; g.beginPath(); g.arc(0, 0, r * 0.4, 0, TAU); g.fill();
      g.lineWidth = r * 0.06; g.beginPath(); g.arc(0, 0, r * 0.4, 0, TAU); g.stroke();
      g.fillStyle = color; g.beginPath(); g.ellipse(0, 0, r * 0.22, r * 0.12, 0, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, r * 0.06, 0, TAU); g.fill(); break;
    case 'dread':
      g.lineWidth = r * 0.04;
      g.beginPath(); g.moveTo(r * 0.85, 0); g.lineTo(-r * 0.7, 0); g.moveTo(-r * 0.2, -r * 0.6); g.lineTo(-r * 0.2, r * 0.6); g.stroke();
      g.fillStyle = '#fff3d6'; g.beginPath(); g.ellipse(r * 0.35, 0, r * 0.16, r * 0.09, 0, 0, TAU); g.fill();
      g.fillStyle = color;
      for (const s of [-1, 1]) { g.fillRect(-r * 0.62, s * r * 0.62 - r * 0.07, r * 0.42, r * 0.14); }
      break;
    case 'devourer':
      g.lineWidth = r * 0.05; g.beginPath(); g.arc(0, 0, r * 0.72, 0, TAU); g.stroke();
      g.beginPath();
      for (let i = 0; i < 14; i++) {
        const a = (i * TAU) / 14, b = a + TAU / 28;
        g.moveTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72);
        g.lineTo(Math.cos(b) * r * 0.42, Math.sin(b) * r * 0.42);
        g.lineTo(Math.cos(a + TAU / 14) * r * 0.72, Math.sin(a + TAU / 14) * r * 0.72);
      }
      g.fill();
      g.fillStyle = '#05010a'; g.beginPath(); g.arc(0, 0, r * 0.36, 0, TAU); g.fill();
      g.fillStyle = color; g.beginPath(); g.arc(0, 0, r * 0.1, 0, TAU); g.fill(); break;
  }
}

function neon(g, shape, r, color, flash) {
  shapePath(g, shape, r);
  if (flash) {
    g.fillStyle = '#ffffff'; g.fill();
    g.lineWidth = Math.max(1.4, r * 0.14); g.strokeStyle = '#ffffff'; g.stroke();
    return;
  }
  g.fillStyle = mixHex(color, '#060818', 0.8); g.fill();
  g.save();
  g.shadowColor = color; g.shadowBlur = r * 0.8 * ART.px;
  g.strokeStyle = color; g.lineWidth = Math.max(1.4, r * 0.14);
  g.stroke(); g.stroke();
  g.restore();
  g.lineWidth = Math.max(0.7, r * 0.05); g.strokeStyle = 'rgba(255,255,255,0.6)'; g.stroke();
  shapeDetail(g, shape, r, color);
}

function shipPath(g, r) {
  g.beginPath();
  g.moveTo(r * 1.3, 0);
  g.lineTo(r * 0.1, r * 0.38); g.lineTo(-r * 0.85, r * 1.0); g.lineTo(-r * 0.55, r * 0.32); g.lineTo(-r * 0.8, 0);
  g.lineTo(-r * 0.55, -r * 0.32); g.lineTo(-r * 0.85, -r * 1.0); g.lineTo(r * 0.1, -r * 0.38);
  g.closePath();
}
function drawShip(g, r, color) {
  shipPath(g, r);
  g.fillStyle = mixHex(color, '#060818', 0.72); g.fill();
  g.save(); g.shadowColor = color; g.shadowBlur = r * 0.9 * ART.px; g.strokeStyle = color; g.lineWidth = r * 0.14; g.stroke(); g.restore();
  g.lineWidth = r * 0.05; g.strokeStyle = 'rgba(255,255,255,0.75)'; g.stroke();
  g.fillStyle = '#eaffff'; g.beginPath(); g.ellipse(r * 0.38, 0, r * 0.32, r * 0.15, 0, 0, TAU); g.fill();
  g.strokeStyle = color; g.lineWidth = r * 0.06;
  g.beginPath(); g.moveTo(-r * 0.4, 0); g.lineTo(r * 0.02, 0); g.stroke();
}

function buildArt() {
  ART.px = view.px;
  for (const id of ENEMY_IDS) {
    const d = ENEMIES[id];
    ART.enemy[id] = sprite(d.r * 1.8, (g) => neon(g, d.shape, d.r, d.color, false));
    ART.flash[id] = sprite(d.r * 1.8, (g) => neon(g, d.shape, d.r, d.color, true));
  }
  for (const id in BOSSES) {
    const d = BOSSES[id];
    ART.enemy[id] = sprite(d.r * 1.6, (g) => neon(g, d.shape, d.r, d.color, false));
    ART.flash[id] = sprite(d.r * 1.6, (g) => neon(g, d.shape, d.r, d.color, true));
  }
  for (const s of SHIPS) ART.ship[s.id] = sprite(24, (g) => drawShip(g, 11, s.color));
  ART.shipFlash = sprite(24, (g) => { shipPath(g, 11); g.fillStyle = '#fff'; g.fill(); });
  for (const id of WEAPON_IDS) {
    const col = WEAPONS[id].color;
    ART.bolt[id] = sprite(14, (g) => {
      g.save(); g.shadowColor = col; g.shadowBlur = 6 * ART.px;
      g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.stroke(); g.restore();
      g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.moveTo(-5, 0); g.lineTo(8, 0); g.stroke();
    });
  }
  const M_ = ART.misc;
  M_.missile = sprite(12, (g) => {
    g.save(); g.shadowColor = '#ffb347'; g.shadowBlur = 6 * ART.px;
    g.fillStyle = '#ffb347'; g.beginPath(); g.moveTo(8, 0); g.lineTo(-5, 4.5); g.lineTo(-3, 0); g.lineTo(-5, -4.5); g.closePath(); g.fill(); g.restore();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(2, 0, 1.6, 0, TAU); g.fill();
  });
  M_.orb = sprite(14, (g) => {
    g.save(); g.shadowColor = '#9d7bff'; g.shadowBlur = 10 * ART.px;
    g.fillStyle = '#6a4bd8'; g.beginPath(); g.arc(0, 0, 7, 0, TAU); g.fill();
    g.strokeStyle = '#c9b6ff'; g.lineWidth = 2; g.stroke(); g.restore();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 2.6, 0, TAU); g.fill();
  });
  M_.disc = sprite(16, (g) => {
    g.beginPath();
    for (let i = 0; i < 16; i++) { const a = (i * TAU) / 16, rr = i % 2 ? 7.5 : 11; if (i) g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else g.moveTo(rr, 0); }
    g.closePath();
    g.fillStyle = '#123b36'; g.fill();
    g.save(); g.shadowColor = '#a0ffe6'; g.shadowBlur = 8 * ART.px; g.strokeStyle = '#a0ffe6'; g.lineWidth = 1.8; g.stroke(); g.restore();
    g.fillStyle = '#a0ffe6'; g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fill();
  });
  M_.mine = sprite(14, (g) => {
    g.strokeStyle = '#ff8a5c'; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const a = (i * TAU) / 6; g.beginPath(); g.moveTo(Math.cos(a) * 7, Math.sin(a) * 7); g.lineTo(Math.cos(a) * 10, Math.sin(a) * 10); g.stroke(); }
    g.fillStyle = '#3a1608'; g.beginPath(); g.arc(0, 0, 7, 0, TAU); g.fill();
    g.save(); g.shadowColor = '#ff8a5c'; g.shadowBlur = 6 * ART.px; g.stroke(); g.restore();
  });
  M_.ebul = sprite(12, (g) => {
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 11);
    gr.addColorStop(0, 'rgba(255,61,139,0.9)'); gr.addColorStop(0.5, 'rgba(255,61,139,0.35)'); gr.addColorStop(1, 'rgba(255,61,139,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 11, 0, TAU); g.fill();
    g.fillStyle = '#ff3d8b'; g.beginPath(); g.arc(0, 0, 5.5, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fill();
  });
  const GEMS = ['#4fc3ff', '#6dff9e', '#ffc247', '#ff5a5a'];
  M_.gem = GEMS.map((col, i) => sprite(10 + i * 2, (g) => {
    const r = 4.5 + i * 1.6;
    g.beginPath(); g.moveTo(0, -r * 1.3); g.lineTo(r, 0); g.lineTo(0, r * 1.3); g.lineTo(-r, 0); g.closePath();
    g.save(); g.shadowColor = col; g.shadowBlur = 8 * ART.px; g.fillStyle = col; g.fill(); g.restore();
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.moveTo(0, -r * 1.1); g.lineTo(r * 0.45, -r * 0.1); g.lineTo(0, 0); g.closePath(); g.fill();
  }));
  M_.coin = sprite(10, (g) => {
    g.save(); g.shadowColor = '#ffc247'; g.shadowBlur = 6 * ART.px;
    g.fillStyle = '#ffc247'; g.beginPath(); g.arc(0, 0, 5.5, 0, TAU); g.fill(); g.restore();
    g.strokeStyle = '#8a5a00'; g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, 3.2, 0, TAU); g.stroke();
  });
  const itemPlate = (col, glyphFn) => sprite(18, (g) => {
    g.save(); g.shadowColor = col; g.shadowBlur = 10 * ART.px;
    g.fillStyle = '#0b1028'; g.strokeStyle = col; g.lineWidth = 2;
    g.beginPath(); g.arc(0, 0, 11, 0, TAU); g.fill(); g.stroke(); g.restore();
    g.fillStyle = col; g.strokeStyle = col; glyphFn(g);
  });
  M_.heal = itemPlate('#6dff9e', (g) => { g.fillRect(-1.8, -6, 3.6, 12); g.fillRect(-6, -1.8, 12, 3.6); });
  M_.magnet = itemPlate('#ff7ad9', (g) => { g.lineWidth = 3; g.lineCap = 'butt'; g.beginPath(); g.arc(0, 0, 4.5, 0, Math.PI); g.moveTo(4.5, 0); g.lineTo(4.5, -5); g.moveTo(-4.5, 0); g.lineTo(-4.5, -5); g.stroke(); });
  M_.bomb = itemPlate('#ff8a3a', (g) => { g.beginPath(); for (let i = 0; i < 16; i++) { const a = (i * TAU) / 16, rr = i % 2 ? 2.6 : 7; if (i) g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else g.moveTo(rr, 0); } g.closePath(); g.fill(); });
  M_.chest = sprite(22, (g) => {
    g.save(); g.shadowColor = '#ffc247'; g.shadowBlur = 14 * ART.px;
    g.fillStyle = '#3a2606'; g.strokeStyle = '#ffc247'; g.lineWidth = 2;
    g.beginPath(); g.rect(-12, -8, 24, 17); g.fill(); g.stroke(); g.restore();
    g.strokeStyle = '#ffc247'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-12, -2); g.lineTo(12, -2); g.stroke();
    g.fillStyle = '#fff3c4'; g.fillRect(-2.5, -4.5, 5, 6);
  });
  M_.well = sprite(60, (g) => {
    const gr = g.createRadialGradient(0, 0, 6, 0, 0, 58);
    gr.addColorStop(0, 'rgba(230,210,255,0.9)'); gr.addColorStop(0.2, 'rgba(185,138,255,0.55)'); gr.addColorStop(0.6, 'rgba(90,40,180,0.22)'); gr.addColorStop(1, 'rgba(40,10,90,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 58, 0, TAU); g.fill();
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) {
      const rr = 10 + Math.pow(Math.random(), 1.3) * 46, a0 = Math.random() * TAU, len = 0.6 + Math.random() * 1.2;
      g.strokeStyle = 'rgba(' + (190 + ((Math.random() * 60) | 0)) + ',160,255,' + (0.15 + Math.random() * 0.3) + ')';
      g.lineWidth = 0.6 + Math.random() * 1.6;
      g.beginPath(); g.arc(0, 0, rr, a0, a0 + len); g.stroke();
    }
  });
}

/* ---------- UI icons (cached data URLs) ---------- */
const iconCache = new Map();
function glyph(g, id, col) {
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
  const line = (x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
  const circ = (x, y, r, fill) => { g.beginPath(); g.arc(x, y, r, 0, TAU); if (fill) g.fill(); else g.stroke(); };
  switch (id) {
    case 'blaster': g.lineWidth = 9; line(20, 32, 54, 32); line(34, 50, 80, 50); line(20, 68, 54, 68); break;
    case 'missile':
      g.save(); g.translate(50, 50); g.rotate(-Math.PI / 4);
      g.beginPath(); g.moveTo(0, -34); g.quadraticCurveTo(13, -20, 11, 14); g.lineTo(-11, 14); g.quadraticCurveTo(-13, -20, 0, -34); g.fill();
      g.beginPath(); g.moveTo(-11, 4); g.lineTo(-22, 22); g.lineTo(-11, 18); g.fill();
      g.beginPath(); g.moveTo(11, 4); g.lineTo(22, 22); g.lineTo(11, 18); g.fill();
      g.globalAlpha = 0.7; g.beginPath(); g.moveTo(-7, 18); g.lineTo(0, 36); g.lineTo(7, 18); g.fill();
      g.restore(); break;
    case 'drones':
      g.lineWidth = 3; g.setLineDash([6, 6]); circ(50, 50, 30); g.setLineDash([]);
      circ(50, 50, 9, true); circ(80, 50, 8, true); circ(35, 24, 8, true); circ(35, 76, 8, true); break;
    case 'nova': circ(50, 50, 10, true); g.lineWidth = 6; circ(50, 50, 24); g.globalAlpha = 0.55; circ(50, 50, 38); break;
    case 'lightning':
      g.beginPath(); g.moveTo(58, 10); g.lineTo(28, 54); g.lineTo(48, 54); g.lineTo(40, 90); g.lineTo(74, 42); g.lineTo(53, 42); g.lineTo(64, 10); g.closePath(); g.fill(); break;
    case 'aura': circ(50, 50, 16, true); g.globalAlpha = 0.45; g.lineWidth = 12; circ(50, 50, 32); break;
    case 'disc':
      g.beginPath();
      for (let i = 0; i < 16; i++) { const a = (i * TAU) / 16, rr = i % 2 ? 26 : 36; const x = 50 + Math.cos(a) * rr, y = 50 + Math.sin(a) * rr; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.closePath(); g.fill(); g.fillStyle = '#0b1028'; circ(50, 50, 9, true); break;
    case 'mines':
      for (let i = 0; i < 6; i++) { const a = (i * TAU) / 6; line(50 + Math.cos(a) * 20, 50 + Math.sin(a) * 20, 50 + Math.cos(a) * 34, 50 + Math.sin(a) * 34); }
      circ(50, 50, 20, true); g.fillStyle = '#0b1028'; circ(50, 50, 6, true); break;
    case 'laser':
      g.fillRect(12, 38, 22, 24); g.lineWidth = 10; line(34, 50, 88, 50); g.strokeStyle = '#ffffff'; g.lineWidth = 3; line(36, 50, 86, 50); break;
    case 'singularity':
      g.lineWidth = 6;
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        for (let t = 0; t <= 1.001; t += 0.05) { const a = (k * TAU) / 3 + t * 3.2, rr = 6 + t * 32; const x = 50 + Math.cos(a) * rr, y = 50 + Math.sin(a) * rr; if (t) g.lineTo(x, y); else g.moveTo(x, y); }
        g.stroke();
      }
      g.fillStyle = '#0b1028'; circ(50, 50, 7, true); break;
    case 'might': g.lineWidth = 9; g.beginPath(); g.moveTo(26, 52); g.lineTo(50, 28); g.lineTo(74, 52); g.stroke(); g.beginPath(); g.moveTo(26, 76); g.lineTo(50, 52); g.lineTo(74, 76); g.stroke(); break;
    case 'cooldown':
      g.lineWidth = 7; circ(50, 52, 30); line(50, 52, 50, 32); line(50, 52, 64, 60); g.lineWidth = 8; line(42, 14, 58, 14); break;
    case 'area':
      g.lineWidth = 8;
      for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { g.beginPath(); g.moveTo(50 + sx * 34, 50 + sy * 16); g.lineTo(50 + sx * 34, 50 + sy * 34); g.lineTo(50 + sx * 16, 50 + sy * 34); g.stroke(); }
      circ(50, 50, 8, true); break;
    case 'speed': g.lineWidth = 7; line(14, 34, 40, 34); line(8, 50, 40, 50); line(14, 66, 40, 66); g.beginPath(); g.moveTo(48, 24); g.lineTo(84, 50); g.lineTo(48, 76); g.closePath(); g.fill(); break;
    case 'amount': circ(50, 28, 13, true); circ(28, 68, 13, true); circ(72, 68, 13, true); break;
    case 'move': g.lineWidth = 10; g.beginPath(); g.moveTo(22, 24); g.lineTo(46, 50); g.lineTo(22, 76); g.stroke(); g.beginPath(); g.moveTo(52, 24); g.lineTo(76, 50); g.lineTo(52, 76); g.stroke(); break;
    case 'hull': g.beginPath(); g.moveTo(50, 12); g.lineTo(82, 24); g.lineTo(82, 50); g.quadraticCurveTo(80, 76, 50, 90); g.quadraticCurveTo(20, 76, 18, 50); g.lineTo(18, 24); g.closePath(); g.fill(); break;
    case 'armor':
      g.lineWidth = 7; g.save(); g.translate(50, 50);
      g.beginPath(); poly(g, 6, 34, Math.PI / 6); g.stroke(); g.beginPath(); poly(g, 6, 16, Math.PI / 6); g.fill();
      g.restore(); break;
    case 'regen': g.fillRect(40, 16, 20, 68); g.fillRect(16, 40, 68, 20); break;
    case 'magnet': g.lineWidth = 16; g.lineCap = 'butt'; g.beginPath(); g.arc(50, 50, 22, 0, Math.PI); g.moveTo(72, 50); g.lineTo(72, 20); g.moveTo(28, 50); g.lineTo(28, 20); g.stroke(); break;
    case 'crit': g.lineWidth = 6; circ(50, 50, 26); line(50, 10, 50, 30); line(50, 70, 50, 90); line(10, 50, 30, 50); line(70, 50, 90, 50); circ(50, 50, 7, true); break;
    case 'growth': g.fillRect(18, 60, 16, 24); g.fillRect(42, 42, 16, 42); g.fillRect(66, 20, 16, 64); break;
    case 'heal': g.fillRect(40, 16, 20, 68); g.fillRect(16, 40, 68, 20); break;
    case 'gold': circ(50, 50, 30, true); g.strokeStyle = '#5a3a00'; g.lineWidth = 6; circ(50, 50, 18); break;
    default: circ(50, 50, 20, true);
  }
}

function iconURL(id, evo) {
  const key = id + (evo ? '*' : '');
  let u = iconCache.get(key);
  if (u) return u;
  const col = id === 'heal' ? '#6dff9e' : id === 'gold' ? '#ffc247' : (WEAPONS[id] || PASSIVES[id] || {}).color || '#5ef2ff';
  const S = 96, c = makeCanvas(S, S), g = c.getContext('2d');
  const cut = 16;
  g.beginPath(); g.moveTo(cut, 0); g.lineTo(S, 0); g.lineTo(S, S - cut); g.lineTo(S - cut, S); g.lineTo(0, S); g.lineTo(0, cut); g.closePath();
  const bg = g.createLinearGradient(0, 0, 0, S);
  bg.addColorStop(0, rgba(col, 0.26)); bg.addColorStop(1, '#0b1028');
  g.fillStyle = bg; g.fill();
  g.strokeStyle = evo ? '#ffc247' : rgba(col, 0.85); g.lineWidth = evo ? 5 : 3; g.stroke();
  g.save(); g.translate(4, 4); g.scale(0.88, 0.88);
  g.shadowColor = col; g.shadowBlur = 10;
  glyph(g, id, col);
  g.restore();
  if (evo) {
    g.fillStyle = '#ffc247'; g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * TAU) / 10, rr = i % 2 ? 6 : 14; const x = 78 + Math.cos(a) * rr, y = 18 + Math.sin(a) * rr; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
    g.closePath(); g.fill();
  }
  u = c.toDataURL('image/png');
  iconCache.set(key, u);
  return u;
}

const shipIconCache = new Map();
function shipIconURL(ship) {
  let u = shipIconCache.get(ship.id);
  if (u) return u;
  const c = makeCanvas(128, 96), g = c.getContext('2d');
  const prev = ART.px; ART.px = 2;
  g.translate(70, 48); g.scale(2, 2);
  const fl = g.createRadialGradient(-12, 0, 0, -12, 0, 14);
  fl.addColorStop(0, rgba(ship.color, 0.9)); fl.addColorStop(1, rgba(ship.color, 0));
  g.fillStyle = fl; g.beginPath(); g.ellipse(-16, 0, 14, 6, 0, 0, TAU); g.fill();
  g.lineJoin = 'round';
  drawShip(g, 11, ship.color);
  ART.px = prev;
  u = c.toDataURL('image/png');
  shipIconCache.set(ship.id, u);
  return u;
}
