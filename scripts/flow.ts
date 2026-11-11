// Headless test of the progression loop through the real store: plays every node of every region.
const mem: Record<string, string> = {};
(globalThis as any).localStorage = { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => { mem[k] = v; }, clear: () => {} };
(globalThis as any).window = { setTimeout, clearTimeout };
const S = await import('../src/game/store');
const { REGIONS } = await import('../src/data/world');
const { CHARS } = await import('../src/data/characters');

S.newGame();
let guard = 0;
for (let r = 0; r < REGIONS.length; r++) {
  for (let n = 0; n < REGIONS[r].nodes.length; n++) {
    if (guard++ > 100) throw new Error('loop');
    const kind = REGIONS[r].nodes[n];
    S.startNode(r, n);
    const ui = S.getState().ui;
    if (kind === 'event') { if (ui.screen !== 'event') throw new Error('expected event ' + r + n); S.resolveEvent(ui.event!.ev.choices[ui.event!.ev.choices.length - 1].id); S.leaveEvent(); }
    else if (kind === 'treasure') { if (ui.screen !== 'treasure') throw new Error('expected treasure'); S.claimTreasure(); }
    else {
      if (ui.screen !== 'battle') throw new Error(`expected battle at ${r}-${n}, got ${ui.screen} (progress ${S.getState().save.progress})`);
      S.finishBattle({ win: true, turns: 4, hpPct: 0.8 });
      const rw = S.getState().ui.reward!;
      if (rw.cards.length !== 3) throw new Error('3 reward cards expected');
      S.rewardPickCard(rw.cards[0]);
      S.leaveReward();
    }
  }
}
const sv = S.getState().save;
console.log('progress', sv.progress.join(','), '| gold', sv.gold, '| deck', sv.deck.length, '| gear', sv.inventory.length);
console.log('unlocked:', Object.entries(sv.chars).filter(([, c]) => c.unlocked).map(([id, c]) => `${CHARS[id].name} Lv${c.level}`).join(', '));
console.log('collection kinds', Object.keys(sv.collection).length, '| 3-star nodes', Object.values(sv.stars).filter((s) => s === 3).length);
// defeat path + deck editing + upgrades
S.startNode(0, 0); S.finishBattle({ win: false, turns: 3, hpPct: 0 });
console.log('defeat screen:', S.getState().ui.screen, S.getState().ui.reward!.win);
S.leaveReward();
console.log('removeFromDeck at min:', S.removeFromDeck(0), '| addToDeck full:', S.addToDeck('thunderStrike'));
console.log('upgrade card:', S.upgradeCardLevel('thunderStrike'), S.getState().save.cardLevels);
console.log('saved key present:', Object.keys(mem).length > 0);
