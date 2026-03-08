// Procedural Dark Fantasy Audio Engine
// Generates ambient music and sound effects using Web Audio API

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let currentMusic: { stop: () => void } | null = null;

const STORAGE_KEY = 'audio-settings';

interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

function loadSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { masterVolume: 0.5, musicVolume: 0.4, sfxVolume: 0.7, muted: false };
}

function saveSettings(s: AudioSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

let settings = loadSettings();

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    musicGain = audioCtx.createGain();
    sfxGain = audioCtx.createGain();
    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(audioCtx.destination);
    applyVolumes();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function applyVolumes() {
  if (!masterGain || !musicGain || !sfxGain) return;
  const m = settings.muted ? 0 : settings.masterVolume;
  masterGain.gain.setValueAtTime(m, audioCtx!.currentTime);
  musicGain.gain.setValueAtTime(settings.musicVolume, audioCtx!.currentTime);
  sfxGain.gain.setValueAtTime(settings.sfxVolume, audioCtx!.currentTime);
}

export function setMasterVolume(v: number) { settings.masterVolume = v; applyVolumes(); saveSettings(settings); }
export function setMusicVolume(v: number) { settings.musicVolume = v; applyVolumes(); saveSettings(settings); }
export function setSfxVolume(v: number) { settings.sfxVolume = v; applyVolumes(); saveSettings(settings); }
export function setMuted(m: boolean) { settings.muted = m; applyVolumes(); saveSettings(settings); }
export function getSettings(): AudioSettings { return { ...settings }; }

// ─── SOUND EFFECTS ───────────────────────────────────────

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.3, detune = 0) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.detune.setValueAtTime(detune, ctx.currentTime);
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(sfxGain!);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, gainVal = 0.1, filterFreq = 2000) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain!);
  src.start();
}

export function sfxClick() {
  playTone(800, 0.08, 'square', 0.15);
  playTone(1200, 0.05, 'sine', 0.1);
}

export function sfxHover() {
  playTone(600, 0.04, 'sine', 0.05);
}

export function sfxSuccess() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  [440, 554, 659, 880].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, t + i * 0.1);
    gain.gain.setValueAtTime(0.25, t + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
    osc.connect(gain);
    gain.connect(sfxGain!);
    osc.start(t + i * 0.1);
    osc.stop(t + i * 0.1 + 0.3);
  });
}

export function sfxError() {
  playTone(200, 0.3, 'sawtooth', 0.2);
  playTone(150, 0.4, 'square', 0.15, -10);
}

export function sfxLevelUp() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // Epic ascending arpeggio
  [261, 329, 392, 523, 659, 784, 1047].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, t + i * 0.08);
    gain.gain.setValueAtTime(0.3, t + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.5);
    osc.connect(gain);
    gain.connect(sfxGain!);
    osc.start(t + i * 0.08);
    osc.stop(t + i * 0.08 + 0.5);
  });
  playNoise(0.6, 0.08, 4000);
}

export function sfxPurchase() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // Coin-like sounds
  [2000, 2400, 2800, 3200].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t + i * 0.06);
    gain.gain.setValueAtTime(0.15, t + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.15);
    osc.connect(gain);
    gain.connect(sfxGain!);
    osc.start(t + i * 0.06);
    osc.stop(t + i * 0.06 + 0.15);
  });
}

export function sfxQuestComplete() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // Fanfare-like pattern
  [392, 392, 523, 659, 784, 1047].forEach((f, i) => {
    const delay = i < 2 ? i * 0.12 : 0.24 + (i - 2) * 0.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i < 2 ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(f, t + delay);
    gain.gain.setValueAtTime(0.2, t + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.4);
    osc.connect(gain);
    gain.connect(sfxGain!);
    osc.start(t + delay);
    osc.stop(t + delay + 0.4);
  });
}

export function sfxDamage() {
  playNoise(0.3, 0.25, 800);
  playTone(100, 0.3, 'sawtooth', 0.3, -20);
  playTone(80, 0.4, 'square', 0.2);
}

export function sfxNavigate() {
  playTone(500, 0.06, 'sine', 0.08);
  playTone(700, 0.04, 'sine', 0.06);
}

export function sfxDungeonEnter() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // Dark portal sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.8);
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1);
  osc.connect(gain);
  gain.connect(sfxGain!);
  osc.start(t);
  osc.stop(t + 1);
  playNoise(0.8, 0.15, 1200);
}

export function sfxRoomClear() {
  sfxSuccess();
  setTimeout(() => playNoise(0.2, 0.05, 6000), 200);
}

export function sfxPunishment() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // Ominous descending
  [400, 350, 280, 200, 150].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f, t + i * 0.15);
    gain.gain.setValueAtTime(0.2, t + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.3);
    osc.connect(gain);
    gain.connect(sfxGain!);
    osc.start(t + i * 0.15);
    osc.stop(t + i * 0.15 + 0.3);
  });
}

// ─── PROCEDURAL AMBIENT MUSIC ────────────────────────────

type MusicTheme = 'home' | 'quest' | 'dungeon' | 'shop' | 'battle' | 'menu';

// Dark minor scales for each mood
const SCALES: Record<MusicTheme, number[]> = {
  home: [130.81, 146.83, 155.56, 174.61, 196.00, 207.65, 233.08], // C minor
  quest: [146.83, 164.81, 174.61, 196.00, 220.00, 233.08, 261.63], // D minor
  dungeon: [123.47, 130.81, 146.83, 155.56, 174.61, 185.00, 207.65], // B phrygian
  shop: [174.61, 196.00, 207.65, 233.08, 261.63, 277.18, 311.13], // F minor
  battle: [110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00], // A minor
  menu: [130.81, 155.56, 174.61, 196.00, 233.08, 261.63, 311.13], // C minor pentatonic-ish
};

function createDarkPad(ctx: AudioContext, freq: number, gainNode: GainNode): OscillatorNode[] {
  const oscs: OscillatorNode[] = [];
  ['sine', 'triangle'].forEach((type, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type as OscillatorType;
    osc.frequency.setValueAtTime(freq * (i === 0 ? 1 : 2.01), ctx.currentTime); // slight detune for width
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    osc.connect(g);
    g.connect(gainNode);
    oscs.push(osc);
  });
  return oscs;
}

export function playMusic(theme: MusicTheme) {
  stopMusic();
  const ctx = getCtx();
  const scale = SCALES[theme];
  const allOscs: OscillatorNode[] = [];
  const allTimeouts: ReturnType<typeof setTimeout>[] = [];
  let stopped = false;

  // Create reverb-like effect with delay
  const delay = ctx.createDelay();
  delay.delayTime.setValueAtTime(0.3, ctx.currentTime);
  const feedback = ctx.createGain();
  feedback.gain.setValueAtTime(0.3, ctx.currentTime);
  const delayGain = ctx.createGain();
  delayGain.gain.setValueAtTime(0.4, ctx.currentTime);

  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(musicGain!);

  // Filter for dark atmosphere
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(theme === 'dungeon' ? 600 : theme === 'battle' ? 1200 : 900, ctx.currentTime);
  filter.Q.setValueAtTime(2, ctx.currentTime);
  filter.connect(musicGain!);
  filter.connect(delay);

  // Deep sub bass drone
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(scale[0] / 2, ctx.currentTime);
  subGain.gain.setValueAtTime(0.12, ctx.currentTime);
  subOsc.connect(subGain);
  subGain.connect(filter);
  subOsc.start();
  allOscs.push(subOsc);

  // Slow pad chord changes
  function playPadCycle() {
    if (stopped) return;
    const idx = Math.floor(Math.random() * 4);
    const root = scale[idx];
    const third = scale[(idx + 2) % scale.length];
    const fifth = scale[(idx + 4) % scale.length];

    [root, third, fifth].forEach(freq => {
      const oscs = createDarkPad(ctx, freq, filter);
      oscs.forEach(o => { o.start(); allOscs.push(o); });
      // Fade out after some time
      const tid = setTimeout(() => {
        oscs.forEach(o => { try { o.stop(); } catch {} });
      }, 6000);
      allTimeouts.push(tid);
    });

    const tid = setTimeout(playPadCycle, 5000 + Math.random() * 3000);
    allTimeouts.push(tid);
  }
  playPadCycle();

  // Trap/house-influenced rhythmic element (for non-dungeon themes)
  if (theme !== 'dungeon') {
    let kickPhase = 0;
    function playBeat() {
      if (stopped) return;
      const t = ctx.currentTime;

      // Sub kick
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(150, t);
      kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      kickGain.gain.setValueAtTime(theme === 'battle' ? 0.15 : 0.08, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      kickOsc.connect(kickGain);
      kickGain.connect(musicGain!);
      kickOsc.start(t);
      kickOsc.stop(t + 0.2);

      // Hi-hat on off-beats (trap style)
      if (kickPhase % 2 === 1 || theme === 'battle') {
        const hatDuration = 0.03 + Math.random() * 0.02;
        const bufSize = Math.floor(ctx.sampleRate * hatDuration);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
        const hat = ctx.createBufferSource();
        hat.buffer = buf;
        const hatFilter = ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.setValueAtTime(8000, t);
        const hatGain = ctx.createGain();
        hatGain.gain.setValueAtTime(0.04, t);
        hat.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(musicGain!);
        hat.start(t + 0.15);
      }

      kickPhase++;
      // BPM: ~70 for home, ~80 for quest, ~90 for battle, ~65 for shop
      const bpmMap: Record<MusicTheme, number> = { home: 70, quest: 80, battle: 90, shop: 65, dungeon: 60, menu: 60 };
      const interval = 60 / (bpmMap[theme] || 70);
      const tid = setTimeout(playBeat, interval * 1000);
      allTimeouts.push(tid);
    }
    const startTid = setTimeout(playBeat, 2000);
    allTimeouts.push(startTid);
  }

  // Ambient melodic notes (sparse, dark, atmospheric)
  function playMelodicNote() {
    if (stopped) return;
    const t = ctx.currentTime;
    const note = scale[Math.floor(Math.random() * scale.length)] * (Math.random() > 0.5 ? 2 : 1);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = theme === 'dungeon' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(note, t);
    g.gain.setValueAtTime(0.04, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2);
    osc.connect(g);
    g.connect(filter);
    osc.start(t);
    osc.stop(t + 2);

    const interval = theme === 'dungeon' ? 4000 + Math.random() * 6000 : 2000 + Math.random() * 3000;
    const tid = setTimeout(playMelodicNote, interval);
    allTimeouts.push(tid);
  }
  const melTid = setTimeout(playMelodicNote, 3000);
  allTimeouts.push(melTid);

  currentMusic = {
    stop: () => {
      stopped = true;
      allTimeouts.forEach(clearTimeout);
      allOscs.forEach(o => { try { o.stop(); } catch {} });
      try { delay.disconnect(); feedback.disconnect(); delayGain.disconnect(); filter.disconnect(); subGain.disconnect(); } catch {}
    }
  };
}

export function stopMusic() {
  if (currentMusic) {
    currentMusic.stop();
    currentMusic = null;
  }
}

export function initAudio() {
  // Call on first user interaction to unlock AudioContext
  getCtx();
}
