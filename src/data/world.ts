export type NodeKind = 'battle' | 'event' | 'treasure' | 'elite' | 'boss';

export interface Region {
  id: number; name: string; blurb: string; baseLevel: number;
  roster: string[]; boss: string;
  sky: [string, string, string]; fog: string; moon: string; props: 'village' | 'forest' | 'cathedral' | 'crypt' | 'wasteland' | 'citadel' | 'abyss';
  music: 'heavy' | 'gothic' | 'symphonic' | 'power' | 'doom';
  nodes: NodeKind[];
  unlocksChar?: string;
  /** optional painted background in /public (16:9); falls back to the procedural SVG scene */
  bg?: string;
}

const LAYOUT: NodeKind[] = ['battle', 'event', 'battle', 'treasure', 'elite', 'boss'];

export const REGIONS: Region[] = [
  { id: 0, name: 'The Cursed Village', blurb: 'Rotting huts and restless graves under a bleeding sky.', baseLevel: 1,
    roster: ['ghoul', 'plagueHound', 'cultist'], boss: 'gravekeeper', sky: ['#1a0a1c', '#4a1230', '#8a2a2a'], fog: '#5a2030', moon: '#d8402a',
    props: 'village', music: 'heavy', nodes: LAYOUT, unlocksChar: 'deathKnight', bg: 'bg/region0.webp' },
  { id: 1, name: 'The Blood Forest', blurb: 'Twisted trees whose sap runs red. Something hunts here.', baseLevel: 6,
    roster: ['bloodWolf', 'thornKnight', 'acolyte'], boss: 'bloodDragon', sky: ['#14040a', '#3a0a14', '#7a1a1a'], fog: '#4a1018', moon: '#ff3a2a',
    props: 'forest', music: 'power', nodes: LAYOUT, unlocksChar: 'darkPriest', bg: 'bg/region1.webp' },
  { id: 2, name: 'The Forgotten Cathedral', blurb: 'A ruined sanctum where the choir never stopped singing.', baseLevel: 11,
    roster: ['paladin', 'heretic', 'gargoyle'], boss: 'archbishop', sky: ['#0c0a1c', '#241a44', '#4a3a7a'], fog: '#2a2050', moon: '#c8b8ff',
    props: 'cathedral', music: 'symphonic', nodes: LAYOUT, unlocksChar: 'guitarist', bg: 'bg/region2.webp' },
  { id: 3, name: 'The Necromancer Crypt', blurb: 'Endless catacombs. The bones do not rest.', baseLevel: 16,
    roster: ['cryptKnight', 'wight', 'ritualist'], boss: 'necromancer', sky: ['#060c10', '#10242a', '#1c4a4a'], fog: '#143a38', moon: '#6affc8',
    props: 'crypt', music: 'gothic', nodes: LAYOUT, unlocksChar: 'berserker', bg: 'bg/region3.webp' },
  { id: 4, name: 'The Burning Wasteland', blurb: 'A scorched plain of molten rivers and iron towers.', baseLevel: 21,
    roster: ['magmaHound', 'ashWalker', 'spawn'], boss: 'demonWarlord', sky: ['#1c0804', '#5a1a0a', '#c8501a'], fog: '#7a2a10', moon: '#ffaa2a',
    props: 'wasteland', music: 'power', nodes: LAYOUT, bg: 'bg/region4.webp' },
  { id: 5, name: 'The Demon Citadel', blurb: 'A fortress of black iron and screaming chains.', baseLevel: 26,
    roster: ['citadelGuard', 'hellPriest', 'colossus'], boss: 'colossusKing', sky: ['#14040c', '#4a0a2a', '#9a1a4a'], fog: '#5a1030', moon: '#ff3aaa',
    props: 'citadel', music: 'heavy', nodes: LAYOUT, bg: 'bg/region5.webp' },
  { id: 6, name: 'The Abyss Throne', blurb: 'The end of all songs. The Metal Lord waits.', baseLevel: 31,
    roster: ['voidKnight', 'abyssBeast', 'vanguard'], boss: 'azrael', sky: ['#04040e', '#1a0a3a', '#4a1a6a'], fog: '#2a1050', moon: '#ff2a4a',
    props: 'abyss', music: 'doom', nodes: LAYOUT, bg: 'bg/region6.webp' },
];

export const NODE_LABEL: Record<NodeKind, string> = {
  battle: 'Battle', event: 'Special Event', treasure: 'Treasure', elite: 'Elite Enemy', boss: 'Boss',
};
export const NODE_ICON: Record<NodeKind, string> = { battle: '⚔', event: '❓', treasure: '🧰', elite: '💀', boss: '👹' };

export function nodeLevel(region: Region, idx: number, kind: NodeKind): number {
  const base = region.baseLevel + Math.floor(idx * 0.8);
  return base + (kind === 'elite' ? 1 : kind === 'boss' ? 2 : 0);
}

// ───────── Special events ─────────
export interface EventChoice { label: string; hint: string; id: string }
export interface GameEvent { id: string; title: string; text: string; choices: EventChoice[] }

export const EVENTS: GameEvent[] = [
  { id: 'altar', title: 'The Blood Altar', text: 'A crimson altar pulses with hunger. Offer coin, or offer yourself.',
    choices: [
      { id: 'altar-gold', label: 'Offer 100 gold', hint: 'Receive a random rare+ card.' },
      { id: 'altar-blood', label: 'Offer your blood', hint: 'Gain a random card, but lose a random card from your deck.' },
      { id: 'leave', label: 'Walk away', hint: 'Nothing happens.' },
    ] },
  { id: 'smith', title: 'The Wandering Smith', text: 'A hooded blacksmith hammers at a glowing anvil. "Steel for a song, stranger?"',
    choices: [
      { id: 'smith-up', label: 'Reforge your weapon', hint: 'Upgrade your equipped weapon one level for free.' },
      { id: 'smith-card', label: 'Sharpen a card', hint: 'Upgrade a random deck card for free.' },
      { id: 'leave', label: 'Walk away', hint: 'Nothing happens.' },
    ] },
  { id: 'chest', title: 'The Cursed Chest', text: 'A chest bound in chains whispers your name.',
    choices: [
      { id: 'chest-open', label: 'Break the chains', hint: '50%: epic+ gear.  50%: lose 60 gold.' },
      { id: 'chest-pray', label: 'Pray at the lid', hint: 'Gain 80 gold safely.' },
    ] },
  { id: 'bard', title: 'The Ghost Bard', text: 'A spectral guitarist plays a ballad of your future victories.',
    choices: [
      { id: 'bard-exp', label: 'Listen closely', hint: 'Gain a large amount of EXP.' },
      { id: 'bard-gold', label: 'Pass the hat', hint: 'Gain 120 gold.' },
    ] },
];

/** Recorded battle music per region (public/audio/music). null = fall back to the synth style in `music`. */
export const MUSIC_DIR = 'audio/music/';
export const REGION_TRACK: (string | null)[] = [
  'cursed-village.mp3', 'blood-forest.mp3', 'forgotten-cathedral.mp3', 'necromancer-crypt.mp3', 'burning-wasteland.mp3', 'demon-citadel.mp3', 'abyss-throne.mp3',
];
export const BOSS_TRACK = 'boss.mp3', MAP_TRACK = 'map.mp3', VICTORY_TRACK = 'victory.mp3';
