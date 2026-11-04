import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PlayMinigameModal, MINIGAME_ROUND_TIME_SEC } from './PlayMinigameModal';
import { actionById, getFeatherSweetSpot, isFeatherInSweetSpot } from '../data/actions';

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
    expect(html).toContain('Skip');
  });

  it('renders Laser Zoomies with chase arena and round countdown', () => {
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
    expect(html).toContain('Track the red dot and tap to catch it!');
    expect(html).toContain('Skip');
    // Ensure old static spoiler text/buttons are completely gone
    expect(html).not.toContain('Which Paw? Left or Right!');
    expect(html).not.toContain('Left Paw');
    expect(html).not.toContain('Right Paw');
  });

  it('maintains a fair sweet spot in Feather Pounce without over-narrowing', () => {
    // Round 1 sweet spot: 32% to 68% (36% width)
    const r1 = getFeatherSweetSpot(0);
    expect(r1.max - r1.min).toBe(36);
    expect(isFeatherInSweetSpot(50, 0)).toBe(true);

    // Round 2 sweet spot: 35% to 65% (30% width)
    const r2 = getFeatherSweetSpot(1);
    expect(r2.max - r2.min).toBe(30);

    // Round 3 sweet spot: 38% to 62% (24% width - still almost a quarter of the bar!)
    const r3 = getFeatherSweetSpot(2);
    expect(r3.max - r3.min).toBe(24);
    expect(r3.min).toBe(38);
    expect(r3.max).toBe(62);
    expect(isFeatherInSweetSpot(50, 2)).toBe(true);
  });

  it('configures round time to 4.0 seconds for snappy rounds', () => {
    expect(MINIGAME_ROUND_TIME_SEC).toBe(4.0);
  });
});
