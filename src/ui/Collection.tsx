import { useMemo, useState } from 'react';
import { CARD_LIST, CARDS, CAT_COLOR, CAT_LABEL, MAX_CARD_LEVEL, MAX_DECK, MIN_DECK, upgradeCost } from '../data/cards';
import { RARITIES, RARITY_COLOR, RARITY_LABEL, type CardCat, type Rarity } from '../engine/types';
import { addToDeck, inDeckCount, ownedCount, removeFromDeck, statsFor, toast, upgradeCardLevel, useGame } from '../game/store';
import { Btn, CardView, Ico, Stars } from './common';
import { ScreenFrame } from './Frame';

const CATS: CardCat[] = ['attack', 'defense', 'support', 'magic', 'passive'];

export function CollectionScreen() {
  const g = useGame(); const s = g.save;
  const [cat, setCat] = useState<CardCat | 'all'>('all');
  const [rar, setRar] = useState<Rarity | 'all'>('all');
  const [sel, setSel] = useState<string>('thunderStrike');
  const stats = statsFor(s, s.activeChar);
  const list = CARD_LIST.filter((c) => (cat === 'all' || c.cat === cat) && (rar === 'all' || c.rarity === rar));
  const owned = ownedCount(s, sel);
  const lv = s.cardLevels[sel] ?? 1;
  const discovered = CARD_LIST.filter((c) => ownedCount(s, c.id) > 0).length;
  const msg = (r: string | null, ok: string) => toast(r ?? ok);
  return (
    <ScreenFrame title={`Card Collection  ${discovered}/${CARD_LIST.length}`}>
      <div className="coll-layout">
        <div className="coll-main">
          <div className="filters">
            <span>Category</span>
            <button className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>All</button>
            {CATS.map((c) => <button key={c} className={cat === c ? 'on' : ''} style={{ ['--c' as string]: CAT_COLOR[c] }} onClick={() => setCat(c)}>{CAT_LABEL[c]}</button>)}
            <span style={{ marginLeft: 20 }}>Rarity</span>
            <button className={rar === 'all' ? 'on' : ''} onClick={() => setRar('all')}>All</button>
            {RARITIES.map((r) => <button key={r} className={rar === r ? 'on' : ''} style={{ ['--c' as string]: RARITY_COLOR[r] }} onClick={() => setRar(r)}>{RARITY_LABEL[r]}</button>)}
          </div>
          <div className="card-grid">
            {list.map((c) => (
              <CardView key={c.id} id={c.id} small level={s.cardLevels[c.id] ?? 1} stats={stats} locked={ownedCount(s, c.id) === 0}
                selected={sel === c.id} count={ownedCount(s, c.id)} onClick={() => setSel(c.id)} />
            ))}
          </div>
        </div>
        <div className="coll-detail panel">
          {ownedCount(s, sel) > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><CardView id={sel} big level={lv} stats={stats} /></div>
              <div className="detail-lines">
                <div>Owned: <b>{owned}</b> · In deck: <b>{inDeckCount(s, sel)}</b></div>
                <div>Upgrade level: <b>{lv} / {MAX_CARD_LEVEL}</b></div>
                {lv < MAX_CARD_LEVEL && <div>Next level preview: <i>{CARDS[sel].text(lv + 1, stats)}</i></div>}
              </div>
              <div className="row">
                <Btn kind="gold" disabled={lv >= MAX_CARD_LEVEL || s.gold < upgradeCost(sel, lv)} onClick={() => msg(upgradeCardLevel(sel), `${CARDS[sel].name} upgraded!`)}>
                  {lv >= MAX_CARD_LEVEL ? 'Max Level' : <>Upgrade · <Ico n="gold" />{upgradeCost(sel, lv)}</>}
                </Btn>
                <Btn disabled={s.deck.length >= MAX_DECK || inDeckCount(s, sel) >= owned} onClick={() => msg(addToDeck(sel), 'Added to deck.')}>Add to Deck</Btn>
              </div>
            </>
          ) : <p className="muted">Select a discovered card. Win battles and choose rewards to uncover more of the 23 cards.</p>}
        </div>
      </div>
    </ScreenFrame>
  );
}

export function DeckBuilder() {
  const g = useGame(); const s = g.save;
  const stats = statsFor(s, s.activeChar);
  const groups = useMemo(() => {
    const m = new Map<string, number>();
    s.deck.forEach((id) => m.set(id, (m.get(id) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => CARDS[a[0]].cost - CARDS[b[0]].cost || CARDS[a[0]].name.localeCompare(CARDS[b[0]].name));
  }, [s.deck]);
  const curve = [0, 1, 2, 3, 4].map((c) => s.deck.filter((id) => CARDS[id].cost === c).length);
  const maxCurve = Math.max(1, ...curve);
  const avg = s.deck.length ? (s.deck.reduce((a, id) => a + CARDS[id].cost, 0) / s.deck.length).toFixed(2) : '0';
  const byCat = (['attack', 'defense', 'support', 'magic', 'passive'] as CardCat[]).map((c) => [c, s.deck.filter((id) => CARDS[id].cat === c).length] as const);
  const bestCat = [...byCat].sort((a, b) => b[1] - a[1])[0];
  const has = (id: string) => s.deck.includes(id);
  const build = bestCat[1] === 0 ? '—'
    : has('comboAmplifier') && has('eternalRage') ? 'Combo Build'
      : has('criticalBoost') && has('darkFortune') ? 'Critical Build'
        : bestCat[0] === 'magic' ? 'Dark Magic Build' : bestCat[0] === 'defense' ? 'Defensive Build'
          : has('rageGuitar') || has('infernalExplosion') || has('meteorStorm') ? 'Elemental Build'
            : bestCat[0] === 'attack' ? 'Physical Damage Build' : 'Support / Hybrid Build';
  const avail = CARD_LIST.filter((c) => ownedCount(s, c.id) > 0);
  const msg = (r: string | null) => { if (r) toast(r); };
  return (
    <ScreenFrame title="Deck Builder" right={<div className={`deck-size ${s.deck.length < MIN_DECK || s.deck.length > MAX_DECK ? 'bad' : ''}`}>Deck {s.deck.length} / {MAX_DECK}</div>}>
      <div className="deck-layout">
        <div className="deck-col panel">
          <h3>Current Deck <small>(click to remove · min {MIN_DECK})</small></h3>
          <div className="deck-list">
            {groups.map(([id, n]) => (
              <div key={id} className="deck-row" style={{ borderLeftColor: RARITY_COLOR[CARDS[id].rarity] }} onClick={() => msg(removeFromDeck(s.deck.indexOf(id)))} title={CARDS[id].text(s.cardLevels[id] ?? 1, stats)}>
                <span className="cost">{CARDS[id].cost}</span>
                <span className="nm">{CARDS[id].name}{(s.cardLevels[id] ?? 1) > 1 ? <> <Stars n={(s.cardLevels[id] ?? 1) - 1} of={(s.cardLevels[id] ?? 1) - 1} /></> : ''}</span>
                <span className="ct" style={{ color: CAT_COLOR[CARDS[id].cat] }}>{CAT_LABEL[CARDS[id].cat]}</span>
                <b>×{n}</b>
              </div>
            ))}
          </div>
          <div className="deck-stats">
            <div className="curve-title">Energy curve · avg cost {avg}</div>
            <div className="curve">{curve.map((n, i) => <div key={i}><div className="bar" style={{ height: `${(n / maxCurve) * 70}px` }}>{n || ''}</div><span>{i}</span></div>)}</div>
            <div className="cats">{byCat.map(([c, n]) => <span key={c} style={{ color: CAT_COLOR[c] }}>{CAT_LABEL[c]} {n}</span>)}</div>
            <div className="build">Detected strategy: <b>{build}</b></div>
          </div>
        </div>
        <div className="avail-col">
          <h3>Available Cards <small>(click to add · max 3 copies each)</small></h3>
          <div className="card-grid sm">
            {avail.map((c) => {
              const free = ownedCount(s, c.id) - inDeckCount(s, c.id);
              return <CardView key={c.id} id={c.id} small level={s.cardLevels[c.id] ?? 1} stats={stats} count={free} dim={free <= 0} onClick={() => msg(addToDeck(c.id))} />;
            })}
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}
