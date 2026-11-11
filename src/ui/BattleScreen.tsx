import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Battle, TILE_COLOR, type BEvent, type BattleState } from '../engine/battle';
import { adjacent, findHint, SIZE, type Pos } from '../engine/match3';
import { audio } from '../engine/audio';
import { CHARS } from '../data/characters';
import { CARDS } from '../data/cards';
import { REGIONS } from '../data/world';
import { BOSSES, ENEMIES, MOVES } from '../data/enemies';
import { RARITY_COLOR, SLOTS, type Anim, type Fx } from '../engine/types';
import {
  deckInstances, equippedItems, finishBattle, go, partyAssists, setAuto, statsFor, updateSettings, useGame,
} from '../game/store';
import { Backdrop, Embers, Icon, MonsterView, PlayerArt, Portrait, TILE_BG, TILE_IMG, TILE_RIM, SKILL_IMG } from './art';
import { Bar, Btn, Ico, CardView, Particles, StatusRow, type FxHandle } from './common';

const T = 68, PAD = 16, FRAME_L = 512, FRAME_T = 112;
const BX = FRAME_L + PAD, BY = FRAME_T + PAD;
const tileXY = (r: number, c: number): [number, number] => [BX + c * T + T / 2, BY + r * T + T / 2];
const ENEMY_POS: [number, number] = [1340, 400];
const PLAYER_POS: [number, number] = [270, 420];
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface Float { id: number; x: number; y: number; text: string; color: string; kind: Fx['kind'] }
let floatId = 1;

function SkillArt({ src, fallback }: { src: string | null; fallback: string }) {
  return src ? <img className="skill-img" src={`${import.meta.env.BASE_URL}${src}`} alt="" draggable={false} /> : <Icon id={fallback} size={44} />;
}

export function BattleScreen() {
  const g = useGame();
  const save = g.save;
  const ctx = g.ui.battle!;
  const region = REGIONS[ctx.region];
  const charDef = CHARS[save.activeChar];
  const enemyDef = BOSSES[ctx.enemyId] ?? ENEMIES[ctx.enemyId];

  const battle = useMemo(() => new Battle({
    charId: save.activeChar, stats: statsFor(save, save.activeChar), deck: deckInstances(save),
    enemyId: ctx.enemyId, enemyLevel: ctx.level, elite: ctx.elite, party: partyAssists(save), objTurns: ctx.objTurns,
  }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [g.ui.seq]);
  const [view, setView] = useState<BattleState>(() => structuredClone(battle.s));
  const [busy, setBusy] = useState(false);
  const [floats, setFloats] = useState<Float[]>([]);
  const [pAnim, setPAnim] = useState<{ n: Anim; k: number }>({ n: 'idle', k: 0 });
  const [eAnim, setEAnim] = useState<{ n: Anim; k: number }>({ n: 'idle', k: 0 });
  const [shake, setShake] = useState({ a: 0, k: 0 });
  const [banner, setBanner] = useState<{ t: string; k: number } | null>({ t: ctx.kind === 'boss' ? `BOSS: ${enemyDef.name.toUpperCase()}` : `${enemyDef.name.toUpperCase()} APPEARS`, k: 0 });
  const [flash, setFlash] = useState<{ c: string; k: number } | null>(null);
  const [sel, setSel] = useState<Pos | null>(null);
  const [pause, setPause] = useState(false);
  const [hint, setHint] = useState<[Pos, Pos] | null>(null);
  const [comboPop, setComboPop] = useState(0);
  const fx = useRef<FxHandle>(null);
  const speedRef = useRef(save.settings.speed);
  speedRef.current = save.settings.speed;
  const busyRef = useRef(false);
  const alive = useRef(true);
  const drag = useRef<{ r: number; c: number; x: number; y: number } | null>(null);
  const result = view.phase === 'won' ? 'won' : view.phase === 'lost' ? 'lost' : null;

  useEffect(() => { alive.current = true; audio.music(ctx.kind === 'boss' ? 'doom' : region.music); return () => { alive.current = false; }; }, [ctx.kind, region.music, g.ui.seq]);
  useEffect(() => { const t = setTimeout(() => setBanner(null), 1800); return () => clearTimeout(t); }, []);

  const spawnFloat = useCallback((f: Fx, i: number) => {
    const [bx, by] = f.target === 'enemy' ? ENEMY_POS : f.target === 'player' ? PLAYER_POS : [800, 380];
    const id = floatId++;
    const nf: Float = { id, x: bx + (Math.random() - 0.5) * 120, y: by - 40 - i * 34 + (Math.random() - 0.5) * 30, text: f.text, color: f.color ?? '#fff', kind: f.kind };
    setFloats((l) => [...l, nf]);
    setTimeout(() => setFloats((l) => l.filter((x) => x.id !== id)), 1400);
  }, []);

  const run = useCallback(async (evs: BEvent[]) => {
    if (!evs.length) return;
    busyRef.current = true; setBusy(true); setSel(null); setHint(null);
    for (const ev of evs) {
      if (!alive.current) return;
      setView(ev.snap);
      ev.sfx.forEach((s) => audio.sfx(s));
      if (ev.anim?.player) setPAnim((a) => ({ n: ev.anim!.player!, k: a.k + 1 }));
      if (ev.anim?.enemy) setEAnim((a) => ({ n: ev.anim!.enemy!, k: a.k + 1 }));
      if (ev.shake) setShake((s) => ({ a: ev.shake!, k: s.k + 1 }));
      if (ev.banner) setBanner((b) => ({ t: ev.banner!, k: (b?.k ?? 0) + 1 }));
      if (ev.flash) setFlash((f) => ({ c: ev.flash!, k: (f?.k ?? 0) + 1 }));
      if (ev.snap.combo >= 2) setComboPop((k) => k + 1);
      ev.fx.forEach((f, i) => {
        spawnFloat(f, i);
        if (f.target === 'enemy' && (f.kind === 'dmg' || f.kind === 'crit')) {
          fx.current?.burst(ENEMY_POS[0] + (Math.random() - 0.5) * 100, ENEMY_POS[1] + (Math.random() - 0.5) * 140, f.color ?? '#fff', f.kind === 'crit' ? 'big' : 'fire');
          if (f.color === '#7ac8ff') fx.current?.bolt(PLAYER_POS[0] + 120, 240, ENEMY_POS[0], ENEMY_POS[1] - 60, '#7ac8ff');
        }
        if (f.target === 'player' && f.kind === 'dmg') fx.current?.burst(PLAYER_POS[0], PLAYER_POS[1], '#ff3a3a', 'pop');
        if (f.target === 'player' && (f.kind === 'heal')) fx.current?.burst(PLAYER_POS[0], PLAYER_POS[1], '#6dff9a', 'dark');
      });
      ev.burst?.forEach((b) => { const [x, y] = tileXY(b.r, b.c); fx.current?.burst(x, y, b.color, b.kind); if (b.kind === 'bolt') fx.current?.bolt(x - 120, y, x + 120, y, b.color); });
      await sleep(ev.ms / speedRef.current);
    }
    busyRef.current = false;
    if (!alive.current) return;
    setBusy(false);
  }, [spawnFloat]);

  // player may have nothing left to do -> end turn automatically
  useEffect(() => {
    if (busy || view.phase !== 'player' || result) return;
    if (!battle.canAct()) { const t = setTimeout(() => { if (!busyRef.current) void run(battle.endTurn()); }, 500 / speedRef.current); return () => clearTimeout(t); }
  }, [busy, view, battle, run, result]);

  // AUTO mode
  const auto = g.ui.auto;
  useEffect(() => {
    if (!auto || busy || view.phase !== 'player' || result || pause) return;
    const t = setTimeout(() => { if (!busyRef.current) void run(battle.autoAct()); }, 320 / speedRef.current);
    return () => clearTimeout(t);
  }, [auto, busy, view, battle, run, result, pause]);

  const canInput = !busy && view.phase === 'player' && !auto && !pause;
  // out of moves: the End Turn button moves to the middle of the board and blinks as a reminder
  const alertEnd = canInput && view.moves <= 0 && !result;

  const trySwap = (a: Pos, b: Pos) => { if (!canInput) return; void run(battle.swap(a, b)); };
  const playCard = (i: number) => { if (!canInput) return; void run(battle.playCard(i)); };
  const endTurn = () => { if (!canInput) return; void run(battle.endTurn()); };
  const ult = () => { if (!canInput) return; void run(battle.useUltimate()); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') playCard(Number(e.key) - 1);
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); endTurn(); }
      if (e.key === 'u') ult();
      if (e.key === 'Escape') setPause((p) => !p);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const onTileClick = (r: number, c: number) => {
    if (!canInput || view.moves <= 0) return;
    if (!sel) { setSel([r, c]); audio.sfx('ui'); return; }
    if (sel[0] === r && sel[1] === c) { setSel(null); return; }
    if (adjacent(sel, [r, c])) { const s = sel; setSel(null); trySwap(s, [r, c]); } else setSel([r, c]);
  };
  const onPointerDown = (e: React.PointerEvent, r: number, c: number) => { drag.current = { r, c, x: e.clientX, y: e.clientY }; };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || !canInput || view.moves <= 0) return;
    const scale = (e.currentTarget as HTMLElement).getBoundingClientRect().width / (SIZE * T + PAD * 2);
    const dx = (e.clientX - d.x) / scale, dy = (e.clientY - d.y) / scale;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 26) return;
    const to: Pos = Math.abs(dx) > Math.abs(dy) ? [d.r, d.c + Math.sign(dx)] : [d.r + Math.sign(dy), d.c];
    drag.current = null;
    if (to[0] >= 0 && to[0] < SIZE && to[1] >= 0 && to[1] < SIZE) { setSel(null); trySwap([d.r, d.c], to); }
  };
  const onPointerUp = (r: number, c: number) => { const d = drag.current; drag.current = null; if (d && d.r === r && d.c === c) onTileClick(r, c); };

  const showHint = () => { if (canInput) setHint(findHint(view.board)); };

  // Regular painted enemies are sized by visual mass (opaque area) so they read as big as the hero.
  // Weapons / limbs may overflow the stage or tuck behind the board; the body is anchored by its centre of mass.
  const asp = enemyDef.art.imgAspect ?? 1;
  const regularImg = !!enemyDef.art.img && !enemyDef.boss;
  let eStyle: React.CSSProperties;
  if (regularImg) {
    const fill = enemyDef.art.fill ?? 0.45, cx = enemyDef.art.cx ?? 0.5;
    const beast = asp >= 1.3;
    const target = 190523 * 1.1;               // hero opaque area (px²) × 1.1
    const area = target / fill;
    let ew = Math.sqrt(area * asp), eh = Math.sqrt(area / asp);
    const k = Math.min(1, 780 / eh, (beast ? 600 : 760) / ew);
    ew *= k; eh *= k;
    const minLeft = beast ? 1060 : 940;       // may tuck a little behind the board frame (x≈1088)
    let left = 1250 - cx * ew;                 // body centre of mass sits nearer the middle of the screen
    left = Math.max(minLeft, Math.min(left, 1600 + 60 - ew));
    left = Math.max(minLeft, left);
    eStyle = { left, top: 860 - eh, width: ew, height: eh };
  } else {
    eStyle = { left: 1590 - (asp > 0.8 ? 580 : 470), top: enemyDef.art.img ? 205 : ctx.kind === 'boss' ? 225 : 215, width: asp > 0.8 ? 580 : 470, height: enemyDef.art.img ? 655 : ctx.kind === 'boss' ? 590 : 575 };
  }
  const e = view.enemy, p = view.player;
  const intent = e.intent;
  const heavy = intent && intent.dmg * intent.hits > p.maxHp * 0.18;
  const equip = equippedItems(save, save.activeChar);
  const unlockedChars = Object.values(CHARS).filter((c) => save.chars[c.id].unlocked);
  const shakeStyle = shake.a ? { animation: `shake ${0.3 + shake.a * 0.02}s`, ['--sh' as string]: `${Math.min(14, shake.a)}px` } : {};
  const moveSet = useMemo(() => [...new Set(e.moves)].map((m) => MOVES[m]), [e.moves]);
  const ultDef = charDef.ult;
  const stats = battle.stats;
  const ultReady = p.mp >= ultDef.mpCost;

  return (
    <div className="battle" style={shakeStyle} key={shake.k}>
      <Backdrop region={region} />
      <Embers />
      {/* ───────── characters ───────── */}
      <div className="p-wrap" style={{ left: 50, top: 195, width: 440, height: 665 }}>
        <div key={pAnim.k} className={`act act-${pAnim.n}`}>
          <div className={`idle ${view.phase === 'lost' ? '' : 'breathe'}`}><PlayerArt art={charDef.art} /></div>
        </div>
      </div>
      <div className="e-wrap" style={eStyle}>
        <div key={eAnim.k} className={`act e-act-${eAnim.n}`}>
          <div className={`idle ${e.enraged ? 'enraged' : 'breathe-e'}`} style={{ transform: `scale(${(1 + ((enemyDef.art.scale ?? 1) - 1) * 0.3) * 1})`, transformOrigin: 'bottom center' }}>
            <div style={{ transform: enemyDef.art.kind === 'humanoid' && !enemyDef.art.img ? 'scaleX(-1)' : undefined, height: '100%' }}><MonsterView art={enemyDef.art} /></div>
          </div>
        </div>
        {e.minions > 0 && <div className="minions">{Array.from({ length: e.minions }, (_, i) => <span key={i}>💀</span>)}</div>}
      </div>

      {/* ───────── HUD top left ───────── */}
      <button className="hud-menu" onClick={() => { audio.unlock(); setPause(true); }} aria-label="Menu">☰</button>
      <div className="hud-player">
        <div className="hud-portrait"><Portrait art={charDef.art} size={104} /><span className="lvl-badge">Lv.{save.chars[charDef.id].level}</span></div>
        <div className="hud-info">
          <div className="hud-name">{charDef.name}</div>
          <Bar kind="hp" value={p.hp} max={p.maxHp} label={`HP ${p.hp} / ${p.maxHp}${p.shield ? `  (+${p.shield} 🛡)` : ''}`} height={22} shield={p.shield} />
          <Bar kind="mp" value={p.mp} max={p.maxMp} label={`MP ${p.mp} / ${p.maxMp}`} height={18} />
          <div className="hud-row">
            <StatusRow list={p.statuses} />
            {p.passives.map((ps) => <div key={ps.id} className="status" title={CARDS[ps.id]?.name ?? ps.id}><span>✦</span></div>)}
            {p.rage > 0 && <div className="status" title="Rage stacks"><span>😡</span><b>{p.rage}</b></div>}
          </div>
          <div className="hud-gear">
            {SLOTS.map((s) => <span key={s} className="gear-pip" title={equip[s]?.name ?? `${s} (empty)`} style={{ borderColor: equip[s] ? RARITY_COLOR[equip[s]!.rarity] : '#333', opacity: equip[s] ? 1 : 0.4 }}><Ico n={`slot_${s}`} /></span>)}
          </div>
        </div>
      </div>

      {/* party panel */}
      <div className="party">
        {unlockedChars.map((c) => (
          <div key={c.id} className={`party-slot ${c.id === save.activeChar ? 'active' : ''}`} title={c.id === save.activeChar ? 'Leader' : `${c.name} assists with a strike each turn`}>
            <Portrait art={c.art} size={62} />
            <span className="party-tag">{c.id === save.activeChar ? 'LEAD' : 'ASSIST'}</span>
          </div>
        ))}
      </div>

      {/* ───────── stage banner ───────── */}
      <div className="stage-banner">
        <div className="stage-title">{region.name}</div>
        <div className="stage-sub">STAGE {ctx.region + 1}-{ctx.node + 1} · {ctx.kind === 'boss' ? 'BOSS' : ctx.kind === 'elite' ? 'ELITE' : 'BATTLE'}</div>
        <div className="stage-stars">
          <span className="on"><Ico n="star" /></span>
          <span className={view.turn <= view.objTurns ? 'on' : 'off'}><Ico n={view.turn <= view.objTurns ? 'star' : 'star_off'} /></span>
          <span className={p.hp / p.maxHp > 0.5 ? 'on' : 'off'}><Ico n={p.hp / p.maxHp > 0.5 ? 'star' : 'star_off'} /></span>
        </div>
      </div>

      {/* ───────── enemy HUD ───────── */}
      <div className="hud-enemy">
        <div className="hud-enemy-info">
          <div className="hud-name e">{e.name}<span className="elv">Lv.{e.level}</span></div>
          <div className="e-type">{enemyDef.type}{e.boss ? ` · ${e.phaseLabel}` : ''}{e.enraged ? ' · 🔥 ENRAGED' : ''}</div>
          <Bar kind="enemy" value={e.hp} max={e.maxHp} label={`HP ${e.hp} / ${e.maxHp}${e.shield ? `  (+${e.shield} 🛡)` : ''}`} height={24} shield={e.shield} />
          <div className="hud-row"><StatusRow list={e.statuses} /></div>
        </div>
        <div className="hud-portrait e"><Portrait art={enemyDef.art} monster size={104} /></div>
      </div>

      {/* intent telegraph */}
      {intent && !result && (
        <div className={`intent ${heavy ? 'heavy' : ''}`} style={{ left: 1130, top: enemyDef.art.img ? 128 : ctx.kind === 'boss' ? 148 : 178 }}>
          <div className="intent-icon"><Ico n={`mv_${intent.moveId}`} /></div>
          <div>
            <div className="intent-name">{intent.name}{intent.hits > 1 ? ` ×${intent.hits}` : ''}</div>
            <div className="intent-tele">{intent.tele}</div>
          </div>
          {intent.dmg > 0 && <div className="intent-dmg">{intent.dmg * intent.hits}<small>dmg</small></div>}
        </div>
      )}
      <div className="abilities" title="Enemy abilities this phase">
        {moveSet.map((m) => <span key={m.id} className={m.id === intent?.moveId ? 'cur' : ''} title={`${m.name}: ${m.tele}`}><Ico n={`mv_${m.id}`} /></span>)}
      </div>

      {/* ───────── board ───────── */}
      <div className="board-frame" style={{ left: FRAME_L, top: FRAME_T, width: SIZE * T + PAD * 2, height: SIZE * T + PAD * 2 }}
        onPointerMove={onPointerMove} onPointerLeave={() => { drag.current = null; }}>
        <div className="board-diamond l" title="Moves left this turn"><b>{view.moves}</b><small>MOVES</small></div>
        <div className="board-diamond r" title="Turn"><b>{view.turn}</b><small>TURN</small></div>
        <div className="board-grid" style={{ left: PAD, top: PAD, width: SIZE * T, height: SIZE * T }}>
          {view.board.flatMap((row, r) => row.map((t, c) => t && (
            <div key={t.id} className={`tile ${t.fresh ? 'fresh' : ''} ${t.clearing ? 'clearing' : ''} ${t.special ? `sp sp${t.special}` : ''} ${sel && sel[0] === r && sel[1] === c ? 'sel' : ''} ${hint && ((hint[0][0] === r && hint[0][1] === c) || (hint[1][0] === r && hint[1][1] === c)) ? 'hint' : ''}`}
              style={{ transform: `translate(${c * T}px, ${r * T}px)`, ['--fresh' as string]: t.fresh ? `${-t.fresh * T}px` : '0px', ['--rim' as string]: TILE_RIM[t.type], width: T, height: T }}
              onPointerDown={(e) => onPointerDown(e, r, c)} onPointerUp={() => onPointerUp(r, c)}>
              <div className={`tile-in ${TILE_IMG[t.type] ? 'img' : ''}`} style={TILE_IMG[t.type] ? undefined : { background: TILE_BG[t.type], boxShadow: `inset 0 0 0 2px ${TILE_RIM[t.type]}55, inset 0 -8px 14px #0008` }}>
                {TILE_IMG[t.type]
                  ? <img className="tile-img" src={`${import.meta.env.BASE_URL}${TILE_IMG[t.type]}`} alt="" draggable={false} />
                  : <Icon id={String(t.type)} size={T - 20} />}
                {t.special === 1 && <div className={`sp-mark ${t.dir}`}>{t.dir === 'v' ? '⇕' : '⇔'}</div>}
                {t.special === 2 && <div className="sp-mark star">✦</div>}
              </div>
            </div>
          )))}
        </div>
      </div>

      {alertEnd && (
        <button className="end-turn-center" onClick={() => { audio.unlock(); audio.sfx('ui2'); endTurn(); }}>
          <small>NO MOVES LEFT</small>END TURN
        </button>
      )}
      {/* combo */}
      {view.combo >= 2 && (
        <div className="combo" key={comboPop}><b>{view.combo}</b><span>Combo</span><em>x{view.comboMult.toFixed(2)}</em></div>
      )}

      {/* mission */}
      <div className="mission">
        <div className="mission-title">Mission</div>
        <div className={`mission-row on`}><span><Ico n="star" /></span>Defeat {ctx.kind === 'boss' ? 'the Boss' : 'the Enemy'}</div>
        <div className={`mission-row ${view.turn <= view.objTurns ? 'on' : 'off'}`}><span><Ico n={view.turn <= view.objTurns ? 'star' : 'star_off'} /></span>Clear within {view.objTurns} turns <small>({view.turn})</small></div>
        <div className={`mission-row ${p.hp / p.maxHp > 0.5 ? 'on' : 'off'}`}><span><Ico n={p.hp / p.maxHp > 0.5 ? 'star' : 'star_off'} /></span>HP &gt; 50%</div>
      </div>

      {/* ───────── bottom left: energy & piles ───────── */}
      <div className="energy">
        <div className="energy-orb"><b>{view.energy}</b><small>/ {view.maxEnergy}</small><span>ENERGY</span></div>
        <div className="piles">
          <div title="Draw pile"><Icon id="crystal" size={22} /> {view.draw.length}<small>draw</small></div>
          <div title="Discard pile">♻ {view.discard.length}<small>discard</small></div>
        </div>
        <div className="quick">
          <button title="Show hint" onClick={() => { audio.unlock(); showHint(); }}>💡</button>
          <button title="Pause" onClick={() => { audio.unlock(); setPause(true); }}>⚙</button>
        </div>
      </div>

      {/* ───────── hand ───────── */}
      <div className="hand">
        {view.hand.map((c, i) => (
          <CardView key={c.uid} id={c.id} level={c.level} stats={stats} hotkey={i + 1}
            disabled={!canInput || CARDS[c.id].cost > view.energy} dim={CARDS[c.id].cost > view.energy} onClick={() => playCard(i)} />
        ))}
        {view.hand.length === 0 && <div className="hand-empty">No cards in hand — end your turn to draw.</div>}
      </div>

      {/* ───────── bottom right ───────── */}
      <div className="support">
        <div className="support-title">Support Skills</div>
        <div className="support-row">
          <button className={`skill ult ${ultReady ? 'ready' : ''}`} disabled={!canInput || !ultReady} onClick={ult} title={`${ultDef.name} — ${ultDef.desc} (${ultDef.mpCost} MP) [U]`}>
            <SkillArt src={SKILL_IMG.ult[save.activeChar]} fallback="horns" /><small>{ultDef.mpCost}</small>
          </button>
          <button className="skill" disabled={!canInput || p.mp < 15} onClick={() => void run(battle.shuffleSkill())} title="Shuffle the board (15 MP)">
            <SkillArt src={SKILL_IMG.shuffle} fallback="hourglass" /><small>15</small>
          </button>
          <button className="skill" disabled={!canInput || p.mp < 25} onClick={() => void run(battle.focusSkill())} title="Focus: +1 energy (25 MP)">
            <SkillArt src={SKILL_IMG.focus} fallback="wings" /><small>25</small>
          </button>
        </div>
        <div className="support-name">{ultDef.name}</div>
      </div>
      <div className="actions">
        <Btn kind="red" className={`end-turn ${alertEnd ? 'ghost-slot' : ''}`} disabled={!canInput || alertEnd} onClick={endTurn}>END TURN</Btn>
        <Btn kind={auto ? 'gold' : 'normal'} onClick={() => { setAuto(!auto); }} className="auto-btn">▶ AUTO{auto ? ' ON' : ''}</Btn>
        <Btn onClick={() => updateSettings({ speed: save.settings.speed === 1 ? 2 : 1 })} className="ff-btn">{save.settings.speed === 1 ? '▶▶' : '▶▶▶'}</Btn>
      </div>

      <div className="deck-badge" title="Cards in deck"><Icon id="star" size={26} /><b>{save.deck.length}</b><small>Card Deck</small></div>

      {/* floats / fx */}
      {floats.map((f) => <div key={f.id} className={`float float-${f.kind}`} style={{ left: f.x, top: f.y, color: f.color }}>{f.text}</div>)}
      <Particles ref={fx} width={1600} height={900} />
      {flash && <div key={flash.k} className="screen-flash" style={{ background: flash.c }} />}
      {banner && <div key={banner.k} className="big-banner"><span>{banner.t}</span></div>}

      {/* overlays */}
      {pause && (
        <div className="overlay">
          <div className="panel pause">
            <h2>Paused</h2>
            <Btn kind="gold" onClick={() => setPause(false)}>Resume</Btn>
            <Btn onClick={() => updateSettings({ music: !save.settings.music })}>Music: {save.settings.music ? 'On' : 'Off'}</Btn>
            <Btn onClick={() => updateSettings({ sfx: !save.settings.sfx })}>Sound FX: {save.settings.sfx ? 'On' : 'Off'}</Btn>
            <Btn kind="red" onClick={() => { setPause(false); go('map'); }}>Retreat to Map</Btn>
          </div>
        </div>
      )}
      {result && !busy && (
        <div className="overlay result">
          <div className={`result-card ${result}`}>
            <h1>{result === 'won' ? 'VICTORY' : 'DEFEAT'}</h1>
            <p>{result === 'won' ? `${e.name} has fallen in ${view.turn} turn${view.turn > 1 ? 's' : ''}.` : 'You have fallen in battle…'}</p>
            <Btn kind="gold" onClick={() => finishBattle({ win: result === 'won', turns: view.turn, hpPct: p.hp / p.maxHp })}>{result === 'won' ? 'Claim Rewards' : 'Continue'}</Btn>
          </div>
        </div>
      )}
      {/* tile colours exposed for CSS legend (unused value keeps import alive) */}
      <i hidden>{TILE_COLOR.length}</i>
    </div>
  );
}
