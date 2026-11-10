import { AnimatePresence, motion } from 'framer-motion';
import {
  BedDouble,
  Brush,
  Droplets,
  Drumstick,
  Egg,
  Feather,
  Heart,
  IceCreamCone,
  Moon,
  RefreshCw,
  Sparkles,
  SprayCan,
  Sun,
  Trash2,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import {
  actionById,
  CARE_ACTIONS,
  CATEGORIES,
  MAX_SLEEP_ENERGY,
  MIN_WAKE_ENERGY,
  STAT_META,
  type ActionCategory,
  type CareAction,
} from '../data/actions';
import { STAT_KEYS, type CatStats, type LiveCat } from '../types';
import { STAT_ICONS } from './statIcons';

function RedBallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M6.5 6.5c3.5 2.5 7.5 2.5 11 0" />
      <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<ActionCategory, LucideIcon> = {
  feed: Utensils,
  play: Feather,
  care: Sparkles,
  rest: BedDouble,
};

const ACTION_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  churu: IceCreamCone,
  wet_food: Drumstick,
  chicken_heart: Heart,
  quail_egg: Egg,
  fountain: Droplets,
  feather_wand: Feather,
  laser_pointer: Zap,
  tail_chase: RefreshCw,
  red_ball: RedBallIcon,
  pheromone_mist: SprayCan,
  brush: Brush,
  scoop_mess: Trash2,
};

export interface ActionDockProps {
  live: LiveCat;
  tummyAche: boolean;
  messCount: number;
  litterBoxDirty?: boolean;
  churuStash: number;
  whimActionId: string | null;
  busy: boolean;
  onAction: (action: CareAction) => void;
  onToggleSleep: () => void;
  /** Dark look for real night-time (follows the clock, not whether Oli is napping). */
  night?: boolean;
}

function refusalHint(
  action: CareAction,
  live: LiveCat,
  tummyAche: boolean,
  cleanNeededCount: number,
  churuStash: number,
): string | null {
  if (live.isDeceased) return '💔 Deceased';
  if (live.isPaused) return '✈️ Paused';
  if (action.id === 'scoop_mess') {
    return cleanNeededCount === 0 ? '✨ Spotless' : null;
  }
  if (action.id === 'churu' && churuStash <= 0) {
    return '🍬 0 Left';
  }
  if (live.isSleeping && action.requiresAwake) return '😴 Sleeping';
  if (tummyAche && action.category === 'feed') return '🤢 Tummy Ache';
  if (action.maxHunger !== undefined && live.hunger >= action.maxHunger) return '😋 Full';
  if (action.maxHydration !== undefined && live.hydration >= action.maxHydration) return '💧 Full';
  if (action.minEnergy !== undefined && live.energy < action.minEnergy) return '🥱 Tired';
  return null;
}

export function ActionDock({
  live,
  tummyAche,
  messCount,
  litterBoxDirty = false,
  churuStash,
  whimActionId,
  busy,
  onAction,
  onToggleSleep,
  night = false,
}: ActionDockProps) {
  const [category, setCategory] = useState<ActionCategory>('feed');
  const actions = CARE_ACTIONS.filter((a) => a.category === category);
  const isSleeping = live.isSleeping;
  const whimCategory = whimActionId ? actionById(whimActionId)?.category ?? null : null;
  const cleanNeededCount = (litterBoxDirty ? 1 : 0) + messCount;

  const shellClass = night
    ? 'bg-slate-900/85 border-white/10 text-amber-50'
    : 'bg-white/92 border-amber-900/10 text-amber-950';

  // Readable "why not" chip in both day and night themes
  const hintChip = night ? 'bg-indigo-400/25 text-indigo-100' : 'bg-amber-950/10 text-amber-900';

  const napRefusal = !isSleeping && live.energy >= MAX_SLEEP_ENERGY
    ? '⚡ Not Tired'
    : isSleeping && live.energy < MIN_WAKE_ENERGY
      ? '😴 Exhausted'
      : null;

  // Every tab uses the same 2×2 slot so switching tabs never jumps the layout.
  // Tabs with fewer cards let them stretch across the full row.
  const spanFull = (index: number, count: number) =>
    count === 2 || (count === 3 && index === 2) ? 'col-span-2' : '';
  const cardCount = actions.length + (category === 'rest' ? 1 : 0);

  return (
    <section
      className={`relative z-20 mx-3 mb-2.5 rounded-3xl border p-2.5 shadow-lg backdrop-blur-md transition-colors duration-500 ${shellClass}`}
    >
      {/* Category tabs */}
      <div className={`mb-2 grid grid-cols-4 gap-1 rounded-2xl p-1 ${night ? 'bg-white/5' : 'bg-amber-950/6'}`}>
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.id];
          const active = category === c.id;
          const showMessBadge = c.id === 'care' && cleanNeededCount > 0;
          const showWhimDot = whimCategory === c.id && !showMessBadge;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={active}
              className={`relative flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-extrabold transition-colors ${
                active
                  ? 'text-amber-950'
                  : night
                    ? 'text-indigo-200/70 hover:text-white'
                    : 'text-amber-900/60 hover:text-amber-900'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="dock-tab"
                  className={`absolute inset-0 rounded-xl shadow-xs ${night ? 'bg-amber-300' : 'bg-white'}`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">{c.label}</span>
              {showMessBadge && (
                <span className="relative z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold leading-none text-white">
                  {cleanNeededCount}
                </span>
              )}
              {showWhimDot && (
                <span className="relative z-10 text-[10px] leading-none">💭</span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.14 }}
          className="grid h-[92px] grid-cols-2 grid-rows-2 gap-1.5"
        >
          {actions.map((action, index) => {
            const Icon = ACTION_ICONS[action.id] ?? Sparkles;
            const hint = refusalHint(action, live, tummyAche, cleanNeededCount, churuStash);
            const muted = Boolean(hint);
            const isUrgentScoop = action.id === 'scoop_mess' && cleanNeededCount > 0;
            const isWhimMatch = whimActionId === action.id && !muted;

            const badge = isUrgentScoop ? (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-white">
                🧹 {cleanNeededCount} to tidy
              </span>
            ) : isWhimMatch ? (
              <span className="shrink-0 rounded-full bg-amber-400/25 px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-amber-900">
                💭 2×
              </span>
            ) : action.soothesTummy && tummyAche ? (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-emerald-700">
                Soothes 🧡
              </span>
            ) : action.id === 'churu' && churuStash > 0 ? (
              <span className="shrink-0 rounded-full bg-pink-500/15 px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-pink-700">
                ×{churuStash}
              </span>
            ) : action.category === 'play' && !muted ? (
              <span className="shrink-0 rounded-full bg-amber-500/18 px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-amber-800">
                🎮
              </span>
            ) : null;

            return (
              <motion.button
                key={action.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                disabled={busy}
                onClick={() => onAction(action)}
                className={`flex h-full min-w-0 items-center gap-2 rounded-2xl border px-2.5 py-1.5 text-left transition-all ${spanFull(index, cardCount)} ${
                  isUrgentScoop
                    ? 'border-rose-400/60 bg-gradient-to-b from-rose-50 to-amber-50 text-amber-950 shadow-xs'
                    : isWhimMatch
                      ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-pink-50/80 text-amber-950 ring-1 ring-amber-400/50'
                      : muted
                        ? night
                          ? 'border-white/5 bg-white/5 opacity-60'
                          : 'border-amber-900/10 bg-amber-950/5 opacity-65'
                        : night
                          ? 'border-white/10 bg-slate-800/90 text-amber-50 shadow-xs'
                          : 'border-amber-900/10 bg-gradient-to-b from-amber-50/95 to-orange-50/70 text-amber-950 shadow-xs'
                }`}
              >
                <span
                  className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-xl min-[360px]:flex ${
                    isUrgentScoop
                      ? 'bg-rose-500/15 text-rose-700'
                      : night
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-amber-500/15 text-amber-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate font-display text-xs font-bold leading-tight">{action.short}</p>
                    {badge}
                  </div>
                  {hint ? (
                    <span className={`w-fit rounded-full px-1.5 py-0.5 text-[10px] font-extrabold whitespace-nowrap leading-none ${hintChip}`}>
                      {hint}
                    </span>
                  ) : (
                    <EffectPills effect={action.effect} maxPills={2} />
                  )}
                </div>
              </motion.button>
            );
          })}

          {/* Sleep / Nap mode toggle lives in Rest */}
          {category === 'rest' && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={busy}
              onClick={onToggleSleep}
              className={`col-span-2 flex h-full min-w-0 items-center gap-2 rounded-2xl border px-2.5 py-1.5 text-left transition-all ${
                napRefusal
                  ? night
                    ? 'border-white/5 bg-white/5 opacity-55'
                    : 'border-amber-900/10 bg-amber-950/5 opacity-65'
                  : isSleeping
                    ? night
                      ? 'border-amber-300/40 bg-gradient-to-b from-amber-400/25 to-indigo-900/60 text-amber-100 shadow-xs'
                      : 'border-amber-400/60 bg-gradient-to-b from-amber-100 to-amber-50 text-amber-950 shadow-xs'
                    : 'border-indigo-900/15 bg-gradient-to-b from-indigo-50/90 to-amber-50/60 text-amber-950 shadow-xs'
              }`}
            >
              <span
                className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-xl min-[360px]:flex ${
                  isSleeping
                    ? night
                      ? 'bg-amber-300/25 text-amber-200'
                      : 'bg-amber-400/25 text-amber-700'
                    : 'bg-indigo-500/15 text-indigo-700'
                }`}
              >
                {isSleeping ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </span>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <p className="truncate font-display text-xs font-bold leading-tight">
                  {isSleeping ? 'Wake Oli Up' : 'Nap Mode'}
                </p>
                <span
                  className={`w-fit whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none ${
                    napRefusal
                      ? hintChip
                      : isSleeping
                        ? 'bg-amber-300 text-amber-950'
                        : 'bg-indigo-100 text-indigo-900'
                  }`}
                >
                  {napRefusal ?? (isSleeping ? '☀️ Wake' : '+15 Energy/h')}
                </span>
              </div>
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

/**
 * Compact effect tags: stat icon + value (same icons as the HUD meters above).
 * Icons keep the tags short enough to fit on small phones; the full stat name
 * is still available to screen readers and on long-press via `title`.
 */
function EffectPills({ effect, maxPills }: { effect: Partial<CatStats>; maxPills?: number }) {
  const entries = STAT_KEYS.flatMap((k) => (effect[k] ? [{ key: k, val: effect[k]! }] : []))
    .sort((a, b) => Math.abs(b.val) - Math.abs(a.val))
    .slice(0, maxPills ?? 5);
  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden">
      {entries.map(({ key, val }) => {
        const Icon = STAT_ICONS[key];
        const text = `${val > 0 ? `+${val}` : val} ${STAT_META[key].label}`;
        return (
          <span
            key={key}
            title={text}
            aria-label={text}
            style={{ backgroundColor: STAT_META[key].soft, color: '#432818' }}
            className="flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none whitespace-nowrap"
          >
            <span aria-hidden="true">{val > 0 ? `+${val}` : val}</span>
            <Icon aria-hidden="true" className="h-2.5 w-2.5" style={{ color: STAT_META[key].color }} />
          </span>
        );
      })}
    </div>
  );
}
