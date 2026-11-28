/**
 * Cozy Room Customization: personal decor swaps & seasonal room props bought with Churu tubes.
 * Saved on this device (`ravioli:v1:room_decor`) and automatically cleared on game reset.
 */

export type DecorId =
  | 'rug_terracotta'
  | 'rug_sage'
  | 'fairy_lights'
  | 'box_stickers'
  | 'decor_pumpkins'
  | 'decor_spring_vase'
  | 'decor_xmas_tree'
  | 'balcony_lavender'
  | 'balcony_cat_grass';

export type DecorSlot = 'rug' | 'window_lights' | 'box_stickers' | 'seasonal_decor' | 'balcony_plants';

export type DecorRoomGroup = 'living_room' | 'seasonal' | 'balcony';

export interface DecorItem {
  id: DecorId;
  name: string;
  emoji: string;
  slot: DecorSlot;
  group: DecorRoomGroup;
  /** Short plain-language description shown on the shop card. */
  hint: string;
  /** Churu tubes it costs to buy. */
  price: number;
}

export const DECOR_ITEMS: DecorItem[] = [
  // Living Room swaps
  {
    id: 'rug_terracotta',
    name: 'Terracotta Rug',
    emoji: '🧶',
    slot: 'rug',
    group: 'living_room',
    hint: 'Warm sunset rug',
    price: 3,
  },
  {
    id: 'box_stickers',
    name: 'Silly Box Stickers',
    emoji: '📦',
    slot: 'box_stickers',
    group: 'living_room',
    hint: 'Fun decals on Oli’s box',
    price: 3,
  },
  {
    id: 'fairy_lights',
    name: 'Fairy String Lights',
    emoji: '✨',
    slot: 'window_lights',
    group: 'living_room',
    hint: 'Warm glow over window',
    price: 4,
  },
  {
    id: 'rug_sage',
    name: 'Sage Plaid Rug',
    emoji: '🌿',
    slot: 'rug',
    group: 'living_room',
    hint: 'Cozy sage check rug',
    price: 5,
  },

  // Seasonal & Table Decor (Living Room coffee table + Balcony)
  {
    id: 'decor_pumpkins',
    name: 'Cozy Pumpkins',
    emoji: '🎃',
    slot: 'seasonal_decor',
    group: 'seasonal',
    hint: 'Autumn gourds year-round',
    price: 4,
  },
  {
    id: 'decor_spring_vase',
    name: 'Spring Tulip Vase',
    emoji: '🌷',
    slot: 'seasonal_decor',
    group: 'seasonal',
    hint: 'Fresh blooms on table',
    price: 5,
  },
  {
    id: 'decor_xmas_tree',
    name: 'Mini Christmas Tree',
    emoji: '🎄',
    slot: 'seasonal_decor',
    group: 'seasonal',
    hint: 'Lit tree & cypress lights',
    price: 8,
  },

  // Balcony Railing Plants
  {
    id: 'balcony_lavender',
    name: 'Lavender Pots',
    emoji: '🪻',
    slot: 'balcony_plants',
    group: 'balcony',
    hint: 'Purple blooms on rail',
    price: 5,
  },
  {
    id: 'balcony_cat_grass',
    name: 'Cat Grass Tray',
    emoji: '🌱',
    slot: 'balcony_plants',
    group: 'balcony',
    hint: 'Lush green tufts on rail',
    price: 6,
  },
];

export type EquippedDecor = Partial<Record<DecorSlot, DecorId>>;

export interface RoomDecorState {
  equipped: EquippedDecor;
  owned: DecorId[];
}

const LS_ROOM_DECOR = 'ravioli:v1:room_decor';
const EMPTY: RoomDecorState = { equipped: {}, owned: [] };

export function decorById(id: string): DecorItem | undefined {
  return DECOR_ITEMS.find((d) => d.id === id);
}

export function isDecorOwned(state: RoomDecorState, id: DecorId): boolean {
  return state.owned.includes(id);
}

export function canAffordDecor(item: DecorItem, churuStash: number): boolean {
  return churuStash >= item.price;
}

export function hasAffordableDecor(state: RoomDecorState, churuStash: number): boolean {
  return DECOR_ITEMS.some((d) => !isDecorOwned(state, d.id) && canAffordDecor(d, churuStash));
}

/** Equips a decor item (replacing any item in the same slot) or unequips it if already active. */
export function toggleInRoomDecor(equipped: EquippedDecor, item: DecorItem): EquippedDecor {
  const next: EquippedDecor = { ...equipped };
  if (next[item.slot] === item.id) delete next[item.slot];
  else next[item.slot] = item.id;
  return next;
}

/** Marks an item bought and immediately displays it in the apartment. */
export function withDecorPurchase(state: RoomDecorState, item: DecorItem): RoomDecorState {
  if (isDecorOwned(state, item.id)) return state;
  return {
    owned: [...state.owned, item.id],
    equipped: { ...state.equipped, [item.slot]: item.id },
  };
}

/** Drops unknown or unowned entries from persisted room decor data. */
export function sanitizeRoomDecor(raw: unknown): RoomDecorState {
  if (!raw || typeof raw !== 'object') return EMPTY;
  const r = raw as { equipped?: unknown; owned?: unknown };

  const owned = new Set<DecorId>();
  if (Array.isArray(r.owned)) {
    for (const id of r.owned) {
      const item = typeof id === 'string' ? decorById(id) : undefined;
      if (item) owned.add(item.id);
    }
  }

  const equipped: EquippedDecor = {};
  if (r.equipped && typeof r.equipped === 'object') {
    for (const id of Object.values(r.equipped)) {
      const item = typeof id === 'string' ? decorById(id) : undefined;
      if (item && owned.has(item.id)) equipped[item.slot] = item.id;
    }
  }

  return { equipped, owned: DECOR_ITEMS.filter((d) => owned.has(d.id)).map((d) => d.id) };
}

function load(): RoomDecorState {
  try {
    if (typeof localStorage === 'undefined') return EMPTY;
    const raw = localStorage.getItem(LS_ROOM_DECOR);
    return raw ? sanitizeRoomDecor(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

let state: RoomDecorState = load();
const listeners = new Set<() => void>();

function commit(next: RoomDecorState): void {
  state = next;
  try {
    localStorage.setItem(LS_ROOM_DECOR, JSON.stringify(next));
  } catch {
    /* no-op */
  }
  listeners.forEach((l) => l());
}

export function subscribeRoomDecor(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRoomDecor(): RoomDecorState {
  return state;
}

export function getEmptyRoomDecor(): RoomDecorState {
  return EMPTY;
}

export function toggleRoomDecor(id: DecorId): void {
  const item = decorById(id);
  if (!item || !isDecorOwned(state, id)) return;
  commit({ ...state, equipped: toggleInRoomDecor(state.equipped, item) });
}

export function addDecorPurchase(id: DecorId): void {
  const item = decorById(id);
  if (item) commit(withDecorPurchase(state, item));
}
