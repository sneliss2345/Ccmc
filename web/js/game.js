'use strict';
/* Run simulation: ship, weapons, swarm AI, bosses, wave director, pickups and progression. */

let mode = 'menu';
let R = null, P = null, M = null;
let enemies = [], shots = [], ebul = [], gems = [], items = [], waves = [], wells = [], beams = [], bolts = [], parts = [], rings = [], nums = [];
const enemyPool = [];
const cam = { x: 0, y: 0, shake: 0 };
const stick = [0, 0];
let waveSerial = 1;

function xpNeed(l) { return l < 20 ? 5 + (l - 1) * 7 : 138 + (l - 20) * 12; }
function minutes() { return R.time / 60; }
function hpMul() {
  const m = minutes();
  let v = R.sector.hpMul * (1 + 0.16 * m + 0.014 * m * m);
  if (m > 10) v *= 1 + (m - 10) * 0.25;
  return v;
}
function dmgMul() { return R.sector.dmgMul * (1 + 0.05 * minutes()); }
function enemyCap() { return save.settings.quality === 'low' ? 190 : 290; }

/* ---------- modifiers & weapon stats ---------- */
function computeMods() {
  const ship = R.ship, meta = save.meta;
  const m = { might: 1, cdMul: 1, area: 1, pspeed: 1, dur: 1, amount: 0, move: 1, maxHp: ship.hp, armor: 0, regen: 0, magnet: 1, crit: 0.03, growth: 1, greed: 1 };
  const ml = (id) => meta[id] || 0;
  m.maxHp += ml('hull') * 10; m.might += ml('might') * 0.05; m.armor += ml('armor'); m.move += ml('move') * 0.05;
  m.magnet += ml('magnet') * 0.15; m.cdMul *= 1 - ml('cooldown') * 0.03; m.growth += ml('growth') * 0.05;
  m.greed += ml('greed') * 0.1; m.crit += ml('crit') * 0.03;
  const sm = ship.mods;
  if (sm.cdMul) m.cdMul *= sm.cdMul;
  if (sm.armor) m.armor += sm.armor;
  if (sm.area) m.area += sm.area;
  if (sm.crit) m.crit += sm.crit;
  for (const p of R.passives) {
    const l = p.lv;
    switch (p.id) {
      case 'might': m.might += 0.1 * l; break;
      case 'cooldown': m.cdMul *= 1 - 0.07 * l; break;
      case 'area': m.area += 0.1 * l; break;
      case 'speed': m.pspeed += 0.1 * l; m.dur += 0.1 * l; break;
      case 'amount': m.amount += l; break;
      case 'move': m.move += 0.08 * l; break;
      case 'hull': m.maxHp += 20 * l; break;
      case 'armor': m.armor += l; break;
      case 'regen': m.regen += 0.3 * l; break;
      case 'magnet': m.magnet += 0.3 * l; break;
      case 'crit': m.crit += 0.06 * l; break;
      case 'growth': m.growth += 0.08 * l; break;
    }
  }
  return m;
}

function wstats(w) {
  const d = WEAPONS[w.id];
  const s = Object.assign({}, w.evo ? d.evo.st : d.lv[w.lv - 1]);
  s.dmg *= M.might;
  if (s.cd) s.cd *= M.cdMul;
  if (s.tick) s.tick *= Math.max(0.6, M.cdMul);
  for (const key of ['radius', 'blast', 'width', 'range']) if (s[key]) s[key] *= M.area;
  if (s.size) s.size *= Math.sqrt(M.area);
  if (s.speed) s.speed *= M.pspeed;
  if (s.dur) s.dur *= M.dur;
  if (s.count && AMOUNT_WEAPONS.has(w.id)) s.count += M.amount;
  if (s.strikes) s.strikes += M.amount;
  return s;
}

function refreshStats() {
  M = computeMods();
  for (const w of R.weapons) w.st = wstats(w);
  if (P && P.hp > M.maxHp) P.hp = M.maxHp;
}

function addWeapon(id) {
  const w = { id, lv: 1, evo: false, t: 0.25, st: null, a: 0, orbs: [], pulse: 0 };
  R.weapons.push(w);
  w.st = wstats(w);
}

/* ---------- run lifecycle ---------- */
function clearWorld() {
  for (const e of enemies) enemyPool.push(e);
  enemies = []; shots = []; ebul = []; gems = []; items = []; waves = []; wells = []; beams = []; bolts = []; parts = []; rings = []; nums = [];
}

function startRun(shipId, sectorIdx) {
  const ship = SHIPS.find((s) => s.id === shipId) || SHIPS[0];
  const sector = SECTORS[sectorIdx] || SECTORS[0];
  clearWorld();
  R = {
    ship, sector, sid: sectorIdx, time: 0, frame: 0, kills: 0, gold: 0, level: 1, xp: 0, xpNext: xpNeed(1),
    weapons: [], passives: [], pending: 0, rerolls: save.meta.reroll || 0, revives: save.meta.revive || 0,
    dmg: {}, spawnAcc: 0, nextElite: 70, nextCrate: 16,
    events: [[150, 'ring'], [225, 'swarm'], [375, 'ring'], [435, 'swarm'], [510, 'ring'], [560, 'swarm']],
    bossIdx: 0, nextBoss: 300, warned: false, boss: null, bosses: [], bossesKilled: 0,
    victory: false, victoryAt: 0, victoryShown: false, endless: false, over: false, deathT: 0,
    unlocked: [], secTick: 0, moved: 0, elitesSeen: 0,
  };
  P = { x: 0, y: 0, vx: 0, vy: 0, ang: -Math.PI / 2, r: 11, hp: 1, invuln: 1.5, hurt: 0, dead: false };
  M = computeMods();
  P.hp = M.maxHp;
  addWeapon(ship.weapon);
  cam.x = 0; cam.y = 0; cam.shake = 0;
  mode = 'play';
}

/* ---------- targeting ---------- */
// Bosses count as closer than they are when `bossBias` is set, so aimed weapons do not ignore them.
function nearestEnemy(x, y, maxD, bossBias) {
  let best = null, bd = maxD * maxD;
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (e.dead || e.ai === 'crate') continue;
    const dx = e.x - x, dy = e.y - y, d2 = (dx * dx + dy * dy) * (bossBias && e.boss ? 0.3 : 1);
    if (d2 < bd) { bd = d2; best = e; }
  }
  return best;
}
function inView(e, margin) { return Math.abs(e.x - cam.x) < view.vw / 2 + margin && Math.abs(e.y - cam.y) < view.vh / 2 + margin; }
function randomTarget(exclude) {
  const n = enemies.length;
  if (!n) return null;
  for (let t = 0; t < 24; t++) {
    const e = enemies[(Math.random() * n) | 0];
    if (!e.dead && e.ai !== 'crate' && e !== exclude && inView(e, -12)) return e;
  }
  const e = nearestEnemy(P.x, P.y, 420);
  return e === exclude ? null : e;
}

/* ---------- damage ---------- */
function addNum(x, y, v, crit, color) {
  if (nums.length > 70 && !crit) return null;
  const n = { x, y, v: Math.max(1, Math.round(v)), t: 0.65, crit, color };
  nums.push(n);
  return n;
}

function burst(x, y, n, color, speed, life, size) {
  if (parts.length > 650) n = Math.min(n, 2);
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), s = speed * rand(0.2, 1), l = life * rand(0.5, 1);
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: l, max: l, size: size * rand(0.6, 1.3), color });
  }
}

function hitEnemy(e, dmg, wid, kx, ky, kb) {
  if (e.dead) return;
  const crit = Math.random() < M.crit;
  if (crit) dmg *= 2;
  R.dmg[wid] = (R.dmg[wid] || 0) + Math.min(dmg, Math.max(0, e.hp));
  e.hp -= dmg;
  e.flash = 0.07;
  if (kb && e.kbRes > 0) { e.kvx += kx * kb * e.kbRes; e.kvy += ky * kb * e.kbRes; }
  if (save.settings.numbers && e.ai !== 'crate') {
    const n = e.num;
    if (n && n.t > 0.42 && !crit && !n.crit) n.v += Math.max(1, Math.round(dmg));
    else e.num = addNum(e.x + rand(-6, 6), e.y - e.r, dmg, crit);
  }
  if (e.hp <= 0) killEnemy(e); else Snd.fx.hit();
}

function explode(x, y, radius, dmg, wid, color) {
  const n = gridQuery(enemies, x, y, radius + 70);
  for (let j = 0; j < n; j++) {
    const e = QBUF[j];
    const dx = e.x - x, dy = e.y - y, rr = radius + e.r;
    if (dx * dx + dy * dy < rr * rr) { const d = Math.hypot(dx, dy) || 1; hitEnemy(e, dmg, wid, dx / d, dy / d, 140); }
  }
  rings.push({ x, y, r0: radius * 0.25, r1: radius, t: 0, dur: 0.32, color, w: 5 });
  burst(x, y, 10, color, 220, 0.45, 5);
  parts.push({ x, y, vx: 0, vy: 0, life: 0.18, max: 0.18, size: radius * 0.55, color });
  Snd.fx.boom();
}

function damagePlayer(amount) {
  if (P.dead || P.invuln > 0 || R.over) return;
  const dmg = Math.max(1, amount - M.armor);
  P.hp -= dmg;
  P.hurt = 0.3; P.invuln = 0.08;
  cam.shake = Math.max(cam.shake, 5);
  Snd.fx.hurt(); vibrate(25);
  addNum(P.x, P.y - 18, dmg, false, '#ff4d5e');
  if (P.hp <= 0) {
    if (R.revives > 0) {
      R.revives--;
      P.hp = M.maxHp * 0.5; P.invuln = 2.5;
      const n = gridQuery(enemies, P.x, P.y, 260);
      for (let j = 0; j < n; j++) { const e = QBUF[j]; if (!e.boss) { const d = Math.hypot(e.x - P.x, e.y - P.y) || 1; e.kvx += ((e.x - P.x) / d) * 600; e.kvy += ((e.y - P.y) / d) * 600; } }
      ebul.length = 0;
      rings.push({ x: P.x, y: P.y, r0: 10, r1: 260, t: 0, dur: 0.6, color: '#6dff9e', w: 8 });
      UI.banner('Капсула спасения', 'Корабль восстановлен', true);
      Snd.fx.heal();
    } else {
      playerDie();
    }
  }
}

function playerDie() {
  P.dead = true; R.over = true; mode = 'dying'; R.deathT = 0;
  burst(P.x, P.y, 60, R.ship.color, 380, 1.2, 7);
  burst(P.x, P.y, 30, '#ffffff', 260, 0.8, 5);
  rings.push({ x: P.x, y: P.y, r0: 6, r1: 180, t: 0, dur: 0.8, color: '#ffffff', w: 6 });
  cam.shake = 14;
  Snd.fx.bigBoom(); vibrate(220);
  releaseStick();
}

/* ---------- drops ---------- */
function gemTier(v) { return v >= 20 ? 3 : v >= 5 ? 2 : v >= 2 ? 1 : 0; }
function addGem(x, y, v) {
  if (gems.length >= 360) {
    const g = gems[(Math.random() * gems.length) | 0];
    g.v += v; g.tier = gemTier(g.v);
    return;
  }
  gems.push({ x, y, v, tier: gemTier(v), mag: false, sp: 0, ph: Math.random() * TAU });
}
function addItem(k, x, y, v, big) { items.push({ k, x, y, v: v || 0, t: 0, mag: false, sp: 0, big: !!big }); }

function killEnemy(e) {
  e.dead = true;
  const col = e.def.color;
  if (e.ai === 'crate') {
    const r = weighted([['coins', 40], ['heal', 25], ['magnet', 18], ['bomb', 17]]);
    if (r === 'coins') { const n = randi(5, 12); for (let i = 0; i < n; i++) addItem('coin', e.x + rand(-16, 16), e.y + rand(-16, 16), 1); }
    else addItem(r, e.x, e.y);
    burst(e.x, e.y, 14, col, 200, 0.5, 4);
    Snd.fx.boom();
    return;
  }
  R.kills++;
  if (e.boss) { bossDown(e); return; }
  addGem(e.x, e.y, e.xp * (e.elite ? 12 : 1));
  if (e.elite) {
    addItem('chest', e.x, e.y);
    const n = randi(6, 12);
    for (let i = 0; i < n; i++) addItem('coin', e.x + rand(-26, 26), e.y + rand(-26, 26), 1);
    if (Math.random() < 0.4) addItem('heal', e.x + rand(-20, 20), e.y + rand(-20, 20));
    rings.push({ x: e.x, y: e.y, r0: e.r, r1: e.r * 4, t: 0, dur: 0.5, color: '#ffc247', w: 5 });
    cam.shake = Math.max(cam.shake, 6);
    Snd.fx.boom();
  } else {
    const r = Math.random();
    if (r < 0.025) addItem('coin', e.x, e.y, 1);
    else if (r < 0.0285) addItem('heal', e.x, e.y);
    else if (r < 0.0302) addItem('magnet', e.x, e.y);
    else if (r < 0.0312) addItem('bomb', e.x, e.y);
  }
  if (e.ai === 'split') {
    for (let i = 0; i < 3; i++) {
      const m = spawnEnemy('mite', e.x + rand(-10, 10), e.y + rand(-10, 10), false);
      const a = (i * TAU) / 3;
      m.kvx = Math.cos(a) * 160; m.kvy = Math.sin(a) * 160;
    }
  }
  burst(e.x, e.y, 5 + ((e.r / 3) | 0), col, 160 + e.r * 4, 0.45, 3 + e.r * 0.12);
  Snd.fx.kill();
}

function bossDown(e) {
  R.bosses = R.bosses.filter((b) => b !== e);
  if (R.boss === e) R.boss = R.bosses[0] || null;
  R.bossesKilled++;
  burst(e.x, e.y, 90, e.def.color, 520, 1.6, 9);
  burst(e.x, e.y, 40, '#ffffff', 320, 1, 6);
  rings.push({ x: e.x, y: e.y, r0: e.r, r1: 420, t: 0, dur: 1, color: e.def.color, w: 10 });
  rings.push({ x: e.x, y: e.y, r0: e.r * 0.5, r1: 260, t: 0, dur: 0.7, color: '#ffffff', w: 6 });
  cam.shake = 18;
  Snd.fx.bigBoom(); vibrate(150);
  for (let i = 0; i < 12; i++) addGem(e.x + rand(-60, 60), e.y + rand(-60, 60), 6 + R.bossIdx * 3);
  const coins = Math.round(16 * R.sector.reward) + R.bossIdx * 4;
  for (let i = 0; i < coins; i++) addItem('coin', e.x + rand(-70, 70), e.y + rand(-70, 70), 1);
  addItem('chest', e.x, e.y, 0, true);
  if (e.boss.final && !R.victory) {
    R.victory = true; R.victoryAt = R.time + 4;
    R.firstClear = !save.cleared[R.sid];
    save.cleared[R.sid] = true; persist();
    UI.banner('Флагман уничтожен', 'Сектор зачищен', true);
  } else {
    UI.banner('Босс повержен', e.def.name, true);
  }
}

/* ---------- spawning ---------- */
function spawnEnemy(type, x, y, elite) {
  const d = ENEMIES[type];
  const e = enemyPool.pop() || { cd: new Float32Array(WEAPON_IDS.length) };
  e.type = type; e.def = d; e.x = x; e.y = y;
  e.r = d.r * (elite ? 1.6 : 1);
  e.maxHp = e.hp = d.hp * (type === 'crate' ? 1 : hpMul()) * (elite ? 12 : 1);
  e.speed = d.speed * (elite ? 0.92 : rand(0.92, 1.08));
  e.dmg = d.dmg * dmgMul() * (elite ? 1.4 : 1);
  e.xp = d.xp; e.ai = d.ai || 'chase'; e.elite = !!elite; e.boss = null; e.dead = false;
  e.flash = 0; e.hitCd = 0; e.slow = 0; e.slowAmt = 0; e.kvx = 0; e.kvy = 0;
  e.kbRes = (d.kbRes == null ? 1 : d.kbRes) * (elite ? 0.3 : 1);
  e.state = 0; e.st = rand(0.5, 2); e.ang = rand(0, TAU); e.spin = rand(-2, 2); e.alpha = 1;
  e.side = Math.random() < 0.5 ? -1 : 1; e.dx = 0; e.dy = 0; e.num = null;
  e.cd.fill(0);
  enemies.push(e);
  return e;
}

function spawnBoss(id, final, hpScale) {
  const d = BOSSES[id];
  const e = enemyPool.pop() || { cd: new Float32Array(WEAPON_IDS.length) };
  const a = rand(0, TAU), dist = Math.max(view.vw, view.vh) * 0.55;
  e.type = id; e.def = d; e.x = P.x + Math.cos(a) * dist; e.y = P.y + Math.sin(a) * dist;
  e.r = d.r; e.maxHp = e.hp = d.hp * R.sector.bossMul * hpScale;
  e.speed = d.speed; e.dmg = d.dmg * R.sector.dmgMul; e.xp = 0; e.ai = 'boss'; e.elite = false; e.dead = false;
  e.flash = 0; e.hitCd = 0; e.slow = 0; e.slowAmt = 0; e.kvx = 0; e.kvy = 0; e.kbRes = 0;
  e.state = 0; e.st = 0; e.ang = 0; e.spin = id === 'dread' ? 0 : 0.8; e.alpha = 1; e.side = 1; e.dx = 0; e.dy = 0; e.num = null;
  e.cd.fill(0);
  e.boss = { id, final, a: 2, c: 4, s: 0, rot: 0, rot2: 0, ph: 0, pt: 3.2, dx: 0, dy: 0, summoned: false, mx: 0, my: 0, msp: 0 };
  enemies.push(e);
  R.bosses.push(e);
  R.boss = e;
  cam.shake = Math.max(cam.shake, 8);
  return e;
}

function spawnPoint() {
  const a = rand(0, TAU), d = Math.hypot(view.vw, view.vh) / 2 + 50;
  return [P.x + Math.cos(a) * d, P.y + Math.sin(a) * d];
}

function spawnGroup(m) {
  const w = waveWeights(m), list = [];
  for (const k in w) if (w[k] > 0) list.push([k, w[k]]);
  const type = weighted(list);
  const n = type === 'mite' ? randi(3, 6) : type === 'tank' ? 1 : randi(1, 3);
  const [x, y] = spawnPoint();
  for (let i = 0; i < n; i++) spawnEnemy(type, x + rand(-30, 30), y + rand(-30, 30), false);
}

function spawnElite(m) {
  const w = waveWeights(m), list = [];
  for (const k in w) if (w[k] > 0 && k !== 'mite') list.push([k, w[k]]);
  if (!list.length) list.push(['drone', 1]);
  const [x, y] = spawnPoint();
  spawnEnemy(weighted(list), x, y, true);
  R.elitesSeen++;
  if (!save.tips.elite) { save.tips.elite = 1; persist(); UI.hint('Золотой элитный враг роняет контейнер с улучшениями', 5); }
}

function eventRing(m) {
  const count = Math.round((26 + m * 3) * R.sector.spawnMul), type = m < 4 ? 'drone' : 'beetle';
  const rad = Math.max(view.vw, view.vh) * 0.62;
  for (let i = 0; i < count; i++) { const a = (i * TAU) / count; spawnEnemy(type, P.x + Math.cos(a) * rad, P.y + Math.sin(a) * rad, false); }
  UI.toast('Окружение!');
}
function eventSwarm(m) {
  const a = rand(0, TAU), d = Math.hypot(view.vw, view.vh) / 2 + 60;
  const cx = P.x + Math.cos(a) * d, cy = P.y + Math.sin(a) * d;
  const n = Math.round((36 + m * 3) * R.sector.spawnMul);
  for (let i = 0; i < n; i++) spawnEnemy('mite', cx + rand(-70, 70), cy + rand(-70, 70), false);
  for (let i = 0; i < 6; i++) spawnEnemy('drone', cx + rand(-60, 60), cy + rand(-60, 60), false);
  UI.toast('Стая!');
}
function spawnCrate() {
  const a = rand(0, TAU), d = rand(240, 420);
  spawnEnemy('crate', P.x + Math.cos(a) * d, P.y + Math.sin(a) * d, false);
}

function bossIdFor(i) {
  if (i < 2) return R.sector.bosses[i];
  return ['queen', 'dread', 'devourer'][i % 3];
}

function director(dt) {
  const t = R.time, m = t / 60 + R.sector.shift;
  if (!R.warned && t >= R.nextBoss - 5) {
    R.warned = true;
    UI.banner('Внимание', BOSSES[bossIdFor(R.bossIdx)].name + ' приближается', false);
    Snd.fx.warn();
  }
  if (t >= R.nextBoss) {
    const i = R.bossIdx;
    spawnBoss(bossIdFor(i), i === 1, i === 0 ? 0.4 : i === 1 ? 0.85 : 0.85 + (i - 1) * 0.5);
    R.bossIdx++; R.warned = false;
    R.nextBoss = R.bossIdx === 1 ? 600 : R.endless ? t + 150 : Infinity;
  }
  const bossAlive = R.bosses.length > 0;
  const target = Math.min(enemyCap(), (18 + 16 * m + 1.6 * m * m) * R.sector.spawnMul * (bossAlive ? 0.55 : 1));
  R.spawnAcc += dt * (1.2 + m * 0.9) * R.sector.spawnMul;
  while (R.spawnAcc >= 1) {
    R.spawnAcc -= 1;
    if (enemies.length < target) spawnGroup(m);
  }
  if (t >= R.nextElite) { R.nextElite += 60; if (!bossAlive) spawnElite(m); }
  if (R.events.length && t >= R.events[0][0]) {
    const ev = R.events.shift()[1];
    if (ev === 'ring') eventRing(m); else eventSwarm(m);
  }
  if (R.endless && !R.events.length) R.events.push([t + 70, Math.random() < 0.5 ? 'ring' : 'swarm']);
  if (t >= R.nextCrate) { R.nextCrate = t + rand(20, 30); spawnCrate(); }
}

/* ---------- weapons ---------- */
function addBolt(x, y, a, s, wid) {
  shots.push({ k: 'bolt', w: wid, x, y, vx: Math.cos(a) * s.speed, vy: Math.sin(a) * s.speed, a, r: 4 * s.size, dmg: s.dmg, pierce: s.pierce, life: 1.1, hit: [], size: s.size });
}

function boltFx(x1, y1, x2, y2, w, color) {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, n = Math.max(3, Math.round(d / 18));
  const nx = -dy / d, ny = dx / d, pts = [x1, y1];
  for (let i = 1; i < n; i++) { const t = i / n, j = rand(-11, 11); pts.push(x1 + dx * t + nx * j, y1 + dy * t + ny * j); }
  pts.push(x2, y2);
  bolts.push({ pts, t: 0, dur: 0.2, w, color });
}

const FIRE = {
  blaster(w, s) {
    const t = nearestEnemy(P.x, P.y, 520, true);
    if (!t) return false;
    const base = Math.atan2(t.y - P.y, t.x - P.x), n = s.count;
    if (w.evo) {
      for (let i = 0; i < n; i++) {
        const side = (i - (n - 1) / 2) * 8, a = base + rand(-0.05, 0.05);
        addBolt(P.x - Math.sin(a) * side, P.y + Math.cos(a) * side, a, s, w.id);
      }
    } else {
      for (let i = 0; i < n; i++) addBolt(P.x, P.y, base + (i - (n - 1) / 2) * 0.13, s, w.id);
    }
    Snd.fx.shot();
    return true;
  },
  missile(w, s) {
    if (!nearestEnemy(P.x, P.y, 640)) return false;
    for (let i = 0; i < s.count; i++) {
      const a = (i / s.count) * TAU + rand(-0.3, 0.3);
      shots.push({ k: 'missile', w: w.id, x: P.x, y: P.y, a, top: s.speed, t: 0, life: 3.2, dmg: s.dmg, blast: s.blast, target: null, rt: 0, r: 7, smoke: 0 });
    }
    Snd.fx.missile();
    return true;
  },
  nova(w, s) {
    for (let i = 0; i < s.waves; i++) waves.push({ x: P.x, y: P.y, t: -i * 0.24, dur: 0.38, R: s.radius, dmg: s.dmg, id: waveSerial++, kb: 270, done: false });
    Snd.fx.nova();
    return true;
  },
  lightning(w, s) {
    let fired = false;
    for (let k = 0; k < s.strikes; k++) {
      let cur = randomTarget(null);
      if (!cur) break;
      fired = true;
      let px = cur.x + rand(-40, 40), py = cur.y - 280, dmg = s.dmg;
      const hitSet = [];
      for (let c = 0; c <= s.chain && cur; c++) {
        boltFx(px, py, cur.x, cur.y, c === 0 ? 3.2 : 2.2, '#fff36b');
        hitSet.push(cur);
        px = cur.x; py = cur.y;
        hitEnemy(cur, dmg, 'lightning', 0, 0, 0);
        dmg *= 0.88;
        let best = null, bd = s.range * s.range;
        const n = gridQuery(enemies, px, py, s.range + 10);
        for (let j = 0; j < n; j++) {
          const e = QBUF[j];
          if (e.ai === 'crate' || hitSet.includes(e)) continue;
          const dx = e.x - px, dy = e.y - py, d2 = dx * dx + dy * dy;
          if (d2 < bd) { bd = d2; best = e; }
        }
        cur = best;
      }
    }
    if (fired) Snd.fx.zap();
    return fired;
  },
  disc(w, s) {
    if (w.evo) {
      for (let i = 0; i < s.count; i++) shots.push({ k: 'spiral', w: w.id, a0: (i * TAU) / s.count + R.time, t: 0, life: 2.3 * M.dur, dmg: s.dmg, r: 11 * s.size, size: s.size, x: P.x, y: P.y, spin: 0 });
    } else {
      for (let i = 0; i < s.count; i++) {
        const a = P.ang + (i * TAU) / s.count;
        shots.push({ k: 'disc', w: w.id, x: P.x, y: P.y, vx: Math.cos(a) * s.speed, vy: Math.sin(a) * s.speed, t: 0, out: 0.9 * M.dur, dmg: s.dmg, r: 11 * s.size, size: s.size, spin: 0 });
      }
    }
    Snd.fx.disc();
    return true;
  },
  mines(w, s) {
    let live = 0;
    for (const q of shots) if (q.k === 'mine') live++;
    if (live >= 24) return true;
    for (let i = 0; i < s.count; i++) shots.push({ k: 'mine', w: w.id, x: P.x + rand(-34, 34), y: P.y + rand(-34, 34), t: 0, life: 14, dmg: s.dmg, blast: s.blast, cluster: s.cluster || 0, r: 8 });
    Snd.fx.mine();
    return true;
  },
  laser(w, s) {
    const first = nearestEnemy(P.x, P.y, s.len * 0.9, true);
    if (!first) return false;
    const targets = [first];
    for (let i = 1; i < s.count; i++) { const t = randomTarget(first); targets.push(t || first); }
    targets.forEach((t, i) => {
      let a = Math.atan2(t.y - P.y, t.x - P.x);
      if (t === first && i > 0) a += Math.PI;
      beams.push({ w: w.id, ang: a, len: s.len, width: s.width, t: 0, dur: w.evo ? s.dur : 0.26, dmg: s.dmg, evo: w.evo, tick: 0, spin: w.evo ? (i % 2 ? -1.4 : 1.4) : 0, done: false });
    });
    Snd.fx.laser();
    return true;
  },
  singularity(w, s) {
    let best = null, bestN = -1;
    for (let i = 0; i < 6; i++) {
      const e = randomTarget(null);
      if (!e) break;
      const n = gridQuery(enemies, e.x, e.y, 80);
      if (n > bestN) { bestN = n; best = e; }
    }
    if (!best) return false;
    wells.push({ x: best.x, y: best.y, t: 0, dur: s.dur, R: s.radius, pull: s.pull, dmg: s.dmg, tick: 0, burst: s.burst || 0, rot: rand(0, TAU) });
    Snd.fx.well();
    return true;
  },
};

function updateDrones(w, s, dt) {
  w.a += s.rot * dt;
  const n = s.count, orbR = 9 * s.size, idx = WIDX.drones;
  while (w.orbs.length < n) w.orbs.push({ x: P.x, y: P.y });
  w.orbs.length = n;
  for (let i = 0; i < n; i++) {
    const a = w.a + (i * TAU) / n, o = w.orbs[i];
    o.x = P.x + Math.cos(a) * s.radius; o.y = P.y + Math.sin(a) * s.radius;
    const q = gridQuery(enemies, o.x, o.y, orbR + 70);
    for (let j = 0; j < q; j++) {
      const e = QBUF[j];
      const dx = e.x - o.x, dy = e.y - o.y, rr = e.r + orbR;
      if (dx * dx + dy * dy < rr * rr && R.time >= e.cd[idx]) {
        e.cd[idx] = R.time + 0.45;
        const ex = e.x - P.x, ey = e.y - P.y, d = Math.hypot(ex, ey) || 1;
        hitEnemy(e, s.dmg, 'drones', ex / d, ey / d, w.evo ? 170 : 95);
      }
    }
  }
}

function updateAura(w, s, dt) {
  w.pulse = Math.max(0, w.pulse - dt * 3);
  w.t -= dt;
  if (w.t > 0) return;
  w.t = s.tick;
  const n = gridQuery(enemies, P.x, P.y, s.radius + 70);
  let any = false;
  for (let j = 0; j < n; j++) {
    const e = QBUF[j];
    const dx = e.x - P.x, dy = e.y - P.y, rr = s.radius + e.r;
    if (dx * dx + dy * dy < rr * rr) { e.slow = 0.6; e.slowAmt = s.slow; hitEnemy(e, s.dmg, 'aura', 0, 0, 0); any = true; }
  }
  if (any && s.heal) P.hp = Math.min(M.maxHp, P.hp + s.heal);
  w.pulse = 1;
}

function updateWeapons(dt) {
  for (const w of R.weapons) {
    const s = w.st;
    if (w.id === 'drones') { updateDrones(w, s, dt); continue; }
    if (w.id === 'aura') { updateAura(w, s, dt); continue; }
    w.t -= dt;
    if (w.t <= 0) {
      if (FIRE[w.id](w, s)) w.t = Math.max(0, w.t + s.cd);
      else w.t = 0.12;
    }
  }
}

function sweepHits(s, idx, cd, kb) {
  const n = gridQuery(enemies, s.x, s.y, s.r + 70);
  for (let j = 0; j < n; j++) {
    const e = QBUF[j];
    const dx = e.x - s.x, dy = e.y - s.y, rr = e.r + s.r;
    if (dx * dx + dy * dy < rr * rr && R.time >= e.cd[idx]) {
      e.cd[idx] = R.time + cd;
      const d = Math.hypot(dx, dy) || 1;
      hitEnemy(e, s.dmg, s.w, dx / d, dy / d, kb);
    }
  }
}

function touching(x, y, r) {
  const n = gridQuery(enemies, x, y, r + 70);
  for (let j = 0; j < n; j++) {
    const e = QBUF[j];
    if (e.ai === 'crate') continue;
    const dx = e.x - x, dy = e.y - y, rr = e.r + r;
    if (dx * dx + dy * dy < rr * rr) return e;
  }
  return null;
}

function updateShots(dt) {
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    let dead = false;
    switch (s.k) {
      case 'bolt': {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
        if (s.life <= 0) { dead = true; break; }
        const n = gridQuery(enemies, s.x, s.y, s.r + 70);
        const sp = Math.hypot(s.vx, s.vy) || 1;
        for (let j = 0; j < n; j++) {
          const e = QBUF[j];
          if (s.hit.includes(e)) continue;
          const dx = e.x - s.x, dy = e.y - s.y, rr = e.r + s.r;
          if (dx * dx + dy * dy < rr * rr) {
            s.hit.push(e);
            hitEnemy(e, s.dmg, s.w, s.vx / sp, s.vy / sp, 50);
            if (--s.pierce <= 0) { dead = true; break; }
          }
        }
        break;
      }
      case 'missile': {
        s.t += dt; s.rt -= dt;
        if (!s.target || s.target.dead || s.rt <= 0) { s.target = nearestEnemy(s.x, s.y, 700, true); s.rt = 0.25; }
        const sp = Math.min(s.top, 160 + s.t * 520);
        if (s.target && s.t > 0.12) s.a = angleTo(s.a, Math.atan2(s.target.y - s.y, s.target.x - s.x), 7 * dt);
        s.x += Math.cos(s.a) * sp * dt; s.y += Math.sin(s.a) * sp * dt;
        s.smoke -= dt;
        if (s.smoke <= 0) { s.smoke = 0.03; parts.push({ x: s.x, y: s.y, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 3, color: '#ff8a3a' }); }
        if (s.t > s.life || touching(s.x, s.y, s.r)) { explode(s.x, s.y, s.blast, s.dmg, s.w, '#ffb347'); dead = true; }
        break;
      }
      case 'disc': {
        s.t += dt; s.spin += dt * 18;
        if (s.t < s.out) {
          const f = 1 - s.t / s.out;
          s.x += s.vx * f * dt; s.y += s.vy * f * dt;
        } else {
          const dx = P.x - s.x, dy = P.y - s.y, d = Math.hypot(dx, dy) || 1;
          const sp = Math.min(640, 200 + (s.t - s.out) * 900);
          s.x += (dx / d) * sp * dt; s.y += (dy / d) * sp * dt;
          if (d < 18 || s.t > 4.5) dead = true;
        }
        if (!dead) sweepHits(s, WIDX.disc, 0.3, 80);
        break;
      }
      case 'spiral': {
        s.t += dt; s.spin += dt * 18;
        const a = s.a0 + s.t * 4.2, rr = 26 + s.t * 105;
        s.x = P.x + Math.cos(a) * rr; s.y = P.y + Math.sin(a) * rr;
        if (s.t > s.life) dead = true; else sweepHits(s, WIDX.disc, 0.3, 90);
        break;
      }
      case 'mine': {
        s.t += dt;
        if ((s.t > 0.45 && touching(s.x, s.y, 18)) || s.t > s.life) {
          explode(s.x, s.y, s.blast, s.dmg, s.w, '#ff8a5c');
          for (let c = 0; c < s.cluster; c++) {
            const a = (c * TAU) / s.cluster + rand(-0.2, 0.2), sp = rand(220, 300);
            shots.push({ k: 'bomblet', w: s.w, x: s.x, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 0, life: 0.38, dmg: s.dmg * 0.45, blast: s.blast * 0.55, r: 4 });
          }
          dead = true;
        }
        break;
      }
      case 'bomblet': {
        s.t += dt;
        const f = Math.exp(-dt * 3);
        s.vx *= f; s.vy *= f; s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.t >= s.life) { explode(s.x, s.y, s.blast, s.dmg, s.w, '#ffb347'); dead = true; }
        break;
      }
    }
    if (dead) { shots[i] = shots[shots.length - 1]; shots.pop(); }
  }
}

function beamHit(b, cd) {
  const cx = Math.cos(b.ang), cy = Math.sin(b.ang), idx = WIDX.laser, n = enemies.length;
  for (let i = 0; i < n; i++) {
    const e = enemies[i];
    if (e.dead) continue;
    const ex = e.x - P.x, ey = e.y - P.y;
    const along = ex * cx + ey * cy;
    if (along < -e.r || along > b.len + e.r) continue;
    const perp = Math.abs(-ex * cy + ey * cx);
    if (perp > b.width / 2 + e.r) continue;
    if (cd) { if (R.time < e.cd[idx]) continue; e.cd[idx] = R.time + cd; }
    hitEnemy(e, b.dmg, 'laser', cx, cy, 40);
  }
}

function updateArea(dt) {
  for (let i = waves.length - 1; i >= 0; i--) {
    const v = waves[i];
    v.t += dt;
    if (v.t < 0) { v.x = P.x; v.y = P.y; continue; }
    const u = Math.min(1, v.t / v.dur), r = v.R * (1 - (1 - u) * (1 - u));
    if (!v.done) {
      const n = gridQuery(enemies, v.x, v.y, r + 70), idx = WIDX.nova;
      for (let j = 0; j < n; j++) {
        const e = QBUF[j];
        if (e.cd[idx] === v.id) continue;
        const dx = e.x - v.x, dy = e.y - v.y, rr = r + e.r;
        if (dx * dx + dy * dy < rr * rr) { e.cd[idx] = v.id; const d = Math.hypot(dx, dy) || 1; hitEnemy(e, v.dmg, 'nova', dx / d, dy / d, v.kb); }
      }
      if (u >= 1) v.done = true;
    }
    if (v.t >= v.dur + 0.2) { waves[i] = waves[waves.length - 1]; waves.pop(); }
  }
  for (let i = wells.length - 1; i >= 0; i--) {
    const v = wells[i];
    v.t += dt; v.tick -= dt; v.rot += dt * 2.2;
    const doDmg = v.tick <= 0;
    if (doDmg) v.tick = 0.25;
    const n = gridQuery(enemies, v.x, v.y, v.R + 70);
    for (let j = 0; j < n; j++) {
      const e = QBUF[j];
      if (e.ai === 'crate') continue;
      const dx = v.x - e.x, dy = v.y - e.y, d = Math.hypot(dx, dy) || 1;
      if (d < v.R + e.r) {
        const step = Math.min(d, v.pull * (e.boss ? 0.12 : 1) * dt);
        e.x += (dx / d) * step; e.y += (dy / d) * step;
        if (doDmg) hitEnemy(e, v.dmg, 'singularity', 0, 0, 0);
      }
    }
    if (v.t >= v.dur) {
      if (v.burst) explode(v.x, v.y, v.R, v.burst, 'singularity', '#b98aff');
      wells[i] = wells[wells.length - 1]; wells.pop();
    }
  }
  for (let i = beams.length - 1; i >= 0; i--) {
    const b = beams[i];
    b.t += dt;
    if (b.evo) {
      b.ang += b.spin * dt; b.tick -= dt;
      if (b.tick <= 0) { b.tick = 0.1; beamHit(b, 0.15); }
    } else if (!b.done) { b.done = true; beamHit(b, 0); }
    if (b.t >= b.dur) { beams[i] = beams[beams.length - 1]; beams.pop(); }
  }
}

/* ---------- swarm ---------- */
function fireBullet(x, y, a, sp, r, dmg) {
  if (ebul.length > 600) return;
  ebul.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r, dmg, life: 7 });
}

function bossAI(e, dt, d, nx, ny) {
  const b = e.boss, enraged = e.hp < e.maxHp * 0.5, bs = R.sector.bulletMul;
  b.mx = nx; b.my = ny; b.msp = e.speed;
  if (b.id === 'queen') {
    b.a -= dt; b.c -= dt;
    if (d < 150) b.msp = 0;
    if (b.a <= 0) {
      b.a = enraged ? 1.8 : 2.7;
      const n = enraged ? 18 : 14;
      b.rot += 0.35;
      for (let i = 0; i < n; i++) fireBullet(e.x, e.y, b.rot + (i * TAU) / n, 150 * bs, 7, e.dmg * 0.6);
      if (enraged) for (let i = 0; i < n; i++) fireBullet(e.x, e.y, b.rot + ((i + 0.5) * TAU) / n, 100 * bs, 6, e.dmg * 0.5);
      Snd.fx.bossShot();
    }
    if (b.c <= 0) {
      b.c = 6;
      for (let i = 0; i < 6; i++) { const a = (i * TAU) / 6; spawnEnemy('mite', e.x + Math.cos(a) * 60, e.y + Math.sin(a) * 60, false); }
    }
  } else if (b.id === 'dread') {
    b.pt -= dt;
    const next = (ph, t) => { b.ph = ph; b.pt = t; b.a = 0; };
    switch (b.ph) {
      case 0:
        b.msp = e.speed * 0.5; b.a -= dt;
        if (b.a <= 0) {
          b.a = enraged ? 0.07 : 0.1; b.rot += 0.21;
          const arms = enraged ? 4 : 2;
          for (let k = 0; k < arms; k++) fireBullet(e.x, e.y, b.rot + (k * TAU) / arms, 150 * bs, 7, e.dmg * 0.55);
        }
        if (b.pt <= 0) next(1, 2.0);
        break;
      case 1:
        b.a -= dt;
        if (b.a <= 0) {
          b.a = 0.5;
          const base = Math.atan2(ny, nx);
          for (let k = -2; k <= 2; k++) fireBullet(e.x, e.y, base + k * 0.17, 210 * bs, 7, e.dmg * 0.6);
          Snd.fx.bossShot();
        }
        if (b.pt <= 0) next(2, 0.9);
        break;
      case 2:
        b.msp = 0; b.dx = nx; b.dy = ny;
        if (b.pt <= 0) next(3, 0.75);
        break;
      case 3:
        b.mx = b.dx; b.my = b.dy; b.msp = 410;
        if (b.pt <= 0) next(4, 0.8);
        break;
      default:
        b.msp = e.speed * 0.4;
        if (b.pt <= 0) next(0, 3.2);
    }
    if (enraged && !b.summoned) {
      b.summoned = true;
      for (let i = 0; i < 4; i++) { const a = (i * TAU) / 4; spawnEnemy('tank', e.x + Math.cos(a) * 90, e.y + Math.sin(a) * 90, false); }
    }
  } else {
    b.a -= dt; b.c -= dt; b.s -= dt;
    if (b.a <= 0) {
      b.a = enraged ? 1.8 : 2.6;
      const n = 30, gapAt = (Math.random() * n) | 0;
      for (let i = 0; i < n; i++) { if ((i - gapAt + n) % n < 5) continue; fireBullet(e.x, e.y, (i * TAU) / n + b.rot, 125 * bs, 8, e.dmg * 0.6); }
      b.rot += 0.1;
      Snd.fx.bossShot();
    }
    if (enraged && b.s <= 0) {
      b.s = 0.13; b.rot2 += 0.17;
      for (let k = 0; k < 3; k++) fireBullet(e.x, e.y, b.rot2 + (k * TAU) / 3, 130 * bs, 6, e.dmg * 0.5);
    }
    if (b.c <= 0) {
      b.c = 8;
      for (let i = 0; i < 3; i++) { const a = rand(0, TAU); spawnEnemy('splitter', e.x + Math.cos(a) * 80, e.y + Math.sin(a) * 80, false); }
    }
  }
  // A boss left behind catches up instead of drifting off screen.
  const charging = b.id === 'dread' && (b.ph === 2 || b.ph === 3);
  if (d > 480 && !charging) b.msp = e.speed * 3;
}

function relocate(e) {
  const moving = Math.hypot(P.vx, P.vy) > 20;
  const a = moving ? Math.atan2(P.vy, P.vx) + rand(-1.1, 1.1) : rand(0, TAU);
  const d = Math.hypot(view.vw, view.vh) / 2 + 60;
  e.x = P.x + Math.cos(a) * d; e.y = P.y + Math.sin(a) * d;
  e.kvx = e.kvy = 0;
}

function updateEnemies(dt) {
  const parity = R.frame & 1, farR = Math.hypot(view.vw, view.vh) / 2 + 280;
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (e.dead) continue;
    if (e.flash > 0) e.flash -= dt;
    if (e.hitCd > 0) e.hitCd -= dt;
    if (e.slow > 0) e.slow -= dt;
    const dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy) || 1, nx = dx / d, ny = dy / d;
    let sp = e.speed * (e.slow > 0 ? 1 - e.slowAmt * (e.boss ? 0.4 : 1) : 1);
    let mx = nx, my = ny, face = true;
    switch (e.ai) {
      case 'boss':
        bossAI(e, dt, d, nx, ny);
        mx = e.boss.mx; my = e.boss.my; sp = e.boss.msp * (e.slow > 0 ? 1 - e.slowAmt * 0.4 : 1);
        face = e.boss.id === 'dread';
        break;
      case 'dash':
        e.st -= dt;
        if (e.state === 0) { if (d < 230 && e.st <= 0) { e.state = 1; e.st = 0.6; } }
        else if (e.state === 1) { sp = 0; if (e.st > 0.15) { e.dx = nx; e.dy = ny; } if (e.st <= 0) { e.state = 2; e.st = 0.45; } }
        else { mx = e.dx; my = e.dy; sp = 330; if (e.st <= 0) { e.state = 0; e.st = 1.6; } }
        break;
      case 'ranged':
        if (d < 170) { mx = -nx; my = -ny; }
        else if (d < 240) { mx = -ny * e.side; my = nx * e.side; sp *= 0.6; }
        e.st -= dt;
        if (e.st <= 0 && d < 430) { e.st = 2.6; fireBullet(e.x, e.y, Math.atan2(dy, dx), 170, 6, e.dmg); }
        break;
      case 'blink':
        e.st -= dt;
        if (e.state === 0) { if (e.st <= 0 && d > 140 && d < 600) { e.state = 1; e.st = 0.3; } }
        else if (e.state === 1) {
          sp = 0; e.alpha = Math.max(0, e.st / 0.3);
          if (e.st <= 0) { const a = rand(0, TAU); e.x = P.x + Math.cos(a) * 125; e.y = P.y + Math.sin(a) * 125; e.state = 2; e.st = 0.35; }
        } else {
          sp *= 0.3; e.alpha = 1 - Math.max(0, e.st / 0.35);
          if (e.st <= 0) { e.state = 0; e.st = rand(3, 4.5); e.alpha = 1; }
        }
        break;
      case 'crate':
        sp = 0; face = false;
        break;
    }
    if (!e.boss && e.ai !== 'crate' && (i & 1) === parity) {
      const n = gridQuery(enemies, e.x, e.y, e.r * 2 + 8);
      let sx = 0, sy = 0;
      for (let j = 0; j < n; j++) {
        const o = QBUF[j];
        if (o === e) continue;
        const ox = e.x - o.x, oy = e.y - o.y, rr = e.r + o.r, d2 = ox * ox + oy * oy;
        if (d2 < rr * rr && d2 > 0.01) { const dd = Math.sqrt(d2), push = (rr - dd) / rr; sx += (ox / dd) * push; sy += (oy / dd) * push; }
      }
      e.x += sx * 180 * dt; e.y += sy * 180 * dt;
    }
    e.x += (mx * sp + e.kvx) * dt;
    e.y += (my * sp + e.kvy) * dt;
    const decay = Math.exp(-dt * 7);
    e.kvx *= decay; e.kvy *= decay;
    if (face) { if (sp > 1) e.ang = angleTo(e.ang, Math.atan2(my, mx), 8 * dt); }
    else e.ang += e.spin * dt * 0.5;
    if (d > farR && !e.boss) {
      if (e.ai === 'crate') { e.dead = true; continue; }
      relocate(e);
      continue;
    }
    if (!P.dead && e.dmg > 0 && e.alpha > 0.5 && e.hitCd <= 0) {
      const rr = e.r + P.r * 0.8;
      if (dx * dx + dy * dy < rr * rr) { damagePlayer(e.dmg); e.hitCd = 0.7; }
    }
  }
}

function updateEnemyBullets(dt) {
  for (let i = ebul.length - 1; i >= 0; i--) {
    const b = ebul[i];
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    const dx = b.x - P.x, dy = b.y - P.y, d2 = dx * dx + dy * dy;
    let dead = b.life <= 0 || d2 > 1500 * 1500;
    if (!dead && !P.dead) { const rr = b.r + P.r * 0.6; if (d2 < rr * rr) { damagePlayer(b.dmg); dead = true; } }
    if (dead) { ebul[i] = ebul[ebul.length - 1]; ebul.pop(); }
  }
}

/* ---------- player, pickups ---------- */
function updatePlayer(dt) {
  readStick(stick);
  const jx = stick[0], jy = stick[1], mag = Math.hypot(jx, jy);
  const sp = 150 * R.ship.speed * M.move;
  let tvx = jx * sp, tvy = jy * sp;
  for (const b of R.bosses) {
    if (b.boss.id !== 'devourer') continue;
    const dx = b.x - P.x, dy = b.y - P.y, d = Math.hypot(dx, dy);
    if (d < 700 && d > 1) { tvx += (dx / d) * 42; tvy += (dy / d) * 42; }
  }
  const k = 1 - Math.exp(-dt * 14);
  P.vx += (tvx - P.vx) * k; P.vy += (tvy - P.vy) * k;
  P.x += P.vx * dt; P.y += P.vy * dt;
  if (mag > 0.1) { P.ang = angleTo(P.ang, Math.atan2(jy, jx), 12 * dt); R.moved += dt; }
  if (P.invuln > 0) P.invuln -= dt;
  if (P.hurt > 0) P.hurt -= dt;
  if (M.regen > 0) P.hp = Math.min(M.maxHp, P.hp + M.regen * dt);
  if (mag > 0.1 && Math.random() < 0.7) {
    const bx = P.x - Math.cos(P.ang) * 10, by = P.y - Math.sin(P.ang) * 10;
    parts.push({ x: bx + rand(-2, 2), y: by + rand(-2, 2), vx: -Math.cos(P.ang) * 80 + rand(-20, 20), vy: -Math.sin(P.ang) * 80 + rand(-20, 20), life: 0.3, max: 0.3, size: 3, color: R.ship.color });
  }
}

function gainXp(v) {
  R.xp += v * M.growth;
  while (R.xp >= R.xpNext) { R.xp -= R.xpNext; R.level++; R.xpNext = xpNeed(R.level); R.pending++; }
}

function updateGems(dt) {
  const pr = 65 * M.magnet, pr2 = pr * pr;
  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i];
    const dx = P.x - g.x, dy = P.y - g.y, d2 = dx * dx + dy * dy;
    if (!g.mag && d2 < pr2) g.mag = true;
    if (!g.mag) continue;
    g.sp = Math.min(g.sp + 1000 * dt, 760);
    const d = Math.sqrt(d2) || 1, step = Math.min(d, g.sp * dt);
    g.x += (dx / d) * step; g.y += (dy / d) * step;
    if (d < P.r + 8) {
      gainXp(g.v);
      Snd.fx.gem();
      gems[i] = gems[gems.length - 1]; gems.pop();
    }
  }
}

function bombBlast() {
  for (const e of enemies) {
    if (e.dead || e.ai === 'crate' || !inView(e, 40)) continue;
    if (e.boss) hitEnemy(e, e.maxHp * 0.05, 'bomb', 0, 0, 0);
    else { R.dmg.bomb = (R.dmg.bomb || 0) + e.hp; e.hp = 0; killEnemy(e); }
  }
  ebul.length = 0;
  rings.push({ x: P.x, y: P.y, r0: 20, r1: Math.max(view.vw, view.vh) * 0.8, t: 0, dur: 0.7, color: '#ffffff', w: 12 });
  cam.shake = 16;
  Snd.fx.bigBoom(); vibrate(80);
}

function updateItems(dt) {
  const pr = 65 * M.magnet, pr2 = pr * pr;
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    it.t += dt;
    const dx = P.x - it.x, dy = P.y - it.y, d2 = dx * dx + dy * dy;
    let take = false;
    if (it.k === 'coin') {
      if (!it.mag && d2 < pr2) it.mag = true;
      if (it.mag) {
        it.sp = Math.min(it.sp + 1000 * dt, 760);
        const d = Math.sqrt(d2) || 1, step = Math.min(d, it.sp * dt);
        it.x += (dx / d) * step; it.y += (dy / d) * step;
        if (d < P.r + 8) take = true;
      }
    } else if (d2 < (P.r + 18) * (P.r + 18)) take = true;
    if (!take) continue;
    items[i] = items[items.length - 1]; items.pop();
    switch (it.k) {
      case 'coin': R.gold += it.v; Snd.fx.coin(); break;
      case 'heal':
        P.hp = Math.min(M.maxHp, P.hp + 30);
        addNum(P.x, P.y - 20, 30, false, '#6dff9e');
        burst(P.x, P.y, 16, '#6dff9e', 140, 0.6, 4);
        Snd.fx.heal();
        break;
      case 'magnet': for (const g of gems) g.mag = true; Snd.fx.pickup(); break;
      case 'bomb': bombBlast(); break;
      case 'chest': {
        const rewards = openChest(it.big);
        UI.openChest(rewards, it.big);
        return;
      }
    }
  }
}

/* ---------- progression ---------- */
function levelOf(o) {
  if (o.kind === 'w') { const w = R.weapons.find((x) => x.id === o.id); return w ? w.lv : 0; }
  if (o.kind === 'p') { const p = R.passives.find((x) => x.id === o.id); return p ? p.lv : 0; }
  return 0;
}

function evoHintFor(o) {
  if (o.kind === 'w') {
    const evo = WEAPONS[o.id].evo;
    return { text: 'Ур. 5 + ' + PASSIVES[evo.need].name + ' → ' + evo.name, ready: R.passives.some((p) => p.id === evo.need) };
  }
  if (o.kind === 'p') {
    const w = R.weapons.find((x) => !x.evo && WEAPONS[x.id].evo.need === o.id);
    if (w) return { text: 'Эволюция: ' + WEAPONS[w.id].name + ' → ' + WEAPONS[w.id].evo.name, ready: true };
  }
  return null;
}

function rollOptions() {
  const pool = [];
  const ownW = new Set(R.weapons.map((w) => w.id)), ownP = new Set(R.passives.map((p) => p.id));
  for (const w of R.weapons) if (!w.evo && w.lv < 5) pool.push({ kind: 'w', id: w.id, wt: 1 });
  for (const p of R.passives) if (p.lv < PASSIVES[p.id].max) pool.push({ kind: 'p', id: p.id, wt: 0.9 });
  if (R.weapons.length < 6) for (const id of WEAPON_IDS) if (!ownW.has(id) && weaponUnlocked(id)) pool.push({ kind: 'w', id, wt: 0.85, isNew: true });
  if (R.passives.length < 6) for (const id of PASSIVE_IDS) if (!ownP.has(id)) pool.push({ kind: 'p', id, wt: 0.6, isNew: true });
  const out = [];
  while (out.length < 3 && pool.length) {
    let sum = 0;
    for (const o of pool) sum += o.wt;
    let r = Math.random() * sum, idx = 0;
    for (; idx < pool.length - 1; idx++) { r -= pool[idx].wt; if (r <= 0) break; }
    out.push(pool.splice(idx, 1)[0]);
  }
  if (!out.length) out.push({ kind: 'heal' }, { kind: 'gold', v: Math.round(25 * R.sector.reward) });
  for (const o of out) { o.lvTo = levelOf(o) + 1; o.hint = o.kind === 'w' || o.kind === 'p' ? evoHintFor(o) : null; }
  return out;
}

function applyOption(o) {
  if (o.kind === 'w') {
    const w = R.weapons.find((x) => x.id === o.id);
    if (w) w.lv = Math.min(5, w.lv + 1); else addWeapon(o.id);
  } else if (o.kind === 'p') {
    const p = R.passives.find((x) => x.id === o.id);
    if (p) p.lv++; else R.passives.push({ id: o.id, lv: 1 });
  }
  refreshStats();
  if (o.kind === 'p' && o.id === 'hull') P.hp = Math.min(M.maxHp, P.hp + 20);
  if (o.kind === 'heal') P.hp = Math.min(M.maxHp, P.hp + M.maxHp * 0.4);
  if (o.kind === 'gold') R.gold += o.v || 25;
}

function openChest(big) {
  const rewards = [];
  const evoW = R.weapons.find((w) => !w.evo && w.lv >= 5 && R.passives.some((p) => p.id === WEAPONS[w.id].evo.need));
  if (evoW) { evoW.evo = true; refreshStats(); rewards.push({ kind: 'evo', id: evoW.id }); }
  const n = big ? 3 : Math.random() < 0.25 ? 3 : 1;
  while (rewards.length < n) {
    const pool = [];
    for (const w of R.weapons) if (!w.evo && w.lv < 5) pool.push({ kind: 'w', id: w.id });
    for (const p of R.passives) if (p.lv < PASSIVES[p.id].max) pool.push({ kind: 'p', id: p.id });
    if (!pool.length) { const v = Math.round(25 * R.sector.reward); R.gold += v; rewards.push({ kind: 'gold', v }); break; }
    const o = pick(pool);
    applyOption(o);
    o.lvTo = levelOf(o);
    rewards.push(o);
  }
  return rewards;
}

function enterEndless() {
  R.endless = true;
  R.nextBoss = R.time + 120;
  R.warned = false;
  mode = 'play';
}

function checkUnlocks() {
  const add = (key, text) => { save.unlocked[key] = true; persist(); R.unlocked.push(text); UI.toast(text); };
  if (!save.unlocked.mines && R.time >= 300) add('mines', 'Открыто оружие: Мины');
  if (!save.unlocked.laser && save.stats.kills + R.kills >= 1500) add('laser', 'Открыто оружие: Лазер');
  if (!save.unlocked.singularity && save.cleared[0]) add('singularity', 'Открыто оружие: Сингулярность');
}

function finishRun() {
  const victory = R.victory;
  const coins = Math.round(R.gold * M.greed);
  const kills = Math.round((R.kills / 25) * R.sector.reward);
  const time = Math.round(Math.floor(R.time / 60) * 6 * R.sector.reward);
  const bonus = victory ? Math.round(150 * R.sector.reward) : 0;
  const bosses = R.bossesKilled * Math.round(20 * R.sector.reward);
  const total = coins + kills + time + bonus + bosses;
  const st = save.stats;
  checkUnlocks();
  save.credits += total;
  st.credits += total; st.kills += R.kills; st.runs++; st.bosses += R.bossesKilled;
  st.best[R.sid] = Math.max(st.best[R.sid] || 0, Math.floor(R.time));
  st.bestLevel = Math.max(st.bestLevel, R.level);
  st.playTime += R.time;
  if (R.firstClear && R.sid < 2) R.unlocked.push('Открыт сектор: ' + SECTORS[R.sid + 1].name);
  persist();
  return { victory, total, lines: [['Монеты', coins], ['Уничтожено врагов', kills], ['Время в бою', time], ['Боссы', bosses], ['Победа в секторе', bonus]] };
}

/* ---------- frame ---------- */
function updateFx(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const q = parts[i];
    q.life -= dt;
    if (q.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
    const f = Math.exp(-dt * 2.4);
    q.vx *= f; q.vy *= f; q.x += q.vx * dt; q.y += q.vy * dt;
  }
  for (let i = rings.length - 1; i >= 0; i--) { rings[i].t += dt; if (rings[i].t >= rings[i].dur) { rings[i] = rings[rings.length - 1]; rings.pop(); } }
  for (let i = bolts.length - 1; i >= 0; i--) { bolts[i].t += dt; if (bolts[i].t >= bolts[i].dur) { bolts[i] = bolts[bolts.length - 1]; bolts.pop(); } }
  for (let i = nums.length - 1; i >= 0; i--) { const n = nums[i]; n.t -= dt; n.y -= 34 * dt; if (n.t <= 0) { nums[i] = nums[nums.length - 1]; nums.pop(); } }
  cam.shake *= Math.exp(-dt * 7);
  if (cam.shake < 0.05) cam.shake = 0;
}

function compact() {
  let j = 0;
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e.dead) enemies[j++] = e; else enemyPool.push(e);
  }
  enemies.length = j;
}

function updateRun(dt) {
  R.time += dt; R.frame++;
  director(dt);
  updatePlayer(dt);
  gridBuild(enemies, P.x, P.y);
  updateEnemies(dt);
  updateWeapons(dt);
  updateShots(dt);
  updateArea(dt);
  updateEnemyBullets(dt);
  updateGems(dt);
  if (mode === 'play') updateItems(dt);
  updateFx(dt);
  compact();
  const k = 1 - Math.exp(-dt * 12);
  cam.x += (P.x - cam.x) * k; cam.y += (P.y - cam.y) * k;
  R.secTick -= dt;
  if (R.secTick <= 0) {
    R.secTick = 1;
    checkUnlocks();
    const m = minutes();
    Snd.setMusic(m < 3 ? 0 : m < 6 ? 1 : 2, R.bosses.length > 0);
  }
  if (mode !== 'play') return;
  if (R.victory && !R.victoryShown && R.time >= R.victoryAt) { R.victoryShown = true; UI.showVictory(); return; }
  if (R.pending > 0) UI.openLevelUp();
}

function updateDying(dt) {
  R.deathT += dt;
  gridBuild(enemies, P.x, P.y);
  updateEnemies(dt * 0.4);
  updateEnemyBullets(dt * 0.4);
  updateFx(dt);
  compact();
  if (R.deathT > 1.7) UI.showResult();
}
