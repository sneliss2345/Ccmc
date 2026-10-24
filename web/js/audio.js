'use strict';
/* Synthesised sound effects and a generative synthwave loop, all on WebAudio. */

const Snd = (() => {
  let ac = null, master = null, sfxBus = null, musicBus = null, wet = null, noiseBuf = null;
  const last = {};
  let gemStep = 0, gemT = 0;

  function init() {
    if (ac) { resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ac = new AC(); } catch (e) { ac = null; return; }
    master = ac.createGain(); master.gain.value = 0.85;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.2;
    master.connect(comp); comp.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.gain.value = save.settings.sfx ? 0.9 : 0; sfxBus.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = save.settings.music ? 0.42 : 0; musicBus.connect(master);
    const conv = ac.createConvolver();
    const len = Math.floor(ac.sampleRate * 2.2);
    const ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    conv.buffer = ir;
    wet = ac.createGain(); wet.gain.value = 0.28; wet.connect(conv); conv.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    resume();
  }
  function resume() { if (ac && ac.state === 'suspended') ac.resume().catch(() => {}); }
  function suspend() { if (ac && ac.state === 'running') ac.suspend().catch(() => {}); }
  function applySettings() {
    if (!ac) return;
    sfxBus.gain.setTargetAtTime(save.settings.sfx ? 0.9 : 0, ac.currentTime, 0.05);
    musicBus.gain.setTargetAtTime(save.settings.music ? 0.42 : 0, ac.currentTime, 0.05);
  }
  function gate(name, gap) {
    if (!ac || !save.settings.sfx) return false;
    const t = ac.currentTime;
    if (last[name] !== undefined && t - last[name] < gap) return false;
    last[name] = t;
    return true;
  }

  function tone(o) {
    const now = (o.at || ac.currentTime) + (o.t || 0), dur = o.dur || 0.2;
    const osc = ac.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, now);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, now + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.1, now + (o.atk || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    let node = osc;
    if (o.lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; f.Q.value = o.q || 0.7; osc.connect(f); node = f; }
    node.connect(g);
    g.connect(o.bus || sfxBus);
    if (o.rev) { const s = ac.createGain(); s.gain.value = o.rev; g.connect(s); s.connect(wet); }
    osc.start(now); osc.stop(now + dur + 0.05);
  }
  function noise(o) {
    const now = (o.at || ac.currentTime) + (o.t || 0), dur = o.dur || 0.3;
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = o.type || 'lowpass'; f.Q.value = o.q || 0.8;
    f.frequency.setValueAtTime(o.f || 1200, now);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, now + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.1, now + (o.atk || 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(f); f.connect(g); g.connect(o.bus || sfxBus);
    if (o.rev) { const s = ac.createGain(); s.gain.value = o.rev; g.connect(s); s.connect(wet); }
    src.start(now, Math.random() * Math.max(0, 1.9 - dur)); src.stop(now + dur + 0.05);
  }

  const fx = {
    shot() { if (gate('shot', 0.075)) tone({ f: rand(860, 960), f2: 380, type: 'square', dur: 0.06, vol: 0.018, lp: 2600 }); },
    missile() { if (gate('missile', 0.12)) noise({ type: 'bandpass', f: 500, f2: 2200, q: 1.4, dur: 0.28, vol: 0.05 }); },
    boom() { if (gate('boom', 0.06)) { noise({ f: 1400, f2: 90, dur: 0.38, vol: 0.12 }); tone({ f: 120, f2: 45, dur: 0.3, vol: 0.06 }); } },
    bigBoom() { if (gate('bigBoom', 0.2)) { noise({ f: 2200, f2: 50, dur: 1.2, vol: 0.32, rev: 0.4 }); tone({ f: 140, f2: 30, dur: 1, vol: 0.2 }); } },
    zap() { if (gate('zap', 0.08)) { noise({ type: 'highpass', f: 3200, f2: 1600, dur: 0.16, vol: 0.06 }); tone({ f: 1300, f2: 180, type: 'square', dur: 0.12, vol: 0.022, lp: 3000 }); } },
    laser() { if (gate('laser', 0.15)) { tone({ f: 200, f2: 1100, type: 'sawtooth', dur: 0.32, vol: 0.045, lp: 3400 }); noise({ type: 'bandpass', f: 1800, q: 2, dur: 0.25, vol: 0.03 }); } },
    nova() { if (gate('nova', 0.2)) { tone({ f: 150, f2: 48, dur: 0.45, vol: 0.12 }); noise({ f: 900, f2: 120, dur: 0.35, vol: 0.06, rev: 0.3 }); } },
    disc() { if (gate('disc', 0.2)) tone({ f: 520, f2: 940, type: 'triangle', dur: 0.1, vol: 0.022 }); },
    mine() { if (gate('mine', 0.15)) tone({ f: 1500, type: 'square', dur: 0.04, vol: 0.012 }); },
    well() { if (gate('well', 0.3)) { tone({ f: 90, f2: 40, dur: 0.9, vol: 0.12, rev: 0.4 }); noise({ type: 'bandpass', f: 300, f2: 120, q: 3, dur: 0.8, vol: 0.05 }); } },
    hit() { if (gate('hit', 0.045)) noise({ type: 'highpass', f: 4000, dur: 0.03, vol: 0.018 }); },
    kill() { if (gate('kill', 0.035)) tone({ f: rand(300, 440), f2: 110, type: 'triangle', dur: 0.09, vol: 0.04 }); },
    gem() {
      if (!gate('gem', 0.028)) return;
      const t = ac.currentTime;
      gemStep = t - gemT < 0.45 ? Math.min(gemStep + 1, 14) : 0;
      gemT = t;
      tone({ f: 740 * Math.pow(2, [0, 2, 4, 7, 9][gemStep % 5] / 12 + Math.floor(gemStep / 5)), dur: 0.08, vol: 0.03 });
    },
    coin() { if (gate('coin', 0.05)) { tone({ f: 1320, dur: 0.06, vol: 0.035, type: 'square', lp: 4000 }); tone({ f: 1760, t: 0.05, dur: 0.12, vol: 0.035, type: 'square', lp: 4000 }); } },
    levelup() { if (!gate('levelup', 0.1)) return; [0, 4, 7, 12, 16].forEach((s, i) => tone({ f: 440 * Math.pow(2, s / 12), t: i * 0.055, dur: 0.5, vol: 0.06, type: 'triangle', rev: 0.4 })); },
    chest() { if (!gate('chest', 0.2)) return; [0, 7, 12, 16, 19, 24].forEach((s, i) => tone({ f: 330 * Math.pow(2, s / 12), t: i * 0.07, dur: 0.7, vol: 0.06, type: 'triangle', rev: 0.5 })); noise({ type: 'highpass', f: 6000, dur: 0.6, vol: 0.03, t: 0.2 }); },
    evolve() { if (!gate('evolve', 0.3)) return; [0, 4, 7, 11, 14].forEach((s) => tone({ f: 220 * Math.pow(2, s / 12), dur: 1.4, vol: 0.05, type: 'sawtooth', lp: 1800, rev: 0.6, atk: 0.08 })); },
    pickup() { if (gate('pickup', 0.1)) [0, 5, 9].forEach((s, i) => tone({ f: 660 * Math.pow(2, s / 12), t: i * 0.05, dur: 0.25, vol: 0.05, rev: 0.3 })); },
    heal() { if (gate('heal', 0.1)) [0, 4, 7].forEach((s, i) => tone({ f: 520 * Math.pow(2, s / 12), t: i * 0.06, dur: 0.35, vol: 0.05, rev: 0.3 })); },
    hurt() { if (gate('hurt', 0.12)) { tone({ f: 180, f2: 60, type: 'square', dur: 0.2, vol: 0.07, lp: 900 }); noise({ f: 1200, f2: 200, dur: 0.15, vol: 0.06 }); } },
    warn() { if (!gate('warn', 1)) return; for (let i = 0; i < 4; i++) { tone({ f: 660, t: i * 0.5, dur: 0.24, vol: 0.06, type: 'sawtooth', lp: 1600 }); tone({ f: 440, t: i * 0.5 + 0.25, dur: 0.24, vol: 0.06, type: 'sawtooth', lp: 1600 }); } },
    bossShot() { if (gate('bossShot', 0.15)) tone({ f: 300, f2: 140, type: 'sawtooth', dur: 0.18, vol: 0.035, lp: 1400 }); },
    click() { if (gate('click', 0.04)) tone({ f: 720, dur: 0.05, vol: 0.04, type: 'triangle' }); },
    deny() { if (gate('deny', 0.1)) tone({ f: 200, f2: 150, dur: 0.16, vol: 0.06, type: 'square', lp: 1200 }); },
    buy() { if (gate('buy', 0.1)) [0, 7, 12].forEach((s, i) => tone({ f: 520 * Math.pow(2, s / 12), t: i * 0.05, dur: 0.3, vol: 0.05, type: 'triangle', rev: 0.3 })); },
  };

  /* --- music: 16-step sequencer in A minor, i–VI–III–VII --- */
  const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  const BASS = [45, 41, 48, 43];
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const music = { on: false, timer: 0, next: 0, step: 0, bar: 0, intensity: 0, boss: false };
  function scheduleStep(at) {
    const s = music.step, bar = music.bar % 4, boss = music.boss, inten = music.intensity;
    const bus = musicBus;
    if (s % 4 === 0) { tone({ at, f: 130, f2: 42, dur: 0.22, vol: 0.5, bus }); }
    if (s % 4 === 2) noise({ at, type: 'highpass', f: 7000, dur: 0.05, vol: 0.06, bus });
    if (inten >= 1 && s % 2 === 1) noise({ at, type: 'highpass', f: 9000, dur: 0.03, vol: 0.025, bus });
    if ((boss || inten >= 2) && (s === 4 || s === 12)) noise({ at, type: 'bandpass', f: 1800, q: 0.7, dur: 0.16, vol: 0.12, bus });
    const bassHits = boss ? [0, 2, 3, 6, 8, 10, 11, 14] : [0, 3, 6, 8, 11, 14];
    if (bassHits.includes(s)) {
      const n = BASS[bar] + (s === 14 && !boss ? 12 : 0);
      tone({ at, f: mtof(n), type: 'sawtooth', dur: 0.2, vol: 0.13, lp: boss ? 900 : 650, q: 2, bus });
    }
    if (inten >= 1 && s % 2 === 0) {
      const ch = CHORDS[bar], idx = (s / 2) % 4;
      const n = ch[idx === 3 ? 1 : idx] + 12 + (idx === 3 ? 12 : 0);
      tone({ at, f: mtof(n), type: 'square', dur: 0.14, vol: 0.022, lp: 2600, rev: 0.35, bus });
    }
    if (s === 0) {
      for (const n of CHORDS[bar]) tone({ at, f: mtof(n), type: 'triangle', dur: 1.9, vol: 0.03, atk: 0.3, lp: 1500, rev: 0.5, bus });
    }
  }
  function tick() {
    if (!ac || !music.on) return;
    const spb = 60 / (music.boss ? 128 : 112) / 4;
    while (music.next < ac.currentTime + 0.12) {
      if (save.settings.music) scheduleStep(music.next);
      music.next += spb;
      music.step = (music.step + 1) % 16;
      if (music.step === 0) music.bar++;
    }
  }
  function startMusic() {
    if (!ac || music.on) return;
    music.on = true; music.step = 0; music.bar = 0; music.next = ac.currentTime + 0.1;
    music.timer = setInterval(tick, 30);
  }
  function stopMusic() { music.on = false; clearInterval(music.timer); }
  function setMusic(intensity, boss) { music.intensity = intensity; music.boss = !!boss; }

  return { init, resume, suspend, applySettings, fx, startMusic, stopMusic, setMusic, get ready() { return !!ac; } };
})();
