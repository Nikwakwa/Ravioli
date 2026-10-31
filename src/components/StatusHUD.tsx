import { motion } from 'framer-motion';
import { Bell, BellOff, BookOpen, CloudOff, Loader2, Radio, Users, Wifi } from 'lucide-react';
import { STAT_META } from '../data/actions';
import { APP_VERSION } from '../data/changelog';
import { STAT_KEYS, type LiveCat, type Mood, type SyncMode, type SyncStatus } from '../types';
import { NEED_THRESHOLD } from '../utils/decayEngine';
import { playerColor } from '../utils/player';
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
};

export interface StatusHUDProps {
  live: LiveCat;
  mood: Mood;
  player: string;
  onOpenPlayer: () => void;
  onOpenChangelog: () => void;
  onOpenGuide: () => void;
  notificationsOn?: boolean;
  onToggleNotifications?: () => void;
  hasUpdate?: boolean;
  mode: SyncMode;
  status: SyncStatus;
}

export function StatusHUD({
  live,
  mood,
  player,
  onOpenPlayer,
  onOpenChangelog,
  onOpenGuide,
  notificationsOn,
  onToggleNotifications,
  hasUpdate,
  mode,
  status,
}: StatusHUDProps) {
  const badge = MOOD_BADGE[mood];
  const pColor = playerColor(player);
  const night = live.isSleeping;

  const surface = night
    ? 'bg-slate-900/80 text-amber-50 border-white/10'
    : 'bg-white/88 text-amber-950 border-amber-900/10';

  return (
    <header className="relative z-20 flex flex-col gap-2 px-3 pt-2.5">
      {/* Row 1: Cat identity + Rules & Player pills */}
      <div className="flex items-center justify-between gap-2">
        <div
          className={`flex min-w-0 items-center gap-2.5 rounded-2xl border px-3 py-1.5 shadow-sm backdrop-blur-md transition-colors duration-500 ${surface}`}
        >
          <span className="text-xl leading-none select-none">{badge.emoji}</span>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-bold">{live.name}</span>
              <SyncDot mode={mode} status={status} />
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
            </div>
            <p className={`truncate text-[10px] font-bold ${night ? 'text-indigo-200/80' : 'text-amber-800/80'}`}>
              {badge.label}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
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

          {/* Player selector pill */}
          <button
            type="button"
            onClick={onOpenPlayer}
            style={{ backgroundColor: pColor.bg, color: pColor.fg }}
            className="flex items-center gap-1.5 rounded-full border border-black/5 px-3 py-1.5 text-xs font-extrabold shadow-sm transition-transform active:scale-95"
            title="Switch player"
          >
            <Users className="h-3.5 w-3.5" />
            <span>{player}</span>
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

function SyncDot({ mode, status }: { mode: SyncMode; status: SyncStatus }) {
  if (status === 'live') {
    return (
      <span
        className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400"
        title="Synced live via Supabase Realtime"
      >
        <Wifi className="h-2.5 w-2.5" />
        Live
      </span>
    );
  }
  if (status === 'connecting') {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-600">
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
        Sync
      </span>
    );
  }
  if (mode === 'local' || status === 'local') {
    return (
      <span
        className="inline-flex items-center gap-0.5 rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-600"
        title="Local mode (localStorage + BroadcastChannel across tabs)"
      >
        <Radio className="h-2.5 w-2.5" />
        Local
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-rose-500">
      <CloudOff className="h-2.5 w-2.5" />
      Offline
    </span>
  );
}
