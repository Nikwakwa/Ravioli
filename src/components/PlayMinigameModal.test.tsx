import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  PlayMinigameModal,
  MINIGAME_ROUND_TIME_SEC,
  FEATHER_ROUND_TIME_SEC,
  LASER_ROUND_TIME_SEC,
  TAIL_ROUND_TIME_SEC,
  RED_BALL_ROUND_TIME_SEC,
  MAX_LASER_POUNCES,
  RED_BALL_BATS_REQUIRED,
  RED_BALL_PADDLE_HALF_WIDTH_PCT,
  LASER_HIT_RADIUS_PX,
} from './PlayMinigameModal';
import {
  actionById,
  getFeatherSweetSpot,
  getTailCatchZone,
  isFeatherInSweetSpot,
  isTailInCatchZone,
} from '../data/actions';

describe('PlayMinigameModal', () => {
  it('renders Feather Pounce with round timer badge and POUNCE button', () => {
    const featherAction = actionById('feather_wand')!;
    const html = renderToString(
      <PlayMinigameModal
        action={featherAction}
        catName="Oli"
        whimActive={false}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(html).toContain('Feather Pounce!');
    expect(html).toContain('POUNCE!');
    expect(html).toContain('Round 1 of 3');
    expect(html).toContain('Pounce Zone');
    expect(html).toContain('10.0s');
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
      />
    );

    expect(html).toContain('Tail Spin!');
    expect(html).toContain('NAB TAIL!');
    expect(html).toContain('Nab Zone');
    expect(html).toContain('Round 1 of 3');
    expect(html).toContain('8.0s');
  });

  it('renders Red Ball Rally with sliding Oli’s Paw goalie paddle and Under the Sofa hazard zone', () => {
    const ballAction = actionById('red_ball')!;
    const html = renderToString(
      <PlayMinigameModal
        action={ballAction}
        catName="Oli"
        whimActive={false}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(html).toContain('Red Ball Rally!');
    expect(html).toContain('Slide Oli’s paw to keep the ball from rolling under the sofa!');
    expect(html).toContain('Saves: 0/2');
    expect(html).toContain('Oli’s Paw');
    expect(html).toContain('Under the Sofa');
    expect(html).toContain('8.0s');
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

  it('configures round timers and paddle / tap limits appropriately for each game', () => {
    expect(MINIGAME_ROUND_TIME_SEC).toBe(10.0);
    expect(FEATHER_ROUND_TIME_SEC).toBe(10.0);
    expect(TAIL_ROUND_TIME_SEC).toBe(8.0);
    expect(RED_BALL_ROUND_TIME_SEC).toBe(8.0);
    expect(LASER_ROUND_TIME_SEC).toBe(5.0);
    expect(MAX_LASER_POUNCES).toBe(3);
    expect(RED_BALL_BATS_REQUIRED).toBe(2);
    expect(RED_BALL_PADDLE_HALF_WIDTH_PCT).toBe(17);
    expect(LASER_HIT_RADIUS_PX).toBe(26);
  });
});
