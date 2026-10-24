'use strict';
/* DOM screens: menu, preparation, workshop, archive, settings, HUD and in-run modals. */

const UI = (() => {
  const SCREEN_IDS = ['menu', 'prep', 'shop', 'codex', 'settings', 'levelup', 'chest', 'pause', 'victory', 'result'];
  const screens = {};
  let opts = [], slotKey = '', hintTimer = 0, giveUpArmed = false, resetArmed = false;
  const hud = { xp: -1, sec: -1, kills: -1, gold: -1, level: -1, boss: null, bossF: -1 };

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const coin = '<svg class="ic"><use href="#i-coin"/></svg>';

  function show(id) {
    for (const k in screens) screens[k].hidden = k !== id;
  }
  function showHud(on) { $('hud').hidden = !on; }
  function refreshCredits() {
    $('mCredits').textContent = fmtNum(save.credits);
    document.querySelectorAll('.credits').forEach((n) => { n.textContent = fmtNum(save.credits); });
  }

  /* ---------- menu ---------- */
  function refreshMenu() {
    refreshCredits();
    const st = save.stats;
    $('mFoot').textContent = st.runs
      ? 'Полётов: ' + st.runs + ' · уничтожено: ' + fmtNum(st.kills) + ' · лучшее время: ' + fmtTime(Math.max(...st.best))
      : 'Продержись 10 минут и уничтожь флагман роя.';
  }
  function goMenu() {
    mode = 'menu';
    clearWorld();
    show('menu'); showHud(false); hideHint();
    refreshMenu();
    Snd.setMusic(0, false);
    $('bannerHost').innerHTML = '';
  }

  /* ---------- preparation ---------- */
  function renderPrep() {
    refreshCredits();
    const list = $('shipList');
    list.innerHTML = '';
    for (const s of SHIPS) {
      const owned = save.ships.includes(s.id), sel = save.ship === s.id;
      const b = el('button', 'row-card ship-card panel cut' + (sel ? ' sel' : '') + (owned ? '' : ' locked'));
      b.type = 'button'; b.id = 'ship-' + s.id;
      const side = owned ? (sel ? '<span class="tag cyan">Выбран</span>' : '') : '<span class="wallet">' + coin + s.price + '</span>';
      b.innerHTML = '<img class="ship-img" src="' + shipIconURL(s) + '" alt=""><div><h4>' + s.name + '</h4>' +
        '<div class="statline"><span>Прочность</span>' + s.hp + '<span>Скорость</span>' + Math.round(s.speed * 100) + '%</div>' +
        '<p>Старт: ' + WEAPONS[s.weapon].name + ' · ' + s.perk + '</p></div><div class="side">' + side + '</div>';
      b.addEventListener('click', () => {
        if (owned) { save.ship = s.id; persist(); Snd.fx.click(); renderPrep(); return; }
        if (save.credits >= s.price) {
          save.credits -= s.price; save.ships.push(s.id); save.ship = s.id; persist();
          Snd.fx.buy(); toast('Корабль «' + s.name + '» в ангаре');
          renderPrep();
        } else { Snd.fx.deny(); toast('Не хватает ' + fmtNum(s.price - save.credits) + ' ' + plural(s.price - save.credits, 'кредита', 'кредитов', 'кредитов')); }
      });
      list.append(b);
    }
    const sl = $('sectorList');
    sl.innerHTML = '';
    SECTORS.forEach((sec, i) => {
      const open = sectorUnlocked(i), sel = save.sector === i;
      const b = el('button', 'row-card panel cut' + (sel ? ' sel' : '') + (open ? '' : ' locked'));
      b.type = 'button'; b.id = 'sector-' + i;
      b.style.gridTemplateColumns = 'minmax(0,1fr) auto';
      const best = save.stats.best[i] ? 'Лучшее время ' + fmtTime(save.stats.best[i]) : 'Ещё не был';
      const lock = open ? '' : '<div class="lock-line">Зачисти сектор «' + SECTORS[i - 1].name + '»</div>';
      b.innerHTML = '<div><h4>' + sec.name + (save.cleared[i] ? ' <span class="tag">Зачищен</span>' : '') + '</h4><p>' + sec.sub + '</p>' +
        '<div class="statline"><span>Прочность роя</span>×' + String(sec.hpMul).replace('.', ',') + '<span>Кредиты</span>×' + String(sec.reward).replace('.', ',') + '</div>' +
        '<p>' + best + '</p>' + lock + '</div><div class="side">' + (sel && open ? '<span class="tag cyan">Выбран</span>' : '') + '</div>';
      b.addEventListener('click', () => {
        if (!open) { Snd.fx.deny(); return; }
        save.sector = i; persist(); Snd.fx.click(); renderPrep();
      });
      sl.append(b);
    });
    if (!sectorUnlocked(save.sector)) save.sector = 0;
  }

  function launch() {
    Snd.init(); Snd.startMusic(); Snd.fx.click();
    if (!save.ships.includes(save.ship)) save.ship = 'spark';
    if (!sectorUnlocked(save.sector)) save.sector = 0;
    startRun(save.ship, save.sector);
    afterStart();
  }
  function afterStart() {
    show(null); showHud(true);
    slotKey = ''; hud.sec = -1; hud.kills = -1; hud.gold = -1; hud.level = -1; hud.xp = -1;
    syncHud();
    banner(R.sector.name, 'Продержись 10:00', true);
    if (!save.tips.move) {
      save.tips.move = 1; persist();
      hint('Веди пальцем в любом месте экрана — корабль полетит туда. Оружие стреляет само.', 7);
    } else hideHint();
  }

  /* ---------- workshop ---------- */
  const META_ICON = { greed: 'gold', reroll: 'amount', revive: 'heal' };
  function renderShop() {
    refreshCredits();
    const list = $('shopList');
    list.innerHTML = '';
    for (const m of META) {
      const lvl = save.meta[m.id] || 0, maxed = lvl >= m.max, cost = metaCost(m, lvl);
      const pips = '<span class="pips">' + Array.from({ length: m.max }, (_, i) => '<i' + (i < lvl ? ' class="on"' : '') + '></i>').join('') + '</span>';
      const card = el('div', 'row-card panel cut');
      card.style.cursor = 'default';
      card.innerHTML = '<img src="' + iconURL(META_ICON[m.id] || m.id) + '" alt=""><div><h4>' + m.name + '</h4><p>' + m.desc + '</p><div class="meta-line">' + pips + '</div></div>';
      const btn = el('button', 'btn btn-sm' + (maxed ? ' btn-ghost' : ''), maxed ? 'Максимум' : coin + fmtNum(cost));
      btn.type = 'button'; btn.id = 'meta-' + m.id;
      btn.disabled = maxed;
      btn.addEventListener('click', () => {
        if (maxed) return;
        if (save.credits < cost) { Snd.fx.deny(); toast('Не хватает ' + fmtNum(cost - save.credits) + ' ' + plural(cost - save.credits, 'кредита', 'кредитов', 'кредитов')); return; }
        save.credits -= cost; save.meta[m.id] = lvl + 1; persist();
        Snd.fx.buy(); renderShop();
      });
      card.append(btn);
      list.append(card);
    }
  }
  function refundAll() {
    let total = 0;
    for (const m of META) { const lvl = save.meta[m.id] || 0; for (let i = 0; i < lvl; i++) total += metaCost(m, i); }
    if (!total) { Snd.fx.deny(); toast('Возвращать нечего'); return; }
    save.credits += total; save.meta = {}; persist();
    Snd.fx.buy(); toast('Возвращено ' + fmtNum(total) + ' ' + plural(total, 'кредит', 'кредита', 'кредитов'));
    renderShop();
  }

  /* ---------- archive ---------- */
  const enemyIconCache = new Map();
  function enemyIconURL(id) {
    let u = enemyIconCache.get(id);
    if (u) return u;
    const s = ART.enemy[id], c = makeCanvas(96, 96), g = c.getContext('2d');
    g.fillStyle = '#0b1028'; g.fillRect(0, 0, 96, 96);
    const scale = Math.min(84 / s.c.width, 84 / s.c.height) * Math.min(1.6, s.c.width / 40);
    const w = Math.min(90, s.c.width * scale), h = Math.min(90, s.c.height * scale);
    g.drawImage(s.c, 48 - w / 2, 48 - h / 2, w, h);
    u = c.toDataURL('image/png');
    enemyIconCache.set(id, u);
    return u;
  }
  function renderCodex() {
    const st = save.stats;
    const cells = [
      ['Полётов', st.runs], ['Уничтожено', fmtNum(st.kills)], ['Боссов', st.bosses], ['Лучший уровень', st.bestLevel],
      ['Заработано', fmtNum(st.credits)], ['Время в бою', fmtTime(st.playTime).replace(':', ' мин ') + ' с'],
    ];
    SECTORS.forEach((s, i) => cells.push([s.name, st.best[i] ? fmtTime(st.best[i]) : '—']));
    $('codexStats').innerHTML = cells.map(([k, v]) => '<div class="stat-cell panel cut"><span>' + k + '</span><b>' + v + '</b></div>').join('');
    $('codexWeapons').innerHTML = WEAPON_IDS.map((id) => {
      const w = WEAPONS[id], open = weaponUnlocked(id);
      return '<div class="row-card panel cut" style="cursor:default;grid-template-columns:56px minmax(0,1fr)"><img src="' + iconURL(id) + '" alt=""><div><h4>' + w.name + '</h4><p>' + w.up[0] + '</p>' +
        '<div class="evo-line">★ Ур. 5 + ' + PASSIVES[w.evo.need].name + ' → ' + w.evo.name + ': ' + w.evo.desc.toLowerCase() + '</div>' +
        (open ? '' : '<div class="lock-line">Закрыто: ' + w.lock.text.toLowerCase() + '</div>') + '</div></div>';
    }).join('');
    $('codexPassives').innerHTML = PASSIVE_IDS.map((id) => {
      const p = PASSIVES[id];
      const evo = WEAPON_IDS.find((w) => WEAPONS[w].evo.need === id);
      return '<div class="row-card panel cut" style="cursor:default;grid-template-columns:56px minmax(0,1fr)"><img src="' + iconURL(id) + '" alt=""><div><h4>' + p.name + '</h4><p>' + p.desc + ' · максимум ' + p.max + ' ур.</p>' +
        (evo ? '<div class="evo-line">Нужен для эволюции: ' + WEAPONS[evo].name + '</div>' : '') + '</div></div>';
    }).join('');
    const foes = ENEMY_IDS.map((id) => [id, ENEMIES[id]]).concat(Object.keys(BOSSES).map((id) => [id, BOSSES[id]]));
    $('codexEnemies').innerHTML = foes.map(([id, d]) =>
      '<div class="row-card panel cut" style="cursor:default;grid-template-columns:56px minmax(0,1fr)"><img src="' + enemyIconURL(id) + '" alt=""><div><h4>' + d.name + (BOSSES[id] ? ' <span class="tag" style="background:var(--red)">Босс</span>' : '') + '</h4><p>' + d.note + '</p></div></div>'
    ).join('');
  }

  /* ---------- settings ---------- */
  const SETTINGS = [
    ['sfx', 'Звуковые эффекты'], ['music', 'Музыка'], ['numbers', 'Цифры урона'], ['vibrate', 'Вибрация'], ['quality', 'Экономная графика'],
  ];
  function renderSettings() {
    const list = $('settingsList');
    list.innerHTML = '';
    for (const [key, label] of SETTINGS) {
      const on = key === 'quality' ? save.settings.quality === 'low' : !!save.settings[key];
      const b = el('button', 'toggle panel cut' + (on ? ' on' : ''), '<span>' + label + '</span><em>' + (on ? 'Вкл' : 'Выкл') + '</em>');
      b.type = 'button'; b.id = 'set-' + key;
      b.addEventListener('click', () => {
        if (key === 'quality') { save.settings.quality = on ? 'high' : 'low'; persist(); onResize(); }
        else { save.settings[key] = !on; persist(); }
        Snd.init(); Snd.applySettings(); Snd.fx.click();
        renderSettings();
      });
      list.append(b);
    }
    resetArmed = false;
    $('bReset').textContent = 'Сбросить прогресс';
  }

  /* ---------- HUD ---------- */
  function syncSlots() {
    const key = R.weapons.map((w) => w.id + w.lv + (w.evo ? 'e' : '')).join(',') + '|' + R.passives.map((p) => p.id + p.lv).join(',');
    if (key === slotKey) return;
    slotKey = key;
    const box = $('hSlots');
    box.innerHTML = '';
    for (const w of R.weapons) box.append(el('div', 'slot' + (w.evo ? ' evo' : ''), '<img src="' + iconURL(w.id, w.evo) + '" alt=""><b>' + (w.evo ? '★' : w.lv) + '</b>'));
    for (const p of R.passives) box.append(el('div', 'slot small', '<img src="' + iconURL(p.id) + '" alt=""><b>' + p.lv + '</b>'));
  }
  function syncHud() {
    if (!R) return;
    const xf = clamp(R.xp / R.xpNext, 0, 1);
    if (Math.abs(xf - hud.xp) > 0.003) { hud.xp = xf; $('xpFill').style.transform = 'scaleX(' + xf.toFixed(3) + ')'; }
    const sec = Math.floor(R.time);
    if (sec !== hud.sec) { hud.sec = sec; $('hTime').textContent = fmtTime(sec); }
    if (R.kills !== hud.kills) { hud.kills = R.kills; $('hKills').textContent = fmtNum(R.kills); }
    if (R.gold !== hud.gold) { hud.gold = R.gold; $('hGold').textContent = fmtNum(R.gold); }
    if (R.level !== hud.level) { hud.level = R.level; $('hLevel').textContent = 'УР. ' + R.level; }
    const b = R.boss && !R.boss.dead ? R.boss : null;
    if (b !== hud.boss) {
      hud.boss = b;
      $('bossbar').hidden = !b;
      if (b) $('bossName').textContent = b.def.name;
      hud.bossF = -1;
    }
    if (b) { const f = clamp(b.hp / b.maxHp, 0, 1); if (Math.abs(f - hud.bossF) > 0.002) { hud.bossF = f; $('bossFill').style.transform = 'scaleX(' + f.toFixed(3) + ')'; } }
    syncSlots();
  }

  function toast(text) {
    const t = el('div', 'toast');
    t.textContent = text;
    const host = $('hud').hidden ? $('toasts') : $('hudToasts');
    while (host.children.length >= 3) host.firstChild.remove();
    host.append(t);
    setTimeout(() => t.remove(), 3300);
  }
  function banner(sub, text, good) {
    const host = $('bannerHost');
    host.innerHTML = '';
    const b = el('div', 'banner' + (good ? ' good' : ''), '<small></small><strong></strong>');
    b.querySelector('small').textContent = sub;
    b.querySelector('strong').textContent = text;
    host.append(b);
    setTimeout(() => b.remove(), 3100);
  }
  function hint(text, sec) {
    const h = $('hint');
    h.textContent = text; h.hidden = false;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(hideHint, sec * 1000);
  }
  function hideHint() { clearTimeout(hintTimer); $('hint').hidden = true; }

  /* ---------- level up ---------- */
  function cardHTML(o) {
    if (o.kind === 'heal') return '<img src="' + iconURL('heal') + '" alt=""><div><h4>Ремкомплект</h4><p>Восстанавливает 40% прочности корпуса</p></div>';
    if (o.kind === 'gold') return '<img src="' + iconURL('gold') + '" alt=""><div><h4>Тайник</h4><p>+' + o.v + ' монет к добыче полёта</p></div>';
    if (o.kind === 'evo') {
      const w = WEAPONS[o.id];
      return '<img src="' + iconURL(o.id, true) + '" alt=""><div><h4>' + w.evo.name + ' <span class="tag">Эволюция</span></h4><p>' + w.evo.desc + '</p></div>';
    }
    const isW = o.kind === 'w', def = isW ? WEAPONS[o.id] : PASSIVES[o.id];
    const lvl = o.isNew ? '<span class="tag">Новое</span>' : '<span class="lvl-label">Ур. ' + o.lvTo + '</span>';
    const desc = isW ? def.up[o.lvTo - 1] : def.desc;
    const h = o.hint ? '<div class="evo-line"' + (o.hint.ready ? '' : ' style="opacity:.55"') + '>★ ' + esc(o.hint.text) + '</div>' : '';
    return '<img src="' + iconURL(o.id) + '" alt=""><div><h4>' + def.name + ' ' + lvl + '</h4><p>' + desc + '</p>' + h + '</div>';
  }
  function renderCards() {
    const box = $('luCards');
    box.innerHTML = '';
    box.classList.add('wait');
    setTimeout(() => box.classList.remove('wait'), 420);
    opts.forEach((o, i) => {
      const b = el('button', 'card' + (o.isNew ? ' new' : ''), cardHTML(o));
      b.type = 'button'; b.id = 'opt-' + i;
      b.addEventListener('click', () => choose(i));
      box.append(b);
    });
    const rr = $('bReroll');
    rr.hidden = R.rerolls <= 0;
    rr.textContent = 'Перебросить · осталось ' + R.rerolls;
  }
  function openLevelUp() {
    if (mode !== 'play' || R.pending <= 0) return;
    R.pending--;
    mode = 'levelup'; releaseStick();
    opts = rollOptions();
    $('luLevel').textContent = R.level - R.pending;
    renderCards();
    show('levelup');
    Snd.fx.levelup(); vibrate(15);
    rings.push({ x: P.x, y: P.y, r0: 10, r1: 90, t: 0, dur: 0.5, color: '#4ff3ff', w: 5 });
  }
  function choose(i) {
    const o = opts[i];
    if (!o || mode !== 'levelup') return;
    applyOption(o);
    Snd.fx.click();
    show(null);
    mode = 'play';
    syncSlots();
  }
  function reroll() {
    if (mode !== 'levelup' || R.rerolls <= 0) return;
    R.rerolls--;
    opts = rollOptions();
    Snd.fx.click();
    renderCards();
  }

  /* ---------- chest ---------- */
  function openChest(rewards, big) {
    mode = 'chest'; releaseStick();
    const evo = rewards.some((r) => r.kind === 'evo');
    $('chTitle').textContent = evo ? 'Эволюция оружия!' : big ? 'Трофей с босса' : 'Контейнер вскрыт';
    const list = $('chList');
    list.innerHTML = '';
    for (const r of rewards) {
      const c = el('div', 'card' + (r.kind === 'evo' ? ' evo' : ''), cardHTML(r.kind === 'w' || r.kind === 'p' ? Object.assign({}, r, { isNew: false, hint: null }) : r));
      c.style.cursor = 'default';
      list.append(c);
    }
    const ok = $('bChestOk');
    ok.disabled = true;
    setTimeout(() => { ok.disabled = false; }, 500);
    show('chest');
    if (evo) { Snd.fx.evolve(); vibrate(60); } else { Snd.fx.chest(); vibrate(20); }
  }
  function closeChest() {
    if (mode !== 'chest') return;
    Snd.fx.click();
    show(null);
    mode = 'play';
    syncSlots();
  }

  /* ---------- pause ---------- */
  function statCells() {
    const pct = (v) => (v >= 0 ? '+' : '−') + Math.round(Math.abs(v) * 100) + '%';
    return [
      ['Урон', pct(M.might - 1)], ['Перезарядка', pct(M.cdMul - 1)], ['Площадь', pct(M.area - 1)], ['Крит', Math.round(M.crit * 100) + '%'],
      ['Броня', M.armor], ['Ремонт', String(M.regen.toFixed(1)).replace('.', ',') + '/с'], ['Скорость', pct(R.ship.speed * M.move - 1)], ['Сбор', pct(M.magnet - 1)],
    ].map(([k, v]) => '<div class="stat-cell panel cut"><span>' + k + '</span><b>' + v + '</b></div>').join('');
  }
  function buildRows() {
    const rows = [];
    for (const w of R.weapons) {
      const d = WEAPONS[w.id];
      const pips = '<span class="pips' + (w.evo ? ' evo' : '') + '">' + [1, 2, 3, 4, 5].map((i) => '<i' + (i <= w.lv || w.evo ? ' class="on"' : '') + '></i>').join('') + '</span>';
      const sub = w.evo ? d.evo.desc : 'Эволюция: ур. 5 + ' + PASSIVES[d.evo.need].name;
      rows.push('<div class="build-row panel cut"><img src="' + iconURL(w.id, w.evo) + '" alt=""><div><b>' + (w.evo ? d.evo.name : d.name) + '</b><small>' + sub + '</small></div>' + pips + '</div>');
    }
    for (const p of R.passives) {
      const d = PASSIVES[p.id];
      const pips = '<span class="pips">' + Array.from({ length: d.max }, (_, i) => '<i' + (i < p.lv ? ' class="on"' : '') + '></i>').join('') + '</span>';
      rows.push('<div class="build-row panel cut"><img src="' + iconURL(p.id) + '" alt=""><div><b>' + d.name + '</b><small>' + d.desc + '</small></div>' + pips + '</div>');
    }
    return rows.join('');
  }
  function syncAudioButtons() {
    $('bPaSfx').classList.toggle('on', save.settings.sfx);
    $('bPaMusic').classList.toggle('on', save.settings.music);
    $('bPaSfx').textContent = save.settings.sfx ? 'Звуки вкл' : 'Звуки выкл';
    $('bPaMusic').textContent = save.settings.music ? 'Музыка вкл' : 'Музыка выкл';
  }
  function openPause() {
    if (mode !== 'play') return;
    mode = 'pause'; releaseStick();
    $('paInfo').textContent = R.sector.name + ' · ' + fmtTime(R.time) + ' · уровень ' + R.level;
    $('paBuild').innerHTML = buildRows();
    $('paStats').innerHTML = statCells();
    giveUpArmed = false;
    $('bGiveUp').textContent = 'Завершить полёт';
    syncAudioButtons();
    show('pause');
  }
  function resume() {
    if (mode !== 'pause') return;
    Snd.fx.click();
    show(null);
    mode = 'play';
  }
  function giveUp() {
    if (!giveUpArmed) { giveUpArmed = true; $('bGiveUp').textContent = 'Точно завершить? Нажми ещё раз'; Snd.fx.deny(); return; }
    R.over = true;
    showResult();
  }

  /* ---------- victory & result ---------- */
  function showVictory() {
    mode = 'victory'; releaseStick();
    show('victory');
    Snd.fx.chest();
  }
  function showResult() {
    if (mode === 'result') return;
    mode = 'result'; releaseStick();
    const sum = finishRun();
    const died = P.dead;
    $('reKicker').textContent = sum.victory ? 'Сектор зачищен' : died ? 'Корабль уничтожен' : 'Отступление';
    $('reKicker').style.color = sum.victory ? 'var(--amber)' : died ? 'var(--red)' : 'var(--cyan)';
    $('reTitle').textContent = sum.victory ? (died ? 'Победа и героическая гибель' : 'Победа!') : died ? 'Полёт окончен' : 'Полёт завершён';
    const cells = [['Время', fmtTime(R.time)], ['Уровень', R.level], ['Уничтожено', fmtNum(R.kills)], ['Боссы', R.bossesKilled]];
    $('reStats').innerHTML = cells.map(([k, v]) => '<div class="stat-cell panel cut"><span>' + k + '</span><b>' + v + '</b></div>').join('');
    $('reCredits').textContent = '+' + fmtNum(sum.total);
    $('reLines').innerHTML = sum.lines.filter(([, v]) => v > 0).map(([k, v]) => '<li><span>' + k + '</span><b>+' + fmtNum(v) + '</b></li>').join('');
    $('reUnlocks').innerHTML = R.unlocked.map((u) => '<div class="unlock-note">★ ' + esc(u) + '</div>').join('');
    const entries = Object.entries(R.dmg).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const max = entries.length ? entries[0][1] : 1;
    $('reDmg').innerHTML = entries.map(([id, v]) => {
      const w = R.weapons.find((x) => x.id === id);
      const name = id === 'bomb' ? 'Бомба' : w && w.evo ? WEAPONS[id].evo.name : WEAPONS[id] ? WEAPONS[id].name : id;
      return '<div class="dmg-row"><img src="' + iconURL(id === 'bomb' ? 'gold' : id, w && w.evo) + '" alt=""><div>' + name + '<div class="dmg-bar"><i style="width:' + Math.max(2, (v / max) * 100).toFixed(1) + '%"></i></div></div><span>' + fmtNum(v) + '</span></div>';
    }).join('') || '<p class="msub">Урона нет</p>';
    show('result'); showHud(false); hideHint();
    Snd.setMusic(0, false);
  }

  /* ---------- wiring ---------- */
  function init() {
    for (const id of SCREEN_IDS) screens[id] = $(id);
    $('bPlay').addEventListener('click', () => { Snd.init(); Snd.startMusic(); Snd.fx.click(); renderPrep(); show('prep'); });
    $('bLaunch').addEventListener('click', launch);
    $('bShop').addEventListener('click', () => { Snd.init(); Snd.fx.click(); renderShop(); show('shop'); });
    $('bCodex').addEventListener('click', () => { Snd.init(); Snd.fx.click(); renderCodex(); show('codex'); });
    $('bSettings').addEventListener('click', () => { Snd.init(); Snd.fx.click(); renderSettings(); show('settings'); });
    $('bRefund').addEventListener('click', refundAll);
    $('bReset').addEventListener('click', () => {
      if (!resetArmed) { resetArmed = true; $('bReset').textContent = 'Стереть всё? Нажми ещё раз'; Snd.fx.deny(); return; }
      const keep = save.settings;
      save = freshSave(); save.settings = keep; persist();
      toast('Прогресс сброшен');
      renderSettings(); refreshMenu();
    });
    document.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => { Snd.fx.click(); refreshMenu(); show('menu'); }));
    $('bPause').addEventListener('click', () => { Snd.fx.click(); openPause(); });
    $('bResume').addEventListener('click', resume);
    $('bGiveUp').addEventListener('click', giveUp);
    $('bPaSfx').addEventListener('click', () => { save.settings.sfx = !save.settings.sfx; persist(); Snd.applySettings(); syncAudioButtons(); Snd.fx.click(); });
    $('bPaMusic').addEventListener('click', () => { save.settings.music = !save.settings.music; persist(); Snd.applySettings(); syncAudioButtons(); Snd.fx.click(); });
    $('bReroll').addEventListener('click', reroll);
    $('bChestOk').addEventListener('click', closeChest);
    $('bEndless').addEventListener('click', () => { Snd.fx.click(); show(null); enterEndless(); banner('Бесконечный режим', 'Рой не кончается', false); });
    $('bFinish').addEventListener('click', () => { Snd.fx.click(); R.over = true; showResult(); });
    $('bAgain').addEventListener('click', () => { const ship = R.ship.id, sid = R.sid; Snd.fx.click(); startRun(ship, sid); afterStart(); });
    $('bToMenu').addEventListener('click', goMenu);
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' || e.code === 'KeyP') { if (mode === 'play') openPause(); else if (mode === 'pause') resume(); }
      if (mode === 'levelup' && /^Digit[1-4]$/.test(e.code)) choose(Number(e.code.slice(5)) - 1);
      if (mode === 'chest' && (e.code === 'Enter' || e.code === 'Space')) closeChest();
    });
    goMenu();
  }

  function back() {
    if (mode === 'play') { openPause(); return true; }
    if (mode === 'pause') { resume(); return true; }
    if (mode === 'levelup' || mode === 'chest' || mode === 'victory' || mode === 'dying') return true;
    if (mode === 'result') { goMenu(); return true; }
    if (!screens.menu.hidden) return false;
    refreshMenu(); show('menu');
    return true;
  }

  return { init, syncHud, toast, banner, hint, hideHint, openLevelUp, openChest, openPause, showVictory, showResult, back, goMenu };
})();
