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
  Sparkles,
  SprayCan,
  Sun,
  Trash2,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import {
  CARE_ACTIONS,
  CATEGORIES,
  MAX_SLEEP_ENERGY,
  MIN_WAKE_ENERGY,
  STAT_META,
  type ActionCategory,
  type CareAction,
} from '../data/actions';
import { STAT_KEYS, type CatStats, type LiveCat } from '../types';

const CATEGORY_ICONS: Record<ActionCategory, LucideIcon> = {
  feed: Utensils,
  play: Feather,
  care: Sparkles,
  rest: BedDouble,
};

const ACTION_ICONS: Record<string, LucideIcon> = {
  churu: IceCreamCone,
  wet_food: Drumstick,
  chicken_heart: Heart,
  quail_egg: Egg,
  fountain: Droplets,
  feather_wand: Feather,
  laser_pointer: Zap,
  pheromone_mist: SprayCan,
  brush: Brush,
  scoop_mess: Trash2,
};

export interface ActionDockProps {
  live: LiveCat;
  tummyAche: boolean;
  messCount: number;
  busy: boolean;
  onAction: (action: CareAction) => void;
  onToggleSleep: () => void;
}

function refusalHint(action: CareAction, live: LiveCat, tummyAche: boolean, messCount: number): string | null {
  if (action.id === 'scoop_mess') {
    return messCount === 0 ? '✨ Spotless' : null;
  }
  if (live.isSleeping && action.requiresAwake) return '😴 Sleeping';
  if (tummyAche && action.category === 'feed') return '🤢 Tummy Ache';
  if (action.maxHunger !== undefined && live.hunger >= action.maxHunger) return '😋 Full';
  if (action.maxHydration !== undefined && live.hydration >= action.maxHydration) return '💧 Full';
  if (action.minEnergy !== undefined && live.energy < action.minEnergy) return '🥱 Tired';
  return null;
}

export function ActionDock({ live, tummyAche, messCount, busy, onAction, onToggleSleep }: ActionDockProps) {
  const [category, setCategory] = useState<ActionCategory>('feed');
  const actions = CARE_ACTIONS.filter((a) => a.category === category);
  const isSleeping = live.isSleeping;

  const shellClass = isSleeping
    ? 'bg-slate-900/85 border-white/10 text-amber-50'
    : 'bg-white/92 border-amber-900/10 text-amber-950';

  const isCompactGrid = category === 'feed';

  const napRefusal = !isSleeping && live.energy >= MAX_SLEEP_ENERGY
    ? '⚡ Not Tired'
    : isSleeping && live.energy < MIN_WAKE_ENERGY
      ? '😴 Exhausted'
      : null;

  return (
    <section
      className={`relative z-20 mx-3 mb-2.5 rounded-3xl border p-2.5 shadow-lg backdrop-blur-md transition-colors duration-500 ${shellClass}`}
    >
      {/* Category tabs */}
      <div className={`mb-2 grid grid-cols-4 gap-1 rounded-2xl p-1 ${isSleeping ? 'bg-white/5' : 'bg-amber-950/6'}`}>
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.id];
          const active = category === c.id;
          const showBadge = c.id === 'care' && messCount > 0;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`relative flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-extrabold transition-colors ${
                active
                  ? 'text-amber-950'
                  : isSleeping
                    ? 'text-indigo-200/70 hover:text-white'
                    : 'text-amber-900/60 hover:text-amber-900'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="dock-tab"
                  className={`absolute inset-0 rounded-xl shadow-xs ${isSleeping ? 'bg-amber-300' : 'bg-white'}`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">{c.label}</span>
              {showBadge && (
                <span className="relative z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold leading-none text-white">
                  {messCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Fixed-height action slot (h-[92px]) so switching tabs never jumps the layout */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.14 }}
          className={`grid h-[92px] gap-1.5 ${
            category === 'feed'
              ? 'grid-cols-2 grid-rows-2'
              : category === 'care'
                ? 'grid-cols-3'
                : 'grid-cols-2'
          }`}
        >
          {actions.map((action) => {
            const Icon = ACTION_ICONS[action.id] ?? Sparkles;
            const hint = refusalHint(action, live, tummyAche, messCount);
            const muted = Boolean(hint);
            const isUrgentScoop = action.id === 'scoop_mess' && messCount > 0;

            if (isCompactGrid) {
              return (
                <motion.button
                  key={action.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  disabled={busy}
                  onClick={() => onAction(action)}
                  className={`flex h-full items-center gap-2 rounded-2xl border px-2.5 py-1.5 text-left transition-all ${
                    muted
                      ? isSleeping
                        ? 'border-white/5 bg-white/5 opacity-50'
                        : 'border-amber-900/10 bg-amber-950/5 opacity-65'
                      : isSleeping
                        ? 'border-white/10 bg-slate-800/90 text-amber-50 shadow-xs'
                        : 'border-amber-900/10 bg-gradient-to-b from-amber-50/95 to-orange-50/70 text-amber-950 shadow-xs'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                      isSleeping ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-500/15 text-amber-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <p className="font-display text-xs font-bold leading-tight">{action.short}</p>
                    {hint ? (
                      <span className="w-fit rounded-full bg-amber-950/10 px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-amber-900 dark:bg-indigo-500/20 dark:text-indigo-200">
                        {hint}
                      </span>
                    ) : (
                      <EffectPills effect={action.effect} showLabels maxPills={2} />
                    )}
                  </div>
                </motion.button>
              );
            }

            return (
              <motion.button
                key={action.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                disabled={busy}
                onClick={() => onAction(action)}
                className={`flex h-full flex-col justify-between rounded-2xl border p-2 text-left transition-all ${
                  isUrgentScoop
                    ? 'border-rose-400/60 bg-gradient-to-b from-rose-50 to-amber-50 text-amber-950 shadow-xs'
                    : muted
                      ? isSleeping
                        ? 'border-white/5 bg-white/5 opacity-50'
                        : 'border-amber-900/10 bg-amber-950/5 opacity-65'
                      : isSleeping
                        ? 'border-white/10 bg-slate-800/90 text-amber-50 shadow-xs'
                        : 'border-amber-900/10 bg-gradient-to-b from-amber-50/95 to-orange-50/70 text-amber-950 shadow-xs active:shadow-none'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                      isUrgentScoop
                        ? 'bg-rose-500/15 text-rose-700'
                        : isSleeping
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-amber-500/15 text-amber-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {isUrgentScoop ? (
                    <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                      💩 {messCount}
                    </span>
                  ) : hint ? (
                    <span className="rounded-full bg-amber-950/10 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-900 dark:bg-indigo-500/20 dark:text-indigo-200">
                      {hint}
                    </span>
                  ) : (
                    <EffectPills
                      effect={action.effect}
                      showLabels={category !== 'care'}
                      maxPills={category === 'care' ? 1 : 2}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1">
                  <p className="font-display text-xs font-bold leading-snug">{action.short}</p>
                  {action.soothesTummy && tummyAche && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700">
                      Soothes 🧡
                    </span>
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
              className={`flex h-full flex-col justify-between rounded-2xl border p-2.5 text-left transition-all ${
                napRefusal
                  ? isSleeping
                    ? 'border-white/5 bg-white/5 opacity-55'
                    : 'border-amber-900/10 bg-amber-950/5 opacity-65'
                  : isSleeping
                    ? 'border-amber-300/40 bg-gradient-to-b from-amber-400/25 to-indigo-900/60 text-amber-100 shadow-xs'
                    : 'border-indigo-900/15 bg-gradient-to-b from-indigo-50/90 to-amber-50/60 text-amber-950 shadow-xs'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                    isSleeping ? 'bg-amber-300/25 text-amber-200' : 'bg-indigo-500/15 text-indigo-700'
                  }`}
                >
                  {isSleeping ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none ${
                    napRefusal
                      ? 'bg-amber-950/10 text-amber-900'
                      : isSleeping
                        ? 'bg-amber-300 text-amber-950'
                        : 'bg-indigo-100 text-indigo-900'
                  }`}
                >
                  {napRefusal ?? (isSleeping ? 'Wake' : '+15 Energy/h')}
                </span>
              </div>
              <p className="font-display text-xs font-bold leading-snug">
                {isSleeping ? 'Wake Oli Up' : 'Nap Mode'}
              </p>
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function EffectPills({
  effect,
  showLabels,
  maxPills,
}: {
  effect: Partial<CatStats>;
  showLabels?: boolean;
  maxPills?: number;
}) {
  const entries = STAT_KEYS.flatMap((k) => (effect[k] ? [{ key: k, val: effect[k]! }] : []))
    .sort((a, b) => Math.abs(b.val) - Math.abs(a.val))
    .slice(0, maxPills ?? 5);
  return (
    <div className="flex shrink-0 items-center gap-1">
      {entries.map(({ key, val }) => (
        <span
          key={key}
          style={{ backgroundColor: STAT_META[key].soft, color: '#432818' }}
          className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none whitespace-nowrap"
        >
          {val > 0 ? `+${val}` : val}
          {showLabels ? ` ${STAT_META[key].label}` : ''}
        </span>
      ))}
    </div>
  );
}
