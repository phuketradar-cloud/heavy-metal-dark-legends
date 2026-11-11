import type { CSSProperties } from 'react';
import type { CharArt } from '../data/characters';
import type { MonsterArt } from '../data/enemies';
import type { Region } from '../data/world';

/** Global SVG symbol sheet. Render once; everything else uses <use href="#ico-…">. */
export function GlobalDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <linearGradient id="gBone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffbea" /><stop offset="1" stopColor="#b9ab8e" /></linearGradient>
        <linearGradient id="gGuitar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff6a3a" /><stop offset="1" stopColor="#a8121c" /></linearGradient>
        <linearGradient id="gBolt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e8faff" /><stop offset="1" stopColor="#2f8dff" /></linearGradient>
        <radialGradient id="gEye" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffffff" /><stop offset=".35" stopColor="#d9a8ff" /><stop offset="1" stopColor="#6a1fc0" /></radialGradient>
        <linearGradient id="gCross" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#baffd2" /><stop offset="1" stopColor="#1f9a52" /></linearGradient>
        <linearGradient id="gAxe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2b8" /><stop offset="1" stopColor="#c98a12" /></linearGradient>
        <linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2f4ff" /><stop offset="1" stopColor="#7a809a" /></linearGradient>
        <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff0b0" /><stop offset="1" stopColor="#d28a10" /></linearGradient>
        <linearGradient id="gFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff3a10" /><stop offset=".6" stopColor="#ff9a2a" /><stop offset="1" stopColor="#fff2a0" /></linearGradient>
        <linearGradient id="gBlood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff5a6a" /><stop offset="1" stopColor="#8a0a1c" /></linearGradient>

        <symbol id="ico-0" viewBox="0 0 100 100">
          <path d="M50 10c-19 0-32 13-32 30 0 11 5 18 13 22v11c0 3 2 6 5 6h28c3 0 5-3 5-6V62c8-4 13-11 13-22 0-17-13-30-32-30z" fill="url(#gBone)" stroke="#5a4a30" strokeWidth="2" />
          <ellipse cx="36" cy="42" rx="9" ry="10" fill="#1a0c14" /><ellipse cx="64" cy="42" rx="9" ry="10" fill="#1a0c14" />
          <circle cx="36" cy="42" r="2.6" fill="#ff4a4a" /><circle cx="64" cy="42" r="2.6" fill="#ff4a4a" />
          <path d="M50 50l-6 11h12z" fill="#1a0c14" />
          <path d="M39 76v9M47 76v9M53 76v9M61 76v9" stroke="#1a0c14" strokeWidth="3" strokeLinecap="round" />
        </symbol>
        <symbol id="ico-1" viewBox="0 0 100 100">
          <g transform="rotate(42 50 50) translate(0 -2)">
            <rect x="45" y="-2" width="10" height="56" rx="2" fill="#f0d29a" stroke="#3a2210" strokeWidth="2" />
            <path d="M41 -6h18l-2 14H43z" fill="url(#gGold)" stroke="#3a2210" strokeWidth="2" />
            <path d="M50 42c-17 0-28 9-26 25 2 16 16 24 26 24s24-8 26-24c2-16-9-25-26-25z" fill="url(#gGuitar)" stroke="#ffe2b0" strokeWidth="3" />
            <path d="M34 56c4-6 10-9 16-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".55" fill="none" />
            <rect x="40" y="63" width="20" height="5" rx="1.5" fill="#15100c" stroke="#ccc" strokeWidth="1" /><rect x="40" y="73" width="20" height="5" rx="1.5" fill="#15100c" stroke="#ccc" strokeWidth="1" />
            <circle cx="62" cy="80" r="2.6" fill="#ffd24a" /><circle cx="66" cy="72" r="2.6" fill="#ffd24a" />
            <path d="M47.5 8v56M52.5 8v56" stroke="#fff" strokeWidth="1" />
          </g>
        </symbol>
        <symbol id="ico-2" viewBox="0 0 100 100">
          <path d="M60 4L22 56h24L36 96 80 40H56z" fill="url(#gBolt)" stroke="#0a3a8a" strokeWidth="2.5" strokeLinejoin="round" />
        </symbol>
        <symbol id="ico-3" viewBox="0 0 100 100">
          <path d="M5 50Q50 8 95 50Q50 92 5 50z" fill="#1a0a2a" stroke="#c88aff" strokeWidth="3" />
          <circle cx="50" cy="50" r="22" fill="url(#gEye)" />
          <ellipse cx="50" cy="50" rx="5" ry="17" fill="#0a0014" />
          <circle cx="44" cy="42" r="4" fill="#fff" opacity=".8" />
        </symbol>
        <symbol id="ico-4" viewBox="0 0 100 100">
          <path d="M36 8h28v28h28v28H64v28H36V64H8V36h28z" fill="url(#gCross)" stroke="#0c4a24" strokeWidth="3" strokeLinejoin="round" />
          <path d="M42 14h16v28h28v16H58v28H42V58H14V42h28z" fill="none" stroke="#e8fff0" strokeWidth="1.5" opacity=".6" />
        </symbol>
        <symbol id="ico-5" viewBox="0 0 100 100">
          <g transform="rotate(-35 50 50)">
            <rect x="47" y="14" width="6" height="84" rx="2" fill="#5a3a1a" />
            <path d="M50 14C24 6 10 22 16 42c14 2 26-2 34-12z" fill="url(#gAxe)" stroke="#6a4208" strokeWidth="2" />
            <path d="M50 14C76 6 90 22 84 42c-14 2-26-2-34-12z" fill="url(#gAxe)" stroke="#6a4208" strokeWidth="2" />
          </g>
          <g transform="rotate(35 50 50)" opacity=".55">
            <rect x="47" y="14" width="6" height="84" rx="2" fill="#5a3a1a" />
          </g>
        </symbol>
        {/* extra card icons */}
        <symbol id="ico-shield" viewBox="0 0 100 100"><path d="M50 6L14 20v28c0 22 16 38 36 46 20-8 36-24 36-46V20z" fill="url(#gSteel)" stroke="#3a3f55" strokeWidth="3" /><path d="M50 16v70c-14-8-26-20-26-38V26z" fill="#ffffff" opacity=".25" /></symbol>
        <symbol id="ico-wings" viewBox="0 0 100 100"><path d="M50 40C40 20 18 14 4 22c6 14 10 26 22 32-8 2-14 2-18 0 6 14 22 22 42 20zM50 40C60 20 82 14 96 22c-6 14-10 26-22 32 8 2 14 2 18 0-6 14-22 22-42 20z" fill="url(#gGold)" stroke="#8a5a08" strokeWidth="2" /><circle cx="50" cy="44" r="10" fill="#fff8d0" /></symbol>
        <symbol id="ico-flame" viewBox="0 0 100 100"><path d="M50 4C60 28 82 38 80 62c-2 20-16 34-30 34S18 82 20 62c1-12 8-18 12-26 4 10 8 12 12 12-4-16 0-34 6-44z" fill="url(#gFlame)" stroke="#8a1a08" strokeWidth="2" /></symbol>
        <symbol id="ico-star" viewBox="0 0 100 100"><path d="M50 4l12 30 32 2-25 20 9 32-28-18-28 18 9-32L6 36l32-2z" fill="url(#gGold)" stroke="#8a5a08" strokeWidth="2.5" strokeLinejoin="round" /></symbol>
        <symbol id="ico-drop" viewBox="0 0 100 100"><path d="M50 6C34 34 20 48 20 64a30 30 0 0060 0C80 48 66 34 50 6z" fill="url(#gBlood)" stroke="#4a0410" strokeWidth="3" /><ellipse cx="40" cy="62" rx="6" ry="10" fill="#fff" opacity=".3" /></symbol>
        <symbol id="ico-sword" viewBox="0 0 100 100"><g transform="rotate(45 50 50)"><path d="M50 2l7 12v54H43V14z" fill="url(#gSteel)" stroke="#3a3f55" strokeWidth="2" /><rect x="30" y="68" width="40" height="7" rx="3" fill="url(#gGold)" /><rect x="46" y="75" width="8" height="18" fill="#4a2a14" /></g></symbol>
        <symbol id="ico-meteor" viewBox="0 0 100 100"><path d="M90 6L40 50" stroke="url(#gFlame)" strokeWidth="14" strokeLinecap="round" opacity=".7" /><circle cx="36" cy="62" r="26" fill="#5a3a2a" stroke="#ff7a2a" strokeWidth="4" /><circle cx="28" cy="56" r="6" fill="#2a1a12" /><circle cx="46" cy="70" r="5" fill="#2a1a12" /></symbol>
        <symbol id="ico-horns" viewBox="0 0 100 100"><path d="M18 14c-6 24 0 44 14 56l4-8C28 52 24 34 28 20zM82 14c6 24 0 44-14 56l-4-8c8-10 12-28 8-42z" fill="url(#gBone)" stroke="#5a4a30" strokeWidth="2" /><ellipse cx="50" cy="66" rx="20" ry="22" fill="#8a1a1a" stroke="#2a0606" strokeWidth="2" /><circle cx="42" cy="62" r="3.5" fill="#ffd24a" /><circle cx="58" cy="62" r="3.5" fill="#ffd24a" /><path d="M42 76q8 6 16 0" stroke="#1a0404" strokeWidth="3" fill="none" /></symbol>
        <symbol id="ico-hourglass" viewBox="0 0 100 100"><path d="M24 8h52v10c0 18-14 24-14 32s14 14 14 32v10H24V82c0-18 14-24 14-32S24 36 24 18z" fill="#bfe8ff" opacity=".6" stroke="#4aa8ff" strokeWidth="4" /><path d="M32 82h36c-4-8-18-14-18-14s-14 6-18 14z" fill="#ffd24a" /></symbol>
        <symbol id="ico-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="34" fill="none" stroke="url(#gGold)" strokeWidth="9" /><circle cx="50" cy="50" r="18" fill="none" stroke="#ff7a2a" strokeWidth="5" strokeDasharray="10 6" /><circle cx="50" cy="16" r="7" fill="#fff0b0" /></symbol>
        <symbol id="ico-heart" viewBox="0 0 100 100"><path d="M50 90C16 62 6 42 18 24c10-14 28-10 32 4 4-14 22-18 32-4 12 18 2 38-32 66z" fill="url(#gBlood)" stroke="#4a0410" strokeWidth="3" /></symbol>
        <symbol id="ico-crystal" viewBox="0 0 100 100"><path d="M50 4l28 30-28 62L22 34z" fill="url(#gBolt)" stroke="#0a3a8a" strokeWidth="3" strokeLinejoin="round" /><path d="M50 4l-6 30 6 62M22 34h56" stroke="#fff" strokeWidth="1.5" opacity=".6" fill="none" /></symbol>
        <symbol id="ico-target" viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="none" stroke="#ff5a4a" strokeWidth="5" /><circle cx="50" cy="50" r="22" fill="none" stroke="#ff5a4a" strokeWidth="5" /><circle cx="50" cy="50" r="7" fill="#ffd24a" /><path d="M50 2v22M50 76v22M2 50h22M76 50h22" stroke="#ffd24a" strokeWidth="5" /></symbol>
        <symbol id="ico-chain" viewBox="0 0 100 100"><g fill="none" stroke="url(#gSteel)" strokeWidth="9"><rect x="8" y="34" width="44" height="28" rx="14" /><rect x="48" y="38" width="44" height="28" rx="14" /></g></symbol>
        <symbol id="ico-demon" viewBox="0 0 100 100"><path d="M14 6c4 20 10 28 22 32M86 6c-4 20-10 28-22 32" stroke="#6a0a1a" strokeWidth="8" strokeLinecap="round" fill="none" /><path d="M50 16c-22 0-34 16-30 36 4 20 18 34 30 40 12-6 26-20 30-40 4-20-8-36-30-36z" fill="#b01c2a" stroke="#2a0408" strokeWidth="3" /><path d="M30 44l16 6-16 6zM70 44L54 50l16 6z" fill="#ffd24a" /><path d="M36 74q14 12 28 0" stroke="#1a0204" strokeWidth="4" fill="none" /></symbol>
      </defs>
    </svg>
  );
}

export const TILE_BG = [
  'radial-gradient(circle at 35% 30%, #5c5a66 0%, #2a2832 70%)',
  'radial-gradient(circle at 35% 30%, #a42a2a 0%, #3a0c10 72%)',
  'radial-gradient(circle at 35% 30%, #2a5ec8 0%, #0c1c4a 72%)',
  'radial-gradient(circle at 35% 30%, #7a2ac8 0%, #240c4a 72%)',
  'radial-gradient(circle at 35% 30%, #1f8a4a 0%, #08301c 72%)',
  'radial-gradient(circle at 35% 30%, #b8860a 0%, #3a2804 72%)',
];
/** Optional painted full-tile artwork per tile type (index = tile type). null falls back to the SVG icon. */
export const TILE_IMG: (string | null)[] = ['tiles/tile0.webp', 'tiles/tile1.webp', 'tiles/tile2.webp', 'tiles/tile3.webp', 'tiles/tile4.webp', 'tiles/tile5.webp'];
/** Optional painted skill-button medallions (null falls back to the SVG icon). Ultimates are per character id. */
export const SKILL_IMG: { shuffle: string | null; focus: string | null; ult: Record<string, string | null> } = {
  shuffle: 'skills/shuffle.webp', focus: 'skills/focus.webp',
  ult: { warrior: 'skills/ult_warrior.webp', deathKnight: 'skills/ult_deathKnight.webp', darkPriest: 'skills/ult_darkPriest.webp', guitarist: 'skills/ult_guitarist.webp', berserker: 'skills/ult_berserker.webp' },
};
/** Optional painted map-node icons (kind -> file in /public). Missing kinds fall back to the emoji. */
export const NODE_IMG: Record<string, string> = {
  battle: 'icons/node_battle.webp',
  event: 'icons/node_event.webp',
  treasure: 'icons/node_treasure.webp',
  elite: 'icons/node_elite.webp',
  boss: 'icons/node_boss.webp',
  cleared: 'icons/node_cleared.webp',
};
export const TILE_RIM = ['#cfc8b8', '#ff6a4a', '#5ab4ff', '#c488ff', '#5aeb8a', '#ffd04a'];

export function Icon({ id, size = 24, style }: { id: string; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 100 100" style={style}><use href={`#ico-${id}`} /></svg>;
}

// ───────────── Card art ─────────────
const CARD_ART: Record<string, { icons: string[]; bg: [string, string] }> = {
  thunderStrike: { icons: ['2'], bg: ['#2a6aff', '#08143a'] },
  rageGuitar: { icons: ['1', 'flame'], bg: ['#ff4a2a', '#3a0808'] },
  bloodSlash: { icons: ['sword', 'drop'], bg: ['#c8182a', '#2a0408'] },
  infernalExplosion: { icons: ['flame', 'meteor'], bg: ['#ff7a1a', '#3a0c04'] },
  deathSentence: { icons: ['0', 'sword'], bg: ['#8a1ad0', '#12041f'] },
  divineShield: { icons: ['shield', 'wings'], bg: ['#e8c040', '#3a2804'] },
  ironWall: { icons: ['shield'], bg: ['#7a8098', '#14161f'] },
  darkBarrier: { icons: ['shield', '3'], bg: ['#7a2ad0', '#12041f'] },
  counterAttack: { icons: ['sword', 'shield'], bg: ['#d84a3a', '#2a0a08'] },
  holyBlessing: { icons: ['4', 'wings'], bg: ['#4ae88a', '#04281a'] },
  manaRecovery: { icons: ['crystal'], bg: ['#3aa8ff', '#04142a'] },
  battleCry: { icons: ['horns'], bg: ['#e8a030', '#2a1604'] },
  criticalBoost: { icons: ['target', '5'], bg: ['#ff5a3a', '#2a0a06'] },
  comboAmplifier: { icons: ['ring', '2'], bg: ['#ffb02e', '#2a1804'] },
  soulDrain: { icons: ['3', 'drop'], bg: ['#a43af0', '#12041f'] },
  shadowCurse: { icons: ['3', '0'], bg: ['#6a1ac0', '#0c0214'] },
  meteorStorm: { icons: ['meteor', 'flame'], bg: ['#ff5a1a', '#2a0804'] },
  demonSummoning: { icons: ['demon'], bg: ['#c8182a', '#14020a'] },
  berserkerSoul: { icons: ['horns', '5'], bg: ['#d83a1a', '#2a0804'] },
  eternalRage: { icons: ['flame', 'ring'], bg: ['#ff3a1a', '#2a0604'] },
  metalResonance: { icons: ['1', '2'], bg: ['#3ac0e8', '#04202a'] },
  darkFortune: { icons: ['star', '3'], bg: ['#8a3af0', '#10041f'] },
  bloodPact: { icons: ['heart', 'drop'], bg: ['#c8182a', '#200408'] },
};

/** Optional painted card illustrations (card id -> file in /public/cards). Missing ids fall back to the SVG art. */
export const CARD_IMG: Record<string, string> = {
  thunderStrike: 'cards/thunderStrike.webp',
  rageGuitar: 'cards/rageGuitar.webp',
  bloodSlash: 'cards/bloodSlash.webp',
  infernalExplosion: 'cards/infernalExplosion.webp',
  deathSentence: 'cards/deathSentence.webp',
  divineShield: 'cards/divineShield.webp',
  ironWall: 'cards/ironWall.webp',
  darkBarrier: 'cards/darkBarrier.webp',
  counterAttack: 'cards/counterAttack.webp',
  holyBlessing: 'cards/holyBlessing.webp',
  manaRecovery: 'cards/manaRecovery.webp',
  battleCry: 'cards/battleCry.webp',
  criticalBoost: 'cards/criticalBoost.webp',
  comboAmplifier: 'cards/comboAmplifier.webp',
  soulDrain: 'cards/soulDrain.webp',
  shadowCurse: 'cards/shadowCurse.webp',
  meteorStorm: 'cards/meteorStorm.webp',
  demonSummoning: 'cards/demonSummoning.webp',
  berserkerSoul: 'cards/berserkerSoul.webp',
  eternalRage: 'cards/eternalRage.webp',
  metalResonance: 'cards/metalResonance.webp',
  darkFortune: 'cards/darkFortune.webp',
  bloodPact: 'cards/bloodPact.webp',
};

export function CardArt({ id }: { id: string }) {
  if (CARD_IMG[id]) return <div className="card-art"><img className="card-img" src={`${import.meta.env.BASE_URL}${CARD_IMG[id]}`} alt="" draggable={false} /></div>;
  const a = CARD_ART[id] ?? { icons: ['star'], bg: ['#666', '#111'] };
  return (
    <div className="card-art" style={{ background: `radial-gradient(circle at 50% 38%, ${a.bg[0]} 0%, ${a.bg[1]} 78%)` }}>
      <div className="card-rays" />
      <Icon id={a.icons[0]} size={84} style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,.55))', position: 'relative' }} />
      {a.icons[1] && <Icon id={a.icons[1]} size={40} style={{ position: 'absolute', right: 6, bottom: 6, filter: 'drop-shadow(0 0 6px #000)' }} />}
    </div>
  );
}

// ───────────── Humanoid fighters (players + monsters) ─────────────
interface HumanoidProps {
  skin: string; armor1: string; armor2: string; accent: string; cape: string; hair: string;
  head: string; weapon: string; glow: string; bulk?: number; monster?: boolean;
}
function Humanoid(p: HumanoidProps) {
  const b = p.bulk ?? 1;
  const hx = 150;
  const headY = 92;
  return (
    <svg viewBox="0 0 300 520" className="fighter-svg">
      <defs>
        <linearGradient id={`ar-${p.armor1}${p.armor2}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.armor2} /><stop offset="1" stopColor={p.armor1} />
        </linearGradient>
        <radialGradient id={`gl-${p.glow}`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor={p.glow} stopOpacity=".55" /><stop offset="1" stopColor={p.glow} stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="150" cy="500" rx="130" ry="22" fill="#000" opacity=".5" />
      <ellipse cx="150" cy="300" rx="150" ry="230" fill={`url(#gl-${p.glow})`} opacity=".35" />
      {/* cape */}
      <path d={`M${110 - 10 * b} 140 C${40 - 20 * b} 220 ${30 - 10 * b} 380 ${20} 480 L${120} 470 C${130} 380 ${120} 250 ${190 + 6 * b} 150 Z`} fill={p.cape} stroke="#000" strokeOpacity=".5" strokeWidth="2" />
      <path d="M90 190C70 280 60 380 50 470M110 170C100 270 90 380 80 475" stroke="#000" strokeOpacity=".35" strokeWidth="3" fill="none" />
      {/* back arm */}
      <path d={`M${104 - 6 * b} 150 C${76 - 10 * b} 190 ${70 - 8 * b} 230 ${88} 275`} stroke={`url(#ar-${p.armor1}${p.armor2})`} strokeWidth={26 * b} strokeLinecap="round" fill="none" />
      <circle cx="90" cy="280" r={13 * b} fill={p.monster ? p.skin : p.armor1} stroke="#000" strokeOpacity=".5" />
      {/* legs */}
      <path d={`M${128} 270 L${112 - 4 * b} 480`} stroke={`url(#ar-${p.armor1}${p.armor2})`} strokeWidth={38 * b} strokeLinecap="round" />
      <path d={`M${172} 270 L${196 + 4 * b} 480`} stroke={`url(#ar-${p.armor1}${p.armor2})`} strokeWidth={38 * b} strokeLinecap="round" />
      <path d={`M${96 - 6 * b} 478h${44 + 8 * b}l8 18h-${60 + 10 * b}z M${178 - 4 * b} 478h${50 + 8 * b}l8 18h-${66 + 10 * b}z`} fill={p.armor1} stroke={p.accent} strokeWidth="2" />
      <path d="M118 380l-18 10 12 4zM188 380l20 10-14 4z" fill={p.accent} />
      {/* torso */}
      <path d={`M${96 - 8 * b} 138 L${204 + 8 * b} 138 L${188 + 4 * b} 262 L${112 - 4 * b} 262 Z`} fill={`url(#ar-${p.armor1}${p.armor2})`} stroke="#000" strokeOpacity=".6" strokeWidth="2" />
      <path d="M150 140v120M120 170h60M124 205h52" stroke="#000" strokeOpacity=".35" strokeWidth="3" fill="none" />
      <circle cx="150" cy="190" r="9" fill={p.glow} stroke="#000" strokeOpacity=".5" />
      <rect x="108" y="256" width="84" height="16" rx="4" fill={p.armor1} stroke={p.accent} strokeWidth="2" />
      <circle cx="150" cy="264" r="7" fill={p.accent} />
      <path d="M114 272h72l-10 34h-52z" fill={p.armor1} stroke="#000" strokeOpacity=".5" />
      {/* pauldrons */}
      <path d={`M${88 - 10 * b} 150 q-6 -34 36 -24 l4 34z`} fill={p.armor2} stroke="#000" strokeOpacity=".6" strokeWidth="2" />
      <path d={`M${212 + 10 * b} 150 q6 -34 -36 -24 l-4 34z`} fill={p.armor2} stroke="#000" strokeOpacity=".6" strokeWidth="2" />
      <path d={`M${80 - 10 * b} 134l-12 -26 22 14zM${220 + 10 * b} 134l12 -26 -22 14z`} fill={p.accent} />
      {/* head */}
      <rect x="140" y="112" width="20" height="28" fill={p.skin} />
      {renderHead(p, hx, headY)}
      {/* front arm */}
      <path d={`M${196 + 6 * b} 150 C${226 + 10 * b} 186 ${232} 232 ${222} 282`} stroke={`url(#ar-${p.armor1}${p.armor2})`} strokeWidth={28 * b} strokeLinecap="round" fill="none" />
      {/* weapon */}
      {renderWeapon(p)}
      <circle cx="222" cy="288" r={14 * b} fill={p.monster ? p.skin : p.armor1} stroke={p.accent} strokeWidth="2" />
    </svg>
  );
}

function renderHead(p: HumanoidProps, x: number, y: number) {
  const eyes = (dy = 0, c = p.glow) => (<g><ellipse cx={x - 10} cy={y + dy} rx="5" ry="3" fill={c} /><ellipse cx={x + 10} cy={y + dy} rx="5" ry="3" fill={c} /></g>);
  const face = <ellipse cx={x} cy={y} rx="27" ry="31" fill={p.skin} stroke="#000" strokeOpacity=".5" strokeWidth="2" />;
  switch (p.head) {
    case 'hair':
      return (<g>
        <path d={`M${x - 30} ${y - 10} C${x - 70} ${y + 80} ${x - 60} ${y + 180} ${x - 90} ${y + 230} C${x - 20} ${y + 190} ${x - 20} ${y + 80} ${x - 22} ${y + 20}z`} fill={p.hair} />
        {face}
        <path d={`M${x - 30} ${y} C${x - 34} ${y - 40} ${x + 20} ${y - 50} ${x + 30} ${y - 6} C${x + 10} ${y - 24} ${x - 12} ${y - 20} ${x - 30} ${y}z`} fill={p.hair} />
        {eyes(2, '#ff3a4a')}<path d={`M${x - 8} ${y + 18}q8 5 16 0`} stroke="#7a1a22" strokeWidth="2.5" fill="none" />
      </g>);
    case 'mohawk':
      return (<g>
        <path d={`M${x - 14} ${y - 26} l-8 -34 14 18 l6 -40 10 38 l12 -24 -4 40z`} fill={p.hair} stroke="#000" strokeOpacity=".4" />
        {face}{eyes(2, '#fff')}<rect x={x - 22} y={y - 4} width="44" height="10" rx="5" fill="#111" opacity=".85" />
        <path d={`M${x - 8} ${y + 18}q8 4 16 0`} stroke="#6a1a22" strokeWidth="2.5" fill="none" />
      </g>);
    case 'helm':
      return (<g>
        <path d={`M${x - 32} ${y + 30} L${x - 32} ${y - 6} C${x - 32} ${y - 44} ${x + 32} ${y - 44} ${x + 32} ${y - 6} L${x + 32} ${y + 30} Z`} fill={`url(#ar-${p.armor1}${p.armor2})`} stroke="#000" strokeOpacity=".6" strokeWidth="2" />
        <rect x={x - 26} y={y - 8} width="52" height="9" rx="3" fill="#0a0a0a" />
        <ellipse cx={x - 10} cy={y - 4} rx="5" ry="2.5" fill={p.glow} /><ellipse cx={x + 10} cy={y - 4} rx="5" ry="2.5" fill={p.glow} />
        <path d={`M${x} ${y - 44} L${x - 6} ${y - 70} L${x + 6} ${y - 70}z`} fill={p.accent} />
        <path d={`M${x - 24} ${y + 12}h48M${x - 20} ${y + 22}h40`} stroke="#000" strokeOpacity=".5" strokeWidth="2" />
      </g>);
    case 'hood':
      return (<g>
        <path d={`M${x - 42} ${y + 50} C${x - 52} ${y - 40} ${x - 10} ${y - 66} ${x + 4} ${y - 62} C${x + 44} ${y - 54} ${x + 50} ${y} ${x + 40} ${y + 50} Z`} fill={p.armor1} stroke={p.accent} strokeWidth="2" />
        <ellipse cx={x} cy={y + 2} rx="24" ry="28" fill="#06040a" />
        {eyes(0)}<path d={`M${x - 10} ${y + 16}q10 6 20 0`} stroke={p.glow} strokeOpacity=".5" strokeWidth="2" fill="none" />
      </g>);
    case 'horns':
      return (<g>
        <path d={`M${x - 24} ${y - 14} C${x - 70} ${y - 20} ${x - 60} ${y - 80} ${x - 56} ${y - 84} C${x - 50} ${y - 50} ${x - 30} ${y - 40} ${x - 20} ${y - 34}z M${x + 24} ${y - 14} C${x + 70} ${y - 20} ${x + 60} ${y - 80} ${x + 56} ${y - 84} C${x + 50} ${y - 50} ${x + 30} ${y - 40} ${x + 20} ${y - 34}z`} fill="url(#gBone)" stroke="#5a4a30" />
        <path d={`M${x - 34} ${y} C${x - 80} ${y + 60} ${x - 70} ${y + 140} ${x - 96} ${y + 190} C${x - 30} ${y + 150} ${x - 26} ${y + 70} ${x - 24} ${y + 24}z`} fill={p.hair} />
        {face}
        <path d={`M${x - 30} ${y - 4} C${x - 30} ${y - 40} ${x + 30} ${y - 40} ${x + 30} ${y - 4} C${x + 10} ${y - 20} ${x - 10} ${y - 20} ${x - 30} ${y - 4}z`} fill={p.hair} />
        {eyes(2, '#ffcc22')}<path d={`M${x - 14} ${y + 16}q14 10 28 0`} stroke="#4a0a0a" strokeWidth="3" fill="none" />
        <path d={`M${x - 22} ${y + 6}l10 4M${x + 22} ${y + 6}l-10 4`} stroke="#b01c1c" strokeWidth="3" />
      </g>);
    case 'skull':
      return (<g>
        <ellipse cx={x} cy={y} rx="28" ry="32" fill="url(#gBone)" stroke="#5a4a30" strokeWidth="2" />
        <ellipse cx={x - 11} cy={y} rx="9" ry="10" fill="#0a0408" /><ellipse cx={x + 11} cy={y} rx="9" ry="10" fill="#0a0408" />
        <circle cx={x - 11} cy={y} r="3.5" fill={p.glow} /><circle cx={x + 11} cy={y} r="3.5" fill={p.glow} />
        <path d={`M${x} ${y + 8}l-5 10h10z`} fill="#0a0408" /><path d={`M${x - 14} ${y + 24}v10M${x - 5} ${y + 24}v12M${x + 5} ${y + 24}v12M${x + 14} ${y + 24}v10`} stroke="#3a2a1a" strokeWidth="3" />
      </g>);
    case 'crown':
      return (<g>
        <ellipse cx={x} cy={y} rx="28" ry="32" fill="url(#gBone)" stroke="#5a4a30" strokeWidth="2" />
        <ellipse cx={x - 11} cy={y} rx="9" ry="10" fill="#0a0408" /><ellipse cx={x + 11} cy={y} rx="9" ry="10" fill="#0a0408" />
        <circle cx={x - 11} cy={y} r="3.5" fill={p.glow} /><circle cx={x + 11} cy={y} r="3.5" fill={p.glow} />
        <path d={`M${x - 30} ${y - 26}l8 -34 14 22 8 -30 8 30 14 -22 8 34z`} fill="url(#gGold)" stroke="#8a5a08" strokeWidth="2" />
        <path d={`M${x} ${y + 8}l-5 10h10z`} fill="#0a0408" />
      </g>);
    case 'horned':
    case 'demon':
    default:
      return (<g>
        <path d={`M${x - 20} ${y - 22} C${x - 70} ${y - 30} ${x - 78} ${y - 90} ${x - 62} ${y - 110} C${x - 56} ${y - 70} ${x - 36} ${y - 54} ${x - 16} ${y - 40}z M${x + 20} ${y - 22} C${x + 70} ${y - 30} ${x + 78} ${y - 90} ${x + 62} ${y - 110} C${x + 56} ${y - 70} ${x + 36} ${y - 54} ${x + 16} ${y - 40}z`} fill="url(#gBone)" stroke="#3a2a1a" strokeWidth="2" />
        <ellipse cx={x} cy={y} rx="30" ry="33" fill={p.skin} stroke="#000" strokeOpacity=".6" strokeWidth="2" />
        <path d={`M${x - 24} ${y - 8}l16 8 -16 6zM${x + 24} ${y - 8}l-16 8 16 6z`} fill={p.glow} />
        <path d={`M${x - 18} ${y + 16}q18 14 36 0l-4 12h-28z`} fill="#1a0404" /><path d={`M${x - 12} ${y + 17}l3 8 3-8zM${x + 12} ${y + 17}l-3 8 -3 -8z`} fill="#fff" />
        <path d={`M${x - 8} ${y + 4}l8 -6 8 6`} stroke="#000" strokeOpacity=".5" strokeWidth="2" fill="none" />
      </g>);
  }
}

function renderWeapon(p: HumanoidProps) {
  const hx = 222, hy = 288;
  switch (p.weapon) {
    case 'sword':
      return (<g>
        <path d={`M${hx - 6} ${hy - 12} L${hx + 4} ${hy - 12} L${hx + 52} ${hy - 250} L${hx + 40} ${hy - 262}z`} fill="url(#gSteel)" stroke="#2a2f45" strokeWidth="2" />
        <path d={`M${hx - 24} ${hy - 20} L${hx + 24} ${hy - 6} L${hx + 22} ${hy - 14} L${hx - 22} ${hy - 28}z`} fill={p.accent} stroke="#000" strokeOpacity=".5" />
        <rect x={hx - 7} y={hy - 4} width="12" height="40" rx="4" fill="#2a1710" transform={`rotate(12 ${hx} ${hy})`} />
      </g>);
    case 'greatsword':
      return (<g>
        <path d={`M${hx - 10} ${hy - 12} L${hx + 10} ${hy - 12} L${hx + 70} ${hy - 330} L${hx + 40} ${hy - 346}z`} fill="url(#gSteel)" stroke="#1a1f35" strokeWidth="2" />
        <path d={`M${hx + 30} ${hy - 80} L${hx + 52} ${hy - 300}`} stroke={p.glow} strokeWidth="3" opacity=".8" />
        <path d={`M${hx - 34} ${hy - 18} L${hx + 34} ${hy - 2} L${hx + 30} ${hy - 14} L${hx - 30} ${hy - 32}z`} fill={p.armor1} stroke={p.accent} strokeWidth="2" />
        <rect x={hx - 8} y={hy - 4} width="14" height="48" rx="4" fill="#15151c" transform={`rotate(12 ${hx} ${hy})`} />
      </g>);
    case 'staff':
      return (<g>
        <rect x={hx - 4} y={hy - 300} width="9" height="400" rx="4" fill="#3a2a1a" stroke="#000" strokeOpacity=".4" />
        <circle cx={hx} cy={hy - 306} r="26" fill={p.glow} opacity=".25" />
        <circle cx={hx} cy={hy - 306} r="15" fill={p.glow} stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
        <path d={`M${hx - 24} ${hy - 312} q-10 -34 14 -40 M${hx + 24} ${hy - 312} q10 -34 -14 -40`} stroke={p.accent} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>);
    case 'guitar':
      return (<g transform={`rotate(-24 ${hx - 40} ${hy - 20})`}>
        <rect x={hx - 40} y={hy - 200} width="12" height="190" rx="3" fill="#2a1710" />
        <path d={`M${hx - 46} ${hy - 204}h24l-2 -24h-20z`} fill="url(#gGold)" />
        <path d={`M${hx - 34} ${hy - 30} C${hx - 110} ${hy - 50} ${hx - 120} ${hy + 50} ${hx - 80} ${hy + 70} C${hx - 40} ${hy + 90} ${hx + 20} ${hy + 60} ${hx + 20} ${hy + 20} C${hx + 20} ${hy - 10} ${hx - 10} ${hy - 26} ${hx - 34} ${hy - 30}z`} fill="url(#gGuitar)" stroke="#2a0606" strokeWidth="3" />
        <rect x={hx - 62} y={hy + 6} width="48" height="10" rx="3" fill="#111" /><rect x={hx - 62} y={hy + 28} width="48" height="10" rx="3" fill="#111" />
        <path d={`M${hx - 38} ${hy - 190}V${hy + 20}`} stroke="#ddd" strokeWidth="1.2" />
      </g>);
    case 'axe':
      return (<g>
        <path d={`M${hx - 40} ${hy + 60} L${hx + 40} ${hy - 260}`} stroke="#4a2a14" strokeWidth="10" strokeLinecap="round" />
        <path d={`M${hx + 36} ${hy - 250} C${hx + 120} ${hy - 300} ${hx + 140} ${hy - 200} ${hx + 90} ${hy - 150} C${hx + 70} ${hy - 170} ${hx + 50} ${hy - 190} ${hx + 36} ${hy - 200}z`} fill="url(#gSteel)" stroke="#2a2f45" strokeWidth="2" />
        <path d={`M${hx + 44} ${hy - 244} C${hx - 20} ${hy - 310} ${hx - 40} ${hy - 240} ${hx + 10} ${hy - 190}z`} fill="url(#gSteel)" stroke="#2a2f45" strokeWidth="2" />
        <circle cx={hx + 40} cy={hy - 226} r="8" fill={p.glow} />
      </g>);
    case 'mace':
      return (<g>
        <path d={`M${hx - 10} ${hy + 50} L${hx + 30} ${hy - 250}`} stroke="#2a1a12" strokeWidth="12" strokeLinecap="round" />
        <circle cx={hx + 32} cy={hy - 270} r="34" fill={p.armor1} stroke={p.accent} strokeWidth="3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d="M-6 -30L0 -52L6 -30z" transform={`translate(${hx + 32} ${hy - 270}) rotate(${a})`} fill={p.armor2} stroke="#000" strokeOpacity=".5" />)}
        <circle cx={hx + 32} cy={hy - 270} r="9" fill={p.glow} />
      </g>);
    default: return null;
  }
}

export function PlayerArt({ art }: { art: CharArt }) {
  if (art.img) return <img className="fighter-img" src={`${import.meta.env.BASE_URL}${art.img}`} alt="" draggable={false} />;
  return <Humanoid {...art} />;
}

// ───────────── Monsters ─────────────
function Hound(p: MonsterArt) {
  return (
    <svg viewBox="0 0 360 420" className="fighter-svg">
      <defs>
        <radialGradient id={`hg-${p.glow}`}><stop offset="0" stopColor={p.glow} stopOpacity=".5" /><stop offset="1" stopColor={p.glow} stopOpacity="0" /></radialGradient>
        <linearGradient id={`hb-${p.c1}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.c1} /><stop offset="1" stopColor={p.c2} /></linearGradient>
      </defs>
      <ellipse cx="180" cy="396" rx="150" ry="18" fill="#000" opacity=".5" />
      <ellipse cx="180" cy="230" rx="170" ry="170" fill={`url(#hg-${p.glow})`} />
      <path d="M300 230C350 210 360 150 340 110C330 160 310 190 280 200z" fill={p.c2} stroke="#000" strokeOpacity=".6" />
      <path d="M96 340l-14 56h30l8-50zM150 350l-6 46h30l6-48zM220 350l4 46h30l-2-48zM266 336l12 60h30l-18-66z" fill={p.c2} stroke="#000" strokeOpacity=".6" strokeWidth="2" />
      <path d="M86 230C80 170 150 140 230 150C300 156 330 210 300 290C270 340 130 350 100 310C90 290 86 260 86 230z" fill={`url(#hb-${p.c1})`} stroke="#000" strokeOpacity=".7" strokeWidth="3" />
      <path d="M120 160l-6 -50 28 40zM170 146l2 -58 26 52zM220 148l12 -56 20 60zM268 168l24 -44 8 56z" fill={p.c2} stroke={p.glow} strokeWidth="2" />
      <path d="M150 230C200 214 260 230 290 270M130 270C190 250 250 270 280 304" stroke="#000" strokeOpacity=".35" strokeWidth="5" fill="none" />
      {/* head */}
      <path d="M86 200C40 190 14 214 16 250C18 280 50 292 90 280C110 270 120 240 118 210z" fill={`url(#hb-${p.c1})`} stroke="#000" strokeOpacity=".7" strokeWidth="3" />
      <path d="M92 168l-18 -62 40 40zM120 176l6 -62 24 52z" fill="url(#gBone)" stroke="#3a2a1a" strokeWidth="2" />
      <path d="M26 262Q60 292 100 270" stroke="#000" strokeWidth="3" fill="none" />
      <path d="M32 266l6 22 8-18zM56 276l6 22 8-20zM82 274l6 20 6-20z" fill="#fff" stroke="#000" strokeOpacity=".5" />
      <path d="M52 228l30 8-6 -18z" fill={p.glow} /><circle cx="72" cy="232" r="4" fill="#fff" />
      <ellipse cx="22" cy="246" rx="6" ry="4" fill="#000" />
    </svg>
  );
}

function Dragon(p: MonsterArt) {
  return (
    <svg viewBox="0 0 460 460" className="fighter-svg">
      <defs>
        <radialGradient id={`dg-${p.glow}`}><stop offset="0" stopColor={p.glow} stopOpacity=".5" /><stop offset="1" stopColor={p.glow} stopOpacity="0" /></radialGradient>
        <linearGradient id={`db-${p.c1}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.c1} /><stop offset="1" stopColor={p.c2} /></linearGradient>
      </defs>
      <ellipse cx="230" cy="436" rx="190" ry="20" fill="#000" opacity=".5" />
      <ellipse cx="240" cy="240" rx="220" ry="210" fill={`url(#dg-${p.glow})`} />
      {/* wings */}
      <path d="M270 190C300 90 380 40 450 30C430 70 424 100 436 130C410 124 394 130 384 150C380 170 372 186 350 200C330 180 300 180 270 190z" fill={p.c2} stroke={p.glow} strokeWidth="2.5" />
      <path d="M270 190C320 140 380 100 440 40M300 180C340 150 390 130 420 128" stroke="#000" strokeOpacity=".5" strokeWidth="3" fill="none" />
      {/* tail */}
      <path d="M330 330C400 340 440 300 450 250C420 290 380 300 330 290z" fill={`url(#db-${p.c1})`} stroke="#000" strokeOpacity=".6" strokeWidth="2" />
      {/* legs */}
      <path d="M200 360l-24 70h40l18 -66zM300 350l8 82h40l-20 -88z" fill={p.c2} stroke="#000" strokeOpacity=".6" strokeWidth="2" />
      {/* body */}
      <path d="M160 200C150 140 230 130 300 170C370 210 370 320 300 360C240 392 150 360 150 300C150 260 160 230 160 200z" fill={`url(#db-${p.c1})`} stroke="#000" strokeOpacity=".7" strokeWidth="3" />
      <path d="M190 300C230 330 290 330 330 290M200 260C240 290 290 290 330 250" stroke="#000" strokeOpacity=".3" strokeWidth="4" fill="none" />
      <path d="M180 200l-4 -40 26 30zM220 176l2 -48 24 40zM264 170l12 -46 14 52z" fill={p.c2} stroke={p.glow} strokeWidth="2" />
      {/* neck + head */}
      <path d="M170 200C140 160 100 150 80 130C70 150 90 180 130 220z" fill={`url(#db-${p.c1})`} stroke="#000" strokeOpacity=".7" strokeWidth="3" />
      <path d="M100 150C60 110 20 126 14 160C10 186 40 200 82 196C110 192 126 170 120 150z" fill={`url(#db-${p.c1})`} stroke="#000" strokeOpacity=".7" strokeWidth="3" />
      <path d="M84 126C66 80 70 40 90 18C96 54 110 84 118 104z M110 128C106 86 120 54 140 38C138 72 134 100 128 120z" fill="url(#gBone)" stroke="#3a2a1a" strokeWidth="2" />
      <path d="M22 176Q54 194 98 182" stroke="#000" strokeWidth="3" fill="none" />
      <path d="M30 178l5 18 8-14zM54 188l6 18 8-16zM80 186l5 16 6-16z" fill="#fff" stroke="#000" strokeOpacity=".5" />
      <path d="M52 146l26 8-4-16z" fill={p.glow} /><circle cx="64" cy="147" r="3.5" fill="#fff" />
      <path d="M14 168 q-12 -4 -4 -16" stroke={p.glow} strokeWidth="3" fill="none" opacity=".8" />
    </svg>
  );
}

export function MonsterView({ art }: { art: MonsterArt }) {
  if (art.img) return <img className="fighter-img" src={`${import.meta.env.BASE_URL}${art.img}`} alt="" draggable={false} />;
  if (art.kind === 'hound') return <Hound {...art} />;
  if (art.kind === 'dragon') return <Dragon {...art} />;
  return <Humanoid skin={art.c1} armor1={art.c2} armor2={art.c1} accent={art.glow} cape={art.c2} hair={art.c2} head={art.head} weapon={art.weapon} glow={art.glow} bulk={1.2} monster />;
}

export function Portrait({ art, monster, size = 80 }: { art: CharArt | MonsterArt; monster?: boolean; size?: number }) {
  // zoomed crop of the head area
  const pa = art as CharArt;
  if (pa.img) {
    const [fx, fy] = pa.face ?? [0.5, 0.12];
    const zoom = 3.2, asp = pa.imgAspect ?? 0.667;
    const px = (fx * zoom - 0.5) / (zoom - 1) * 100;
    const py = ((fy * zoom / asp) - 0.5) / ((zoom / asp) - 1) * 100;
    return <div className="portrait" style={{ width: size, height: size, backgroundImage: `url(${import.meta.env.BASE_URL}${pa.img})`, backgroundSize: `${zoom * 100}% auto`, backgroundPosition: `${px}% ${py}%`, backgroundRepeat: 'no-repeat' }} />;
  }
  return (
    <div className="portrait" style={{ width: size, height: size }}>
      <div className="portrait-inner" style={{ transform: monster ? 'scale(2.2) translate(-2%, 6%)' : 'scale(2.6) translate(0, 8%)' }}>
        {monster ? <MonsterView art={art as MonsterArt} /> : <PlayerArt art={art as CharArt} />}
      </div>
    </div>
  );
}

// ───────────── Backdrops ─────────────
function rng(seed: number) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

export function Backdrop({ region }: { region: Region }) {
  if (region.bg) return <div className="backdrop backdrop-img" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${region.bg})` }} />;
  const r = rng(region.id + 3);
  const towers = Array.from({ length: 14 }, (_, i) => ({ x: i * 125 + r() * 40, h: 140 + r() * 260, w: 40 + r() * 60 }));
  const near = Array.from({ length: 9 }, (_, i) => ({ x: i * 200 + r() * 60 - 40, h: 120 + r() * 200, w: 70 + r() * 80 }));
  const pr = region.props;
  const tall = pr === 'citadel' || pr === 'abyss' || pr === 'cathedral';
  return (
    <svg className="backdrop" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bk-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={region.sky[0]} /><stop offset=".55" stopColor={region.sky[1]} /><stop offset="1" stopColor={region.sky[2]} /></linearGradient>
        <radialGradient id="bk-moon"><stop offset="0" stopColor={region.moon} stopOpacity="1" /><stop offset=".7" stopColor={region.moon} stopOpacity=".9" /><stop offset="1" stopColor={region.moon} stopOpacity="0" /></radialGradient>
        <radialGradient id="bk-halo"><stop offset="0" stopColor={region.moon} stopOpacity=".45" /><stop offset="1" stopColor={region.moon} stopOpacity="0" /></radialGradient>
        <linearGradient id="bk-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={region.fog} stopOpacity="0" /><stop offset="1" stopColor={region.fog} stopOpacity=".85" /></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bk-sky)" />
      <circle cx="1120" cy="210" r="260" fill="url(#bk-halo)" />
      <circle cx="1120" cy="210" r="96" fill="url(#bk-moon)" />
      {pr === 'abyss' && <g opacity=".5">{[0, 1, 2, 3].map((i) => <ellipse key={i} cx="1120" cy="210" rx={150 + i * 70} ry={40 + i * 26} fill="none" stroke={region.moon} strokeOpacity={0.4 - i * 0.08} strokeWidth="2" transform={`rotate(${-18 + i * 6} 1120 210)`} />)}</g>}
      {/* distant towers */}
      <g fill="#07030c" opacity=".78">
        {towers.map((t, i) => (
          <g key={i}>
            <rect x={t.x} y={720 - t.h} width={t.w} height={t.h + 200} />
            <path d={`M${t.x - 6} ${720 - t.h} L${t.x + t.w / 2} ${720 - t.h - (tall ? 110 : 60)} L${t.x + t.w + 6} ${720 - t.h}z`} />
            {i % 3 === 0 && <rect x={t.x + t.w / 2 - 3} y={720 - t.h + 30} width="6" height="14" fill={region.moon} opacity=".7" />}
          </g>
        ))}
      </g>
      {pr === 'forest' && <g fill="#06020a" opacity=".85">{Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${i * 105} 760 L${i * 105 + 30} ${520 - (i % 3) * 60} L${i * 105 + 14} 560 L${i * 105 + 50} 400 L${i * 105 + 40} 760z`} />)}</g>}
      {pr === 'crypt' && <g stroke="#030608" strokeWidth="38" fill="none" opacity=".9">{[160, 520, 880, 1240, 1560].map((x) => <path key={x} d={`M${x} 760V420Q${x + 120} 300 ${x + 240} 420V760`} />)}</g>}
      {pr === 'wasteland' && <g><path d="M0 780C300 740 600 800 900 760S1400 790 1600 770V900H0z" fill="#ff5a1a" opacity=".28" /><path d="M0 800C300 770 600 820 900 790S1400 810 1600 800V900H0z" fill="#ffaa2a" opacity=".22" /></g>}
      {/* near ruins */}
      <g fill="#030107" opacity=".95">
        {near.map((t, i) => (
          <g key={i}><rect x={t.x} y={780 - t.h} width={t.w} height={t.h + 150} />
            <path d={`M${t.x} ${780 - t.h} l${t.w / 5} -26 l${t.w / 5} 26 l${t.w / 5} -26 l${t.w / 5} 26 l${t.w / 5} -26 l${t.w / 5} 26z`} /></g>
        ))}
      </g>
      <path d="M0 790C200 770 400 800 700 780S1200 800 1600 780V900H0z" fill="#0a0410" />
      <rect y="560" width="1600" height="340" fill="url(#bk-fog)" />
      {/* chains */}
      <g stroke="#2a2430" strokeWidth="5" strokeDasharray="10 7" fill="none" opacity=".8"><path d="M380 0Q420 80 400 160" /><path d="M1180 0Q1140 100 1160 200" /></g>
    </svg>
  );
}

export function Embers({ n = 24 }: { n?: number }) {
  return (
    <div className="embers" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.7) % 9}s`, animationDuration: `${7 + (i % 5) * 2}s`, width: 3 + (i % 3), height: 3 + (i % 3) }} />
      ))}
    </div>
  );
}
