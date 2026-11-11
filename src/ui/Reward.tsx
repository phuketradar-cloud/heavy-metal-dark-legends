import { useMemo } from 'react';
import { CARDS, MAX_CARD_LEVEL } from '../data/cards';
import { CHARS } from '../data/characters';
import { SLOT_LABEL } from '../data/equipment';
import { REGIONS } from '../data/world';
import { RARITY_COLOR, RARITY_LABEL } from '../engine/types';
import {
  claimTreasure, leaveEvent, leaveReward, nextBattle, resolveEvent, retryBattle, rewardMode, rewardPickCard,
  rewardRemove, rewardTakeGold, rewardUpgrade, statsFor, useGame,
} from '../game/store';
import { Backdrop, Embers, PlayerArt, MonsterView } from './art';
import { Btn, CardView, Ico } from './common';
import { GearLine } from './Equipment';
import { BOSSES, ENEMIES } from '../data/enemies';

export function RewardScreen() {
  const g = useGame(); const s = g.save; const r = g.ui.reward!; const b = g.ui.battle!;
  const stats = statsFor(s, s.activeChar);
  const region = REGIONS[r.region];
  const deckGroups = useMemo(() => s.deck.map((id, i) => ({ id, i })), [s.deck]);
  const hasNext = r.win && b.node + 1 < region.nodes.length && ['battle', 'elite', 'boss'].includes(region.nodes[b.node + 1]);
  const enemy = BOSSES[b.enemyId] ?? ENEMIES[b.enemyId];

  if (!r.win) {
    return (
      <div className="screen reward">
        <Backdrop region={region} /><div className="screen-dim" /><Embers n={10} />
        <div className="panel center-panel">
          <h1 className="defeat-title">DEFEAT</h1>
          <p>{r.message}</p>
          <div className="row"><Btn kind="gold" onClick={retryBattle}>Retry Battle</Btn><Btn onClick={leaveReward}>Return to Map</Btn></div>
        </div>
      </div>
    );
  }
  return (
    <div className="screen reward">
      <Backdrop region={region} /><div className="screen-dim" /><Embers n={10} />
      <div className="reward-wrap">
        <div className="reward-head">
          <div className="rw-hero"><PlayerArt art={CHARS[s.activeChar].art} /></div>
          <div className="rw-center">
            <h1 className="victory-title">{r.boss ? 'BOSS DEFEATED' : 'VICTORY'}</h1>
            <div className="rw-stars">{[1, 2, 3].map((n) => <span key={n} className={n <= r.stars ? 'on' : 'off'}><Ico n={n <= r.stars ? 'star' : 'star_off'} /></span>)}</div>
            <div className="rw-stats">
              <span><Ico n="gold" /> +{r.gold} gold</span><span><Ico n="exp" /> +{r.exp} EXP</span>
              {r.levelUps.map((l, i) => <span key={i} className="lvup"><Ico n="upgrade" /> {l.name} reached Lv.{l.level}!</span>)}
              {r.unlocked && <span className="lvup"><Ico n="unlock" /> {CHARS[r.unlocked].name} joins your party!</span>}
            </div>
            {r.drops.length > 0 && (
              <div className="rw-drops">
                {r.drops.map((d) => (
                  <div key={d.uid} className="drop" style={{ borderColor: RARITY_COLOR[d.rarity] }}>
                    <span><Ico n={`slot_${d.slot}`} /></span>
                    <div><b style={{ color: RARITY_COLOR[d.rarity] }}>{d.name}</b><small>{RARITY_LABEL[d.rarity]} {SLOT_LABEL[d.slot]}</small><small><GearLine e={d} /></small></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rw-hero r"><div style={{ transform: enemy.art.kind === 'humanoid' && !enemy.art.img ? 'scaleX(-1)' : undefined, height: '100%', opacity: 0.35, filter: 'grayscale(1)' }}><MonsterView art={enemy.art} /></div></div>
        </div>

        {!r.picked ? (
          <>
            {r.mode === 'cards' && (
              <>
                <h2 className="choose">Choose ONE reward {r.boss && <small>— boss rarity!</small>}</h2>
                <div className="reward-cards">
                  {r.cards.map((id) => (
                    <div key={id} className="reward-card">
                      <CardView id={id} big stats={stats} level={s.cardLevels[id] ?? 1} onClick={() => rewardPickCard(id)} />
                      <div className="rc-note">Owned: {s.collection[id] ?? 0}{(s.collection[id] ?? 0) === 0 ? ' · NEW' : ''}</div>
                    </div>
                  ))}
                </div>
                <div className="reward-opts">
                  <Btn onClick={() => rewardMode('upgrade')}><Ico n="upgrade" /> Upgrade a card</Btn>
                  <Btn onClick={() => rewardMode('remove')}><Ico n="h_trash" /> Remove a weak card</Btn>
                  <Btn kind="gold" onClick={rewardTakeGold}><Ico n="gold" /> Take {r.goldAlt} gold instead</Btn>
                </div>
              </>
            )}
            {r.mode !== 'cards' && (
              <>
                <h2 className="choose">{r.mode === 'upgrade' ? 'Pick a card to upgrade for free' : 'Pick a card to remove from your deck'} <Btn kind="ghost" onClick={() => rewardMode('cards')}>◀ Back</Btn></h2>
                <div className="card-grid sm center">
                  {deckGroups.filter((d) => r.mode === 'remove' || (s.cardLevels[d.id] ?? 1) < MAX_CARD_LEVEL)
                    .filter((d, idx, arr) => r.mode === 'remove' || arr.findIndex((x) => x.id === d.id) === idx)
                    .map((d) => <CardView key={`${d.id}-${d.i}`} id={d.id} small stats={stats} level={s.cardLevels[d.id] ?? 1} onClick={() => (r.mode === 'upgrade' ? rewardUpgrade(d.id) : rewardRemove(d.i))} />)}
                </div>
                {r.message && <p className="muted center">{r.message}</p>}
              </>
            )}
          </>
        ) : (
          <div className="picked panel">
            <p>{r.message}</p>
            <div className="row">
              {hasNext && <Btn kind="red" onClick={nextBattle}>Next Battle ▶</Btn>}
              <Btn kind="gold" onClick={leaveReward}>Continue to Map</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function EventScreen() {
  const g = useGame(); const e = g.ui.event!;
  const region = REGIONS[e.region];
  return (
    <div className="screen reward">
      <Backdrop region={region} /><div className="screen-dim" /><Embers n={14} />
      <div className="panel center-panel event">
        <div className="ev-ico">❓</div>
        <h1>{e.ev.title}</h1>
        <p className="ev-text">{e.ev.text}</p>
        {e.result ? (
          <>
            <p className="ev-result">{e.result}</p>
            {e.result.endsWith('Choose again.') ? (
              <div className="ev-choices">{e.ev.choices.map((c) => <Btn key={c.id} onClick={() => resolveEvent(c.id)}>{c.label}<small>{c.hint}</small></Btn>)}</div>
            ) : <Btn kind="gold" onClick={leaveEvent}>Continue</Btn>}
          </>
        ) : (
          <div className="ev-choices">
            {e.ev.choices.map((c) => <Btn key={c.id} onClick={() => resolveEvent(c.id)} className="ev-choice">{c.label}<small>{c.hint}</small></Btn>)}
          </div>
        )}
      </div>
    </div>
  );
}

export function TreasureScreen() {
  const g = useGame(); const t = g.ui.treasure!;
  const region = REGIONS[t.region];
  const stats = statsFor(g.save, g.save.activeChar);
  return (
    <div className="screen reward">
      <Backdrop region={region} /><div className="screen-dim" /><Embers n={14} />
      <div className="panel center-panel event">
        <div className="ev-ico">🧰</div>
        <h1>Treasure Chest</h1>
        <p className="ev-text">The lid creaks open, revealing glittering spoils.</p>
        <div className="rw-stats"><span><Ico n="gold" /> +{t.gold} gold</span></div>
        <div className="rw-drops">
          {t.items.map((d) => (
            <div key={d.uid} className="drop" style={{ borderColor: RARITY_COLOR[d.rarity] }}>
              <span><Ico n={`slot_${d.slot}`} /></span>
              <div><b style={{ color: RARITY_COLOR[d.rarity] }}>{d.name}</b><small>{RARITY_LABEL[d.rarity]} {SLOT_LABEL[d.slot]}</small><small><GearLine e={d} /></small></div>
            </div>
          ))}
        </div>
        {t.card && <div style={{ display: 'flex', justifyContent: 'center' }}><CardView id={t.card} small stats={stats} /></div>}
        {t.card && <p className="muted">New card: {CARDS[t.card].name}</p>}
        <Btn kind="gold" onClick={claimTreasure}>Take Everything</Btn>
      </div>
    </div>
  );
}
