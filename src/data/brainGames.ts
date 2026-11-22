export const PEEK_A_BOO_ROUND_TIME_SEC = 10.0;
export const BOX_SHUFFLE_ROUND_TIME_SEC = 8.0;
export const CAT_TRIVIA_ROUND_TIME_SEC = 15.0;

export const MAX_PEEK_BOOPS = 3;

export interface HidingSpot {
  id: number;
  label: string;
  emoji: string;
}

export const PEEK_SPOTS: readonly HidingSpot[] = [
  { id: 0, label: 'Blanket', emoji: '🛏️' },
  { id: 1, label: 'Box', emoji: '📦' },
  { id: 2, label: 'Pillow', emoji: '🛋️' },
] as const;

/** Peek-a-Boo timing gets gently livelier each round while staying cozy for Newborns. */
export function getPeekTiming(roundIndex: number): { peekMs: number; hideMs: number } {
  const idx = Math.min(2, Math.max(0, roundIndex));
  const peekMs = idx === 0 ? 1850 : idx === 1 ? 1450 : 1150;
  const hideMs = idx === 0 ? 520 : idx === 1 ? 460 : 400;
  return { peekMs, hideMs };
}

export interface BoxShuffleConfig {
  swaps: number;
  swapMs: number;
  revealMs: number;
  treatEmoji: string;
  treatName: string;
}

const SHUFFLE_TREATS: readonly { emoji: string; name: string }[] = [
  { emoji: '🍬', name: 'Churu' },
  { emoji: '🐟', name: 'Fish Treat' },
  { emoji: '🍗', name: 'Chicken Heart' },
];

export function getBoxShuffleConfig(roundIndex: number): BoxShuffleConfig {
  const idx = Math.min(2, Math.max(0, roundIndex));
  const treat = SHUFFLE_TREATS[idx];
  return {
    swaps: 3 + idx, // R1: 3 swaps, R2: 4 swaps, R3: 5 swaps
    swapMs: idx === 0 ? 600 : idx === 1 ? 470 : 370,
    revealMs: 1100,
    treatEmoji: treat.emoji,
    treatName: treat.name,
  };
}

/**
 * Generates a list of box-slot swaps `[slotA, slotB]` (each 0..2, distinct)
 * avoiding immediate back-to-back identical swaps so shuffles look lively and fair.
 */
export function generateShuffleSwaps(
  count: number,
  rng: () => number = Math.random,
): Array<[number, number]> {
  const pairs: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [0, 2],
  ];
  const result: Array<[number, number]> = [];
  let prevIdx = -1;
  for (let i = 0; i < count; i++) {
    let pick = Math.floor(rng() * pairs.length);
    if (pick === prevIdx) {
      pick = (pick + 1 + Math.floor(rng() * (pairs.length - 1))) % pairs.length;
    }
    prevIdx = pick;
    result.push(pairs[pick]);
  }
  return result;
}

export interface SnackCardDef {
  pairId: string;
  emoji: string;
  label: string;
}

export const SNACK_POOL: readonly SnackCardDef[] = [
  { pairId: 'churu', emoji: '🍬', label: 'Churu' },
  { pairId: 'fish', emoji: '🐟', label: 'Fish' },
  { pairId: 'egg', emoji: '🥚', label: 'Quail Egg' },
  { pairId: 'feather', emoji: '🪶', label: 'Feather' },
  { pairId: 'milk', emoji: '🍼', label: 'Milk' },
  { pairId: 'box', emoji: '📦', label: 'Box' },
  { pairId: 'ball', emoji: '🔴', label: 'Red Ball' },
  { pairId: 'heart', emoji: '🧡', label: 'Snack' },
] as const;

export interface SnackCard {
  uid: string;
  pairId: string;
  emoji: string;
  label: string;
}

export interface SnackRoundConfig {
  pairs: number;
  timeSec: number;
  previewMs: number;
  columns: 2 | 3 | 4;
}

export function getSnackRoundConfig(roundIndex: number): SnackRoundConfig {
  const idx = Math.min(2, Math.max(0, roundIndex));
  if (idx === 0) return { pairs: 2, timeSec: 12.0, previewMs: 950, columns: 2 };
  if (idx === 1) return { pairs: 3, timeSec: 16.0, previewMs: 1150, columns: 3 };
  return { pairs: 4, timeSec: 22.0, previewMs: 1350, columns: 4 };
}

export function buildSnackDeck(
  pairs: number,
  rng: () => number = Math.random,
): SnackCard[] {
  const pool = [...SNACK_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const chosen = pool.slice(0, Math.min(pairs, pool.length));
  const cards: SnackCard[] = [];
  for (const def of chosen) {
    cards.push({ uid: `${def.pairId}-a`, pairId: def.pairId, emoji: def.emoji, label: def.label });
    cards.push({ uid: `${def.pairId}-b`, pairId: def.pairId, emoji: def.emoji, label: def.label });
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
