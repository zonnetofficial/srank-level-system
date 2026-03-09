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

type MusicTheme = 'home' | 'quest' | 'dungeon' | 'shop' | 'battle' | 'menu' | 'skills' | 'titles' | 'history' | 'monarch';
const NOTE = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// ─── INSTRUMENT: Warm Pad (layered, optimized) ───
function scheduleWarmPad(ctx: AudioContext, time: number, midiNotes: number[], duration: number, gain: number, brightness: number, dest: GainNode) {
  const masterFilt = ctx.createBiquadFilter();
  masterFilt.type = 'lowpass';
  masterFilt.frequency.setValueAtTime(brightness * 0.6, time);
  masterFilt.frequency.linearRampToValueAtTime(brightness, time + duration * 0.4);
  masterFilt.frequency.linearRampToValueAtTime(brightness * 0.7, time + duration);
  masterFilt.Q.setValueAtTime(0.7, time);
  masterFilt.connect(dest);

  midiNotes.forEach(midi => {
    const freq = NOTE(midi);
    // Reducido de 4 a 2 voces para menos nodos
    const detunes = [-8, 8];
    detunes.forEach(det => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.detune.setValueAtTime(det, time);
      const attack = Math.min(1.2, duration * 0.2);
      const release = Math.min(1.5, duration * 0.25);
      g.gain.setValueAtTime(0.001, time);
      g.gain.linearRampToValueAtTime(gain * 0.3, time + attack);
      g.gain.setValueAtTime(gain * 0.3, time + duration - release);
      g.gain.linearRampToValueAtTime(0.001, time + duration);
      osc.connect(g); g.connect(masterFilt);
      osc.start(time); osc.stop(time + duration + 0.1);
    });
  });

  // Sub layer
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
    subOsc.connect(subG); subG.connect(dest);
    subOsc.start(time); subOsc.stop(time + duration + 0.1);
  }
}

// ─── INSTRUMENT: Dark Synth Lead (sine + pulse con reverb) ───
function scheduleFMKeys(ctx: AudioContext, time: number, midi: number, duration: number, brightness: number, velocity: number, dest: GainNode) {
  const freq = NOTE(midi);
  
  // Synth lead oscuro: sine + pulse width modulation
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const g1 = ctx.createGain();
  const g2 = ctx.createGain();
  
  osc1.type = 'sine'; // Sine para suavidad
  osc2.type = 'triangle'; // Triangle para textura
  osc1.frequency.setValueAtTime(freq, time);
  osc2.frequency.setValueAtTime(freq, time);
  osc2.detune.setValueAtTime(7, time); // Subtle detune
  
  const attack = 0.2; // Entrada más gradual
  const decay = duration * 0.8;
  
  g1.gain.setValueAtTime(0.001, time);
  g1.gain.linearRampToValueAtTime(0.15 * velocity * brightness, time + attack);
  g1.gain.exponentialRampToValueAtTime(0.001, time + decay);
  
  g2.gain.setValueAtTime(0.001, time);
  g2.gain.linearRampToValueAtTime(0.1 * velocity * brightness, time + attack);
  g2.gain.exponentialRampToValueAtTime(0.001, time + decay);
  
  // Lowpass para oscuridad
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(freq * 4, time);
  lp.frequency.linearRampToValueAtTime(freq * 2, time + duration * 0.3);
  lp.Q.setValueAtTime(1.5, time);
  
  // Reverb simulado con delay corto
  const shortDelay = ctx.createDelay(0.5);
  shortDelay.delayTime.setValueAtTime(0.08, time);
  const delayG = ctx.createGain();
  delayG.gain.setValueAtTime(0.35, time); // Más reverb
  
  osc1.connect(g1); g1.connect(lp);
  osc2.connect(g2); g2.connect(lp);
  
  lp.connect(dest);
  lp.connect(shortDelay);
  shortDelay.connect(delayG);
  delayG.connect(dest);
  
  osc1.start(time); osc1.stop(time + decay + 0.05);
  osc2.start(time); osc2.stop(time + decay + 0.05);
}

// ─── INSTRUMENT: Dark Atmospheric Pad (triangle + reverb) ───
function schedulePluck(ctx: AudioContext, time: number, midi: number, duration: number, dest: GainNode) {
  const freq = NOTE(midi);
  
  // Triangle waves para pad más suave y oscuro
  const detunes = [-10, 0, 10];
  detunes.forEach(det => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle'; // Triangle para sonido más suave
    osc.frequency.setValueAtTime(freq, time);
    osc.detune.setValueAtTime(det, time);
    
    const attack = Math.min(1.2, duration * 0.4);
    const release = Math.min(1.8, duration * 0.5);
    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(0.025, time + attack); // Más suave
    g.gain.setValueAtTime(0.025, time + duration - release);
    g.gain.linearRampToValueAtTime(0.001, time + duration);
    
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(freq * 2.5, time);
    filt.frequency.linearRampToValueAtTime(freq * 1.8, time + duration * 0.5);
    filt.Q.setValueAtTime(0.7, time);
    
    osc.connect(filt); filt.connect(g); g.connect(dest);
    osc.start(time); osc.stop(time + duration + 0.1);
  });
}
// ─── 808 CUT-ITSELF: store previous nodes to kill on retrigger ───
let prev808Nodes: { gains: GainNode[], oscs: OscillatorNode[], cutTime: number } | null = null;

function cut808(ctx: AudioContext, time: number) {
  if (prev808Nodes) {
    const fadeOut = 0.015; // 15ms fast fade to avoid click
    prev808Nodes.gains.forEach(g => {
      g.gain.cancelScheduledValues(time);
      g.gain.setValueAtTime(g.gain.value, time);
      g.gain.linearRampToValueAtTime(0.001, time + fadeOut);
    });
    prev808Nodes.oscs.forEach(o => {
      try { o.stop(time + fadeOut + 0.01); } catch(_) {}
    });
    prev808Nodes = null;
  }
}

// ─── INSTRUMENT: Deep 808 Sub Bass ───
function schedule808Sub(ctx: AudioContext, time: number, midi: number, duration: number, dest: GainNode) {
  cut808(ctx, time); // Kill previous 808
  const freq = NOTE(midi);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq * 2, time);
  osc.frequency.exponentialRampToValueAtTime(freq, time + 0.06);
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 128) - 1;
    curve[i] = (Math.PI + 3) * x / (Math.PI + 3 * Math.abs(x));
  }
  shaper.curve = curve;
  shaper.oversample = '2x';
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
  prev808Nodes = { gains: [g, sg], oscs: [osc, sub], cutTime: time };
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

// ─── INSTRUMENT: Dark Drone (optimized) ───
function scheduleDrone(ctx: AudioContext, time: number, midi: number, duration: number, dest: GainNode) {
  const freq = NOTE(midi);
  // Reducido de 4 a 2 voces sin LFO
  [0, 7].forEach(det => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    osc.detune.setValueAtTime(det, time);

    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(0.03, time + duration * 0.3);
    g.gain.setValueAtTime(0.03, time + duration * 0.7);
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
  // Snare tronado — explosivo, con mucho snap y crack
  
  // Layer 1: Explosión inicial — noise burst muy fuerte y corto
  const snapDur = 0.04;
  const snapBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * snapDur), ctx.sampleRate);
  const sd = snapBuf.getChannelData(0);
  for (let i = 0; i < sd.length; i++) sd[i] = Math.random() * 2 - 1;
  const snap = ctx.createBufferSource();
  snap.buffer = snapBuf;
  
  // Distorsión agresiva
  const snapShaper = ctx.createWaveShaper();
  const snapCurve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 128) - 1;
    snapCurve[i] = Math.tanh(x * 4); // distorsión fuerte
  }
  snapShaper.curve = snapCurve;
  
  const snapHP = ctx.createBiquadFilter();
  snapHP.type = 'highpass'; snapHP.frequency.setValueAtTime(2000, time);
  const snapPeak = ctx.createBiquadFilter();
  snapPeak.type = 'peaking'; snapPeak.frequency.setValueAtTime(5000, time); 
  snapPeak.gain.setValueAtTime(12, time); snapPeak.Q.setValueAtTime(2, time);
  
  const snapG = ctx.createGain();
  snapG.gain.setValueAtTime(0.4 * vel, time);
  snapG.gain.exponentialRampToValueAtTime(0.001, time + snapDur);
  
  snap.connect(snapShaper); snapShaper.connect(snapHP); 
  snapHP.connect(snapPeak); snapPeak.connect(snapG); snapG.connect(dest);
  snap.start(time);
  
  // Layer 2: Cuerpo del snare — noise más largo
  const bodyDur = 0.18;
  const bodyBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * bodyDur), ctx.sampleRate);
  const bd = bodyBuf.getChannelData(0);
  for (let i = 0; i < bd.length; i++) bd[i] = Math.random() * 2 - 1;
  const body = ctx.createBufferSource();
  body.buffer = bodyBuf;
  
  const bodyBP = ctx.createBiquadFilter();
  bodyBP.type = 'bandpass'; bodyBP.frequency.setValueAtTime(3000, time); bodyBP.Q.setValueAtTime(1.5, time);
  const bodyG = ctx.createGain();
  bodyG.gain.setValueAtTime(0.25 * vel, time);
  bodyG.gain.exponentialRampToValueAtTime(0.001, time + bodyDur);
  
  body.connect(bodyBP); bodyBP.connect(bodyG); bodyG.connect(dest);
  body.start(time);
  
  // Layer 3: Tono fundamental — pitched snap muy corto
  const tone = ctx.createOscillator();
  const toneG = ctx.createGain();
  tone.type = 'square';
  tone.frequency.setValueAtTime(280, time);
  tone.frequency.exponentialRampToValueAtTime(140, time + 0.03);
  toneG.gain.setValueAtTime(0.25 * vel, time);
  toneG.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  tone.connect(toneG); toneG.connect(dest);
  tone.start(time); tone.stop(time + 0.06);
  
  // Layer 4: High crack — el "tronido" extra
  const crackDur = 0.02;
  const crackBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * crackDur), ctx.sampleRate);
  const cd = crackBuf.getChannelData(0);
  for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1);
  const crack = ctx.createBufferSource();
  crack.buffer = crackBuf;
  
  const crackHP = ctx.createBiquadFilter();
  crackHP.type = 'highpass'; crackHP.frequency.setValueAtTime(10000, time);
  const crackPeak = ctx.createBiquadFilter();
  crackPeak.type = 'peaking'; crackPeak.frequency.setValueAtTime(13000, time); 
  crackPeak.gain.setValueAtTime(10, time); crackPeak.Q.setValueAtTime(3, time);
  
  const crackG = ctx.createGain();
  crackG.gain.setValueAtTime(0.3 * vel, time);
  crackG.gain.exponentialRampToValueAtTime(0.001, time + crackDur);
  
  crack.connect(crackHP); crackHP.connect(crackPeak); 
  crackPeak.connect(crackG); crackG.connect(dest);
  crack.start(time);
}

function darkTrapHat(ctx: AudioContext, time: number, vel: number, open: boolean | number, dest: GainNode) {
  const dur = 0.04; // Slightly longer for more punch
  
  const playHit = (t: number, v: number) => {
    // More aggressive noise buffer
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur * 2), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    
    // Distorsión para hacerlo más "tronado"
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = Math.tanh(x * 3.5); // Hard distortion
    }
    shaper.curve = curve;
    
    // Aggressive high-pass
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.setValueAtTime(9000, t);
    
    // Multiple peaks for metallic crunch
    const peak1 = ctx.createBiquadFilter();
    peak1.type = 'peaking'; peak1.frequency.setValueAtTime(11000, t); 
    peak1.gain.setValueAtTime(14, t); peak1.Q.setValueAtTime(4, t);
    
    const peak2 = ctx.createBiquadFilter();
    peak2.type = 'peaking'; peak2.frequency.setValueAtTime(14500, t); 
    peak2.gain.setValueAtTime(10, t); peak2.Q.setValueAtTime(3, t);
    
    const peak3 = ctx.createBiquadFilter();
    peak3.type = 'peaking'; peak3.frequency.setValueAtTime(18000, t); 
    peak3.gain.setValueAtTime(8, t); peak3.Q.setValueAtTime(2, t);
    
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18 * v, t); // Más fuerte
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    
    src.connect(shaper); shaper.connect(hp); 
    hp.connect(peak1); peak1.connect(peak2); 
    peak2.connect(peak3); peak3.connect(g); g.connect(dest);
    src.start(t);
  };

  playHit(time, vel);
  if (open === 1 || open === true) {
    // Double roll (TT) - two 32nd notes
    playHit(time + 0.05, vel * 0.85);
  } else if (open === 2) {
    // Triple roll (TTT) - three 32nd notes
    playHit(time + 0.033, vel * 0.9);
    playHit(time + 0.066, vel * 0.75);
  }
}

// DEEP 808 SUB BASS for dark trap — clean, sustained, massive sub
function scheduleDeep808(ctx: AudioContext, time: number, midi: number, duration: number, dest: GainNode) {
  cut808(ctx, time); // Kill previous 808
  const freq = NOTE(midi);
  
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  
  osc.frequency.setValueAtTime(freq * 1.1, time);
  osc.frequency.exponentialRampToValueAtTime(freq, time + 0.12);
  
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 128) - 1;
    curve[i] = Math.tanh(x * 0.8);
  }
  shaper.curve = curve;
  shaper.oversample = '4x';
  
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(freq * 2.5, time);
  lp.frequency.exponentialRampToValueAtTime(freq * 1.3, time + duration * 0.5);
  lp.Q.setValueAtTime(0.7, time);
  
  g.gain.setValueAtTime(0.001, time);
  g.gain.linearRampToValueAtTime(0.32, time + 0.06);
  g.gain.setValueAtTime(0.28, time + duration * 0.7);
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  osc.connect(shaper); shaper.connect(lp); lp.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + duration + 0.05);
  
  const sub = ctx.createOscillator();
  const sg = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(freq / 2, time);
  
  sg.gain.setValueAtTime(0.001, time);
  sg.gain.linearRampToValueAtTime(0.18, time + 0.08);
  sg.gain.setValueAtTime(0.15, time + duration * 0.6);
  sg.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  sub.connect(sg); sg.connect(dest);
  sub.start(time); sub.stop(time + duration + 0.05);
  
  prev808Nodes = { gains: [g, sg], oscs: [osc, sub], cutTime: time };
}

// ─── INSTRUMENT: Dark Organ (for Monarch) ───
function scheduleDarkOrgan(ctx: AudioContext, time: number, midi: number, duration: number, velocity: number, dest: GainNode) {
  const freq = NOTE(midi);
  // Organ: multiple sine harmonics (drawbar style)
  const harmonics = [1, 2, 3, 4, 6, 8];
  const hGains = [0.12, 0.08, 0.05, 0.03, 0.02, 0.01];
  harmonics.forEach((h, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * h, time);
    const attack = 0.15;
    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(hGains[i] * velocity, time + attack);
    g.gain.setValueAtTime(hGains[i] * velocity * 0.8, time + duration * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(g); g.connect(dest);
    osc.start(time); osc.stop(time + duration + 0.1);
  });
  // Distortion warmth
  const distOsc = ctx.createOscillator();
  const dg = ctx.createGain();
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let ci = 0; ci < 256; ci++) { const x = (ci/128)-1; curve[ci] = Math.tanh(x * 2); }
  shaper.curve = curve;
  distOsc.type = 'sawtooth';
  distOsc.frequency.setValueAtTime(freq, time);
  dg.gain.setValueAtTime(0.001, time);
  dg.gain.linearRampToValueAtTime(0.02 * velocity, time + 0.2);
  dg.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.8);
  distOsc.connect(shaper); shaper.connect(dg); dg.connect(dest);
  distOsc.start(time); distOsc.stop(time + duration + 0.1);
}

// ─── INSTRUMENT: Industrial Texture (for Monarch) ───
function scheduleIndustrialHit(ctx: AudioContext, time: number, duration: number, dest: GainNode) {
  // Metallic clang + distorted noise
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.setValueAtTime(800, time); bp.Q.setValueAtTime(5, time);
  bp.frequency.exponentialRampToValueAtTime(200, time + duration);
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let ci = 0; ci < 256; ci++) { const x = (ci/128)-1; curve[ci] = Math.tanh(x * 6); }
  shaper.curve = curve;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.06, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  src.connect(shaper); shaper.connect(bp); bp.connect(g); g.connect(dest);
  src.start(time);
}

// ─── MONARCH KIT: industrial kick, heavy snare, metallic perc ───
function monarchKick(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Massive distorted kick
  const body = ctx.createOscillator();
  const bg = ctx.createGain();
  body.type = 'sine';
  body.frequency.setValueAtTime(100, time);
  body.frequency.exponentialRampToValueAtTime(28, time + 0.15);
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let ci = 0; ci < 256; ci++) { const x = (ci/128)-1; curve[ci] = Math.tanh(x * 3); }
  shaper.curve = curve;
  bg.gain.setValueAtTime(0.35 * vel, time);
  bg.gain.exponentialRampToValueAtTime(0.001, time + 0.7);
  body.connect(shaper); shaper.connect(bg); bg.connect(dest);
  body.start(time); body.stop(time + 0.75);
}

function monarchSnare(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Heavy industrial snare
  const dur = 0.3;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.setValueAtTime(2000, time); bp.Q.setValueAtTime(1.2, time);
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let ci = 0; ci < 256; ci++) { const x = (ci/128)-1; curve[ci] = Math.tanh(x * 4); }
  shaper.curve = curve;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.18 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(shaper); shaper.connect(bp); bp.connect(g); g.connect(dest);
  src.start(time);
  // Tonal thud
  const tone = ctx.createOscillator();
  const tg = ctx.createGain();
  tone.type = 'square';
  tone.frequency.setValueAtTime(150, time);
  tone.frequency.exponentialRampToValueAtTime(80, time + 0.05);
  tg.gain.setValueAtTime(0.15 * vel, time);
  tg.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
  tone.connect(tg); tg.connect(dest);
  tone.start(time); tone.stop(time + 0.1);
}

function monarchHat(ctx: AudioContext, time: number, vel: number, open: boolean, dest: GainNode) {
  // Metallic industrial clang
  const dur = open ? 0.3 : 0.06;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(open ? 3000 : 5000, time);
  osc.detune.setValueAtTime(1200, time); // Very detuned for metallic quality
  g.gain.setValueAtTime(0.04 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.setValueAtTime(4000, time);
  osc.connect(hp); hp.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + dur + 0.05);
}


function scheduleLofiKeys(ctx: AudioContext, time: number, midi: number, duration: number, brightness: number, velocity: number, dest: GainNode) {
  const freq = NOTE(midi);
  // Electric piano: sine + square harmonic
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const g1 = ctx.createGain();
  const g2 = ctx.createGain();
  osc1.type = 'sine';
  osc2.type = 'square';
  osc1.frequency.setValueAtTime(freq, time);
  osc2.frequency.setValueAtTime(freq * 2, time); // 2nd harmonic
  osc2.detune.setValueAtTime(3, time);
  const attack = 0.01;
  const decay = duration * 0.6;
  g1.gain.setValueAtTime(0.001, time);
  g1.gain.linearRampToValueAtTime(0.12 * velocity, time + attack);
  g1.gain.exponentialRampToValueAtTime(0.04 * velocity, time + attack + 0.15);
  g1.gain.exponentialRampToValueAtTime(0.001, time + decay);
  g2.gain.setValueAtTime(0.001, time);
  g2.gain.linearRampToValueAtTime(0.03 * velocity, time + attack);
  g2.gain.exponentialRampToValueAtTime(0.001, time + decay * 0.5);
  // Lowpass + bitcrusher-like wobble
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(freq * 3 * brightness, time);
  lp.frequency.exponentialRampToValueAtTime(freq * 1.5, time + decay * 0.4);
  lp.Q.setValueAtTime(2, time);
  osc1.connect(g1); g1.connect(lp);
  osc2.connect(g2); g2.connect(lp);
  lp.connect(dest);
  osc1.start(time); osc1.stop(time + decay + 0.05);
  osc2.start(time); osc2.stop(time + decay + 0.05);
}

// ─── INSTRUMENT: Crystal Bell (for Titles) ───
function scheduleCrystalBell(ctx: AudioContext, time: number, midi: number, duration: number, velocity: number, dest: GainNode) {
  const freq = NOTE(midi);
  // Bell: sine + inharmonic partials
  const partials = [1, 2.756, 4.07, 5.404];
  const gains = [0.12, 0.06, 0.03, 0.015];
  partials.forEach((p, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * p, time);
    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(gains[i] * velocity, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration * (1 - i * 0.15));
    osc.connect(g); g.connect(dest);
    osc.start(time); osc.stop(time + duration + 0.1);
  });
}

// ─── INSTRUMENT: Haunting Strings (for History) ───
function scheduleHauntingStrings(ctx: AudioContext, time: number, midiNotes: number[], duration: number, gain: number, dest: GainNode) {
  const masterFilt = ctx.createBiquadFilter();
  masterFilt.type = 'lowpass';
  masterFilt.frequency.setValueAtTime(800, time);
  masterFilt.frequency.linearRampToValueAtTime(1200, time + duration * 0.3);
  masterFilt.frequency.linearRampToValueAtTime(600, time + duration);
  masterFilt.Q.setValueAtTime(1.5, time);
  masterFilt.connect(dest);
  midiNotes.forEach(midi => {
    const freq = NOTE(midi);
    // Sawtooth for string texture
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    osc.detune.setValueAtTime(Math.random() * 6 - 3, time);
    const attack = Math.min(2.0, duration * 0.35);
    const release = Math.min(2.0, duration * 0.3);
    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(gain * 0.2, time + attack);
    g.gain.setValueAtTime(gain * 0.2, time + duration - release);
    g.gain.linearRampToValueAtTime(0.001, time + duration);
    osc.connect(g); g.connect(masterFilt);
    osc.start(time); osc.stop(time + duration + 0.1);
  });
}

// ─── INSTRUMENT: Vinyl Crackle (for Skills lo-fi) ───
function scheduleVinylCrackle(ctx: AudioContext, time: number, duration: number, dest: GainNode) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    d[i] = Math.random() > 0.997 ? (Math.random() * 0.3 - 0.15) : (Math.random() * 0.002 - 0.001);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.setValueAtTime(2000, time);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.08, time);
  src.connect(hp); hp.connect(g); g.connect(dest);
  src.start(time);
}

// ─── INSTRUMENT: Choir Pad (for Titles) ───
function scheduleChoirPad(ctx: AudioContext, time: number, midiNotes: number[], duration: number, gain: number, dest: GainNode) {
  midiNotes.forEach(midi => {
    const freq = NOTE(midi);
    // Two detuned sines for "aah" choir
    [-5, 5].forEach(det => {
      const osc = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.detune.setValueAtTime(det, time);
      const attack = Math.min(1.8, duration * 0.3);
      const release = Math.min(2.0, duration * 0.35);
      g2.gain.setValueAtTime(0.001, time);
      g2.gain.linearRampToValueAtTime(gain * 0.25, time + attack);
      g2.gain.setValueAtTime(gain * 0.25, time + duration - release);
      g2.gain.linearRampToValueAtTime(0.001, time + duration);
      // Formant filter for vowel
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.setValueAtTime(700, time); bp.Q.setValueAtTime(2, time);
      osc.connect(bp); bp.connect(g2); g2.connect(dest);
      osc.start(time); osc.stop(time + duration + 0.1);
    });
  });
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

// ─── LO-FI KIT (for Skills): muffled kick, rim shot, soft hat ───
function lofiKick(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  const body = ctx.createOscillator();
  const bg = ctx.createGain();
  body.type = 'sine';
  body.frequency.setValueAtTime(90, time);
  body.frequency.exponentialRampToValueAtTime(40, time + 0.08);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(200, time);
  bg.gain.setValueAtTime(0.25 * vel, time);
  bg.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  body.connect(lp); lp.connect(bg); bg.connect(dest);
  body.start(time); body.stop(time + 0.35);
}

function lofiSnare(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Rim shot - short tonal click
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, time);
  osc.frequency.exponentialRampToValueAtTime(300, time + 0.02);
  g.gain.setValueAtTime(0.12 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.setValueAtTime(1200, time); bp.Q.setValueAtTime(1, time);
  osc.connect(bp); bp.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + 0.1);
}

function lofiHat(ctx: AudioContext, time: number, vel: number, open: boolean, dest: GainNode) {
  const dur = open ? 0.15 : 0.03;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur * 1.5), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(6000, time); // Muffled
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.04 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(lp); lp.connect(g); g.connect(dest);
  src.start(time);
}

// ─── EPIC KIT (for Titles): big reverby kick, orchestral snare, chimes ───
function epicKick(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  const body = ctx.createOscillator();
  const bg = ctx.createGain();
  body.type = 'sine';
  body.frequency.setValueAtTime(150, time);
  body.frequency.exponentialRampToValueAtTime(30, time + 0.2);
  bg.gain.setValueAtTime(0.3 * vel, time);
  bg.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
  body.connect(bg); bg.connect(dest);
  body.start(time); body.stop(time + 0.65);
  // Boom layer
  const boom = ctx.createOscillator();
  const boomG = ctx.createGain();
  boom.type = 'sine';
  boom.frequency.setValueAtTime(50, time);
  boomG.gain.setValueAtTime(0.15 * vel, time);
  boomG.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
  boom.connect(boomG); boomG.connect(dest);
  boom.start(time); boom.stop(time + 0.85);
}

function epicSnare(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Orchestral snare roll texture
  const dur = 0.25;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.setValueAtTime(3000, time); bp.Q.setValueAtTime(0.8, time);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.15 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(bp); bp.connect(g); g.connect(dest);
  src.start(time);
  // Tonal body
  const tone = ctx.createOscillator();
  const tg = ctx.createGain();
  tone.type = 'triangle'; tone.frequency.setValueAtTime(200, time);
  tg.gain.setValueAtTime(0.08 * vel, time);
  tg.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  tone.connect(tg); tg.connect(dest);
  tone.start(time); tone.stop(time + 0.12);
}

function epicHat(ctx: AudioContext, time: number, vel: number, open: boolean, dest: GainNode) {
  // Chime-like metallic hit
  const freq = open ? 4000 : 6000;
  const dur = open ? 0.4 : 0.08;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);
  g.gain.setValueAtTime(0.03 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  osc.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + dur + 0.05);
  // Harmonic
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.7, time);
  g2.gain.setValueAtTime(0.015 * vel, time);
  g2.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.7);
  osc2.connect(g2); g2.connect(dest);
  osc2.start(time); osc2.stop(time + dur + 0.05);
}

// ─── GHOSTLY KIT (for History): distant thuds, whisper perc ───
function ghostKick(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(60, time);
  osc.frequency.exponentialRampToValueAtTime(25, time + 0.25);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(100, time);
  g.gain.setValueAtTime(0.1 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
  osc.connect(lp); lp.connect(g); g.connect(dest);
  osc.start(time); osc.stop(time + 0.65);
}

function ghostPerc(ctx: AudioContext, time: number, vel: number, dest: GainNode) {
  // Whisper-like texture
  const dur = 0.35;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(1500, time);
  lp.frequency.exponentialRampToValueAtTime(400, time + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.025 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(lp); lp.connect(g); g.connect(dest);
  src.start(time);
}

// ─── THEME CONFIGS ───────────────────────────────────────

interface ThemeConfig {
  bpm: number;
  genre: 'trap' | 'house' | 'ambient' | 'darktrap' | 'lofi' | 'epic' | 'ghostly' | 'monarch';
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
    // Am dark progression — Am, F, G, Em
    chords: [
      [57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59], // Am F G Em
      [57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59], // repeat
    ],
    // 808 bass pattern: A2-A2---G2--- | A2---F2---E2 | A2-A2---G2--- | F2---E2---A2
    bassPattern: [1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0, 1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,
                  1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0, 1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
    // Lead melody: cada 2 sixteenths (8 notas por compás)
    keyPattern:  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,
                  1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    // Contra melodía: 3 notas por compás, espaciada
    arpPattern:  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0, 1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,
                  1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0, 1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
    padBrightness: 400,
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
  // ─── SKILLS: Lo-fi hip-hop chill ───
  skills: {
    bpm: 82,
    genre: 'lofi',
    // Jazzy chords: Dm9, Gm7, Cmaj7, Am7
    chords: [
      [50,53,57,60],[43,46,50,53],[48,52,55,59],[45,48,52,55],
      [50,53,57,60],[43,46,50,53],[48,52,55,59],[45,48,52,55],
    ],
    // Lazy boom-bap pattern
    bassPattern: [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0, 1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,
                  1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0, 1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    // Rhodes hits on off-beats
    keyPattern:  [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0, 0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,
                  0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0],
    arpPattern:  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    padBrightness: 500,
    padGain: 0.03,
    bassOctave: -1,
  },
  // ─── TITLES: Epic cinematic ───
  titles: {
    bpm: 68,
    genre: 'epic',
    // Dm — Bb — F — C (cinematic)
    chords: [
      [50,53,57],[46,50,53],[53,57,60],[48,52,55],
      [50,53,57],[46,50,53],[53,57,60],[48,52,55],
    ],
    // Sparse epic hits
    bassPattern: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    // Crystal bell melody
    keyPattern:  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0, 0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,
                  0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    // Choir pad sustained
    arpPattern:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    padBrightness: 1000,
    padGain: 0.06,
    bassOctave: -2,
  },
  // ─── HISTORY: Ghostly, melancholic ───
  history: {
    bpm: 55,
    genre: 'ghostly',
    // Cm — Ab — Eb — Gm (dark melancholic)
    chords: [
      [48,51,55],[44,48,51],[51,55,58],[43,46,50],
      [48,51,55],[44,48,51],[51,55,58],[43,46,50],
    ],
    // Very sparse
    bassPattern: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    // Haunting melody — very few notes
    keyPattern:  [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    // String pad
    arpPattern:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    padBrightness: 400,
    padGain: 0.04,
    bassOctave: -2,
  },
  // ─── MONARCH: Ominous industrial dark ambient ───
  monarch: {
    bpm: 62,
    genre: 'monarch',
    // Dm — Bbm — Fm — Ebm (oppressive, regal darkness)
    chords: [
      [50,53,57],[46,49,53],[41,44,48],[39,42,46],
      [50,53,57],[46,49,53],[41,44,48],[39,42,46],
    ],
    // Heavy, deliberate hits
    bassPattern: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    // Dark organ/bell melody
    keyPattern:  [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                  0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    // Industrial texture hits
    arpPattern:  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    padBrightness: 350,
    padGain: 0.05,
    bassOctave: -2,
  },
};

// Drum patterns: [kick, snare, closedHat, openHat (0=none, 1=double roll, 2=triple roll)]
type DrumStep = [number, number, number, number];


const DRUM_PATTERNS: Record<'trap' | 'house' | 'ambient' | 'darktrap' | 'lofi' | 'epic' | 'ghostly' | 'monarch', DrumStep[]> = {
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
  // Lo-fi: lazy boom-bap
  lofi: [
    [.6, 0, 0, 0],  [0,0,.3,0],[0,0,0,0],[0,0,.3,0],
    [0, .5, 0, 0],  [0,0,.3,0],[0,0,0,0],[0,0,.2,0],
    [0,  0, 0, 0],  [0,0,.3,0],[.5,0,0,0],[0,0,.3,0],
    [0, .5, 0, 0],  [0,0,.2,0],[0,0,0,.3],[0,0,.2,0],
    [.6, 0, 0, 0],  [0,0,.3,0],[0,0,0,0],[0,0,.3,0],
    [0, .5, 0, 0],  [0,0,.3,0],[0,0,0,0],[0,0,.2,0],
    [.4, 0, 0, 0],  [0,0,.3,0],[0,0,0,0],[0,0,.3,0],
    [0, .5, 0, 0],  [0,0,.2,0],[0,0,0,0],[0,0,.2,0],
  ],
  // Epic: sparse cinematic hits
  epic: [
    [.8, 0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,.3],[0,0,0,0],
    [0, .6, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [.5, 0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,.2],[0,0,0,0],
    [0, .7, 0, 0],  [0,0,0,0],[0,0,0,0],[.3,0,0,0],
  ],
  // Ghostly: barely there
  ghostly: [
    [.2, 0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,.15,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [.15, 0, 0, 0], [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,.1,0,0],
  ],
  // Monarch: heavy industrial
  monarch: [
    [.9, 0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,.4],[0,0,0,0],
    [0, .7, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[0,0,0,0],[.4,0,0,0],
    [.8, 0, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,.3],[0,0,0,0],[0,0,0,0],
    [0, .8, 0, 0],  [0,0,0,0],[0,0,0,0],[0,0,0,0],
    [0,  0, 0, 0],  [0,0,0,0],[.3,0,0,0],[0,.5,0,0],
  ],
};

// Genre-specific drum dispatchers
type DrumKit = {
  kick: (ctx: AudioContext, t: number, v: number, d: GainNode) => void;
  snare: (ctx: AudioContext, t: number, v: number, d: GainNode) => void;
  hat: (ctx: AudioContext, t: number, v: number, open: boolean, d: GainNode) => void;
};

const DRUM_KITS: Record<'trap' | 'house' | 'ambient' | 'darktrap' | 'lofi' | 'epic' | 'ghostly' | 'monarch', DrumKit> = {
  darktrap: { kick: darkTrapKick, snare: darkTrapSnare, hat: darkTrapHat },
  trap: { kick: trapKick, snare: trapSnare, hat: trapHat },
  house: { kick: houseKick, snare: houseClap, hat: houseHat },
  ambient: { kick: ambientKick, snare: ambientPerc, hat: (ctx, t, v, _o, d) => ambientPerc(ctx, t, v * 0.5, d) },
  lofi: { kick: lofiKick, snare: lofiSnare, hat: lofiHat },
  epic: { kick: epicKick, snare: epicSnare, hat: epicHat },
  ghostly: { kick: ghostKick, snare: ghostPerc, hat: (ctx, t, v, _o, d) => ghostPerc(ctx, t, v * 0.3, d) },
  monarch: { kick: monarchKick, snare: monarchSnare, hat: monarchHat },
};

// Genre-specific bass dispatchers
const BASS_FN: Record<'trap' | 'house' | 'ambient' | 'darktrap' | 'lofi' | 'epic' | 'ghostly' | 'monarch', (ctx: AudioContext, t: number, m: number, dur: number, d: GainNode) => void> = {
  darktrap: scheduleDeep808,
  trap: schedule808Sub,
  house: scheduleHouseBass,
  ambient: scheduleDrone,
  lofi: scheduleHouseBass,  // Filtered saw bass for lofi
  epic: scheduleDrone,       // Deep drone for epic
  ghostly: scheduleDrone,    // Ghostly drone
  monarch: scheduleDrone,    // Deep ominous drone for monarch
};

// ─── MAIN SEQUENCER WITH CROSSFADE (OPTIMIZED) ───

const FADE_DURATION = 1.5;

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
  const chunkSize = 2; // Programar solo 2 barras a la vez (reducido de 8)
  const chunkDur = barDur * chunkSize;

  const outputGain = ctx.createGain();
  outputGain.gain.setValueAtTime(0.001, ctx.currentTime);
  outputGain.connect(musicGain!);

  // Reverb/Delay — genre-specific wetness
  const delaySend = ctx.createDelay(2);
  delaySend.delayTime.setValueAtTime(sixteenthDur * 3, ctx.currentTime);
  const delayFb = ctx.createGain();
  const reverbWet = config.genre === 'darktrap' ? 0.4
    : config.genre === 'ghostly' ? 0.55
    : config.genre === 'epic' ? 0.45
    : config.genre === 'monarch' ? 0.5
    : config.genre === 'lofi' ? 0.3
    : 0.15;
  delayFb.gain.setValueAtTime(reverbWet, ctx.currentTime);
  const delayOut = ctx.createGain();
  delayOut.gain.setValueAtTime(reverbWet * 0.9, ctx.currentTime);
  const delaySendGain = ctx.createGain();
  delaySendGain.gain.setValueAtTime(1, ctx.currentTime);
  delaySendGain.connect(delaySend);
  delaySend.connect(delayFb); delayFb.connect(delaySend);
  delaySend.connect(delayOut); delayOut.connect(outputGain);

  let stopped = false;
  let nextScheduleTime = ctx.currentTime + 0.05;
  let currentBar = 0;

  function scheduleChunk(startTime: number, startBar: number) {
    if (stopped) return;

    for (let i = 0; i < chunkSize; i++) {
      const bar = (startBar + i) % 8;
      const barStart = startTime + i * barDur;
      const chord = config.chords[bar];
      const rootMidi = chord[0];

      // ── Pad layer — genre-specific ──
      if (config.genre === 'lofi') {
        // Lo-fi: warm pad + vinyl crackle
        scheduleWarmPad(ctx, barStart, chord.slice(0, 3), barDur, config.padGain, config.padBrightness, outputGain);
        if (bar % 2 === 0) scheduleVinylCrackle(ctx, barStart, barDur * 2, outputGain);
      } else if (config.genre === 'epic') {
        // Epic: choir pad
        scheduleChoirPad(ctx, barStart, chord.slice(0, 3), barDur, config.padGain, outputGain);
      } else if (config.genre === 'ghostly') {
        // Ghostly: haunting strings
        scheduleHauntingStrings(ctx, barStart, chord.slice(0, 3), barDur, config.padGain, outputGain);
      } else if (config.genre === 'monarch') {
        // Monarch: haunting strings + industrial textures
        scheduleHauntingStrings(ctx, barStart, chord.slice(0, 3), barDur, config.padGain * 0.7, outputGain);
        if (bar % 4 === 0) scheduleIndustrialHit(ctx, barStart + barDur * 0.5, barDur * 2, outputGain);
      } else if (config.genre !== 'darktrap') {
        scheduleWarmPad(ctx, barStart, chord, barDur, config.padGain, config.padBrightness, outputGain);
      }

      // ── Drone layer ──
      if ((config.genre === 'ambient' || config.genre === 'ghostly' || config.genre === 'monarch') && bar % 4 === 0) {
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

        // Bass
        const bassPatIdx = ((bar * 16) + step) % config.bassPattern.length;
        const bassPlays = config.genre === 'darktrap'
          ? (config.bassPattern[bassPatIdx] && kick > 0)
          : config.bassPattern[bassPatIdx];
        if (bassPlays) {
          if (config.genre === 'darktrap') {
            const bass808Notes = [45,45,43, 45,41,40, 45,45,43, 41,40,45];
            let bassHitCount = 0;
            const totalStep = (bar % 4) * 16 + step;
            for (let s = 0; s < totalStep; s++) {
              if (config.bassPattern[s % config.bassPattern.length]) bassHitCount++;
            }
            const bassMidi = bass808Notes[bassHitCount % bass808Notes.length];
            bassFn(ctx, stepTime, bassMidi, barDur * 1.5, outputGain);
          } else {
            const bassMidi = rootMidi + config.bassOctave * 12;
            const bassDur = (config.genre === 'ambient' || config.genre === 'ghostly' || config.genre === 'epic') ? barDur
              : config.genre === 'trap' ? sixteenthDur * 6
              : config.genre === 'lofi' ? sixteenthDur * 4
              : sixteenthDur * 3;
            bassFn(ctx, stepTime, bassMidi, bassDur, outputGain);
          }
        }

        // Lead melody — genre-specific instruments
        const keyPatIdx = ((bar * 16) + step) % config.keyPattern.length;
        if (config.keyPattern[keyPatIdx]) {
          if (config.genre === 'darktrap') {
            const darkLead = [
              69,76,79,76,69,76,72,76,
              69,76,79,76,69,76,74,72,
              69,79,76,72,69,72,74,76,
              79,76,74,72,69,72,76,69,
            ];
            let keyHitCount = 0;
            const totalStep = (bar % 4) * 16 + step;
            for (let s = 0; s < totalStep; s++) {
              if (config.keyPattern[s % config.keyPattern.length]) keyHitCount++;
            }
            const bellNote = darkLead[keyHitCount % darkLead.length];
            scheduleFMKeys(ctx, stepTime, bellNote, sixteenthDur * 2, 0.6, 0.7, outputGain);
          } else if (config.genre === 'lofi') {
            // Lo-fi Rhodes — jazzy chord tones
            const lofiMelody = [65,69,72,67,64,69,67,72, 65,67,69,64,67,72,69,65];
            let keyHitCount = 0;
            const totalStep = (bar % 4) * 16 + step;
            for (let s = 0; s < totalStep; s++) {
              if (config.keyPattern[s % config.keyPattern.length]) keyHitCount++;
            }
            const note = lofiMelody[keyHitCount % lofiMelody.length];
            scheduleLofiKeys(ctx, stepTime, note, sixteenthDur * 3, 0.7, 0.8, outputGain);
          } else if (config.genre === 'epic') {
            // Crystal bells — cinematic melody
            const epicMelody = [74,77,72,69,74,72,77,74, 69,72,74,77,72,69,74,72];
            let keyHitCount = 0;
            const totalStep = (bar % 4) * 16 + step;
            for (let s = 0; s < totalStep; s++) {
              if (config.keyPattern[s % config.keyPattern.length]) keyHitCount++;
            }
            const note = epicMelody[keyHitCount % epicMelody.length];
            scheduleCrystalBell(ctx, stepTime, note, sixteenthDur * 8, 0.8, outputGain);
          } else if (config.genre === 'ghostly') {
            // Haunting FM melody — very sparse, dark
            const ghostMelody = [67,63,60,58,63,60,67,63];
            let keyHitCount = 0;
            const totalStep = (bar % 4) * 16 + step;
            for (let s = 0; s < totalStep; s++) {
              if (config.keyPattern[s % config.keyPattern.length]) keyHitCount++;
            }
            const note = ghostMelody[keyHitCount % ghostMelody.length];
            scheduleFMKeys(ctx, stepTime, note, sixteenthDur * 6, 0.3, 0.5, outputGain);
          } else if (config.genre === 'monarch') {
            // Dark organ — ominous regal melody
            const monarchMelody = [62,65,58,53,57,62,58,53];
            let keyHitCount = 0;
            const totalStep = (bar % 4) * 16 + step;
            for (let s = 0; s < totalStep; s++) {
              if (config.keyPattern[s % config.keyPattern.length]) keyHitCount++;
            }
            const note = monarchMelody[keyHitCount % monarchMelody.length];
            scheduleDarkOrgan(ctx, stepTime, note, sixteenthDur * 8, 0.7, outputGain);
          } else {
            const brightness = config.genre === 'house' ? 1.5 : config.genre === 'trap' ? 0.8 : 0.4;
            const bellNote = chord[chord.length - 1] + 12;
            scheduleFMKeys(ctx, stepTime, bellNote, sixteenthDur * 4, brightness, 0.7, outputGain);
          }
        }

        // Counter melody / arp
        const arpPatIdx = ((bar * 16) + step) % config.arpPattern.length;
        if (config.arpPattern[arpPatIdx]) {
          if (config.genre === 'darktrap') {
            const counterMelody = [57,60,64, 55,57,64, 53,57,60, 55,64,57];
            let arpHitCount = 0;
            const totalStep = (bar % 4) * 16 + step;
            for (let s = 0; s < totalStep; s++) {
              if (config.arpPattern[s % config.arpPattern.length]) arpHitCount++;
            }
            const arpNote = counterMelody[arpHitCount % counterMelody.length];
            schedulePluck(ctx, stepTime, arpNote, sixteenthDur * 5, outputGain);
          } else if (config.genre === 'lofi') {
            const arpNote = chord[step % chord.length] + 12;
            schedulePluck(ctx, stepTime, arpNote, sixteenthDur * 6, outputGain);
          } else if (config.genre === 'epic') {
            scheduleChoirPad(ctx, stepTime, chord.slice(0, 3), barDur * 2, config.padGain * 0.8, outputGain);
          } else if (config.genre === 'ghostly') {
            scheduleHauntingStrings(ctx, stepTime, [chord[0], chord[1]], barDur, config.padGain * 0.6, outputGain);
          } else if (config.genre === 'monarch') {
            // Industrial texture hit
            scheduleIndustrialHit(ctx, stepTime, barDur * 0.8, outputGain);
          } else {
            const arpNote = chord[step % chord.length] + 12;
            schedulePluck(ctx, stepTime, arpNote, sixteenthDur * 3, outputGain);
          }
        }
      }
    }
  }

  scheduleChunk(nextScheduleTime, currentBar);
  nextScheduleTime += chunkDur;
  currentBar = (currentBar + chunkSize) % 8;

  // Scheduler más frecuente con lookahead reducido (1s en vez de 3s)
  const schedulerTimer = setInterval(() => {
    if (stopped) return;
    if (ctx.currentTime > nextScheduleTime - 1.0) {
      scheduleChunk(nextScheduleTime, currentBar);
      nextScheduleTime += chunkDur;
      currentBar = (currentBar + chunkSize) % 8;
    }
  }, 250); // Check cada 250ms

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
        delaySend.disconnect(); 
        delayFb.disconnect(); 
        delayOut.disconnect(); 
        delaySendGain.disconnect();
      } catch {}
    },
    fadeOut: (duration: number) => {
      instance.stopped = true;
      stopped = true;
      clearInterval(schedulerTimer);
      const ctx2 = getCtx();
      try {
        outputGain.gain.cancelScheduledValues(ctx2.currentTime);
        outputGain.gain.setValueAtTime(outputGain.gain.value, ctx2.currentTime);
        outputGain.gain.linearRampToValueAtTime(0.001, ctx2.currentTime + duration);
      } catch {}
      setTimeout(() => {
        try {
          outputGain.disconnect();
          delaySend.disconnect();
          delayFb.disconnect();
          delayOut.disconnect();
          delaySendGain.disconnect();
        } catch {}
      }, duration * 1000 + 100);
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
