/**
 * Oli's Daily Fortune Cookie:
 * Unlocked with Churu tubes in the shop.
 * Cracking open the cookie reveals a fresh, sweet, funny cat fortune once a day.
 */

export interface Fortune {
  id: number;
  text: string;
  luckySpot: string;
  luckySnack: string;
  luckyVibe: string;
}

export const FORTUNE_COOKIE_PRICE = 5;

export const FORTUNES: Fortune[] = [
  {
    id: 1,
    text: 'If a problem feels too big to solve, sleep on it for 14 hours.',
    luckySpot: 'Moroccan Shag Rug',
    luckySnack: 'Chicken Heart',
    luckyVibe: 'Sleepy Loaf 🍞',
  },
  {
    id: 2,
    text: 'Your lap is officially the safest and warmest spot in the apartment today.',
    luckySpot: 'Bolster Bed',
    luckySnack: 'Churu Tube',
    luckyVibe: 'Gentle Purrs 🧡',
  },
  {
    id: 3,
    text: 'When life gets complicated, just act like you meant to do that.',
    luckySpot: 'Cardboard Box',
    luckySnack: 'Quail Egg',
    luckyVibe: 'Total Confidence ✨',
  },
  {
    id: 4,
    text: 'Someone loves you even more than Oli loves his evening wet food pouch.',
    luckySpot: 'Windowsill',
    luckySnack: 'Wet Food Pouch',
    luckyVibe: 'Warm Affection 💕',
  },
  {
    id: 5,
    text: 'There is a warm sunbeam heading your way. Go sit in it.',
    luckySpot: 'Sunny Balcony',
    luckySnack: 'Fresh Water',
    luckyVibe: 'Sunbather ☀️',
  },
  {
    id: 6,
    text: 'Never let anyone rush you. Cats never rush, and they are always on time.',
    luckySpot: 'Moroccan Shag Rug',
    luckySnack: 'Chicken Heart',
    luckyVibe: 'Unbothered King 👑',
  },
  {
    id: 7,
    text: 'Stretch out, take up the whole couch, and apologize for nothing.',
    luckySpot: 'Bolster Bed',
    luckySnack: 'Churu Tube',
    luckyVibe: 'Big Stretch 🐾',
  },
  {
    id: 8,
    text: 'A surprise headbutt of affection will instantly improve your afternoon.',
    luckySpot: 'Moroccan Shag Rug',
    luckySnack: 'Quail Egg',
    luckyVibe: 'Head Boops 🥰',
  },
  {
    id: 9,
    text: 'Treat yourself today. You have earned at least one extra snack.',
    luckySpot: 'Cardboard Box',
    luckySnack: 'Churu Tube',
    luckyVibe: 'Treat Monster 🍬',
  },
  {
    id: 10,
    text: 'Keep your whiskers forward and your curiosity high.',
    luckySpot: 'Sunny Balcony',
    luckySnack: 'Fresh Water',
    luckyVibe: 'Playful Explorer 🌿',
  },
  {
    id: 11,
    text: 'Today’s laundry isn’t a chore; it’s a freshly warmed nesting spot.',
    luckySpot: 'Bolster Bed',
    luckySnack: 'Chicken Heart',
    luckyVibe: 'Cozy Burrow 🧺',
  },
  {
    id: 12,
    text: 'You don’t need to have everything figured out today. Just loaf comfortably.',
    luckySpot: 'Moroccan Shag Rug',
    luckySnack: 'Wet Food Pouch',
    luckyVibe: 'Perfect Loaf 🍞',
  },
  {
    id: 13,
    text: '10 out of 10 orange cats agree: you are doing fantastic.',
    luckySpot: 'Windowsill',
    luckySnack: 'Churu Tube',
    luckyVibe: 'Pure Joy ✨',
  },
  {
    id: 14,
    text: 'When in doubt, meow politely until someone brings you a snack.',
    luckySpot: 'Cardboard Box',
    luckySnack: 'Quail Egg',
    luckyVibe: 'Hungry Whims 😺',
  },
  {
    id: 15,
    text: 'A cardboard box of peaceful quiet is waiting for you at the end of the day.',
    luckySpot: 'Cardboard Box',
    luckySnack: 'Chicken Heart',
    luckyVibe: 'Zen Master 📦',
  },
  {
    id: 16,
    text: 'The best things in life are soft, warm, and purr when held.',
    luckySpot: 'Bolster Bed',
    luckySnack: 'Churu Tube',
    luckyVibe: 'Sweet Cuddles 🧡',
  },
  {
    id: 17,
    text: 'Take a deep breath. Today is going to be a 4-nap kind of day.',
    luckySpot: 'Moroccan Shag Rug',
    luckySnack: 'Fresh Water',
    luckyVibe: 'Afternoon Slumber 😴',
  },
  {
    id: 18,
    text: 'Your hair looks delightfully fluffy today. 10/10 grooming.',
    luckySpot: 'Windowsill',
    luckySnack: 'Wet Food Pouch',
    luckyVibe: 'Fabulous Floof 💅',
  },
  {
    id: 19,
    text: 'Walk into every room like you own every single chair.',
    luckySpot: 'Sunny Balcony',
    luckySnack: 'Chicken Heart',
    luckyVibe: 'Confident Stroll 🐾',
  },
  {
    id: 20,
    text: 'You are officially voted the #1 cat human on the planet.',
    luckySpot: 'Bolster Bed',
    luckySnack: 'Churu Tube',
    luckyVibe: 'Pure Love 💖',
  },
  {
    id: 21,
    text: 'Sometimes the wisest move is rolling onto your back and asking for pets.',
    luckySpot: 'Moroccan Shag Rug',
    luckySnack: 'Quail Egg',
    luckyVibe: 'Belly Up 🐾',
  },
  {
    id: 22,
    text: 'Quiet mornings, warm tea, and gentle purrs are your superpower today.',
    luckySpot: 'Windowsill',
    luckySnack: 'Fresh Water',
    luckyVibe: 'Peaceful Calm 🍵',
  },
  {
    id: 23,
    text: 'Be proud of yourself. You survived yesterday, and you’ve got today.',
    luckySpot: 'Bolster Bed',
    luckySnack: 'Chicken Heart',
    luckyVibe: 'Champion Spirit 🏆',
  },
  {
    id: 24,
    text: 'If you can’t reach the toy, just stare at it until a human picks it up.',
    luckySpot: 'Moroccan Shag Rug',
    luckySnack: 'Churu Tube',
    luckyVibe: 'Mind Control 👁️',
  },
  {
    id: 25,
    text: 'Good things are quietly heading your way at cat-trot speed.',
    luckySpot: 'Sunny Balcony',
    luckySnack: 'Wet Food Pouch',
    luckyVibe: 'Happy News 💌',
  },
  {
    id: 26,
    text: 'Today’s lucky number is 9 (lives left to enjoy).',
    luckySpot: 'Windowsill',
    luckySnack: 'Quail Egg',
    luckyVibe: 'Lucky Charm 🍀',
  },
  {
    id: 27,
    text: 'Rest is not a reward—it is essential daily maintenance.',
    luckySpot: 'Bolster Bed',
    luckySnack: 'Fresh Water',
    luckyVibe: 'Recharging 🔋',
  },
  {
    id: 28,
    text: 'Smile! Somewhere, an orange cat is purring softly because of you.',
    luckySpot: 'Moroccan Shag Rug',
    luckySnack: 'Churu Tube',
    luckyVibe: 'Happy Thoughts 🐱',
  },
  {
    id: 29,
    text: 'Find your coziest corner and stay there as long as you want.',
    luckySpot: 'Cardboard Box',
    luckySnack: 'Chicken Heart',
    luckyVibe: 'Snug Sanctuary 🏡',
  },
  {
    id: 30,
    text: 'Confidence is jumping for a high shelf with 100% belief in your paws.',
    luckySpot: 'Sunny Balcony',
    luckySnack: 'Churu Tube',
    luckyVibe: 'Fearless Leaps 🚀',
  },
  {
    id: 31,
    text: 'Today will be sweet, simple, and filled with little purrs.',
    luckySpot: 'Bolster Bed',
    luckySnack: 'Wet Food Pouch',
    luckyVibe: 'Cozy Heart 🧡',
  },
  {
    id: 32,
    text: 'A sunny window watching birds outside is the best therapy.',
    luckySpot: 'Windowsill',
    luckySnack: 'Fresh Water',
    luckyVibe: 'Cat TV 🕊️',
  },
  {
    id: 33,
    text: 'The universe whispers: it is completely fine to take a midday nap.',
    luckySpot: 'Moroccan Shag Rug',
    luckySnack: 'Quail Egg',
    luckyVibe: 'Midday Snooze 😴',
  },
  {
    id: 34,
    text: 'Give yourself credit for the little victories today. Even grooming counts.',
    luckySpot: 'Cardboard Box',
    luckySnack: 'Chicken Heart',
    luckyVibe: 'Gentle Pride 🌟',
  },
  {
    id: 35,
    text: 'Someone in this house would follow you anywhere for a spoonful of food.',
    luckySpot: 'Moroccan Shag Rug',
    luckySnack: 'Churu Tube',
    luckyVibe: 'Loyal Shadow 🐾',
  },
  {
    id: 36,
    text: 'May your day be as effortless as a cat stretching in the morning sun.',
    luckySpot: 'Sunny Balcony',
    luckySnack: 'Fresh Water',
    luckyVibe: 'Morning Glow 🌅',
  },
];

export interface FortuneState {
  unlocked: boolean;
  lastOpenedDate: string | null;
  todayFortuneId: number | null;
}

const LS_FORTUNE = 'ravioli:v1:fortune';
const EMPTY: FortuneState = {
  unlocked: false,
  lastOpenedDate: null,
  todayFortuneId: null,
};

export function getTodayDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getFortuneIndexForDate(date: Date = new Date()): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const seed = (y * 372 + m * 31 + d * 7) ^ 0x5bf03635;
  return Math.abs(seed) % FORTUNES.length;
}

export function fortuneById(id: number): Fortune {
  return FORTUNES.find((f) => f.id === id) ?? FORTUNES[0];
}

export function isFortuneUnlocked(state: FortuneState): boolean {
  return state.unlocked;
}

export function canAffordFortune(churuStash: number): boolean {
  return churuStash >= FORTUNE_COOKIE_PRICE;
}

export function hasOpenedToday(state: FortuneState, date: Date = new Date()): boolean {
  return state.lastOpenedDate === getTodayDateString(date);
}

export function isFortuneReady(state: FortuneState, date: Date = new Date()): boolean {
  return state.unlocked && !hasOpenedToday(state, date);
}

export function getTodayFortune(state: FortuneState, date: Date = new Date()): Fortune {
  if (state.todayFortuneId !== null && hasOpenedToday(state, date)) {
    return fortuneById(state.todayFortuneId);
  }
  const idx = getFortuneIndexForDate(date);
  return FORTUNES[idx];
}

export function sanitizeFortune(raw: unknown): FortuneState {
  if (!raw || typeof raw !== 'object') return EMPTY;
  const r = raw as Partial<FortuneState>;
  return {
    unlocked: Boolean(r.unlocked),
    lastOpenedDate: typeof r.lastOpenedDate === 'string' ? r.lastOpenedDate : null,
    todayFortuneId: typeof r.todayFortuneId === 'number' && Number.isFinite(r.todayFortuneId) ? r.todayFortuneId : null,
  };
}

function load(): FortuneState {
  try {
    if (typeof localStorage === 'undefined') return EMPTY;
    const raw = localStorage.getItem(LS_FORTUNE);
    return raw ? sanitizeFortune(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

let state: FortuneState = load();
const listeners = new Set<() => void>();

function commit(next: FortuneState): void {
  state = next;
  try {
    localStorage.setItem(LS_FORTUNE, JSON.stringify(next));
  } catch {
    /* no-op */
  }
  listeners.forEach((l) => l());
}

export function subscribeFortune(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFortuneState(): FortuneState {
  return state;
}

export function getEmptyFortuneState(): FortuneState {
  return EMPTY;
}

export function setFortuneState(next: FortuneState): void {
  commit(next);
}

export function unlockFortune(): void {
  if (state.unlocked) return;
  commit({ ...state, unlocked: true });
}

export function openTodayFortune(date: Date = new Date()): Fortune {
  const fortune = getTodayFortune(state, date);
  const dateStr = getTodayDateString(date);
  commit({
    ...state,
    unlocked: true,
    lastOpenedDate: dateStr,
    todayFortuneId: fortune.id,
  });
  return fortune;
}
