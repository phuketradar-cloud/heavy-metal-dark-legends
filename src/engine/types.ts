export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#a9a9b5',
  rare: '#4aa3ff',
  epic: '#b05cff',
  legendary: '#ffb02e',
  mythic: '#ff3d5a',
};
export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', mythic: 'Mythic',
};

export type Elem = 'phys' | 'fire' | 'lightning' | 'dark';
export type CardCat = 'attack' | 'defense' | 'support' | 'magic' | 'passive';
export type Slot = 'weapon' | 'helmet' | 'armor' | 'gloves' | 'boots' | 'accessory';
export const SLOTS: Slot[] = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'accessory'];

export interface Stats { hp: number; atk: number; def: number; crit: number; mag: number; speed: number; mp: number }

export type StatusId =
  | 'atkUp' | 'critUp' | 'comboUp' | 'guard' | 'thorns' | 'counter' | 'burn' | 'weak' | 'curse' | 'demon';

export interface Status { id: StatusId; turns: number; value: number }

export const STATUS_INFO: Record<StatusId, { icon: string; name: string; desc: string; bad?: boolean }> = {
  atkUp: { icon: '⚔', name: 'Battle Cry', desc: 'Damage increased' },
  critUp: { icon: '🎯', name: 'Crit Boost', desc: 'Critical chance increased' },
  comboUp: { icon: '🔥', name: 'Combo Amp', desc: 'Combo multiplier grows faster' },
  guard: { icon: '🛡', name: 'Guard', desc: 'Incoming damage reduced' },
  thorns: { icon: '🌵', name: 'Dark Barrier', desc: 'Reflects damage to attackers' },
  counter: { icon: '↩', name: 'Counter', desc: 'Reduces a hit and strikes back' },
  burn: { icon: '♨', name: 'Burning', desc: 'Takes fire damage each turn', bad: true },
  weak: { icon: '⬇', name: 'Weakened', desc: 'Damage reduced', bad: true },
  curse: { icon: '☠', name: 'Cursed', desc: 'Takes extra damage', bad: true },
  demon: { icon: '👹', name: 'Demon', desc: 'A summoned demon strikes each turn' },
};

export interface PlayerStats {
  maxHp: number; atk: number; def: number; crit: number; mag: number; speed: number; maxMp: number;
  critDmg: number; energy: number;
  elem: Record<Elem, number>; // percent damage bonus
  lifesteal: number; thorns: number; startShield: number; mpMul: number; comboStep: number;
  eyeHeal: number; crossMul: number; turnHeal: number; defMul: number;
}

export interface CardInst { uid: number; id: string; level: number }

export interface Fx {
  kind: 'dmg' | 'heal' | 'shield' | 'text' | 'mp' | 'crit' | 'weak' | 'resist';
  target: 'player' | 'enemy' | 'board';
  text: string;
  color?: string;
  r?: number; c?: number;
}
export type Anim = 'idle' | 'attack' | 'crit' | 'hit' | 'cast' | 'victory' | 'defeat' | 'special';
