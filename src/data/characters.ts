import type { Rarity, Slot, Stats, PlayerStats } from '../engine/types';
import { SLOTS } from '../engine/types';
import type { Equip } from './equipment';
import { equipTotals } from './equipment';

export interface SkillMod {
  hp?: number; atk?: number; def?: number; mag?: number; crit?: number; speed?: number; mp?: number; // percent for hp/atk/def/mag, flat otherwise
  energy?: number; critDmg?: number; lifesteal?: number; comboStep?: number; startShield?: number;
}
export interface Skill { level: number; name: string; desc: string; mod: SkillMod }

export interface UltDef { id: string; name: string; desc: string; mpCost: number }

export interface CharArt {
  skin: string; armor1: string; armor2: string; accent: string; cape: string; hair: string;
  head: 'hair' | 'helm' | 'hood' | 'horns' | 'mohawk'; weapon: 'sword' | 'greatsword' | 'staff' | 'guitar' | 'axe'; glow: string;
  /** optional painted full-body artwork in /public (falls back to the SVG figure when absent) */
  img?: string; imgAspect?: number; face?: [number, number]; eye?: [number, number];
}

export interface CharDef {
  id: string; name: string; title: string; rarity: Rarity; blurb: string;
  base: Stats; growth: Stats;
  passive: { name: string; desc: string };
  ult: UltDef;
  skills: Skill[];
  art: CharArt;
  unlock: string; // human description
  startDeck: string[];
}

const BASE_DECK = ['thunderStrike', 'bloodSlash', 'ironWall', 'battleCry', 'manaRecovery', 'divineShield', 'shadowCurse', 'criticalBoost'];

export const CHAR_LIST: CharDef[] = [
  {
    id: 'warrior', name: 'Metal Warrior', title: 'Blade of the Riff', rarity: 'rare',
    blurb: 'A balanced melee fighter who bangs steel to the rhythm of battle.',
    base: { hp: 250, atk: 22, def: 14, crit: 8, mag: 10, speed: 12, mp: 90 },
    growth: { hp: 32, atk: 3.2, def: 2.3, crit: 0.35, mag: 1.4, speed: 0.5, mp: 4 },
    passive: { name: 'Iron Will', desc: 'Iron Cross tiles give +50% shield.' },
    ult: { id: 'metalSlash', name: 'Metal Slash', desc: 'Massive physical strike and a protective shield.', mpCost: 50 },
    skills: [
      { level: 1, name: 'Steel Stance', desc: '+5% DEF', mod: { def: 5 } },
      { level: 5, name: 'Headbanger', desc: '+8% ATK', mod: { atk: 8 } },
      { level: 10, name: 'Warhammer Riff', desc: '+10% HP, +3 crit', mod: { hp: 10, crit: 3 } },
      { level: 18, name: 'Unbroken', desc: '+12 starting shield', mod: { startShield: 12 } },
      { level: 26, name: 'Metal God', desc: '+10% ATK, +1 Energy', mod: { atk: 10, energy: 1 } },
    ],
    art: { skin: '#e2b9a0', armor1: '#2b2b36', armor2: '#8a8aa0', accent: '#d12f3a', cape: '#7a0f1f', hair: '#1a1020', head: 'hair', weapon: 'sword', glow: '#ff3a4a', img: 'chars/warrior.webp', imgAspect: 1024 / 1536, face: [0.52, 0.105], eye: [0.633, 0.073] },
    unlock: 'Starting hero',
    startDeck: [...BASE_DECK, 'thunderStrike', 'ironWall', 'bloodSlash', 'rageGuitar'].slice(0, 12),
  },
  {
    id: 'deathKnight', name: 'Death Knight', title: 'Iron Herald of the Grave', rarity: 'epic',
    blurb: 'Heavily armored warrior of terrible physical power and resilience.',
    base: { hp: 300, atk: 24, def: 22, crit: 6, mag: 8, speed: 8, mp: 80 },
    growth: { hp: 38, atk: 3.4, def: 3.2, crit: 0.25, mag: 1.2, speed: 0.3, mp: 3 },
    passive: { name: 'Undying', desc: '+25% DEF and heal 4% max HP at the start of every turn.' },
    ult: { id: 'deathEmbrace', name: "Death's Embrace", desc: 'Dark strike that heals you for 40% of the damage.', mpCost: 60 },
    skills: [
      { level: 1, name: 'Grave Plate', desc: '+8% HP', mod: { hp: 8 } },
      { level: 6, name: 'Soul Brand', desc: '+10% ATK', mod: { atk: 10 } },
      { level: 12, name: 'Cold Aegis', desc: '+10% DEF, +4% lifesteal', mod: { def: 10, lifesteal: 4 } },
      { level: 20, name: 'Reaper Might', desc: '+12% ATK', mod: { atk: 12 } },
      { level: 28, name: 'Eternal Vigil', desc: '+15 starting shield, +1 Energy', mod: { startShield: 15, energy: 1 } },
    ],
    art: { skin: '#9aa0b0', armor1: '#15151c', armor2: '#5a5f78', accent: '#6dd3ff', cape: '#1d2236', hair: '#000', head: 'helm', weapon: 'greatsword', glow: '#5ac8ff', img: 'chars/deathKnight.webp', imgAspect: 1024 / 1536, face: [0.58, 0.115], eye: [0.55, 0.117] },
    unlock: 'Defeat the boss of The Cursed Village',
    startDeck: [...BASE_DECK, 'ironWall', 'counterAttack', 'bloodSlash', 'ironWall'].slice(0, 12),
  },
  {
    id: 'darkPriest', name: 'Dark Priest', title: 'Cantor of the Abyss', rarity: 'epic',
    blurb: 'A dark magic caster who heals with stolen souls.',
    base: { hp: 230, atk: 14, def: 12, crit: 7, mag: 30, speed: 11, mp: 130 },
    growth: { hp: 28, atk: 1.8, def: 2.0, crit: 0.3, mag: 4.0, speed: 0.4, mp: 6 },
    passive: { name: 'Dark Grace', desc: 'Demon Eye tiles heal 1.5% max HP each.' },
    ult: { id: 'soulHarvest', name: 'Soul Harvest', desc: 'Massive dark damage and heals 20% max HP.', mpCost: 60 },
    skills: [
      { level: 1, name: 'Whispers', desc: '+8% MAG', mod: { mag: 8 } },
      { level: 6, name: 'Black Mass', desc: '+30 max MP', mod: { mp: 30 } },
      { level: 12, name: 'Hex Mastery', desc: '+12% MAG, +3 crit', mod: { mag: 12, crit: 3 } },
      { level: 20, name: 'Soul Siphon', desc: '+5% lifesteal', mod: { lifesteal: 5 } },
      { level: 28, name: 'Abyssal Choir', desc: '+15% MAG, +1 Energy', mod: { mag: 15, energy: 1 } },
    ],
    art: { skin: '#cdb7d6', armor1: '#1c1028', armor2: '#6a3a98', accent: '#c45cff', cape: '#2a0f3f', hair: '#e8e0f0', head: 'hood', weapon: 'staff', glow: '#b05cff', img: 'chars/darkPriest.webp', imgAspect: 1000 / 1500, face: [0.56, 0.115], eye: [0.605, 0.17] },
    unlock: 'Defeat the boss of The Blood Forest',
    startDeck: [...BASE_DECK, 'soulDrain', 'holyBlessing', 'soulDrain', 'darkBarrier'].slice(0, 12),
  },
  {
    id: 'guitarist', name: 'Guitarist', title: 'Shredder of Storms', rarity: 'legendary',
    blurb: 'Elemental sound attacks and combo bonuses from a cursed electric guitar.',
    base: { hp: 235, atk: 20, def: 11, crit: 10, mag: 20, speed: 16, mp: 110 },
    growth: { hp: 29, atk: 2.9, def: 2.0, crit: 0.4, mag: 2.6, speed: 0.7, mp: 5 },
    passive: { name: 'Resonance', desc: 'Combo multiplier grows +10% faster; Guitar/Lightning deal +15% damage.' },
    ult: { id: 'powerChord', name: 'Power Chord', desc: 'Four fiery/electric hits and converts tiles into Lightning and Blast tiles.', mpCost: 60 },
    skills: [
      { level: 1, name: 'Palm Mute', desc: '+3 crit', mod: { crit: 3 } },
      { level: 7, name: 'Tapping', desc: '+6% ATK, +6% MAG', mod: { atk: 6, mag: 6 } },
      { level: 14, name: 'Feedback Loop', desc: '+5% combo growth', mod: { comboStep: 0.05 } },
      { level: 22, name: 'Wall of Sound', desc: '+15 starting shield, +30 MP', mod: { startShield: 15, mp: 30 } },
      { level: 30, name: 'Solo of Legends', desc: '+10% ATK/MAG, +1 Energy', mod: { atk: 10, mag: 10, energy: 1 } },
    ],
    art: { skin: '#e8c4a8', armor1: '#231226', armor2: '#8b2436', accent: '#ffb02e', cape: '#3a0f2a', hair: '#ff5a2a', head: 'mohawk', weapon: 'guitar', glow: '#ffa22e', img: 'chars/guitarist.webp', imgAspect: 1024 / 1536, face: [0.5, 0.1], eye: [0.53, 0.087] },
    unlock: 'Defeat the boss of The Forgotten Cathedral',
    startDeck: [...BASE_DECK, 'rageGuitar', 'comboAmplifier', 'thunderStrike', 'rageGuitar'].slice(0, 12),
  },
  {
    id: 'berserker', name: 'Berserker', title: 'Wrath Unchained', rarity: 'mythic',
    blurb: 'Extremely high damage and critical attacks at the cost of defense.',
    base: { hp: 270, atk: 30, def: 8, crit: 16, mag: 6, speed: 14, mp: 80 },
    growth: { hp: 34, atk: 4.3, def: 1.4, crit: 0.55, mag: 0.9, speed: 0.5, mp: 3 },
    passive: { name: 'Bloodlust', desc: '+15% crit damage; low HP boosts damage further.' },
    ult: { id: 'rampage', name: 'Rampage', desc: 'Three guaranteed critical strikes. Costs 10% HP.', mpCost: 70 },
    skills: [
      { level: 1, name: 'Rage', desc: '+8% ATK', mod: { atk: 8 } },
      { level: 8, name: 'Gore Hunger', desc: '+4 crit, +3% lifesteal', mod: { crit: 4, lifesteal: 3 } },
      { level: 15, name: 'Frenzy', desc: '+12% ATK, +25% crit damage', mod: { atk: 12, critDmg: 0.25 } },
      { level: 23, name: 'Unstoppable', desc: '+10% HP, +10% ATK', mod: { hp: 10, atk: 10 } },
      { level: 32, name: 'Ragnarok', desc: '+15% ATK, +1 Energy', mod: { atk: 15, energy: 1 } },
    ],
    art: { skin: '#d9a98c', armor1: '#3a1410', armor2: '#9a3a22', accent: '#ff8a1e', cape: '#4a0c0c', hair: '#8a1010', head: 'horns', weapon: 'axe', glow: '#ff5a1e', img: 'chars/berserker.webp', imgAspect: 750 / 1125, face: [0.64, 0.105], eye: [0.64, 0.15] },
    unlock: 'Defeat the boss of The Necromancer Crypt',
    startDeck: [...BASE_DECK, 'berserkerSoul', 'bloodSlash', 'rageGuitar', 'bloodSlash'].slice(0, 12),
  },
];

export const CHARS: Record<string, CharDef> = Object.fromEntries(CHAR_LIST.map((c) => [c.id, c]));

export const MAX_LEVEL = 40;
export const expToNext = (level: number) => Math.round(50 + level * level * 8 + level * 20);

export const SLOT_UNLOCK: Record<Slot, number> = { weapon: 1, armor: 1, helmet: 3, gloves: 5, boots: 8, accessory: 10 };

export function statsAtLevel(def: CharDef, level: number): Stats {
  const g = (k: keyof Stats) => def.base[k] + def.growth[k] * (level - 1);
  return { hp: g('hp'), atk: g('atk'), def: g('def'), crit: g('crit'), mag: g('mag'), speed: g('speed'), mp: g('mp') };
}

export interface CharSave { unlocked: boolean; level: number; exp: number; equip: Record<Slot, string | null> }
export const emptyEquip = (): Record<Slot, string | null> => ({
  weapon: null, helmet: null, armor: null, gloves: null, boots: null, accessory: null,
});

/** Full battle stats for a character, including level, equipment, skills and passives. */
export function computeStats(def: CharDef, cs: CharSave, inventory: Equip[]): PlayerStats {
  const b = statsAtLevel(def, cs.level);
  const pct = { hp: 0, atk: 0, def: 0, mag: 0 };
  const flat = { crit: 0, speed: 0, mp: 0, energy: 0, critDmg: 0, lifesteal: 0, comboStep: 0, startShield: 0 };
  for (const sk of def.skills) {
    if (cs.level < sk.level) continue;
    const m = sk.mod;
    pct.hp += m.hp ?? 0; pct.atk += m.atk ?? 0; pct.def += m.def ?? 0; pct.mag += m.mag ?? 0;
    flat.crit += m.crit ?? 0; flat.speed += m.speed ?? 0; flat.mp += m.mp ?? 0; flat.energy += m.energy ?? 0;
    flat.critDmg += m.critDmg ?? 0; flat.lifesteal += m.lifesteal ?? 0; flat.comboStep += m.comboStep ?? 0;
    flat.startShield += m.startShield ?? 0;
  }
  const gear = equipTotals(SLOTS.map((s) => inventory.find((e) => e.uid === cs.equip[s]) ?? null).filter(Boolean) as Equip[], cs.level);
  const elem = { phys: gear.elem.phys, fire: gear.elem.fire, lightning: gear.elem.lightning, dark: gear.elem.dark };
  let defMul = 1;
  let turnHeal = 0, crossMul = 1, eyeHeal = 0, comboStep = flat.comboStep, critDmg = 1.75 + flat.critDmg;
  if (def.id === 'deathKnight') { defMul = 1.25; turnHeal = 0.04; }
  if (def.id === 'warrior') crossMul = 1.5;
  if (def.id === 'darkPriest') eyeHeal = 0.015;
  if (def.id === 'guitarist') { comboStep += 0.1; elem.fire += 15; elem.lightning += 15; }
  if (def.id === 'berserker') critDmg += 0.15;
  const gp = gear.passives;
  if (gp.includes('critDmg')) critDmg += 0.35;
  return {
    maxHp: Math.round((b.hp * (1 + pct.hp / 100)) + gear.hp),
    atk: Math.round(b.atk * (1 + pct.atk / 100) + gear.atk),
    def: Math.round((b.def * (1 + pct.def / 100) + gear.def) * defMul),
    crit: Math.round((b.crit + flat.crit + gear.crit) * 10) / 10,
    mag: Math.round(b.mag * (1 + pct.mag / 100) + gear.mag),
    speed: Math.round(b.speed + flat.speed),
    maxMp: Math.round(b.mp + flat.mp),
    critDmg, energy: 4 + flat.energy + (gp.includes('energy') ? 1 : 0),
    elem,
    lifesteal: (flat.lifesteal + (gp.includes('lifesteal') ? 5 : 0)) / 100,
    thorns: gp.includes('thorns') ? 12 + cs.level : 0,
    startShield: flat.startShield + (gp.includes('startShield') ? Math.round(b.hp * 0.12) : 0),
    mpMul: gp.includes('mpGain') ? 1.5 : 1,
    comboStep, eyeHeal, crossMul, turnHeal, defMul,
  };
}
