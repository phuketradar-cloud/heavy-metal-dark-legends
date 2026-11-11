import { useEffect, useState } from 'react';
import { CHAR_LIST, CHARS, SLOT_UNLOCK, expToNext, MAX_LEVEL } from '../data/characters';
import { REGIONS } from '../data/world';
import { RARITY_COLOR, RARITY_LABEL, SLOTS } from '../engine/types';
import { SLOT_ICON, SLOT_LABEL } from '../data/equipment';
import { audio } from '../engine/audio';
import { continueGame, equippedItems, go, hasSave, newGame, selectChar, statsFor, updateSettings, useGame } from '../game/store';
import { Backdrop, Embers, PlayerArt, Portrait, MonsterView } from './art';
import { Bar, Btn } from './common';
import { ScreenFrame } from './Frame';
import { BOSSES } from '../data/enemies';

// button geometry inside the 1672×941 artwork
const MENU_Y = [392, 468, 536, 601, 666, 731, 797, 863];
const W_ART = 1672, H_ART = 941;

export function MainMenu() {
  const g = useGame();
  const [confirm, setConfirm] = useState(false);
  const started = g.save.started;
  const canContinue = started || hasSave();
  const items: { label: string; off?: boolean; run: () => void }[] = [
    { label: 'Continue', off: !canContinue, run: () => continueGame() },
    { label: 'New Game', run: () => (started ? setConfirm(true) : newGame()) },
    { label: 'Character', run: () => go('character') },
    { label: 'Card Collection', run: () => go('collection') },
    { label: 'Deck Builder', run: () => go('deck') },
    { label: 'Equipment', run: () => go('equipment') },
    { label: 'World Map', off: !started, run: () => go('map') },
    { label: 'Settings', run: () => go('settings') },
  ];
  const [sel, setSel] = useState(canContinue ? 0 : 1);

  useEffect(() => {
    if (confirm) return;
    const h = (e: KeyboardEvent) => {
      const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
      if (step) {
        e.preventDefault();
        let i = sel;
        for (let k = 0; k < items.length; k++) { i = (i + step + items.length) % items.length; if (!items[i].off) break; }
        setSel(i); audio.sfx('ui');
      } else if (e.key === 'Enter' && !items[sel].off) { audio.sfx('ui2'); items[sel].run(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  return (
    <div className="screen menu menu-art" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}menu.webp)` }}>
      <Embers n={22} />
      {['gold', 'red', 'black'].map((t) => <img key={t} src={`${import.meta.env.BASE_URL}btn-${t}.png`} alt="" style={{ display: 'none' }} />)}
      {items.map((it, i) => {
        const gold = i === 0;
        const active = sel === i && !it.off;
        const tex = gold ? 'gold' : active ? 'red' : 'black';
        const w = gold ? 480 : 400, h = w * 0.1925, x = (W_ART - w) / 2;
        return (
          <button key={it.label} disabled={it.off}
            className={`mbtn ${tex} ${active ? 'active' : ''}`}
            style={{ left: `${(x / W_ART) * 100}%`, width: `${(w / W_ART) * 100}%`, top: `${((MENU_Y[i] - h / 2) / H_ART) * 100}%`, height: `${(h / H_ART) * 100}%`,
              backgroundImage: `url(${import.meta.env.BASE_URL}btn-${tex}.png)` }}
            onMouseEnter={() => { if (!it.off && sel !== i) { setSel(i); audio.sfx('ui'); } }}
            onFocus={() => !it.off && setSel(i)}
            onClick={() => { audio.unlock(); audio.sfx('ui2'); setSel(i); it.run(); }}>
            {it.label}
          </button>
        );
      })}
      <div className="menu-foot-art">Run #{g.save.stats.runs} · Battles won {g.save.stats.wins} / {g.save.stats.battles}</div>
      {confirm && (
        <div className="overlay">
          <div className="panel pause">
            <h2>New Game</h2>
            <p>Erase all progress and start a new run?</p>
            <Btn kind="red" onClick={() => { setConfirm(false); newGame(); }}>Yes, begin anew</Btn>
            <Btn onClick={() => setConfirm(false)}>Cancel</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

export function CharacterScreen() {
  const g = useGame();
  const s = g.save;
  const [viewId, setViewId] = useState(s.activeChar);
  const def = CHARS[viewId];
  const cs = s.chars[viewId];
  const st = statsFor(s, viewId);
  const eq = equippedItems(s, viewId);
  const next = expToNext(cs.level);
  return (
    <ScreenFrame title="Characters">
      <div className="char-layout">
        <div className="char-list">
          {CHAR_LIST.map((c) => {
            const u = s.chars[c.id].unlocked;
            return (
              <div key={c.id} className={`char-row ${viewId === c.id ? 'sel' : ''} ${u ? '' : 'locked'}`} onClick={() => { audio.sfx('ui'); setViewId(c.id); }}>
                <Portrait art={c.art} size={64} />
                <div>
                  <b>{c.name}</b>
                  <span style={{ color: RARITY_COLOR[c.rarity] }}>{RARITY_LABEL[c.rarity]}</span>
                  <small>{u ? `Lv.${s.chars[c.id].level}${s.activeChar === c.id ? ' · Leader' : ''}` : '🔒 Locked'}</small>
                </div>
              </div>
            );
          })}
        </div>
        <div className="char-art"><div className={cs.unlocked ? '' : 'silhouette'}><PlayerArt art={def.art} /></div></div>
        <div className="char-detail panel">
          <h2 style={{ color: RARITY_COLOR[def.rarity] }}>{def.name}</h2>
          <div className="sub">{def.title} · {RARITY_LABEL[def.rarity]}</div>
          <p className="blurb">{def.blurb}</p>
          {!cs.unlocked && <p className="locked-note">🔒 {def.unlock}</p>}
          {cs.unlocked && (
            <>
              <div className="lv-row"><b>Level {cs.level}</b>{cs.level < MAX_LEVEL ? <Bar kind="exp" value={cs.exp} max={next} label={`EXP ${cs.exp} / ${next}`} height={16} /> : <span>MAX</span>}</div>
              <div className="stat-grid">
                {([['HP', st.maxHp], ['ATK', st.atk], ['DEF', st.def], ['CRIT', `${st.crit}%`], ['MAG', st.mag], ['SPEED', st.speed], ['MP', st.maxMp]] as [string, number | string][]).map(([k, v]) => (
                  <div key={k}><span>{k}</span><b>{v}</b></div>
                ))}
              </div>
              <div className="sec">Passive — {def.passive.name}</div><p>{def.passive.desc}</p>
              <div className="sec">Ultimate — {def.ult.name} <small>({def.ult.mpCost} MP)</small></div><p>{def.ult.desc}</p>
              <div className="sec">Skills</div>
              <div className="skills">
                {def.skills.map((k) => (
                  <div key={k.name} className={cs.level >= k.level ? 'on' : 'off'}><b>{k.name}</b> <small>Lv.{k.level}</small><span>{k.desc}</span></div>
                ))}
              </div>
              <div className="sec">Equipment</div>
              <div className="slot-mini">
                {SLOTS.map((sl) => (
                  <div key={sl} className="slot" title={eq[sl] ? `${eq[sl]!.name}` : `${SLOT_LABEL[sl]} — unlocks at Lv.${SLOT_UNLOCK[sl]}`} style={{ borderColor: eq[sl] ? RARITY_COLOR[eq[sl]!.rarity] : '#444' }}>
                    {SLOT_ICON[sl]}<small>{cs.level < SLOT_UNLOCK[sl] ? `🔒${SLOT_UNLOCK[sl]}` : eq[sl]?.name ?? '—'}</small>
                  </div>
                ))}
              </div>
              <div className="row">
                <Btn kind="gold" disabled={s.activeChar === viewId} onClick={() => selectChar(viewId)}>{s.activeChar === viewId ? 'Current Leader' : 'Set as Leader'}</Btn>
                <Btn onClick={() => go('equipment')}>Equipment</Btn>
              </div>
            </>
          )}
        </div>
      </div>
    </ScreenFrame>
  );
}

export function SettingsScreen() {
  const g = useGame();
  const st = g.save.settings;
  const [confirm, setConfirm] = useState(false);
  return (
    <ScreenFrame title="Settings">
      <div className="settings panel">
        <div className="set-row"><span>Music</span><Btn onClick={() => updateSettings({ music: !st.music })}>{st.music ? 'On' : 'Off'}</Btn>
          <input type="range" min="0" max="1" step="0.05" value={st.musicVol} onChange={(e) => updateSettings({ musicVol: Number(e.target.value) })} /></div>
        <div className="set-row"><span>Sound effects</span><Btn onClick={() => updateSettings({ sfx: !st.sfx })}>{st.sfx ? 'On' : 'Off'}</Btn>
          <input type="range" min="0" max="1" step="0.05" value={st.sfxVol} onChange={(e) => { updateSettings({ sfxVol: Number(e.target.value) }); }} onMouseUp={() => audio.sfx('hit')} /></div>
        <div className="set-row"><span>Battle speed</span><Btn onClick={() => updateSettings({ speed: st.speed === 1 ? 2 : 1 })}>{st.speed === 1 ? 'Normal' : 'Fast (×2)'}</Btn></div>
        <div className="set-row"><span>Test sounds</span>
          <Btn onClick={() => audio.sfx('crit')}>Impact</Btn><Btn onClick={() => audio.sfx('lightning')}>Lightning</Btn><Btn onClick={() => audio.sfx('roar')}>Roar</Btn><Btn onClick={() => audio.sfx('ultimate')}>Riff</Btn></div>
        <h3>How to play</h3>
        <ul>
          <li>Click (or drag) a tile onto an adjacent tile to swap. Match 3+ of the same rune. You get <b>2 moves</b> per turn.</li>
          <li>💀 Skull physical · 🎸 Guitar fire · ⚡ Lightning · 👁 Demon Eye dark magic + MP · ✚ Iron Cross shield · 🪓 Axe crit chance.</li>
          <li>Match 4 = <b>Blast tile</b> (clears a line). Match 5/L/T = <b>Ultimate tile</b> (clears every tile of its kind). Match 6+ = <b>area strike</b>. Swap a special tile to trigger it.</li>
          <li>Each cascade raises the <b>combo multiplier</b>. Cards cost energy; passive cards power up the whole battle.</li>
          <li>Watch the enemy's <b>telegraph</b> above it, then block with defense cards. Hotkeys: 1–5 cards, Space end turn, U ultimate.</li>
        </ul>
        <div className="row">
          {!confirm ? <Btn kind="red" onClick={() => setConfirm(true)}>Reset all progress</Btn>
            : <><span>Really erase everything?</span><Btn kind="red" onClick={() => { localStorage.clear(); location.reload(); }}>Yes, erase</Btn><Btn onClick={() => setConfirm(false)}>Cancel</Btn></>}
        </div>
      </div>
    </ScreenFrame>
  );
}
