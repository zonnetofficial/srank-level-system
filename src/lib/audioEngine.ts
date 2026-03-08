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

// Note frequencies (MIDI-style)
const NOTE = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// Chord progressions per theme (MIDI root notes, minor chords)
// Each chord lasts 1 bar (4 beats). Progression = 4 bars = 1 loop.
interface ThemeConfig {
  bpm: number;
  genre: 'trap' | 'house' | 'ambient';
  chords: number[][]; // 4 chords, each is [root, 3rd, 5th] in MIDI
  bassPattern: number[]; // which 16th notes the bass plays (0-15 per bar)
  filterCutoff: number;
  padGain: number;
  bassOctave: number;
}

const THEMES: Record<MusicTheme, ThemeConfig> = {
  home: {
    bpm: 140, // trap half-time feel = 70 BPM feel
    genre: 'trap',
    chords: [
      [48, 51, 55], // C minor
      [46, 49, 53], // Bb minor
      [43, 46, 51], // G minor
      [41, 44, 48], // F minor
    ],
    bassPattern: [0, 0, 0, 0, 6, 0, 0, 10, 0, 0, 12, 0, 0, 0, 0, 0], // 1 = play
    filterCutoff: 800,
    padGain: 0.06,
    bassOctave: -1,
  },
  quest: {
    bpm: 150,
    genre: 'trap',
    chords: [
      [50, 53, 57], // D minor
      [48, 51, 55], // C minor
      [46, 49, 53], // Bb minor
      [43, 46, 50], // G minor
    ],
    bassPattern: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    filterCutoff: 1000,
    padGain: 0.05,
    bassOctave: -1,
  },
  dungeon: {
    bpm: 80,
    genre: 'ambient',
    chords: [
      [47, 50, 54], // B phrygian i
      [48, 51, 55], // C (bII)
      [45, 48, 52], // A dim-ish
      [47, 50, 54], // B phrygian i
    ],
    bassPattern: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    filterCutoff: 500,
    padGain: 0.07,
    bassOctave: -2,
  },
  shop: {
    bpm: 124,
    genre: 'house',
    chords: [
      [53, 56, 60], // F minor
      [51, 55, 58], // Eb major
      [48, 51, 55], // C minor
      [46, 50, 53], // Bb major
    ],
    bassPattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // four on the floor
    filterCutoff: 1200,
    padGain: 0.04,
    bassOctave: -1,
  },
  battle: {
    bpm: 160,
    genre: 'trap',
    chords: [
      [45, 48, 52], // A minor
      [43, 46, 50], // G minor
      [41, 44, 48], // F minor
      [40, 43, 48], // E phrygian
    ],
    bassPattern: [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
    filterCutoff: 1400,
    padGain: 0.05,
    bassOctave: -1,
  },
  menu: {
    bpm: 100,
    genre: 'ambient',
    chords: [
      [48, 51, 55], // C minor
      [53, 56, 60], // F minor
      [50, 53, 57], // D minor
      [46, 50, 53], // Bb major
    ],
    bassPattern: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    filterCutoff: 700,
    padGain: 0.05,
    bassOctave: -1,
  },
};

// Drum patterns per genre: 16 steps per bar
// Each step: [kick, snare/clap, hihat, openhat]  (0 or velocity 0-1)
type DrumStep = [number, number, number, number];

const DRUM_PATTERNS: Record<'trap' | 'house' | 'ambient', DrumStep[]> = {
  trap: [
    // Classic trap: kick on 1, ghost kick, snare on 3, rolling hihats
    [1, 0, .6, 0],   // 1
    [0, 0, .4, 0],   // e
    [0, 0, .8, 0],   // &
    [0, 0, .4, 0],   // a
    [.5, 0, .6, 0],  // 2
    [0, 0, .4, 0],   // e
    [0, 0, .9, 0],   // &
    [0, 0, .5, 0],   // a
    [1, .9, .6, 0],  // 3 (snare)
    [0, 0, .4, 0],   // e
    [0, 0, .8, 0],   // &
    [0, 0, .6, 0],   // a
    [0, 0, .6, .7],  // 4
    [.6, 0, .4, 0],  // e
    [0, 0, .9, 0],   // &
    [0, 0, .5, 0],   // a
  ],
  house: [
    // Four on the floor, offbeat hihats, clap on 2 & 4
    [1, 0, 0, 0],    // 1
    [0, 0, 0, 0],
    [0, 0, .8, 0],   // & (offbeat hat)
    [0, 0, 0, 0],
    [1, .8, 0, 0],   // 2 (clap)
    [0, 0, 0, 0],
    [0, 0, .8, 0],   // &
    [0, 0, 0, 0],
    [1, 0, 0, 0],    // 3
    [0, 0, 0, 0],
    [0, 0, .8, 0],   // &
    [0, 0, 0, 0],
    [1, .8, 0, 0],   // 4 (clap)
    [0, 0, 0, 0],
    [0, 0, .8, .5],  // & (open hat)
    [0, 0, .4, 0],
  ],
  ambient: [
    // Very sparse - just subtle textures
    [.4, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, .2, 0],
    [0, 0, 0, 0],
    [.3, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, .2, 0],
    [0, 0, 0, 0],
  ],
};

// ─── Synth helpers ───

function schedule808Kick(ctx: AudioContext, time: number, velocity: number, dest: GainNode) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160 * velocity, time);
  osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);
  g.gain.setValueAtTime(0.35 * velocity, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
  osc.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + 0.3);
  // Click transient
  const click = ctx.createOscillator();
  const cg = ctx.createGain();
  click.type = 'square';
  click.frequency.setValueAtTime(800, time);
  cg.gain.setValueAtTime(0.08 * velocity, time);
  cg.gain.exponentialRampToValueAtTime(0.001, time + 0.01);
  click.connect(cg); cg.connect(dest);
  click.start(time); click.stop(time + 0.02);
}

function scheduleSnare(ctx: AudioContext, time: number, velocity: number, dest: GainNode) {
  // Noise body
  const dur = 0.12;
  const bufSize = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass'; filt.frequency.setValueAtTime(3000, time); filt.Q.setValueAtTime(1, time);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.18 * velocity, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(filt); filt.connect(g); g.connect(dest);
  src.start(time);
  // Tonal snap
  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.type = 'triangle'; osc.frequency.setValueAtTime(200, time);
  og.gain.setValueAtTime(0.12 * velocity, time);
  og.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  osc.connect(og); og.connect(dest);
  osc.start(time); osc.stop(time + 0.06);
}

function scheduleHihat(ctx: AudioContext, time: number, velocity: number, open: boolean, dest: GainNode) {
  const dur = open ? 0.15 : 0.04;
  const bufSize = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.setValueAtTime(open ? 7000 : 9000, time);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.08 * velocity, time);
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
  // Filter for that 808 bass feel
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(400, time);
  filt.Q.setValueAtTime(5, time);
  g.gain.setValueAtTime(0.14, time);
  g.gain.setValueAtTime(0.14, time + duration * 0.7);
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

  midiNotes.forEach((midi, i) => {
    const freq = NOTE(midi);
    // Two slightly detuned oscillators for width
    ['sine', 'triangle'].forEach((type, j) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type as OscillatorType;
      osc.frequency.setValueAtTime(freq, time);
      osc.detune.setValueAtTime(j === 0 ? -8 : 8, time); // stereo width
      // Fade in / fade out
      g.gain.setValueAtTime(0.001, time);
      g.gain.linearRampToValueAtTime(gainVal, time + 0.3);
      g.gain.setValueAtTime(gainVal, time + duration - 0.3);
      g.gain.linearRampToValueAtTime(0.001, time + duration);
      osc.connect(g); g.connect(filt);
      osc.start(time); osc.stop(time + duration + 0.1);
    });
  });
}

// ─── MAIN SEQUENCER ───

export function playMusic(theme: MusicTheme) {
  stopMusic();
  const ctx = getCtx();
  const config = THEMES[theme];
  const pattern = DRUM_PATTERNS[config.genre];

  const sixteenthDuration = 60 / config.bpm / 4; // duration of one 16th note in seconds
  const barDuration = sixteenthDuration * 16;     // one bar = 16 sixteenths
  const loopDuration = barDuration * 4;           // 4-bar loop

  let stopped = false;
  let schedulerTimer: ReturnType<typeof setInterval>;
  let nextLoopTime = ctx.currentTime + 0.1; // slight offset to allow scheduling

  // Delay/reverb send
  const delaySend = ctx.createDelay();
  delaySend.delayTime.setValueAtTime(sixteenthDuration * 3, ctx.currentTime); // dotted 8th delay
  const delayFb = ctx.createGain();
  delayFb.gain.setValueAtTime(0.25, ctx.currentTime);
  const delayOut = ctx.createGain();
  delayOut.gain.setValueAtTime(0.3, ctx.currentTime);
  const delaySendGain = ctx.createGain();
  delaySendGain.gain.setValueAtTime(1, ctx.currentTime);
  delaySendGain.connect(delaySend);
  delaySend.connect(delayFb); delayFb.connect(delaySend);
  delaySend.connect(delayOut); delayOut.connect(musicGain!);

  function scheduleLoop(startTime: number) {
    if (stopped) return;

    for (let bar = 0; bar < 4; bar++) {
      const barStart = startTime + bar * barDuration;
      const chord = config.chords[bar];
      const rootMidi = chord[0];

      // ── PAD: one sustained chord per bar ──
      schedulePad(ctx, barStart, chord, barDuration, config.padGain, config.filterCutoff, musicGain!);
      // Send pads to delay too for atmosphere
      schedulePad(ctx, barStart, chord, barDuration, config.padGain * 0.3, config.filterCutoff, delaySendGain);

      // ── DRUMS + BASS: 16 steps per bar ──
      for (let step = 0; step < 16; step++) {
        const stepTime = barStart + step * sixteenthDuration;
        const [kick, snare, hat, openHat] = pattern[step];

        if (kick > 0) schedule808Kick(ctx, stepTime, kick, musicGain!);
        if (snare > 0) scheduleSnare(ctx, stepTime, snare, musicGain!);
        if (hat > 0) scheduleHihat(ctx, stepTime, hat, false, musicGain!);
        if (openHat > 0) scheduleHihat(ctx, stepTime, openHat, true, musicGain!);

        // Bass follows pattern
        if (config.bassPattern[step]) {
          const bassMidi = rootMidi + (config.bassOctave * 12);
          const bassLen = sixteenthDuration * 2; // 8th note bass
          scheduleBass(ctx, stepTime, bassMidi, bassLen, musicGain!);
        }
      }
    }
  }

  // Schedule first loop
  scheduleLoop(nextLoopTime);
  nextLoopTime += loopDuration;

  // Look-ahead scheduler: schedule next loop before current one ends
  schedulerTimer = setInterval(() => {
    if (stopped) return;
    if (ctx.currentTime > nextLoopTime - 2) { // schedule 2s ahead
      scheduleLoop(nextLoopTime);
      nextLoopTime += loopDuration;
    }
  }, 500);

  currentMusic = {
    stop: () => {
      stopped = true;
      clearInterval(schedulerTimer);
      try { delaySend.disconnect(); delayFb.disconnect(); delayOut.disconnect(); } catch {}
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
  getCtx();
}
