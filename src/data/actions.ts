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
export const WHIM_COOLDOWN_MS = 35_000;

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
    { actionId: PET_ACTION_ID, label: 'Wants Chin Scratches!', emoji: '🐾' },
  ];

  if (live.hunger < 80) {
    candidates.push({ actionId: 'wet_food', label: 'Craving Wet Food!', emoji: '🍖' });
  }
  if (live.hunger < 85) {
    candidates.push({ actionId: 'quail_egg', label: 'Wants a Quail Egg!', emoji: '🥚' });
  }
  if (live.hunger < 92) {
    candidates.push({ actionId: 'chicken_heart', label: 'Craving a Chicken Heart!', emoji: '🧡' });
  }
  if (live.hydration < 85) {
    candidates.push({ actionId: 'fountain', label: 'Wants Fresh Fountain!', emoji: '💧' });
  }
  if (live.energy >= 20) {
    candidates.push({ actionId: 'feather_wand', label: 'Wants Feather Wand!', emoji: '🪶' });
  }
  if (live.energy >= 30) {
    candidates.push({ actionId: 'laser_pointer', label: 'Wants Laser Zoomies!', emoji: '⚡' });
  }
  if (live.hygiene < 92) {
    candidates.push({ actionId: 'brush', label: 'Wants a Brush!', emoji: '🪮' });
  }

  const idx = Math.min(candidates.length - 1, Math.max(0, Math.floor(seed * candidates.length)));
  return candidates[idx];
}

// ---------------------------------------------------------------------------
// Phase 4: Play Micro-Minigame helpers (Feather Pounce & Left/Right Paw Guess)
// ---------------------------------------------------------------------------
export const MINIGAME_ROUNDS = 3;

export interface MinigameReward {
  bonusJoy: number;
  churuBonus: number;
  tier: 'perfect' | 'great' | 'good';
}

export function computeMinigameReward(hits: number, totalRounds: number = MINIGAME_ROUNDS): MinigameReward {
  if (hits >= totalRounds) {
    return { bonusJoy: 15, churuBonus: 1, tier: 'perfect' };
  }
  if (hits === totalRounds - 1) {
    return { bonusJoy: 8, churuBonus: 0, tier: 'great' };
  }
  return { bonusJoy: 0, churuBonus: 0, tier: 'good' };
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
