import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { GrowthCelebrationModal } from './GrowthCelebrationModal';
import { StatusHUD } from './StatusHUD';
import { computeLiveStats, createDefaultCatState, createNewGameCatState } from '../utils/decayEngine';

describe('GrowthCelebrationModal', () => {
  it('renders Kitten celebration with newly unlocked highlights and Churu gift', () => {
    const html = renderToString(<GrowthCelebrationModal stage="kitten" onClose={vi.fn()} />);

    expect(html).toContain('Oli Grew Up!');
    expect(html).toContain('Oli is now a Playful Kitten!');
    expect(html).toContain('Wet Food, Chicken Hearts');
    expect(html).toContain('Feather Wand');
    expect(html).toContain('+1 Churu tube to celebrate!');
  });

  it('renders Adult celebration reassuring that Oli stays Adult forever', () => {
    const html = renderToString(<GrowthCelebrationModal stage="adult" onClose={vi.fn()} />);

    expect(html).toContain('All Grown Up!');
    expect(html).toContain('Oli is now Adult Oli!');
    expect(html).toContain('never grow old');
    expect(html).toContain('Oli never ages past Adult');
  });
});

describe('StatusHUD growth progress bar', () => {
  it('shows the stage pill and growth progress bar while Oli is growing (Newborn/Kitten/Teen)', () => {
    const baby = computeLiveStats(createNewGameCatState(1_000_000), 1_000_000);
    const html = renderToString(
      <StatusHUD live={baby} mood="happy" onOpenMenu={vi.fn()} />,
    );

    expect(html).toContain('Newborn');
    expect(html).toContain('data-testid="growth-progress-bar"');
    expect(html).toContain('Kitten');
  });

  it('shows Adult badge and hides the growth progress bar once Oli is Adult forever', () => {
    const adult = computeLiveStats(createDefaultCatState(1_000_000, 'adult'), 1_000_000);
    const html = renderToString(
      <StatusHUD live={adult} mood="happy" onOpenMenu={vi.fn()} />,
    );

    expect(html).toContain('Adult');
    expect(html).not.toContain('data-testid="growth-progress-bar"');
  });
});
