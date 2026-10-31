/**
 * Serverless pet decay engine.
 *
 * There is no backend cron: the database only stores a *base* snapshot of the
 * stats plus `last_updated_at`. Every client derives the *live* stats on the
 * fly with pure timestamp-delta math. When someone performs an action we
 * "materialize" the live stats into a new base snapshot, apply the boost and
 * persist it with a fresh timestamp.
 *
 * Every function in this module is pure and deterministic (time is injected),
 * which keeps it trivially unit-testable.
 */
import type { CatState, CatStats, LiveCat, Mood, StatKey } from '../types';
import { STAT_KEYS } from '../types';

export const STAT_MIN = 0;
export const STAT_MAX = 100;

/** Points per hour. Negative = decay, positive = regeneration. */
export const DECAY_RATES = {
  awake: { hunger: -6, hydration: -8, happiness: -5, energy: -4, hygiene: -2 },
  sleeping: { hunger: -3, hydration: -8, happiness: -5, energy: 15, hygiene: -1 },
} as const satisfies Record<'awake' | 'sleeping', Record<StatKey, number>>;

/** A nap always lasts at least this long, even if energy is already full. */
export const MIN_NAP_HOURS = 0.25;

/** Safety cap so a corrupted / ancient timestamp can't produce absurd math. */
export const MAX_ELAPSED_HOURS = 24 * 90;

/** Thresholds used by mood derivation and the "next need" hint. */
export const NEED_THRESHOLD = 25;
export const THRIVING_THRESHOLD = 85;

/**
 * Extreme neglect protection: both Hunger AND Hydration must be completely empty (0)
 * for 48 consecutive hours (2 full days at 0) before Oli succumbs to severe dehydration/starvation.
 * Normal overnight sleep or busy workdays will never trigger this.
 */
export const NEGLECT_DEATH_HOURS = 48;
export const MAX_LIVES = 9;

const MS_PER_HOUR = 3_600_000;

type TimeInput = Date | number;
const toMs = (t: TimeInput): number => (typeof t === 'number' ? t : t.getTime());

export function clampStat(value: number): number {
  if (!Number.isFinite(value)) return STAT_MIN;
  return Math.min(STAT_MAX, Math.max(STAT_MIN, value));
}

/** Rounds for display / storage while keeping one decimal of precision. */
export function roundStat(value: number): number {
  return Math.round(clampStat(value) * 10) / 10;
}

/** Hours elapsed since an ISO timestamp. Clock skew (future timestamps) → 0. */
export function elapsedHours(fromIso: string, now: TimeInput): number {
  const from = Date.parse(fromIso);
  if (!Number.isFinite(from)) return 0;
  const ms = toMs(now) - from;
  if (ms <= 0) return 0;
  return Math.min(ms / MS_PER_HOUR, MAX_ELAPSED_HOURS);
}

export function pickStats(source: CatStats): CatStats {
  return {
    hunger: clampStat(source.hunger),
    hydration: clampStat(source.hydration),
    happiness: clampStat(source.happiness),
    energy: clampStat(source.energy),
    hygiene: clampStat(source.hygiene),
  };
}

/** Linear drift of all stats for `hours` at the given rate table, clamped. */
export function driftStats(stats: CatStats, rates: Record<StatKey, number>, hours: number): CatStats {
  const h = Math.max(0, hours);
  const out = { ...stats };
  for (const key of STAT_KEYS) out[key] = clampStat(stats[key] + rates[key] * h);
  return out;
}

/** How long (hours) Oli keeps sleeping from a base snapshot before waking up on his own. */
export function hoursUntilNaturalWake(energy: number): number {
  const toFull = (STAT_MAX - clampStat(energy)) / DECAY_RATES.sleeping.energy;
  return Math.max(toFull, MIN_NAP_HOURS);
}

/**
 * Calculates how many hours from the current snapshot until BOTH Hunger and Hydration reach 0.
 * Hydration decays at 8/h. Hunger decays at 3/h while sleeping, then 6/h when awake.
 */
export function hoursUntilBothZero(baseStats: CatStats, isSleeping: boolean): number {
  const hoursHydration = baseStats.hydration / Math.abs(DECAY_RATES.awake.hydration);
  const napHours = isSleeping ? hoursUntilNaturalWake(baseStats.energy) : 0;
  const hungerLostNap = napHours * Math.abs(DECAY_RATES.sleeping.hunger);
  const hungerAfterNap = Math.max(0, baseStats.hunger - hungerLostNap);
  const hoursHunger = napHours + hungerAfterNap / Math.abs(DECAY_RATES.awake.hunger);
  return Math.max(hoursHydration, hoursHunger);
}

/**
 * Computes the live stats from a base snapshot at time `now`.
 *
 * Piecewise: if Oli is sleeping, he regenerates energy until it is full (or the
 * minimum nap elapses), then automatically wakes and awake rates apply for the
 * remaining time — so he wakes up even if nobody opens the app.
 *
 * If the care clock is paused (vacation/flight mode), stats are frozen at the
 * exact moment it was paused.
 *
 * If prolonged extreme neglect occurred (48+ consecutive hours at 0 hunger & 0 hydration),
 * Oli enters the deceased state (which can be revived using one of his 9 lives).
 */
export function computeLiveStats(base: CatState, now: TimeInput = Date.now()): LiveCat {
  const isPaused = Boolean(base.paused_at);
  const isAlreadyDeceased = Boolean(base.deceased_at);
  const livesLeft =
    typeof base.lives_left === 'number' && Number.isFinite(base.lives_left)
      ? Math.max(0, Math.min(MAX_LIVES, base.lives_left))
      : MAX_LIVES;

  if (isAlreadyDeceased) {
    return {
      hunger: 0,
      hydration: 0,
      happiness: 0,
      energy: 0,
      hygiene: 0,
      name: base.name,
      isSleeping: false,
      isCalm: false,
      wokeNaturally: false,
      isPaused: false,
      isDeceased: true,
      livesLeft,
    };
  }

  // If clock is paused, reference time is frozen at the moment of pausing
  const nowMs = isPaused && base.paused_at ? Date.parse(base.paused_at) : toMs(now);
  const hours = elapsedHours(base.last_updated_at, nowMs);
  let stats = pickStats(base);
  let isSleeping = base.is_sleeping;
  let wokeNaturally = false;

  // Check for extreme neglect death while unpaused
  if (!isPaused) {
    const timeToBothZero = hoursUntilBothZero(stats, isSleeping);
    if (hours >= timeToBothZero + NEGLECT_DEATH_HOURS) {
      return {
        hunger: 0,
        hydration: 0,
        happiness: 0,
        energy: 0,
        hygiene: 0,
        name: base.name,
        isSleeping: false,
        isCalm: false,
        wokeNaturally: false,
        isPaused: false,
        isDeceased: true,
        livesLeft,
      };
    }
  }

  if (isSleeping) {
    const napHours = hoursUntilNaturalWake(stats.energy);
    if (hours >= napHours) {
      stats = driftStats(stats, DECAY_RATES.sleeping, napHours);
      stats = driftStats(stats, DECAY_RATES.awake, hours - napHours);
      isSleeping = false;
      wokeNaturally = true;
    } else {
      stats = driftStats(stats, DECAY_RATES.sleeping, hours);
    }
  } else {
    stats = driftStats(stats, DECAY_RATES.awake, hours);
  }

  const calmUntil = base.calm_until ? Date.parse(base.calm_until) : NaN;

  return {
    ...stats,
    name: base.name,
    isSleeping,
    isCalm: Number.isFinite(calmUntil) && calmUntil > nowMs,
    wokeNaturally,
    isPaused,
    isDeceased: false,
    livesLeft,
  };
}

/**
 * Bakes the live stats into a fresh base snapshot stamped at `now`.
 * Must be called before applying any action so decay is never lost.
 */
export function materialize(base: CatState, now: TimeInput = Date.now()): CatState {
  const nowMs = toMs(now);
  const live = computeLiveStats(base, nowMs);
  const calmStillActive = live.isCalm ? base.calm_until : null;
  return {
    ...base,
    hunger: roundStat(live.hunger),
    hydration: roundStat(live.hydration),
    happiness: roundStat(live.happiness),
    energy: roundStat(live.energy),
    hygiene: roundStat(live.hygiene),
    is_sleeping: live.isSleeping,
    calm_until: calmStillActive,
    last_updated_at: new Date(nowMs).toISOString(),
    paused_at: base.paused_at ?? null,
    deceased_at: live.isDeceased ? (base.deceased_at ?? new Date(nowMs).toISOString()) : null,
    lives_left: live.livesLeft,
  };
}

/** Adds (or subtracts) boosts, capped to 0–100. */
export function applyEffect<T extends CatStats>(stats: T, effect: Partial<CatStats>): T {
  const out = { ...stats };
  for (const key of STAT_KEYS) {
    const delta = effect[key];
    if (delta) out[key] = roundStat(stats[key] + delta);
  }
  return out;
}

export function averageWellbeing(stats: CatStats): number {
  return STAT_KEYS.reduce((sum, k) => sum + clampStat(stats[k]), 0) / STAT_KEYS.length;
}

export function isThriving(stats: CatStats): boolean {
  return STAT_KEYS.every((k) => stats[k] >= THRIVING_THRESHOLD);
}

/** Single dominant mood used to drive the cat's face & body language. */
export function deriveMood(live: LiveCat): Mood {
  if (live.isDeceased) return 'deceased';
  if (live.isSleeping) return 'sleeping';
  if (live.hunger < NEED_THRESHOLD) return 'hungry';
  if (live.hydration < NEED_THRESHOLD) return 'thirsty';
  if (live.energy < 20) return 'tired';
  if (live.hygiene < 20) return 'grubby';
  if (live.happiness < 30) return 'sad';
  if (live.isCalm) return 'relaxed';
  if (live.happiness >= THRIVING_THRESHOLD && averageWellbeing(live) >= THRIVING_THRESHOLD) return 'ecstatic';
  if (live.happiness >= 60) return 'happy';
  return 'content';
}

/**
 * Which decaying stat will drop under the need threshold first, and in how many hours.
 * Returns null if nothing is decaying toward a need (or everything is already low).
 */
export function nextNeed(live: LiveCat): { stat: StatKey; hours: number } | null {
  const rates = live.isSleeping ? DECAY_RATES.sleeping : DECAY_RATES.awake;
  let best: { stat: StatKey; hours: number } | null = null;
  for (const key of STAT_KEYS) {
    const rate = rates[key];
    if (rate >= 0 || live[key] <= NEED_THRESHOLD) continue;
    const hours = (live[key] - NEED_THRESHOLD) / -rate;
    if (!best || hours < best.hours) best = { stat: key, hours };
  }
  return best;
}

export function createDefaultCatState(now: TimeInput = Date.now()): CatState {
  return {
    name: 'Oli',
    hunger: 70,
    hydration: 70,
    happiness: 75,
    energy: 85,
    hygiene: 90,
    is_sleeping: false,
    calm_until: null,
    last_updated_at: new Date(toMs(now)).toISOString(),
    version: 0,
    paused_at: null,
    deceased_at: null,
    lives_left: 9,
  };
}
