'use strict';
/* Game content: weapons, modules, swarm, bosses, ships, sectors and workshop upgrades. */

const WEAPONS = {
  blaster: {
    name: 'Бластер', color: '#5ef2ff',
    lv: [
      { dmg: 10, cd: 0.6, count: 1, pierce: 1, speed: 540, size: 1 },
      { dmg: 10, cd: 0.6, count: 2, pierce: 1, speed: 540, size: 1 },
      { dmg: 14, cd: 0.6, count: 2, pierce: 1, speed: 560, size: 1 },
      { dmg: 14, cd: 0.48, count: 2, pierce: 2, speed: 580, size: 1.1 },
      { dmg: 19, cd: 0.48, count: 3, pierce: 2, speed: 600, size: 1.2 },
    ],
    up: ['Очереди в ближайшего врага', '+1 заряд', 'Урон +40%', 'Перезарядка −20%, пробивает 2 цели', '+1 заряд, урон +35%'],
    evo: { name: 'Гатлинг-шторм', need: 'cooldown', desc: 'Непрерывный поток пробивающих зарядов', st: { dmg: 17, cd: 0.11, count: 2, pierce: 3, speed: 720, size: 1.25 } },
  },
  missile: {
    name: 'Ракеты', color: '#ffb347',
    lv: [
      { dmg: 20, cd: 1.7, count: 1, blast: 40, speed: 330 },
      { dmg: 20, cd: 1.7, count: 2, blast: 40, speed: 330 },
      { dmg: 28, cd: 1.7, count: 2, blast: 48, speed: 340 },
      { dmg: 28, cd: 1.4, count: 3, blast: 48, speed: 350 },
      { dmg: 38, cd: 1.4, count: 4, blast: 54, speed: 360 },
    ],
    up: ['Самонаводящиеся ракеты со взрывом', '+1 ракета', 'Урон +40%, взрыв шире', 'Перезарядка −18%, +1 ракета', '+1 ракета, урон +35%'],
    evo: { name: 'Рой ракет', need: 'area', desc: 'Восемь ракет за залп, огромные взрывы', st: { dmg: 44, cd: 1.05, count: 8, blast: 74, speed: 380 } },
  },
  drones: {
    name: 'Дроны', color: '#9d7bff',
    lv: [
      { dmg: 9, count: 2, radius: 72, rot: 2.6, size: 1 },
      { dmg: 9, count: 3, radius: 72, rot: 2.6, size: 1 },
      { dmg: 13, count: 3, radius: 82, rot: 2.6, size: 1 },
      { dmg: 13, count: 4, radius: 82, rot: 3.2, size: 1.1 },
      { dmg: 18, count: 5, radius: 86, rot: 3.2, size: 1.25 },
    ],
    up: ['Боевые дроны кружат вокруг корабля', '+1 дрон', 'Урон +45%, орбита шире', '+1 дрон, вращение быстрее', '+1 дрон, урон +40%'],
    evo: { name: 'Кольцо Сатурна', need: 'speed', desc: 'Восемь тяжёлых дронов на широкой орбите', st: { dmg: 27, count: 8, radius: 98, rot: 3.7, size: 1.45 } },
  },
  nova: {
    name: 'Импульс', color: '#6dff9e',
    lv: [
      { dmg: 16, cd: 3.2, radius: 110, waves: 1 },
      { dmg: 16, cd: 3.2, radius: 136, waves: 1 },
      { dmg: 24, cd: 3.2, radius: 136, waves: 1 },
      { dmg: 24, cd: 2.6, radius: 136, waves: 1 },
      { dmg: 32, cd: 2.6, radius: 162, waves: 1 },
    ],
    up: ['Волна отбрасывает и ранит всех вокруг', 'Радиус +25%', 'Урон +50%', 'Перезарядка −20%', 'Урон +35%, радиус +20%'],
    evo: { name: 'Сверхновая', need: 'hull', desc: 'Двойная волна огромного радиуса', st: { dmg: 48, cd: 2.0, radius: 225, waves: 2 } },
  },
  lightning: {
    name: 'Молния', color: '#fff36b',
    lv: [
      { dmg: 22, cd: 1.5, strikes: 1, chain: 2, range: 130 },
      { dmg: 22, cd: 1.5, strikes: 1, chain: 3, range: 130 },
      { dmg: 22, cd: 1.5, strikes: 2, chain: 3, range: 130 },
      { dmg: 30, cd: 1.25, strikes: 2, chain: 3, range: 140 },
      { dmg: 30, cd: 1.25, strikes: 3, chain: 4, range: 150 },
    ],
    up: ['Разряд бьёт врагов и перескакивает дальше', '+1 перескок', '+1 разряд', 'Урон +35%, перезарядка −17%', '+1 разряд, +1 перескок'],
    evo: { name: 'Гроза', need: 'crit', desc: 'Пять разрядов, каждый прыгает по шести целям', st: { dmg: 42, cd: 0.85, strikes: 5, chain: 6, range: 175 } },
  },
  aura: {
    name: 'Плазма', color: '#ff6bd0',
    lv: [
      { dmg: 5, tick: 0.5, radius: 58, slow: 0.25 },
      { dmg: 5, tick: 0.5, radius: 68, slow: 0.25 },
      { dmg: 7.5, tick: 0.5, radius: 68, slow: 0.25 },
      { dmg: 7.5, tick: 0.42, radius: 80, slow: 0.3 },
      { dmg: 10, tick: 0.42, radius: 92, slow: 0.35 },
    ],
    up: ['Плазменное поле жжёт и замедляет врагов рядом', 'Радиус +17%', 'Урон +50%', 'Радиус +18%, чаще урон', 'Урон +33%, радиус +15%'],
    evo: { name: 'Корона', need: 'regen', desc: 'Огромное поле, которое чинит корабль', st: { dmg: 16, tick: 0.35, radius: 128, slow: 0.45, heal: 0.6 } },
  },
  disc: {
    name: 'Пила', color: '#a0ffe6',
    lv: [
      { dmg: 15, cd: 1.8, count: 1, speed: 400, size: 1 },
      { dmg: 20, cd: 1.8, count: 1, speed: 400, size: 1 },
      { dmg: 20, cd: 1.8, count: 2, speed: 410, size: 1 },
      { dmg: 20, cd: 1.45, count: 2, speed: 420, size: 1.25 },
      { dmg: 26, cd: 1.45, count: 3, speed: 430, size: 1.3 },
    ],
    up: ['Пила летит вперёд и возвращается', 'Урон +33%', '+1 пила', 'Перезарядка −20%, пилы крупнее', '+1 пила, урон +30%'],
    evo: { name: 'Вихрь клинков', need: 'move', desc: 'Шесть пил раскручиваются спиралью', st: { dmg: 30, cd: 2.0, count: 6, speed: 1, size: 1.35 } },
  },
  mines: {
    name: 'Мины', color: '#ff8a5c',
    lv: [
      { dmg: 42, cd: 2.1, count: 1, blast: 62 },
      { dmg: 42, cd: 2.1, count: 1, blast: 74 },
      { dmg: 58, cd: 2.1, count: 2, blast: 74 },
      { dmg: 58, cd: 1.7, count: 2, blast: 74 },
      { dmg: 78, cd: 1.7, count: 3, blast: 80 },
    ],
    up: ['Оставляет мины на пути роя', 'Радиус взрыва +20%', 'Урон +38%, +1 мина', 'Перезарядка −20%', 'Урон +35%, +1 мина'],
    evo: { name: 'Кассета', need: 'amount', desc: 'Взрыв разбрасывает шесть суббоеприпасов', st: { dmg: 82, cd: 1.5, count: 3, blast: 84, cluster: 6 } },
    lock: { key: 'mines', text: 'Продержись 5 минут в одном полёте' },
  },
  laser: {
    name: 'Лазер', color: '#ff5a36',
    lv: [
      { dmg: 26, cd: 2.3, count: 1, width: 10, len: 520 },
      { dmg: 26, cd: 2.3, count: 1, width: 15, len: 540 },
      { dmg: 36, cd: 2.3, count: 1, width: 15, len: 560 },
      { dmg: 36, cd: 2.3, count: 2, width: 15, len: 580 },
      { dmg: 50, cd: 1.75, count: 2, width: 19, len: 600 },
    ],
    up: ['Луч пробивает весь строй насквозь', 'Луч шире', 'Урон +38%', '+1 луч', 'Урон +40%, перезарядка −24%'],
    evo: { name: 'Луч смерти', need: 'might', desc: 'Вращающиеся лучи держатся полторы секунды', st: { dmg: 20, cd: 3.0, count: 2, width: 24, len: 620, dur: 1.6 } },
    lock: { key: 'laser', text: 'Уничтожь 1500 врагов за все полёты' },
  },
  singularity: {
    name: 'Сингулярность', color: '#b98aff',
    lv: [
      { dmg: 5, cd: 6.5, radius: 96, dur: 2.6, pull: 95 },
      { dmg: 5, cd: 6.5, radius: 116, dur: 2.6, pull: 95 },
      { dmg: 7.5, cd: 6.5, radius: 116, dur: 2.6, pull: 105 },
      { dmg: 7.5, cd: 5.2, radius: 116, dur: 3.4, pull: 110 },
      { dmg: 10, cd: 5.2, radius: 136, dur: 3.4, pull: 125 },
    ],
    up: ['Чёрная дыра стягивает и перемалывает рой', 'Радиус +20%', 'Урон +50%', 'Перезарядка −20%, держится дольше', 'Урон +33%, радиус +17%'],
    evo: { name: 'Горизонт событий', need: 'magnet', desc: 'Гигантская дыра, которая взрывается в конце', st: { dmg: 15, cd: 5.0, radius: 185, dur: 3.6, pull: 155, burst: 170 } },
    lock: { key: 'singularity', text: 'Победи флагман роя в секторе «Пояс Ориона»' },
  },
};
const WEAPON_IDS = Object.keys(WEAPONS);
const WIDX = {};
WEAPON_IDS.forEach((id, i) => { WIDX[id] = i; });
const AMOUNT_WEAPONS = new Set(['blaster', 'missile', 'drones', 'disc', 'mines', 'laser']);

const PASSIVES = {
  might: { name: 'Усилитель', color: '#ff5a5a', max: 5, desc: 'Урон всего оружия +10%' },
  cooldown: { name: 'Охладитель', color: '#5ef2ff', max: 5, desc: 'Перезарядка оружия −7%' },
  area: { name: 'Боеголовка', color: '#ffb347', max: 5, desc: 'Площадь атак и взрывов +10%' },
  speed: { name: 'Ускоритель', color: '#a0ffe6', max: 5, desc: 'Скорость снарядов и длительность +10%' },
  amount: { name: 'Мультиствол', color: '#fff36b', max: 2, desc: '+1 снаряд почти у всего оружия' },
  move: { name: 'Двигатель', color: '#7fb2ff', max: 5, desc: 'Скорость корабля +8%' },
  hull: { name: 'Корпус', color: '#6dff9e', max: 5, desc: 'Прочность +20 и мгновенный ремонт' },
  armor: { name: 'Броня', color: '#c8d4ff', max: 5, desc: 'Входящий урон −1' },
  regen: { name: 'Нанороботы', color: '#6dffb8', max: 5, desc: 'Ремонт корпуса +0,3 в секунду' },
  magnet: { name: 'Магнит', color: '#ff7ad9', max: 5, desc: 'Радиус сбора опыта +30%' },
  crit: { name: 'Прицел', color: '#ffd84a', max: 5, desc: 'Шанс критического удара +6%' },
  growth: { name: 'Обучение', color: '#b98aff', max: 5, desc: 'Получаемый опыт +8%' },
};
const PASSIVE_IDS = Object.keys(PASSIVES);

const ENEMIES = {
  mite: { name: 'Мошка', hp: 6, speed: 74, dmg: 5, r: 9, xp: 1, color: '#5ef2ff', shape: 'tri', note: 'Мелкая и быстрая, ходит стаями' },
  drone: { name: 'Дрон', hp: 13, speed: 60, dmg: 8, r: 12, xp: 1, color: '#ff5fd2', shape: 'diamond', note: 'Основа роя' },
  beetle: { name: 'Жук', hp: 32, speed: 47, dmg: 10, r: 15, xp: 2, color: '#7dff8a', shape: 'hex', note: 'Бронированный, держит удар' },
  dasher: { name: 'Таран', hp: 20, speed: 52, dmg: 13, r: 12, xp: 2, color: '#ff5a4a', shape: 'arrow', ai: 'dash', note: 'Замирает и делает рывок — уходи вбок' },
  spitter: { name: 'Плевун', hp: 24, speed: 55, dmg: 7, r: 13, xp: 3, color: '#ffd84a', shape: 'eye', ai: 'ranged', note: 'Держит дистанцию и стреляет' },
  tank: { name: 'Крепость', hp: 100, speed: 33, dmg: 16, r: 24, xp: 6, color: '#ff9a3a', shape: 'square', kbRes: 0.3, note: 'Медленная, но очень прочная' },
  splitter: { name: 'Делитель', hp: 44, speed: 42, dmg: 10, r: 18, xp: 3, color: '#b98aff', shape: 'blob', ai: 'split', note: 'Распадается на три мошки' },
  wraith: { name: 'Призрак', hp: 38, speed: 64, dmg: 11, r: 14, xp: 3, color: '#c8d4ff', shape: 'ghost', ai: 'blink', note: 'Телепортируется к кораблю' },
  crate: { name: 'Контейнер', hp: 1, speed: 0, dmg: 0, r: 15, xp: 0, color: '#ffc247', shape: 'crate', ai: 'crate', note: 'Внутри монеты, ремкомплект, магнит или бомба' },
};
const ENEMY_IDS = Object.keys(ENEMIES);

const BOSSES = {
  queen: { name: 'Матка роя', hp: 7000, speed: 52, dmg: 20, r: 46, color: '#ff5fd2', shape: 'queen', note: 'Кольца шипов и выводки мошек' },
  dread: { name: 'Дредноут', hp: 12000, speed: 42, dmg: 26, r: 56, color: '#ff9a3a', shape: 'dread', note: 'Спирали, залпы и таранный рывок' },
  devourer: { name: 'Пожиратель звёзд', hp: 16000, speed: 46, dmg: 28, r: 60, color: '#ff4d5e', shape: 'devourer', note: 'Притягивает корабль, кольца с брешью' },
};

const SHIPS = [
  { id: 'spark', name: 'Искра', color: '#5ef2ff', hp: 100, speed: 1, weapon: 'blaster', price: 0, perk: 'Надёжный универсал', mods: {} },
  { id: 'hawk', name: 'Ястреб', color: '#ffb347', hp: 80, speed: 1.18, weapon: 'missile', price: 400, perk: 'Перезарядка −10%', mods: { cdMul: 0.9 } },
  { id: 'bastion', name: 'Бастион', color: '#6dff9e', hp: 150, speed: 0.86, weapon: 'aura', price: 650, perk: 'Броня +1', mods: { armor: 1 } },
  { id: 'storm', name: 'Буревестник', color: '#fff36b', hp: 90, speed: 1.05, weapon: 'lightning', price: 900, perk: 'Площадь атак +15%', mods: { area: 0.15 } },
  { id: 'reaper', name: 'Жнец', color: '#ff6bd0', hp: 75, speed: 1.12, weapon: 'disc', price: 1200, perk: 'Шанс крита +15%', mods: { crit: 0.15 } },
];

const SECTORS = [
  {
    name: 'Пояс Ориона', sub: 'Окраина роя. Флагман: Дредноут', hpMul: 1, dmgMul: 1, spawnMul: 1, shift: 0,
    bosses: ['queen', 'dread'], bossMul: 1, bulletMul: 1, reward: 1,
    bg: ['#070a1f', '#130b2e'], neb: ['#5a2ea6', '#c2367a', '#2b4f9a'],
  },
  {
    name: 'Ледяная туманность', sub: 'Холодные гнёзда. Флагман: Пожиратель звёзд', hpMul: 1.55, dmgMul: 1.2, spawnMul: 1.12, shift: 1,
    bosses: ['dread', 'devourer'], bossMul: 1.5, bulletMul: 1.1, reward: 1.6,
    bg: ['#03121f', '#08223a'], neb: ['#1f8f9a', '#3a5bd0', '#7fe7ff'],
  },
  {
    name: 'Горизонт событий', sub: 'Сердце роя. Флагман: Пожиратель звёзд', hpMul: 2.3, dmgMul: 1.45, spawnMul: 1.25, shift: 2,
    bosses: ['queen', 'devourer'], bossMul: 2.4, bulletMul: 1.22, reward: 2.4,
    bg: ['#140604', '#250a0a'], neb: ['#ff6a3a', '#a8203a', '#ffb04a'],
  },
];

const META = [
  { id: 'hull', name: 'Укреплённый корпус', desc: '+10 прочности', max: 5, base: 60 },
  { id: 'might', name: 'Калибровка орудий', desc: '+5% урона', max: 5, base: 80 },
  { id: 'armor', name: 'Композитная броня', desc: '−1 входящий урон', max: 3, base: 140 },
  { id: 'move', name: 'Форсаж', desc: '+5% скорости корабля', max: 3, base: 70 },
  { id: 'magnet', name: 'Сборщик', desc: '+15% радиуса сбора', max: 3, base: 50 },
  { id: 'cooldown', name: 'Охлаждение', desc: '−3% перезарядки', max: 3, base: 150 },
  { id: 'growth', name: 'Тренажёр', desc: '+5% опыта', max: 5, base: 70 },
  { id: 'greed', name: 'Контрабанда', desc: '+10% кредитов', max: 5, base: 60 },
  { id: 'crit', name: 'Оптика', desc: '+3% шанса крита', max: 3, base: 90 },
  { id: 'reroll', name: 'Перекомпоновка', desc: '+1 переброс улучшений за полёт', max: 3, base: 100 },
  { id: 'revive', name: 'Капсула спасения', desc: 'Одно воскрешение за полёт', max: 1, base: 600 },
];
function metaCost(m, lvl) { return Math.round(m.base * Math.pow(1.75, lvl)); }

function waveWeights(m) {
  return {
    mite: m < 2 ? 6 : m < 5 ? 3 : 2,
    drone: m < 1 ? 2 : m < 6 ? 4 : 3,
    beetle: m < 1 ? 0 : m < 3 ? 2 : 3,
    dasher: m < 2 ? 0 : 2.5,
    spitter: m < 3 ? 0 : m < 6 ? 1.6 : 2.5,
    tank: m < 3.5 ? 0 : m < 7 ? 1.4 : 2.4,
    splitter: m < 5.5 ? 0 : 1.8,
    wraith: m < 7 ? 0 : 1.8,
  };
}

function weaponUnlocked(id) {
  const lock = WEAPONS[id].lock;
  return !lock || !!save.unlocked[lock.key];
}
function sectorUnlocked(i) { return i === 0 || !!save.cleared[i - 1]; }
