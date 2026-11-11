import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BadgeCelebrationModal } from './BadgeCelebrationModal';
import type { BadgeUnlock } from '../utils/badges';

const mockUnlock: BadgeUnlock = {
  badge: {
    id: 'box_sitter',
    name: 'If It Fits I Sits',
    emoji: '📦',
    description: 'Took cozy naps inside the cardboard delivery box.',
    hint: 'Oli loves cardboard deliveries…',
    tiers: {
      bronze: { target: 3, label: '3 box naps' },
      silver: { target: 10, label: '10 box naps' },
      gold: { target: 25, label: '25 box naps' },
    },
  },
  tier: 'bronze',
  isLevelUp: false,
};

describe('BadgeCelebrationModal', () => {
  it('renders badge celebration details and action buttons', () => {
    const html = renderToString(
      <BadgeCelebrationModal
        unlock={mockUnlock}
        onClose={vi.fn()}
        onViewBadges={vi.fn()}
      />
    );

    expect(html).toContain('New Badge Unlocked!');
    expect(html).toContain('If It Fits I Sits');
    expect(html).toContain('📦');
    expect(html).toContain('Bronze Medal (🥉)');
    expect(html).toContain('Took cozy naps inside the cardboard delivery box.');
    expect(html).toContain('+1 Churu tube added to your stash!');
    expect(html).toContain('Awesome! 🐾');
    expect(html).toContain('View Badges');
  });

  it('renders level up title when isLevelUp is true', () => {
    const html = renderToString(
      <BadgeCelebrationModal
        unlock={{ ...mockUnlock, tier: 'gold', isLevelUp: true }}
        onClose={vi.fn()}
        onViewBadges={vi.fn()}
      />
    );

    expect(html).toContain('Badge Leveled Up!');
    expect(html).toContain('Gold Medal (🥇)');
  });
});
