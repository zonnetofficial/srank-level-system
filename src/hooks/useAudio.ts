import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getSettings,
  setMasterVolume,
  setMusicVolume,
  setSfxVolume,
  setMuted,
  playMusic,
  stopMusic,
  initAudio,
  sfxClick,
  sfxNavigate,
} from '@/lib/audioEngine';

type MusicTheme = 'home' | 'quest' | 'dungeon' | 'shop' | 'battle' | 'menu' | 'skills' | 'titles' | 'history';

const ROUTE_THEMES: Record<string, MusicTheme> = {
  '/': 'home',
  '/quest': 'quest',
  '/dungeons': 'dungeon',
  '/shop': 'shop',
  '/skills': 'skills',
  '/titles': 'titles',
  '/history': 'history',
  '/monarch': 'home',
  '/mission': 'battle',
};

export function useAudio() {
  const location = useLocation();
  const [settings, setSettings] = useState(getSettings());
  const [initialized, setInitialized] = useState(false);

  // Initialize audio on first user interaction
  const init = useCallback(() => {
    if (!initialized) {
      initAudio();
      setInitialized(true);
      // Start music for current route
      const theme = ROUTE_THEMES[location.pathname] || 'home';
      playMusic(theme);
    }
  }, [initialized, location.pathname]);

  // Listen for first interaction
  useEffect(() => {
    const handler = () => { init(); document.removeEventListener('click', handler); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [init]);

  // Change music on route change
  useEffect(() => {
    if (!initialized) return;
    const theme = ROUTE_THEMES[location.pathname] || 'home';
    if (location.pathname !== '/auth') {
      playMusic(theme);
      sfxNavigate();
    } else {
      stopMusic();
    }
  }, [location.pathname, initialized]);

  // Cleanup
  useEffect(() => {
    return () => stopMusic();
  }, []);

  const updateMaster = (v: number) => { setMasterVolume(v); setSettings(s => ({ ...s, masterVolume: v })); };
  const updateMusic = (v: number) => { setMusicVolume(v); setSettings(s => ({ ...s, musicVolume: v })); };
  const updateSfx = (v: number) => { setSfxVolume(v); setSettings(s => ({ ...s, sfxVolume: v })); };
  const toggleMute = () => { const m = !settings.muted; setMuted(m); setSettings(s => ({ ...s, muted: m })); };

  return {
    settings,
    initialized,
    setMasterVolume: updateMaster,
    setMusicVolume: updateMusic,
    setSfxVolume: updateSfx,
    toggleMute,
    playSfx: sfxClick,
  };
}
