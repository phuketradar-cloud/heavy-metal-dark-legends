import type { CardCat, Elem, PlayerStats, Rarity, StatusId } from '../engine/types';

/** API the battle engine exposes to card effects. */
export interface CardCtx {
  stats: PlayerStats;
  isBoss: boolean;
  hit(elem: Elem, amount: number, opts?: { crit?: boolean; label?: string }): number;
  heal(n: number): void;
  shield(n: number): void;
  mp(n: number): void;
  energy(n: number): void;
  draw(n: number): void;
  loseHp(n: number): void;
  cleanse(): void;
  buff(id: StatusId, turns: number, value: number): void;
  debuff(id: StatusId, turns: number, value: number): void;
  passive(id: string): void;
  hpPct(): number;
  enemyHpPct(): number;
  say(text: string, color?: string): void;
}

export interface CardDef {
  id: string; name: string; cat: CardCat; rarity: Rarity; cost: number;
  text: (lvl: number, s: PlayerStats) => string;
  run: (c: CardCtx, lvl: number) => void;
}

export const sc = (lvl: number) => 1 + 0.3 * (lvl - 1);
const n = (x: number) => Math.round(x);

export const CARD_LIST: CardDef[] = [
  // ───────── ATTACK ─────────
  {
    id: 'thunderStrike', name: 'Thunder Strike', cat: 'attack', rarity: 'common', cost: 2,
    text: (l, s) => `Deal ${n((40 + s.atk * 1.2) * sc(l))} lightning DMG.`,
    run: (c, l) => { c.hit('lightning', (40 + c.stats.atk * 1.2) * sc(l)); },
  },
  {
    id: 'rageGuitar', name: 'Rage Guitar', cat: 'attack', rarity: 'rare', cost: 3,
    text: (l, s) => `Deal ${n((60 + s.atk * 1.5 + s.mag * 0.5) * sc(l))} fire/sound DMG.`,
    run: (c, l) => { c.hit('fire', (60 + c.stats.atk * 1.5 + c.stats.mag * 0.5) * sc(l)); },
  },
  {
    id: 'bloodSlash', name: 'Blood Slash', cat: 'attack', rarity: 'common', cost: 1,
    text: (l, s) => `Deal ${n((25 + s.atk * 0.9) * sc(l))} physical DMG. Heal 40% of it.`,
    run: (c, l) => { const d = c.hit('phys', (25 + c.stats.atk * 0.9) * sc(l)); c.heal(d * 0.4); },
  },
  {
    id: 'infernalExplosion', name: 'Infernal Explosion', cat: 'attack', rarity: 'epic', cost: 3,
    text: (l, s) => `Deal ${n((55 + s.atk + s.mag) * sc(l))} fire DMG and burn for ${n((12 + s.mag * 0.4) * sc(l))}/turn (3 turns).`,
    run: (c, l) => {
      c.hit('fire', (55 + c.stats.atk + c.stats.mag) * sc(l));
      c.debuff('burn', 3, (12 + c.stats.mag * 0.4) * sc(l));
    },
  },
  {
    id: 'deathSentence', name: 'Death Sentence', cat: 'attack', rarity: 'mythic', cost: 4,
    text: (l, s) => `Deal ${n((70 + s.mag * 1.8) * sc(l))} dark DMG. Double damage vs enemies under 30% HP.`,
    run: (c, l) => {
      const mult = c.enemyHpPct() < 0.3 ? 2.2 : 1;
      c.hit('dark', (70 + c.stats.mag * 1.8) * sc(l) * mult, { label: mult > 1 ? 'EXECUTE' : undefined });
    },
  },
  // ───────── DEFENSE ─────────
  {
    id: 'divineShield', name: 'Divine Shield', cat: 'defense', rarity: 'rare', cost: 2,
    text: (l, s) => `Reduce damage taken by ${50 + 5 * (l - 1)}% this turn. Gain ${n((20 + s.def) * sc(l))} shield.`,
    run: (c, l) => { c.buff('guard', 1, 0.5 + 0.05 * (l - 1)); c.shield((20 + c.stats.def) * sc(l)); },
  },
  {
    id: 'ironWall', name: 'Iron Wall', cat: 'defense', rarity: 'common', cost: 1,
    text: (l, s) => `Gain ${n((35 + s.def * 2) * sc(l))} shield.`,
    run: (c, l) => { c.shield((35 + c.stats.def * 2) * sc(l)); },
  },
  {
    id: 'darkBarrier', name: 'Dark Barrier', cat: 'defense', rarity: 'rare', cost: 2,
    text: (l, s) => `Gain ${n((30 + s.mag + s.def) * sc(l))} shield. Attackers take ${n((15 + s.mag * 0.5) * sc(l))} dark DMG (2 turns).`,
    run: (c, l) => { c.shield((30 + c.stats.mag + c.stats.def) * sc(l)); c.buff('thorns', 2, (15 + c.stats.mag * 0.5) * sc(l)); },
  },
  {
    id: 'counterAttack', name: 'Counter Attack', cat: 'defense', rarity: 'epic', cost: 2,
    text: (l, s) => `Next enemy attack is reduced 40% and answered with ${n((45 + s.atk * 1.6) * sc(l))} DMG.`,
    run: (c, l) => { c.buff('counter', 1, (45 + c.stats.atk * 1.6) * sc(l)); },
  },
  // ───────── SUPPORT ─────────
  {
    id: 'holyBlessing', name: 'Holy Blessing', cat: 'support', rarity: 'rare', cost: 3,
    text: (l) => `Heal ${22 + 4 * (l - 1)}% max HP and remove all debuffs.`,
    run: (c, l) => { c.heal(c.stats.maxHp * (0.22 + 0.04 * (l - 1))); c.cleanse(); },
  },
  {
    id: 'manaRecovery', name: 'Mana Recovery', cat: 'support', rarity: 'common', cost: 1,
    text: (l) => `Recover ${n(30 * sc(l))} MP and draw ${l >= 3 ? 2 : 1} card${l >= 3 ? 's' : ''}.`,
    run: (c, l) => { c.mp(30 * sc(l)); c.draw(l >= 3 ? 2 : 1); },
  },
  {
    id: 'battleCry', name: 'Battle Cry', cat: 'support', rarity: 'common', cost: 1,
    text: (l) => `+${35 + 5 * (l - 1)}% damage for 3 turns.`,
    run: (c, l) => { c.buff('atkUp', 3, 0.35 + 0.05 * (l - 1)); },
  },
  {
    id: 'criticalBoost', name: 'Critical Boost', cat: 'support', rarity: 'rare', cost: 1,
    text: (l) => `+${30 + 5 * (l - 1)}% critical chance for 3 turns.`,
    run: (c, l) => { c.buff('critUp', 3, 30 + 5 * (l - 1)); },
  },
  {
    id: 'comboAmplifier', name: 'Combo Amplifier', cat: 'support', rarity: 'epic', cost: 2,
    text: (l) => `Combo multiplier grows +${n((0.15 + 0.05 * (l - 1)) * 100)}% faster for 2 turns.`,
    run: (c, l) => { c.buff('comboUp', 2, 0.15 + 0.05 * (l - 1)); },
  },
  // ───────── MAGIC ─────────
  {
    id: 'soulDrain', name: 'Soul Drain', cat: 'magic', rarity: 'rare', cost: 2,
    text: (l, s) => `Deal ${n((35 + s.mag * 1.4) * sc(l))} dark DMG and heal for the damage dealt.`,
    run: (c, l) => { const d = c.hit('dark', (35 + c.stats.mag * 1.4) * sc(l)); c.heal(d); },
  },
  {
    id: 'shadowCurse', name: 'Shadow Curse', cat: 'magic', rarity: 'common', cost: 2,
    text: (l, s) => `Deal ${n((10 + s.mag * 0.5) * sc(l))} dark DMG. Enemy takes +${25 + 5 * (l - 1)}% damage for 3 turns.`,
    run: (c, l) => { c.hit('dark', (10 + c.stats.mag * 0.5) * sc(l)); c.debuff('curse', 3, 0.25 + 0.05 * (l - 1)); },
  },
  {
    id: 'meteorStorm', name: 'Meteor Storm', cat: 'magic', rarity: 'epic', cost: 4,
    text: (l, s) => `Three meteors, each ${n((30 + s.mag * 0.9 + s.atk * 0.4) * sc(l))} fire DMG.`,
    run: (c, l) => { for (let i = 0; i < 3; i++) c.hit('fire', (30 + c.stats.mag * 0.9 + c.stats.atk * 0.4) * sc(l), { label: '☄' }); },
  },
  {
    id: 'demonSummoning', name: 'Demon Summoning', cat: 'magic', rarity: 'legendary', cost: 3,
    text: (l, s) => `Summon a demon for 3 turns. It strikes now and each turn for ${n((35 + s.mag * 1.1) * sc(l))} dark DMG.`,
    run: (c, l) => {
      const v = (35 + c.stats.mag * 1.1) * sc(l);
      c.buff('demon', 3, v);
      c.hit('dark', v, { label: '👹' });
    },
  },
  // ───────── PASSIVE (power cards: play once, active for the rest of the battle) ─────────
  {
    id: 'berserkerSoul', name: 'Berserker Soul', cat: 'passive', rarity: 'rare', cost: 1,
    text: (l) => `Rest of battle: deal up to +${n(60 * sc(l))}% damage as your HP falls.`,
    run: (c) => { c.passive('berserkerSoul'); },
  },
  {
    id: 'eternalRage', name: 'Eternal Rage', cat: 'passive', rarity: 'epic', cost: 2,
    text: (l) => `Rest of battle: each 3+ combo grants a Rage stack (+${5 + (l - 1) * 2}% damage, max 10).`,
    run: (c) => { c.passive('eternalRage'); },
  },
  {
    id: 'metalResonance', name: 'Metal Resonance', cat: 'passive', rarity: 'rare', cost: 1,
    text: (l) => `Rest of battle: matching 4+ tiles grants +${l >= 3 ? 2 : 1} energy (max 2/turn) and +10 MP.`,
    run: (c) => { c.passive('metalResonance'); },
  },
  {
    id: 'darkFortune', name: 'Dark Fortune', cat: 'passive', rarity: 'epic', cost: 1,
    text: (l) => `Rest of battle: +${15 + 5 * (l - 1)}% crit chance and +30% crit damage.`,
    run: (c) => { c.passive('darkFortune'); },
  },
  {
    id: 'bloodPact', name: 'Blood Pact', cat: 'passive', rarity: 'legendary', cost: 1,
    text: (l) => `Lose 8% max HP. Rest of battle: +${35 + 5 * (l - 1)}% damage and 8% lifesteal.`,
    run: (c) => { c.loseHp(c.stats.maxHp * 0.08); c.passive('bloodPact'); },
  },
];

export const CARDS: Record<string, CardDef> = Object.fromEntries(CARD_LIST.map((c) => [c.id, c]));

export const CAT_COLOR: Record<CardCat, string> = {
  attack: '#ff4a3a', defense: '#3fb86a', support: '#e9b23d', magic: '#a456ff', passive: '#3cc0e8',
};
export const CAT_LABEL: Record<CardCat, string> = {
  attack: 'Attack', defense: 'Defense', support: 'Support', magic: 'Magic', passive: 'Passive',
};

export const MAX_CARD_LEVEL = 3;
export const MAX_DECK = 20;
export const MIN_DECK = 8;
export const MAX_COPIES = 3;

const RARITY_WEIGHT: Record<Rarity, number> = { common: 55, rare: 28, epic: 12, legendary: 4, mythic: 1 };
const BOSS_WEIGHT: Record<Rarity, number> = { common: 0, rare: 30, epic: 40, legendary: 22, mythic: 8 };

export function rollRewardCards(count: number, boss: boolean, exclude: string[] = []): string[] {
  const w = boss ? BOSS_WEIGHT : RARITY_WEIGHT;
  const pool = CARD_LIST.filter((c) => !exclude.includes(c.id));
  const out: string[] = [];
  while (out.length < count && pool.length) {
    const total = pool.reduce((s, c) => s + w[c.rarity], 0);
    let r = Math.random() * total;
    let pick = pool[0];
    for (const c of pool) { r -= w[c.rarity]; if (r <= 0) { pick = c; break; } }
    out.push(pick.id);
    pool.splice(pool.indexOf(pick), 1);
  }
  return out;
}

export function upgradeCost(cardId: string, level: number): number {
  const mult = { common: 1, rare: 1.6, epic: 2.4, legendary: 3.5, mythic: 5 }[CARDS[cardId].rarity];
  return Math.round(80 * level * mult);
}
