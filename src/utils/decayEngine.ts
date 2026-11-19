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
import type { CatState, CatStats, LifeStage, LiveCat, Mood, StatKey } from '../types';
import { STAT_KEYS } from '../types';
import {
  ADULT_GROWTH_HOURS,
  clampGrowthHours,
  getStageDecayRates,
  getStageProgressInfo,
  roundGrowthHours,
  sanitizeGrowthHours,
  STAGE_DECAY_RATES,
  STAGE_THRESHOLDS,
  stageFromGrowthHours,
} from './lifeStage';

export const STAT_MIN = 0;
export const STAT_MAX = 100;

/** Points per hour for Adult Oli (classic baseline). Negative = decay, positive = regeneration. */
export const DECAY_RATES = STAGE_DECAY_RATES.adult;

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
export function hoursUntilNaturalWake(energy: number, stage: LifeStage = 'adult'): number {
  const rates = getStageDecayRates(stage);
  const toFull = (STAT_MAX - clampStat(energy)) / rates.sleeping.energy;
  return Math.max(toFull, MIN_NAP_HOURS);
}

/**
 * Calculates how many hours from the current snapshot until BOTH Hunger and Hydration reach 0.
 * Hydration decays at stage rate. Hunger decays slower while sleeping, then at awake rate.
 */
export function hoursUntilBothZero(baseStats: CatStats, isSleeping: boolean, stage: LifeStage = 'adult'): number {
  const rates = getStageDecayRates(stage);
  const hoursHydration = baseStats.hydration / Math.abs(rates.awake.hydration);
  const napHours = isSleeping ? hoursUntilNaturalWake(baseStats.energy, stage) : 0;
  const hungerLostNap = napHours * Math.abs(rates.sleeping.hunger);
  const hungerAfterNap = Math.max(0, baseStats.hunger - hungerLostNap);
  const hoursHunger = napHours + hungerAfterNap / Math.abs(rates.awake.hunger);
  return Math.max(hoursHydration, hoursHunger);
}

/** True when Oli's needs are healthy enough (>= NEED_THRESHOLD) for growth to tick forward. */
export function isHealthyForGrowth(stats: CatStats, isSleeping: boolean): boolean {
  for (const key of STAT_KEYS) {
    if (isSleeping && key === 'energy') continue;
    if (stats[key] < NEED_THRESHOLD) return false;
  }
  return true;
}

/**
 * Computes how many hours within a single drift segment had all checked needs >= NEED_THRESHOLD.
 * Time spent in the red contributes 0 growth (Oli simply grows more slowly, never harmed).
 */
export function healthyHoursInSegment(
  startStats: CatStats,
  rates: Record<StatKey, number>,
  segHours: number,
  isSleeping: boolean,
): number {
  const h = Math.max(0, segHours);
  if (h <= 0) return 0;
  let healthy = h;
  for (const key of STAT_KEYS) {
    if (isSleeping && key === 'energy') continue;
    const startVal = startStats[key];
    if (startVal < NEED_THRESHOLD) return 0;
    const rate = rates[key];
    if (rate < 0) {
      const untilRed = (startVal - NEED_THRESHOLD) / -rate;
      healthy = Math.min(healthy, untilRed);
    }
  }
  return Math.max(0, healthy);
}

/**
 * Computes the live stats and life-stage progress from a base snapshot at time `now`.
 *
 * Piecewise: if Oli is sleeping, he regenerates energy until it is full (or the
 * minimum nap elapses), then automatically wakes and awake rates apply for the
 * remaining time — so he wakes up even if nobody opens the app.
 *
 * Growth ticks forward during healthy hours (all needs >= 25) and caps permanently
 * at Adult Oli (`ADULT_GROWTH_HOURS`). Oli NEVER ages past Adult and NEVER dies of old age.
 *
 * If the care clock is paused (vacation/flight mode), stats and growth are frozen at the
 * exact moment it was paused.
 */
export function computeLiveStats(base: CatState, now: TimeInput = Date.now()): LiveCat {
  const isPaused = Boolean(base.paused_at);
  const isAlreadyDeceased = Boolean(base.deceased_at);
  const livesLeft =
    typeof base.lives_left === 'number' && Number.isFinite(base.lives_left)
      ? Math.max(0, Math.min(MAX_LIVES, base.lives_left))
      : MAX_LIVES;

  const baseGrowth = sanitizeGrowthHours(base.growth_hours, ADULT_GROWTH_HOURS);
  const baseStage = stageFromGrowthHours(baseGrowth);
  const stageRates = getStageDecayRates(baseStage);

  if (isAlreadyDeceased) {
    const info = getStageProgressInfo(baseGrowth);
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
      lifeStage: info.stage,
      growthHours: baseGrowth,
      stageProgress: info.progress,
      nextStage: info.nextStage,
      hoursToNextStage: info.hoursRemaining,
      isGrowingNow: false,
    };
  }

  // If clock is paused, reference time is frozen at the moment of pausing
  const nowMs = isPaused && base.paused_at ? Date.parse(base.paused_at) : toMs(now);
  const hours = elapsedHours(base.last_updated_at, nowMs);
  let stats = pickStats(base);
  let isSleeping = base.is_sleeping;
  let wokeNaturally = false;

  // Check for extreme neglect death while unpaused (never old age — Adult stays Adult forever)
  if (!isPaused) {
    const timeToBothZero = hoursUntilBothZero(stats, isSleeping, baseStage);
    if (hours >= timeToBothZero + NEGLECT_DEATH_HOURS) {
      const info = getStageProgressInfo(baseGrowth);
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
        lifeStage: info.stage,
        growthHours: baseGrowth,
        stageProgress: info.progress,
        nextStage: info.nextStage,
        hoursToNextStage: info.hoursRemaining,
        isGrowingNow: false,
      };
    }
  }

  let healthyElapsed = 0;

  if (isSleeping) {
    const napHours = hoursUntilNaturalWake(stats.energy, baseStage);
    if (hours >= napHours) {
      healthyElapsed += healthyHoursInSegment(stats, stageRates.sleeping, napHours, true);
      stats = driftStats(stats, stageRates.sleeping, napHours);
      const awakeHours = hours - napHours;
      healthyElapsed += healthyHoursInSegment(stats, stageRates.awake, awakeHours, false);
      stats = driftStats(stats, stageRates.awake, awakeHours);
      isSleeping = false;
      wokeNaturally = true;
    } else {
      healthyElapsed += healthyHoursInSegment(stats, stageRates.sleeping, hours, true);
      stats = driftStats(stats, stageRates.sleeping, hours);
    }
  } else {
    healthyElapsed += healthyHoursInSegment(stats, stageRates.awake, hours, false);
    stats = driftStats(stats, stageRates.awake, hours);
  }

  const growthHours = clampGrowthHours(baseGrowth + (isPaused ? 0 : healthyElapsed));
  const stageInfo = getStageProgressInfo(growthHours);
  const calmUntil = base.calm_until ? Date.parse(base.calm_until) : NaN;
  const isGrowingNow = !isPaused && stageInfo.stage !== 'adult' && isHealthyForGrowth(stats, isSleeping);

  return {
    ...stats,
    name: base.name,
    isSleeping,
    isCalm: Number.isFinite(calmUntil) && calmUntil > nowMs,
    wokeNaturally,
    isPaused,
    isDeceased: false,
    livesLeft,
    lifeStage: stageInfo.stage,
    growthHours,
    stageProgress: stageInfo.progress,
    nextStage: stageInfo.nextStage,
    hoursToNextStage: stageInfo.hoursRemaining,
    isGrowingNow,
  };
}

/**
 * Bakes the live stats and growth hours into a fresh base snapshot stamped at `now`.
 * Must be called before applying any action so decay and growth are never lost.
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
    growth_hours: roundGrowthHours(live.growthHours),
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

/** Nudges growth forward on active care actions, capped permanently at Adult Oli. */
export function addGrowthBonus(state: CatState, bonusHours: number): CatState {
  if (bonusHours <= 0 || state.deceased_at || state.paused_at) return state;
  const current = sanitizeGrowthHours(state.growth_hours, ADULT_GROWTH_HOURS);
  if (current >= ADULT_GROWTH_HOURS) return state;
  return {
    ...state,
    growth_hours: roundGrowthHours(current + bonusHours),
  };
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
  const stageRates = getStageDecayRates(live.lifeStage);
  const rates = live.isSleeping ? stageRates.sleeping : stageRates.awake;
  let best: { stat: StatKey; hours: number } | null = null;
  for (const key of STAT_KEYS) {
    const rate = rates[key];
    if (rate >= 0 || live[key] <= NEED_THRESHOLD) continue;
    const hours = (live[key] - NEED_THRESHOLD) / -rate;
    if (!best || hours < best.hours) best = { stat: key, hours };
  }
  return best;
}

export function createDefaultCatState(now: TimeInput = Date.now(), stage: LifeStage = 'adult'): CatState {
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
    growth_hours: STAGE_THRESHOLDS[stage],
  };
}

/** Brand-new / reset games start Oli as a tiny Newborn kitten (0 growth hours). */
export function createNewGameCatState(now: TimeInput = Date.now()): CatState {
  return {
    ...createDefaultCatState(now, 'newborn'),
    hunger: 75,
    hydration: 80,
    happiness: 80,
    energy: 75,
    hygiene: 95,
  };
}
