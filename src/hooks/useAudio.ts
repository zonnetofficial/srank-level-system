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

type MusicTheme = 'home' | 'quest' | 'dungeon' | 'shop' | 'battle' | 'menu' | 'skills' | 'titles' | 'history' | 'monarch';

const ROUTE_THEMES: Record<string, MusicTheme> = {
  '/': 'home',
  '/quest': 'quest',
  '/dungeons': 'dungeon',
  '/shop': 'shop',
  '/skills': 'skills',
  '/titles': 'titles',
  '/history': 'history',
  '/monarch': 'monarch',
  '/mission': 'battle',
};

export function useAudio(isMonarchActive = false) {
  const location = useLocation();
  const [settings, setSettings] = useState(getSettings());
  const [initialized, setInitialized] = useState(false);

  const getTheme = useCallback((pathname: string): MusicTheme => {
    const base = ROUTE_THEMES[pathname] || 'home';
    // When monarch is active, home plays monarch theme
    if (base === 'home' && isMonarchActive) return 'monarch';
    return base;
  }, [isMonarchActive]);

  // Initialize audio on first user interaction
  const init = useCallback(() => {
    if (!initialized) {
      initAudio();
      setInitialized(true);
      const theme = getTheme(location.pathname);
      playMusic(theme);
    }
  }, [initialized, location.pathname, getTheme]);

  // Listen for first interaction
  useEffect(() => {
    const handler = () => { init(); document.removeEventListener('click', handler); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [init]);

  // Change music on route change
  useEffect(() => {
    if (!initialized) return;
    const theme = getTheme(location.pathname);
    if (location.pathname !== '/auth') {
      playMusic(theme);
      sfxNavigate();
    } else {
      stopMusic();
    }
  }, [location.pathname, initialized, getTheme]);

  // Re-trigger music when monarch status changes on home
  useEffect(() => {
    if (!initialized) return;
    if (location.pathname === '/') {
      const theme = getTheme('/');
      playMusic(theme);
    }
  }, [isMonarchActive, initialized, getTheme, location.pathname]);

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
