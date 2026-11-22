import type { TimeOfDay } from './atmosphere';

export type VisitorKind = 'pigeon' | 'robin' | 'dove' | 'butterfly' | 'moth';

export interface BalconyVisitor {
  id: string;
  kind: VisitorKind;
  /** SVG x coordinate inside Balcony's 400×600 viewBox (safe mobile bounds: 75..325). */
  x: number;
  /** SVG y coordinate inside Balcony's 400×600 viewBox. */
  y: number;
  /** 1 = facing right, -1 = facing left. */
  facing: 1 | -1;
  /** True when the visitor hovers in the air instead of perching on the handrail. */
  hovering: boolean;
}

export interface VisitorMeta {
  name: string;
  emoji: string;
  hovering: boolean;
  /** Short, player-facing reaction message when Oli pounces at this visitor. */
  pounceLine: (catName: string) => string;
}

export const BALCONY_ACTION_ID = 'balcony_watch';
export const BALCONY_VISITOR_JOY = 4;
export const BALCONY_VISITOR_COOLDOWN_MS = 20_000;

export const VISITOR_META: Record<VisitorKind, VisitorMeta> = {
  pigeon: {
    name: 'pigeon',
    emoji: '🕊️',
    hovering: false,
    pounceLine: (cat) => `🕊️ Ek-ek-ek! ${cat} pounced at the pigeon!`,
  },
  robin: {
    name: 'robin',
    emoji: '🐦',
    hovering: false,
    pounceLine: (cat) => `🐦 Chirp! ${cat} leaped at the little robin!`,
  },
  dove: {
    name: 'morning dove',
    emoji: '🕊️',
    hovering: false,
    pounceLine: (cat) => `🕊️ ${cat} wiggled and pounced at the dove!`,
  },
  butterfly: {
    name: 'butterfly',
    emoji: '🦋',
    hovering: true,
    pounceLine: (cat) => `🦋 ${cat} leaped for the butterfly!`,
  },
  moth: {
    name: 'evening moth',
    emoji: '🦋',
    hovering: true,
    pounceLine: (cat) => `✨ ${cat} swatted at the glowing moth!`,
  },
};

/** Safe-bounded perches right on top of the stainless-steel balcony handrail (y = 207). */
export const RAIL_PERCHES: ReadonlyArray<{ x: number; y: number; facing: 1 | -1 }> = [
  { x: 108, y: 207, facing: 1 },
  { x: 223, y: 207, facing: -1 },
  { x: 314, y: 207, facing: -1 },
];

/** Safe-bounded air spots fluttering right above the pansy planter boxes. */
export const HOVER_SPOTS: ReadonlyArray<{ x: number; y: number; facing: 1 | -1 }> = [
  { x: 176, y: 184, facing: 1 },
  { x: 266, y: 184, facing: -1 },
  { x: 120, y: 178, facing: 1 },
];

/** Returns which wildlife species can visit the balcony for the given time of day & rain state. */
export function visitorPoolFor(timeOfDay: TimeOfDay, isRaining: boolean): readonly VisitorKind[] {
  if (timeOfDay === 'night') {
    return ['moth'];
  }
  if (timeOfDay === 'sunset') {
    return isRaining ? ['pigeon', 'dove'] : ['dove', 'butterfly', 'robin'];
  }
  // Daytime
  return isRaining ? ['pigeon', 'robin'] : ['pigeon', 'robin', 'butterfly'];
}

let visitorSeq = 0;

/** Picks a time-of-day balcony visitor placed at a safe, unclipped railing or flower spot. */
export function pickBalconyVisitor(
  timeOfDay: TimeOfDay,
  isRaining: boolean,
  seed: number = Math.random(),
  spotSeed: number = Math.random(),
): BalconyVisitor {
  const pool = visitorPoolFor(timeOfDay, isRaining);
  const clampedSeed = Math.min(0.999999, Math.max(0, seed));
  const clampedSpot = Math.min(0.999999, Math.max(0, spotSeed));
  const kind = pool[Math.floor(clampedSeed * pool.length)];
  const hovering = VISITOR_META[kind].hovering;
  const spots = hovering ? HOVER_SPOTS : RAIL_PERCHES;
  const spot = spots[Math.floor(clampedSpot * spots.length)];

  return {
    id: `visitor-${++visitorSeq}-${kind}`,
    kind,
    x: spot.x,
    y: spot.y,
    facing: spot.facing,
    hovering,
  };
}
