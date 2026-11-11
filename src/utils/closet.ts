/**
 * Oli's closet: cute accessories bought with Churu tubes.
 * Kept in a tiny store (saved on this device) so every drawing of Oli shows the same outfit.
 */

export type AccessoryId = 'bowtie' | 'flower_crown' | 'scarf' | 'detective_cap' | 'sunglasses' | 'suit';
export type AccessorySlot = 'head' | 'face' | 'neck' | 'body';

export interface Accessory {
  id: AccessoryId;
  name: string;
  /** Only one accessory per slot can be worn at a time. */
  slot: AccessorySlot;
  /** Churu tubes it costs to buy. */
  price: number;
}

/**
 * Prices are tuned to the Churu income (at most 3 a day, usually 1–2 once some are fed to Oli):
 * a first buy on day one, then roughly one new item every few days, and the suit as a long-term goal.
 */
export const ACCESSORIES: Accessory[] = [
  { id: 'bowtie', name: 'Red Bowtie', slot: 'neck', price: 2 },
  { id: 'flower_crown', name: 'Flower Crown', slot: 'head', price: 4 },
  { id: 'scarf', name: 'Knit Scarf', slot: 'neck', price: 7 },
  { id: 'detective_cap', name: 'Detective Cap', slot: 'head', price: 10 },
  { id: 'sunglasses', name: 'Sunglasses', slot: 'face', price: 14 },
  { id: 'suit', name: 'Fancy Suit', slot: 'body', price: 20 },
];

export type Outfit = Partial<Record<AccessorySlot, AccessoryId>>;

export interface ClosetState {
  outfit: Outfit;
  /** Accessories that have been bought. */
  owned: AccessoryId[];
}

const LS_CLOSET = 'ravioli:v1:closet';
const EMPTY: ClosetState = { outfit: {}, owned: [] };

/** Before the shop, items unlocked once this many Churus had been earned. Used to keep them. */
const LEGACY_UNLOCK_AT: Partial<Record<AccessoryId, number>> = {
  bowtie: 0,
  flower_crown: 1,
  scarf: 3,
  detective_cap: 6,
  sunglasses: 10,
};

export function accessoryById(id: string): Accessory | undefined {
  return ACCESSORIES.find((a) => a.id === id);
}

export function isOwned(state: ClosetState, id: AccessoryId): boolean {
  return state.owned.includes(id);
}

export function canAfford(item: Accessory, churuStash: number): boolean {
  return churuStash >= item.price;
}

/** True when there is something left to buy that the Churu stash can pay for. */
export function hasAffordableItem(state: ClosetState, churuStash: number): boolean {
  return ACCESSORIES.some((a) => !isOwned(state, a.id) && canAfford(a, churuStash));
}

/** Puts an accessory on (replacing whatever was in its slot) or takes it off if already worn. */
export function toggleInOutfit(outfit: Outfit, item: Accessory): Outfit {
  const next: Outfit = { ...outfit };
  if (next[item.slot] === item.id) delete next[item.slot];
  else next[item.slot] = item.id;
  return next;
}

/** Adds a bought accessory and puts it on right away. */
export function withPurchase(state: ClosetState, item: Accessory): ClosetState {
  if (isOwned(state, item.id)) return state;
  return { owned: [...state.owned, item.id], outfit: { ...state.outfit, [item.slot]: item.id } };
}

/** Cleans up saved data: unknown items, wrong slots and items that aren't owned are dropped. */
export function sanitizeCloset(raw: unknown): ClosetState {
  if (!raw || typeof raw !== 'object') return EMPTY;
  const r = raw as { outfit?: unknown; owned?: unknown; churusEarned?: unknown };

  const owned = new Set<AccessoryId>();
  if (Array.isArray(r.owned)) {
    for (const id of r.owned) {
      const item = typeof id === 'string' ? accessoryById(id) : undefined;
      if (item) owned.add(item.id);
    }
  } else if (typeof r.churusEarned === 'number' && Number.isFinite(r.churusEarned)) {
    // Saved before the shop existed: keep everything that was already unlocked.
    for (const item of ACCESSORIES) {
      const unlockAt = LEGACY_UNLOCK_AT[item.id];
      if (unlockAt !== undefined && r.churusEarned >= unlockAt) owned.add(item.id);
    }
  }

  const outfit: Outfit = {};
  if (r.outfit && typeof r.outfit === 'object') {
    for (const id of Object.values(r.outfit)) {
      const item = typeof id === 'string' ? accessoryById(id) : undefined;
      if (item && owned.has(item.id)) outfit[item.slot] = item.id;
    }
  }
  return { outfit, owned: ACCESSORIES.filter((a) => owned.has(a.id)).map((a) => a.id) };
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
  if (!item || !isOwned(state, id)) return;
  commit({ ...state, outfit: toggleInOutfit(state.outfit, item) });
}

/** Marks an accessory as bought (the Churus are paid by the caller). */
export function addPurchase(id: AccessoryId): void {
  const item = accessoryById(id);
  if (item) commit(withPurchase(state, item));
}
