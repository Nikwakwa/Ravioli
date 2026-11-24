import { motion } from 'framer-motion';
import { Check, Flame, Gift, Sparkles, X } from 'lucide-react';
import { localDayKey } from '../data/actions';
import {
  areAllQuestsDone,
  countCompletedQuests,
  getDailyRewardChurus,
  getNextStreakMilestone,
  getVisibleStreak,
  isQuestDone,
  isStreakMilestone,
  type DailyQuestState,
} from '../utils/dailyQuests';
import { getTodayDateString } from '../utils/fortune';

function formatDateDisplay(d = new Date()): string {
  try {
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  } catch {
    return getTodayDateString(d);
  }
}

export interface DailyQuestsModalProps {
  questState: DailyQuestState;
  nowMs?: number;
  isPaused?: boolean;
  onClaimReward: () => void;
  onClose: () => void;
}

export function DailyQuestsModal({
  questState,
  nowMs = Date.now(),
  isPaused = false,
  onClaimReward,
  onClose,
}: DailyQuestsModalProps) {
  const completedCount = countCompletedQuests(questState);
  const totalCount = questState.quests.length;
  const allDone = areAllQuestsDone(questState);
  const visibleStreak = getVisibleStreak(questState, nowMs);
  const caredToday = questState.lastCaredDay === localDayKey(nowMs);
  // Preview the exact streak day today's reward will pay on (avoids Day 3→4 +2→+1 bait-and-switch).
  const todayStreak = caredToday ? Math.max(1, visibleStreak) : visibleStreak + 1;
  const rewardChurus = getDailyRewardChurus(todayStreak);
  const milestoneToday = isStreakMilestone(todayStreak);
  const nextMilestone = getNextStreakMilestone(caredToday ? visibleStreak : todayStreak);
  const daysUntilMilestone = Math.max(1, nextMilestone - (caredToday ? visibleStreak : todayStreak));

  return (
    <motion.div
      key="quests-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Daily Quests and Care Streak"
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[376px] touch-pan-y overflow-y-auto rounded-3xl border border-amber-300/40 bg-[#fffdf9] p-5 text-amber-950 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b border-amber-900/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-lg shadow-xs">
              📋
            </span>
            <div>
              <h2 className="font-display text-sm font-extrabold text-amber-950">Daily Quests</h2>
              <p className="text-[11px] font-semibold text-amber-800/70">
                {formatDateDisplay(new Date(nowMs))}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close daily quests"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-950/8 text-amber-900 hover:bg-amber-950/15 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Care Streak Banner */}
        <div className="mb-3.5 rounded-2xl border border-orange-300/60 bg-gradient-to-br from-amber-100/85 via-orange-50 to-amber-50 p-3 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-sm">
                <Flame className="h-5 w-5 fill-current" />
              </span>
              <div className="leading-tight">
                <p className="font-display text-sm font-black text-amber-950">
                  {visibleStreak > 0
                    ? `${visibleStreak}-Day Care Streak`
                    : 'Start a Care Streak'}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-amber-900/75">
                  {milestoneToday
                    ? caredToday
                      ? '🎉 Milestone day! Today’s bonus pays +2 🍬'
                      : `🎉 Day ${todayStreak} milestone! Today’s bonus pays +2 🍬`
                    : `Care for Oli daily · Day ${nextMilestone} bonus (+2 🍬) in ${daysUntilMilestone}d`}
                </p>
              </div>
            </div>
            {questState.bestStreak > 0 && (
              <span className="shrink-0 rounded-full bg-amber-950/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-950">
                {`Best ${questState.bestStreak}d`}
              </span>
            )}
          </div>
          {(isPaused || questState.pausedProtectionDay) && (
            <p className="mt-2 rounded-xl bg-sky-500/12 px-2.5 py-1 text-[10px] font-bold text-sky-900">
              ✈️ Vacation Mode keeps your streak safe while you’re away.
            </p>
          )}
        </div>

        {/* 3 Daily Quests List */}
        <ul className="flex flex-col gap-2">
          {questState.quests.map((quest) => {
            const done = isQuestDone(quest);
            const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));
            return (
              <li
                key={quest.id}
                data-quest-done={done ? 'true' : 'false'}
                className={`rounded-2xl border p-3 transition-colors ${
                  done
                    ? 'border-emerald-300/80 bg-emerald-50/75'
                    : 'border-amber-900/10 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${
                      done ? 'bg-emerald-500/15' : 'bg-amber-100/80'
                    }`}
                  >
                    {quest.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-extrabold leading-snug ${
                          done ? 'text-emerald-950' : 'text-amber-950'
                        }`}
                      >
                        {quest.label}
                      </p>
                      {done ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="shrink-0 font-mono text-[11px] font-extrabold tabular-nums text-amber-900/70">
                          {`${quest.progress}/${quest.target}`}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-amber-950/10">
                      <motion.div
                        className={`h-full rounded-full ${
                          done ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'
                        }`}
                        initial={false}
                        animate={{ width: `${Math.max(pct, done ? 100 : 4)}%` }}
                        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Daily Bonus Footer */}
        <div className="mt-4">
          {questState.rewardClaimed ? (
            <div className="flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-300/70 bg-emerald-50 px-3 py-3 text-center text-xs font-extrabold text-emerald-900">
              <Check className="h-4 w-4 stroke-[3] text-emerald-600" />
              <span>Today’s bonus claimed! Fresh quests tomorrow.</span>
            </div>
          ) : allDone ? (
            <button
              type="button"
              onClick={onClaimReward}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 py-3 font-display text-sm font-black text-white shadow-md transition-transform active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {rewardChurus > 1
                  ? `Claim +${rewardChurus} 🍬 Streak Bonus!`
                  : 'Claim +1 🍬 Daily Bonus!'}
              </span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-amber-900/10 bg-amber-50/80 px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 shrink-0 text-pink-500" />
                <p className="text-[11px] font-bold text-amber-900">
                  {`Finish all ${totalCount} quests to claim +${rewardChurus} 🍬`}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-950/10 px-2 py-0.5 font-mono text-[10px] font-black text-amber-950">
                {`${completedCount}/${totalCount}`}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
