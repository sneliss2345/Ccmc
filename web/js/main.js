'use strict';
/* Boot, resize, main loop and platform hooks. */

function onResize() {
  measureView(canvas);
  canvas.width = Math.round(view.W * view.DPR);
  canvas.height = Math.round(view.H * view.DPR);
  buildArt();
  BG.sector = -1;
}

// Drops the render resolution once if the device keeps missing frames in battle.
const perf = { acc: 0, n: 0, slow: 0, done: false };
function watchPerf(dt) {
  if (perf.done || mode !== 'play' || save.settings.quality === 'low' || view.DPR <= 1.25) return;
  perf.acc += dt; perf.n++;
  if (perf.n < 60) return;
  const avg = perf.acc / perf.n;
  perf.acc = 0; perf.n = 0;
  perf.slow = avg > 0.025 ? perf.slow + 1 : 0;
  if (perf.slow >= 3) { perf.done = true; view.autoCap = 1.25; onResize(); }
}

let last = 0;
function frame(now) {
  let dt = last ? (now - last) / 1000 : 1 / 60;
  last = now;
  if (dt > 0.05) dt = 0.05;
  if (dt < 0) dt = 0;
  if (mode === 'play') updateRun(dt);
  else if (mode === 'dying') updateDying(dt);
  if (mode === 'menu') drawMenu(dt); else drawFrame();
  if (mode !== 'menu') UI.syncHud();
  watchPerf(dt);
  requestAnimationFrame(frame);
}

function unlockAudio() { Snd.init(); Snd.startMusic(); }

function boot(data) {
  loadSave(data && data.save);
  bindInput(canvas);
  onResize();
  UI.init();
  let queued = false;
  window.addEventListener('resize', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; onResize(); });
  });
  document.addEventListener('pointerup', unlockAudio);
  document.addEventListener('keydown', unlockAudio);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (mode === 'play') UI.openPause(); Snd.suspend(); } else Snd.resume();
  });
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  requestAnimationFrame(frame);
}

// Hooks used by the Android wrapper.
window.__appPause = () => { if (mode === 'play') UI.openPause(); Snd.suspend(); };
window.__appResume = () => { Snd.resume(); };
window.__appBack = () => UI.back();

const hot = window.claude && window.claude.hot;
try { if (hot && hot.snapshot) hot.snapshot(() => ({ save: JSON.parse(JSON.stringify(save)) })); } catch (e) { /* optional */ }
if (hot && hot.ready) hot.ready(boot); else boot((hot && hot.data) || {});
