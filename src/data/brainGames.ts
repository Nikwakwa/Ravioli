export const PEEK_A_BOO_ROUND_TIME_SEC = 8.0;
export const BOX_SHUFFLE_ROUND_TIME_SEC = 8.0;
export const CAT_TRIVIA_ROUND_TIME_SEC = 15.0;

export const MAX_PEEK_MISTAKES = 3;

export interface HidingSpot {
  id: number;
  label: string;
  emoji: string;
}

export const PEEK_SPOTS: readonly HidingSpot[] = [
  { id: 0, label: 'Blanket', emoji: '🛏️' },
  { id: 1, label: 'Box', emoji: '📦' },
  { id: 2, label: 'Pillow', emoji: '🛋️' },
  { id: 3, label: 'Basket', emoji: '🧺' },
  { id: 4, label: 'Curtain', emoji: '🪟' },
  { id: 5, label: 'Cushion', emoji: '🧶' },
] as const;

export interface PeekRoundConfig {
  peekMs: number;
  hideMs: number;
  boopsRequired: number;
  hasDecoy: boolean;
}

/** Peek-a-Boo is a snappy Active reflex game: 6 spots, faster peeks, multi-boop, and decoy toys in R2–R3. */
export function getPeekTiming(roundIndex: number): PeekRoundConfig {
  const idx = Math.min(2, Math.max(0, roundIndex));
  if (idx === 0) return { peekMs: 1050, hideMs: 280, boopsRequired: 2, hasDecoy: false };
  if (idx === 1) return { peekMs: 820, hideMs: 240, boopsRequired: 3, hasDecoy: true };
  return { peekMs: 650, hideMs: 200, boopsRequired: 3, hasDecoy: true };
}

export interface PawPadDef {
  id: number;
  label: string;
  emoji: string;
  idleClass: string;
  litClass: string;
}

export const PAW_PADS: readonly PawPadDef[] = [
  {
    id: 0,
    label: 'Sun',
    emoji: '☀️',
    idleClass: 'border-amber-400/50 bg-amber-100/80 text-amber-950',
    litClass: 'border-amber-500 bg-amber-400 text-amber-950 ring-4 ring-amber-300/80 scale-105',
  },
  {
    id: 1,
    label: 'Fish',
    emoji: '🐟',
    idleClass: 'border-sky-400/50 bg-sky-100/80 text-sky-950',
    litClass: 'border-sky-500 bg-sky-400 text-white ring-4 ring-sky-300/80 scale-105',
  },
  {
    id: 2,
    label: 'Heart',
    emoji: '💖',
    idleClass: 'border-rose-400/50 bg-rose-100/80 text-rose-950',
    litClass: 'border-rose-500 bg-rose-400 text-white ring-4 ring-rose-300/80 scale-105',
  },
  {
    id: 3,
    label: 'Leaf',
    emoji: '🌿',
    idleClass: 'border-emerald-400/50 bg-emerald-100/80 text-emerald-950',
    litClass: 'border-emerald-500 bg-emerald-400 text-white ring-4 ring-emerald-300/80 scale-105',
  },
] as const;

export interface PawPatternConfig {
  steps: number;
  stepMs: number;
  gapMs: number;
  timeSec: number;
}

export function getPawPatternConfig(roundIndex: number): PawPatternConfig {
  const idx = Math.min(2, Math.max(0, roundIndex));
  if (idx === 0) return { steps: 3, stepMs: 560, gapMs: 170, timeSec: 8.0 };
  if (idx === 1) return { steps: 4, stepMs: 470, gapMs: 150, timeSec: 10.0 };
  return { steps: 5, stepMs: 390, gapMs: 130, timeSec: 12.0 };
}

/** Generates a Simon-Says pad sequence (0..3) while avoiding 3 identical taps in a row. */
export function generatePawPattern(
  steps: number,
  rng: () => number = Math.random,
): number[] {
  const seq: number[] = [];
  for (let i = 0; i < steps; i++) {
    let pick = Math.floor(rng() * PAW_PADS.length);
    if (i >= 2 && seq[i - 1] === pick && seq[i - 2] === pick) {
      pick = (pick + 1 + Math.floor(rng() * (PAW_PADS.length - 1))) % PAW_PADS.length;
    }
    seq.push(pick);
  }
  return seq;
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
