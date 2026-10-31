import { motion } from 'framer-motion';
import { Bell, BellOff, BookOpen, Pause, Play } from 'lucide-react';
import { STAT_META } from '../data/actions';
import { APP_VERSION } from '../data/changelog';
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
  deceased: { label: 'Passed away — tap to revive', emoji: '👼' },
};

export interface StatusHUDProps {
  live: LiveCat;
  mood: Mood;
  tummyAche?: boolean;
  messCount?: number;
  churuStash?: number;
  onOpenChangelog: () => void;
  onOpenGuide: () => void;
  onTogglePause: () => void;
  notificationsOn?: boolean;
  onToggleNotifications?: () => void;
  hasUpdate?: boolean;
}

export function StatusHUD({
  live,
  mood,
  tummyAche,
  messCount = 0,
  churuStash = 3,
  onOpenChangelog,
  onOpenGuide,
  onTogglePause,
  notificationsOn,
  onToggleNotifications,
  hasUpdate,
}: StatusHUDProps) {
  const badge = live.isDeceased
    ? { label: 'Oli has passed away — tap to revive', emoji: '👼' }
    : live.isPaused
      ? { label: 'Care clock paused (Vacation Mode)', emoji: '✈️' }
      : tummyAche
        ? { label: 'Tummy ache — pet or brush!', emoji: '🤢' }
        : messCount > 0 && !live.isSleeping
          ? {
              label:
                messCount === 1
                  ? 'Mess on the rug — tap to scoop!'
                  : `${messCount} messes on the rug — scoop up!`,
              emoji: '💩',
            }
          : MOOD_BADGE[mood];
  const night = live.isSleeping;

  const surface = night
    ? 'bg-slate-900/80 text-amber-50 border-white/10'
    : 'bg-white/88 text-amber-950 border-amber-900/10';

  return (
    <header className="relative z-20 flex flex-col gap-2 px-3 pt-2.5">
      {/* Row 1: Cat identity + Notifications & Rules pills */}
      <div className="flex items-center justify-between gap-2">
        <div
          className={`flex min-w-0 items-center gap-2.5 rounded-2xl border px-3 py-1.5 shadow-sm backdrop-blur-md transition-colors duration-500 ${surface}`}
        >
          <span className="text-xl leading-none select-none">{badge.emoji}</span>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-bold">{live.name}</span>
              <button
                type="button"
                onClick={onOpenChangelog}
                title="What’s New"
                className={`relative rounded-full px-1.5 py-0.5 font-mono text-[9px] font-extrabold transition-transform active:scale-95 ${
                  night
                    ? 'bg-white/10 text-indigo-200 hover:bg-white/20'
                    : 'bg-amber-950/8 text-amber-800 hover:bg-amber-950/15'
                }`}
              >
                {APP_VERSION}
                {hasUpdate && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </button>
              {live.isPaused && (
                <span className="rounded-full bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-700 dark:text-sky-300">
                  ✈️ Paused
                </span>
              )}
              {live.livesLeft < 9 && (
                <span
                  title="Lives Remaining"
                  className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-700 dark:text-amber-300"
                >
                  🐾 {live.livesLeft}/9
                </span>
              )}
              {live.isCalm && !tummyAche && (
                <span className="rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-purple-700 dark:text-purple-300">
                  ✨ Zen
                </span>
              )}
              {tummyAche && (
                <span className="rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-rose-600 dark:text-rose-300">
                  Stuffed
                </span>
              )}
              {messCount > 0 && (
                <span className="rounded-full bg-amber-600/15 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800 dark:text-amber-300">
                  💩 {messCount} {messCount === 1 ? 'Mess' : 'Messes'}
                </span>
              )}
            </div>
            <p className={`truncate text-[10px] font-bold ${night ? 'text-indigo-200/80' : 'text-amber-800/80'}`}>
              {badge.label}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* Pause / Resume Care Clock button */}
          <button
            type="button"
            onClick={onTogglePause}
            title={live.isPaused ? 'Resume Care Clock' : 'Pause Care Clock (Vacation Mode)'}
            aria-label={live.isPaused ? 'Resume Care Clock' : 'Pause Care Clock (Vacation Mode)'}
            className={`flex items-center gap-1 rounded-full border px-2 py-1.5 text-xs font-extrabold shadow-sm backdrop-blur-md transition-transform active:scale-95 ${
              live.isPaused
                ? 'border-sky-400 bg-sky-500 text-white shadow-md animate-pulse'
                : surface
            }`}
          >
            {live.isPaused ? (
              <>
                <Play className="h-3 w-3 fill-current text-white" />
                <span className="text-[10px]">Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-amber-700 dark:text-amber-200" />
                <span className="text-[10px]">Pause</span>
              </>
            )}
          </button>

          {/* Churu Treat Stash counter pill */}
          <div
            title="Churu Treat Stash — earn more by fulfilling Oli’s cravings or scooping messes!"
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-extrabold shadow-sm backdrop-blur-md ${surface}`}
          >
            <span className="text-xs leading-none">🍬</span>
            <span className="tabular-nums">{churuStash}</span>
          </div>

          {/* Notifications bell toggle */}
          {onToggleNotifications && (
            <button
              type="button"
              onClick={onToggleNotifications}
              title="Notification preferences"
              aria-label="Notification preferences"
              className={`relative flex h-7 w-7 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-transform active:scale-95 ${
                notificationsOn
                  ? night
                    ? 'border-amber-300/40 bg-amber-300/20 text-amber-200'
                    : 'border-amber-500/30 bg-amber-50 text-amber-700'
                  : surface
              }`}
            >
              {notificationsOn ? (
                <Bell className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
              ) : (
                <BellOff className="h-3.5 w-3.5 opacity-60" />
              )}
              {notificationsOn && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>
          )}

          {/* Manual / Rules pill */}
          <button
            type="button"
            onClick={onOpenGuide}
            title="Care Manual & Rules"
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-extrabold shadow-sm backdrop-blur-md transition-transform active:scale-95 ${surface}`}
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-600" />
            <span>Rules</span>
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
          return (
            <div
              key={key}
              className={`flex flex-col gap-1 rounded-xl px-1.5 py-1 transition-colors ${
                low ? (night ? 'bg-rose-500/20' : 'bg-rose-500/10') : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${low ? 'animate-bounce' : ''}`}
                  style={{ color: low ? '#f43f5e' : meta.color }}
                />
                <span
                  className={`text-[11px] font-extrabold tabular-nums leading-none ${
                    low ? 'text-rose-500' : night ? 'text-amber-50' : 'text-amber-950'
                  }`}
                >
                  {val}
                </span>
              </div>
              <div className={`h-1.5 w-full overflow-hidden rounded-full ${night ? 'bg-white/15' : 'bg-amber-950/10'}`}>
                <motion.div
                  className="h-full rounded-full"
                  initial={false}
                  animate={{ width: `${Math.max(5, val)}%` }}
                  transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                  style={{ backgroundColor: low ? '#f43f5e' : meta.color }}
                />
              </div>
              <span
                className={`text-center text-[10px] font-bold leading-none ${
                  low ? 'text-rose-500' : night ? 'text-indigo-200/80' : 'text-amber-900/75'
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
