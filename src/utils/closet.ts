/**
 * Oli's closet: cute accessories unlocked by earning Churu tubes.
 * Kept in a tiny store (saved on this device) so every drawing of Oli shows the same outfit.
 */

export type AccessoryId = 'bowtie' | 'flower_crown' | 'scarf' | 'detective_cap' | 'sunglasses';
export type AccessorySlot = 'head' | 'face' | 'neck';

export interface Accessory {
  id: AccessoryId;
  name: string;
  /** Only one accessory per slot can be worn at a time. */
  slot: AccessorySlot;
  /** Churu tubes that must have been earned in total to unlock it. */
  unlockAt: number;
}

export const ACCESSORIES: Accessory[] = [
  { id: 'bowtie', name: 'Red Bowtie', slot: 'neck', unlockAt: 0 },
  { id: 'flower_crown', name: 'Flower Crown', slot: 'head', unlockAt: 1 },
  { id: 'scarf', name: 'Knit Scarf', slot: 'neck', unlockAt: 3 },
  { id: 'detective_cap', name: 'Detective Cap', slot: 'head', unlockAt: 6 },
  { id: 'sunglasses', name: 'Sunglasses', slot: 'face', unlockAt: 10 },
];

export type Outfit = Partial<Record<AccessorySlot, AccessoryId>>;

export interface ClosetState {
  outfit: Outfit;
  /** Churu tubes earned since the closet opened (never goes down). */
  churusEarned: number;
  /** True when something was unlocked that hasn't been looked at yet. */
  hasNew: boolean;
}

const LS_CLOSET = 'ravioli:v1:closet';
const EMPTY: ClosetState = { outfit: {}, churusEarned: 0, hasNew: false };

export function accessoryById(id: string): Accessory | undefined {
  return ACCESSORIES.find((a) => a.id === id);
}

export function isUnlocked(item: Accessory, churusEarned: number): boolean {
  return churusEarned >= item.unlockAt;
}

/** Accessories that become available when the earned total goes from `before` to `after`. */
export function newlyUnlocked(before: number, after: number): Accessory[] {
  return ACCESSORIES.filter((a) => !isUnlocked(a, before) && isUnlocked(a, after));
}

/** Puts an accessory on (replacing whatever was in its slot) or takes it off if already worn. */
export function toggleInOutfit(outfit: Outfit, item: Accessory): Outfit {
  const next: Outfit = { ...outfit };
  if (next[item.slot] === item.id) delete next[item.slot];
  else next[item.slot] = item.id;
  return next;
}

/** Cleans up saved data: unknown items, wrong slots and still-locked items are dropped. */
export function sanitizeCloset(raw: unknown): ClosetState {
  if (!raw || typeof raw !== 'object') return EMPTY;
  const r = raw as Partial<ClosetState>;
  const churusEarned =
    typeof r.churusEarned === 'number' && Number.isFinite(r.churusEarned) ? Math.max(0, Math.floor(r.churusEarned)) : 0;
  const outfit: Outfit = {};
  if (r.outfit && typeof r.outfit === 'object') {
    for (const id of Object.values(r.outfit)) {
      const item = typeof id === 'string' ? accessoryById(id) : undefined;
      if (item && isUnlocked(item, churusEarned)) outfit[item.slot] = item.id;
    }
  }
  return { outfit, churusEarned, hasNew: r.hasNew === true };
}

function load(): ClosetState {
  try {
    if (typeof localStorage === 'undefined') return EMPTY;
    const raw = localStorage.getItem(LS_CLOSET);
    return raw ? sanitizeCloset(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

let state: ClosetState = load();
const listeners = new Set<() => void>();

function commit(next: ClosetState): void {
  state = next;
  try {
    localStorage.setItem(LS_CLOSET, JSON.stringify(next));
  } catch {
    /* no-op */
  }
  listeners.forEach((l) => l());
}

/** For React's useSyncExternalStore. */
export function subscribeCloset(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCloset(): ClosetState {
  return state;
}

export function getEmptyCloset(): ClosetState {
  return EMPTY;
}

export function toggleAccessory(id: AccessoryId): void {
  const item = accessoryById(id);
  if (!item || !isUnlocked(item, state.churusEarned)) return;
  commit({ ...state, outfit: toggleInOutfit(state.outfit, item) });
}

/** Counts freshly earned Churu tubes and returns any accessories they unlocked. */
export function recordChurusEarned(count: number): Accessory[] {
  const add = Math.max(0, Math.floor(count));
  if (add === 0) return [];
  const after = state.churusEarned + add;
  const unlocked = newlyUnlocked(state.churusEarned, after);
  commit({ ...state, churusEarned: after, hasNew: state.hasNew || unlocked.length > 0 });
  return unlocked;
}

export function markClosetSeen(): void {
  if (state.hasNew) commit({ ...state, hasNew: false });
}
