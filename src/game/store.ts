import { useSyncExternalStore } from 'react';
import { CARDS, MAX_COPIES, MAX_DECK, MIN_DECK, MAX_CARD_LEVEL, rollRewardCards, upgradeCost } from '../data/cards';
import { CHARS, CHAR_LIST, MAX_LEVEL, SLOT_UNLOCK, computeStats, emptyEquip, expToNext, type CharSave } from '../data/characters';
import { MAX_GEAR_LEVEL, generateEquip, sellValue, upgradeGearCost, type Equip } from '../data/equipment';
import { BOSSES, ENEMIES } from '../data/enemies';
import { EVENTS, REGIONS, nodeLevel, type GameEvent, type NodeKind } from '../data/world';
import type { PlayerStats, Slot } from '../engine/types';
import type { PartyAssist } from '../engine/battle';

export type Screen = 'menu' | 'character' | 'collection' | 'deck' | 'equipment' | 'map' | 'settings' | 'battle' | 'reward' | 'event' | 'treasure' | 'ending';

export interface Settings { music: boolean; sfx: boolean; musicVol: number; sfxVol: number; speed: number }
export interface Save {
  v: 1; started: boolean; gold: number; activeChar: string;
  chars: Record<string, CharSave>; inventory: Equip[];
  collection: Record<string, number>; cardLevels: Record<string, number>; deck: string[];
  progress: number[]; visited: Record<string, boolean>; stars: Record<string, number>;
  settings: Settings; stats: { battles: number; wins: number; runs: number };
}

export interface BattleCtx { region: number; node: number; kind: NodeKind; enemyId: string; level: number; elite: boolean; objTurns: number }
export interface RewardCtx {
  win: boolean; gold: number; exp: number; levelUps: { name: string; level: number }[]; drops: Equip[];
  cards: string[]; boss: boolean; stars: number; unlocked: string | null; picked: boolean; message: string | null;
  mode: 'cards' | 'upgrade' | 'remove'; goldAlt: number; region: number; final?: boolean;
}
export interface EventCtx { region: number; node: number; ev: GameEvent; result: string | null }
export interface TreasureCtx { region: number; node: number; gold: number; items: Equip[]; card: string | null }
export interface UI {
  screen: Screen; battle?: BattleCtx; reward?: RewardCtx; event?: EventCtx; treasure?: TreasureCtx; toast?: string; auto: boolean; seq: number;
}
export interface State { save: Save; ui: UI }

const KEY = 'heavy-metal-dark-legends/save-v1';

function freshSave(): Save {
  const chars: Record<string, CharSave> = {};
  CHAR_LIST.forEach((c) => { chars[c.id] = { unlocked: c.id === 'warrior', level: 1, exp: 0, equip: emptyEquip() }; });
  const starter = [generateEquip(1, 'common', 'weapon'), generateEquip(1, 'common', 'armor')];
  starter.forEach((e) => { e.rarity = 'common'; e.elem = undefined; e.elemPct = undefined; e.passive = undefined; });
  chars.warrior.equip.weapon = starter[0].uid;
  chars.warrior.equip.armor = starter[1].uid;
  const deck = [...CHARS.warrior.startDeck];
  const collection: Record<string, number> = {};
  deck.forEach((id) => { collection[id] = (collection[id] ?? 0) + 1; });
  return {
    v: 1, started: false, gold: 100, activeChar: 'warrior', chars, inventory: starter,
    collection, cardLevels: {}, deck, progress: REGIONS.map(() => 0), visited: {}, stars: {},
    settings: { music: true, sfx: true, musicVol: 0.5, sfxVol: 0.7, speed: 1 },
    stats: { battles: 0, wins: 0, runs: 1 },
  };
}

function load(): Save | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Save;
    if (s.v !== 1) return null;
    return s;
  } catch { return null; }
}

let existing = load();
let state: State = { save: existing ?? freshSave(), ui: { screen: 'menu', auto: false, seq: 0 } };
const listeners = new Set<() => void>();
let saveTimer: number | undefined;

function persist() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state.save)); } catch { /* storage unavailable */ }
  }, 150);
}
function set(fn: (d: State) => void) {
  const next = structuredClone(state);
  fn(next);
  state = next;
  persist();
  listeners.forEach((l) => l());
}
export function useGame(): State {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => state);
}
export const getState = () => state;
export const hasSave = () => !!existing && existing.started;

// ───────────── derived helpers ─────────────
export function statsFor(s: Save, id: string): PlayerStats {
  return computeStats(CHARS[id], s.chars[id], s.inventory);
}
export function deckInstances(s: Save) {
  return s.deck.map((id) => ({ id, level: s.cardLevels[id] ?? 1 }));
}
export function partyAssists(s: Save): PartyAssist[] {
  return CHAR_LIST.filter((c) => c.id !== s.activeChar && s.chars[c.id].unlocked).slice(0, 3).map((c) => {
    const st = statsFor(s, c.id);
    return { name: c.name, atk: st.atk, mag: st.mag };
  });
}
export const regionUnlocked = (s: Save, r: number) => r === 0 || s.progress[r - 1] >= REGIONS[r - 1].nodes.length;
export const equippedItems = (s: Save, id: string) => Object.fromEntries(
  Object.entries(s.chars[id].equip).map(([slot, uid]) => [slot, s.inventory.find((e) => e.uid === uid) ?? null])) as Record<Slot, Equip | null>;

// ───────────── navigation ─────────────
export function go(screen: Screen) { set((d) => { d.ui.screen = screen; d.ui.auto = false; }); }
export function toast(msg: string) {
  set((d) => { d.ui.toast = msg; });
  window.setTimeout(() => { if (state.ui.toast === msg) set((d) => { d.ui.toast = undefined; }); }, 2600);
}
export function newGame() {
  const runs = (existing?.stats.runs ?? 0) + 1;
  const fs = freshSave();
  fs.started = true; fs.stats.runs = runs;
  set((d) => { d.save = fs; d.ui = { screen: 'map', auto: false, seq: d.ui.seq + 1 }; });
  existing = state.save;
}
export function continueGame() { set((d) => { d.ui.screen = 'map'; }); }
export function updateSettings(p: Partial<Settings>) { set((d) => { Object.assign(d.save.settings, p); }); }

// ───────────── characters ─────────────
export function selectChar(id: string) {
  set((d) => { if (d.save.chars[id].unlocked) d.save.activeChar = id; });
}
function addExp(save: Save, id: string, amount: number): number[] {
  const c = save.chars[id]; const ups: number[] = [];
  if (!c.unlocked || c.level >= MAX_LEVEL) return ups;
  c.exp += amount;
  while (c.level < MAX_LEVEL && c.exp >= expToNext(c.level)) { c.exp -= expToNext(c.level); c.level++; ups.push(c.level); }
  return ups;
}
function unlockChar(save: Save, id: string): string[] {
  const c = save.chars[id];
  if (c.unlocked) return [];
  c.unlocked = true;
  c.level = Math.max(1, save.chars[save.activeChar].level - 2);
  const sig = [...new Set(CHARS[id].startDeck.slice(8))];
  sig.forEach((cid) => { save.collection[cid] = (save.collection[cid] ?? 0) + 1; });
  return sig;
}

// ───────────── deck ─────────────
export const ownedCount = (s: Save, id: string) => s.collection[id] ?? 0;
export const inDeckCount = (s: Save, id: string) => s.deck.filter((x) => x === id).length;
export function addToDeck(id: string): string | null {
  const s = state.save;
  if (s.deck.length >= MAX_DECK) return `Deck is full (${MAX_DECK} cards max).`;
  if (inDeckCount(s, id) >= ownedCount(s, id)) return 'No unused copies of that card.';
  if (inDeckCount(s, id) >= MAX_COPIES) return `Max ${MAX_COPIES} copies per card.`;
  set((d) => { d.save.deck.push(id); });
  return null;
}
export function removeFromDeck(index: number): string | null {
  if (state.save.deck.length <= MIN_DECK) return `Deck needs at least ${MIN_DECK} cards.`;
  set((d) => { d.save.deck.splice(index, 1); });
  return null;
}
export function upgradeCardLevel(id: string): string | null {
  const s = state.save; const lv = s.cardLevels[id] ?? 1;
  if (lv >= MAX_CARD_LEVEL) return 'Already max level.';
  const cost = upgradeCost(id, lv);
  if (s.gold < cost) return `Need ${cost} gold.`;
  set((d) => { d.save.gold -= cost; d.save.cardLevels[id] = lv + 1; });
  return null;
}

// ───────────── equipment ─────────────
/** How good an item is for a given hero (role-weighted stats, upgrade level, elemental bonus, passive). */
const GEAR_W: Record<string, { atk: number; mag: number; def: number; hp: number; crit: number }> = {
  warrior: { atk: 1.6, mag: 0.4, def: 1, hp: 0.12, crit: 2 },
  deathKnight: { atk: 1.4, mag: 0.3, def: 1.6, hp: 0.15, crit: 1.5 },
  darkPriest: { atk: 0.4, mag: 2, def: 1, hp: 0.12, crit: 1.5 },
  guitarist: { atk: 1.5, mag: 1.2, def: 0.8, hp: 0.1, crit: 2.5 },
  berserker: { atk: 2, mag: 0.2, def: 0.4, hp: 0.1, crit: 3 },
};
export function gearScore(e: Equip, charId: string): number {
  const w = GEAR_W[charId] ?? GEAR_W.warrior; const m = 1 + e.level * 0.12;
  return (e.atk * w.atk + e.mag * w.mag + e.def * w.def + e.hp * w.hp + e.crit * w.crit + (e.elemPct ?? 0) * 0.6 + (e.passive ? 8 : 0)) * m;
}
/** Equip the best available item in every unlocked slot. Items worn by other heroes are left alone. */
export function autoEquip(charId: string): string {
  const s = state.save; const cs = s.chars[charId];
  const takenByOthers = new Set<string>();
  CHAR_LIST.forEach((c) => { if (c.id !== charId) Object.values(s.chars[c.id].equip).forEach((u) => { if (u) takenByOthers.add(u); }); });
  const next: Record<string, string | null> = {};
  let changed = 0;
  (Object.keys(cs.equip) as Slot[]).forEach((slot) => {
    if (cs.level < SLOT_UNLOCK[slot]) return;
    const pool = s.inventory.filter((e) => e.slot === slot && !takenByOthers.has(e.uid));
    const best = pool.sort((a, b) => gearScore(b, charId) - gearScore(a, charId))[0];
    if (best && best.uid !== cs.equip[slot]) {
      const cur = s.inventory.find((e) => e.uid === cs.equip[slot]);
      if (!cur || gearScore(best, charId) > gearScore(cur, charId)) { next[slot] = best.uid; changed++; }
    }
  });
  if (!changed) return 'You are already wearing the best available gear.';
  set((d) => { Object.entries(next).forEach(([slot, uid]) => { d.save.chars[charId].equip[slot as Slot] = uid; }); });
  return `Equipped ${changed} better item${changed > 1 ? 's' : ''}.`;
}

export function equipItem(charId: string, uid: string): string | null {
  const s = state.save; const it = s.inventory.find((e) => e.uid === uid);
  if (!it) return 'Item not found.';
  if (s.chars[charId].level < SLOT_UNLOCK[it.slot]) return `${it.slot} slot unlocks at level ${SLOT_UNLOCK[it.slot]}.`;
  set((d) => {
    CHAR_LIST.forEach((c) => { const ce = d.save.chars[c.id].equip; (Object.keys(ce) as Slot[]).forEach((k) => { if (ce[k] === uid) ce[k] = null; }); });
    d.save.chars[charId].equip[it.slot] = uid;
  });
  return null;
}
export function unequipSlot(charId: string, slot: Slot) { set((d) => { d.save.chars[charId].equip[slot] = null; }); }
export function upgradeGear(uid: string): string | null {
  const it = state.save.inventory.find((e) => e.uid === uid);
  if (!it) return 'Item not found.';
  if (it.level >= MAX_GEAR_LEVEL) return 'Already max level.';
  const cost = upgradeGearCost(it);
  if (state.save.gold < cost) return `Need ${cost} gold.`;
  set((d) => { d.save.gold -= cost; d.save.inventory.find((e) => e.uid === uid)!.level++; });
  return null;
}
export function sellGear(uid: string) {
  const it = state.save.inventory.find((e) => e.uid === uid);
  if (!it) return;
  set((d) => {
    d.save.gold += sellValue(it);
    d.save.inventory = d.save.inventory.filter((e) => e.uid !== uid);
    CHAR_LIST.forEach((c) => { const ce = d.save.chars[c.id].equip; (Object.keys(ce) as Slot[]).forEach((k) => { if (ce[k] === uid) ce[k] = null; }); });
  });
}

// ───────────── battle flow ─────────────
export function battleCtxFor(region: number, node: number): BattleCtx {
  const r = REGIONS[region]; const kind = r.nodes[node];
  const level = nodeLevel(r, node, kind);
  let enemyId: string;
  if (kind === 'boss') enemyId = r.boss;
  else {
    const idx = (node + (kind === 'elite' ? 1 : 0)) % r.roster.length;
    enemyId = r.roster[idx];
  }
  return { region, node, kind, enemyId, level, elite: kind === 'elite', objTurns: kind === 'boss' ? 10 : kind === 'elite' ? 8 : 6 };
}
export function startNode(region: number, node: number) {
  const s = state.save; const r = REGIONS[region]; const kind = r.nodes[node];
  if (!regionUnlocked(s, region) || node > s.progress[region]) return;
  if ((kind === 'event' || kind === 'treasure') && s.visited[`${region}-${node}`]) return;
  if (kind === 'event') {
    const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    set((d) => { d.ui.screen = 'event'; d.ui.event = { region, node, ev, result: null }; });
    return;
  }
  if (kind === 'treasure') {
    const lvl = nodeLevel(r, node, kind);
    const items = [generateEquip(lvl, 'rare')];
    if (Math.random() < 0.5) items.push(generateEquip(lvl));
    const card = Math.random() < 0.5 ? rollRewardCards(1, false)[0] : null;
    set((d) => { d.ui.screen = 'treasure'; d.ui.treasure = { region, node, gold: 60 + lvl * 9, items, card }; });
    return;
  }
  set((d) => { d.ui.battle = battleCtxFor(region, node); d.ui.screen = 'battle'; d.ui.auto = false; d.ui.seq++; });
}
export function markVisited(region: number, node: number) {
  set((d) => {
    d.save.visited[`${region}-${node}`] = true;
    if (d.save.progress[region] === node) d.save.progress[region] = node + 1;
  });
}
export function claimTreasure() {
  const t = state.ui.treasure!;
  set((d) => {
    d.save.gold += t.gold;
    t.items.forEach((i) => d.save.inventory.push(i));
    if (t.card) { d.save.collection[t.card] = (d.save.collection[t.card] ?? 0) + 1; if (d.save.deck.length < MAX_DECK) d.save.deck.push(t.card); }
    d.save.visited[`${t.region}-${t.node}`] = true;
    if (d.save.progress[t.region] === t.node) d.save.progress[t.region] = t.node + 1;
    d.ui.screen = 'map'; d.ui.treasure = undefined;
  });
}

export function resolveEvent(choice: string) {
  const s = state.save; const ev = state.ui.event!;
  let msg = '';
  set((d) => {
    const sv = d.save;
    const grant = (id: string) => { sv.collection[id] = (sv.collection[id] ?? 0) + 1; if (sv.deck.length < MAX_DECK) sv.deck.push(id); return CARDS[id].name; };
    switch (choice) {
      case 'altar-gold':
        if (sv.gold < 100) { msg = 'You cannot afford the offering.'; break; }
        sv.gold -= 100; msg = `The altar grants you: ${grant(rollRewardCards(1, true)[0])}.`; break;
      case 'altar-blood': {
        const loss = sv.deck.length > MIN_DECK ? sv.deck.splice(Math.floor(Math.random() * sv.deck.length), 1)[0] : null;
        msg = `The altar grants you: ${grant(rollRewardCards(1, false)[0])}.${loss ? ` It takes ${CARDS[loss].name}.` : ''}`; break;
      }
      case 'smith-up': {
        const w = sv.inventory.find((e) => e.uid === sv.chars[sv.activeChar].equip.weapon);
        if (w && w.level < MAX_GEAR_LEVEL) { w.level++; msg = `${w.name} is reforged to +${w.level}.`; } else msg = 'The smith finds nothing to improve.';
        break;
      }
      case 'smith-card': {
        const cand = [...new Set(sv.deck)].filter((id) => (sv.cardLevels[id] ?? 1) < MAX_CARD_LEVEL);
        if (cand.length) { const id = cand[Math.floor(Math.random() * cand.length)]; sv.cardLevels[id] = (sv.cardLevels[id] ?? 1) + 1; msg = `${CARDS[id].name} is sharpened to level ${sv.cardLevels[id]}.`; }
        else msg = 'All your cards are already perfected.';
        break;
      }
      case 'chest-open':
        if (Math.random() < 0.5) { const it = generateEquip(REGIONS[ev.region].baseLevel + 2, 'epic'); sv.inventory.push(it); msg = `Treasure! You find ${it.name} (${it.rarity}).`; }
        else { sv.gold = Math.max(0, sv.gold - 60); msg = 'A curse! You lose 60 gold.'; }
        break;
      case 'chest-pray': sv.gold += 80; msg = 'The chest sighs. 80 gold spills out.'; break;
      case 'bard-exp': {
        const ups = addExp(sv, sv.activeChar, 60 + REGIONS[ev.region].baseLevel * 25);
        msg = `The ballad fills you with power.${ups.length ? ` Level up! Lv ${ups[ups.length - 1]}.` : ' EXP gained.'}`; break;
      }
      case 'bard-gold': sv.gold += 120; msg = 'The ghost tips his hat. 120 gold.'; break;
      default: msg = 'You walk away.';
    }
    if (!(choice === 'altar-gold' && msg.startsWith('You cannot'))) {
      sv.visited[`${ev.region}-${ev.node}`] = true;
      if (sv.progress[ev.region] === ev.node) sv.progress[ev.region] = ev.node + 1;
      d.ui.event!.result = msg;
    } else d.ui.event!.result = msg + ' Choose again.';
  });
  void s;
}
export function leaveEvent() { set((d) => { d.ui.screen = 'map'; d.ui.event = undefined; }); }

export interface BattleResult { win: boolean; turns: number; hpPct: number }

export function finishBattle(res: BattleResult) {
  const ctx = state.ui.battle!;
  const boss = ctx.kind === 'boss', elite = ctx.kind === 'elite';
  const mult = boss ? 3.2 : elite ? 1.6 : 1;
  let reward: RewardCtx = {
    win: res.win, gold: 0, exp: 0, levelUps: [], drops: [], cards: [], boss, stars: 0, unlocked: null,
    picked: false, message: null, mode: 'cards', goldAlt: 0, region: ctx.region,
  };
  set((d) => {
    const sv = d.save;
    sv.stats.battles++;
    if (!res.win) { reward.message = 'You were defeated. Your progress is safe — gear up and try again.'; d.ui.reward = reward; d.ui.screen = 'reward'; return; }
    sv.stats.wins++;
    const gold = Math.round((25 + ctx.level * 7) * mult);
    const exp = Math.round((22 + ctx.level * 13) * mult);
    sv.gold += gold;
    reward.gold = gold; reward.exp = exp; reward.goldAlt = Math.round(50 + ctx.level * 8 * mult);
    const ups = addExp(sv, sv.activeChar, exp);
    ups.forEach((l) => reward.levelUps.push({ name: CHARS[sv.activeChar].name, level: l }));
    CHAR_LIST.forEach((c) => {
      if (c.id === sv.activeChar || !sv.chars[c.id].unlocked) return;
      addExp(sv, c.id, Math.round(exp * 0.5));
    });
    // equipment drops
    const drops: Equip[] = [];
    if (boss) { drops.push(generateEquip(ctx.level, 'epic')); if (Math.random() < 0.4) drops.push(generateEquip(ctx.level, 'rare')); }
    else if (elite) drops.push(generateEquip(ctx.level, 'rare'));
    else if (Math.random() < 0.28) drops.push(generateEquip(ctx.level));
    drops.forEach((i) => sv.inventory.push(i));
    reward.drops = drops;
    // stars
    const objTurns = ctx.objTurns;
    reward.stars = 1 + (res.turns <= objTurns ? 1 : 0) + (res.hpPct > 0.5 ? 1 : 0);
    const k = `${ctx.region}-${ctx.node}`;
    sv.stars[k] = Math.max(sv.stars[k] ?? 0, reward.stars);
    if (sv.progress[ctx.region] === ctx.node) sv.progress[ctx.region] = ctx.node + 1;
    if (boss) {
      const uc = REGIONS[ctx.region].unlocksChar;
      if (uc && !sv.chars[uc].unlocked) { unlockChar(sv, uc); reward.unlocked = uc; }
    }
    if (boss && ctx.region === REGIONS.length - 1) reward.final = true;
    reward.cards = rollRewardCards(3, boss);
    d.ui.reward = reward; d.ui.screen = 'reward';
  });
  void ENEMIES; void BOSSES; void MAX_COPIES;
}

export function rewardPickCard(id: string) {
  set((d) => {
    const sv = d.save; const r = d.ui.reward!;
    sv.collection[id] = (sv.collection[id] ?? 0) + 1;
    const inDeck = sv.deck.length < MAX_DECK;
    if (inDeck) sv.deck.push(id);
    r.picked = true; r.message = `${CARDS[id].name} added to your collection${inDeck ? ' and deck' : ' (deck is full — edit it in the Deck Builder)'}.`;
  });
}
export function rewardTakeGold() {
  set((d) => { const r = d.ui.reward!; d.save.gold += r.goldAlt; r.picked = true; r.message = `You take ${r.goldAlt} gold instead.`; });
}
export function rewardMode(mode: RewardCtx['mode']) { set((d) => { d.ui.reward!.mode = mode; }); }
export function rewardUpgrade(id: string) {
  set((d) => {
    const sv = d.save; const r = d.ui.reward!;
    const lv = sv.cardLevels[id] ?? 1;
    if (lv >= MAX_CARD_LEVEL) return;
    sv.cardLevels[id] = lv + 1; r.picked = true; r.message = `${CARDS[id].name} upgraded to level ${lv + 1}.`;
  });
}
export function rewardRemove(index: number) {
  set((d) => {
    const sv = d.save; const r = d.ui.reward!;
    if (sv.deck.length <= MIN_DECK) { r.message = `Deck needs at least ${MIN_DECK} cards.`; return; }
    const id = sv.deck.splice(index, 1)[0];
    sv.collection[id] = Math.max(0, (sv.collection[id] ?? 1) - 1);
    r.picked = true; r.message = `${CARDS[id].name} removed from your deck.`;
  });
}
export function leaveReward() { set((d) => { d.ui.screen = d.ui.reward?.final ? 'ending' : 'map'; d.ui.reward = undefined; d.ui.battle = undefined; }); }
export function retryBattle() { set((d) => { d.ui.screen = 'battle'; d.ui.reward = undefined; d.ui.auto = false; d.ui.seq++; }); }
export function nextBattle() {
  const b = state.ui.battle!;
  const r = REGIONS[b.region];
  const next = b.node + 1;
  if (next < r.nodes.length && (r.nodes[next] === 'battle' || r.nodes[next] === 'elite' || r.nodes[next] === 'boss')) {
    set((d) => { d.ui.reward = undefined; d.ui.battle = battleCtxFor(b.region, next); d.ui.screen = 'battle'; d.ui.seq++; });
  } else leaveReward();
}
export function setAuto(v: boolean) { set((d) => { d.ui.auto = v; }); }
