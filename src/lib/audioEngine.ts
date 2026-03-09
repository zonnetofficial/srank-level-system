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

// ─── ADVANCED MUSIC ENGINE ───────────────────────────────
// Rich synthesis: FM keys, layered pads w/ LFO, genre-specific drum kits

type MusicTheme = 'home' | 'quest' | 'dungeon' | 'shop' | 'battle' | 'menu';
const NOTE = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// ─── INSTRUMENT: Warm Pad (layered, LFO-modulated, chorus-like) ───
function scheduleWarmPad(ctx: AudioContext, time: number, midiNotes: number[], duration: number, gain: number, brightness: number, dest: GainNode) {
  // Master filter with slow sweep for movement
  const masterFilt = ctx.createBiquadFilter();
  masterFilt.type = 'lowpass';
  masterFilt.frequency.setValueAtTime(brightness * 0.6, time);
  masterFilt.frequency.linearRampToValueAtTime(brightness, time + duration * 0.4);
  masterFilt.frequency.linearRampToValueAtTime(brightness * 0.7, time + duration);
  masterFilt.Q.setValueAtTime(0.7, time);
  masterFilt.connect(dest);

  midiNotes.forEach(midi => {
    const freq = NOTE(midi);
    // 4 detuned voices per note for rich chorus
    const detunes = [-12, -5, 5, 12];
    const types: OscillatorType[] = ['sine', 'triangle', 'sine', 'triangle'];
    detunes.forEach((det, j) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = types[j];
      osc.frequency.setValueAtTime(freq, time);
      osc.detune.setValueAtTime(det, time);
      // Slow LFO on detune for shimmer
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.3 + j * 0.15, time); // different rates
      lfoGain.gain.setValueAtTime(3, time); // subtle pitch wobble
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start(time); lfo.stop(time + duration + 0.2);
      // Slow attack, sustained, slow release
      const attack = Math.min(1.2, duration * 0.2);
      const release = Math.min(1.5, duration * 0.25);
      g.gain.setValueAtTime(0.001, time);
      g.gain.linearRampToValueAtTime(gain * 0.25, time + attack);
      g.gain.setValueAtTime(gain * 0.25, time + duration - release);
      g.gain.linearRampToValueAtTime(0.001, time + duration);
      osc.connect(g); g.connect(masterFilt);
      osc.start(time); osc.stop(time + duration + 0.1);
    });
  });

  // Sub layer (one octave down, just the root)
  if (midiNotes.length > 0) {
    const subOsc = ctx.createOscillator();
    const subG = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(NOTE(midiNotes[0] - 12), time);
    const attack = Math.min(1.5, duration * 0.25);
    subG.gain.setValueAtTime(0.001, time);
    subG.gain.linearRampToValueAtTime(gain * 0.15, time + attack);
    subG.gain.setValueAtTime(gain * 0.15, time + duration - attack);
    subG.gain.linearRampToValueAtTime(0.001, time + duration);
    subOsc.connect(subG); subG.connect(dest); // bypass filter for clean sub
    subOsc.start(time); subOsc.stop(time + duration + 0.1);
  }
}

// ─── INSTRUMENT: Dark Piano (inspired by "A 120" Gera MX) ───
function scheduleFMKeys(ctx: AudioContext, time: number, midi: number, duration: number, brightness: number, velocity: number, dest: GainNode) {
  const freq = NOTE(midi);
  
  // Layer 1: Main piano body (triangle + sine for mellow tone)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const g1 = ctx.createGain();
  const g2 = ctx.createGain();
  
  osc1.type = 'triangle';
  osc2.type = 'sine';
  osc1.frequency.setValueAtTime(freq, time);
  osc2.frequency.setValueAtTime(freq, time);
  osc2.detune.setValueAtTime(-7, time); // slight detune for richness
  
  // Piano-like envelope: quick attack, sustained decay
  g1.gain.setValueAtTime(0.001, time);
  g1.gain.linearRampToValueAtTime(0.08 * velocity * brightness, time + 0.01);
  g1.gain.exponentialRampToValueAtTime(0.03 * velocity * brightness, time + duration * 0.4);
  g1.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  g2.gain.setValueAtTime(0.001, time);
  g2.gain.linearRampToValueAtTime(0.05 * velocity * brightness, time + 0.01);
  g2.gain.exponentialRampToValueAtTime(0.02 * velocity * brightness, time + duration * 0.4);
  g2.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  // Low-pass filter for dark, mellow tone
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, time);
  filter.frequency.exponentialRampToValueAtTime(800, time + duration * 0.6);
  filter.Q.setValueAtTime(0.7, time);
  
  osc1.connect(g1); g1.connect(filter);
  osc2.connect(g2); g2.connect(filter);
  filter.connect(dest);
  
  osc1.start(time); osc1.stop(time + duration + 0.05);
  osc2.start(time); osc2.stop(time + duration + 0.05);
  
  // Layer 2: Subtle harmonic for depth
  const h2 = ctx.createOscillator();
  const h2g = ctx.createGain();
  h2.type = 'sine';
  h2.frequency.setValueAtTime(freq * 2, time);
  h2g.gain.setValueAtTime(0.001, time);
  h2g.gain.linearRampToValueAtTime(0.015 * velocity * brightness, time + 0.005);
  h2g.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.3);
  h2.connect(h2g); h2g.connect(filter);
  h2.start(time); h2.stop(time + duration * 0.3 + 0.05);
}

// ─── INSTRUMENT: Pluck/Bell (for arpeggios) ───
function schedulePluck(ctx: AudioContext, time: number, midi: number, duration: number, dest: GainNode) {
  const freq = NOTE(midi);
  // Karplus-Strong inspired: filtered noise burst + resonant body
  const bufSize = Math.floor(ctx.sampleRate * 0.01);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = buf;
  const noiseG = ctx.createGain();
  noiseG.gain.setValueAtTime(0.08, time);
  noiseG.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
  noiseSrc.connect(noiseG); noiseG.connect(dest);
  noiseSrc.start(time);

  // Tonal body
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);
  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(freq * 6, time);
  filt.frequency.exponentialRampToValueAtTime(freq * 1.5, time + duration);
  filt.Q.setValueAtTime(2, time);
  g.gain.setValueAtTime(0.001, time);
  g.gain.linearRampToValueAtTime(0.06, time + 0.003);
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.connect(filt); filt.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + duration + 0.05);
}

// ─── INSTRUMENT: Deep 808 Sub Bass ───
function schedule808Sub(ctx: AudioContext, time: number, midi: number, duration: number, dest: GainNode) {
  const freq = NOTE(midi);
  // Main sine body with pitch drop — longer sustain for dark trap
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq * 2, time);
  osc.frequency.exponentialRampToValueAtTime(freq, time + 0.06);
  // Soft-clip distortion for warmth & grit
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 128) - 1;
    curve[i] = (Math.PI + 3) * x / (Math.PI + 3 * Math.abs(x)); // heavier saturation
  }
  shaper.curve = curve;
  shaper.oversample = '2x';
  // Low-pass to keep it sub-heavy
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(freq * 4, time);
  lp.frequency.exponentialRampToValueAtTime(freq * 1.5, time + duration * 0.5);
  g.gain.setValueAtTime(0.001, time);
  g.gain.linearRampToValueAtTime(0.25, time + 0.015);
  g.gain.setValueAtTime(0.22, time + duration * 0.6);
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.connect(shaper); shaper.connect(lp); lp.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + duration + 0.05);
  // Sub harmonic layer
  const sub = ctx.createOscillator();
  const sg = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(freq / 2, time);
  sg.gain.setValueAtTime(0.001, time);
  sg.gain.linearRampToValueAtTime(0.1, time + 0.02);
  sg.gain.setValueAtTime(0.08, time + duration * 0.5);
  sg.gain.exponentialRampToValueAtTime(0.001, time + duration);
  sub.connect(sg); sg.connect(dest);
  sub.start(time); sub.stop(time + duration + 0.05);
}

// ─── INSTRUMENT: House Bass (filtered saw + sub) ───
function scheduleHouseBass(ctx: AudioContext, time: number, midi: number, duration: number, dest: GainNode) {
  const freq = NOTE(midi);
  // Saw layer with filter envelope
  const saw = ctx.createOscillator();
  const sawG = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  saw.type = 'sawtooth';
  saw.frequency.setValueAtTime(freq, time);
  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(freq * 8, time);
  filt.frequency.exponentialRampToValueAtTime(freq * 2, time + duration * 0.4);
  filt.Q.setValueAtTime(3, time);
  sawG.gain.setValueAtTime(0.001, time);
  sawG.gain.linearRampToValueAtTime(0.08, time + 0.008);
  sawG.gain.exponentialRampToValueAtTime(0.001, time + duration);
  saw.connect(filt); filt.connect(sawG); sawG.connect(dest);
  saw.start(time); saw.stop(time + duration + 0.05);
  // Sub sine
  const sub = ctx.createOscillator();
  const subG = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(freq, time);
  subG.gain.setValueAtTime(0.001, time);
  subG.gain.linearRampToValueAtTime(0.12, time + 0.005);
  subG.gain.setValueAtTime(0.12, time + duration * 0.6);
  subG.gain.exponentialRampToValueAtTime(0.001, time + duration);
  sub.connect(subG); subG.connect(dest);
  sub.start(time); sub.stop(time + duration + 0.05);
}

// ─── INSTRUMENT: Dark Drone (for dungeon/ambient) ───
function scheduleDrone(ctx: AudioContext, time: number, midi: number, duration: number, dest: GainNode) {
  const freq = NOTE(midi);
  // Multiple detuned saws through heavy filtering
  [-7, 0, 7, 12].forEach(det => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    osc.detune.setValueAtTime(det, time);
    // Slow LFO
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.2, time);
    lfoG.gain.setValueAtTime(5, time);
    lfo.connect(lfoG); lfoG.connect(osc.detune);
    lfo.start(time); lfo.stop(time + duration + 0.1);

    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(0.02, time + duration * 0.3);
    g.gain.setValueAtTime(0.02, time + duration * 0.7);
    g.gain.linearRampToValueAtTime(0.001, time + duration);
    osc.connect(g); g.connect(dest);
    osc.start(time); osc.stop(time + duration + 0.1);
  });
}

// ─── DRUM KITS ───────────────────────────────────────────

// TRAP KIT: booming 808 kick, sharp snare, crispy hats
function trapKick(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Body: long 808 sine sweep
  const body = ctx.createOscillator();
  const bg = ctx.createGain();
  body.type = 'sine';
  body.frequency.setValueAtTime(180, time);
  body.frequency.exponentialRampToValueAtTime(32, time + 0.18);
  bg.gain.setValueAtTime(0.4 * vel, time);
  bg.gain.setValueAtTime(0.35 * vel, time + 0.15);
  bg.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
  body.connect(bg); bg.connect(dest);
  body.start(time); body.stop(time + 0.55);
  // Click transient
  const clickBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.005), ctx.sampleRate);
  const cd = clickBuf.getChannelData(0);
  for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * (1 - i / cd.length);
  const click = ctx.createBufferSource();
  click.buffer = clickBuf;
  const cg = ctx.createGain();
  cg.gain.setValueAtTime(0.15 * vel, time);
  const cf = ctx.createBiquadFilter();
  cf.type = 'bandpass'; cf.frequency.setValueAtTime(4000, time); cf.Q.setValueAtTime(2, time);
  click.connect(cf); cf.connect(cg); cg.connect(dest);
  click.start(time);
}

function trapSnare(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Noise body - longer, crispier
  const dur = 0.18;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.setValueAtTime(4500, time); bp.Q.setValueAtTime(0.8, time);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.setValueAtTime(1500, time);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.2 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(bp); bp.connect(hp); hp.connect(g); g.connect(dest);
  src.start(time);
  // Tonal body (snare wires)
  const t1 = ctx.createOscillator();
  const t1g = ctx.createGain();
  t1.type = 'triangle'; t1.frequency.setValueAtTime(185, time);
  t1g.gain.setValueAtTime(0.12 * vel, time);
  t1g.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
  t1.connect(t1g); t1g.connect(dest);
  t1.start(time); t1.stop(time + 0.09);
}

function trapHat(ctx: AudioContext, time: number, vel: number, open: boolean, dest: GainNode) {
  const dur = open ? 0.2 : 0.035;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur * 1.5), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  // Metallic resonance via multiple bandpasses
  const bp1 = ctx.createBiquadFilter();
  bp1.type = 'bandpass'; bp1.frequency.setValueAtTime(10000, time); bp1.Q.setValueAtTime(3, time);
  const bp2 = ctx.createBiquadFilter();
  bp2.type = 'highpass'; bp2.frequency.setValueAtTime(7000, time);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.06 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(bp1); bp1.connect(bp2); bp2.connect(g); g.connect(dest);
  src.start(time);
}

// HOUSE KIT: punchy kick, clap, shaker-like hats
function houseKick(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Punchy, shorter than trap
  const body = ctx.createOscillator();
  const bg = ctx.createGain();
  body.type = 'sine';
  body.frequency.setValueAtTime(120, time);
  body.frequency.exponentialRampToValueAtTime(45, time + 0.06);
  bg.gain.setValueAtTime(0.35 * vel, time);
  bg.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
  body.connect(bg); bg.connect(dest);
  body.start(time); body.stop(time + 0.25);
  // Hard click
  const click = ctx.createOscillator();
  const cg = ctx.createGain();
  click.type = 'square';
  click.frequency.setValueAtTime(1500, time);
  cg.gain.setValueAtTime(0.08 * vel, time);
  cg.gain.exponentialRampToValueAtTime(0.001, time + 0.008);
  click.connect(cg); cg.connect(dest);
  click.start(time); click.stop(time + 0.01);
}

function houseClap(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Multiple noise bursts for clap texture
  [0, 0.01, 0.02].forEach(offset => {
    const dur = 0.06;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.setValueAtTime(1500, time + offset); bp.Q.setValueAtTime(0.5, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.12 * vel, time + offset);
    g.gain.exponentialRampToValueAtTime(0.001, time + offset + dur);
    src.connect(bp); bp.connect(g); g.connect(dest);
    src.start(time + offset);
  });
  // Tail
  const tailBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.15), ctx.sampleRate);
  const td = tailBuf.getChannelData(0);
  for (let i = 0; i < td.length; i++) td[i] = Math.random() * 2 - 1;
  const tail = ctx.createBufferSource();
  tail.buffer = tailBuf;
  const tg = ctx.createGain();
  const tf = ctx.createBiquadFilter();
  tf.type = 'bandpass'; tf.frequency.setValueAtTime(2000, time); tf.Q.setValueAtTime(1, time);
  tg.gain.setValueAtTime(0.08 * vel, time + 0.03);
  tg.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
  tail.connect(tf); tf.connect(tg); tg.connect(dest);
  tail.start(time + 0.03);
}

function houseHat(ctx: AudioContext, time: number, vel: number, open: boolean, dest: GainNode) {
  const dur = open ? 0.25 : 0.05;
  // Shaker-like: brighter, more metallic
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.setValueAtTime(8500, time);
  const peak = ctx.createBiquadFilter();
  peak.type = 'peaking'; peak.frequency.setValueAtTime(12000, time); peak.gain.setValueAtTime(6, time);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.055 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(hp); hp.connect(peak); peak.connect(g); g.connect(dest);
  src.start(time);
}

// DARK TRAP HARD KIT: clean 808 (kick+bass combined), aggressive snare, crispy loud hats
function darkTrapKick(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Clean 808 — sine with pitch drop, NO distortion, clean sub
  // This IS the bass — no separate bass instrument needed
  const body = ctx.createOscillator();
  const bg = ctx.createGain();
  body.type = 'sine';
  body.frequency.setValueAtTime(120, time); // clean pitch drop start
  body.frequency.exponentialRampToValueAtTime(36, time + 0.08); // fast drop to sub
  // Clean envelope — long sustain, no distortion
  bg.gain.setValueAtTime(0.001, time);
  bg.gain.linearRampToValueAtTime(0.5 * vel, time + 0.005); // instant attack
  bg.gain.setValueAtTime(0.45 * vel, time + 0.15);
  bg.gain.setValueAtTime(0.35 * vel, time + 0.4);
  bg.gain.exponentialRampToValueAtTime(0.001, time + 0.9); // long tail
  body.connect(bg); bg.connect(dest);
  body.start(time); body.stop(time + 0.95);
  // Subtle click for transient definition
  const clickBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.003), ctx.sampleRate);
  const cd = clickBuf.getChannelData(0);
  for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * (1 - i / cd.length);
  const click = ctx.createBufferSource();
  click.buffer = clickBuf;
  const cg = ctx.createGain();
  cg.gain.setValueAtTime(0.06 * vel, time);
  const cf = ctx.createBiquadFilter();
  cf.type = 'highpass'; cf.frequency.setValueAtTime(3000, time);
  click.connect(cf); cf.connect(cg); cg.connect(dest);
  click.start(time);
}

function darkTrapSnare(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Aggressive snare — loud, sharp, biting
  // Layer 1: Harsh noise burst — wide band, aggressive
  const dur = 0.25;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  // Distortion on the noise for aggression
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 128) - 1;
    curve[i] = Math.tanh(x * 3);
  }
  shaper.curve = curve;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.setValueAtTime(600, time);
  const peak = ctx.createBiquadFilter();
  peak.type = 'peaking'; peak.frequency.setValueAtTime(3000, time); peak.gain.setValueAtTime(6, time); peak.Q.setValueAtTime(1, time);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.28 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(shaper); shaper.connect(hp); hp.connect(peak); peak.connect(g); g.connect(dest);
  src.start(time);
  // Layer 2: Tonal body — hard pitched thump
  const t1 = ctx.createOscillator();
  const t1g = ctx.createGain();
  t1.type = 'square'; t1.frequency.setValueAtTime(220, time);
  t1.frequency.exponentialRampToValueAtTime(120, time + 0.04);
  t1g.gain.setValueAtTime(0.18 * vel, time);
  t1g.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
  t1.connect(t1g); t1g.connect(dest);
  t1.start(time); t1.stop(time + 0.07);
  // Layer 3: High crack for bite
  const crackBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.015), ctx.sampleRate);
  const crd = crackBuf.getChannelData(0);
  for (let i = 0; i < crd.length; i++) crd[i] = (Math.random() * 2 - 1);
  const crack = ctx.createBufferSource();
  crack.buffer = crackBuf;
  const crackHP = ctx.createBiquadFilter();
  crackHP.type = 'highpass'; crackHP.frequency.setValueAtTime(8000, time);
  const crackG = ctx.createGain();
  crackG.gain.setValueAtTime(0.15 * vel, time);
  crack.connect(crackHP); crackHP.connect(crackG); crackG.connect(dest);
  crack.start(time);
}

function darkTrapHat(ctx: AudioContext, time: number, vel: number, open: boolean | number, dest: GainNode) {
  const dur = 0.03; // Keep it crisp and short for both single hits and rolls
  
  const playHit = (t: number, v: number) => {
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur * 2), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.setValueAtTime(8000, t);
    const peak1 = ctx.createBiquadFilter();
    peak1.type = 'peaking'; peak1.frequency.setValueAtTime(11000, t); peak1.gain.setValueAtTime(10, t); peak1.Q.setValueAtTime(3, t);
    const peak2 = ctx.createBiquadFilter();
    peak2.type = 'peaking'; peak2.frequency.setValueAtTime(14000, t); peak2.gain.setValueAtTime(6, t); peak2.Q.setValueAtTime(2, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.1 * v, t); 
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(hp); hp.connect(peak1); peak1.connect(peak2); peak2.connect(g); g.connect(dest);
    src.start(t);
  };

  playHit(time, vel);
  if (open === 1 || open === true) {
    // Double roll (TT) - two 32nd notes
    playHit(time + 0.05, vel * 0.8);
  } else if (open === 2) {
    // Triple roll (TTT) - three 32nd notes
    playHit(time + 0.033, vel * 0.85);
    playHit(time + 0.066, vel * 0.7);
  }
}

// DEEP 808 SUB BASS for dark trap — clean, sustained, massive sub
function scheduleDeep808(ctx: AudioContext, time: number, midi: number, duration: number, dest: GainNode) {
  const freq = NOTE(midi);
  // Very long sustained sine with gentle pitch intro
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq * 1.5, time);
  osc.frequency.exponentialRampToValueAtTime(freq, time + 0.08);
  // Gentle saturation
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 128) - 1;
    curve[i] = Math.tanh(x * 1.5); // soft saturation
  }
  shaper.curve = curve;
  shaper.oversample = '2x';
  // Keep it sub-heavy
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(freq * 3, time);
  lp.frequency.exponentialRampToValueAtTime(freq * 1.2, time + duration * 0.5);
  // Long sustain envelope
  g.gain.setValueAtTime(0.001, time);
  g.gain.linearRampToValueAtTime(0.28, time + 0.02);
  g.gain.setValueAtTime(0.25, time + duration * 0.7);
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.connect(shaper); shaper.connect(lp); lp.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + duration + 0.05);
  // Pure sub harmonic
  const sub = ctx.createOscillator();
  const sg = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(freq / 2, time);
  sg.gain.setValueAtTime(0.001, time);
  sg.gain.linearRampToValueAtTime(0.12, time + 0.03);
  sg.gain.setValueAtTime(0.1, time + duration * 0.6);
  sg.gain.exponentialRampToValueAtTime(0.001, time + duration);
  sub.connect(sg); sg.connect(dest);
  sub.start(time); sub.stop(time + duration + 0.05);
}

// AMBIENT KIT: soft textural hits
function ambientKick(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, time);
  osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);
  g.gain.setValueAtTime(0.15 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
  osc.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + 0.45);
}

function ambientPerc(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Soft brush / shaker texture
  const dur = 0.2;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(3000, time);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.setValueAtTime(5000, time); bp.Q.setValueAtTime(0.5, time);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.04 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(lp); lp.connect(bp); bp.connect(g); g.connect(dest);
  src.start(time);
}

// ─── THEME CONFIGS ───────────────────────────────────────

interface ThemeConfig {
  bpm: number;
  genre: 'trap' | 'house' | 'ambient' | 'darktrap';
  chords: number[][];
  bassPattern: number[];
  keyPattern: number[]; // which 16th notes play keys (per bar)
  arpPattern: number[]; // which play pluck arpeggios
  padBrightness: number;
  padGain: number;
  bassOctave: number;
}

const THEMES: Record<MusicTheme, ThemeConfig> = {
  home: {
    bpm: 75,
    genre: 'darktrap',
    // Deep Cm minor — nocturnal, cold, elegant
    // Cm(add9) → Ab → Fm7 → Gsus4 → Cm → Eb → Abmaj7 → Gm
    chords: [
      [36, 48, 51, 55, 62], [44, 48, 51, 55], [41, 44, 48, 51], [43, 50, 55, 58],
      [36, 48, 51, 55], [39, 46, 51, 55], [44, 48, 51, 56], [43, 46, 50, 55],
    ],
    // No separate bass — the 808 kick IS the bass
    bassPattern: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    // Very sparse dark key touches
    keyPattern:  [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    // Ethereal plucks with space
    arpPattern:  [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0, 0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0],
    padBrightness: 500,
    padGain: 0.05,
    bassOctave: -1,
  },
  quest: {
    bpm: 145,
    genre: 'trap',
    chords: [
      [50,53,57],[48,51,55],[46,49,53],[43,46,50],
      [50,53,57],[46,49,53],[41,44,48],[43,46,50],
    ],
    bassPattern: [1,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0, 1,0,0,0,0,0,1,0,1,0,0,1,0,0,0,0],
    keyPattern:  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0, 0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
    arpPattern:  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0, 0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0],
    padBrightness: 900,
    padGain: 0.04,
    bassOctave: -1,
  },
  dungeon: {
    bpm: 75,
    genre: 'ambient',
    chords: [
      [47,50,54],[48,51,55],[45,48,52],[47,50,54],
      [43,47,50],[45,48,52],[47,50,54],[48,51,55],
    ],
    bassPattern: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    keyPattern:  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    arpPattern:  [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    padBrightness: 500,
    padGain: 0.06,
    bassOctave: -2,
  },
  shop: {
    bpm: 124,
    genre: 'house',
    chords: [
      [53,56,60],[51,55,58],[48,51,55],[46,50,53],
      [53,56,60],[48,52,55],[46,50,53],[51,55,58],
    ],
    bassPattern: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0, 1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0],
    keyPattern:  [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0, 0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0],
    arpPattern:  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    padBrightness: 1400,
    padGain: 0.035,
    bassOctave: -1,
  },
  battle: {
    bpm: 155,
    genre: 'trap',
    chords: [
      [45,48,52],[43,46,50],[41,44,48],[40,43,48],
      [45,48,52],[41,44,48],[43,46,50],[40,43,48],
    ],
    bassPattern: [1,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0, 1,0,0,1,0,1,0,0,1,0,1,0,0,0,1,0],
    keyPattern:  [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    arpPattern:  [1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0, 1,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0],
    padBrightness: 800,
    padGain: 0.04,
    bassOctave: -1,
  },
  menu: {
    bpm: 95,
    genre: 'ambient',
    chords: [
      [48,51,55],[53,56,60],[50,53,57],[46,50,53],
      [48,52,55],[44,48,51],[46,50,53],[48,51,55],
    ],
    bassPattern: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    keyPattern:  [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    arpPattern:  [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    padBrightness: 700,
    padGain: 0.05,
    bassOctave: -1,
  },
};

// Drum patterns: 32 steps [kick, snare/clap, closedHat, openHat]
type DrumStep = [number, number, number, number];

// Drum patterns: [kick, snare, closedHat, openHat (0=none, 1=double roll, 2=triple roll)]
type DrumStep = [number, number, number, number];

const DRUM_PATTERNS: Record<'trap' | 'house' | 'ambient' | 'darktrap', DrumStep[]> = {
  darktrap: [
    // K-T-TT-T-S-T-K-T (compás 1)
    [1, 0, 0, 0], [0, 0, .9, 0], [0, 0, 0, 1], [0, 0, .9, 0],
    [0, 1, 0, 0], [0, 0, .9, 0], [1, 0, 0, 0], [0, 0, .9, 0],
    // T-K-T-TT-S-T-K-T (compás 2)
    [0, 0, .9, 0], [1, 0, 0, 0], [0, 0, .9, 0], [0, 0, 0, 1],
    [0, 1, 0, 0], [0, 0, .9, 0], [1, 0, 0, 0], [0, 0, .9, 0],
    // K-T-K-T-S-TT-K-S (compás 3)
    [1, 0, 0, 0], [0, 0, .9, 0], [1, 0, 0, 0], [0, 0, .9, 0],
    [0, 1, 0, 0], [0, 0, 0, 1], [1, 0, 0, 0], [0, 1, 0, 0],
    // K-TTT-T-K-S-T-K-T (compás 4)
    [1, 0, 0, 0], [0, 0, 0, 2], [0, 0, .9, 0], [1, 0, 0, 0],
    [0, 1, 0, 0], [0, 0, .9, 0], [1, 0, 0, 0], [0, 0, .9, 0],
    // K-T-TT-T-S-T-K-T (compás 5)
    [1, 0, 0, 0], [0, 0, .9, 0], [0, 0, 0, 1], [0, 0, .9, 0],
    [0, 1, 0, 0], [0, 0, .9, 0], [1, 0, 0, 0], [0, 0, .9, 0],
    // T-K-T-TT-S-T-K-T (compás 6)
    [0, 0, .9, 0], [1, 0, 0, 0], [0, 0, .9, 0], [0, 0, 0, 1],
    [0, 1, 0, 0], [0, 0, .9, 0], [1, 0, 0, 0], [0, 0, .9, 0],
    // K-T-K-T-S-TT-K-S (compás 7)
    [1, 0, 0, 0], [0, 0, .9, 0], [1, 0, 0, 0], [0, 0, .9, 0],
    [0, 1, 0, 0], [0, 0, 0, 1], [1, 0, 0, 0], [0, 1, 0, 0],
    // K-TTT-T-K-S-T-K-T (compás 8)
    [1, 0, 0, 0], [0, 0, 0, 2], [0, 0, .9, 0], [1, 0, 0, 0],
    [0, 1, 0, 0], [0, 0, .9, 0], [1, 0, 0, 0], [0, 0, .9, 0],
  ],
  trap: [
    // Bar 1: heavy kick, rolling hats, snare on 5 & 13
    [1,  0, .6, 0],  [0, 0, .4, 0],  [0, 0, .7, 0],  [0, 0, .5, 0],
    [0, .9, .6, 0],  [0, 0, .4, 0],  [0, 0, .8, 0],  [0, 0, .6, 0],
    [.7, 0, .7, 0],  [0, 0, .5, 0],  [0, 0, .8, 0],  [0, 0, .7, 0],
    [0, .9, .6,.5],  [.5,0, .7, 0],  [0, 0, .8, 0],  [0, 0, .5, 0],
    // Bar 2: hi-hat triplet rolls, bounce
    [1,  0, .7, 0],  [0, 0, .6, 0],  [0, 0, .8, 0],  [0, 0, .7, 0],
    [0, .9, .8, 0],  [0, 0, .7, 0],  [0, 0, .9, 0],  [0, 0, .8, 0],
    [.8, 0, .8, 0],  [0, 0, .7, 0],  [0, 0, .9, 0],  [0, 0, .8, 0],
    [0, .9, .7,.6],  [0, 0, .8, 0],  [0, 0, .9, 0],  [.4,0, .7, 0],
  ],
  house: [
    // Bar 1: four-on-the-floor
    [1, 0, 0, 0],  [0, 0, 0, 0],  [0, 0,.7, 0],  [0, 0, 0, 0],
    [1,.8, 0, 0],  [0, 0, 0, 0],  [0, 0,.7, 0],  [0, 0, 0, 0],
    [1, 0, 0, 0],  [0, 0, 0, 0],  [0, 0,.7, 0],  [0, 0, 0, 0],
    [1,.8, 0, 0],  [0, 0, 0, 0],  [0, 0,.6,.5],  [0, 0,.3, 0],
    // Bar 2: variation
    [1, 0, 0, 0],  [0, 0, 0, 0],  [0, 0,.7, 0],  [0, 0, 0, 0],
    [1,.9, 0, 0],  [0, 0, 0, 0],  [0, 0,.7, 0],  [0, 0,.2, 0],
    [1, 0, 0, 0],  [0, 0, 0, 0],  [0, 0,.7, 0],  [0, 0, 0, 0],
    [1,.9, 0, 0],  [0, 0,.3, 0],  [0, 0,.6,.6],  [0, 0,.4, 0],
  ],
  ambient: [
    [.3, 0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,.1,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [.2, 0, 0, 0],  [0,0,0,0],[0,0,.1,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,.08,0],[0,0,0,0],
    [.25, 0, 0, 0], [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,.08,0],[0,0,0,0],
  ],
};

// Genre-specific drum dispatchers
type DrumKit = {
  kick: (ctx: AudioContext, t: number, v: number, d: GainNode) => void;
  snare: (ctx: AudioContext, t: number, v: number, d: GainNode) => void;
  hat: (ctx: AudioContext, t: number, v: number, open: boolean, d: GainNode) => void;
};

const DRUM_KITS: Record<'trap' | 'house' | 'ambient' | 'darktrap', DrumKit> = {
  darktrap: { kick: darkTrapKick, snare: darkTrapSnare, hat: darkTrapHat },
  trap: { kick: trapKick, snare: trapSnare, hat: trapHat },
  house: { kick: houseKick, snare: houseClap, hat: houseHat },
  ambient: { kick: ambientKick, snare: ambientPerc, hat: (ctx, t, v, _o, d) => ambientPerc(ctx, t, v * 0.5, d) },
};

// Genre-specific bass dispatchers
const BASS_FN: Record<'trap' | 'house' | 'ambient' | 'darktrap', (ctx: AudioContext, t: number, m: number, dur: number, d: GainNode) => void> = {
  darktrap: scheduleDeep808,
  trap: schedule808Sub,
  house: scheduleHouseBass,
  ambient: scheduleDrone,
};

// ─── MAIN SEQUENCER WITH CROSSFADE ───

const FADE_DURATION = 2.0;

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
  const kit = DRUM_KITS[config.genre];
  const bassFn = BASS_FN[config.genre];

  const sixteenthDur = 60 / config.bpm / 4;
  const barDur = sixteenthDur * 16;
  const loopDur = barDur * 8;

  const outputGain = ctx.createGain();
  outputGain.gain.setValueAtTime(0.001, ctx.currentTime);
  outputGain.connect(musicGain!);

  // Delay send (tempo-synced) — darktrap gets more delay for atmosphere
  const delaySend = ctx.createDelay(2);
  delaySend.delayTime.setValueAtTime(sixteenthDur * 3, ctx.currentTime);
  const delayFb = ctx.createGain();
  delayFb.gain.setValueAtTime(config.genre === 'darktrap' ? 0.35 : 0.2, ctx.currentTime);
  const delayOut = ctx.createGain();
  delayOut.gain.setValueAtTime(config.genre === 'darktrap' ? 0.3 : 0.2, ctx.currentTime);
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

      // ── Warm Pad ──
      scheduleWarmPad(ctx, barStart, chord, barDur, config.padGain, config.padBrightness, outputGain);

      // ── Drone layer (dungeon/ambient & darktrap atmospheric) ──
      if ((config.genre === 'ambient' || config.genre === 'darktrap') && bar % 4 === 0) {
        scheduleDrone(ctx, barStart, rootMidi - 12, barDur * 4, outputGain);
      }

      // ── Per-step instruments ──
      for (let step = 0; step < 16; step++) {
        const stepTime = barStart + step * sixteenthDur;
        const patIdx = ((bar * 16) + step) % drumPattern.length;
        const [kick, snare, hat, openHat] = drumPattern[patIdx];

        // Drums
        if (kick > 0) kit.kick(ctx, stepTime, kick, outputGain);
        if (snare > 0) kit.snare(ctx, stepTime, snare, outputGain);
        if (hat > 0) kit.hat(ctx, stepTime, hat, false, outputGain);
        if (openHat > 0) kit.hat(ctx, stepTime, openHat, true, outputGain);

        // Bass — darktrap gets very long sustained notes
        const bassPatIdx = ((bar * 16) + step) % config.bassPattern.length;
        if (config.bassPattern[bassPatIdx]) {
          const bassMidi = rootMidi + config.bassOctave * 12;
          const bassDur = config.genre === 'darktrap' ? barDur * 1.5
            : config.genre === 'ambient' ? barDur
            : config.genre === 'trap' ? sixteenthDur * 6
            : sixteenthDur * 3;
          bassFn(ctx, stepTime, bassMidi, bassDur, outputGain);
        }

        // FM Keys (stabs/chords) — darktrap uses very dark, soft keys
        const keyPatIdx = ((bar * 16) + step) % config.keyPattern.length;
        if (config.keyPattern[keyPatIdx]) {
          const brightness = config.genre === 'darktrap' ? 0.3
            : config.genre === 'house' ? 1.5
            : config.genre === 'trap' ? 0.8 : 0.4;
          const vel = config.genre === 'darktrap' ? 0.5 : 0.7;
          chord.forEach(m => scheduleFMKeys(ctx, stepTime, m + 12, sixteenthDur * 6, brightness, vel, outputGain));
          // Heavy delay send for dark atmosphere
          chord.forEach(m => scheduleFMKeys(ctx, stepTime, m + 12, sixteenthDur * 6, brightness * 0.4, vel * 0.4, delaySendGain));
        }

        // Pluck arpeggios — darktrap sends more to delay for ethereal feel
        const arpPatIdx = ((bar * 16) + step) % config.arpPattern.length;
        if (config.arpPattern[arpPatIdx]) {
          const arpNote = chord[step % chord.length] + 12;
          schedulePluck(ctx, stepTime, arpNote, sixteenthDur * 3, outputGain);
          schedulePluck(ctx, stepTime, arpNote, sixteenthDur * 3, delaySendGain);
          if (config.genre === 'darktrap') {
            // Extra delay send for spacious reverb-like effect
            schedulePluck(ctx, stepTime, arpNote + 12, sixteenthDur * 4, delaySendGain);
          }
        }
      }
    }
  }

  scheduleLoop(nextLoopTime);
  nextLoopTime += loopDur;

  const schedulerTimer = setInterval(() => {
    if (stopped) return;
    if (ctx.currentTime > nextLoopTime - 3) {
      scheduleLoop(nextLoopTime);
      nextLoopTime += loopDur;
    }
  }, 500);

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
      setTimeout(() => instance.stop(), duration * 1000 + 100);
    },
  };

  return instance;
}

export function playMusic(theme: MusicTheme) {
  if (fadingOutInstance) {
    fadingOutInstance.stop();
    fadingOutInstance = null;
  }
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
