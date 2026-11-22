import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DailyQuestsModal } from './DailyQuestsModal';
import type { DailyQuestState } from '../utils/dailyQuests';

const NOW_MS = new Date(2026, 10, 22, 12, 0, 0).getTime();

const baseState: DailyQuestState = {
  day: '2026-11-22',
  quests: [
    { id: '2026-11-22:brush', kind: 'brush', label: 'Brush Oli’s ginger coat', emoji: '🪮', target: 1, progress: 1 },
    { id: '2026-11-22:play_any', kind: 'play_any', label: 'Play any minigame with Oli', emoji: '🎮', target: 1, progress: 0 },
    { id: '2026-11-22:pet', kind: 'pet', label: 'Give Oli 3 chin scratches', emoji: '🐾', target: 3, progress: 2 },
  ],
  rewardClaimed: false,
  streak: 2,
  bestStreak: 5,
  lastCaredDay: '2026-11-22',
  pausedProtectionDay: null,
};

describe('DailyQuestsModal', () => {
  it('renders streak info, 3 daily quests, and progress footer while in progress', () => {
    const html = renderToString(
      <DailyQuestsModal
        questState={baseState}
        nowMs={NOW_MS}
        onClaimReward={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(html).toContain('Daily Quests');
    expect(html).toContain('2-Day Care Streak');
    expect(html).toContain('Best 5d');
    expect(html).toContain('Brush Oli’s ginger coat');
    expect(html).toContain('2/3');
    expect(html).toContain('1/3');
    expect(html).toContain('Finish all 3 quests');
  });

  it('shows the Claim Streak Bonus button when all 3 quests are done on a milestone day', () => {
    const completedState: DailyQuestState = {
      ...baseState,
      streak: 3,
      quests: baseState.quests.map((q) => ({ ...q, progress: q.target })),
    };

    const html = renderToString(
      <DailyQuestsModal
        questState={completedState}
        nowMs={NOW_MS}
        onClaimReward={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(html).toContain('3-Day Care Streak');
    expect(html).toContain('Claim +2 🍬 Streak Bonus!');
  });

  it('shows claimed confirmation and Vacation Mode streak shield when applicable', () => {
    const claimedState: DailyQuestState = {
      ...baseState,
      rewardClaimed: true,
      quests: baseState.quests.map((q) => ({ ...q, progress: q.target })),
    };

    const html = renderToString(
      <DailyQuestsModal
        questState={claimedState}
        nowMs={NOW_MS}
        isPaused={true}
        onClaimReward={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(html).toContain('Today’s bonus claimed!');
    expect(html).toContain('Vacation Mode keeps your streak safe');
  });
});
