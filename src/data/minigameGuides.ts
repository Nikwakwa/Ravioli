export interface MinigameGuide {
  /** Short 1-line rules with leading emoji so players can scan them in 3 seconds. */
  steps: { emoji: string; text: string }[];
}

export const MINIGAME_GUIDES: Record<string, MinigameGuide> = {
  peek_a_boo: {
    steps: [
      { emoji: '🐱', text: 'Tap Oli whenever he peeks out from a hiding spot.' },
      { emoji: '🎯', text: 'Score 2–3 boops before time runs out (3 tries per round).' },
      { emoji: '🐭', text: 'In Rounds 2 & 3, ignore the decoy toy mouse!' },
    ],
  },
  feather_wand: {
    steps: [
      { emoji: '🪶', text: 'Watch the feather zip back and forth.' },
      { emoji: '🐾', text: 'Tap POUNCE while it’s inside the green zone.' },
      { emoji: '⚡', text: 'The green zone shrinks and speeds up each round.' },
    ],
  },
  tail_chase: {
    steps: [
      { emoji: '🌀', text: 'Watch Oli’s tail tip spin around the circle.' },
      { emoji: '🐾', text: 'Tap NAB TAIL when the white tip hits the green arc.' },
      { emoji: '💫', text: 'It spins faster and flips direction each round.' },
    ],
  },
  laser_pointer: {
    steps: [
      { emoji: '🔴', text: 'Track the red laser dot darting across the rug.' },
      { emoji: '🐾', text: 'Tap directly on the dot to pounce on it.' },
      { emoji: '⏱️', text: 'You get 3 pounces and 5 seconds per round!' },
    ],
  },
  box_shuffle: {
    steps: [
      { emoji: '👀', text: 'Watch which cardboard box hides Oli’s treat.' },
      { emoji: '📦', text: 'Keep your eyes on it while the boxes swap.' },
      { emoji: '🐾', text: 'Tap the box hiding the treat once they stop.' },
    ],
  },
  paw_pattern: {
    steps: [
      { emoji: '👀', text: 'Watch which pillows Oli taps in order.' },
      { emoji: '🐾', text: 'Tap the same pillows back in the exact sequence.' },
      { emoji: '📈', text: 'Each round adds one more step (3 → 4 → 5).' },
    ],
  },
  snack_match: {
    steps: [
      { emoji: '👀', text: 'Memorize the snacks during the quick opening peek.' },
      { emoji: '🃏', text: 'Flip two cards at a time to match every pair.' },
      { emoji: '📈', text: 'More pairs appear each round (2 → 3 → 4).' },
    ],
  },
  cat_trivia: {
    steps: [
      { emoji: '🧠', text: 'Answer 3 quick questions about cats and Oli.' },
      { emoji: '✅', text: 'Tap the best answer before the 15s timer runs out.' },
      { emoji: '✨', text: 'Read a fun cat fact after each question.' },
    ],
  },
};

const LS_SEEN_GUIDES = 'ravioli:v1:minigame_guides_seen';

export function loadSeenMinigameGuides(): string[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(LS_SEEN_GUIDES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export function hasSeenMinigameGuide(actionId: string): boolean {
  return loadSeenMinigameGuides().includes(actionId);
}

export function markMinigameGuideSeen(actionId: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const seen = loadSeenMinigameGuides();
    if (seen.includes(actionId)) return;
    localStorage.setItem(LS_SEEN_GUIDES, JSON.stringify([...seen, actionId]));
  } catch {
    // ignore storage errors
  }
}
