import type { Elem, Rarity, Slot } from '../engine/types';
import { RARITIES } from '../engine/types';

export type GearPassive = 'lifesteal' | 'thorns' | 'startShield' | 'mpGain' | 'energy' | 'critDmg';
export const PASSIVE_TEXT: Record<GearPassive, string> = {
  lifesteal: 'Lifesteal: heal 5% of damage dealt',
  thorns: 'Thorns: reflect damage to attackers',
  startShield: 'Bulwark: start battle with a shield (12% HP)',
  mpGain: 'Arcane Flow: +50% MP from tiles',
  energy: 'Overdrive: +1 energy each turn',
  critDmg: 'Executioner: +35% critical damage',
};

export interface Equip {
  uid: string; slot: Slot; name: string; rarity: Rarity; level: number; // upgrade level 0..5
  atk: number; def: number; hp: number; crit: number; mag: number;
  elem?: Elem; elemPct?: number; passive?: GearPassive;
}

export const MAX_GEAR_LEVEL = 5;

const NAMES: Record<Slot, string[]> = {
  weapon: ['Rusted Blade', 'Spiked Mace', 'Doom Cleaver', 'Hellfire Axe', 'Riffbreaker', 'Soulreaver'],
  helmet: ['Iron Skullcap', 'Horned Helm', 'Bone Crown', 'Demonhorn Visor', 'Crown of Thorns'],
  armor: ['Studded Leather', 'Chain Hauberk', 'Blackened Plate', 'Bloodforged Cuirass', 'Mantle of Ruin'],
  gloves: ['Spiked Gauntlets', 'Chainmail Grips', 'Wraithclaws', 'Fingers of Fury', 'Pick Hand of Doom'],
  boots: ['Heavy Boots', 'Warcleats', 'Ashwalkers', 'Stompers of Hell', 'Abyssal Greaves'],
  accessory: ['Iron Cross Pendant', 'Skull Ring', 'Chain of Souls', 'Amulet of Echoes', 'Seal of the Abyss'],
};
const RMULT: Record<Rarity, number> = { common: 1, rare: 1.45, epic: 2.0, legendary: 2.8, mythic: 3.8 };
const ELEMS: Elem[] = ['phys', 'fire', 'lightning', 'dark'];
const PASSIVES: GearPassive[] = ['lifesteal', 'thorns', 'startShield', 'mpGain', 'energy', 'critDmg'];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
let counter = 0;

export function rollRarity(minIdx = 0, boost = 0): Rarity {
  const w = [58 - boost * 3, 28, 10 + boost, 3 + boost * 0.6, 1 + boost * 0.3];
  const ws = w.map((x, i) => (i < minIdx ? 0 : Math.max(0, x)));
  let r = Math.random() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < ws.length; i++) { r -= ws[i]; if (r <= 0) return RARITIES[i]; }
  return RARITIES[minIdx];
}

export function generateEquip(areaLevel: number, minRarity: Rarity = 'common', slot?: Slot): Equip {
  const rarity = rollRarity(RARITIES.indexOf(minRarity), Math.floor(areaLevel / 8));
  const s: Slot = slot ?? pick<Slot>(['weapon', 'helmet', 'armor', 'gloves', 'boots', 'accessory']);
  const m = RMULT[rarity] * (1 + areaLevel * 0.06);
  const e: Equip = {
    uid: `e${Date.now().toString(36)}${counter++}${Math.floor(Math.random() * 999)}`,
    slot: s, rarity, level: 0, atk: 0, def: 0, hp: 0, crit: 0, mag: 0,
    name: `${NAMES[s][Math.min(NAMES[s].length - 1, Math.floor(RARITIES.indexOf(rarity) * 0.9 + Math.random() * 1.6))]}`,
  };
  const r = (x: number) => Math.round(x * (0.85 + Math.random() * 0.3));
  switch (s) {
    case 'weapon': e.atk = r(7 * m); e.crit = rarity === 'common' ? 0 : Math.round(m * 0.9); e.mag = r(2 * m); break;
    case 'helmet': e.def = r(3 * m); e.hp = r(22 * m); e.crit = Math.round(m * 0.4); break;
    case 'armor': e.def = r(5 * m); e.hp = r(34 * m); break;
    case 'gloves': e.atk = r(3.5 * m); e.crit = Math.round(m * 1.2); e.def = r(1.5 * m); break;
    case 'boots': e.def = r(2.5 * m); e.hp = r(20 * m); e.atk = r(2 * m); break;
    case 'accessory': e.mag = r(5 * m); e.atk = r(2 * m); e.hp = r(14 * m); e.crit = Math.round(m * 0.7); break;
  }
  if (RARITIES.indexOf(rarity) >= 1) { e.elem = pick(ELEMS); e.elemPct = Math.round(4 * RMULT[rarity] + Math.random() * 4); }
  if (RARITIES.indexOf(rarity) >= 3 || (rarity === 'epic' && Math.random() < 0.5)) e.passive = pick(PASSIVES);
  return e;
}

export const upgradeGearCost = (e: Equip) => Math.round(60 * (e.level + 1) * RMULT[e.rarity] * 1.2);

const lvMul = (e: Equip) => 1 + e.level * 0.12;

export function equipTotals(items: Equip[], _charLevel: number) {
  const t = { atk: 0, def: 0, hp: 0, crit: 0, mag: 0, elem: { phys: 0, fire: 0, lightning: 0, dark: 0 } as Record<Elem, number>, passives: [] as GearPassive[] };
  for (const e of items) {
    const m = lvMul(e);
    t.atk += Math.round(e.atk * m); t.def += Math.round(e.def * m); t.hp += Math.round(e.hp * m);
    t.crit += e.crit * m; t.mag += Math.round(e.mag * m);
    if (e.elem && e.elemPct) t.elem[e.elem] += e.elemPct * m;
    if (e.passive) t.passives.push(e.passive);
  }
  return t;
}

export const ELEM_LABEL: Record<Elem, string> = { phys: 'Physical', fire: 'Fire', lightning: 'Lightning', dark: 'Dark' };
export const SLOT_LABEL: Record<Slot, string> = {
  weapon: 'Weapon', helmet: 'Helmet', armor: 'Armor', gloves: 'Gloves', boots: 'Boots', accessory: 'Accessory',
};
export const SLOT_ICON: Record<Slot, string> = { weapon: '🗡', helmet: '⛑', armor: '🛡', gloves: '🧤', boots: '🥾', accessory: '📿' };
export function sellValue(e: Equip) { return Math.round(25 * RMULT[e.rarity] * (1 + e.level * 0.5)); }
