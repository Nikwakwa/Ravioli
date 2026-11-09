import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { CHURU_POINTS_PER_TUBE, STAT_META } from '../data/actions';
import { STAT_KEYS, type LiveCat, type Mood } from '../types';
import { NEED_THRESHOLD } from '../utils/decayEngine';
import { STAT_ICONS } from './statIcons';

const MOOD_BADGE: Record<Mood, { label: string; emoji: string }> = {
  sleeping: { label: 'Fast asleep', emoji: '😴' },
  relaxed: { label: 'Zen & relaxed', emoji: '😌' },
  ecstatic: { label: 'Purring like crazy!', emoji: '😻' },
  happy: { label: 'Happy boy', emoji: '😺' },
  content: { label: 'Cozy & content', emoji: '🐱' },
  hungry: { label: 'Tummy rumbling', emoji: '😿' },
  thirsty: { label: 'Wants fresh water', emoji: '💧' },
  tired: { label: 'Sleepy eyes', emoji: '🥱' },
  sad: { label: 'Needs cuddles', emoji: '🥺' },
  grubby: { label: 'Needs a brush', emoji: '🪮' },
  deceased: { label: 'Needs emergency care', emoji: '👼' },
};

export interface StatusHUDProps {
  live: LiveCat;
  mood: Mood;
  tummyAche?: boolean;
  messCount?: number;
  litterBoxDirty?: boolean;
  churuStash?: number;
  /** Churu points collected toward the next tube (0–2). */
  churuPoints?: number;
  onOpenMenu: () => void;
  onOpenPause?: () => void;
  hasUpdate?: boolean;
  isNight?: boolean;
}

export function StatusHUD({
  live,
  mood,
  tummyAche,
  messCount = 0,
  litterBoxDirty = false,
  churuStash = 3,
  churuPoints = 0,
  onOpenMenu,
  onOpenPause,
  hasUpdate,
  isNight = false,
}: StatusHUDProps) {
  const badge = live.isDeceased
    ? { label: 'Needs emergency care', emoji: '👼' }
    : live.isPaused
      ? { label: 'Vacation Mode is on', emoji: '✈️' }
      : tummyAche
        ? { label: 'Tummy ache — pet him', emoji: '🤢' }
        : litterBoxDirty && messCount > 0 && !live.isSleeping
          ? { label: 'Time to tidy up!', emoji: '🧹' }
          : litterBoxDirty && !live.isSleeping
            ? { label: 'Scoop the litter box', emoji: '🧹' }
            : messCount > 0 && !live.isSleeping
              ? {
                  label:
                    messCount === 1
                      ? 'Tap the mess to tidy'
                      : `Tap ${messCount} messes to tidy`,
                  emoji: '🧹',
                }
              : MOOD_BADGE[mood];
  const night = live.isSleeping || isNight;

  const surface = night
    ? 'bg-slate-900/80 text-amber-50 border-white/10'
    : 'bg-white/88 text-amber-950 border-amber-900/10';

  return (
    <header className="relative z-20 flex flex-col gap-2 px-3 pt-2.5">
      {/* Row 1: Cat identity + Churu Stash & Menu button */}
      <div className="flex items-center justify-between gap-2">
        <div
          className={`flex min-w-0 items-center gap-2.5 rounded-2xl border px-3 py-1.5 shadow-sm backdrop-blur-md transition-colors duration-500 ${surface}`}
        >
          <span className="text-xl leading-none select-none">{badge.emoji}</span>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-display text-sm font-bold">{live.name}</span>
              {live.isPaused && (
                <button
                  type="button"
                  onClick={onOpenPause ?? onOpenMenu}
                  title="Clock paused"
                  className={`rounded-full bg-sky-500/20 border border-sky-400/40 px-2 py-0.5 text-[10px] font-black transition-transform active:scale-95 animate-pulse ${night ? 'text-sky-200' : 'text-sky-800'}`}
                >
                  ✈️ Paused
                </button>
              )}
              {live.livesLeft < 9 && (
                <span
                  title="Lives Remaining"
                  className={`rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-extrabold ${night ? 'text-amber-300' : 'text-amber-700'}`}
                >
                  🐾 {live.livesLeft}/9
                </span>
              )}
              {live.isCalm && !tummyAche && (
                <span className={`rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-extrabold ${night ? 'text-purple-300' : 'text-purple-700'}`}>
                  ✨ Zen
                </span>
              )}
              {tummyAche && (
                <span className={`rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-extrabold ${night ? 'text-rose-300' : 'text-rose-600'}`}>
                  Stuffed
                </span>
              )}
            </div>
            <p className={`truncate text-[10px] font-bold ${night ? 'text-indigo-200/80' : 'text-amber-800/80'}`}>
              {badge.label}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* Churu Treat Stash counter pill */}
          <div
            title={`Churu stash: ${churuStash}. ${churuPoints}/${CHURU_POINTS_PER_TUBE} points toward the next one.`}
            aria-label={`${churuStash} Churu tubes, ${churuPoints} of ${CHURU_POINTS_PER_TUBE} points toward the next one`}
            className={`flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-extrabold shadow-sm backdrop-blur-md ${surface}`}
          >
            <span className="text-sm leading-none">🍬</span>
            <span className="tabular-nums font-mono text-xs">{churuStash}</span>
            {/* Progress toward the next tube */}
            <span aria-hidden="true" className="flex items-center gap-0.5">
              {Array.from({ length: CHURU_POINTS_PER_TUBE }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i < churuPoints ? 'bg-pink-500' : night ? 'bg-white/20' : 'bg-amber-950/15'
                  }`}
                />
              ))}
            </span>
          </div>

          {/* Menu / Guide button */}
          <button
            type="button"
            onClick={onOpenMenu}
            title="Menu"
            aria-label="Open Menu"
            className={`relative flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-extrabold shadow-sm backdrop-blur-md transition-all hover:bg-amber-100/40 active:scale-95 ${surface}`}
          >
            <BookOpen className={`h-3.5 w-3.5 ${night ? 'text-amber-300' : 'text-amber-600'}`} />
            <span>Menu</span>
            {hasUpdate && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Row 2: 5 stat meters — vertical stack per tile so labels never clip on mobile */}
      <div
        className={`grid grid-cols-5 gap-1.5 rounded-2xl border p-2 shadow-sm backdrop-blur-md transition-colors duration-500 ${surface}`}
      >
        {STAT_KEYS.map((key) => {
          const meta = STAT_META[key];
          const Icon = STAT_ICONS[key];
          const val = Math.round(live[key]);
          const low = val < NEED_THRESHOLD;
          const pct = Math.max(0, Math.min(100, val));

          // Color ramp based on current value
          const barColor =
            val > 60
              ? 'bg-emerald-500'
              : val > NEED_THRESHOLD
                ? 'bg-amber-400'
                : 'bg-rose-500';

          const pulse = low && !night;

          return (
            <div
              key={key}
              title={`${meta.label}: ${val}/100`}
              className={`flex flex-col items-center gap-1 rounded-xl p-1 transition-transform ${
                pulse ? 'animate-pulse' : ''
              }`}
            >
              {/* Icon + small numerical value */}
              <div className="flex items-center gap-0.5 leading-none">
                <Icon
                  className={`h-3 w-3 ${
                    low
                      ? night ? 'text-rose-300' : 'text-rose-600'
                      : night
                        ? 'text-indigo-200'
                        : 'text-amber-900/80'
                  }`}
                />
                <span
                  className={`font-mono text-[10px] font-extrabold tabular-nums ${
                    low
                      ? night ? 'text-rose-300' : 'text-rose-600'
                      : night
                        ? 'text-indigo-100'
                        : 'text-amber-950'
                  }`}
                >
                  {val}
                </span>
              </div>

              {/* Progress bar */}
              <div
                className={`h-1.5 w-full overflow-hidden rounded-full ${
                  night ? 'bg-white/10' : 'bg-amber-950/10'
                }`}
              >
                <motion.div
                  className={`h-full rounded-full ${barColor}`}
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                />
              </div>

              {/* Compact label */}
              <span
                className={`text-[10px] font-extrabold tracking-tight ${
                  night ? 'text-indigo-200/70' : 'text-amber-900/70'
                }`}
              >
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </header>
  );
}
