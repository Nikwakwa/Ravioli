import { AnimatePresence, motion } from 'framer-motion';
import {
  BedDouble,
  Brush,
  Droplets,
  Drumstick,
  Egg,
  Feather,
  HandHeart,
  Heart,
  Moon,
  Sparkles,
  SprayCan,
  Sun,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { CARE_ACTIONS, CATEGORIES, STAT_META, type ActionCategory, type CareAction } from '../data/actions';
import { STAT_KEYS, type CatStats } from '../types';

const CATEGORY_ICONS: Record<ActionCategory, LucideIcon> = {
  feed: Utensils,
  hydrate: Droplets,
  play: Feather,
  comfort: BedDouble,
};

const ACTION_ICONS: Record<string, LucideIcon> = {
  wet_food: Drumstick,
  chicken_heart: Heart,
  quail_egg: Egg,
  fountain: Droplets,
  chin_scratch: HandHeart,
  feather_wand: Feather,
  pheromone_mist: SprayCan,
  brush: Brush,
};

export interface ActionDockProps {
  isSleeping: boolean;
  busy: boolean;
  onAction: (action: CareAction) => void;
  onToggleSleep: () => void;
}

export function ActionDock({ isSleeping, busy, onAction, onToggleSleep }: ActionDockProps) {
  const [category, setCategory] = useState<ActionCategory>('feed');
  const actions = CARE_ACTIONS.filter((a) => a.category === category);

  const shellClass = isSleeping
    ? 'bg-slate-900/85 border-white/10 text-amber-50'
    : 'bg-white/92 border-amber-900/10 text-amber-950';

  return (
    <section
      className={`relative z-20 mx-3 mb-2 rounded-3xl border p-2.5 shadow-lg backdrop-blur-md transition-colors duration-500 ${shellClass}`}
    >
      {/* Category tabs */}
      <div className={`mb-2 grid grid-cols-4 gap-1 rounded-2xl p-1 ${isSleeping ? 'bg-white/5' : 'bg-amber-950/6'}`}>
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.id];
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`relative flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-extrabold transition-colors ${
                active
                  ? isSleeping
                    ? 'text-amber-950'
                    : 'text-amber-950'
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
            </button>
          );
        })}
      </div>

      {/* Fixed-height action slot (h-[84px]) so switching tabs never jumps the layout */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.14 }}
          className={`grid h-[84px] gap-2 ${
            category === 'feed' || category === 'comfort'
              ? 'grid-cols-3'
              : category === 'play'
                ? 'grid-cols-2'
                : 'grid-cols-1'
          }`}
        >
          {actions.map((action) => {
            const Icon = ACTION_ICONS[action.id] ?? Sparkles;
            const lockedBySleep = isSleeping && action.requiresAwake;
            const isSingleWide = category === 'hydrate';

            return (
              <motion.button
                key={action.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                disabled={busy}
                onClick={() => onAction(action)}
                title={action.name}
                className={`flex h-full flex-col justify-between rounded-2xl border p-2 text-left transition-all ${
                  lockedBySleep
                    ? isSleeping
                      ? 'border-white/5 bg-white/5 opacity-45'
                      : 'border-amber-900/10 bg-amber-950/5 opacity-55'
                    : isSleeping
                      ? 'border-white/10 bg-slate-800/90 text-amber-50 shadow-xs'
                      : 'border-amber-900/10 bg-gradient-to-b from-amber-50/95 to-orange-50/70 text-amber-950 shadow-xs active:shadow-none'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                      isSleeping ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-500/15 text-amber-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {lockedBySleep ? (
                    <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-300">
                      😴 Zzz
                    </span>
                  ) : (
                    <EffectPills effect={action.effect} showLabels={isSingleWide} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-xs font-bold leading-tight">{action.short}</p>
                  <p
                    className={`mt-0.5 truncate text-[10px] font-semibold leading-tight ${
                      isSleeping ? 'text-indigo-200/70' : 'text-amber-900/60'
                    }`}
                  >
                    {action.name}
                  </p>
                </div>
              </motion.button>
            );
          })}

          {/* Sleep / Nap mode toggle lives in Comfort */}
          {category === 'comfort' && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={busy}
              onClick={onToggleSleep}
              className={`flex h-full flex-col justify-between rounded-2xl border p-2 text-left transition-all ${
                isSleeping
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
                    isSleeping ? 'bg-amber-300 text-amber-950' : 'bg-indigo-100 text-indigo-900'
                  }`}
                >
                  {isSleeping ? 'Wake' : '+15/h'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-xs font-bold leading-tight">
                  {isSleeping ? 'Wake Oli Up' : 'Nap Mode'}
                </p>
                <p
                  className={`mt-0.5 truncate text-[10px] font-semibold leading-tight ${
                    isSleeping ? 'text-amber-200/80' : 'text-amber-900/60'
                  }`}
                >
                  {isSleeping ? 'Turn lights back on' : 'Cozy dim & recharge'}
                </p>
              </div>
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function EffectPills({ effect, showLabels }: { effect: Partial<CatStats>; showLabels?: boolean }) {
  const entries = STAT_KEYS.flatMap((k) => (effect[k] ? [{ key: k, val: effect[k]! }] : []));
  return (
    <div className="flex shrink-0 items-center gap-0.5">
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
