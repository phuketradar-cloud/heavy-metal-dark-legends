import { useState } from 'react';
import { CHARS } from '../data/characters';
import { BOSSES, ENEMIES } from '../data/enemies';
import { NODE_ICON, NODE_LABEL, REGIONS, nodeLevel } from '../data/world';
import { audio } from '../engine/audio';
import { battleCtxFor, regionUnlocked, startNode, useGame } from '../game/store';
import { Embers, NODE_IMG, Portrait } from './art';
import { ScreenFrame } from './Frame';
import { Btn } from './common';

// centres of the seven region medallions, on the painted road of public/map/dark-realm.webp (stage px, 1600×900)
const POS: [number, number][] = [[151, 424], [442, 350], [634, 396], [855, 366], [1076, 428], [1279, 414], [1465, 424]];
const PIN_ICO = ['🏚', '🌲', '⛪', '⚰', '🌋', '🏰', '🌀'];

export function WorldMap() {
  const g = useGame(); const s = g.save;
  const firstOpen = REGIONS.findIndex((r, i) => regionUnlocked(s, i) && s.progress[i] < r.nodes.length);
  const [sel, setSel] = useState(firstOpen < 0 ? REGIONS.length - 1 : firstOpen);
  const r = REGIONS[sel];
  const prog = s.progress[sel];
  const unlocked = regionUnlocked(s, sel);
  const nextNode = Math.min(prog, r.nodes.length - 1);
  return (
    <ScreenFrame title="The Dark Realm" region={sel} bgImage="map/dark-realm.webp" right={<span className="muted">Leader: {CHARS[s.activeChar].name} Lv.{s.chars[s.activeChar].level}</span>}>
      <Embers n={10} />
      <div className="map">
        {REGIONS.map((rg, i) => {
          const u = regionUnlocked(s, i); const done = s.progress[i] >= rg.nodes.length;
          return (
            <button key={rg.id} className={`rpin ${sel === i ? 'sel' : ''} ${u ? '' : 'locked'} ${done ? 'done' : ''}`}
              style={{ left: POS[i][0] - 42, top: POS[i][1] - 42, ['--moon' as string]: rg.moon }}
              onClick={() => { audio.sfx('ui2'); setSel(i); }} title={rg.name}>
              <span className="rpin-ico">{done ? '✔' : u ? PIN_ICO[i] : '🔒'}</span>
              <b className="rpin-num">{i + 1}</b>
              <i className="rpin-prog">{Math.min(s.progress[i], rg.nodes.length)}/{rg.nodes.length}</i>
              <span className="rpin-name">{rg.name.replace('The ', '')}</span>
            </button>
          );
        })}
      </div>
      <div className="region-panel panel">
        <div className="rp-head">
          <div><h2>{r.name}</h2><p>{r.blurb}</p>
            <small>Enemy level {r.baseLevel}+ · Music: {r.music}{r.unlocksChar ? ` · Boss unlocks ${CHARS[r.unlocksChar].name}` : ''}</small></div>
          <div className="roster">
            {r.roster.map((id) => <div key={id} title={ENEMIES[id].name}><Portrait art={ENEMIES[id].art} monster size={54} /></div>)}
            <div title={BOSSES[r.boss].name} className="boss"><Portrait art={BOSSES[r.boss].art} monster size={64} /></div>
          </div>
        </div>
        {!unlocked ? <p className="muted">🔒 Defeat the boss of {REGIONS[sel - 1].name} to enter.</p> : (
          <>
            <div className="nodes">
              {r.nodes.map((k, i) => {
                const cleared = i < prog; const avail = i <= prog;
                const stars = s.stars[`${sel}-${i}`] ?? 0;
                const oneShot = (k === 'event' || k === 'treasure') && s.visited[`${sel}-${i}`];
                const preview = (k === 'battle' || k === 'elite' || k === 'boss') ? (BOSSES[battleCtxFor(sel, i).enemyId] ?? ENEMIES[battleCtxFor(sel, i).enemyId]).name : NODE_LABEL[k];
                return (
                  <button key={i} className={`node ${k} ${cleared ? 'cleared' : ''} ${i === prog ? 'next' : ''}`} disabled={!avail || !!oneShot}
                    onClick={() => startNode(sel, i)} title={`${NODE_LABEL[k]} · Lv.${nodeLevel(r, i, k)}`}>
                    <span className="n-ico">{oneShot ? <img className="n-img" src={`${import.meta.env.BASE_URL}${NODE_IMG.cleared}`} alt="" draggable={false} /> : NODE_IMG[k] ? <img className="n-img" src={`${import.meta.env.BASE_URL}${NODE_IMG[k]}`} alt="" draggable={false} /> : NODE_ICON[k]}</span>
                    <b>{preview}</b>
                    <small>{k === 'battle' || k === 'elite' || k === 'boss' ? `Lv.${nodeLevel(r, i, k)} · ${NODE_LABEL[k]}` : NODE_LABEL[k]}</small>
                    {stars > 0 && <em>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</em>}
                  </button>
                );
              })}
            </div>
            <div className="row">
              <Btn kind="red" disabled={prog >= r.nodes.length && false} onClick={() => startNode(sel, nextNode)}>
                {prog >= r.nodes.length ? 'Replay Boss' : `Go to Next: ${NODE_LABEL[r.nodes[nextNode]]}`}
              </Btn>
              <span className="muted">Cleared battles can be replayed to grind EXP, gold and gear.</span>
            </div>
          </>
        )}
      </div>
    </ScreenFrame>
  );
}
