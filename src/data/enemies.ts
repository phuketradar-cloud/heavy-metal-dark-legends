import type { Elem } from '../engine/types';

export type MoveKind = 'attack' | 'heal' | 'summon' | 'guard' | 'buff' | 'curse' | 'scramble' | 'drain';
export interface Move {
  id: string; name: string; kind: MoveKind; power: number; hits?: number; elem?: Elem; icon: string;
  tele: string; burn?: boolean;
}

export const MOVES: Record<string, Move> = {
  slash: { id: 'slash', name: 'Rusty Slash', kind: 'attack', power: 1, elem: 'phys', icon: '🗡', tele: 'Prepares a strike' },
  smash: { id: 'smash', name: 'Skull Smash', kind: 'attack', power: 1.9, elem: 'phys', icon: '🔨', tele: 'Winding up a HEAVY blow!' },
  flurry: { id: 'flurry', name: 'Bone Flurry', kind: 'attack', power: 0.55, hits: 3, elem: 'phys', icon: '⚔', tele: 'Prepares a triple strike' },
  fireBolt: { id: 'fireBolt', name: 'Fire Bolt', kind: 'attack', power: 1.15, elem: 'fire', icon: '🔥', tele: 'Gathers fire' },
  hellfire: { id: 'hellfire', name: 'Hellfire Breath', kind: 'attack', power: 1.6, elem: 'fire', burn: true, icon: '🌋', tele: 'Inhales — area fire attack!' },
  darkBolt: { id: 'darkBolt', name: 'Shadow Bolt', kind: 'attack', power: 1.2, elem: 'dark', icon: '🌑', tele: 'Chants a dark spell' },
  bite: { id: 'bite', name: 'Savage Bite', kind: 'attack', power: 1.1, elem: 'phys', icon: '🐺', tele: 'Bares its fangs' },
  pounce: { id: 'pounce', name: 'Pounce', kind: 'attack', power: 1.5, elem: 'phys', icon: '💢', tele: 'Crouches to pounce!' },
  curse: { id: 'curse', name: 'Hex of Weakness', kind: 'curse', power: 0, icon: '☠', tele: 'Weaves a curse (weakens you)' },
  drain: { id: 'drain', name: 'Life Drain', kind: 'drain', power: 0.9, elem: 'dark', icon: '🩸', tele: 'Reaches for your life force' },
  heal: { id: 'heal', name: 'Dark Mending', kind: 'heal', power: 0.18, icon: '✚', tele: 'Prepares to heal itself' },
  summon: { id: 'summon', name: 'Raise Dead', kind: 'summon', power: 0.5, icon: '💀', tele: 'Raises skeletons (bone shield + minions)' },
  guard: { id: 'guard', name: 'Iron Guard', kind: 'guard', power: 0.12, icon: '🛡', tele: 'Raises a shield' },
  warcry: { id: 'warcry', name: 'War Cry', kind: 'buff', power: 0.35, icon: '📣', tele: 'Roars — attack power rising' },
  scramble: { id: 'scramble', name: 'Chaos Surge', kind: 'scramble', power: 0.4, icon: '🌀', tele: 'Warps the board!' },
  chain: { id: 'chain', name: 'Chain Whip', kind: 'attack', power: 1.25, elem: 'phys', icon: '⛓', tele: 'Whirls its chains' },
  lightning: { id: 'lightning', name: 'Storm Wrath', kind: 'attack', power: 1.35, elem: 'lightning', icon: '⚡', tele: 'Calls the storm' },
  meteor: { id: 'meteor', name: 'Infernal Rain', kind: 'attack', power: 2.2, elem: 'fire', burn: true, icon: '☄', tele: 'Calls a METEOR — prepare defenses!' },
  doom: { id: 'doom', name: 'Doom Riff', kind: 'attack', power: 2.4, elem: 'dark', icon: '🎸', tele: 'Tunes a DOOM chord — brace yourself!' },
};

export type EnemyType = 'Undead Warrior' | 'Demonic Beast' | 'Skeleton Knight' | 'Dark Priest' | 'Chaos Monster' | 'Metal Lord';

export interface MonsterArt {
  kind: 'humanoid' | 'hound' | 'dragon';
  head: 'skull' | 'horned' | 'hood' | 'helm' | 'crown' | 'demon';
  c1: string; c2: string; glow: string;
  weapon: 'sword' | 'mace' | 'staff' | 'axe' | 'none';
  scale?: number;
  /** optional painted artwork in /public (already facing left); falls back to the SVG figure */
  img?: string; imgAspect?: number; face?: [number, number];
  /** opaque-pixel fraction of the image box and horizontal centre of mass (0..1) — used to size painted enemies by visual mass */
  fill?: number; cx?: number; boost?: number;
}

export interface Phase { at: number; moves: string[]; enrage?: boolean; label: string }
export interface EnemyDef {
  id: string; name: string; type: EnemyType; art: MonsterArt;
  hp: number; atk: number; def: number; speed: number;
  res: Partial<Record<Elem, number>>; // multipliers: >1 weak, <1 resist
  moves: string[]; phases?: Phase[]; boss?: boolean; tagline?: string;
}

const E = (id: string, name: string, type: EnemyType, art: MonsterArt, hp: number, atk: number, def: number,
  res: EnemyDef['res'], moves: string[]): EnemyDef => ({ id, name, type, art, hp, atk, def, speed: 8, res, moves });

const H = (head: MonsterArt['head'], c1: string, c2: string, glow: string, weapon: MonsterArt['weapon'], scale = 1): MonsterArt =>
  ({ kind: 'humanoid', head, c1, c2, glow, weapon, scale });
const D = (c1: string, c2: string, glow: string): MonsterArt => ({ kind: 'dragon', head: 'horned', c1, c2, glow, weapon: 'none', scale: 1 });
const W = (c1: string, c2: string, glow: string): MonsterArt => ({ kind: 'hound', head: 'horned', c1, c2, glow, weapon: 'none', scale: 1 });

export const ENEMIES: Record<string, EnemyDef> = Object.fromEntries([
  // Region 1 – Cursed Village
  E('ghoul', 'Rotting Ghoul', 'Undead Warrior', H('skull', '#4a5a3a', '#2a3322', '#9aff6a', 'sword'), 230, 15, 4, { fire: 1.4, dark: 0.6 }, ['slash', 'slash', 'smash']),
  E('plagueHound', 'Plague Hound', 'Demonic Beast', W('#3a2a2a', '#1a1010', '#ff4a2a'), 210, 16, 3, { lightning: 1.3 }, ['bite', 'bite', 'pounce']),
  E('cultist', 'Hollow Cultist', 'Dark Priest', H('hood', '#3a2448', '#1c1024', '#c85cff', 'staff'), 200, 14, 3, { phys: 1.2, dark: 0.5 }, ['darkBolt', 'curse', 'darkBolt']),
  // Region 2 – Blood Forest
  E('bloodWolf', 'Blood Wolf', 'Demonic Beast', W('#6a1c1c', '#2a0808', '#ff2a2a'), 250, 18, 5, { lightning: 1.3, fire: 0.9 }, ['bite', 'flurry', 'pounce']),
  E('thornKnight', 'Rotwood Knight', 'Skeleton Knight', H('helm', '#3a4a2a', '#1a2a14', '#8aff4a', 'axe'), 270, 17, 9, { fire: 1.5 }, ['slash', 'guard', 'smash']),
  E('acolyte', 'Crimson Acolyte', 'Dark Priest', H('hood', '#7a1c2a', '#2a0810', '#ff4a6a', 'staff'), 220, 16, 4, { phys: 1.2 }, ['drain', 'fireBolt', 'heal']),
  // Region 3 – Forgotten Cathedral
  E('paladin', 'Fallen Paladin', 'Skeleton Knight', H('helm', '#8a8aa0', '#3a3a4a', '#ffe08a', 'sword'), 300, 19, 12, { dark: 1.3, lightning: 0.8 }, ['slash', 'guard', 'smash', 'warcry']),
  E('heretic', 'Heretic Priest', 'Dark Priest', H('hood', '#2a2040', '#100a1c', '#8a5cff', 'staff'), 260, 18, 6, { phys: 1.3 }, ['darkBolt', 'curse', 'heal', 'darkBolt']),
  E('gargoyle', 'Stone Gargoyle', 'Chaos Monster', W('#6a6a78', '#2a2a34', '#ffaa4a'), 340, 20, 16, { lightning: 1.5, phys: 0.7 }, ['pounce', 'guard', 'flurry']),
  // Region 4 – Necromancer Crypt
  E('cryptKnight', 'Crypt Knight', 'Skeleton Knight', H('skull', '#8a8a70', '#34342a', '#6aff9a', 'sword'), 330, 21, 11, { fire: 1.4, dark: 0.5 }, ['slash', 'flurry', 'smash']),
  E('wight', 'Barrow Wight', 'Undead Warrior', H('crown', '#3a4a5a', '#141c24', '#6ad8ff', 'axe'), 340, 22, 8, { fire: 1.3, lightning: 1.2 }, ['chain', 'drain', 'smash']),
  E('ritualist', 'Bone Ritualist', 'Dark Priest', H('hood', '#4a4030', '#1c1810', '#ffd86a', 'staff'), 300, 20, 6, { phys: 1.3 }, ['summon', 'darkBolt', 'curse']),
  // Region 5 – Burning Wasteland
  E('magmaHound', 'Magma Hound', 'Demonic Beast', W('#8a3a10', '#2a1004', '#ffaa2a'), 380, 24, 9, { lightning: 1.4, fire: 0.3 }, ['bite', 'fireBolt', 'pounce']),
  E('ashWalker', 'Ash Walker', 'Undead Warrior', H('skull', '#5a4a40', '#201814', '#ff7a3a', 'mace'), 400, 25, 12, { fire: 0.4, lightning: 1.3 }, ['smash', 'slash', 'warcry']),
  E('spawn', 'Chaos Spawn', 'Chaos Monster', H('demon', '#8a1a5a', '#2a0818', '#ff3aaa', 'none', 1.05), 420, 24, 10, { dark: 0.6, phys: 1.2 }, ['scramble', 'flurry', 'darkBolt']),
  // Region 6 – Demon Citadel
  E('citadelGuard', 'Citadel Guard', 'Skeleton Knight', H('helm', '#4a1a1a', '#180808', '#ff4a2a', 'axe'), 470, 27, 18, { lightning: 1.3, phys: 0.8 }, ['smash', 'guard', 'chain', 'warcry']),
  E('hellPriest', 'Hellfire Priest', 'Dark Priest', H('hood', '#7a1a1a', '#240808', '#ff6a2a', 'staff'), 430, 26, 10, { phys: 1.3, fire: 0.4 }, ['hellfire', 'curse', 'heal', 'fireBolt']),
  E('colossus', 'Gore Colossus', 'Chaos Monster', H('demon', '#6a2a2a', '#200a0a', '#ff3a3a', 'mace', 1.15), 560, 28, 14, { lightning: 1.3 }, ['smash', 'scramble', 'smash', 'warcry']),
  // Region 7 – Abyss Throne
  E('voidKnight', 'Void Knight', 'Metal Lord', H('helm', '#1a1a3a', '#080814', '#8a5cff', 'sword'), 560, 31, 20, { dark: 0.4, lightning: 1.3 }, ['smash', 'darkBolt', 'flurry', 'guard']),
  E('abyssBeast', 'Abyss Stalker', 'Demonic Beast', W('#2a1a4a', '#0a0818', '#c85cff'), 520, 32, 14, { fire: 1.3, dark: 0.4 }, ['pounce', 'drain', 'flurry']),
  E('vanguard', 'Metal Lord Vanguard', 'Metal Lord', H('crown', '#5a5a6a', '#1a1a22', '#ff3a5a', 'mace', 1.1), 600, 33, 22, { dark: 0.7, lightning: 1.2 }, ['doom', 'chain', 'warcry', 'smash']),
].map((e) => [e.id, e]));

export const BOSSES: Record<string, EnemyDef> = Object.fromEntries([
  {
    id: 'gravekeeper', name: 'The Gravekeeper', type: 'Undead Warrior', boss: true, tagline: 'Warden of the cursed dead',
    art: { ...H('skull', '#556a44', '#222c1a', '#9aff6a', 'axe', 1), img: 'enemies/gravekeeper.webp', imgAspect: 1000 / 1500, face: [0.490, 0.125] }, hp: 300, atk: 18, def: 8, speed: 9,
    res: { fire: 1.4, dark: 0.5 }, moves: ['slash', 'smash', 'slash', 'warcry'],
    phases: [
      { at: 1, moves: ['slash', 'smash', 'slash', 'warcry'], label: 'Phase I' },
      { at: 0.5, moves: ['smash', 'summon', 'flurry', 'smash'], label: 'Phase II — The Dead Rise' },
      { at: 0.25, moves: ['smash', 'flurry', 'smash'], enrage: true, label: 'ENRAGED' },
    ],
  },
  {
    id: 'bloodDragon', name: 'The Blood Dragon', type: 'Demonic Beast', boss: true, tagline: 'Wyrm of the crimson wood',
    art: { ...D('#8a1818', '#2a0606', '#ff3a1a'), img: 'enemies/bloodDragon.webp', imgAspect: 1028 / 1125, face: [0.29, 0.17] }, hp: 330, atk: 21, def: 12, speed: 10,
    res: { phys: 0.7, fire: 0.3, lightning: 1.5 }, moves: ['bite', 'hellfire', 'bite', 'flurry'],
    phases: [
      { at: 1, moves: ['bite', 'hellfire', 'bite', 'pounce'], label: 'Phase I' },
      { at: 0.55, moves: ['hellfire', 'flurry', 'hellfire', 'smash'], label: 'Phase II — Fire Storm' },
      { at: 0.25, moves: ['hellfire', 'meteor', 'bite'], enrage: true, label: 'ENRAGED' },
    ],
  },
  {
    id: 'archbishop', name: 'Archbishop Malakar', type: 'Dark Priest', boss: true, tagline: 'Hymnal of the damned',
    art: { ...H('hood', '#4a2a6a', '#1a0a2a', '#d85cff', 'staff', 1), img: 'enemies/archbishop.webp', imgAspect: 750 / 1125, face: [0.451, 0.173] }, hp: 340, atk: 23, def: 10, speed: 10,
    res: { phys: 1.25, dark: 0.3 }, moves: ['darkBolt', 'curse', 'heal'],
    phases: [
      { at: 1, moves: ['darkBolt', 'curse', 'darkBolt', 'heal'], label: 'Phase I' },
      { at: 0.55, moves: ['drain', 'curse', 'darkBolt', 'scramble'], label: 'Phase II — Blasphemy' },
      { at: 0.25, moves: ['doom', 'drain', 'darkBolt'], enrage: true, label: 'ENRAGED' },
    ],
  },
  {
    id: 'necromancer', name: 'The Necromancer', type: 'Dark Priest', boss: true, tagline: 'Master of bones',
    art: { ...H('skull', '#3a3a52', '#12121c', '#6affc8', 'staff', 1), img: 'enemies/necromancer.webp', imgAspect: 750 / 1125, face: [0.560, 0.173] }, hp: 360, atk: 25, def: 12, speed: 10,
    res: { phys: 1.1, dark: 0.4, fire: 1.2 }, moves: ['summon', 'curse', 'darkBolt', 'heal'],
    phases: [
      { at: 1, moves: ['summon', 'darkBolt', 'curse', 'heal'], label: 'Phase I' },
      { at: 0.6, moves: ['summon', 'drain', 'curse', 'summon'], label: 'Phase II — Legion of Bones' },
      { at: 0.3, moves: ['darkBolt', 'summon', 'doom', 'heal'], enrage: true, label: 'ENRAGED' },
    ],
  },
  {
    id: 'demonWarlord', name: 'The Demon Warlord', type: 'Demonic Beast', boss: true, tagline: 'Conqueror of ash',
    art: { ...H('horned', '#a82a1a', '#3a0c08', '#ffaa2a', 'mace', 1), img: 'enemies/demonWarlord.webp', imgAspect: 1028 / 1125, face: [0.381, 0.143] }, hp: 390, atk: 27, def: 16, speed: 11,
    res: { fire: 0.4, lightning: 1.3, phys: 0.9 }, moves: ['smash', 'fireBolt', 'slash', 'warcry'],
    phases: [
      { at: 1, moves: ['slash', 'smash', 'fireBolt', 'warcry'], label: 'Phase I' },
      { at: 0.55, moves: ['smash', 'hellfire', 'chain', 'smash'], label: 'Phase II — Hellfire Mace' },
      { at: 0.3, moves: ['smash', 'meteor', 'smash', 'hellfire'], enrage: true, label: 'ENRAGED' },
    ],
  },
  {
    id: 'colossusKing', name: 'Balzagor, Chaos Colossus', type: 'Chaos Monster', boss: true, tagline: 'The citadel incarnate',
    art: { ...H('demon', '#6a1a5a', '#1c0818', '#ff3aff', 'mace', 1), img: 'enemies/colossusKing.webp', imgAspect: 1040 / 1125, face: [0.412, 0.081] }, hp: 420, atk: 30, def: 20, speed: 10,
    res: { dark: 0.5, lightning: 1.3, phys: 1.1 }, moves: ['smash', 'scramble', 'darkBolt', 'warcry'],
    phases: [
      { at: 1, moves: ['smash', 'scramble', 'darkBolt', 'warcry'], label: 'Phase I' },
      { at: 0.6, moves: ['smash', 'drain', 'scramble', 'flurry'], label: 'Phase II — Chaos Unbound' },
      { at: 0.3, moves: ['meteor', 'scramble', 'smash', 'doom'], enrage: true, label: 'ENRAGED' },
    ],
  },
  {
    id: 'azrael', name: 'METAL LORD AZRAEL', type: 'Metal Lord', boss: true, tagline: 'Sovereign of the Abyss Throne',
    art: { ...H('crown', '#7a7a92', '#1a1a26', '#ff2a4a', 'sword', 1), img: 'enemies/azrael.webp', imgAspect: 750 / 1125, face: [0.430, 0.097] }, hp: 480, atk: 34, def: 22, speed: 14,
    res: { dark: 0.6, fire: 0.9, lightning: 1.2 }, moves: ['smash', 'darkBolt', 'chain', 'warcry'],
    phases: [
      { at: 1, moves: ['chain', 'smash', 'darkBolt', 'warcry'], label: 'Phase I' },
      { at: 0.65, moves: ['doom', 'summon', 'flurry', 'curse'], label: 'Phase II — Symphony of Ruin' },
      { at: 0.35, moves: ['meteor', 'doom', 'scramble', 'smash'], label: 'Phase III — Abyssal Overture' },
      { at: 0.18, moves: ['doom', 'meteor', 'hellfire', 'doom'], enrage: true, label: 'ENRAGED' },
    ],
  },
].map((e) => [e.id, e as EnemyDef]));

/** Painted artwork for regular enemies (files in /public/enemies). Entries are merged into each enemy's `art`. */
export const ENEMY_ART: Record<string, { img: string; imgAspect: number; face: [number, number]; fill?: number; cx?: number; boost?: number }> = {
  ghoul: { img: 'enemies/ghoul.webp', imgAspect: 721 / 722, face: [0.325, 0.060], fill: 0.327, cx: 0.575 },
  plagueHound: { img: 'enemies/plagueHound.webp', imgAspect: 1094 / 708, face: [0.119, 0.398], fill: 0.398, cx: 0.468 },
  cultist: { img: 'enemies/cultist.webp', imgAspect: 687 / 716, face: [0.414, 0.112], fill: 0.523, cx: 0.552 },
  bloodWolf: { img: 'enemies/bloodWolf.webp', imgAspect: 1166 / 701, face: [0.078, 0.295], fill: 0.446, cx: 0.441 },
  thornKnight: { img: 'enemies/thornKnight.webp', imgAspect: 787 / 754, face: [0.620, 0.224], fill: 0.523, cx: 0.507 },
  acolyte: { img: 'enemies/acolyte.webp', imgAspect: 750 / 746, face: [0.388, 0.117], fill: 0.415, cx: 0.478 },
  paladin: { img: 'enemies/paladin.webp', imgAspect: 547 / 751, face: [0.458, 0.111], fill: 0.544, cx: 0.543 },
  heretic: { img: 'enemies/heretic.webp', imgAspect: 595 / 736, face: [0.568, 0.087], fill: 0.497, cx: 0.491 },
  gargoyle: { img: 'enemies/gargoyle.webp', imgAspect: 838 / 738, face: [0.188, 0.443], fill: 0.491, cx: 0.507 },
  cryptKnight: { img: 'enemies/cryptKnight.webp', imgAspect: 862 / 742, face: [0.57, 0.21], fill: 0.327, cx: 0.603 },
  wight: { img: 'enemies/wight.webp', imgAspect: 678 / 740, face: [0.385, 0.125], fill: 0.476, cx: 0.556 },
  ritualist: { img: 'enemies/ritualist.webp', imgAspect: 790 / 748, face: [0.510, 0.181], fill: 0.424, cx: 0.594 },
  magmaHound: { img: 'enemies/magmaHound.webp', imgAspect: 1000 / 733, face: [0.140, 0.469], fill: 0.509, cx: 0.481 },
  ashWalker: { img: 'enemies/ashWalker.webp', imgAspect: 865 / 743, face: [0.380, 0.174], fill: 0.438, cx: 0.582 },
  spawn: { img: 'enemies/spawn.webp', imgAspect: 840 / 703, face: [0.249, 0.155], fill: 0.498, cx: 0.527 },
  citadelGuard: { img: 'enemies/citadelGuard.webp', imgAspect: 774 / 758, face: [0.530, 0.202], fill: 0.587, cx: 0.47 },
  hellPriest: { img: 'enemies/hellPriest.webp', imgAspect: 839 / 763, face: [0.458, 0.196], fill: 0.379, cx: 0.517 },
  colossus: { img: 'enemies/colossus.webp', imgAspect: 1008 / 763, face: [0.317, 0.240], fill: 0.492, cx: 0.509 },
  voidKnight: { img: 'enemies/voidKnight.webp', imgAspect: 678 / 762, face: [0.560, 0.162], fill: 0.347, cx: 0.621 },
  abyssBeast: { img: 'enemies/abyssBeast.webp', imgAspect: 1198 / 717, face: [0.036, 0.390], fill: 0.413, cx: 0.451 },
  vanguard: { img: 'enemies/vanguard.webp', imgAspect: 1092 / 752, face: [0.427, 0.122], fill: 0.411, cx: 0.521, boost: 1.6 },
};
Object.entries(ENEMY_ART).forEach(([id, a]) => { if (ENEMIES[id]) Object.assign(ENEMIES[id].art, a); });
