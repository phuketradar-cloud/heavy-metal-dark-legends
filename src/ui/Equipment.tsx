import { useState } from 'react';
import { CHAR_LIST, CHARS, SLOT_UNLOCK } from '../data/characters';
import { ELEM_LABEL, MAX_GEAR_LEVEL, PASSIVE_TEXT, SLOT_LABEL, sellValue, upgradeGearCost, type Equip } from '../data/equipment';
import { RARITY_COLOR, RARITY_LABEL, SLOTS, type Slot } from '../engine/types';
import { autoEquip, equipItem, equippedItems, sellGear, statsFor, toast, unequipSlot, upgradeGear, useGame } from '../game/store';
import { Btn, DEFAULT_STATS, Ico } from './common';
import { Portrait } from './art';
import { ScreenFrame } from './Frame';

export function GearLine({ e }: { e: Equip }) {
  const m = 1 + e.level * 0.12;
  const parts: string[] = [];
  if (e.atk) parts.push(`ATK +${Math.round(e.atk * m)}`);
  if (e.def) parts.push(`DEF +${Math.round(e.def * m)}`);
  if (e.hp) parts.push(`HP +${Math.round(e.hp * m)}`);
  if (e.mag) parts.push(`MAG +${Math.round(e.mag * m)}`);
  if (e.crit) parts.push(`CRIT +${(e.crit * m).toFixed(1)}%`);
  if (e.elem && e.elemPct) parts.push(`${ELEM_LABEL[e.elem]} DMG +${Math.round(e.elemPct * m)}%`);
  return <>{parts.join(' · ')}{e.passive && <div className="gear-passive">✦ {PASSIVE_TEXT[e.passive]}</div>}</>;
}

export function EquipmentScreen() {
  const g = useGame(); const s = g.save;
  const [cid, setCid] = useState(s.activeChar);
  const [filter, setFilter] = useState<Slot | 'all'>('all');
  const cs = s.chars[cid]; const eq = equippedItems(s, cid);
  const st = statsFor(s, cid) ?? DEFAULT_STATS;
  const inv = s.inventory.filter((e) => filter === 'all' || e.slot === filter)
    .sort((a, b) => b.level - a.level || ['mythic', 'legendary', 'epic', 'rare', 'common'].indexOf(a.rarity) - ['mythic', 'legendary', 'epic', 'rare', 'common'].indexOf(b.rarity));
  const equippedBy = (uid: string) => CHAR_LIST.find((c) => s.chars[c.id].equip && Object.values(s.chars[c.id].equip).includes(uid));
  const msg = (r: string | null, ok?: string) => { if (r) toast(r); else if (ok) toast(ok); };
  return (
    <ScreenFrame title="Equipment">
      <div className="eq-layout">
        <div className="eq-left panel">
          <div className="eq-chars">
            {CHAR_LIST.filter((c) => s.chars[c.id].unlocked).map((c) => (
              <div key={c.id} className={`eq-char ${cid === c.id ? 'sel' : ''}`} onClick={() => setCid(c.id)} title={c.name}><Portrait art={c.art} size={56} /></div>
            ))}
          </div>
          <h3>{CHARS[cid].name} <small>Lv.{cs.level}</small></h3>
          <div className="row" style={{ margin: '4px 0 10px' }}>
            <Btn kind="gold" onClick={() => toast(autoEquip(cid))}>⚡ Auto-Equip Best</Btn>
          </div>
          <div className="slots">
            {SLOTS.map((sl) => {
              const it = eq[sl]; const locked = cs.level < SLOT_UNLOCK[sl];
              return (
                <div key={sl} className={`slot-big ${locked ? 'locked' : ''}`} style={{ borderColor: it ? RARITY_COLOR[it.rarity] : '#3a3040' }}>
                  <div className="ico"><Ico n={`slot_${sl}`} /></div>
                  <div className="info">
                    <b>{SLOT_LABEL[sl]}</b>
                    {locked ? <small><Ico n="lock" /> Unlocks at level {SLOT_UNLOCK[sl]}</small> : it ? (
                      <><span style={{ color: RARITY_COLOR[it.rarity] }}>{it.name}{it.level ? ` +${it.level}` : ''}</span><small><GearLine e={it} /></small></>
                    ) : <small>Empty</small>}
                  </div>
                  {it && <button className="x" onClick={() => unequipSlot(cid, sl)} title="Unequip">✕</button>}
                </div>
              );
            })}
          </div>
          <div className="stat-grid">
            {([['HP', st.maxHp], ['ATK', st.atk], ['DEF', st.def], ['CRIT', `${st.crit}%`], ['MAG', st.mag], ['SPEED', st.speed]] as [string, number | string][]).map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
          </div>
        </div>
        <div className="eq-right">
          <div className="filters">
            <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button>
            {SLOTS.map((sl) => <button key={sl} className={filter === sl ? 'on' : ''} onClick={() => setFilter(sl)}><Ico n={`slot_${sl}`} /> {SLOT_LABEL[sl]}</button>)}
            <span className="muted" style={{ marginLeft: 'auto' }}>{s.inventory.length} items</span>
          </div>
          <div className="inv">
            {inv.length === 0 && <p className="muted">No equipment yet. Enemies, elites, chests and bosses drop gear.</p>}
            {inv.map((e) => {
              const by = equippedBy(e.uid);
              return (
                <div key={e.uid} className="gear" style={{ borderColor: RARITY_COLOR[e.rarity] }}>
                  <div className="gear-head"><span className="ico"><Ico n={`slot_${e.slot}`} /></span>
                    <div><b style={{ color: RARITY_COLOR[e.rarity] }}>{e.name}{e.level ? ` +${e.level}` : ''}</b><small>{RARITY_LABEL[e.rarity]} {SLOT_LABEL[e.slot]}{by ? ` · on ${by.name}` : ''}</small></div></div>
                  <div className="gear-stats"><GearLine e={e} /></div>
                  <div className="row">
                    <Btn kind="gold" disabled={by?.id === cid} onClick={() => msg(equipItem(cid, e.uid), `${e.name} equipped.`)}>{by?.id === cid ? 'Equipped' : 'Equip'}</Btn>
                    <Btn disabled={e.level >= MAX_GEAR_LEVEL || s.gold < upgradeGearCost(e)} onClick={() => msg(upgradeGear(e.uid), 'Upgraded!')}>{e.level >= MAX_GEAR_LEVEL ? 'Max' : <><Ico n="upgrade" /><Ico n="gold" />{upgradeGearCost(e)}</>}</Btn>
                    <Btn kind="ghost" disabled={!!by} onClick={() => { sellGear(e.uid); toast(`Sold for ${sellValue(e)} gold.`); }}>Sell {sellValue(e)}</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}
