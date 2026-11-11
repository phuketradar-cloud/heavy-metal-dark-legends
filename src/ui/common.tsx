import { useEffect, useImperativeHandle, useRef, useState, forwardRef, type CSSProperties, type ReactNode } from 'react';
import { CARDS, CAT_COLOR, CAT_LABEL, MAX_CARD_LEVEL } from '../data/cards';
import { RARITY_COLOR, RARITY_LABEL, STATUS_INFO, type PlayerStats, type Status } from '../engine/types';
import { audio } from '../engine/audio';
import { CardArt } from './art';

/** Painted UI icon (public/icons/ui_<n>.webp), sized to the surrounding text. */
export function Ico({ n }: { n: string }) {
  return <img className="uico" src={`${import.meta.env.BASE_URL}icons/ui_${n}.webp`} alt="" draggable={false} />;
}
/** `n` lit stars followed by empty ones up to `of`. */
export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return <>{Array.from({ length: of }, (_, i) => <Ico key={i} n={i < n ? 'star' : 'star_off'} />)}</>;
}

/** Floating combat text; [[icon]] tokens become painted icons. */
export function FloatText({ text }: { text: string }) {
  return <>{text.split(/\[\[(\w+)\]\]/).map((part, i) => (i % 2 ? <Ico key={i} n={part} /> : part))}</>;
}

export function useFitScale(w = 1600, h = 900) {
  const [s, setS] = useState(1);
  useEffect(() => {
    const f = () => setS(Math.min(window.innerWidth / w, window.innerHeight / h));
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, [w, h]);
  return s;
}

export const click = (name = 'ui') => audio.sfx(name);

export function Btn({ children, onClick, disabled, kind = 'normal', style, title, className = '' }: {
  children: ReactNode; onClick?: () => void; disabled?: boolean; kind?: 'normal' | 'gold' | 'red' | 'ghost'; style?: CSSProperties; title?: string; className?: string;
}) {
  return (
    <button className={`btn btn-${kind} ${className}`} disabled={disabled} title={title} style={style}
      onClick={() => { if (!disabled) { audio.unlock(); click('ui2'); onClick?.(); } }}>
      {children}
    </button>
  );
}

export function Bar({ value, max, kind, label, height = 18, shield = 0 }: { value: number; max: number; kind: 'hp' | 'mp' | 'exp' | 'enemy'; label?: string; height?: number; shield?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`bar bar-${kind}`} style={{ height }}>
      <div className="bar-fill" style={{ width: `${pct}%` }} />
      {shield > 0 && <div className="bar-shield" style={{ width: `${Math.min(100, (shield / max) * 100)}%` }} />}
      <div className="bar-label">{label ?? `${Math.round(value)} / ${Math.round(max)}`}</div>
    </div>
  );
}

export function StatusRow({ list }: { list: Status[] }) {
  return (
    <div className="status-row">
      {list.map((s) => {
        const i = STATUS_INFO[s.id];
        return (
          <div key={s.id} className={`status ${i.bad ? 'bad' : ''}`} title={`${i.name}: ${i.desc} (${s.turns} turn${s.turns > 1 ? 's' : ''})`}>
            <Ico n={`st_${s.id}`} /><b>{s.turns}</b>
          </div>
        );
      })}
    </div>
  );
}

export const DEFAULT_STATS: PlayerStats = {
  maxHp: 250, atk: 22, def: 14, crit: 8, mag: 10, speed: 12, maxMp: 90, critDmg: 1.75, energy: 4,
  elem: { phys: 0, fire: 0, lightning: 0, dark: 0 }, lifesteal: 0, thorns: 0, startShield: 0, mpMul: 1, comboStep: 0,
  eyeHeal: 0, crossMul: 1, turnHeal: 0, defMul: 1,
};

export function CardView({ id, level = 1, onClick, disabled, selected, small, big, stats, count, dim, hotkey, style, locked }: {
  id: string; level?: number; onClick?: () => void; disabled?: boolean; selected?: boolean; small?: boolean; big?: boolean;
  stats?: PlayerStats; count?: number; dim?: boolean; hotkey?: number; style?: CSSProperties; locked?: boolean;
}) {
  const def = CARDS[id];
  const rc = RARITY_COLOR[def.rarity];
  if (locked) {
    return (
      <div className={`card locked ${small ? 'sm' : ''}`} style={style} onClick={onClick}>
        <div className="card-art" style={{ background: '#0c0a12' }}><span style={{ fontSize: 60, opacity: 0.3 }}>?</span></div>
        <div className="card-name">???</div>
        <div className="card-desc">Not yet discovered.</div>
      </div>
    );
  }
  return (
    <div className={`card ${small ? 'sm' : ''} ${big ? 'xl' : ''} ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${dim ? 'dim' : ''} ${def.rarity}`}
      style={{ ['--rc' as string]: rc, ...style }} onClick={onClick}>
      <div className="card-cost">{def.cost}</div>
      {hotkey !== undefined && <div className="card-key">{hotkey}</div>}
      {count !== undefined && count > 1 && <div className="card-count">×{count}</div>}
      <CardArt id={id} />
      <div className="card-name">{def.name}{level > 1 ? <i> <Stars n={level - 1} of={level - 1} /></i> : null}</div>
      <div className="card-cat" style={{ color: CAT_COLOR[def.cat] }}>{CAT_LABEL[def.cat]} · <span style={{ color: rc }}>{RARITY_LABEL[def.rarity]}</span></div>
      <div className="card-desc">{def.text(level, stats ?? DEFAULT_STATS)}</div>
      {level >= MAX_CARD_LEVEL && <div className="card-max">MAX</div>}
    </div>
  );
}

// ───────────── particle canvas ─────────────
export interface FxHandle {
  burst(x: number, y: number, color: string, kind: 'pop' | 'fire' | 'bolt' | 'dark' | 'big'): void;
  bolt(x1: number, y1: number, x2: number, y2: number, color: string): void;
}
interface P { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string; g: number; kind: string }
interface B { pts: [number, number][]; life: number; color: string }

export const Particles = forwardRef<FxHandle, { width: number; height: number }>(function Particles({ width, height }, ref) {
  const cv = useRef<HTMLCanvasElement>(null);
  const parts = useRef<P[]>([]); const bolts = useRef<B[]>([]);
  useImperativeHandle(ref, () => ({
    burst(x, y, color, kind) {
      const n = kind === 'big' ? 22 : kind === 'pop' ? 9 : 14;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2; const sp = (kind === 'big' ? 5 : 3) * (0.4 + Math.random());
        parts.current.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (kind === 'fire' ? 2 : 0), life: 0, max: 24 + Math.random() * 22,
          size: kind === 'big' ? 5 + Math.random() * 5 : 3 + Math.random() * 3, color, g: kind === 'dark' ? -0.02 : 0.12, kind,
        });
      }
    },
    bolt(x1, y1, x2, y2, color) {
      const pts: [number, number][] = [[x1, y1]];
      const n = 9;
      for (let i = 1; i < n; i++) pts.push([x1 + ((x2 - x1) * i) / n + (Math.random() - 0.5) * 60, y1 + ((y2 - y1) * i) / n + (Math.random() - 0.5) * 60]);
      pts.push([x2, y2]);
      bolts.current.push({ pts, life: 14, color });
    },
  }));
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const c = cv.current; const g = c?.getContext('2d');
      if (c && g) {
        g.clearRect(0, 0, c.width, c.height);
        g.globalCompositeOperation = 'lighter';
        parts.current = parts.current.filter((p) => p.life < p.max);
        for (const p of parts.current) {
          p.life++; p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.97;
          const a = 1 - p.life / p.max;
          g.globalAlpha = a; g.fillStyle = p.color;
          g.beginPath(); g.arc(p.x, p.y, p.size * (0.4 + a * 0.6), 0, Math.PI * 2); g.fill();
        }
        bolts.current = bolts.current.filter((b) => b.life > 0);
        for (const b of bolts.current) {
          b.life--; g.globalAlpha = b.life / 14; g.strokeStyle = b.color; g.lineWidth = 4; g.shadowColor = b.color; g.shadowBlur = 18;
          g.beginPath(); b.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
          g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); g.shadowBlur = 0;
        }
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={cv} width={width} height={height} className="particles" />;
});
