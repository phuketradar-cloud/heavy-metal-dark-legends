import type { ReactNode } from 'react';
import { REGIONS } from '../data/world';
import { go, useGame } from '../game/store';
import { Backdrop, Embers } from './art';
import { Btn, Ico } from './common';

export function ScreenFrame({ title, children, region = 0, back = 'menu', right, bgImage = 'bg/war-hall.webp' }: {
  title: string; children: ReactNode; region?: number; back?: 'menu' | 'map'; right?: ReactNode; bgImage?: string;
}) {
  const g = useGame();
  return (
    <div className="screen">
      {bgImage
        ? <><div className="backdrop backdrop-img" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${bgImage})` }} /><div className="screen-dim-light" /></>
        : <><Backdrop region={REGIONS[region]} /><div className="screen-dim" /></>}
      <Embers n={14} />
      <div className="screen-head">
        <Btn onClick={() => go(back)}>◀ {back === 'map' ? 'Map' : 'Menu'}</Btn>
        <h1>{title}</h1>
        <div className="head-right">{right}<div className="gold"><Ico n="gold" /> {g.save.gold}</div></div>
      </div>
      <div className="screen-body">{children}</div>
    </div>
  );
}
