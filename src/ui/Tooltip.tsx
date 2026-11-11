import { useEffect, useState } from 'react';

/** Replaces the browser's plain native tooltips with a themed one. Any element with a `title` attribute
 *  (or `data-tip`) gets it; "Name — description" is split into a gold heading and a body line. */
export function Tooltip() {
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    let current: Element | null = null;
    const find = (t: EventTarget | null) => (t instanceof Element ? t.closest('[title],[data-tip]') : null);
    const over = (e: MouseEvent) => {
      const el = find(e.target);
      if (el && el.hasAttribute('title')) { el.setAttribute('data-tip', el.getAttribute('title') ?? ''); el.removeAttribute('title'); }
      current = el;
      const text = el?.getAttribute('data-tip');
      setTip(text ? { text, x: e.clientX, y: e.clientY } : null);
    };
    const move = (e: MouseEvent) => {
      if (!current) return;
      const text = current.getAttribute('data-tip');
      setTip(text ? { text, x: e.clientX, y: e.clientY } : null);
    };
    const hide = () => { current = null; setTip(null); };
    document.addEventListener('mouseover', over);
    document.addEventListener('mousemove', move);
    document.addEventListener('mousedown', hide);
    document.addEventListener('mouseleave', hide);
    return () => {
      document.removeEventListener('mouseover', over); document.removeEventListener('mousemove', move);
      document.removeEventListener('mousedown', hide); document.removeEventListener('mouseleave', hide);
    };
  }, []);

  if (!tip) return null;
  const [head, ...rest] = tip.text.split(' — ');
  const body = rest.join(' — ');
  const W = 320;
  const left = Math.max(8, Math.min(tip.x + 16, window.innerWidth - W - 8));
  const flip = tip.y > window.innerHeight - 140;
  const style = { left, top: flip ? undefined : tip.y + 22, bottom: flip ? window.innerHeight - tip.y + 14 : undefined };
  return (
    <div className="gtip" style={style}>
      {body ? <><b>{head}</b><span>{body}</span></> : <span>{head}</span>}
    </div>
  );
}
