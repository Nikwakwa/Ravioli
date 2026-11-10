/**
 * Cozy sound effects, synthesized with the Web Audio API (no audio files to download).
 * Everything is a silent no-op when muted or where Web Audio is unavailable (tests, old browsers).
 */

export type SoundName =
  | 'purr'
  | 'purr_soft'
  | 'chirp'
  | 'meow'
  | 'crunch'
  | 'munch'
  | 'slurp'
  | 'water'
  | 'brush'
  | 'mist'
  | 'scoop'
  | 'refuse'
  | 'yawn'
  | 'pop'
  | 'miss'
  | 'chime';

const LS_MUTED = 'ravioli:v1:sound_muted';
const MASTER_VOLUME = 1;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let muted = loadMuted();
let listenersBound = false;
const lastPlayedAt = new Map<SoundName, number>();
const muteListeners = new Set<() => void>();

function loadMuted(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(LS_MUTED) === '1';
  } catch {
    return false;
  }
}

export function isMuted(): boolean {
  return muted;
}

/** For React's useSyncExternalStore. */
export function subscribeMuted(listener: () => void): () => void {
  muteListeners.add(listener);
  return () => muteListeners.delete(listener);
}

export function setMuted(next: boolean): void {
  if (muted === next) return;
  muted = next;
  try {
    localStorage.setItem(LS_MUTED, next ? '1' : '0');
  } catch {
    /* no-op */
  }
  if (next) void ctx?.suspend().catch(() => undefined);
  else void ctx?.resume().catch(() => undefined);
  muteListeners.forEach((l) => l());
}

function audioContextCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function getCtx(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    const Ctor = audioContextCtor();
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = MASTER_VOLUME;
      const limiter = ctx.createDynamicsCompressor();
      master.connect(limiter);
      limiter.connect(ctx.destination);
    } catch {
      ctx = null;
      master = null;
      return null;
    }
    bindListeners();
  }
  if (ctx.state === 'suspended' && !isHidden()) void ctx.resume().catch(() => undefined);
  return ctx;
}

function isHidden(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden';
}

/** Browsers only allow sound after a tap, and phones pause it in the background. */
function bindListeners(): void {
  if (listenersBound || typeof window === 'undefined') return;
  listenersBound = true;
  window.addEventListener(
    'pointerdown',
    () => {
      if (!muted && ctx?.state === 'suspended') void ctx.resume().catch(() => undefined);
    },
    { passive: true },
  );
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (isHidden()) void ctx.suspend().catch(() => undefined);
    else if (!muted) void ctx.resume().catch(() => undefined);
  });
}

function getNoise(c: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== c.sampleRate) {
    noiseBuffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function noiseSource(c: AudioContext, t0: number, dur: number): AudioBufferSourceNode {
  const src = c.createBufferSource();
  src.buffer = getNoise(c);
  src.loop = true;
  src.start(t0, Math.random() * 1.5);
  src.stop(t0 + dur + 0.05);
  return src;
}

/** Gain node that fades in to `peak` and back out to silence. */
function envelope(c: AudioContext, t0: number, peak: number, attack: number, dur: number): GainNode {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  return g;
}

function filter(c: AudioContext, type: BiquadFilterType, freq: number, q = 1): BiquadFilterNode {
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

/** A short filtered-noise burst (crunches, licks, swishes, spritzes). */
function burst(
  c: AudioContext,
  out: AudioNode,
  t0: number,
  o: { dur: number; peak: number; attack?: number; type?: BiquadFilterType; from: number; to?: number; q?: number },
): void {
  const src = noiseSource(c, t0, o.dur);
  const f = filter(c, o.type ?? 'bandpass', o.from, o.q ?? 1);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + o.dur);
  const g = envelope(c, t0, o.peak, o.attack ?? 0.005, o.dur);
  src.connect(f).connect(g).connect(out);
}

/** A voiced tone that glides through `freqs` (meows, chirps, blips). */
function voice(
  c: AudioContext,
  out: AudioNode,
  t0: number,
  o: {
    dur: number;
    peak: number;
    freqs: number[];
    wave?: OscillatorType;
    attack?: number;
    /** Rolled "rr" flutter in Hz. */
    trill?: number;
    lowpass?: number;
  },
): void {
  const osc = c.createOscillator();
  osc.type = o.wave ?? 'triangle';
  osc.frequency.setValueAtTime(o.freqs[0], t0);
  const step = o.dur / Math.max(1, o.freqs.length - 1);
  o.freqs.slice(1).forEach((f, i) => osc.frequency.exponentialRampToValueAtTime(f, t0 + step * (i + 1)));
  const g = envelope(c, t0, o.peak, o.attack ?? 0.02, o.dur);
  let tail: AudioNode = osc;
  if (o.lowpass) tail = tail.connect(filter(c, 'lowpass', o.lowpass, 0.7));
  if (o.trill) {
    const am = c.createGain();
    am.gain.value = 0.6;
    const lfo = c.createOscillator();
    lfo.frequency.value = o.trill;
    const depth = c.createGain();
    depth.gain.value = 0.4;
    lfo.connect(depth).connect(am.gain);
    lfo.start(t0);
    lfo.stop(t0 + o.dur + 0.05);
    tail = tail.connect(am);
  }
  tail.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + o.dur + 0.05);
}

/** Rhythmic purr: soft rumble pulsing ~25 times a second, breathing in and out. */
function purr(c: AudioContext, out: AudioNode, t0: number, dur: number, peak: number): void {
  const src = noiseSource(c, t0, dur);
  const body = filter(c, 'bandpass', 260, 0.9);
  const pulse = c.createGain();
  pulse.gain.value = 0.5;
  const lfo = c.createOscillator();
  lfo.type = 'sawtooth';
  lfo.frequency.value = 25;
  const depth = c.createGain();
  depth.gain.value = 0.5;
  lfo.connect(depth).connect(pulse.gain);
  lfo.start(t0);
  lfo.stop(t0 + dur + 0.05);

  const breath = c.createGain();
  breath.gain.setValueAtTime(0.0001, t0);
  const half = 0.55;
  for (let t = 0, i = 0; t < dur - 0.1; t += half, i++) {
    const inhale = i % 2 === 0;
    body.frequency.setTargetAtTime(inhale ? 300 : 230, t0 + t, 0.08);
    lfo.frequency.setTargetAtTime(inhale ? 27 : 23, t0 + t, 0.08);
    breath.gain.linearRampToValueAtTime(peak * (inhale ? 1 : 0.8), t0 + t + 0.14);
    breath.gain.linearRampToValueAtTime(peak * 0.35, t0 + Math.min(dur - 0.1, t + half));
  }
  breath.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  src.connect(body).connect(pulse).connect(breath).connect(out);
}

type Player = (c: AudioContext, out: AudioNode, t0: number) => void;

const SOUNDS: Record<SoundName, Player> = {
  purr: (c, out, t) => purr(c, out, t, 2.3, 1.5),
  purr_soft: (c, out, t) => purr(c, out, t, 1.7, 0.7),

  // Friendly "mrp?"
  chirp: (c, out, t) =>
    voice(c, out, t, { dur: 0.2, peak: 0.22, freqs: [520, 640, 900], wave: 'sawtooth', trill: 32, lowpass: 2600 }),

  // Small "meow" for cravings
  meow: (c, out, t) =>
    voice(c, out, t, {
      dur: 0.55,
      peak: 0.2,
      freqs: [560, 860, 780, 520],
      wave: 'sawtooth',
      attack: 0.06,
      lowpass: 2200,
    }),

  // Crisp crunching (Chicken Heart)
  crunch: (c, out, t) => {
    [0, 0.19, 0.42, 0.6, 0.86, 1.05, 1.32].forEach((at, i) =>
      burst(c, out, t + at, { dur: 0.07, peak: 0.28 - (i % 2) * 0.08, type: 'highpass', from: 1700 + i * 90, q: 0.8 }),
    );
  },

  // Softer nibbling (wet food, quail egg)
  munch: (c, out, t) => {
    [0, 0.26, 0.5, 0.8, 1.05, 1.36, 1.6].forEach((at, i) =>
      burst(c, out, t + at, { dur: 0.1, peak: 0.8, from: 900 + (i % 3) * 140, to: 600, q: 1.4 }),
    );
  },

  // Quick licks (Churu)
  slurp: (c, out, t) => {
    for (let i = 0; i < 9; i++) {
      burst(c, out, t + i * 0.19, { dur: 0.11, peak: 0.75, attack: 0.03, from: 650, to: 1900, q: 2.5 });
    }
  },

  // Trickling fountain: bubbly drips over a faint stream
  water: (c, out, t) => {
    burst(c, out, t, { dur: 2.4, peak: 0.05, attack: 0.3, type: 'highpass', from: 3200, q: 0.5 });
    for (let i = 0; i < 26; i++) {
      const at = t + Math.random() * 2.2;
      const f = 650 + Math.random() * 1100;
      voice(c, out, at, { dur: 0.07, peak: 0.1, freqs: [f, f * 1.6], wave: 'sine', attack: 0.008 });
    }
  },

  // Brush strokes
  brush: (c, out, t) => {
    for (let i = 0; i < 4; i++) {
      burst(c, out, t + i * 0.42, { dur: 0.3, peak: 0.26, attack: 0.08, from: 2300, to: 4200, q: 0.9 });
    }
  },

  // Two spritzes of mist
  mist: (c, out, t) => {
    burst(c, out, t, { dur: 0.3, peak: 0.16, attack: 0.02, type: 'highpass', from: 4200, q: 0.5 });
    burst(c, out, t + 0.45, { dur: 0.3, peak: 0.16, attack: 0.02, type: 'highpass', from: 4200, q: 0.5 });
  },

  // Gritty litter scoops / sweeping
  scoop: (c, out, t) => {
    for (let i = 0; i < 3; i++) {
      burst(c, out, t + i * 0.27, { dur: 0.2, peak: 0.36, attack: 0.04, from: 1500, to: 2600, q: 0.8 });
    }
  },

  // Grumbly "mrr" when he says no
  refuse: (c, out, t) =>
    voice(c, out, t, { dur: 0.34, peak: 0.34, freqs: [430, 300], wave: 'sawtooth', trill: 26, lowpass: 1600 }),

  yawn: (c, out, t) =>
    voice(c, out, t, { dur: 0.8, peak: 0.18, freqs: [460, 700, 380], wave: 'triangle', attack: 0.2, lowpass: 1800 }),

  // Minigame hit / miss
  pop: (c, out, t) => voice(c, out, t, { dur: 0.1, peak: 0.2, freqs: [620, 980], wave: 'sine', attack: 0.005 }),
  miss: (c, out, t) => voice(c, out, t, { dur: 0.14, peak: 0.14, freqs: [320, 220], wave: 'sine', attack: 0.005 }),

  // Sparkly reward
  chime: (c, out, t) => {
    [1319, 1760, 2093].forEach((f, i) =>
      voice(c, out, t + i * 0.09, { dur: 0.5, peak: 0.12, freqs: [f, f], wave: 'sine', attack: 0.01 }),
    );
  },
};

/** How long a sound must wait before it can be triggered again (ms). */
const MIN_GAP_MS: Partial<Record<SoundName, number>> = { purr: 2000, purr_soft: 1500, water: 1500 };

export function playSound(name: SoundName): void {
  const c = getCtx();
  if (!c || !master) return;
  const nowMs = Date.now();
  if (nowMs - (lastPlayedAt.get(name) ?? 0) < (MIN_GAP_MS[name] ?? 90)) return;
  lastPlayedAt.set(name, nowMs);
  try {
    SOUNDS[name](c, master, c.currentTime + 0.02);
  } catch {
    /* sound is never worth breaking the game for */
  }
}

/** Which sound goes with a care action / game event. */
export function soundForAction(actionId: string): SoundName | null {
  switch (actionId) {
    case 'chin_scratch':
      return 'purr';
    case 'wet_food':
    case 'quail_egg':
      return 'munch';
    case 'chicken_heart':
      return 'crunch';
    case 'churu':
      return 'slurp';
    case 'fountain':
      return 'water';
    case 'brush':
      return 'brush';
    case 'pheromone_mist':
      return 'mist';
    case 'scoop_mess':
      return 'scoop';
    case 'feather_wand':
    case 'laser_pointer':
    case 'tail_chase':
    case 'red_ball':
      return 'chirp';
    case 'toggle_sleep':
      return 'yawn';
    case 'refuse':
    case 'tummy_ache':
      return 'refuse';
    case 'emergency_revive':
      return 'chime';
    default:
      return null;
  }
}

export function playActionSound(actionId: string): void {
  const name = soundForAction(actionId);
  if (name) playSound(name);
}
