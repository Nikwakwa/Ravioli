/**
 * Oli's life stages: Newborn → Kitten → Teen → Adult forever.
 *
 * - Growth takes ~18 days (~2.5 weeks) of healthy care total:
 *   Newborn (3d) → Kitten (6d) → Teen (9d) → Adult (forever).
 * - Only time spent out of the red (needs >= 25) counts toward growth, so a
 *   neglected Oli simply grows more slowly and is never harmed for it.
 * - Adult Oli is the final stage forever: he never ages past Adult and NEVER
 *   dies of old age.
 */
import { LIFE_STAGES, type LifeStage, type StatKey } from '../types';

export const STAGE_THRESHOLDS: Record<LifeStage, number> = {
  newborn: 0,
  kitten: 72, // 3 days of healthy care
  teen: 216, // +6 days (9 days total)
  adult: 432, // +9 days (18 days total, ~2.5 weeks) — Adult forever!
};

export const ADULT_GROWTH_HOURS = STAGE_THRESHOLDS.adult;

/** Small immediate growth nudges for active care so players feel progress in real time. */
export const CARE_ACTION_GROWTH_BONUS = 0.25;
export const WHIM_GROWTH_BONUS = 0.5;

export interface StageMeta {
  id: LifeStage;
  label: string;
  fullName: string;
  emoji: string;
  /** Approximate healthy care days spent in this stage, or null for Adult (forever). */
  durationDays: number | null;
  tagline: string;
  /** Short, punchy bullet points shown in the Growing Up celebration card. */
  unlockHighlights: string[];
}

export const STAGE_META: Record<LifeStage, StageMeta> = {
  newborn: {
    id: 'newborn',
    label: 'Newborn',
    fullName: 'Newborn Kitten',
    emoji: '🍼',
    durationDays: 3,
    tagline: 'Tiny, sleepy, and happiest with warm milk and lots of naps.',
    unlockHighlights: [
      'Warm Kitten Milk bottle feedings',
      'Cozy cuddles, gentle brushing, and extra naps',
    ],
  },
  kitten: {
    id: 'kitten',
    label: 'Kitten',
    fullName: 'Playful Kitten',
    emoji: '🐾',
    durationDays: 6,
    tagline: 'Big bright eyes, curious paws, and ready for his first games!',
    unlockHighlights: [
      'Wet Food, Chicken Hearts & Churu treats unlocked',
      'Feather Wand & Chase Tail minigames unlocked',
    ],
  },
  teen: {
    id: 'teen',
    label: 'Teen',
    fullName: 'Teen Cat',
    emoji: '⚡',
    durationDays: 9,
    tagline: 'Long-legged, full of zoomies, and ready for every game and meal.',
    unlockHighlights: [
      'Quail Egg Topper unlocked (weaned off milk!)',
      'Laser Zoomies & Red Ball minigames unlocked',
    ],
  },
  adult: {
    id: 'adult',
    label: 'Adult',
    fullName: 'Adult Oli',
    emoji: '🧡',
    durationDays: null,
    tagline: 'All grown up — and stays Adult Oli forever. He’ll never grow old!',
    unlockHighlights: [
      'Full grown ginger coat & real-Oli ear tattoos',
      'Final stage forever — Oli never ages past Adult!',
    ],
  },
};

export type StageDecayTable = {
  awake: Record<StatKey, number>;
  sleeping: Record<StatKey, number>;
};

/**
 * Hourly stat drift per life stage.
 * Adult matches the classic balance identically; younger stages sleep faster and
 * nibble a tiny bit more often without ever feeling punishing.
 */
export const STAGE_DECAY_RATES: Record<LifeStage, StageDecayTable> = {
  newborn: {
    awake: { hunger: -7.5, hydration: -7, happiness: -4, energy: -6.5, hygiene: -1.5 },
    sleeping: { hunger: -3, hydration: -7, happiness: -4, energy: 20, hygiene: -1 },
  },
  kitten: {
    awake: { hunger: -6.5, hydration: -8, happiness: -5.5, energy: -5, hygiene: -2 },
    sleeping: { hunger: -3, hydration: -8, happiness: -5, energy: 18, hygiene: -1 },
  },
  teen: {
    awake: { hunger: -6.5, hydration: -8, happiness: -5.5, energy: -4.5, hygiene: -2 },
    sleeping: { hunger: -3, hydration: -8, happiness: -5, energy: 16, hygiene: -1 },
  },
  adult: {
    awake: { hunger: -6, hydration: -8, happiness: -5, energy: -4, hygiene: -2 },
    sleeping: { hunger: -3, hydration: -8, happiness: -5, energy: 15, hygiene: -1 },
  },
};

export function getStageDecayRates(stage: LifeStage): StageDecayTable {
  return STAGE_DECAY_RATES[stage];
}

/** Newborns & kittens are happy to nap even when they still have plenty of energy. */
export function getMaxSleepEnergy(stage: LifeStage): number {
  switch (stage) {
    case 'newborn':
      return 92;
    case 'kitten':
      return 88;
    default:
      return 85;
  }
}

export function clampGrowthHours(hours: number): number {
  if (!Number.isFinite(hours)) return 0;
  return Math.min(ADULT_GROWTH_HOURS, Math.max(0, hours));
}

export function roundGrowthHours(hours: number): number {
  return Math.round(clampGrowthHours(hours) * 100) / 100;
}

/**
 * Resolves a persisted `growth_hours` value.
 * Missing values default to `ADULT_GROWTH_HOURS` so existing players keep Adult Oli.
 */
export function sanitizeGrowthHours(raw: unknown, fallback: number = ADULT_GROWTH_HOURS): number {
  if (raw === undefined || raw === null) return clampGrowthHours(fallback);
  const n = typeof raw === 'string' ? Number(raw) : raw;
  if (typeof n !== 'number' || !Number.isFinite(n)) return clampGrowthHours(fallback);
  return clampGrowthHours(n);
}

export function stageFromGrowthHours(hours: number): LifeStage {
  const h = clampGrowthHours(hours);
  if (h >= STAGE_THRESHOLDS.adult) return 'adult';
  if (h >= STAGE_THRESHOLDS.teen) return 'teen';
  if (h >= STAGE_THRESHOLDS.kitten) return 'kitten';
  return 'newborn';
}

export function stageIndex(stage: LifeStage): number {
  return LIFE_STAGES.indexOf(stage);
}

export function isStageAtLeast(current: LifeStage, required: LifeStage): boolean {
  return stageIndex(current) >= stageIndex(required);
}

export function isStageAtMost(current: LifeStage, max: LifeStage): boolean {
  return stageIndex(current) <= stageIndex(max);
}

export function isValidLifeStage(value: unknown): value is LifeStage {
  return typeof value === 'string' && (LIFE_STAGES as readonly string[]).includes(value);
}

export interface StageProgressInfo {
  stage: LifeStage;
  nextStage: LifeStage | null;
  /** 0–1 progress within the current stage (1 when Adult). */
  progress: number;
  hoursInStage: number;
  stageSpanHours: number;
  hoursRemaining: number;
}

export function getStageProgressInfo(growthHours: number): StageProgressInfo {
  const h = clampGrowthHours(growthHours);
  const stage = stageFromGrowthHours(h);
  const idx = stageIndex(stage);
  const nextStage = idx < LIFE_STAGES.length - 1 ? LIFE_STAGES[idx + 1] : null;
  if (!nextStage) {
    return {
      stage: 'adult',
      nextStage: null,
      progress: 1,
      hoursInStage: 0,
      stageSpanHours: 0,
      hoursRemaining: 0,
    };
  }
  const start = STAGE_THRESHOLDS[stage];
  const end = STAGE_THRESHOLDS[nextStage];
  const span = end - start;
  const inStage = Math.max(0, h - start);
  const remaining = Math.max(0, end - h);
  return {
    stage,
    nextStage,
    progress: Math.min(1, Math.max(0, inStage / span)),
    hoursInStage: inStage,
    stageSpanHours: span,
    hoursRemaining: remaining,
  };
}

/** Friendly short countdown text for the growth bar (e.g. "~2.5d left", "~6h left"). */
export function formatRemainingGrowth(hoursRemaining: number): string {
  if (hoursRemaining <= 0) return 'Ready!';
  if (hoursRemaining < 1) return '<1h left';
  if (hoursRemaining < 24) return `~${Math.ceil(hoursRemaining)}h left`;
  const days = Math.round((hoursRemaining / 24) * 10) / 10;
  return `~${days}d left`;
}
