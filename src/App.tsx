import { useEffect } from 'react';
import { audio } from './engine/audio';
import { MAP_TRACK, MUSIC_DIR, VICTORY_TRACK } from './data/world';
import { useGame } from './game/store';
import { GlobalDefs } from './ui/art';
import { useFitScale } from './ui/common';
import { MainMenu, CharacterScreen, SettingsScreen } from './ui/Screens';
import { CollectionScreen, DeckBuilder } from './ui/Collection';
import { EquipmentScreen } from './ui/Equipment';
import { WorldMap } from './ui/MapScreen';
import { BattleScreen } from './ui/BattleScreen';
import { EventScreen, RewardScreen, TreasureScreen } from './ui/Reward';
import { EndingScreen } from './ui/Ending';
import { Tooltip } from './ui/Tooltip';

export default function App() {
  const g = useGame();
  const scale = useFitScale();
  const st = g.save.settings;

  useEffect(() => {
    audio.configure({ sfx: st.sfx, music: st.music, sfxVol: st.sfxVol, musicVol: st.musicVol });
  }, [st.sfx, st.music, st.sfxVol, st.musicVol]);

  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  }, []);

  const screen = g.ui.screen;
  useEffect(() => {
    if (screen === 'menu') audio.track(`${import.meta.env.BASE_URL}audio/mainmenu.mp3`);   // recorded main-title theme
    else if (screen === 'reward' || screen === 'ending') audio.track(`${import.meta.env.BASE_URL}${MUSIC_DIR}${VICTORY_TRACK}`);
    else if (screen !== 'battle') audio.track(`${import.meta.env.BASE_URL}${MUSIC_DIR}${MAP_TRACK}`);   // map + every menu page
  }, [screen]);

  return (
    <div className="viewport">
      <GlobalDefs />
      <Tooltip />
      <div className="stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        {screen === 'menu' && <MainMenu />}
        {screen === 'character' && <CharacterScreen />}
        {screen === 'collection' && <CollectionScreen />}
        {screen === 'deck' && <DeckBuilder />}
        {screen === 'equipment' && <EquipmentScreen />}
        {screen === 'map' && <WorldMap />}
        {screen === 'settings' && <SettingsScreen />}
        {screen === 'battle' && g.ui.battle && <BattleScreen key={g.ui.seq} />}
        {screen === 'reward' && g.ui.reward && g.ui.battle && <RewardScreen />}
        {screen === 'event' && g.ui.event && <EventScreen />}
        {screen === 'ending' && <EndingScreen />}
        {screen === 'treasure' && g.ui.treasure && <TreasureScreen />}
        {g.ui.toast && <div className="toast">{g.ui.toast}</div>}
      </div>
    </div>
  );
}
