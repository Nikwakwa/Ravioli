import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  PlayMinigameModal,
  MINIGAME_ROUND_TIME_SEC,
  FEATHER_ROUND_TIME_SEC,
  LASER_ROUND_TIME_SEC,
  TAIL_ROUND_TIME_SEC,
  MAX_LASER_POUNCES,
  LASER_HIT_RADIUS_PX,
} from './PlayMinigameModal';
import {
  actionById,
  CARE_ACTIONS,
  getFeatherSweetSpot,
  getTailCatchZone,
  isFeatherInSweetSpot,
  isTailInCatchZone,
} from '../data/actions';
import {
  BOX_SHUFFLE_ROUND_TIME_SEC,
  buildSnackDeck,
  CAT_TRIVIA_ROUND_TIME_SEC,
  generatePawPattern,
  generateShuffleSwaps,
  getBoxShuffleConfig,
  getPawPatternConfig,
  getPeekTiming,
  getSnackRoundConfig,
  MAX_PEEK_MISTAKES,
  PEEK_A_BOO_ROUND_TIME_SEC,
  PEEK_SPOTS,
} from '../data/brainGames';
import { CAT_TRIVIA_QUESTIONS, pickTriviaQuestions, prepareTriviaQuestion } from '../data/catTrivia';
import { MINIGAME_GUIDES } from '../data/minigameGuides';

describe('PlayMinigameModal', () => {
  it('shows a calm How to Play intro screen on first run (before starting timer) for every game', () => {
    const playActions = CARE_ACTIONS.filter((a) => a.category === 'play');
    expect(playActions).toHaveLength(8);

    for (const act of playActions) {
      expect(MINIGAME_GUIDES[act.id]?.steps.length).toBeGreaterThanOrEqual(2);
      const html = renderToString(
        <PlayMinigameModal
          action={act}
          catName="Oli"
          whimActive={false}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      expect(html).toContain('How to Play');
      expect(html).toContain('Start Playing!');
      expect(html).toContain('Skip');
      expect(html).not.toContain('Round 1 of 3');
    }
  });

  it('renders Feather Pounce with round timer badge, help button, and POUNCE button', () => {
    const featherAction = actionById('feather_wand')!;
    const html = renderToString(
      <PlayMinigameModal
        action={featherAction}
        catName="Oli"
        whimActive={false}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        skipIntro
      />
    );

    expect(html).toContain('Feather Pounce!');
    expect(html).toContain('POUNCE!');
    expect(html).toContain('Round 1 of 3');
    expect(html).toContain('Pounce Zone');
    expect(html).toContain('10.0s');
    expect(html).toContain('How to play');
    expect(html).toContain('Skip');
  });

  it('renders Laser Zoomies with chase arena, pounce limit HUD, and faster countdown', () => {
    const laserAction = actionById('laser_pointer')!;
    const html = renderToString(
      <PlayMinigameModal
        action={laserAction}
        catName="Oli"
        whimActive={false}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        skipIntro
      />
    );

    expect(html).toContain('Laser Zoomies!');
    expect(html).toContain('Round 1 of 3');
    expect(html).toContain('Catch the red dot in 3 pounces or less!');
    expect(html).toContain('Pounces Left');
    expect(html).toContain('3 pounces left');
    expect(html).toContain('5.0s');
    expect(html).toContain('Track the red dot and tap to catch it!');
    expect(html).toContain('Skip');
  });

  it('renders Tail Spin solo chase with 360° ring, Nab Zone, and NAB TAIL button', () => {
    const tailAction = actionById('tail_chase')!;
    const html = renderToString(
      <PlayMinigameModal
        action={tailAction}
        catName="Oli"
        whimActive={false}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        skipIntro
      />
    );

    expect(html).toContain('Tail Spin!');
    expect(html).toContain('NAB TAIL!');
    expect(html).toContain('Nab Zone');
    expect(html).toContain('Round 1 of 3');
    expect(html).toContain('8.0s');
  });

  it('renders Peek-a-Boo Active reflex game with 6 hiding spots, multi-boop goal, and 8.0s timer', () => {
    const peekAction = actionById('peek_a_boo')!;
    const html = renderToString(
      <PlayMinigameModal
        action={peekAction}
        catName="Oli"
        whimActive={false}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        skipIntro
      />
    );

    expect(html).toContain('Peek-a-Boo!');
    expect(html).toContain('Blanket');
    expect(html).toContain('Box');
    expect(html).toContain('Pillow');
    expect(html).toContain('Basket');
    expect(html).toContain('Curtain');
    expect(html).toContain('Cushion');
    expect(html).toContain('Boops: 0/2');
    expect(html).toContain('8.0s');
  });

  it('renders Box Shuffle with 3 cardboard boxes and swap counter', () => {
    const shuffleAction = actionById('box_shuffle')!;
    const html = renderToString(
      <PlayMinigameModal
        action={shuffleAction}
        catName="Oli"
        whimActive={false}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        skipIntro
      />
    );

    expect(html).toContain('Box Shuffle!');
    expect(html).toContain('Follow the treat under the cardboard boxes!');
    expect(html).toContain('3 swaps');
    expect(html).toContain('8.0s');
  });

  it('renders Paw Pattern Simon-Says Brain game with 4 cozy paw pillows', () => {
    const patternAction = actionById('paw_pattern')!;
    const html = renderToString(
      <PlayMinigameModal
        action={patternAction}
        catName="Oli"
        whimActive={false}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        skipIntro
      />
    );

    expect(html).toContain('Paw Pattern!');
    expect(html).toContain('Watch Oli’s paws and repeat the pattern!');
    expect(html).toContain('Sun');
    expect(html).toContain('Fish');
    expect(html).toContain('Heart');
    expect(html).toContain('Leaf');
    expect(html).toContain('8.0s');
  });

  it('renders Snack Match with pair tracker and memory card grid', () => {
    const matchAction = actionById('snack_match')!;
    const html = renderToString(
      <PlayMinigameModal
        action={matchAction}
        catName="Oli"
        whimActive={false}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        skipIntro
      />
    );

    expect(html).toContain('Snack Match!');
    expect(html).toContain('Pairs: 0/2');
    expect(html).toContain('12.0s');
  });

  it('renders Cat Trivia with 3 choices and 15.0s timer', () => {
    const triviaAction = actionById('cat_trivia')!;
    const html = renderToString(
      <PlayMinigameModal
        action={triviaAction}
        catName="Oli"
        whimActive={false}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        skipIntro
      />
    );

    expect(html).toContain('Cat Trivia!');
    expect(html).toContain('Answer 3 quick cat &amp; Oli questions!');
    expect(html).toContain('15.0s');
    expect(html).toContain('Round 1 of 3');
  });

  it('maintains fair target zones in Feather Pounce and Tail Spin across all 3 rounds (including unwrapped angles)', () => {
    // Feather Pounce
    const r1 = getFeatherSweetSpot(0);
    expect(r1.max - r1.min).toBe(36);
    expect(isFeatherInSweetSpot(50, 0)).toBe(true);

    const r3 = getFeatherSweetSpot(2);
    expect(r3.max - r3.min).toBe(24);
    expect(isFeatherInSweetSpot(50, 2)).toBe(true);

    // Tail Spin (0° / 360° / 720° top arc)
    const t1 = getTailCatchZone(0);
    expect(t1.halfSpanDeg).toBe(38);
    expect(isTailInCatchZone(0, 0)).toBe(true);
    expect(isTailInCatchZone(360, 0)).toBe(true);
    expect(isTailInCatchZone(720, 0)).toBe(true);
    expect(isTailInCatchZone(-20, 0)).toBe(true);
    expect(isTailInCatchZone(330, 0)).toBe(true);
    expect(isTailInCatchZone(180, 0)).toBe(false);

    const t3 = getTailCatchZone(2);
    expect(t3.halfSpanDeg).toBe(28);
    expect(isTailInCatchZone(340, 2)).toBe(true);
    expect(isTailInCatchZone(326, 2)).toBe(false);
  });

  it('configures round timers and tap limits appropriately for each game', () => {
    expect(MINIGAME_ROUND_TIME_SEC).toBe(10.0);
    expect(FEATHER_ROUND_TIME_SEC).toBe(10.0);
    expect(TAIL_ROUND_TIME_SEC).toBe(8.0);
    expect(LASER_ROUND_TIME_SEC).toBe(5.0);
    expect(PEEK_A_BOO_ROUND_TIME_SEC).toBe(8.0);
    expect(BOX_SHUFFLE_ROUND_TIME_SEC).toBe(8.0);
    expect(CAT_TRIVIA_ROUND_TIME_SEC).toBe(15.0);
    expect(MAX_LASER_POUNCES).toBe(3);
    expect(MAX_PEEK_MISTAKES).toBe(3);
    expect(LASER_HIT_RADIUS_PX).toBe(26);
  });

  it('builds valid Peek-a-Boo, Paw Pattern, Box Shuffle, Snack Match, and Cat Trivia rounds', () => {
    // Harder Peek-a-Boo: 6 spots, faster peeks, more boops, and decoys in R2–R3
    expect(PEEK_SPOTS).toHaveLength(6);
    expect(getPeekTiming(0).peekMs).toBeGreaterThan(getPeekTiming(2).peekMs);
    expect(getPeekTiming(0).boopsRequired).toBe(2);
    expect(getPeekTiming(1).hasDecoy).toBe(true);
    expect(getPeekTiming(2).boopsRequired).toBe(3);

    // Paw Pattern: 3 → 4 → 5 steps, avoids 3 identical pads in a row
    expect(getPawPatternConfig(0).steps).toBe(3);
    expect(getPawPatternConfig(1).steps).toBe(4);
    expect(getPawPatternConfig(2).steps).toBe(5);
    const seq = generatePawPattern(12);
    expect(seq).toHaveLength(12);
    for (let i = 2; i < seq.length; i++) {
      expect(seq[i] === seq[i - 1] && seq[i - 1] === seq[i - 2]).toBe(false);
    }

    // Box Shuffle generates distinct non-repeating adjacent swap pairs
    const swaps = generateShuffleSwaps(5);
    expect(swaps).toHaveLength(5);
    for (let i = 0; i < swaps.length; i++) {
      expect(swaps[i][0]).not.toBe(swaps[i][1]);
      if (i > 0) {
        expect(swaps[i]).not.toEqual(swaps[i - 1]);
      }
    }
    expect(getBoxShuffleConfig(2).swaps).toBe(5);

    // Snack Match decks contain exact pairs
    for (let r = 0; r < 3; r++) {
      const cfg = getSnackRoundConfig(r);
      const deck = buildSnackDeck(cfg.pairs);
      expect(deck).toHaveLength(cfg.pairs * 2);
      const counts = new Map<string, number>();
      for (const c of deck) counts.set(c.pairId, (counts.get(c.pairId) ?? 0) + 1);
      expect(Array.from(counts.values())).toEqual(Array(cfg.pairs).fill(2));
    }

    // Cat Trivia deck has 50+ unique questions, shuffles choices accurately, and avoids repeats
    expect(CAT_TRIVIA_QUESTIONS.length).toBeGreaterThanOrEqual(50);
    const ids = new Set(CAT_TRIVIA_QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(CAT_TRIVIA_QUESTIONS.length);

    const sample = CAT_TRIVIA_QUESTIONS[0];
    const prepared = prepareTriviaQuestion(sample);
    expect(prepared.choices[prepared.answerIndex]).toBe(sample.choices[sample.answerIndex]);

    const batch1 = pickTriviaQuestions(3, []);
    const batch2 = pickTriviaQuestions(3, batch1.nextSeenIds);
    const b1Ids = new Set(batch1.questions.map((q) => q.id));
    for (const q of batch2.questions) {
      expect(b1Ids.has(q.id)).toBe(false);
    }
  });
});

