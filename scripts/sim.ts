// Headless balance simulation: auto-bot plays the whole campaign.
import { Battle } from '../src/engine/battle';
import { CHARS, computeStats, expToNext, emptyEquip, type CharSave } from '../src/data/characters';
import { generateEquip, type Equip } from '../src/data/equipment';
import { REGIONS, nodeLevel } from '../src/data/world';
import { rollRewardCards, CARDS } from '../src/data/cards';
import { SLOTS } from '../src/engine/types';
import { battleCtxFor } from '../src/game/store';

const charId = process.argv[2] ?? 'warrior';
const cs: CharSave = { unlocked: true, level: 1, exp: 0, equip: emptyEquip() };
const inv: Equip[] = [];
const deck = [...CHARS[charId].startDeck];
const lv: Record<string, number> = {};
let failures = 0;
const score = (e: Equip) => e.atk * 2 + e.def + e.hp / 8 + e.crit * 2 + e.mag;
function equipBest() {
  for (const s of SLOTS) {
    const best = inv.filter((e) => e.slot === s).sort((a, b) => score(b) - score(a))[0];
    if (best) cs.equip[s] = best.uid;
  }
}
for (let r = 0; r < REGIONS.length; r++) {
  for (let n = 0; n < REGIONS[r].nodes.length; n++) {
    const kind = REGIONS[r].nodes[n];
    if (kind === 'event' || kind === 'treasure') {
      if (kind === 'treasure') { inv.push(generateEquip(nodeLevel(REGIONS[r], n, kind), 'rare')); equipBest(); }
      continue;
    }
    const ctx = battleCtxFor(r, n);
    let won = false; let tries = 0; let turns = 0; let hp = 0; let enemyHp = 0;
    while (!won && tries < 6) {
      tries++;
      const stats = computeStats(CHARS[charId], cs, inv);
      const b = new Battle({ charId, stats, deck: deck.map((id) => ({ id, level: lv[id] ?? 1 })), enemyId: ctx.enemyId, enemyLevel: ctx.level, elite: ctx.elite, party: [], objTurns: ctx.objTurns });
      let guard = 0;
      while (b.s.phase === 'player' && guard++ < 400) b.autoAct();
      won = b.s.phase === 'won'; turns = b.s.turn; hp = Math.round((b.s.player.hp / b.s.player.maxHp) * 100); enemyHp = b.s.enemy.hp;
      if (!won) failures++;
      if (guard >= 400) { console.log('STUCK', r, n, b.s.phase); break; }
    }
    // rewards
    const boss = kind === 'boss', elite = kind === 'elite';
    cs.exp += Math.round((22 + ctx.level * 13) * (boss ? 3.2 : elite ? 1.6 : 1));
    while (cs.exp >= expToNext(cs.level) && cs.level < 40) { cs.exp -= expToNext(cs.level); cs.level++; }
    if (boss) inv.push(generateEquip(ctx.level, 'epic')); else if (elite) inv.push(generateEquip(ctx.level, 'rare')); else if (Math.random() < 0.28) inv.push(generateEquip(ctx.level));
    equipBest();
    const pick = rollRewardCards(3, boss).map((id) => CARDS[id]).sort((a, b) => b.cost - a.cost)[0];
    if (deck.length < 20) deck.push(pick.id);
    const st = computeStats(CHARS[charId], cs, inv);
    console.log(`R${r + 1}-${n + 1} ${kind.padEnd(6)} L${ctx.level} ${ctx.enemyId.padEnd(12)} ${won ? 'WIN ' : 'LOSE'} tries=${tries} turns=${turns} hp=${hp}% | lv${cs.level} atk${st.atk} hp${st.maxHp} def${st.def}`);
  }
}
console.log('failures', failures);
