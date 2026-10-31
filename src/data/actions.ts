import type { CatAnimation, CatStats, StatKey } from '../types';

export type ActionCategory = 'feed' | 'hydrate' | 'play' | 'comfort';

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
  /** Past-tense phrase for the co-op feed. `{cat}` is replaced with the cat's name. */
  log: string;
  /** Blocked while the cat is asleep. */
  requiresAwake: boolean;
  /** Vibration pattern (ms) on Android. */
  haptic: number | number[];
  /** Minutes of "relaxed" mood granted. */
  calmMinutes?: number;
  /** Visual length of the animation (ms). */
  durationMs: number;
}

export const CATEGORIES: { id: ActionCategory; label: string }[] = [
  { id: 'feed', label: 'Feed' },
  { id: 'hydrate', label: 'Hydrate' },
  { id: 'play', label: 'Play' },
  { id: 'comfort', label: 'Comfort' },
];

export const CARE_ACTIONS: CareAction[] = [
  {
    id: 'wet_food',
    category: 'feed',
    name: 'Wet Food Pouch',
    short: 'Wet Food',
    effect: { hunger: 35, hydration: 5 },
    animation: 'eating',
    particles: ['crumbs'],
    log: 'Served {cat} a wet food pouch',
    requiresAwake: true,
    haptic: 25,
    durationMs: 2600,
  },
  {
    id: 'churu',
    category: 'feed',
    name: 'Churu Lickable Treat',
    short: 'Churu Tube',
    effect: { hunger: 10, hydration: 10, happiness: 25 },
    animation: 'churu',
    particles: ['hearts', 'sparkles'],
    log: 'Fed {cat} a Churu lickable tube',
    requiresAwake: true,
    haptic: [25, 35, 25, 35, 40],
    durationMs: 3000,
  },
  {
    id: 'chicken_heart',
    category: 'feed',
    name: 'Chicken Heart Treat',
    short: 'Chicken Heart',
    effect: { hunger: 12, happiness: 15 },
    animation: 'treat',
    particles: ['hearts'],
    log: 'Fed {cat} a freeze-dried chicken heart',
    requiresAwake: true,
    haptic: [20, 40, 20],
    durationMs: 2200,
  },
  {
    id: 'quail_egg',
    category: 'feed',
    name: 'Quail Egg Topper',
    short: 'Quail Egg',
    effect: { hunger: 15, happiness: 10 },
    animation: 'eating_egg',
    particles: ['crumbs', 'stars'],
    log: 'Topped {cat}’s bowl with a freeze-dried quail egg',
    requiresAwake: true,
    haptic: 25,
    durationMs: 2400,
  },
  {
    id: 'fountain',
    category: 'hydrate',
    name: 'Refresh Water Fountain',
    short: 'Fresh Fountain',
    effect: { hydration: 40, happiness: 5 },
    animation: 'drinking',
    particles: ['ripples'],
    log: 'Refreshed {cat}’s water fountain',
    requiresAwake: true,
    haptic: [15, 30, 15],
    durationMs: 2800,
  },
  {
    id: 'chin_scratch',
    category: 'play',
    name: 'Chin Scratches',
    short: 'Chin Scratches',
    effect: { happiness: 20 },
    animation: 'purring',
    particles: ['purr', 'hearts'],
    log: 'Gave {cat} chin scratches — purr session!',
    requiresAwake: true,
    haptic: [40, 30, 40, 30, 40, 30, 40, 30, 40],
    durationMs: 3000,
  },
  {
    id: 'feather_wand',
    category: 'play',
    name: 'Feather Wand',
    short: 'Feather Wand',
    effect: { happiness: 25, energy: -10 },
    animation: 'playing',
    particles: ['stars'],
    log: 'Played the feather wand game with {cat}',
    requiresAwake: true,
    haptic: [30, 60, 30, 60, 30],
    durationMs: 3200,
  },
  {
    id: 'pheromone_mist',
    category: 'comfort',
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
  },
  {
    id: 'brush',
    category: 'comfort',
    name: 'Brush Coat',
    short: 'Brush Coat',
    effect: { hygiene: 30, happiness: 5 },
    animation: 'brushing',
    particles: ['sparkles'],
    log: 'Brushed {cat}’s fluffy ginger coat',
    requiresAwake: true,
    haptic: [20, 50, 20, 50, 20],
    durationMs: 2800,
  },
];

export const SLEEP_ACTION_ID = 'toggle_sleep';

export const STAT_META: Record<StatKey, { label: string; color: string; soft: string }> = {
  hunger: { label: 'Hunger', color: '#f08a3c', soft: '#ffe2c8' },
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
