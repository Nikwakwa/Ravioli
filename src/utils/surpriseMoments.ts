import type { CatAnimation, LifeStage } from '../types';
import type { SoundName } from './sound';

export type SurpriseMomentKind = 'box_peek' | 'zoomies' | 'table_knock';

export type TableKnockItem = 'coaster' | 'pen' | 'cap';

export interface SurpriseMoment {
  id: string;
  kind: SurpriseMomentKind;
  /** Small item Oli nudges off the coffee table during a `table_knock` surprise. */
  item?: TableKnockItem;
  startedAt: number;
  expiresAt: number;
}

export const SURPRISE_ACTION_ID = 'surprise_moment';
export const SURPRISE_JOY_BOOST = 5;
/** Minimum gap between surprise moments so check-ins feel special, never spammy. */
export const SURPRISE_COOLDOWN_MS = 3 * 60_000;
/** Chance a surprise greets you when opening or returning to the app after cooldown. */
export const SURPRISE_CHECKIN_CHANCE = 0.7;
/** Calm idle wait before a spontaneous surprise can happen while hanging out in the living room. */
export const SURPRISE_IDLE_MIN_MS = 80_000;
export const SURPRISE_IDLE_MAX_MS = 140_000;

export const SURPRISE_DURATION_MS: Record<SurpriseMomentKind, number> = {
  box_peek: 30_000,
  zoomies: 10_000,
  table_knock: 24_000,
};

const TABLE_ITEMS: readonly TableKnockItem[] = ['coaster', 'pen', 'cap'] as const;
const LS_LAST_SURPRISE_AT = 'ravioli:v1:last_surprise_at';

/** Returns which surprise moments make sense for Oli's life stage and current energy. */
export function getEligibleSurprises(lifeStage: LifeStage, energy: number): SurpriseMomentKind[] {
  if (lifeStage === 'newborn') {
    return ['box_peek'];
  }
  if (energy < 20) {
    return ['box_peek', 'table_knock'];
  }
  return ['box_peek', 'zoomies', 'table_knock'];
}

/** True when enough time has passed since the last surprise and the welcome roll hits. */
export function shouldTriggerOnCheckIn(
  lastSurpriseAt: number,
  nowMs: number = Date.now(),
  rand: number = Math.random(),
): boolean {
  if (lastSurpriseAt > 0 && nowMs - lastSurpriseAt < SURPRISE_COOLDOWN_MS) {
    return false;
  }
  const r = Math.min(0.999999, Math.max(0, rand));
  return r < SURPRISE_CHECKIN_CHANCE;
}

/** Computes how long to wait before a spontaneous living-room surprise can occur. */
export function nextIdleSurpriseDelayMs(
  lastSurpriseAt: number,
  nowMs: number = Date.now(),
  rand: number = Math.random(),
): number {
  const r = Math.min(0.999999, Math.max(0, rand));
  const idleWait = Math.round(SURPRISE_IDLE_MIN_MS + r * (SURPRISE_IDLE_MAX_MS - SURPRISE_IDLE_MIN_MS));
  if (lastSurpriseAt <= 0) return idleWait;
  const remainingCooldown = Math.max(0, SURPRISE_COOLDOWN_MS - Math.max(0, nowMs - lastSurpriseAt));
  return Math.max(idleWait, remainingCooldown);
}

/** Builds a new SurpriseMoment, avoiding repeating the previous surprise kind when possible. */
export function createSurpriseMoment(
  lifeStage: LifeStage,
  energy: number,
  nowMs: number = Date.now(),
  rand: number = Math.random(),
  prevKind: SurpriseMomentKind | null = null,
): SurpriseMoment {
  const r = Math.min(0.999999, Math.max(0, rand));
  const eligible = getEligibleSurprises(lifeStage, energy);
  const pool = prevKind && eligible.length > 1 ? eligible.filter((k) => k !== prevKind) : eligible;
  const kind = pool[Math.floor(r * pool.length)] ?? eligible[0];

  // Derive a second deterministic fraction from rand so tests stay predictable.
  const subRand = (r * 7.31) % 1;
  const item = kind === 'table_knock' ? TABLE_ITEMS[Math.floor(subRand * TABLE_ITEMS.length)] : undefined;

  return {
    id: `${kind}-${nowMs}-${Math.floor(r * 10000)}`,
    kind,
    item,
    startedAt: nowMs,
    expiresAt: nowMs + SURPRISE_DURATION_MS[kind],
  };
}

export interface SurpriseTapReaction {
  toast: string;
  log: string;
  sound: SoundName;
  animation: CatAnimation;
  haptic: number | number[];
}

export function getSurpriseTapReaction(moment: SurpriseMoment, catName: string): SurpriseTapReaction {
  switch (moment.kind) {
    case 'box_peek':
      return {
        toast: `📦 Boo! ${catName} popped out of his box! (+${SURPRISE_JOY_BOOST} Joy)`,
        log: `Found ${catName} peeking out of his cardboard box!`,
        sound: 'chirp',
        animation: 'pounce',
        haptic: [20, 35, 25],
      };
    case 'zoomies':
      return {
        toast: `⚡ Zoomies caught! ${catName} skidded to a purring stop! (+${SURPRISE_JOY_BOOST} Joy)`,
        log: `Caught ${catName} mid-zoomies across the rug!`,
        sound: 'purr',
        animation: 'purring',
        haptic: [18, 25, 18, 35],
      };
    case 'table_knock': {
      const itemLabel =
        moment.item === 'pen' ? 'pen' : moment.item === 'cap' ? 'bottle cap' : 'coaster';
      return {
        toast: `😼 *Clink!* ${catName} knocked the ${itemLabel} off the table! (+${SURPRISE_JOY_BOOST} Joy)`,
        log: `${catName} casually knocked a ${itemLabel} off the coffee table!`,
        sound: 'clatter',
        animation: 'pounce',
        haptic: [15, 40, 20],
      };
    }
  }
}

export function loadLastSurpriseAt(): number {
  try {
    const raw = window.localStorage.getItem(LS_LAST_SURPRISE_AT);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveLastSurpriseAt(ms: number): void {
  try {
    window.localStorage.setItem(LS_LAST_SURPRISE_AT, String(ms));
  } catch {
    // ignore
  }
}
