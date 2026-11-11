# HEAVY METAL – DARK LEGENDS

A Heavy Metal dark-fantasy **Match-3 RPG** with turn-based combat, collectible ability cards, deck building,
roguelite rewards, equipment, and a 7-region campaign with bosses.

```bash
npm install
npm run dev        # play at http://localhost:5173
npm run build      # type-check + production bundle in dist/
npm run sim        # headless balance simulation (auto-bot plays the campaign)
npx tsx scripts/flow.ts   # headless test of the whole progression loop
```

## How to play
- **Swap** adjacent tiles (click two tiles, or drag). You get **2 moves per turn**; ending the turn lets the enemy act.
- Tiles: 💀 Skull (physical) · 🎸 Guitar (fire/sound) · ⚡ Lightning · 👁 Demon Eye (dark magic + MP) · ✚ Iron Cross (shield) · 🪓 Battle Axe (+crit).
- **Match 4** → Blast tile (clears a line) · **Match 5 / L / T** → Ultimate tile (clears every tile of its kind) · **Match 6+** → instant 5×5 area strike. Swapping a special tile triggers it; specials chain.
- Every cascade raises the **combo multiplier** (5 combo = ×2.0).
- **Cards** cost energy (4/turn). Hand of 5, discard reshuffles when the draw pile empties. Passive cards are played once and last the whole battle.
- Read the enemy's **telegraph** (top right) and block with defense cards. Bosses have phases and **enrage** at low HP.
- Hotkeys: `1-5` cards · `Space` end turn · `U` ultimate · `Esc` pause.
- Win → pick **one** of three reward cards, or upgrade a card / remove a weak card / take gold. Elites, chests and bosses drop gear.
- Defeat bosses to unlock Death Knight, Dark Priest, Guitarist and Berserker. Unlocked party members assist each turn.
- Progress auto-saves to `localStorage`. **New Game** starts a fresh run.

## Architecture
```
src/
  engine/   match3.ts (pure board logic) · battle.ts (combat, turn flow, enemy AI) · audio.ts (WebAudio synth) · types.ts
  data/     cards.ts · characters.ts · enemies.ts (+bosses/phases) · equipment.ts · world.ts   ← all data-driven
  game/     store.ts (save/load, progression, rewards, deck, equipment)
  ui/       React screens + SVG art, particle canvas, battle screen
scripts/    sim.ts (balance bot) · flow.ts (progression test)
```
The engine has no React dependency; the battle returns a list of events (each with a state snapshot, effects and
sounds) that the UI plays back as animations.

## Assets
- Painted artwork lives in `public/` (`chars/`, `enemies/`, `bg/`, `tiles/`, `skills/`, `cards/`, `icons/`, `map/`, `ui/`). Images are referenced from the data files (`img` fields in `src/data/`, `CARD_IMG`/`TILE_IMG`/`NODE_IMG`/`SKILL_IMG` in `src/ui/art.tsx`); entries without an image fall back to the built-in SVG art.
- Image helpers in `scripts/`: `cut_tile.py`, `cut_enemy.py` (remove green/magenta screen backgrounds) and `card_img.py` (crop card art).
- Music: procedural synth by default; recorded tracks can be played with `audio.track(url)` (the main title uses `public/audio/mainmenu.mp3`).
- Rendering uses React DOM/SVG with a canvas particle layer instead of Phaser.
