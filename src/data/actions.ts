import type { CatAnimation, CatStats, CatWhim, LiveCat, StatKey } from '../types';

export type ActionCategory = 'feed' | 'play' | 'care' | 'rest';

export type ParticleKind = 'hearts' | 'ripples' | 'purr' | 'sparkles' | 'mist' | 'crumbs' | 'stars';

export interface CareAction {
  id: string;
  category: ActionCategory;
  /** Full product-style name. */
  name: string;
  /** Short label for the dock card. */
  short: string;
  effect: Partial<CatStats>;
  animation: CatAnimation;
  particles: ParticleKind[];
  /** Past-tense phrase for logs/notices. `{cat}` is replaced with the cat's name. */
  log: string;
  /** Blocked while the cat is asleep. */
  requiresAwake: boolean;
  /** Vibration pattern (ms) on Android. */
  haptic: number | number[];
  /** Minutes of "relaxed" mood granted. */
  calmMinutes?: number;
  /** Visual length of the animation (ms). */
  durationMs: number;
  /** Oli refuses this meal if his Hunger is already at or above this threshold. */
  maxHunger?: number;
  /** Oli refuses water if his Hydration is already at or above this threshold. */
  maxHydration?: number;
  /** Oli refuses this play action if his Energy is below this threshold. */
  minEnergy?: number;
  /** Counts toward the treat-spam / tummy-ache counter. */
  isTreat?: boolean;
  /** Helps soothe a tummy ache when Oli overate treats. */
  soothesTummy?: boolean;
}

/** Sleep & overfeeding rule constants. */
export const MAX_SLEEP_ENERGY = 85;
export const MIN_WAKE_ENERGY = 20;
export const AUTO_NAP_ENERGY = 5;
export const TREAT_WINDOW_MS = 15 * 60_000;
export const MAX_TREATS_IN_WINDOW = 3;
export const TUMMY_ACHE_MS = 10 * 60_000;
export const PET_COOLDOWN_MS = 20_000;
export const PET_JOY_BOOST = 6;
export const MAX_ROOM_MESSES = 3;
export const MESS_SPAWN_HOURS = 2.5;
export const DEFAULT_CHURU_STASH = 1;
export const MAX_CHURU_STASH = 99;
export const WHIM_DURATION_MS = 8 * 60_000;
/** A new craving comes 12–20 minutes after the last one ended (so they feel special, not spammy). */
export const WHIM_COOLDOWN_MS = 12 * 60_000;
export const WHIM_COOLDOWN_JITTER_MS = 8 * 60_000;
/** A craving that ran out more than this long ago expired while nobody was looking: no Joy penalty. */
export const WHIM_UNSEEN_GRACE_MS = 2 * 60_000;

/** Churus are earned in points: 3 points = 1 Churu tube, and at most 3 tubes can be earned per day. */
export const CHURU_POINTS_PER_TUBE = 3;
export const MAX_CHURUS_EARNED_PER_DAY = 3;

/** Milliseconds to wait after the last craving before Oli asks for something new. */
export function whimCooldownAfter(lastWhimAt: number): number {
  // Stable pseudo-random jitter derived from the timestamp, so reloads don't reshuffle it.
  const jitter = Math.abs(Math.floor(lastWhimAt)) % WHIM_COOLDOWN_JITTER_MS;
  return WHIM_COOLDOWN_MS + jitter;
}

export interface ChuruProgress {
  /** Points collected toward the next tube (0–2). */
  points: number;
  /** Tubes earned on `day`. */
  earnedToday: number;
  /** Local calendar day (YYYY-MM-DD) that `earnedToday` belongs to. */
  day: string;
}

export function localDayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Adds churu points and converts every full set of points into a tube, respecting the daily limit.
 * Pure function: returns the new progress plus how many tubes were just earned.
 */
export function addChuruPoints(
  progress: ChuruProgress,
  points: number,
  nowMs: number,
): { progress: ChuruProgress; tubesEarned: number; dailyLimitReached: boolean } {
  const day = localDayKey(nowMs);
  let next: ChuruProgress = progress.day === day ? { ...progress } : { points: progress.points, earnedToday: 0, day };
  if (next.earnedToday >= MAX_CHURUS_EARNED_PER_DAY) {
    return { progress: { ...next, points: 0 }, tubesEarned: 0, dailyLimitReached: true };
  }
  let tubesEarned = 0;
  next.points += Math.max(0, Math.floor(points));
  while (next.points >= CHURU_POINTS_PER_TUBE && next.earnedToday < MAX_CHURUS_EARNED_PER_DAY) {
    next.points -= CHURU_POINTS_PER_TUBE;
    next.earnedToday += 1;
    tubesEarned += 1;
  }
  const dailyLimitReached = next.earnedToday >= MAX_CHURUS_EARNED_PER_DAY;
  if (dailyLimitReached) next = { ...next, points: 0 };
  return { progress: next, tubesEarned, dailyLimitReached };
}

export const CATEGORIES: { id: ActionCategory; label: string }[] = [
  { id: 'feed', label: 'Feed' },
  { id: 'play', label: 'Play' },
  { id: 'care', label: 'Care' },
  { id: 'rest', label: 'Rest' },
];

export const CARE_ACTIONS: CareAction[] = [
  // ---------------------------------------------------------------------------
  // FEED — Differentiated meals & treats with fullness + messy whiskers trade-offs
  // ---------------------------------------------------------------------------
  {
    id: 'wet_food',
    category: 'feed',
    name: 'Wet Food Pouch',
    short: 'Wet Food',
    effect: { hunger: 38, hydration: 5, hygiene: -4 },
    animation: 'eating',
    particles: ['crumbs'],
    log: 'Served {cat} a wet food pouch',
    requiresAwake: true,
    haptic: 25,
    durationMs: 2600,
    maxHunger: 85,
  },
  {
    id: 'quail_egg',
    category: 'feed',
    name: 'Quail Egg Topper',
    short: 'Quail Egg',
    effect: { hunger: 20, energy: 10, happiness: 8 },
    animation: 'eating_egg',
    particles: ['crumbs', 'stars'],
    log: 'Topped {cat}’s bowl with a freeze-dried quail egg',
    requiresAwake: true,
    haptic: 25,
    durationMs: 2400,
    maxHunger: 90,
  },
  {
    id: 'chicken_heart',
    category: 'feed',
    name: 'Chicken Heart Treat',
    short: 'Chicken Heart',
    effect: { hunger: 12, happiness: 18 },
    animation: 'treat',
    particles: ['hearts'],
    log: 'Fed {cat} a freeze-dried chicken heart',
    requiresAwake: true,
    haptic: [20, 40, 20],
    durationMs: 2200,
    isTreat: true,
  },
  {
    id: 'churu',
    category: 'feed',
    name: 'Churu Lickable Treat',
    short: 'Churu Tube',
    effect: { hunger: 10, hydration: 12, happiness: 30 },
    animation: 'churu',
    particles: ['hearts', 'sparkles'],
    log: 'Fed {cat} a Churu lickable tube',
    requiresAwake: true,
    haptic: [25, 35, 25, 35, 40],
    durationMs: 3000,
    isTreat: true,
  },

  // ---------------------------------------------------------------------------
  // PLAY — Active workouts that boost Joy and burn Energy + Hunger
  // ---------------------------------------------------------------------------
  {
    id: 'feather_wand',
    category: 'play',
    name: 'Feather Wand',
    short: 'Feather Wand',
    effect: { happiness: 22, energy: -10, hunger: -4 },
    animation: 'playing',
    particles: ['stars'],
    log: 'Played the feather wand game with {cat}',
    requiresAwake: true,
    haptic: [30, 60, 30, 60, 30],
    durationMs: 3200,
    minEnergy: 15,
  },
  {
    id: 'laser_pointer',
    category: 'play',
    name: 'Laser Zoomies',
    short: 'Laser Zoomies',
    effect: { happiness: 32, energy: -18, hunger: -8, hydration: -5 },
    animation: 'laser',
    particles: ['stars', 'sparkles'],
    log: 'Sent {cat} on full-speed laser zoomies!',
    requiresAwake: true,
    haptic: [25, 40, 25, 40, 25, 40, 30],
    durationMs: 3200,
    minEnergy: 25,
  },
  {
    id: 'tail_chase',
    category: 'play',
    name: 'Tail Spin Chase',
    short: 'Chase Tail',
    effect: { happiness: 18, energy: -8, hunger: -3 },
    animation: 'tail_chase',
    particles: ['stars'],
    log: 'Watched {cat} spin in circles chasing his own tail!',
    requiresAwake: true,
    haptic: [20, 40, 20, 40, 25],
    durationMs: 3000,
    minEnergy: 12,
  },
  {
    id: 'red_ball',
    category: 'play',
    name: 'Small Red Ball',
    short: 'Red Ball',
    effect: { happiness: 26, energy: -14, hunger: -6, hydration: -3 },
    animation: 'red_ball',
    particles: ['stars', 'sparkles'],
    log: 'Chased the small red ball across the floor with {cat}!',
    requiresAwake: true,
    haptic: [25, 45, 25, 45, 30],
    durationMs: 3200,
    minEnergy: 20,
  },

  // ---------------------------------------------------------------------------
  // CARE — Hydration & Grooming
  // ---------------------------------------------------------------------------
  {
    id: 'fountain',
    category: 'care',
    name: 'Refresh Water Fountain',
    short: 'Fresh Fountain',
    effect: { hydration: 40, happiness: 5 },
    animation: 'drinking',
    particles: ['ripples'],
    log: 'Refreshed {cat}’s water fountain',
    requiresAwake: true,
    haptic: [15, 30, 15],
    durationMs: 2800,
    maxHydration: 95,
  },
  {
    id: 'brush',
    category: 'care',
    name: 'Brush Coat',
    short: 'Brush Coat',
    effect: { hygiene: 30, happiness: 6 },
    animation: 'brushing',
    particles: ['sparkles'],
    log: 'Brushed {cat}’s fluffy ginger coat',
    requiresAwake: true,
    haptic: [20, 50, 20, 50, 20],
    durationMs: 2800,
    soothesTummy: true,
  },
  {
    id: 'scoop_mess',
    category: 'care',
    name: 'Scoop & Clean Litter Box',
    short: 'Scoop Box',
    effect: { hygiene: 15, happiness: 6 },
    animation: 'purring',
    particles: ['sparkles'],
    log: 'Scooped and cleaned {cat}’s litter box',
    requiresAwake: false,
    haptic: [20, 35, 20],
    durationMs: 1800,
  },

  // ---------------------------------------------------------------------------
  // REST — Calming Pheromone Mist (+ Nap Mode button in ActionDock)
  // ---------------------------------------------------------------------------
  {
    id: 'pheromone_mist',
    category: 'rest',
    name: 'Calming Mist',
    short: 'Calming Mist',
    effect: { happiness: 15 },
    animation: 'misting',
    particles: ['mist'],
    log: 'Spritzed calming pheromone mist for {cat}',
    requiresAwake: false,
    haptic: 15,
    calmMinutes: 45,
    durationMs: 2600,
    soothesTummy: true,
  },
];

export const SLEEP_ACTION_ID = 'toggle_sleep';
export const PET_ACTION_ID = 'chin_scratch';
export const PAUSE_ACTION_ID = 'toggle_pause';
export const REVIVE_ACTION_ID = 'emergency_revive';

export const STAT_META: Record<StatKey, { label: string; color: string; soft: string }> = {
  hunger: { label: 'Food', color: '#f08a3c', soft: '#ffe2c8' },
  hydration: { label: 'Water', color: '#3fa7e0', soft: '#d6eefb' },
  happiness: { label: 'Joy', color: '#ef5f8f', soft: '#fde0ea' },
  energy: { label: 'Energy', color: '#e9b123', soft: '#fcf0c8' },
  hygiene: { label: 'Clean', color: '#4fb98a', soft: '#d7f2e5' },
};

export function actionById(id: string): CareAction | undefined {
  return CARE_ACTIONS.find((a) => a.id === id);
}

export function formatLog(template: string, catName: string): string {
  return template.replaceAll('{cat}', catName);
}

/**
 * Selects a context-aware whim/craving that Oli can actually perform right now
 * (never picks a meal when he's too full or a play workout when he's too tired).
 */
export function pickCandidateWhim(
  live: LiveCat,
  seed: number = Math.random(),
): Omit<CatWhim, 'id' | 'expiresAt'> | null {
  if (live.isSleeping) return null;

  const candidates: Omit<CatWhim, 'id' | 'expiresAt'>[] = [
    { actionId: PET_ACTION_ID, label: 'Chin Scratches', emoji: '🐾' },
  ];

  if (live.hunger < 80) {
    candidates.push({ actionId: 'wet_food', label: 'Wet Food', emoji: '🍖' });
  }
  if (live.hunger < 85) {
    candidates.push({ actionId: 'quail_egg', label: 'Quail Egg', emoji: '🥚' });
  }
  if (live.hunger < 92) {
    candidates.push({ actionId: 'chicken_heart', label: 'Chicken Heart', emoji: '🧡' });
  }
  if (live.hydration < 85) {
    candidates.push({ actionId: 'fountain', label: 'Fresh Water', emoji: '💧' });
  }
  if (live.energy >= 18) {
    candidates.push({ actionId: 'tail_chase', label: 'Chase Tail', emoji: '🌀' });
  }
  if (live.energy >= 20) {
    candidates.push({ actionId: 'feather_wand', label: 'Feather Wand', emoji: '🪶' });
  }
  if (live.energy >= 25) {
    candidates.push({ actionId: 'red_ball', label: 'Red Ball', emoji: '🔴' });
  }
  if (live.energy >= 30) {
    candidates.push({ actionId: 'laser_pointer', label: 'Laser Pointer', emoji: '⚡' });
  }
  if (live.hygiene < 92) {
    candidates.push({ actionId: 'brush', label: 'Brush Coat', emoji: '🪮' });
  }

  const idx = Math.min(candidates.length - 1, Math.max(0, Math.floor(seed * candidates.length)));
  return candidates[idx];
}

// ---------------------------------------------------------------------------
// Phase 4: Play Micro-Minigame helpers (Feather Pounce, Laser, Tail Spin, Red Ball)
// ---------------------------------------------------------------------------
export const MINIGAME_ROUNDS = 3;

export interface MinigameReward {
  bonusJoy: number;
  /** Churu points (not whole tubes) earned. */
  churuPoints: number;
  tier: 'perfect' | 'great' | 'good';
}

export function computeMinigameReward(hits: number, totalRounds: number = MINIGAME_ROUNDS): MinigameReward {
  if (hits >= totalRounds) {
    return { bonusJoy: 15, churuPoints: 1, tier: 'perfect' };
  }
  if (hits === totalRounds - 1) {
    return { bonusJoy: 8, churuPoints: 0, tier: 'great' };
  }
  return { bonusJoy: 0, churuPoints: 0, tier: 'good' };
}

export function getFeatherSweetSpot(roundIndex: number): { min: number; max: number } {
  // Slightly tighter sweet spot each round (Round 1: 32–68%, Round 2: 35–65%, Round 3: 38–62%)
  const shrink = Math.min(2, Math.max(0, roundIndex)) * 3;
  return { min: 32 + shrink, max: 68 - shrink };
}

export function isFeatherInSweetSpot(positionPct: number, roundIndex: number): boolean {
  const { min, max } = getFeatherSweetSpot(roundIndex);
  return positionPct >= min && positionPct <= max;
}

export function getTailCatchZone(roundIndex: number): { centerDeg: number; halfSpanDeg: number } {
  // Top of the circle (0°) where Oli's paws wait; slightly tighter arc each round (R1: ±38°, R2: ±33°, R3: ±28°)
  const shrink = Math.min(2, Math.max(0, roundIndex)) * 5;
  return { centerDeg: 0, halfSpanDeg: 38 - shrink };
}

export function isTailInCatchZone(angleDeg: number, roundIndex: number): boolean {
  const { centerDeg, halfSpanDeg } = getTailCatchZone(roundIndex);
  const norm = ((angleDeg % 360) + 360) % 360;
  const rawDiff = Math.abs(norm - centerDeg);
  const angularDist = Math.min(rawDiff, 360 - rawDiff);
  return angularDist <= halfSpanDeg;
}
