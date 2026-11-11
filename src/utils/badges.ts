import { useSyncExternalStore } from 'react';

export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  hint: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'box_sitter',
    name: 'If It Fits I Sits',
    emoji: '📦',
    description: 'Took 3 cozy naps inside the cardboard delivery box.',
    hint: 'Oli loves cardboard deliveries…',
  },
  {
    id: 'midnight_snack',
    name: 'Midnight Munchies',
    emoji: '🌙',
    description: 'Fed Oli a late-night snack after 10 PM.',
    hint: 'A late-night snack for hungry paws…',
  },
  {
    id: 'rainy_day',
    name: 'Rainy Day Cat TV',
    emoji: '🌧️',
    description: 'Watched the raindrops together by the window or balcony.',
    hint: 'Watch the raindrops sliding down the glass…',
  },
  {
    id: 'fancy_gentleman',
    name: 'Fancy Gentleman',
    emoji: '🎩',
    description: 'Dressed Oli up in an accessory from his closet.',
    hint: 'Dress Oli to impress from his wardrobe…',
  },
  {
    id: 'cosmic_cat',
    name: 'Cosmic Wisdom',
    emoji: '🥠',
    description: 'Cracked open a Daily Fortune Cookie.',
    hint: 'Seek ancient feline wisdom in a golden cookie…',
  },
  {
    id: 'zoomie_master',
    name: 'Zoomie Master',
    emoji: '⚡',
    description: 'Scored 3 pounce combos in the minigames.',
    hint: 'Show off lightning-fast pounce reflexes in Play…',
  },
  {
    id: 'gourmet_whiskers',
    name: 'Gourmet Whiskers',
    emoji: '🍗',
    description: 'Tasted all 4 meals and treats in the kitchen.',
    hint: 'Taste every delicious food in the Feed menu…',
  },
  {
    id: 'purr_engine',
    name: 'Purr Engine',
    emoji: '🐾',
    description: 'Gave Oli chin scratches and pets 10 times.',
    hint: 'Get the rumbling motor started with cuddles…',
  },
  {
    id: 'clean_paws',
    name: 'Fresh & Tidy',
    emoji: '🧹',
    description: 'Scooped the litter box or swept up fur 5 times.',
    hint: 'Keep the living room and corner box clean…',
  },
  {
    id: 'balcony_sun',
    name: 'Balcony Lounger',
    emoji: '☀️',
    description: 'Lounged on the sunny balcony terrace.',
    hint: 'Soak up the fresh air on the balcony tiles…',
  },
  {
    id: 'thriving_cat',
    name: 'Peak Floof',
    emoji: '🌟',
    description: 'Kept all 5 care stats in the green at the same time.',
    hint: 'Make Oli the happiest, most thriving cat in Luxembourg…',
  },
  {
    id: 'golden_streak',
    name: 'Golden Companion',
    emoji: '💖',
    description: 'Visited and cared for Oli across multiple days.',
    hint: 'Visit and care for Oli with daily love…',
  },
];

export interface BadgeStats {
  boxNaps: number;
  midnightFeeds: number;
  rainWatches: number;
  accessoriesDressed: number;
  fortuneCracks: number;
  minigameWins: number;
  foodsTried: string[];
  petCount: number;
  cleanCount: number;
  balconyVisits: number;
  thrivingAchieved: boolean;
  daysVisited: string[];
}

export interface BadgeState {
  unlockedIds: string[];
  unlockedAt: Record<string, number>;
  stats: BadgeStats;
  hasUnseen: boolean;
}

const LS_BADGES = 'ravioli:v1:badges';

export const INITIAL_STATS: BadgeStats = {
  boxNaps: 0,
  midnightFeeds: 0,
  rainWatches: 0,
  accessoriesDressed: 0,
  fortuneCracks: 0,
  minigameWins: 0,
  foodsTried: [],
  petCount: 0,
  cleanCount: 0,
  balconyVisits: 0,
  thrivingAchieved: false,
  daysVisited: [],
};

const EMPTY_STATE: BadgeState = {
  unlockedIds: [],
  unlockedAt: {},
  stats: { ...INITIAL_STATS },
  hasUnseen: false,
};

export function badgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id);
}

export function isBadgeUnlocked(state: BadgeState, id: string): boolean {
  return state.unlockedIds.includes(id);
}

const REQUIRED_FOODS = ['wet_food', 'quail_egg', 'chicken_heart', 'churu'];

export function checkBadgeCondition(id: string, stats: BadgeStats): boolean {
  switch (id) {
    case 'box_sitter':
      return stats.boxNaps >= 3;
    case 'midnight_snack':
      return stats.midnightFeeds >= 1;
    case 'rainy_day':
      return stats.rainWatches >= 1;
    case 'fancy_gentleman':
      return stats.accessoriesDressed >= 1;
    case 'cosmic_cat':
      return stats.fortuneCracks >= 1;
    case 'zoomie_master':
      return stats.minigameWins >= 3;
    case 'gourmet_whiskers':
      return REQUIRED_FOODS.every((f) => stats.foodsTried.includes(f));
    case 'purr_engine':
      return stats.petCount >= 10;
    case 'clean_paws':
      return stats.cleanCount >= 5;
    case 'balcony_sun':
      return stats.balconyVisits >= 1;
    case 'thriving_cat':
      return stats.thrivingAchieved;
    case 'golden_streak':
      return stats.daysVisited.length >= 2;
    default:
      return false;
  }
}

export function evaluateBadges(
  state: BadgeState,
  now: number = Date.now(),
): { nextState: BadgeState; newUnlocks: BadgeDefinition[] } {
  const newUnlocks: BadgeDefinition[] = [];
  const nextUnlocked = [...state.unlockedIds];
  const nextUnlockedAt = { ...state.unlockedAt };

  for (const badge of BADGES) {
    if (!nextUnlocked.includes(badge.id)) {
      if (checkBadgeCondition(badge.id, state.stats)) {
        nextUnlocked.push(badge.id);
        nextUnlockedAt[badge.id] = now;
        newUnlocks.push(badge);
      }
    }
  }

  if (newUnlocks.length === 0) {
    return { nextState: state, newUnlocks: [] };
  }

  const nextState: BadgeState = {
    ...state,
    unlockedIds: nextUnlocked,
    unlockedAt: nextUnlockedAt,
    hasUnseen: true,
  };

  return { nextState, newUnlocks };
}

export function sanitizeBadgeState(raw: unknown): BadgeState {
  if (!raw || typeof raw !== 'object') return EMPTY_STATE;
  const r = raw as Partial<BadgeState>;
  const unlockedIds = Array.isArray(r.unlockedIds)
    ? r.unlockedIds.filter((id) => typeof id === 'string' && badgeById(id))
    : [];

  const unlockedAt: Record<string, number> = {};
  if (r.unlockedAt && typeof r.unlockedAt === 'object') {
    for (const [k, v] of Object.entries(r.unlockedAt)) {
      if (typeof v === 'number' && Number.isFinite(v) && badgeById(k)) {
        unlockedAt[k] = v;
      }
    }
  }

  const rawStats = (r.stats && typeof r.stats === 'object' ? r.stats : {}) as Partial<BadgeStats>;
  const stats: BadgeStats = {
    boxNaps: typeof rawStats.boxNaps === 'number' && rawStats.boxNaps >= 0 ? rawStats.boxNaps : 0,
    midnightFeeds:
      typeof rawStats.midnightFeeds === 'number' && rawStats.midnightFeeds >= 0 ? rawStats.midnightFeeds : 0,
    rainWatches: typeof rawStats.rainWatches === 'number' && rawStats.rainWatches >= 0 ? rawStats.rainWatches : 0,
    accessoriesDressed:
      typeof rawStats.accessoriesDressed === 'number' && rawStats.accessoriesDressed >= 0
        ? rawStats.accessoriesDressed
        : 0,
    fortuneCracks:
      typeof rawStats.fortuneCracks === 'number' && rawStats.fortuneCracks >= 0 ? rawStats.fortuneCracks : 0,
    minigameWins:
      typeof rawStats.minigameWins === 'number' && rawStats.minigameWins >= 0 ? rawStats.minigameWins : 0,
    foodsTried: Array.isArray(rawStats.foodsTried)
      ? rawStats.foodsTried.filter((f) => typeof f === 'string')
      : [],
    petCount: typeof rawStats.petCount === 'number' && rawStats.petCount >= 0 ? rawStats.petCount : 0,
    cleanCount: typeof rawStats.cleanCount === 'number' && rawStats.cleanCount >= 0 ? rawStats.cleanCount : 0,
    balconyVisits:
      typeof rawStats.balconyVisits === 'number' && rawStats.balconyVisits >= 0 ? rawStats.balconyVisits : 0,
    thrivingAchieved: Boolean(rawStats.thrivingAchieved),
    daysVisited: Array.isArray(rawStats.daysVisited)
      ? rawStats.daysVisited.filter((d) => typeof d === 'string')
      : [],
  };

  return {
    unlockedIds,
    unlockedAt,
    stats,
    hasUnseen: Boolean(r.hasUnseen),
  };
}

function load(): BadgeState {
  try {
    if (typeof localStorage === 'undefined') return EMPTY_STATE;
    const raw = localStorage.getItem(LS_BADGES);
    return raw ? sanitizeBadgeState(JSON.parse(raw)) : EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

let state: BadgeState = load();
const listeners = new Set<() => void>();

function commit(next: BadgeState): void {
  state = next;
  try {
    localStorage.setItem(LS_BADGES, JSON.stringify(next));
  } catch {
    /* no-op */
  }
  listeners.forEach((l) => l());
}

export function subscribeBadges(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBadgeState(): BadgeState {
  return state;
}

export function useBadges(): BadgeState {
  return useSyncExternalStore(subscribeBadges, getBadgeState, getBadgeState);
}

export function getEmptyBadgeState(): BadgeState {
  return EMPTY_STATE;
}

export function setBadgeState(next: BadgeState): void {
  commit(next);
}

export function markBadgesSeen(): void {
  if (!state.hasUnseen) return;
  commit({ ...state, hasUnseen: false });
}

function mutateStats(
  mutator: (prev: BadgeStats) => BadgeStats,
  now = Date.now(),
): BadgeDefinition[] {
  const nextStats = mutator(state.stats);
  const updatedState = { ...state, stats: nextStats };
  const { nextState, newUnlocks } = evaluateBadges(updatedState, now);
  commit(nextState);
  return newUnlocks;
}

export function trackBoxNap(now = Date.now()): BadgeDefinition[] {
  return mutateStats((s) => ({ ...s, boxNaps: s.boxNaps + 1 }), now);
}

export function trackFeed(foodId: string, hour = new Date().getHours(), now = Date.now()): BadgeDefinition[] {
  return mutateStats((s) => {
    const isMidnight = hour >= 22 || hour < 5;
    const foods = s.foodsTried.includes(foodId) ? s.foodsTried : [...s.foodsTried, foodId];
    return {
      ...s,
      midnightFeeds: isMidnight ? s.midnightFeeds + 1 : s.midnightFeeds,
      foodsTried: foods,
    };
  }, now);
}

export function trackRainWatch(now = Date.now()): BadgeDefinition[] {
  return mutateStats((s) => ({ ...s, rainWatches: s.rainWatches + 1 }), now);
}

export function trackAccessoryDressed(now = Date.now()): BadgeDefinition[] {
  return mutateStats((s) => ({ ...s, accessoriesDressed: s.accessoriesDressed + 1 }), now);
}

export function trackFortuneCrack(now = Date.now()): BadgeDefinition[] {
  return mutateStats((s) => ({ ...s, fortuneCracks: s.fortuneCracks + 1 }), now);
}

export function trackMinigameWin(now = Date.now()): BadgeDefinition[] {
  return mutateStats((s) => ({ ...s, minigameWins: s.minigameWins + 1 }), now);
}

export function trackPet(now = Date.now()): BadgeDefinition[] {
  return mutateStats((s) => ({ ...s, petCount: s.petCount + 1 }), now);
}

export function trackClean(now = Date.now()): BadgeDefinition[] {
  return mutateStats((s) => ({ ...s, cleanCount: s.cleanCount + 1 }), now);
}

export function trackBalconyVisit(now = Date.now()): BadgeDefinition[] {
  return mutateStats((s) => ({ ...s, balconyVisits: s.balconyVisits + 1 }), now);
}

export function trackThriving(now = Date.now()): BadgeDefinition[] {
  if (state.stats.thrivingAchieved) return [];
  return mutateStats((s) => ({ ...s, thrivingAchieved: true }), now);
}

export function trackDayVisit(dateStr: string, now = Date.now()): BadgeDefinition[] {
  if (state.stats.daysVisited.includes(dateStr)) return [];
  return mutateStats((s) => ({ ...s, daysVisited: [...s.daysVisited, dateStr] }), now);
}
