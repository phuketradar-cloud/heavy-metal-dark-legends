import { CARDS, type CardCtx } from '../data/cards';
import { BOSSES, ENEMIES, MOVES, type EnemyDef, type Move } from '../data/enemies';
import { CHARS } from '../data/characters';
import type { Anim, CardInst, Elem, Fx, PlayerStats, Status, StatusId } from './types';
import {
  convertTiles, createBoard, findHint, isValidSwap, resolveStep, shuffleBoard, swapTiles, adjacent,
  type Board, type Pos,
} from './match3';

export interface PartyAssist { name: string; atk: number; mag: number }
export interface IntentInfo { moveId: string; name: string; icon: string; tele: string; dmg: number; hits: number; elem?: Elem; kind: Move['kind'] }
export interface EnemyState {
  id: string; name: string; level: number; boss: boolean; elite: boolean;
  maxHp: number; hp: number; shield: number; atk: number; def: number;
  statuses: Status[]; phase: number; phaseCount: number; phaseLabel: string; enraged: boolean; minions: number;
  moves: string[]; moveIdx: number; intent: IntentInfo | null;
}
export interface BattleState {
  board: Board; turn: number; moves: number; energy: number; maxEnergy: number;
  hand: CardInst[]; draw: CardInst[]; discard: CardInst[]; exhausted: CardInst[];
  player: {
    hp: number; maxHp: number; mp: number; maxMp: number; shield: number; statuses: Status[];
    passives: { id: string; lvl: number }[]; rage: number;
  };
  enemy: EnemyState;
  combo: number; comboMult: number;
  phase: 'player' | 'enemy' | 'won' | 'lost';
  objTurns: number; totalDamage: number; ultUsed: number;
}
export interface BEvent {
  snap: BattleState; ms: number; fx: Fx[];
  anim?: { player?: Anim; enemy?: Anim };
  shake?: number; sfx: string[]; banner?: string; flash?: string;
  burst?: { r: number; c: number; color: string; kind: 'pop' | 'fire' | 'bolt' | 'dark' | 'big' }[];
  bolt?: boolean;
}

export interface BattleOpts {
  charId: string; stats: PlayerStats; deck: { id: string; level: number }[];
  enemyId: string; enemyLevel: number; elite: boolean; party: PartyAssist[]; objTurns: number;
}

const TILE_ELEM: (Elem | null)[] = ['phys', 'fire', 'lightning', 'dark', null, 'phys'];
export const TILE_COLOR = ['#e8e0d0', '#ff5a3a', '#4aa8ff', '#b05cff', '#4ade80', '#f5c542'];
const HAND_SIZE = 5;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export function scaleEnemy(def: EnemyDef, level: number, elite: boolean) {
  const boss = !!def.boss;
  const hpMult = boss ? 4 : elite ? 2.4 : 1.5;
  return {
    hp: Math.round(def.hp * (1 + 0.14 * (level - 1)) * hpMult),
    atk: def.atk * 3.1 * (1 + 0.08 * (level - 1)) * (elite ? 1.15 : 1),
    def: def.def + level * 1.5,
  };
}

export class Battle {
  s: BattleState;
  stats: PlayerStats;
  def: EnemyDef;
  charId: string;
  party: PartyAssist[];
  baseAtk: number;
  private ev: BEvent[] = [];
  private fx: Fx[] = [];
  private anim: { player?: Anim; enemy?: Anim } = {};
  private shakeAmt = 0; private sfxs: string[] = []; private bannerTxt?: string; private flashC?: string;
  private bursts: NonNullable<BEvent['burst']> = [];
  private uid = 1;
  private resonanceThisTurn = 0;

  constructor(o: BattleOpts) {
    this.stats = o.stats; this.charId = o.charId; this.party = o.party;
    this.def = BOSSES[o.enemyId] ?? ENEMIES[o.enemyId];
    const sc = scaleEnemy(this.def, o.enemyLevel, o.elite);
    this.baseAtk = sc.atk;
    const phases = this.def.phases;
    const deck = o.deck.map((d) => ({ uid: this.uid++, id: d.id, level: d.level }));
    this.s = {
      board: createBoard(), turn: 1, moves: 2, energy: o.stats.energy, maxEnergy: o.stats.energy,
      hand: [], draw: this.shuffle(deck), discard: [], exhausted: [],
      player: {
        hp: o.stats.maxHp, maxHp: o.stats.maxHp, mp: Math.round(o.stats.maxMp * 0.3), maxMp: o.stats.maxMp,
        shield: o.stats.startShield, statuses: [], passives: [], rage: 0,
      },
      enemy: {
        id: this.def.id, name: o.elite ? `Elite ${this.def.name}` : this.def.name, level: o.enemyLevel, boss: !!this.def.boss, elite: o.elite,
        maxHp: sc.hp, hp: sc.hp, shield: 0, atk: sc.atk, def: sc.def, statuses: [], phase: 0,
        phaseCount: phases?.length ?? 1, phaseLabel: phases?.[0].label ?? '', enraged: false, minions: 0,
        moves: phases?.[0].moves ?? this.def.moves, moveIdx: 0, intent: null,
      },
      combo: 0, comboMult: 1, phase: 'player', objTurns: o.objTurns, totalDamage: 0, ultUsed: 0,
    };
    if (o.charId === 'berserker') this.s.player.passives.push({ id: 'berserkerSoul', lvl: 1 });
    this.drawCards(HAND_SIZE, true);
    this.planIntent();
  }

  // ───────────── helpers ─────────────
  private shuffle<T>(a: T[]): T[] {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  }
  private emit(ms = 300, extra: Partial<BEvent> = {}) {
    this.ev.push({
      snap: structuredClone(this.s), ms, fx: this.fx, anim: { ...this.anim }, shake: this.shakeAmt, sfx: this.sfxs,
      banner: this.bannerTxt, flash: this.flashC, burst: this.bursts, ...extra,
    });
    this.fx = []; this.anim = {}; this.shakeAmt = 0; this.sfxs = []; this.bannerTxt = undefined; this.flashC = undefined; this.bursts = [];
  }
  private flush(): BEvent[] { const e = this.ev; this.ev = []; return e; }
  private hasP(id: string) { return this.s.player.passives.find((p) => p.id === id); }
  private pStatus(id: StatusId) { return this.s.player.statuses.find((x) => x.id === id); }
  private eStatus(id: StatusId) { return this.s.enemy.statuses.find((x) => x.id === id); }
  private addStatus(list: Status[], id: StatusId, turns: number, value: number) {
    const ex = list.find((x) => x.id === id);
    if (ex) { ex.turns = Math.max(ex.turns, turns); ex.value = Math.max(ex.value, value); } else list.push({ id, turns, value });
  }
  private text(target: Fx['target'], text: string, color = '#fff', kind: Fx['kind'] = 'text') {
    this.fx.push({ kind, target, text, color });
  }
  private healPlayer(n: number) {
    const p = this.s.player;
    const h = Math.round(Math.min(n, p.maxHp - p.hp));
    if (h <= 0) return;
    p.hp += h;
    this.fx.push({ kind: 'heal', target: 'player', text: `+${h}`, color: '#6dff9a' });
    this.sfxs.push('heal');
  }
  private gainMp(n: number) {
    const p = this.s.player;
    const g = Math.round(Math.min(n, p.maxMp - p.mp));
    if (g > 0) { p.mp += g; this.fx.push({ kind: 'mp', target: 'player', text: `+${g} MP`, color: '#59b8ff' }); }
  }
  private addShield(n: number) {
    const p = this.s.player;
    const v = Math.round(Math.min(n, p.maxHp * 0.5 - p.shield));
    if (v > 0) { p.shield += v; this.fx.push({ kind: 'shield', target: 'player', text: `+${v}`, color: '#9ad0ff' }); this.sfxs.push('shield'); }
  }

  // ───────────── damage to enemy ─────────────
  private dmgMult(elem: Elem): number {
    const st = this.stats, p = this.s.player;
    let m = 1 + (st.elem[elem] ?? 0) / 100;
    const au = this.pStatus('atkUp'); if (au) m *= 1 + au.value;
    const wk = this.pStatus('weak'); if (wk) m *= 1 - wk.value;
    const bs = this.hasP('berserkerSoul');
    if (bs) m *= 1 + (1 - p.hp / p.maxHp) * 0.6 * (1 + 0.3 * (bs.lvl - 1));
    const er = this.hasP('eternalRage');
    if (er) m *= 1 + p.rage * (0.05 + (er.lvl - 1) * 0.02);
    const bp = this.hasP('bloodPact'); if (bp) m *= 1.35 + 0.05 * (bp.lvl - 1);
    return m;
  }
  private critChance(bonus = 0) {
    let c = this.stats.crit + bonus;
    const cu = this.pStatus('critUp'); if (cu) c += cu.value;
    const df = this.hasP('darkFortune'); if (df) c += 15 + 5 * (df.lvl - 1);
    return clamp(c, 0, 95);
  }
  private critMult() { return this.stats.critDmg + (this.hasP('darkFortune') ? 0.3 : 0); }

  /** Full pipeline: modifiers → resist → defense → crit → shield → HP. Returns damage dealt. */
  hitEnemy(elem: Elem, raw: number, o: { forceCrit?: boolean; critBonus?: number; label?: string; noCrit?: boolean; noMods?: boolean; quiet?: boolean } = {}) {
    const e = this.s.enemy;
    if (e.hp <= 0) return { dmg: 0, crit: false };
    let m = o.noMods ? 1 : this.dmgMult(elem);
    const cu = this.eStatus('curse'); if (cu) m *= 1 + cu.value;
    const res = this.def.res[elem] ?? 1;
    const mit = 100 / (100 + e.def);
    const crit = !o.noCrit && (o.forceCrit || Math.random() * 100 < this.critChance(o.critBonus));
    let dmg = Math.max(1, Math.round(raw * m * res * mit * (crit ? this.critMult() : 1)));
    let absorbed = 0;
    if (e.shield > 0) { absorbed = Math.min(e.shield, dmg); e.shield -= absorbed; }
    e.hp = Math.max(0, e.hp - (dmg - absorbed));
    this.s.totalDamage += dmg;
    const col = elem === 'fire' ? '#ff8a3a' : elem === 'lightning' ? '#7ac8ff' : elem === 'dark' ? '#d08aff' : '#ffe9d0';
    this.fx.push({ kind: crit ? 'crit' : 'dmg', target: 'enemy', text: `${o.label ? o.label + ' ' : ''}${dmg}${crit ? '!' : ''}`, color: col });
    if (!o.quiet) {
      if (res >= 1.25) this.fx.push({ kind: 'weak', target: 'enemy', text: 'WEAK', color: '#ffd24a' });
      else if (res <= 0.65) this.fx.push({ kind: 'resist', target: 'enemy', text: 'RESIST', color: '#9aa' });
    }
    const ls = this.stats.lifesteal + (this.hasP('bloodPact') ? 0.08 : 0);
    if (ls > 0) this.healPlayer(dmg * ls);
    this.anim.enemy = 'hit';
    this.sfxs.push(crit ? 'crit' : elem === 'lightning' ? 'lightning' : elem === 'fire' ? 'fire' : elem === 'dark' ? 'dark' : 'hit');
    return { dmg, crit };
  }

  private checkPhase() {
    const e = this.s.enemy;
    const phases = this.def.phases;
    if (!phases || e.hp <= 0) return;
    const pct = e.hp / e.maxHp;
    let idx = 0;
    phases.forEach((p, i) => { if (pct <= p.at) idx = i; });
    if (idx > e.phase) {
      e.phase = idx; e.moves = phases[idx].moves; e.moveIdx = 0; e.phaseLabel = phases[idx].label;
      if (phases[idx].enrage) {
        e.enraged = true;
        this.bannerTxt = `${e.name.toUpperCase()} ENRAGES!`;
        this.sfxs.push('roar');
      } else this.bannerTxt = phases[idx].label;
      this.shakeAmt = 14; this.flashC = '#ff2a2a'; this.sfxs.push('roar');
      this.anim.enemy = 'special';
      this.emit(900);
    }
  }

  // ───────────── card context ─────────────
  private ctx(lvl: number): CardCtx {
    const self = this;
    return {
      stats: this.stats, isBoss: this.s.enemy.boss,
      hit(elem, amount, opts) {
        const r = self.hitEnemy(elem, amount, opts);
        self.anim.player = 'cast';
        self.emit(420);
        self.checkPhase();
        return r.dmg;
      },
      heal: (n) => { self.healPlayer(n); self.emit(280); },
      shield: (n) => { self.addShield(n); self.emit(280); },
      mp: (n) => { self.gainMp(n * 1); self.emit(220); },
      energy: (n) => { self.s.energy += n; self.text('player', `+${n} ⚡`, '#ffd24a'); self.emit(220); },
      draw: (n) => { self.drawCards(n); self.emit(240); },
      loseHp: (n) => {
        const p = self.s.player; const l = Math.round(Math.min(n, p.hp - 1)); p.hp -= l;
        self.text('player', `-${l}`, '#ff4a4a', 'dmg'); self.anim.player = 'hit'; self.emit(300);
      },
      cleanse: () => { self.s.player.statuses = self.s.player.statuses.filter((x) => x.id !== 'burn' && x.id !== 'weak'); self.text('player', 'Cleansed', '#bff'); },
      buff: (id, turns, value) => { self.addStatus(self.s.player.statuses, id, turns, value); self.anim.player = 'cast'; self.sfxs.push('buff'); self.emit(300); },
      debuff: (id, turns, value) => { self.addStatus(self.s.enemy.statuses, id, turns, value); self.text('enemy', id === 'burn' ? 'BURN' : 'CURSED', '#c8a'); self.emit(300); },
      passive: (id) => {
        const ex = self.hasP(id);
        if (ex) ex.lvl = Math.max(ex.lvl, lvl); else self.s.player.passives.push({ id, lvl });
        self.text('player', CARDS[id]?.name ?? id, '#6ad8ff'); self.anim.player = 'cast'; self.sfxs.push('buff'); self.emit(500);
      },
      hpPct: () => self.s.player.hp / self.s.player.maxHp,
      enemyHpPct: () => self.s.enemy.hp / self.s.enemy.maxHp,
      say: (t, c) => { self.text('board', t, c); },
    };
  }

  // ───────────── deck ─────────────
  private drawCards(n: number, silent = false) {
    const s = this.s;
    for (let i = 0; i < n; i++) {
      if (s.hand.length >= 8) break;
      if (!s.draw.length) {
        if (!s.discard.length) break;
        s.draw = this.shuffle(s.discard); s.discard = [];
        if (!silent) this.text('board', 'Deck reshuffled', '#ccc');
      }
      s.hand.push(s.draw.shift()!);
    }
  }

  canAct(): boolean {
    const s = this.s;
    if (s.phase !== 'player') return false;
    if (s.moves > 0) return true;
    if (s.hand.some((c) => CARDS[c.id].cost <= s.energy)) return true;
    return s.player.mp >= CHARS[this.charId].ult.mpCost;
  }

  // ───────────── player actions ─────────────
  swap(a: Pos, b: Pos): BEvent[] {
    const s = this.s;
    if (s.phase !== 'player' || s.moves <= 0 || !adjacent(a, b)) return [];
    if (!isValidSwap(s.board, a, b)) {
      const sw = swapTiles(s.board, a, b);
      const orig = s.board;
      s.board = sw; this.sfxs.push('swapBad'); this.emit(200);
      s.board = orig; this.emit(200);
      return this.flush();
    }
    s.moves--;
    s.board = swapTiles(s.board, a, b);
    this.sfxs.push('swap'); this.emit(210);
    this.cascade([a, b]);
    this.afterAction();
    return this.flush();
  }

  private afterAction() {
    const s = this.s;
    if (s.enemy.hp <= 0) { this.win(); return; }
    if (!findHint(s.board)) {
      s.board = shuffleBoard(s.board); this.text('board', 'NO MOVES — SHUFFLE', '#ffd24a'); this.sfxs.push('shuffle'); this.emit(500);
    }
    s.combo = 0;
    s.comboMult = 1;
    this.emit(60);
  }

  private cascade(swapPos: [Pos, Pos]) {
    const s = this.s;
    let chain = 0;
    let first = true;
    let rageGiven = false;
    this.resonanceThisTurn = this.resonanceThisTurn || 0;
    for (let guard = 0; guard < 30; guard++) {
      const step = resolveStep(s.board, first ? swapPos : undefined);
      first = false;
      if (!step) break;
      chain++;
      s.combo = chain;
      const cs = this.pStatus('comboUp');
      const stepInc = 0.25 + (cs?.value ?? 0) + this.stats.comboStep;
      s.comboMult = Math.round((1 + (chain - 1) * stepInc) * 100) / 100;
      if (chain >= 3 && !rageGiven) {
        const er = this.hasP('eternalRage');
        if (er && s.player.rage < 10) { s.player.rage++; this.text('player', 'RAGE +1', '#ff6a4a'); }
        rageGiven = true;
      }
      // tile effects
      const unit = this.stats.atk * 0.28 + 5;
      let totalTiles = 0;
      let dealt = false;
      const dmgText: string[] = [];
      for (let t = 0; t < 6; t++) {
        const direct = step.groups.filter((g) => g.type === t).reduce((a, g) => a + g.size * (1 + 0.25 * (g.size - 3)), 0);
        const eff = direct + step.collateral[t] * 0.6;
        const count = step.perType[t] + step.collateral[t];
        if (count === 0) continue;
        totalTiles += count;
        const mult = s.comboMult;
        if (t === 4) { // iron cross = defense
          const sh = eff * (this.stats.def * 0.15 + 3) * mult * this.stats.crossMul;
          this.addShield(sh);
          continue;
        }
        let raw = 0; let crit = 0;
        if (t === 0) raw = eff * unit;
        if (t === 1) raw = eff * (unit + this.stats.mag * 0.1);
        if (t === 2) raw = eff * unit * 1.05;
        if (t === 3) { raw = eff * (this.stats.mag * 0.5 + unit * 0.6); if (this.stats.eyeHeal) this.healPlayer(this.s.player.maxHp * this.stats.eyeHeal * count); }
        if (t === 5) { raw = eff * unit * 0.95; crit = 30; }
        const r = this.hitEnemy(TILE_ELEM[t]!, raw * mult, { critBonus: crit });
        dealt = dealt || r.dmg > 0;
        dmgText.push(String(r.dmg));
      }
      const mpg = (totalTiles + step.perType[3] * 2) * 1.2 * this.stats.mpMul;
      this.gainMp(mpg);
      // metal resonance passive
      const mr = this.hasP('metalResonance');
      if (mr && step.groups.some((g) => g.size >= 4) && this.resonanceThisTurn < 2) {
        const gain = mr.lvl >= 3 ? 2 : 1;
        s.energy += gain; this.resonanceThisTurn += 1; this.gainMp(10);
        this.text('player', `+${gain} ⚡ RESONANCE`, '#ffd24a');
      }
      // visuals
      step.cleared.forEach((c) => {
        this.bursts.push({ r: c.r, c: c.c, color: TILE_COLOR[c.type], kind: step.activated.length ? 'big' : 'pop' });
      });
      step.activated.forEach((a) => {
        this.bursts.push({ r: a.r, c: a.c, color: TILE_COLOR[a.type], kind: a.kind === 'line' ? 'bolt' : 'big' });
        this.text('board', a.kind === 'line' ? 'BLAST!' : a.kind === 'ultimate' ? 'ULTIMATE!' : 'AREA STRIKE!', TILE_COLOR[a.type], 'text');
      });
      step.created.forEach((cr) => this.text('board', cr.special === 2 ? 'ULTIMATE TILE' : 'POWER TILE', '#ffd24a'));
      if (step.activated.length) { this.shakeAmt = 10 + step.activated.length * 3; this.sfxs.push('explosion'); }
      else if (step.groups.some((g) => g.size >= 4)) this.shakeAmt = 5;
      if (dealt) this.anim.player = chain >= 3 || totalTiles >= 8 ? 'crit' : 'attack';
      this.sfxs.push(chain >= 2 ? 'combo' : 'match');
      s.board = step.clearedBoard;
      this.emit(420);
      s.board = step.afterBoard;
      this.emit(380);
      this.checkPhase();
      if (s.enemy.hp <= 0) break;
    }
  }

  playCard(handIndex: number): BEvent[] {
    const s = this.s;
    if (s.phase !== 'player') return [];
    const inst = s.hand[handIndex];
    if (!inst) return [];
    const def = CARDS[inst.id];
    if (def.cost > s.energy) return [];
    s.energy -= def.cost;
    s.hand.splice(handIndex, 1);
    this.sfxs.push('card');
    this.text('board', def.name.toUpperCase(), '#fff');
    this.emit(380);
    def.run(this.ctx(inst.level), inst.level);
    if (def.cat === 'passive') s.exhausted.push(inst); else s.discard.push(inst);
    this.checkPhase();
    this.emit(60);
    this.afterAction();
    return this.flush();
  }

  useUltimate(): BEvent[] {
    const s = this.s; const u = CHARS[this.charId].ult;
    if (s.phase !== 'player' || s.player.mp < u.mpCost) return [];
    s.player.mp -= u.mpCost; s.ultUsed++;
    const st = this.stats;
    this.bannerTxt = u.name.toUpperCase(); this.anim.player = 'special'; this.sfxs.push('ultimate'); this.flashC = CHARS[this.charId].art.glow;
    this.emit(900);
    const hit = (e: Elem, raw: number, o = {}) => { this.hitEnemy(e, raw, o); this.shakeAmt = 12; this.anim.player = 'special'; this.emit(480); this.checkPhase(); };
    switch (u.id) {
      case 'metalSlash':
        hit('phys', st.atk * 3 + 60, { forceCrit: true }); this.addShield(st.def * 2 + 30); this.emit(300); break;
      case 'deathEmbrace': {
        const before = this.s.totalDamage;
        hit('dark', st.mag * 2.2 + st.atk * 2.2 + 40);
        this.healPlayer((this.s.totalDamage - before) * 0.4); this.emit(300); break;
      }
      case 'soulHarvest':
        hit('dark', st.mag * 4 + 60); this.healPlayer(st.maxHp * 0.2); this.emit(300); break;
      case 'powerChord': {
        for (let i = 0; i < 4; i++) hit(i % 2 ? 'lightning' : 'fire', st.atk * 1.1 + st.mag * 0.9 + 20);
        let b = convertTiles(s.board, 5, 2, 1); b = convertTiles(b, 3, 1, 1);
        s.board = b; this.text('board', 'TILES TRANSFORMED', '#ffd24a'); this.emit(500); break;
      }
      case 'rampage': {
        const l = Math.round(Math.min(st.maxHp * 0.1, s.player.hp - 1)); s.player.hp -= l;
        this.text('player', `-${l}`, '#ff4a4a', 'dmg');
        for (let i = 0; i < 3; i++) hit('phys', st.atk * 1.7 + 40, { forceCrit: true });
        break;
      }
    }
    this.afterAction();
    return this.flush();
  }

  shuffleSkill(): BEvent[] {
    const s = this.s;
    if (s.phase !== 'player' || s.player.mp < 15) return [];
    s.player.mp -= 15;
    s.board = shuffleBoard(s.board); this.text('board', 'SHUFFLE', '#ffd24a'); this.sfxs.push('shuffle'); this.emit(500);
    return this.flush();
  }
  focusSkill(): BEvent[] {
    const s = this.s;
    if (s.phase !== 'player' || s.player.mp < 25) return [];
    s.player.mp -= 25; s.energy += 1; this.text('player', '+1 ⚡ FOCUS', '#ffd24a'); this.sfxs.push('buff'); this.emit(400);
    return this.flush();
  }

  // ───────────── enemy ─────────────
  private enemyAtkValue() {
    const e = this.s.enemy;
    let a = e.atk * (e.enraged ? 1.4 : 1);
    const au = this.eStatus('atkUp'); if (au) a *= 1 + au.value;
    return a;
  }
  private mitigate(raw: number) {
    return raw * 100 / (100 + this.stats.def * 0.8);
  }
  private planIntent() {
    const e = this.s.enemy;
    const id = e.moves[e.moveIdx % e.moves.length];
    e.moveIdx++;
    const m = MOVES[id];
    const atk = this.enemyAtkValue();
    const dmg = m.kind === 'attack' || m.kind === 'drain' || m.kind === 'scramble' ? Math.round(this.mitigate(atk * m.power)) : 0;
    e.intent = { moveId: id, name: m.name, icon: m.icon, tele: m.tele, dmg, hits: m.hits ?? 1, elem: m.elem, kind: m.kind };
  }

  private hitPlayer(raw: number, label?: string): number {
    const p = this.s.player;
    const dodge = clamp(this.stats.speed * 0.25, 0, 30);
    if (Math.random() * 100 < dodge) { this.text('player', 'DODGE', '#9fe', 'text'); this.sfxs.push('dodge'); return 0; }
    let d = this.mitigate(raw);
    const g = this.pStatus('guard'); if (g) d *= 1 - g.value;
    const ctr = this.pStatus('counter');
    if (ctr) {
      d *= 0.6;
      const v = ctr.value; this.s.player.statuses = this.s.player.statuses.filter((x) => x !== ctr && x.id !== 'counter');
      this.hitEnemy('phys', v, { noMods: true, noCrit: true, label: '↩' });
    }
    d = Math.max(1, Math.round(d));
    let absorbed = 0;
    if (p.shield > 0) { absorbed = Math.min(p.shield, d); p.shield -= absorbed; }
    const hpLoss = d - absorbed;
    p.hp = Math.max(0, p.hp - hpLoss);
    this.fx.push({ kind: 'dmg', target: 'player', text: `${label ?? ''}${hpLoss > 0 ? hpLoss : '🛡' + absorbed}`, color: hpLoss > 0 ? '#ff5a5a' : '#9ad0ff' });
    this.anim.player = 'hit'; this.shakeAmt = Math.max(this.shakeAmt, 6); this.sfxs.push('playerHit');
    const th = this.pStatus('thorns');
    const thorns = (th?.value ?? 0) + this.stats.thorns;
    if (thorns > 0) this.hitEnemy('dark', thorns, { noMods: true, noCrit: true, label: '🌵', quiet: true });
    return d;
  }

  private enemyAct() {
    const s = this.s, e = s.enemy;
    const it = e.intent!;
    const m = MOVES[it.moveId];
    const atk = this.enemyAtkValue();
    this.bannerTxt = m.name.toUpperCase();
    this.anim.enemy = 'attack'; this.sfxs.push('roar');
    this.emit(550);
    switch (m.kind) {
      case 'attack': {
        for (let i = 0; i < (m.hits ?? 1); i++) {
          this.hitPlayer(atk * m.power);
          if (m.elem === 'fire') this.sfxs.push('fire');
          this.emit(380);
          if (s.player.hp <= 0) return;
        }
        if (m.burn) { this.addStatus(s.player.statuses, 'burn', 3, Math.round(atk * 0.12)); this.text('player', 'BURNING', '#ff8a3a'); this.emit(300); }
        break;
      }
      case 'drain': {
        const d = this.hitPlayer(atk * m.power);
        e.hp = Math.min(e.maxHp, e.hp + Math.round(d * 0.7)); this.text('enemy', `+${Math.round(d * 0.7)}`, '#6dff9a', 'heal'); this.emit(400); break;
      }
      case 'heal': {
        const h = Math.round(e.maxHp * m.power * (e.boss ? 0.7 : 1));
        e.hp = Math.min(e.maxHp, e.hp + h); this.text('enemy', `+${h}`, '#6dff9a', 'heal'); this.sfxs.push('heal'); this.emit(420); break;
      }
      case 'summon': {
        e.minions = Math.min(3, e.minions + 2); e.shield += Math.round(e.maxHp * 0.06);
        this.text('enemy', 'SKELETONS RISE', '#cfc'); this.sfxs.push('dark'); this.emit(450); break;
      }
      case 'guard': e.shield += Math.round(e.maxHp * m.power); this.text('enemy', 'SHIELD', '#9ad0ff'); this.emit(380); break;
      case 'buff': this.addStatus(e.statuses, 'atkUp', 3, m.power); this.text('enemy', 'ATK UP', '#ff9a4a'); this.emit(380); break;
      case 'curse': this.addStatus(s.player.statuses, 'weak', 2, 0.25); this.text('player', 'WEAKENED', '#c8a'); this.sfxs.push('dark'); this.emit(380); break;
      case 'scramble': {
        s.board = shuffleBoard(s.board); this.text('board', 'BOARD WARPED!', '#ff6aff'); this.shakeAmt = 8; this.emit(450);
        this.hitPlayer(atk * m.power); this.emit(350); break;
      }
    }
    if (e.minions > 0 && s.player.hp > 0) {
      this.hitPlayer(atk * 0.16 * e.minions, '💀'); this.emit(350);
    }
  }

  endTurn(): BEvent[] {
    const s = this.s;
    if (s.phase !== 'player') return [];
    s.phase = 'enemy';
    const p = s.player, e = s.enemy;
    this.text('board', 'ENEMY TURN', '#ff7a7a'); this.emit(350);

    // allies strike at the end of the player's turn
    const demon = this.pStatus('demon');
    if (demon) { this.hitEnemy('dark', demon.value, { noCrit: true, label: '👹' }); this.anim.player = 'cast'; this.emit(420); }
    for (const a of this.party) {
      this.hitEnemy('phys', a.atk * 0.9 + a.mag * 0.4, { noMods: true, noCrit: true, label: a.name.split(' ')[0] }); this.emit(320);
    }
    this.checkPhase();
    const burnE = this.eStatus('burn');
    if (burnE) { e.hp = Math.max(0, e.hp - Math.round(burnE.value)); this.text('enemy', `🔥${Math.round(burnE.value)}`, '#ff8a3a', 'dmg'); this.sfxs.push('fire'); this.emit(350); this.checkPhase(); }
    if (e.hp <= 0) { this.win(); return this.flush(); }

    this.enemyAct();
    if (p.hp <= 0) { this.lose(); return this.flush(); }
    const burnP = this.pStatus('burn');
    if (burnP) {
      p.hp = Math.max(0, p.hp - burnP.value); this.text('player', `🔥${burnP.value}`, '#ff8a3a', 'dmg'); this.anim.player = 'hit'; this.emit(350);
      if (p.hp <= 0) { this.lose(); return this.flush(); }
    }
    // end of round: durations tick down
    [p.statuses, e.statuses].forEach((list) => list.forEach((x) => x.turns--));
    p.statuses = p.statuses.filter((x) => x.turns > 0);
    e.statuses = e.statuses.filter((x) => x.turns > 0);

    // new player turn
    s.turn++; s.moves = 2; s.energy = s.maxEnergy; this.resonanceThisTurn = 0;
    p.shield = Math.round(p.shield * 0.5);
    if (this.stats.turnHeal) this.healPlayer(p.maxHp * this.stats.turnHeal);
    this.gainMp(4);
    this.drawCards(HAND_SIZE - s.hand.length);
    this.planIntent();
    s.phase = 'player';
    this.text('board', `TURN ${s.turn}`, '#ffd24a');
    this.emit(500);
    return this.flush();
  }

  private win() {
    this.s.phase = 'won';
    this.anim.enemy = 'defeat'; this.anim.player = 'victory'; this.sfxs.push('victory'); this.shakeAmt = 12;
    this.bannerTxt = 'VICTORY';
    this.emit(1100);
  }
  private lose() {
    this.s.phase = 'lost';
    this.anim.player = 'defeat'; this.sfxs.push('defeat');
    this.bannerTxt = 'DEFEAT';
    this.emit(1100);
  }

  /** Greedy AI used by AUTO and by the balance simulator. Returns events produced (empty if it ended its turn). */
  autoAct(): BEvent[] {
    const s = this.s;
    if (s.phase !== 'player') return [];
    // 1. cards: simple priorities
    const hpPct = s.player.hp / s.player.maxHp;
    const pri = (c: CardInst) => {
      const d = CARDS[c.id];
      if (d.cost > s.energy) return -1;
      if (d.cat === 'passive') return 9;
      if (d.id === 'holyBlessing') return hpPct < 0.55 ? 10 : -1;
      if (d.id === 'manaRecovery') return s.player.mp < s.player.maxMp * 0.6 ? 4 : -1;
      if (d.cat === 'defense') return hpPct < 0.7 || (s.enemy.intent?.dmg ?? 0) > s.player.hp * 0.2 ? 6 : -1;
      if (d.cat === 'support') return s.player.statuses.some((x) => x.id === (d.id === 'battleCry' ? 'atkUp' : d.id === 'criticalBoost' ? 'critUp' : 'comboUp')) ? -1 : 7;
      return 5 + d.cost * 0.2;
    };
    const ult = CHARS[this.charId].ult;
    if (s.player.mp >= ult.mpCost) return this.useUltimate();
    let best = -1, bi = -1;
    s.hand.forEach((c, i) => { const p = pri(c); if (p > best) { best = p; bi = i; } });
    if (bi >= 0) return this.playCard(bi);
    if (s.moves > 0) {
      const h = findHint(s.board);
      if (h) return this.swap(h[0], h[1]);
    }
    return this.endTurn();
  }
}
