'use strict';
/* Shared helpers, persistent save, viewport, touch stick and the enemy spatial grid. */

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const $ = (id) => document.getElementById(id);

const rgbCache = new Map();
function hexRgb(h) {
  let c = rgbCache.get(h);
  if (!c) {
    const n = parseInt(h.slice(1), 16);
    c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(h, c);
  }
  return c;
}
function rgba(h, a) { const c = hexRgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
function mixHex(a, b, t) {
  const x = hexRgb(a), y = hexRgb(b);
  return 'rgb(' + (lerp(x[0], y[0], t) | 0) + ',' + (lerp(x[1], y[1], t) | 0) + ',' + (lerp(x[2], y[2], t) | 0) + ')';
}
function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}
function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
function fmtNum(n) { return Math.round(n).toLocaleString('ru-RU'); }
function weighted(list) {
  let sum = 0;
  for (const it of list) sum += it[1];
  let r = Math.random() * sum;
  for (const it of list) { r -= it[1]; if (r <= 0) return it[0]; }
  return list[list.length - 1][0];
}
function angleTo(a, b, maxStep) {
  let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;
  if (d > maxStep) d = maxStep; else if (d < -maxStep) d = -maxStep;
  return a + d;
}

/* ---------- save ---------- */
const SAVE_KEY = 'zvezdny-roy-v1';
function freshSave() {
  return {
    credits: 0,
    meta: {},
    ships: ['spark'],
    ship: 'spark',
    sector: 0,
    unlocked: {},
    cleared: [false, false, false],
    stats: { kills: 0, runs: 0, bosses: 0, best: [0, 0, 0], bestLevel: 0, playTime: 0, credits: 0 },
    settings: { sfx: true, music: true, numbers: true, vibrate: true, quality: 'high' },
    tips: {},
  };
}
let save = freshSave();
function loadSave(extra) {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { d = null; }
  if (!d && extra) d = extra;
  if (!d || typeof d !== 'object') return;
  const base = freshSave();
  save = Object.assign(base, d, {
    meta: Object.assign({}, d.meta || {}),
    stats: Object.assign(freshSave().stats, d.stats || {}),
    settings: Object.assign(freshSave().settings, d.settings || {}),
    unlocked: Object.assign({}, d.unlocked || {}),
    tips: Object.assign({}, d.tips || {}),
    cleared: Array.isArray(d.cleared) ? [0, 1, 2].map((i) => !!d.cleared[i]) : [false, false, false],
    ships: Array.isArray(d.ships) ? d.ships.filter((s) => typeof s === 'string') : ['spark'],
  });
  if (!Number.isFinite(save.credits) || save.credits < 0) save.credits = 0;
  if (!save.ships.includes('spark')) save.ships.unshift('spark');
  if (!Array.isArray(save.stats.best)) save.stats.best = [0, 0, 0];
}
function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* storage unavailable */ }
}

/* ---------- viewport ---------- */
const view = { W: 1, H: 1, DPR: 1, k: 1, vw: 400, vh: 800, px: 1 };
function measureView(canvas) {
  const r = canvas.getBoundingClientRect();
  view.W = Math.max(1, r.width || window.innerWidth);
  view.H = Math.max(1, r.height || window.innerHeight);
  const cap = save.settings.quality === 'low' ? 1 : (view.autoCap || 2);
  view.DPR = Math.min(window.devicePixelRatio || 1, cap);
  view.k = clamp(Math.min(view.W, view.H) / 400, 0.55, 2.6);
  view.vw = view.W / view.k;
  view.vh = view.H / view.k;
  view.px = view.k * view.DPR;
}

/* ---------- input: floating stick + keyboard ---------- */
const JOY_R = 56;
const input = { active: false, id: -1, ox: 0, oy: 0, x: 0, y: 0, keys: new Set() };
function bindInput(el) {
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (input.active) return;
    input.active = true; input.id = e.pointerId;
    input.ox = input.x = e.clientX; input.oy = input.y = e.clientY;
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* not supported */ }
  });
  el.addEventListener('pointermove', (e) => {
    if (!input.active || e.pointerId !== input.id) return;
    input.x = e.clientX; input.y = e.clientY;
    const dx = input.x - input.ox, dy = input.y - input.oy, d = Math.hypot(dx, dy);
    if (d > JOY_R) { input.ox = input.x - (dx / d) * JOY_R; input.oy = input.y - (dy / d) * JOY_R; }
  });
  const end = (e) => { if (e.pointerId === input.id) releaseStick(); };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  window.addEventListener('keydown', (e) => { input.keys.add(e.code); });
  window.addEventListener('keyup', (e) => { input.keys.delete(e.code); });
  window.addEventListener('blur', () => { input.keys.clear(); releaseStick(); });
}
function releaseStick() { input.active = false; input.id = -1; }
function readStick(out) {
  let x = 0, y = 0;
  if (input.active) {
    const dx = input.x - input.ox, dy = input.y - input.oy, d = Math.hypot(dx, dy);
    if (d > 6) { const m = Math.min(1, d / JOY_R); x = (dx / d) * m; y = (dy / d) * m; }
  }
  const k = input.keys;
  const kx = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
  const ky = (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) - (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0);
  if (kx || ky) { const d = Math.hypot(kx, ky); x = kx / d; y = ky / d; }
  out[0] = x; out[1] = y;
  return out;
}

/* ---------- spatial grid around the player ---------- */
const GRID_CELL = 64, GRID_N = 48;
const gridHead = new Int32Array(GRID_N * GRID_N);
let gridNext = new Int32Array(1024);
let gridOX = 0, gridOY = 0;
const QBUF = [];
let QN = 0;
function gridBuild(list, cx, cy) {
  gridOX = cx - (GRID_N * GRID_CELL) / 2;
  gridOY = cy - (GRID_N * GRID_CELL) / 2;
  gridHead.fill(-1);
  if (gridNext.length < list.length) gridNext = new Int32Array(list.length * 2);
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    if (e.dead) continue;
    const gx = Math.floor((e.x - gridOX) / GRID_CELL), gy = Math.floor((e.y - gridOY) / GRID_CELL);
    if (gx < 0 || gy < 0 || gx >= GRID_N || gy >= GRID_N) continue;
    const c = gy * GRID_N + gx;
    gridNext[i] = gridHead[c];
    gridHead[c] = i;
  }
}
// Fills QBUF with live enemies in the cells the circle touches; callers do the exact distance test.
function gridQuery(list, x, y, r) {
  QN = 0;
  const x0 = Math.max(0, Math.floor((x - r - gridOX) / GRID_CELL));
  const x1 = Math.min(GRID_N - 1, Math.floor((x + r - gridOX) / GRID_CELL));
  const y0 = Math.max(0, Math.floor((y - r - gridOY) / GRID_CELL));
  const y1 = Math.min(GRID_N - 1, Math.floor((y + r - gridOY) / GRID_CELL));
  for (let gy = y0; gy <= y1; gy++) {
    for (let gx = x0; gx <= x1; gx++) {
      let i = gridHead[gy * GRID_N + gx];
      while (i !== -1) {
        const e = list[i];
        if (e && !e.dead) QBUF[QN++] = e;
        i = gridNext[i];
      }
    }
  }
  return QN;
}

function vibrate(ms) {
  if (!save.settings.vibrate) return;
  try {
    if (window.OrbitaNative && window.OrbitaNative.vibrate) window.OrbitaNative.vibrate(ms);
    else if (navigator.vibrate) navigator.vibrate(ms);
  } catch (e) { /* vibration unavailable */ }
}
