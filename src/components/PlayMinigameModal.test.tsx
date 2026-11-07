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
  MAX_RED_BALL_POUNCES,
  RED_BALL_BATS_REQUIRED,
  LASER_HIT_RADIUS_PX,
  RED_BALL_HIT_RADIUS_PX,
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

  it('renders Red Ball Chase with rolling red ball, 2-tap Bat & Trap combo HUD, and 4 pounces', () => {
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

    expect(html).toContain('Red Ball Chase!');
    expect(html).toContain('Bat the red ball, then pounce to trap it!');
    expect(html).toContain('Bat &amp; Trap (0/2)');
    expect(html).toContain('4 pounces left');
    expect(html).toContain('7.0s');
    expect(html).toContain('Tap the rolling red ball to bat it!');
  });

  it('maintains fair target zones in Feather Pounce and Tail Spin across all 3 rounds', () => {
    // Feather Pounce
    const r1 = getFeatherSweetSpot(0);
    expect(r1.max - r1.min).toBe(36);
    expect(isFeatherInSweetSpot(50, 0)).toBe(true);

    const r3 = getFeatherSweetSpot(2);
    expect(r3.max - r3.min).toBe(24);
    expect(isFeatherInSweetSpot(50, 2)).toBe(true);

    // Tail Spin (0° / 360° top arc)
    const t1 = getTailCatchZone(0);
    expect(t1.halfSpanDeg).toBe(38);
    expect(isTailInCatchZone(0, 0)).toBe(true);
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
    expect(RED_BALL_ROUND_TIME_SEC).toBe(7.0);
    expect(LASER_ROUND_TIME_SEC).toBe(5.0);
    expect(MAX_LASER_POUNCES).toBe(3);
    expect(MAX_RED_BALL_POUNCES).toBe(4);
    expect(RED_BALL_BATS_REQUIRED).toBe(2);
    expect(LASER_HIT_RADIUS_PX).toBe(26);
    expect(RED_BALL_HIT_RADIUS_PX).toBe(30);
  });
});
