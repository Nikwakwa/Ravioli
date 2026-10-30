import { motion } from 'framer-motion';
import { CloudOff, Home, Loader2, Moon, Radio, Sun, Users, Wifi } from 'lucide-react';
import { STAT_META } from '../data/actions';
import { STAT_KEYS, type LiveCat, type Mood, type SceneId, type SyncMode, type SyncStatus } from '../types';
import { NEED_THRESHOLD, nextNeed } from '../utils/decayEngine';
import { formatHours } from '../utils/feedback';
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
  scene: SceneId;
  onSceneChange: (scene: SceneId) => void;
  player: string;
  onOpenPlayer: () => void;
  mode: SyncMode;
  status: SyncStatus;
}

export function StatusHUD({ live, mood, scene, onSceneChange, player, onOpenPlayer, mode, status }: StatusHUDProps) {
  const badge = MOOD_BADGE[mood];
  const pColor = playerColor(player);
  const upcoming = nextNeed(live);

  return (
    <header className="relative z-20 flex flex-col gap-2 px-3 pt-2">
      {/* Row 1: Cat identity + scene toggle + player pill */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 rounded-2xl bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur-md border border-amber-900/10">
          <span className="text-xl leading-none">{badge.emoji}</span>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold text-amber-950">{live.name}</span>
              <SyncDot mode={mode} status={status} />
            </div>
            <p className="text-[11px] font-semibold text-amber-800/80">{badge.label}</p>
          </div>
        </div>

        {/* Scene pill: Living Room / Sunny Balcony */}
        <div className="flex rounded-full bg-white/85 p-1 shadow-sm backdrop-blur-md border border-amber-900/10">
          <button
            type="button"
            onClick={() => onSceneChange('room')}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
              scene === 'room' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-900/75'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Room</span>
          </button>
          <button
            type="button"
            onClick={() => onSceneChange('balcony')}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
              scene === 'balcony' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-900/75'
            }`}
          >
            {live.isSleeping ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            <span>Balcony</span>
          </button>
        </div>

        {/* Player selector pill */}
        <button
          type="button"
          onClick={onOpenPlayer}
          style={{ backgroundColor: pColor.bg, color: pColor.fg }}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold shadow-sm border border-black/5 active:scale-95 transition-transform"
          title="Switch player"
        >
          <Users className="h-3.5 w-3.5" />
          <span>{player}</span>
        </button>
      </div>

      {/* Row 2: 5 stat meters */}
      <div className="grid grid-cols-5 gap-1.5 rounded-2xl bg-white/85 p-2 shadow-sm backdrop-blur-md border border-amber-900/10">
        {STAT_KEYS.map((key) => {
          const meta = STAT_META[key];
          const Icon = STAT_ICONS[key];
          const val = Math.round(live[key]);
          const low = val < NEED_THRESHOLD;
          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between px-0.5">
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-950">
                  <Icon className={`h-3 w-3 ${low ? 'animate-bounce' : ''}`} style={{ color: low ? '#e11d48' : meta.color }} />
                  <span className="truncate">{meta.label}</span>
                </span>
                <span className={`text-[10px] font-extrabold tabular-nums ${low ? 'text-rose-600' : 'text-amber-900/70'}`}>
                  {val}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-amber-950/10">
                <motion.div
                  className="h-full rounded-full"
                  initial={false}
                  animate={{ width: `${ Math.max(4, val) }%` }}
                  transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                  style={{ backgroundColor: low ? '#e11d48' : meta.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle forecast hint when everything is fine */}
      {upcoming && upcoming.hours < 6 && (
        <div className="self-center rounded-full bg-amber-950/55 px-2.5 py-0.5 text-[10px] font-semibold text-amber-50 backdrop-blur-xs">
          Next: {STAT_META[upcoming.stat].label.toLowerCase()} in ~{formatHours(upcoming.hours)}
        </div>
      )}
    </header>
  );
}

function SyncDot({ mode, status }: { mode: SyncMode; status: SyncStatus }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800" title="Synced live via Supabase Realtime">
        <Wifi className="h-2.5 w-2.5" />
        Live
      </span>
    );
  }
  if (status === 'connecting') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
        Sync
      </span>
    );
  }
  if (mode === 'local' || status === 'local') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800"
        title="Local mode (localStorage + BroadcastChannel across tabs)"
      >
        <Radio className="h-2.5 w-2.5" />
        Local
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
      <CloudOff className="h-2.5 w-2.5" />
      Offline
    </span>
  );
}
