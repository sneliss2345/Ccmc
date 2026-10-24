'use strict';
/* Rendering: parallax space, the swarm, shots, effects and screen overlays. */

const canvas = $('cv');
const ctx = canvas.getContext('2d', { alpha: false });
const BG = { sector: -1, neb: null, layers: [], grad: null, gradKey: '', vignette: null };
let WX = 0, WY = 0, menuT = 0;

function seeded(seed) {
  let a = seed | 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function makeStarLayer(T, n, r0, r1, f, alpha, seed) {
  const res = Math.min(1024, Math.ceil(T * Math.min(view.px, 1.25)));
  const s = res / T, c = makeCanvas(res, res), g = c.getContext('2d'), rng = seeded(seed);
  const cols = ['#ffffff', '#ffffff', '#cfe0ff', '#ffe6c4', '#d9ccff'];
  for (let i = 0; i < n; i++) {
    const x = rng() * T, y = rng() * T, r = r0 + rng() * (r1 - r0), col = cols[(rng() * cols.length) | 0];
    const a = alpha * (0.5 + rng() * 0.5);
    for (const dx of [-T, 0, T]) for (const dy of [-T, 0, T]) {
      const px = (x + dx) * s, py = (y + dy) * s;
      if (px < -20 || py < -20 || px > res + 20 || py > res + 20) continue;
      if (r > 1.4) { g.globalAlpha = a * 0.6; const gs = r * 5 * s; g.drawImage(glow(col), px - gs, py - gs, gs * 2, gs * 2); }
      g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.arc(px, py, Math.max(0.6, r * s * 0.6), 0, TAU); g.fill();
    }
  }
  return { c, T, f };
}

function buildBackground(si) {
  const sec = SECTORS[si] || SECTORS[0];
  BG.sector = si;
  const res = 220, c = makeCanvas(res, res), g = c.getContext('2d'), rng = seeded(500 + si * 31);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 13; i++) {
    const col = sec.neb[i % 3], x = rng() * res, y = rng() * res, r = res * (0.16 + rng() * 0.32);
    const a = 0.12 + rng() * 0.18, rot = rng() * TAU, sq = 0.3 + rng() * 0.7;
    for (const dx of [-res, 0, res]) for (const dy of [-res, 0, res]) {
      g.save(); g.translate(x + dx, y + dy); g.rotate(rot); g.scale(1, sq);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
      gr.addColorStop(0, rgba(col, a)); gr.addColorStop(0.5, rgba(col, a * 0.4)); gr.addColorStop(1, rgba(col, 0));
      g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2); g.restore();
    }
  }
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 6; i++) {
    const x = rng() * res, y = rng() * res, r = res * (0.08 + rng() * 0.14), rot = rng() * TAU;
    for (const dx of [-res, 0, res]) for (const dy of [-res, 0, res]) {
      g.save(); g.translate(x + dx, y + dy); g.rotate(rot); g.scale(1, 0.3);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
      gr.addColorStop(0, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2); g.restore();
    }
  }
  BG.neb = { c, T: 1700, f: 0.12 };
  BG.layers = [
    makeStarLayer(900, 90, 0.5, 1.1, 0.2, 0.8, 11 + si),
    makeStarLayer(900, 45, 0.8, 1.7, 0.42, 0.9, 23 + si),
    makeStarLayer(900, 16, 1.3, 2.4, 0.7, 1, 37 + si),
    makeStarLayer(640, 40, 0.7, 1.1, 1, 0.35, 51 + si),
  ];
  BG.gradKey = '';
  const vc = makeCanvas(256, 256), vg = vc.getContext('2d');
  const vgr = vg.createRadialGradient(128, 128, 70, 128, 128, 182);
  vgr.addColorStop(0, 'rgba(2,3,12,0)'); vgr.addColorStop(1, 'rgba(2,3,12,0.62)');
  vg.fillStyle = vgr; vg.fillRect(0, 0, 256, 256);
  BG.vignette = vc;
}

function drawTiled(layer, alpha) {
  const T = layer.T, f = layer.f;
  const ox = ((-cam.x * f + view.vw / 2) % T + T) % T, oy = ((-cam.y * f + view.vh / 2) % T + T) % T;
  ctx.globalAlpha = alpha;
  for (let x = ox - T; x < view.vw; x += T) for (let y = oy - T; y < view.vh; y += T) ctx.drawImage(layer.c, x, y, T, T);
  ctx.globalAlpha = 1;
}

function drawSpace(si) {
  if (BG.sector !== si) buildBackground(si);
  const sec = SECTORS[si] || SECTORS[0];
  const k = view.px;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  const key = si + ':' + view.vh;
  if (BG.gradKey !== key) {
    BG.grad = ctx.createLinearGradient(0, 0, 0, view.vh);
    BG.grad.addColorStop(0, sec.bg[0]); BG.grad.addColorStop(1, sec.bg[1]);
    BG.gradKey = key;
  }
  ctx.fillStyle = BG.grad; ctx.fillRect(0, 0, view.vw, view.vh);
  ctx.imageSmoothingEnabled = true;
  drawTiled(BG.neb, 1);
  for (const l of BG.layers) drawTiled(l, 1);
}

/* ---------- world helpers ---------- */
function base() { ctx.setTransform(view.px, 0, 0, view.px, WX, WY); }
function spr(s, x, y, ang, scale) {
  const k = view.px, sz = s.s * (scale || 1);
  if (ang) { const c = Math.cos(ang) * k, si = Math.sin(ang) * k; ctx.setTransform(c, si, -si, c, WX + x * k, WY + y * k); ctx.drawImage(s.c, -sz / 2, -sz / 2, sz, sz); base(); }
  else ctx.drawImage(s.c, x - sz / 2, y - sz / 2, sz, sz);
}
function glowAt(col, x, y, r, a) { ctx.globalAlpha = a; ctx.drawImage(glow(col), x - r, y - r, r * 2, r * 2); }

function drawWorld() {
  const k = view.px, D = view.DPR;
  const sh = cam.shake;
  const sx = sh ? (Math.random() * 2 - 1) * sh : 0, sy = sh ? (Math.random() * 2 - 1) * sh : 0;
  WX = (view.W / 2) * D - (cam.x + sx) * k;
  WY = (view.H / 2) * D - (cam.y + sy) * k;
  base();
  const L = cam.x - view.vw / 2 - 80, Rr = cam.x + view.vw / 2 + 80, T = cam.y - view.vh / 2 - 80, B = cam.y + view.vh / 2 + 80;
  const vis = (x, y, m) => x > L - m && x < Rr + m && y > T - m && y < B + m;

  // singularities
  for (const v of wells) {
    if (!vis(v.x, v.y, v.R)) continue;
    const u = Math.min(1, v.t / 0.25) * Math.min(1, (v.dur - v.t) / 0.3 + 0.2);
    const s = (v.R / 58) * (0.85 + 0.1 * Math.sin(v.t * 8));
    ctx.globalAlpha = clamp(u, 0, 1);
    spr(ART.misc.well, v.x, v.y, v.rot, s);
    ctx.fillStyle = '#05010c'; ctx.beginPath(); ctx.arc(v.x, v.y, 9 + v.R * 0.06, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(230,210,255,0.9)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // plasma field
  if (R && !P.dead) {
    const aw = R.weapons.find((w) => w.id === 'aura');
    if (aw) {
      const s = aw.st, col = aw.evo ? '#ffc247' : '#ff6bd0', pulse = aw.pulse || 0;
      const g = ctx.createRadialGradient(P.x, P.y, s.radius * 0.15, P.x, P.y, s.radius);
      g.addColorStop(0, rgba(col, 0)); g.addColorStop(0.7, rgba(col, 0.07 + pulse * 0.06)); g.addColorStop(1, rgba(col, 0.28 + pulse * 0.15));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(P.x, P.y, s.radius, 0, TAU); ctx.fill();
      ctx.strokeStyle = rgba(col, 0.55); ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -R.time * 30;
      ctx.beginPath(); ctx.arc(P.x, P.y, s.radius, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  // shockwaves
  for (const v of waves) {
    if (v.t < 0) continue;
    const u = Math.min(1, v.t / v.dur), r = v.R * (1 - (1 - u) * (1 - u)), a = 1 - Math.max(0, (v.t - v.dur * 0.6) / (v.dur * 0.6));
    ctx.strokeStyle = rgba('#6dff9e', 0.75 * clamp(a, 0, 1)); ctx.lineWidth = 3 + (1 - u) * 10;
    ctx.beginPath(); ctx.arc(v.x, v.y, r, 0, TAU); ctx.stroke();
    ctx.fillStyle = rgba('#6dff9e', 0.06 * clamp(a, 0, 1)); ctx.fill();
  }

  // pickups
  const bob = Math.sin((R ? R.time : menuT) * 5);
  for (const gm of gems) { if (vis(gm.x, gm.y, 10)) spr(ART.misc.gem[gm.tier], gm.x, gm.y + Math.sin((R.time + gm.ph) * 4) * 1.5, 0, 1); }
  for (const it of items) {
    if (!vis(it.x, it.y, 30)) continue;
    if (it.k === 'coin') { spr(ART.misc.coin, it.x, it.y, 0, 1); continue; }
    if (it.k === 'chest') {
      ctx.globalCompositeOperation = 'lighter'; glowAt('#ffc247', it.x, it.y, 46, 0.35 + 0.2 * bob); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      spr(ART.misc.chest, it.x, it.y + bob * 2, 0, it.big ? 1.4 : 1);
      continue;
    }
    spr(ART.misc[it.k], it.x, it.y + bob * 2, 0, 1);
  }
  for (const s of shots) {
    if (s.k !== 'mine' || !vis(s.x, s.y, 20)) continue;
    spr(ART.misc.mine, s.x, s.y, 0, 1);
    if (s.t > 0.45 && Math.sin(s.t * 12) > 0) { ctx.globalCompositeOperation = 'lighter'; glowAt('#ff3d3d', s.x, s.y, 9, 0.9); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  }

  // swarm
  for (const e of enemies) {
    if (e.dead || !vis(e.x, e.y, e.r * 2)) continue;
    const big = e.boss || e.elite;
    const s = e.flash > 0 && !big ? ART.flash[e.type] : ART.enemy[e.type], sc = e.r / e.def.r;
    if (e.elite || (e.ai === 'dash' && e.state === 1)) {
      ctx.globalCompositeOperation = 'lighter';
      glowAt(e.elite ? '#ffc247' : '#ff3d3d', e.x, e.y, e.r * 2.6, e.elite ? 0.5 + 0.15 * bob : 0.8);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    if (e.boss && e.boss.id === 'dread' && e.boss.ph === 2) {
      const len = 700, a = 0.25 + 0.25 * Math.sin(R.time * 30);
      ctx.strokeStyle = 'rgba(255,77,94,' + a + ')'; ctx.lineWidth = e.r * 1.6; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + e.boss.dx * len, e.y + e.boss.dy * len); ctx.stroke();
      ctx.lineCap = 'round';
    }
    ctx.globalAlpha = e.alpha;
    spr(s, e.x, e.y, e.ang, sc);
    if (big && e.flash > 0) { ctx.globalAlpha = 0.35; spr(ART.flash[e.type], e.x, e.y, e.ang, sc); }
    ctx.globalAlpha = 1;
    if (e.elite && e.hp < e.maxHp) {
      const w = e.r * 2, y = e.y - e.r - 9;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(e.x - w / 2, y, w, 3);
      ctx.fillStyle = '#ffc247'; ctx.fillRect(e.x - w / 2, y, w * clamp(e.hp / e.maxHp, 0, 1), 3);
    }
  }

  // player shots
  ctx.globalCompositeOperation = 'lighter';
  for (const s of shots) {
    if (!vis(s.x, s.y, 20)) continue;
    switch (s.k) {
      case 'bolt': spr(ART.bolt[s.w], s.x, s.y, s.a, s.size); break;
      case 'missile': spr(ART.misc.missile, s.x, s.y, s.a, 1); break;
      case 'disc': case 'spiral': spr(ART.misc.disc, s.x, s.y, s.spin, s.size); break;
      case 'bomblet': glowAt('#ffb347', s.x, s.y, 8, 1); ctx.globalAlpha = 1; break;
    }
  }
  if (R) {
    const dw = R.weapons.find((w) => w.id === 'drones');
    if (dw && !P.dead) for (const o of dw.orbs) spr(ART.misc.orb, o.x, o.y, 0, dw.st.size * (dw.evo ? 1.15 : 1));
  }
  for (const b of beams) {
    const fade = b.evo ? Math.min(1, b.t / 0.1, (b.dur - b.t) / 0.15) : 1 - b.t / b.dur;
    const x2 = P.x + Math.cos(b.ang) * b.len, y2 = P.y + Math.sin(b.ang) * b.len;
    ctx.strokeStyle = rgba('#ff5a36', 0.3 * fade); ctx.lineWidth = b.width * 1.3;
    ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = rgba('#ffd2c4', 0.95 * fade); ctx.lineWidth = b.width * 0.45;
    ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(x2, y2); ctx.stroke();
    glowAt('#ff5a36', P.x, P.y, b.width * 1.6, fade);
    ctx.globalAlpha = 1;
  }
  ctx.globalCompositeOperation = 'source-over';

  // ship
  if (R && !P.dead) {
    const blink = P.invuln > 0.2 && Math.sin(R.time * 40) < 0;
    const sp = Math.hypot(P.vx, P.vy) / 150;
    ctx.globalCompositeOperation = 'lighter';
    glowAt(R.ship.color, P.x - Math.cos(P.ang) * 12, P.y - Math.sin(P.ang) * 12, 10 + sp * 14, 0.5 + sp * 0.4);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (!blink) spr(ART.ship[R.ship.id], P.x, P.y, P.ang, 1);
    if (P.hurt > 0) { ctx.globalAlpha = Math.min(1, P.hurt * 3); spr(ART.shipFlash, P.x, P.y, P.ang, 1); ctx.globalAlpha = 1; }
  }

  // enemy fire
  for (const b of ebul) { if (vis(b.x, b.y, 12)) spr(ART.misc.ebul, b.x, b.y, 0, b.r / 6); }

  // effects
  ctx.globalCompositeOperation = 'lighter';
  for (const bo of bolts) {
    const a = 1 - bo.t / bo.dur, p = bo.pts;
    ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
    ctx.strokeStyle = rgba(bo.color, 0.45 * a); ctx.lineWidth = bo.w * 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,' + a + ')'; ctx.lineWidth = bo.w * 0.8; ctx.stroke();
  }
  for (const q of parts) {
    if (!vis(q.x, q.y, q.size * 2)) continue;
    const t = q.life / q.max, s = q.size * (0.4 + 0.6 * t) * 2;
    ctx.globalAlpha = t;
    ctx.drawImage(glow(q.color), q.x - s, q.y - s, s * 2, s * 2);
  }
  ctx.globalAlpha = 1;
  for (const r of rings) {
    const u = r.t / r.dur, rad = lerp(r.r0, r.r1, 1 - (1 - u) * (1 - u));
    ctx.strokeStyle = rgba(r.color, 0.8 * (1 - u)); ctx.lineWidth = r.w * (1 - u) + 1;
    ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, TAU); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';

  // damage numbers
  if (nums.length) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(5,8,22,0.75)';
    for (const n of nums) {
      ctx.globalAlpha = Math.min(1, n.t * 3);
      ctx.font = n.crit ? '800 17px "Exo 2", sans-serif' : '700 12px "Exo 2", sans-serif';
      ctx.strokeText(n.v, n.x, n.y);
      ctx.fillStyle = n.color || (n.crit ? '#ffd84a' : '#ffffff');
      ctx.fillText(n.v, n.x, n.y);
    }
    ctx.globalAlpha = 1;
  }

  // hull bar
  if (R && !P.dead) {
    const w = 34, y = P.y + 20, f = clamp(P.hp / M.maxHp, 0, 1);
    ctx.fillStyle = 'rgba(5,8,22,0.75)'; ctx.fillRect(P.x - w / 2 - 1, y - 1, w + 2, 6);
    ctx.fillStyle = f > 0.5 ? '#6dff9e' : f > 0.25 ? '#ffc247' : '#ff4d5e';
    ctx.fillRect(P.x - w / 2, y, w * f, 4);
  }
}

function drawOverlay() {
  const D = view.DPR, W = view.W, H = view.H;
  ctx.setTransform(D, 0, 0, D, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  if (BG.vignette) ctx.drawImage(BG.vignette, 0, 0, W, H);
  if (!R || mode === 'menu') return;
  // off-screen markers
  const mark = (x, y, col, size) => {
    const sx = (x - cam.x) * view.k + W / 2, sy = (y - cam.y) * view.k + H / 2, m = 22;
    if (sx > m && sx < W - m && sy > m + 60 && sy < H - m) return;
    const cx = W / 2, cy = H / 2, dx = sx - cx, dy = sy - cy;
    const t = Math.min((W / 2 - m) / Math.abs(dx || 1e-6), (H / 2 - m - 30) / Math.abs(dy || 1e-6));
    const px = cx + dx * t, py = cy + dy * t + 15, a = Math.atan2(dy, dx);
    ctx.save(); ctx.translate(px, py); ctx.rotate(a);
    ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(size, 0); ctx.lineTo(-size * 0.7, size * 0.75); ctx.lineTo(-size * 0.7, -size * 0.75); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  for (const b of R.bosses) mark(b.x, b.y, '#ff4d5e', 13);
  for (const e of enemies) if (e.elite && !e.dead) mark(e.x, e.y, '#ffc247', 10);
  for (const it of items) if (it.k === 'chest') mark(it.x, it.y, '#ffc247', 9);
  // touch stick
  if (input.active && mode === 'play') {
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.arc(input.ox, input.oy, JOY_R, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(79,243,255,0.4)';
    ctx.beginPath(); ctx.arc(input.x, input.y, 22, 0, TAU); ctx.fill();
  }
  // damage & low hull
  if (!P.dead) {
    const low = P.hp / M.maxHp;
    let a = P.hurt > 0 ? P.hurt * 1.4 : 0;
    if (low < 0.3) a = Math.max(a, 0.25 + 0.2 * Math.sin(R.time * 6));
    if (a > 0.01) {
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, 'rgba(255,40,60,' + clamp(a, 0, 0.6) + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  }
}

/* ---------- menu backdrop ---------- */
const menuDeco = [];
function drawMenu(dt) {
  menuT += dt;
  cam.x += 26 * dt; cam.y -= 34 * dt;
  drawSpace(save.sector || 0);
  const k = view.px, D = view.DPR;
  const cx = cam.x, cy = cam.y + view.vh * 0.02;
  WX = (view.W / 2) * D - cam.x * k; WY = (view.H / 2) * D - cam.y * k;
  base();
  if (!menuDeco.length) {
    const types = ['drone', 'mite', 'beetle', 'dasher', 'spitter', 'mite', 'drone', 'tank'];
    types.forEach((t, i) => menuDeco.push({ t, a: (i * TAU) / types.length, r: 120 + (i % 3) * 38, s: 0.25 + (i % 4) * 0.06 }));
  }
  for (const d of menuDeco) {
    const a = d.a + menuT * d.s, x = cx + Math.cos(a) * d.r, y = cy + Math.sin(a) * d.r * 0.8;
    ctx.globalAlpha = 0.55;
    spr(ART.enemy[d.t], x, y, a + Math.PI / 2, 1);
  }
  ctx.globalAlpha = 1;
  const ship = SHIPS.find((s) => s.id === save.ship) || SHIPS[0];
  const ang = -Math.PI / 2 + Math.sin(menuT * 0.8) * 0.15;
  ctx.globalCompositeOperation = 'lighter';
  glowAt(ship.color, cx - Math.cos(ang) * 14, cy - Math.sin(ang) * 14 + Math.sin(menuT * 2) * 3, 26, 0.9);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  spr(ART.ship[ship.id], cx, cy + Math.sin(menuT * 2) * 3, ang, 2.2);
  if (Math.random() < 0.6) parts.push({ x: cx - Math.cos(ang) * 22 + rand(-4, 4), y: cy - Math.sin(ang) * 22, vx: rand(-20, 20), vy: 140, life: 0.6, max: 0.6, size: 4, color: ship.color });
  updateFx(dt);
  ctx.globalCompositeOperation = 'lighter';
  for (const q of parts) { const t = q.life / q.max, s = q.size * (0.4 + 0.6 * t) * 2; ctx.globalAlpha = t; ctx.drawImage(glow(q.color), q.x - s, q.y - s, s * 2, s * 2); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  drawOverlay();
}

function drawFrame() {
  drawSpace(R ? R.sid : save.sector || 0);
  drawWorld();
  drawOverlay();
}
