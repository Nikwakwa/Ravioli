import { useSyncExternalStore } from 'react';
import { localDayKey } from '../data/actions';
import type { LifeStage } from '../types';
import { isStageAtLeast } from './lifeStage';

export type QuestKind =
  | 'pet'
  | 'feed_meal'
  | 'feed_any'
  | 'play_any'
  | 'play_active'
  | 'play_brain'
  | 'perfect_game'
  | 'brush'
  | 'fountain'
  | 'tidy'
  | 'balcony_visit'
  | 'balcony_visitor'
  | 'box_spot'
  | 'fulfill_whim';

export interface DailyQuest {
  id: string;
  kind: QuestKind;
  label: string;
  emoji: string;
  target: number;
  progress: number;
}

export interface DailyQuestState {
  /** Local calendar day (YYYY-MM-DD) the current 3 quests belong to. */
  day: string;
  quests: DailyQuest[];
  rewardClaimed: boolean;
  /** Consecutive calendar days the player cared for Oli. */
  streak: number;
  /** Highest care streak ever reached. */
  bestStreak: number;
  /** Local calendar day (YYYY-MM-DD) of the most recent care action. */
  lastCaredDay: string | null;
  /** Set when Vacation Mode pauses the clock so returning doesn't break the streak. */
  pausedProtectionDay: string | null;
}

export type QuestEvent =
  | { type: 'pet' }
  | { type: 'feed'; actionId: string }
  | { type: 'play'; playGroup: 'active' | 'brain'; perfect: boolean }
  | { type: 'brush' }
  | { type: 'fountain' }
  | { type: 'tidy' }
  | { type: 'balcony_visit' }
  | { type: 'balcony_visitor' }
  | { type: 'box_spot' }
  | { type: 'fulfill_whim' };

interface QuestTemplate {
  kind: QuestKind;
  emoji: string;
  target: number;
  minStage?: LifeStage;
  label: (stage: LifeStage) => string;
}

const BUCKET_CARE_AND_FOOD: readonly QuestTemplate[] = [
  {
    kind: 'feed_meal',
    emoji: '🍽️',
    target: 1,
    label: (stage) => (stage === 'newborn' ? 'Bottle-feed Oli warm milk' : 'Feed Oli a meal'),
  },
  {
    kind: 'feed_any',
    emoji: '🍗',
    target: 2,
    label: (stage) => (stage === 'newborn' ? 'Give Oli 2 milk feedings' : 'Serve Oli 2 meals or treats'),
  },
  {
    kind: 'brush',
    emoji: '🪮',
    target: 1,
    label: () => 'Brush Oli’s ginger coat',
  },
  {
    kind: 'fountain',
    emoji: '💧',
    target: 1,
    label: () => 'Refresh the water fountain',
  },
  {
    kind: 'tidy',
    emoji: '🧹',
    target: 1,
    label: () => 'Scoop the box or tidy a mess',
  },
];

const BUCKET_PLAY: readonly QuestTemplate[] = [
  {
    kind: 'play_any',
    emoji: '🎮',
    target: 1,
    label: () => 'Play any minigame with Oli',
  },
  {
    kind: 'play_active',
    emoji: '⚡',
    target: 1,
    label: () => 'Play an Active game',
  },
  {
    kind: 'play_brain',
    emoji: '🧠',
    target: 1,
    minStage: 'kitten',
    label: () => 'Play a Brain game',
  },
  {
    kind: 'perfect_game',
    emoji: '🏆',
    target: 1,
    label: () => 'Score 3/3 in a minigame',
  },
];

const BUCKET_COZY: readonly QuestTemplate[] = [
  {
    kind: 'pet',
    emoji: '🐾',
    target: 3,
    label: (stage) => (stage === 'newborn' ? 'Give Oli 3 warm cuddles' : 'Give Oli 3 chin scratches'),
  },
  {
    kind: 'balcony_visitor',
    emoji: '🕊️',
    target: 1,
    label: () => 'Tap a visitor on the balcony',
  },
  {
    kind: 'balcony_visit',
    emoji: '🌿',
    target: 1,
    label: () => 'Hang out on the Balcony',
  },
  {
    kind: 'box_spot',
    emoji: '📦',
    target: 1,
    label: () => 'Let Oli chill in his cardboard box',
  },
  {
    kind: 'fulfill_whim',
    emoji: '💭',
    target: 1,
    label: () => 'Grant one of Oli’s cravings',
  },
];

const LS_DAILY_QUESTS = 'ravioli:v1:daily_quests';

/** Simple deterministic hash of a YYYY-MM-DD day key so everyone gets a fresh, stable daily mix. */
function hashDay(dayStr: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < dayStr.length; i++) {
    h ^= dayStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

/** Returns the previous local calendar day string (YYYY-MM-DD) for a given YYYY-MM-DD key. */
export function previousDayKey(dayStr: string): string {
  const [y, m, d] = dayStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, (d || 1) - 1);
  return localDayKey(dt.getTime());
}

/** Generates 3 distinct, stage-appropriate quests for the given local day. */
export function generateDailyQuests(dayStr: string, stage: LifeStage = 'adult'): DailyQuest[] {
  const pickFrom = (pool: readonly QuestTemplate[], salt: number, used: Set<QuestKind>): DailyQuest => {
    const eligible = pool.filter(
      (q) => !used.has(q.kind) && (!q.minStage || isStageAtLeast(stage, q.minStage)),
    );
    const list = eligible.length > 0 ? eligible : pool;
    const chosen = list[hashDay(dayStr, salt) % list.length];
    used.add(chosen.kind);
    return {
      id: `${dayStr}:${chosen.kind}`,
      kind: chosen.kind,
      label: chosen.label(stage),
      emoji: chosen.emoji,
      target: chosen.target,
      progress: 0,
    };
  };

  const used = new Set<QuestKind>();
  return [
    pickFrom(BUCKET_CARE_AND_FOOD, 17, used),
    pickFrom(BUCKET_PLAY, 53, used),
    pickFrom(BUCKET_COZY, 97, used),
  ];
}

export function isStreakMilestone(streak: number): boolean {
  return streak === 3 || (streak >= 7 && streak % 7 === 0);
}

export function getDailyRewardChurus(streak: number): number {
  return isStreakMilestone(streak) ? 2 : 1;
}

export function getNextStreakMilestone(streak: number): number {
  if (streak < 3) return 3;
  return (Math.floor(streak / 7) + 1) * 7;
}

export function isQuestDone(q: DailyQuest): boolean {
  return q.progress >= q.target;
}

export function countCompletedQuests(state: DailyQuestState): number {
  return state.quests.filter(isQuestDone).length;
}

export function areAllQuestsDone(state: DailyQuestState): boolean {
  return state.quests.length > 0 && state.quests.every(isQuestDone);
}

export function isDailyRewardReady(state: DailyQuestState, nowMs: number = Date.now()): boolean {
  const today = localDayKey(nowMs);
  if (state.day !== today) return false;
  return areAllQuestsDone(state) && !state.rewardClaimed;
}

/** Returns the live streak visible today (0 if the user missed yesterday without Vacation Mode). */
export function getVisibleStreak(state: DailyQuestState, nowMs: number = Date.now()): number {
  if (state.streak <= 0 || !state.lastCaredDay) return 0;
  const today = localDayKey(nowMs);
  if (state.lastCaredDay === today) return state.streak;
  if (state.lastCaredDay === previousDayKey(today)) return state.streak;
  if (state.pausedProtectionDay) return state.streak;
  return 0;
}

function createFreshState(dayStr: string, stage: LifeStage = 'adult'): DailyQuestState {
  return {
    day: dayStr,
    quests: generateDailyQuests(dayStr, stage),
    rewardClaimed: false,
    streak: 0,
    bestStreak: 0,
    lastCaredDay: null,
    pausedProtectionDay: null,
  };
}

const VALID_KINDS = new Set<QuestKind>([
  'pet',
  'feed_meal',
  'feed_any',
  'play_any',
  'play_active',
  'play_brain',
  'perfect_game',
  'brush',
  'fountain',
  'tidy',
  'balcony_visit',
  'balcony_visitor',
  'box_spot',
  'fulfill_whim',
]);

export function sanitizeDailyQuestState(raw: unknown, nowMs: number = Date.now()): DailyQuestState {
  const today = localDayKey(nowMs);
  if (!raw || typeof raw !== 'object') return createFreshState(today);
  const r = raw as Partial<DailyQuestState>;
  const day = typeof r.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.day) ? r.day : today;

  const validQuests = Array.isArray(r.quests)
    ? r.quests
        .filter(
          (q): q is DailyQuest =>
            Boolean(q) &&
            typeof q.id === 'string' &&
            typeof q.kind === 'string' &&
            VALID_KINDS.has(q.kind as QuestKind) &&
            typeof q.label === 'string' &&
            typeof q.emoji === 'string' &&
            typeof q.target === 'number' &&
            q.target >= 1 &&
            typeof q.progress === 'number' &&
            q.progress >= 0,
        )
        .map((q) => ({ ...q, progress: Math.min(q.target, Math.floor(q.progress)) }))
    : [];

  const streak = typeof r.streak === 'number' && Number.isFinite(r.streak) && r.streak >= 0 ? Math.floor(r.streak) : 0;
  const bestStreak = Math.max(
    streak,
    typeof r.bestStreak === 'number' && Number.isFinite(r.bestStreak) && r.bestStreak >= 0 ? Math.floor(r.bestStreak) : 0,
  );
  const lastCaredDay =
    typeof r.lastCaredDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.lastCaredDay) ? r.lastCaredDay : null;
  const pausedProtectionDay =
    typeof r.pausedProtectionDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.pausedProtectionDay)
      ? r.pausedProtectionDay
      : null;

  return {
    day,
    quests: validQuests.length === 3 ? validQuests : generateDailyQuests(day),
    rewardClaimed: Boolean(r.rewardClaimed),
    streak,
    bestStreak,
    lastCaredDay,
    pausedProtectionDay,
  };
}

function load(): DailyQuestState {
  try {
    if (typeof localStorage === 'undefined') return createFreshState(localDayKey(Date.now()));
    const raw = localStorage.getItem(LS_DAILY_QUESTS);
    return raw ? sanitizeDailyQuestState(JSON.parse(raw)) : createFreshState(localDayKey(Date.now()));
  } catch {
    return createFreshState(localDayKey(Date.now()));
  }
}

let state: DailyQuestState = load();
const listeners = new Set<() => void>();

function commit(next: DailyQuestState): void {
  state = next;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LS_DAILY_QUESTS, JSON.stringify(next));
    }
  } catch {
    /* no-op */
  }
  listeners.forEach((l) => l());
}

export function subscribeDailyQuests(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDailyQuestState(): DailyQuestState {
  return state;
}

export function setDailyQuestState(next: DailyQuestState): void {
  commit(next);
}

export function useDailyQuests(): DailyQuestState {
  return useSyncExternalStore(subscribeDailyQuests, getDailyQuestState, getDailyQuestState);
}

/** Pure rollover check: if the calendar day changed, generate today's fresh 3 quests while preserving streak history. */
export function ensureTodayState(
  current: DailyQuestState,
  stage: LifeStage = 'adult',
  nowMs: number = Date.now(),
): DailyQuestState {
  const today = localDayKey(nowMs);
  if (current.day === today && current.quests.length === 3) {
    return current;
  }
  return {
    ...current,
    day: today,
    quests: generateDailyQuests(today, stage),
    rewardClaimed: false,
  };
}

/** Ensures today's quests are initialized in the store (call on app ready / day rollover). */
export function syncDailyQuestsForToday(stage: LifeStage = 'adult', nowMs: number = Date.now()): DailyQuestState {
  const next = ensureTodayState(state, stage, nowMs);
  if (next !== state) commit(next);
  return next;
}

/** Pure helper that updates care streak when the player performs a care action today. */
export function applyCareStreak(current: DailyQuestState, today: string): DailyQuestState {
  if (current.lastCaredDay === today) return current;
  const yesterday = previousDayKey(today);
  const continues =
    current.lastCaredDay === yesterday ||
    (current.pausedProtectionDay !== null && current.lastCaredDay !== null);
  const nextStreak = continues ? current.streak + 1 : 1;
  return {
    ...current,
    streak: nextStreak,
    bestStreak: Math.max(current.bestStreak, nextStreak),
    lastCaredDay: today,
    pausedProtectionDay: null,
  };
}

/** Protects the player's care streak while Vacation Mode is active. */
export function protectStreakForVacation(nowMs: number = Date.now()): void {
  const today = localDayKey(nowMs);
  if (state.pausedProtectionDay === today) return;
  commit({ ...state, pausedProtectionDay: today });
}

function matchesQuest(kind: QuestKind, event: QuestEvent): boolean {
  switch (kind) {
    case 'pet':
      return event.type === 'pet';
    case 'feed_meal':
      return (
        event.type === 'feed' &&
        (event.actionId === 'kitten_milk' || event.actionId === 'wet_food' || event.actionId === 'quail_egg')
      );
    case 'feed_any':
      return event.type === 'feed';
    case 'play_any':
      return event.type === 'play';
    case 'play_active':
      return event.type === 'play' && event.playGroup === 'active';
    case 'play_brain':
      return event.type === 'play' && event.playGroup === 'brain';
    case 'perfect_game':
      return event.type === 'play' && event.perfect;
    case 'brush':
      return event.type === 'brush';
    case 'fountain':
      return event.type === 'fountain';
    case 'tidy':
      return event.type === 'tidy';
    case 'balcony_visit':
      return event.type === 'balcony_visit';
    case 'balcony_visitor':
      return event.type === 'balcony_visitor';
    case 'box_spot':
      return event.type === 'box_spot';
    case 'fulfill_whim':
      return event.type === 'fulfill_whim';
  }
}

const STREAK_EVENTS = new Set<QuestEvent['type']>([
  'pet',
  'feed',
  'play',
  'brush',
  'fountain',
  'tidy',
  'balcony_visitor',
  'fulfill_whim',
]);

export interface QuestProgressResult {
  newlyCompleted: DailyQuest[];
  allDoneJustNow: boolean;
  streakIncreased: boolean;
  streak: number;
}

/** Records a gameplay event toward today's Daily Quests & Care Streak. */
export function recordQuestEvent(
  event: QuestEvent,
  stage: LifeStage = 'adult',
  nowMs: number = Date.now(),
): QuestProgressResult {
  const today = localDayKey(nowMs);
  let next = ensureTodayState(state, stage, nowMs);
  const wasAllDone = areAllQuestsDone(next);
  const prevStreak = next.streak;
  const prevCaredDay = next.lastCaredDay;

  if (STREAK_EVENTS.has(event.type)) {
    next = applyCareStreak(next, today);
  }

  const newlyCompleted: DailyQuest[] = [];
  let changed = next !== state;

  const updatedQuests = next.quests.map((q) => {
    if (q.progress >= q.target) return q;
    if (!matchesQuest(q.kind, event)) return q;
    const updated = { ...q, progress: Math.min(q.target, q.progress + 1) };
    changed = true;
    if (updated.progress >= updated.target) {
      newlyCompleted.push(updated);
    }
    return updated;
  });

  if (changed) {
    next = { ...next, quests: updatedQuests };
    commit(next);
  }

  const allDoneNow = areAllQuestsDone(next);
  return {
    newlyCompleted,
    allDoneJustNow: !wasAllDone && allDoneNow,
    streakIncreased: next.lastCaredDay !== prevCaredDay && next.streak > prevStreak,
    streak: next.streak,
  };
}

/** Claims the Daily Quests bonus Churus once all 3 quests are finished. */
export function claimDailyQuestReward(
  nowMs: number = Date.now(),
): { claimed: boolean; churus: number; isMilestone: boolean; streak: number } {
  const today = localDayKey(nowMs);
  if (state.day !== today || !areAllQuestsDone(state) || state.rewardClaimed) {
    return { claimed: false, churus: 0, isMilestone: false, streak: getVisibleStreak(state, nowMs) };
  }

  const withStreak = applyCareStreak(state, today);
  const streak = Math.max(1, withStreak.streak);
  const isMilestone = isStreakMilestone(streak);
  const churus = getDailyRewardChurus(streak);

  commit({
    ...withStreak,
    rewardClaimed: true,
  });

  return { claimed: true, churus, isMilestone, streak };
}
