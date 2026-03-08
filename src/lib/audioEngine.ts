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

// ─── SEQUENCER-BASED MUSIC ENGINE ────────────────────────

type MusicTheme = 'home' | 'quest' | 'dungeon' | 'shop' | 'battle' | 'menu';

const NOTE = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

interface ThemeConfig {
  bpm: number;
  genre: 'trap' | 'house' | 'ambient';
  chords: number[][]; // 8 chords (8-bar loop), each [root, 3rd, 5th] MIDI
  bassPattern: number[]; // 32 steps (2 bars pattern, repeated)
  filterCutoff: number;
  padGain: number;
  bassOctave: number;
}

const THEMES: Record<MusicTheme, ThemeConfig> = {
  home: {
    bpm: 140,
    genre: 'trap',
    // Dark but vibey - Cm → Ab → Fm → G → Cm → Eb → Ab → Bb
    chords: [
      [48, 51, 55], // Cm
      [44, 48, 51], // Ab
      [41, 44, 48], // Fm
      [43, 47, 50], // G (dominant for pull)
      [48, 51, 55], // Cm
      [39, 43, 46], // Eb
      [44, 48, 51], // Ab
      [46, 50, 53], // Bb
    ],
    // 32-step bass: bouncy trap pattern (half-time feel)
    bassPattern: [
      1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0,
      0,0,1,0, 0,0,0,1, 0,0,0,0, 1,0,0,0,
    ],
    filterCutoff: 1100,
    padGain: 0.05,
    bassOctave: -1,
  },
  quest: {
    bpm: 145,
    genre: 'trap',
    chords: [
      [50, 53, 57], [48, 51, 55], [46, 49, 53], [43, 46, 50],
      [50, 53, 57], [46, 49, 53], [41, 44, 48], [43, 46, 50],
    ],
    bassPattern: [
      1,0,0,0, 1,0,0,1, 0,0,1,0, 0,0,1,0,
      1,0,0,0, 0,0,1,0, 1,0,0,1, 0,0,0,0,
    ],
    filterCutoff: 1000,
    padGain: 0.05,
    bassOctave: -1,
  },
  dungeon: {
    bpm: 75,
    genre: 'ambient',
    chords: [
      [47, 50, 54], [48, 51, 55], [45, 48, 52], [47, 50, 54],
      [43, 47, 50], [45, 48, 52], [47, 50, 54], [48, 51, 55],
    ],
    bassPattern: [
      1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0,
      1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0,
    ],
    filterCutoff: 500,
    padGain: 0.07,
    bassOctave: -2,
  },
  shop: {
    bpm: 124,
    genre: 'house',
    chords: [
      [53, 56, 60], [51, 55, 58], [48, 51, 55], [46, 50, 53],
      [53, 56, 60], [48, 52, 55], [46, 50, 53], [51, 55, 58],
    ],
    bassPattern: [
      1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0,
      1,0,0,0, 1,0,0,0, 1,0,0,1, 0,0,1,0,
    ],
    filterCutoff: 1200,
    padGain: 0.04,
    bassOctave: -1,
  },
  battle: {
    bpm: 155,
    genre: 'trap',
    chords: [
      [45, 48, 52], [43, 46, 50], [41, 44, 48], [40, 43, 48],
      [45, 48, 52], [41, 44, 48], [43, 46, 50], [40, 43, 48],
    ],
    bassPattern: [
      1,0,1,0, 1,0,0,1, 0,1,0,0, 1,0,1,0,
      1,0,0,1, 0,1,0,0, 1,0,1,0, 0,0,1,0,
    ],
    filterCutoff: 1400,
    padGain: 0.05,
    bassOctave: -1,
  },
  menu: {
    bpm: 95,
    genre: 'ambient',
    chords: [
      [48, 51, 55], [53, 56, 60], [50, 53, 57], [46, 50, 53],
      [48, 52, 55], [44, 48, 51], [46, 50, 53], [48, 51, 55],
    ],
    bassPattern: [
      1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0,
      0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0,
    ],
    filterCutoff: 700,
    padGain: 0.05,
    bassOctave: -1,
  },
};

// Drum patterns: 32 steps (2 bars that repeat)
type DrumStep = [number, number, number, number]; // [kick, snare, hat, openHat]

const DRUM_PATTERNS: Record<'trap' | 'house' | 'ambient', DrumStep[]> = {
  trap: [
    // Bar 1: standard trap half-time
    [1,  0, .5, 0],  [0, 0, .3, 0],  [0, 0, .7, 0],  [0, 0, .3, 0],
    [0,  0, .5, 0],  [0, 0, .4, 0],  [0, 0, .8, 0],  [0, 0, .4, 0],
    [.7, .9,.5, 0],  [0, 0, .3, 0],  [0, 0, .7, 0],  [0, 0, .5, 0],
    [0,  0, .5,.6],  [.5,0, .3, 0],  [0, 0, .8, 0],  [0, 0, .4, 0],
    // Bar 2: variation with hi-hat rolls
    [1,  0, .5, 0],  [0, 0, .4, 0],  [0, 0, .7, 0],  [0, 0, .5, 0],
    [0,  0, .6, 0],  [0, 0, .6, 0],  [0, 0, .8, 0],  [0, 0, .6, 0],  // hat roll
    [.8,.9, .5, 0],  [0, 0, .4, 0],  [0, 0, .7, 0],  [0, 0, .3, 0],
    [0,  0, .6,.7],  [0, 0, .7, 0],  [0, 0, .8, 0],  [.4,0, .6, 0],  // fill
  ],
  house: [
    // Bar 1: classic four-on-the-floor
    [1, 0, 0, 0],  [0, 0, 0, 0],  [0, 0,.8, 0],  [0, 0, 0, 0],
    [1,.8, 0, 0],  [0, 0, 0, 0],  [0, 0,.8, 0],  [0, 0, 0, 0],
    [1, 0, 0, 0],  [0, 0, 0, 0],  [0, 0,.8, 0],  [0, 0, 0, 0],
    [1,.8, 0, 0],  [0, 0, 0, 0],  [0, 0,.7,.5],  [0, 0,.4, 0],
    // Bar 2: slight variation
    [1, 0, 0, 0],  [0, 0, 0, 0],  [0, 0,.8, 0],  [0, 0, 0, 0],
    [1,.8, 0, 0],  [0, 0, 0, 0],  [0, 0,.8, 0],  [0, 0,.3, 0],
    [1, 0, 0, 0],  [0, 0, 0, 0],  [0, 0,.8, 0],  [0, 0, 0, 0],
    [1,.9, 0, 0],  [0, 0,.4, 0],  [0, 0,.7,.6],  [0, 0,.5, 0],
  ],
  ambient: [
    // Bar 1 & 2: very sparse
    [.3, 0, 0, 0],  [0,0,0,0],  [0,0,0,0],  [0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],  [0,0,.15,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],  [0,0,0,0],  [0,0,0,0],
    [.2, 0, 0, 0],  [0,0,0,0],  [0,0,.15,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],  [0,0,0,0],  [0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],  [0,0,.1, 0],[0,0,0,0],
    [.25, 0, 0, 0], [0,0,0,0],  [0,0,0,0],  [0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],  [0,0,.1, 0],[0,0,0,0],
  ],
};

// ─── Synth helpers ───

function schedule808Kick(ctx: AudioContext, time: number, velocity: number, dest: GainNode) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160 * velocity, time);
  osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);
  g.gain.setValueAtTime(0.3 * velocity, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  osc.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + 0.35);
  // Transient click
  const click = ctx.createOscillator();
  const cg = ctx.createGain();
  click.type = 'square';
  click.frequency.setValueAtTime(800, time);
  cg.gain.setValueAtTime(0.06 * velocity, time);
  cg.gain.exponentialRampToValueAtTime(0.001, time + 0.01);
  click.connect(cg); cg.connect(dest);
  click.start(time); click.stop(time + 0.02);
}

function scheduleSnare(ctx: AudioContext, time: number, velocity: number, dest: GainNode) {
  const dur = 0.12;
  const bufSize = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass'; filt.frequency.setValueAtTime(3000, time); filt.Q.setValueAtTime(1, time);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.15 * velocity, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(filt); filt.connect(g); g.connect(dest);
  src.start(time);
  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.type = 'triangle'; osc.frequency.setValueAtTime(200, time);
  og.gain.setValueAtTime(0.1 * velocity, time);
  og.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  osc.connect(og); og.connect(dest);
  osc.start(time); osc.stop(time + 0.06);
}

function scheduleHihat(ctx: AudioContext, time: number, velocity: number, open: boolean, dest: GainNode) {
  const dur = open ? 0.15 : 0.04;
  const bufSize = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.setValueAtTime(open ? 7000 : 9000, time);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.07 * velocity, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(hp); hp.connect(g); g.connect(dest);
  src.start(time);
}

function scheduleBass(ctx: AudioContext, time: number, midi: number, duration: number, dest: GainNode) {
  const freq = NOTE(midi);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(350, time);
  filt.Q.setValueAtTime(4, time);
  g.gain.setValueAtTime(0.12, time);
  g.gain.setValueAtTime(0.12, time + duration * 0.6);
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.connect(filt); filt.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + duration + 0.05);
}

function schedulePad(ctx: AudioContext, time: number, midiNotes: number[], duration: number, gainVal: number, cutoff: number, dest: GainNode) {
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(cutoff, time);
  filt.Q.setValueAtTime(1, time);
  filt.connect(dest);

  midiNotes.forEach(midi => {
    const freq = NOTE(midi);
    (['sine', 'triangle'] as OscillatorType[]).forEach((type, j) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      osc.detune.setValueAtTime(j === 0 ? -8 : 8, time);
      g.gain.setValueAtTime(0.001, time);
      g.gain.linearRampToValueAtTime(gainVal, time + Math.min(0.5, duration * 0.15));
      g.gain.setValueAtTime(gainVal, time + duration - Math.min(0.5, duration * 0.15));
      g.gain.linearRampToValueAtTime(0.001, time + duration);
      osc.connect(g); g.connect(filt);
      osc.start(time); osc.stop(time + duration + 0.1);
    });
  });
}

// ─── MAIN SEQUENCER WITH CROSSFADE ───

const FADE_DURATION = 1.5; // seconds for crossfade

interface MusicInstance {
  outputGain: GainNode;
  schedulerTimer: ReturnType<typeof setInterval>;
  stopped: boolean;
  stop: () => void;
  fadeOut: (duration: number) => void;
}

let currentMusicInstance: MusicInstance | null = null;
let fadingOutInstance: MusicInstance | null = null;

function createMusicInstance(theme: MusicTheme): MusicInstance {
  const ctx = getCtx();
  const config = THEMES[theme];
  const drumPattern = DRUM_PATTERNS[config.genre];

  const sixteenthDur = 60 / config.bpm / 4;
  const barDur = sixteenthDur * 16;
  const loopDur = barDur * 8; // 8-bar loop now

  // This instance's output gain (for fading)
  const outputGain = ctx.createGain();
  outputGain.gain.setValueAtTime(0.001, ctx.currentTime);
  outputGain.connect(musicGain!);

  // Delay send
  const delaySend = ctx.createDelay();
  delaySend.delayTime.setValueAtTime(sixteenthDur * 3, ctx.currentTime);
  const delayFb = ctx.createGain();
  delayFb.gain.setValueAtTime(0.2, ctx.currentTime);
  const delayOut = ctx.createGain();
  delayOut.gain.setValueAtTime(0.25, ctx.currentTime);
  const delaySendGain = ctx.createGain();
  delaySendGain.gain.setValueAtTime(1, ctx.currentTime);
  delaySendGain.connect(delaySend);
  delaySend.connect(delayFb); delayFb.connect(delaySend);
  delaySend.connect(delayOut); delayOut.connect(outputGain);

  let stopped = false;
  let nextLoopTime = ctx.currentTime + 0.05;

  function scheduleLoop(startTime: number) {
    if (stopped) return;

    for (let bar = 0; bar < 8; bar++) {
      const barStart = startTime + bar * barDur;
      const chord = config.chords[bar];
      const rootMidi = chord[0];

      // Pad per bar
      schedulePad(ctx, barStart, chord, barDur, config.padGain, config.filterCutoff, outputGain);
      schedulePad(ctx, barStart, chord, barDur, config.padGain * 0.2, config.filterCutoff, delaySendGain);

      // Drums + bass: 32-step pattern wraps every 2 bars
      for (let step = 0; step < 16; step++) {
        const stepTime = barStart + step * sixteenthDur;
        const patIdx = (bar % 2) * 16 + step; // index into 32-step pattern
        const [kick, snare, hat, openHat] = drumPattern[patIdx];

        if (kick > 0) schedule808Kick(ctx, stepTime, kick, outputGain);
        if (snare > 0) scheduleSnare(ctx, stepTime, snare, outputGain);
        if (hat > 0) scheduleHihat(ctx, stepTime, hat, false, outputGain);
        if (openHat > 0) scheduleHihat(ctx, stepTime, openHat, true, outputGain);

        if (config.bassPattern[patIdx]) {
          const bassMidi = rootMidi + config.bassOctave * 12;
          scheduleBass(ctx, stepTime, bassMidi, sixteenthDur * 3, outputGain);
        }
      }
    }
  }

  // Schedule first loop
  scheduleLoop(nextLoopTime);
  nextLoopTime += loopDur;

  // Look-ahead scheduler
  const schedulerTimer = setInterval(() => {
    if (stopped) return;
    if (ctx.currentTime > nextLoopTime - 3) {
      scheduleLoop(nextLoopTime);
      nextLoopTime += loopDur;
    }
  }, 500);

  // Fade in
  outputGain.gain.linearRampToValueAtTime(1, ctx.currentTime + FADE_DURATION);

  const instance: MusicInstance = {
    outputGain,
    schedulerTimer,
    stopped: false,
    stop: () => {
      instance.stopped = true;
      stopped = true;
      clearInterval(schedulerTimer);
      try {
        outputGain.disconnect();
        delaySend.disconnect(); delayFb.disconnect(); delayOut.disconnect(); delaySendGain.disconnect();
      } catch {}
    },
    fadeOut: (duration: number) => {
      const ctx2 = getCtx();
      outputGain.gain.cancelScheduledValues(ctx2.currentTime);
      outputGain.gain.setValueAtTime(outputGain.gain.value, ctx2.currentTime);
      outputGain.gain.linearRampToValueAtTime(0.001, ctx2.currentTime + duration);
      // After fade, fully stop
      setTimeout(() => instance.stop(), duration * 1000 + 100);
    },
  };

  return instance;
}

export function playMusic(theme: MusicTheme) {
  // If already fading one out, force-stop it
  if (fadingOutInstance) {
    fadingOutInstance.stop();
    fadingOutInstance = null;
  }

  // Crossfade: fade out current, fade in new
  if (currentMusicInstance) {
    fadingOutInstance = currentMusicInstance;
    fadingOutInstance.fadeOut(FADE_DURATION);
  }

  currentMusicInstance = createMusicInstance(theme);
}

export function stopMusic() {
  if (currentMusicInstance) {
    currentMusicInstance.fadeOut(FADE_DURATION * 0.5);
    fadingOutInstance = currentMusicInstance;
    currentMusicInstance = null;
  }
}

export function initAudio() {
  getCtx();
}
