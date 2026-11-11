import { useSyncExternalStore } from 'react';

export type BadgeTier = 'bronze' | 'silver' | 'gold';
export const BADGE_TIERS: readonly BadgeTier[] = ['bronze', 'silver', 'gold'] as const;

export const TIER_META: Record<BadgeTier, { label: string; medal: string; chipClass: string; borderClass: string; bgClass: string }> = {
  bronze: {
    label: 'Bronze',
    medal: '🥉',
    chipClass: 'border-amber-700/40 bg-amber-900/10 text-amber-900',
    borderClass: 'border-amber-700/35',
    bgClass: 'bg-amber-900/4',
  },
  silver: {
    label: 'Silver',
    medal: '🥈',
    chipClass: 'border-slate-400/50 bg-slate-200 text-slate-800',
    borderClass: 'border-slate-300',
    bgClass: 'bg-slate-100/50',
  },
  gold: {
    label: 'Gold',
    medal: '🥇',
    chipClass: 'border-amber-400/70 bg-amber-400/25 text-amber-950 font-black',
    borderClass: 'border-amber-400',
    bgClass: 'bg-gradient-to-br from-amber-50 to-orange-50/60',
  },
};

export interface BadgeTierDef {
  target: number;
  label: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  hint: string;
  tiers: Record<BadgeTier, BadgeTierDef>;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'box_sitter',
    name: 'If It Fits I Sits',
    emoji: '📦',
    description: 'Took cozy naps inside the cardboard delivery box.',
    hint: 'Oli loves cardboard deliveries…',
    tiers: {
      bronze: { target: 3, label: '3 box naps' },
      silver: { target: 10, label: '10 box naps' },
      gold: { target: 25, label: '25 box naps' },
    },
  },
  {
    id: 'midnight_snack',
    name: 'Midnight Munchies',
    emoji: '🌙',
    description: 'Fed Oli a late-night snack after 10 PM.',
    hint: 'A late-night snack for hungry paws…',
    tiers: {
      bronze: { target: 1, label: '1 late snack' },
      silver: { target: 5, label: '5 late snacks' },
      gold: { target: 15, label: '15 late snacks' },
    },
  },
  {
    id: 'rainy_day',
    name: 'Rainy Day Cat TV',
    emoji: '🌧️',
    description: 'Watched the raindrops together by the window or balcony.',
    hint: 'Watch the raindrops sliding down the glass…',
    tiers: {
      bronze: { target: 1, label: '1 rain watch' },
      silver: { target: 5, label: '5 rain watches' },
      gold: { target: 15, label: '15 rain watches' },
    },
  },
  {
    id: 'fancy_gentleman',
    name: 'Fancy Gentleman',
    emoji: '🎩',
    description: 'Dressed Oli up in accessories from his closet.',
    hint: 'Dress Oli to impress from his wardrobe…',
    tiers: {
      bronze: { target: 1, label: '1 accessory' },
      silver: { target: 3, label: '3 accessories' },
      gold: { target: 6, label: 'All 6 accessories' },
    },
  },
  {
    id: 'cosmic_cat',
    name: 'Cosmic Wisdom',
    emoji: '🥠',
    description: 'Cracked open Daily Fortune Cookies.',
    hint: 'Seek ancient feline wisdom in a golden cookie…',
    tiers: {
      bronze: { target: 1, label: '1 cookie' },
      silver: { target: 7, label: '7 cookies' },
      gold: { target: 21, label: '21 cookies' },
    },
  },
  {
    id: 'zoomie_master',
    name: 'Zoomie Master',
    emoji: '⚡',
    description: 'Scored 3-streak pounce combos in minigames.',
    hint: 'Show off lightning-fast pounce reflexes in Play…',
    tiers: {
      bronze: { target: 3, label: '3 combos' },
      silver: { target: 10, label: '10 combos' },
      gold: { target: 25, label: '25 combos' },
    },
  },
  {
    id: 'gourmet_whiskers',
    name: 'Gourmet Whiskers',
    emoji: '🍗',
    description: 'Tasted all 4 meals and treats in the kitchen.',
    hint: 'Taste every delicious food in the Feed menu…',
    tiers: {
      bronze: { target: 4, label: 'Taste all 4 foods' },
      silver: { target: 15, label: 'All 4 foods & 15 meals' },
      gold: { target: 40, label: 'All 4 foods & 40 meals' },
    },
  },
  {
    id: 'purr_engine',
    name: 'Purr Engine',
    emoji: '🐾',
    description: 'Gave Oli chin scratches and loving cuddles.',
    hint: 'Get the rumbling motor started with cuddles…',
    tiers: {
      bronze: { target: 10, label: '10 pets' },
      silver: { target: 50, label: '50 pets' },
      gold: { target: 150, label: '150 pets' },
    },
  },
  {
    id: 'clean_paws',
    name: 'Fresh & Tidy',
    emoji: '🧹',
    description: 'Scooped the litter box and swept up room messes.',
    hint: 'Keep the living room and corner box clean…',
    tiers: {
      bronze: { target: 5, label: '5 cleanups' },
      silver: { target: 20, label: '20 cleanups' },
      gold: { target: 50, label: '50 cleanups' },
    },
  },
  {
    id: 'balcony_sun',
    name: 'Balcony Lounger',
    emoji: '☀️',
    description: 'Lounged on the sunny balcony terrace.',
    hint: 'Soak up the fresh air on the balcony tiles…',
    tiers: {
      bronze: { target: 1, label: '1 balcony visit' },
      silver: { target: 10, label: '10 balcony visits' },
      gold: { target: 30, label: '30 balcony visits' },
    },
  },
  {
    id: 'thriving_cat',
    name: 'Peak Floof',
    emoji: '🌟',
    description: 'Kept Oli in peak condition with all 5 needs green.',
    hint: 'Make Oli the happiest, most thriving cat in Luxembourg…',
    tiers: {
      bronze: { target: 1, label: '1 thriving check' },
      silver: { target: 5, label: '5 thriving checks' },
      gold: { target: 15, label: '15 thriving checks' },
    },
  },
  {
    id: 'golden_streak',
    name: 'Golden Companion',
    emoji: '💖',
    description: 'Visited and cared for Oli across multiple days.',
    hint: 'Visit and care for Oli with daily love…',
    tiers: {
      bronze: { target: 2, label: '2 days cared' },
      silver: { target: 7, label: '7 days cared' },
      gold: { target: 21, label: '21 days cared' },
    },
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
  feedCount: number;
  petCount: number;
  cleanCount: number;
  balconyVisits: number;
  thrivingCount: number;
  thrivingAchieved?: boolean;
  daysVisited: string[];
}

export interface BadgeState {
  unlockedIds: string[];
  levels: Record<string, BadgeTier>;
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
  feedCount: 0,
  petCount: 0,
  cleanCount: 0,
  balconyVisits: 0,
  thrivingCount: 0,
  thrivingAchieved: false,
  daysVisited: [],
};

const EMPTY_STATE: BadgeState = {
  unlockedIds: [],
  levels: {},
  unlockedAt: {},
  stats: { ...INITIAL_STATS },
  hasUnseen: false,
};

export function badgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id);
}

export function isBadgeUnlocked(state: BadgeState, id: string): boolean {
  return Boolean(state.levels[id] || state.unlockedIds.includes(id));
}

export function getBadgeLevel(state: BadgeState, id: string): BadgeTier | null {
  return state.levels[id] ?? (state.unlockedIds.includes(id) ? 'bronze' : null);
}

export function getNextTier(current: BadgeTier | null): BadgeTier | null {
  if (!current) return 'bronze';
  if (current === 'bronze') return 'silver';
  if (current === 'silver') return 'gold';
  return null;
}

const REQUIRED_FOODS = ['wet_food', 'quail_egg', 'chicken_heart', 'churu'];

export function checkBadgeTier(id: string, tier: BadgeTier, stats: BadgeStats): boolean {
  switch (id) {
    case 'box_sitter':
      return stats.boxNaps >= (tier === 'bronze' ? 3 : tier === 'silver' ? 10 : 25);
    case 'midnight_snack':
      return stats.midnightFeeds >= (tier === 'bronze' ? 1 : tier === 'silver' ? 5 : 15);
    case 'rainy_day':
      return stats.rainWatches >= (tier === 'bronze' ? 1 : tier === 'silver' ? 5 : 15);
    case 'fancy_gentleman':
      return stats.accessoriesDressed >= (tier === 'bronze' ? 1 : tier === 'silver' ? 3 : 6);
    case 'cosmic_cat':
      return stats.fortuneCracks >= (tier === 'bronze' ? 1 : tier === 'silver' ? 7 : 21);
    case 'zoomie_master':
      return stats.minigameWins >= (tier === 'bronze' ? 3 : tier === 'silver' ? 10 : 25);
    case 'gourmet_whiskers': {
      const allTried = REQUIRED_FOODS.every((f) => stats.foodsTried.includes(f));
      if (!allTried) return false;
      if (tier === 'bronze') return true;
      if (tier === 'silver') return stats.feedCount >= 15;
      return stats.feedCount >= 40;
    }
    case 'purr_engine':
      return stats.petCount >= (tier === 'bronze' ? 10 : tier === 'silver' ? 50 : 150);
    case 'clean_paws':
      return stats.cleanCount >= (tier === 'bronze' ? 5 : tier === 'silver' ? 20 : 50);
    case 'balcony_sun':
      return stats.balconyVisits >= (tier === 'bronze' ? 1 : tier === 'silver' ? 10 : 30);
    case 'thriving_cat': {
      const count = stats.thrivingCount || (stats.thrivingAchieved ? 1 : 0);
      return count >= (tier === 'bronze' ? 1 : tier === 'silver' ? 5 : 15);
    }
    case 'golden_streak':
      return stats.daysVisited.length >= (tier === 'bronze' ? 2 : tier === 'silver' ? 7 : 21);
    default:
      return false;
  }
}

export function getBadgeProgress(
  id: string,
  stats: BadgeStats,
  currentLevel: BadgeTier | null,
): { current: number; target: number; label: string } {
  const badge = badgeById(id);
  if (!badge) return { current: 0, target: 1, label: '' };

  if (currentLevel === 'gold') {
    const goldTarget = badge.tiers.gold.target;
    return { current: goldTarget, target: goldTarget, label: 'Max Level 🥇' };
  }

  const nextTier = getNextTier(currentLevel)!;
  const target = badge.tiers[nextTier].target;
  const label = badge.tiers[nextTier].label;

  let current = 0;
  switch (id) {
    case 'box_sitter':
      current = stats.boxNaps;
      break;
    case 'midnight_snack':
      current = stats.midnightFeeds;
      break;
    case 'rainy_day':
      current = stats.rainWatches;
      break;
    case 'fancy_gentleman':
      current = stats.accessoriesDressed;
      break;
    case 'cosmic_cat':
      current = stats.fortuneCracks;
      break;
    case 'zoomie_master':
      current = stats.minigameWins;
      break;
    case 'gourmet_whiskers': {
      const allTried = REQUIRED_FOODS.every((f) => stats.foodsTried.includes(f));
      if (!allTried) {
        current = stats.foodsTried.length;
      } else {
        current = stats.feedCount;
      }
      break;
    }
    case 'purr_engine':
      current = stats.petCount;
      break;
    case 'clean_paws':
      current = stats.cleanCount;
      break;
    case 'balcony_sun':
      current = stats.balconyVisits;
      break;
    case 'thriving_cat':
      current = stats.thrivingCount || (stats.thrivingAchieved ? 1 : 0);
      break;
    case 'golden_streak':
      current = stats.daysVisited.length;
      break;
  }

  return { current: Math.min(current, target), target, label };
}

export function countEarnedMedals(state: BadgeState): {
  total: number;
  bronze: number;
  silver: number;
  gold: number;
} {
  let bronze = 0;
  let silver = 0;
  let gold = 0;

  for (const b of BADGES) {
    const level = getBadgeLevel(state, b.id);
    if (level === 'bronze') {
      bronze++;
    } else if (level === 'silver') {
      bronze++;
      silver++;
    } else if (level === 'gold') {
      bronze++;
      silver++;
      gold++;
    }
  }

  return { total: bronze + silver + gold, bronze, silver, gold };
}

export interface BadgeUnlock {
  badge: BadgeDefinition;
  tier: BadgeTier;
  isLevelUp: boolean;
}

export function evaluateBadges(
  state: BadgeState,
  now: number = Date.now(),
): { nextState: BadgeState; newUnlocks: BadgeUnlock[] } {
  const newUnlocks: BadgeUnlock[] = [];
  const nextUnlocked = [...state.unlockedIds];
  const nextLevels: Record<string, BadgeTier> = { ...state.levels };
  const nextUnlockedAt: Record<string, number> = { ...state.unlockedAt };

  for (const badge of BADGES) {
    let currentTier = nextLevels[badge.id] as BadgeTier | undefined;
    if (!currentTier && nextUnlocked.includes(badge.id)) {
      currentTier = 'bronze';
      nextLevels[badge.id] = 'bronze';
    }

    if (!currentTier) {
      if (checkBadgeTier(badge.id, 'bronze', state.stats)) {
        currentTier = 'bronze';
        nextLevels[badge.id] = 'bronze';
        if (!nextUnlocked.includes(badge.id)) nextUnlocked.push(badge.id);
        nextUnlockedAt[`${badge.id}:bronze`] = now;
        newUnlocks.push({ badge, tier: 'bronze', isLevelUp: false });
      }
    }
    if (currentTier === 'bronze') {
      if (checkBadgeTier(badge.id, 'silver', state.stats)) {
        currentTier = 'silver';
        nextLevels[badge.id] = 'silver';
        nextUnlockedAt[`${badge.id}:silver`] = now;
        newUnlocks.push({ badge, tier: 'silver', isLevelUp: true });
      }
    }
    if (currentTier === 'silver') {
      if (checkBadgeTier(badge.id, 'gold', state.stats)) {
        currentTier = 'gold';
        nextLevels[badge.id] = 'gold';
        nextUnlockedAt[`${badge.id}:gold`] = now;
        newUnlocks.push({ badge, tier: 'gold', isLevelUp: true });
      }
    }
  }

  if (newUnlocks.length === 0) {
    return { nextState: state, newUnlocks: [] };
  }

  const nextState: BadgeState = {
    ...state,
    unlockedIds: nextUnlocked,
    levels: nextLevels,
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

  const levels: Record<string, BadgeTier> = {};
  if (r.levels && typeof r.levels === 'object') {
    for (const [k, v] of Object.entries(r.levels)) {
      if (badgeById(k) && (v === 'bronze' || v === 'silver' || v === 'gold')) {
        levels[k] = v;
      }
    }
  }
  for (const id of unlockedIds) {
    if (!levels[id]) levels[id] = 'bronze';
  }

  const unlockedAt: Record<string, number> = {};
  if (r.unlockedAt && typeof r.unlockedAt === 'object') {
    for (const [k, v] of Object.entries(r.unlockedAt)) {
      if (typeof v === 'number' && Number.isFinite(v)) {
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
    feedCount:
      typeof rawStats.feedCount === 'number' && rawStats.feedCount >= 0
        ? rawStats.feedCount
        : Array.isArray(rawStats.foodsTried)
          ? rawStats.foodsTried.length
          : 0,
    petCount: typeof rawStats.petCount === 'number' && rawStats.petCount >= 0 ? rawStats.petCount : 0,
    cleanCount: typeof rawStats.cleanCount === 'number' && rawStats.cleanCount >= 0 ? rawStats.cleanCount : 0,
    balconyVisits:
      typeof rawStats.balconyVisits === 'number' && rawStats.balconyVisits >= 0 ? rawStats.balconyVisits : 0,
    thrivingCount:
      typeof rawStats.thrivingCount === 'number' && rawStats.thrivingCount >= 0
        ? rawStats.thrivingCount
        : rawStats.thrivingAchieved
          ? 1
          : 0,
    thrivingAchieved: Boolean(rawStats.thrivingAchieved || (rawStats.thrivingCount && rawStats.thrivingCount > 0)),
    daysVisited: Array.isArray(rawStats.daysVisited)
      ? rawStats.daysVisited.filter((d) => typeof d === 'string')
      : [],
  };

  return {
    unlockedIds,
    levels,
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
): BadgeUnlock[] {
  const nextStats = mutator(state.stats);
  const updatedState = { ...state, stats: nextStats };
  const { nextState, newUnlocks } = evaluateBadges(updatedState, now);
  commit(nextState);
  return newUnlocks;
}

export function trackBoxNap(now = Date.now()): BadgeUnlock[] {
  return mutateStats((s) => ({ ...s, boxNaps: s.boxNaps + 1 }), now);
}

export function trackFeed(foodId: string, hour = new Date().getHours(), now = Date.now()): BadgeUnlock[] {
  return mutateStats((s) => {
    const isMidnight = hour >= 22 || hour < 5;
    const foods = s.foodsTried.includes(foodId) ? s.foodsTried : [...s.foodsTried, foodId];
    return {
      ...s,
      feedCount: s.feedCount + 1,
      midnightFeeds: isMidnight ? s.midnightFeeds + 1 : s.midnightFeeds,
      foodsTried: foods,
    };
  }, now);
}

export function trackRainWatch(now = Date.now()): BadgeUnlock[] {
  return mutateStats((s) => ({ ...s, rainWatches: s.rainWatches + 1 }), now);
}

export function trackAccessoryDressed(ownedCount?: number, now = Date.now()): BadgeUnlock[] {
  return mutateStats(
    (s) => ({
      ...s,
      accessoriesDressed:
        typeof ownedCount === 'number'
          ? Math.max(s.accessoriesDressed, ownedCount)
          : s.accessoriesDressed + 1,
    }),
    now,
  );
}

export function trackFortuneCrack(now = Date.now()): BadgeUnlock[] {
  return mutateStats((s) => ({ ...s, fortuneCracks: s.fortuneCracks + 1 }), now);
}

export function trackMinigameWin(now = Date.now()): BadgeUnlock[] {
  return mutateStats((s) => ({ ...s, minigameWins: s.minigameWins + 1 }), now);
}

export function trackPet(now = Date.now()): BadgeUnlock[] {
  return mutateStats((s) => ({ ...s, petCount: s.petCount + 1 }), now);
}

export function trackClean(now = Date.now()): BadgeUnlock[] {
  return mutateStats((s) => ({ ...s, cleanCount: s.cleanCount + 1 }), now);
}

export function trackBalconyVisit(now = Date.now()): BadgeUnlock[] {
  return mutateStats((s) => ({ ...s, balconyVisits: s.balconyVisits + 1 }), now);
}

export function trackThriving(now = Date.now()): BadgeUnlock[] {
  return mutateStats(
    (s) => ({
      ...s,
      thrivingCount: s.thrivingCount + 1,
      thrivingAchieved: true,
    }),
    now,
  );
}

export function trackDayVisit(dateStr: string, now = Date.now()): BadgeUnlock[] {
  if (state.stats.daysVisited.includes(dateStr)) return [];
  return mutateStats((s) => ({ ...s, daysVisited: [...s.daysVisited, dateStr] }), now);
}
