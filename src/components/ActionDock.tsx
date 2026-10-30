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

  return (
    <section className="relative z-20 mx-3 mb-2 rounded-3xl bg-white/90 p-2.5 shadow-lg backdrop-blur-md border border-amber-900/10">
      {/* Category tabs */}
      <div className="mb-2 grid grid-cols-4 gap-1 rounded-2xl bg-amber-950/5 p-1">
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.id];
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`relative flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-extrabold transition-colors ${
                active ? 'text-amber-950' : 'text-amber-900/60 hover:text-amber-900'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="dock-tab"
                  className="absolute inset-0 rounded-xl bg-white shadow-xs"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action cards for active category */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
          className={`grid gap-2 ${
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
            return (
              <motion.button
                key={action.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                disabled={busy}
                onClick={() => onAction(action)}
                title={action.name}
                className={`flex flex-col items-start justify-between rounded-2xl border p-2.5 text-left transition-all ${
                  lockedBySleep
                    ? 'border-amber-900/10 bg-amber-950/5 opacity-55'
                    : 'border-amber-900/10 bg-gradient-to-b from-amber-50/90 to-orange-50/60 shadow-xs active:shadow-none'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <EffectPills effect={action.effect} />
                </div>
                <div className="mt-1.5">
                  <p className="font-display text-xs font-bold leading-tight text-amber-950">{action.short}</p>
                  <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-amber-900/60">{action.name}</p>
                </div>
              </motion.button>
            );
          })}

          {/* Sleep / Nap mode toggle lives in Comfort */}
          {category === 'comfort' && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              disabled={busy}
              onClick={onToggleSleep}
              className={`flex flex-col items-start justify-between rounded-2xl border p-2.5 text-left transition-all ${
                isSleeping
                  ? 'border-indigo-400/40 bg-gradient-to-b from-indigo-900 to-slate-900 text-indigo-50 shadow-xs'
                  : 'border-amber-900/10 bg-gradient-to-b from-indigo-50/80 to-amber-50/60 text-amber-950 shadow-xs'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isSleeping ? 'bg-indigo-400/20 text-amber-200' : 'bg-indigo-500/15 text-indigo-700'
                  }`}
                >
                  {isSleeping ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    isSleeping ? 'bg-amber-300/20 text-amber-200' : 'bg-amber-200/70 text-amber-900'
                  }`}
                >
                  {isSleeping ? 'Wake' : '+15/h ⚡'}
                </span>
              </div>
              <div className="mt-1.5">
                <p className="font-display text-xs font-bold leading-tight">{isSleeping ? 'Wake Oli Up' : 'Nap Mode'}</p>
                <p className={`mt-0.5 line-clamp-1 text-[10px] font-semibold ${isSleeping ? 'text-indigo-200/80' : 'text-amber-900/60'}`}>
                  {isSleeping ? 'Lights on & stretch' : 'Cozy dim & recharge'}
                </p>
              </div>
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function EffectPills({ effect }: { effect: Partial<CatStats> }) {
  const entries = STAT_KEYS.flatMap((k) => (effect[k] ? [{ key: k, val: effect[k]! }] : []));
  return (
    <div className="flex flex-wrap justify-end gap-0.5">
      {entries.map(({ key, val }) => (
        <span
          key={key}
          style={{ backgroundColor: STAT_META[key].soft, color: '#432818' }}
          className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none"
        >
          {val > 0 ? `+${val}` : val}
        </span>
      ))}
    </div>
  );
}
