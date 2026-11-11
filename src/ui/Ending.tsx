import { CHARS } from '../data/characters';
import { go, useGame } from '../game/store';
import { Embers } from './art';
import { Btn } from './common';

/** Characters that have their own painted ending (others fall back to the Metal Warrior one). */
const ENDING_IMG = new Set(['warrior', 'deathKnight', 'darkPriest', 'guitarist', 'berserker'].filter((id) => ['warrior', 'guitarist', 'deathKnight'].includes(id)));

/** Shown after the final boss falls. */
export function EndingScreen() {
  const g = useGame(); const s = g.save;
  const hero = CHARS[s.activeChar];
  const stars = Object.values(s.stars).reduce((a, b) => a + b, 0);
  return (
    <div className="screen ending">
      <div className="backdrop backdrop-img ending-bg" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}bg/ending-${ENDING_IMG.has(s.activeChar) ? s.activeChar : 'warrior'}.webp)` }} />
      <div className="ending-vignette" />
      <Embers n={22} />
      <div className="ending-text">
        <div className="ending-sub">The Abyss Throne has fallen</div>
        <h1 className="ending-title">VICTORY</h1>
        <div className="ending-sub gold-text">THE DARK LEGEND ENDS · {hero.name.toUpperCase()} PREVAILS</div>
      </div>
      <div className="ending-bottom">
        <div className="ending-stats">
          <span>⚔ {s.stats.wins} victories</span><span>★ {stars} stars</span><span>🃏 {s.deck.length} cards</span><span>🔁 Run #{s.stats.runs}</span>
        </div>
        <div className="row">
          <Btn kind="gold" onClick={() => go('map')}>Return to Map</Btn>
          <Btn onClick={() => go('menu')}>Main Menu</Btn>
        </div>
      </div>
    </div>
  );
}
