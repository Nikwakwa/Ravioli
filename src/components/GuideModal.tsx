import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Moon, Sparkles, Sun, X } from 'lucide-react';
import { CARE_ACTIONS, STAT_META } from '../data/actions';
import { STAT_KEYS } from '../types';
import { DECAY_RATES, MIN_NAP_HOURS, NEED_THRESHOLD, THRIVING_THRESHOLD } from '../utils/decayEngine';
import { STAT_ICONS } from './statIcons';

function minutesPerPoint(ratePerHour: number): string {
  const mins = Math.round((60 / Math.abs(ratePerHour)) * 10) / 10;
  return `1 pt / ${mins}m`;
}

export function GuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="guide-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs"
          />
          <motion.div
            key="guide-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border-t border-amber-900/10 bg-[#fff7ee] p-4 pb-6 shadow-2xl"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-amber-900/20" />
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
                  <BookOpen className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold leading-tight text-amber-950">
                    Oli Care Manual & Rules
                  </h2>
                  <p className="text-[11px] font-semibold text-amber-800/75">
                    How stats, decay rates, naps & actions work
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-amber-900/10 p-1.5 text-amber-950"
                aria-label="Close manual"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex max-h-[68dvh] touch-pan-y flex-col gap-3 overflow-y-auto pr-1 text-amber-950">
              {/* Section 1: Hourly Stat Rates */}
              <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
                <div className="mb-1.5 flex items-center justify-between">
                  <h3 className="font-display text-xs font-bold text-amber-950">
                    ⏱️ Real-Time Stat Drift (0 – 100 pts)
                  </h3>
                  <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                    Runs 24/7
                  </span>
                </div>
                <p className="mb-2.5 text-[11px] font-semibold leading-relaxed text-amber-900/80">
                  Oli’s 5 stats drift continuously in real time — even while the app is closed.
                </p>

                <div className="overflow-hidden rounded-xl border border-amber-900/10">
                  <div className="grid grid-cols-12 bg-amber-950/5 px-2.5 py-1.5 text-[10px] font-extrabold text-amber-900">
                    <span className="col-span-4">Stat</span>
                    <span className="col-span-4 flex items-center gap-1">
                      <Sun className="h-3 w-3 text-amber-600" /> Awake
                    </span>
                    <span className="col-span-4 flex items-center gap-1">
                      <Moon className="h-3 w-3 text-indigo-600" /> Napping
                    </span>
                  </div>
                  {STAT_KEYS.map((key) => {
                    const meta = STAT_META[key];
                    const Icon = STAT_ICONS[key];
                    const awakeRate = DECAY_RATES.awake[key];
                    const sleepRate = DECAY_RATES.sleeping[key];
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-12 items-center border-t border-amber-900/6 px-2.5 py-1.5 text-[11px]"
                      >
                        <div className="col-span-4 flex items-center gap-1.5 font-extrabold">
                          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: meta.color }} />
                          <span>{meta.label}</span>
                        </div>
                        <div className="col-span-4 leading-tight">
                          <span className="font-extrabold text-rose-600">{awakeRate}/h</span>
                          <span className="block text-[9px] font-semibold text-amber-900/60">
                            ({minutesPerPoint(awakeRate)})
                          </span>
                        </div>
                        <div className="col-span-4 leading-tight">
                          <span
                            className={`font-extrabold ${sleepRate > 0 ? 'text-emerald-600' : 'text-indigo-900'}`}
                          >
                            {sleepRate > 0 ? `+${sleepRate}/h` : `${sleepRate}/h`}
                          </span>
                          <span className="block text-[9px] font-semibold text-amber-900/60">
                            ({minutesPerPoint(sleepRate)})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Nap Mode & Auto-Wake */}
              <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
                <h3 className="mb-1 font-display text-xs font-bold text-amber-950">🌙 Nap Mode & Waking Up</h3>
                <ul className="flex list-disc flex-col gap-1 pl-4 text-[11px] font-semibold leading-snug text-amber-900/85">
                  <li>
                    In <strong>Comfort → Nap Mode</strong>, Oli curls up to sleep: Energy recharges at{' '}
                    <strong className="text-emerald-700">+{DECAY_RATES.sleeping.energy} pts/h</strong> and Hunger &
                    Clean decay at half speed.
                  </li>
                  <li>
                    Once his Energy hits <strong>100</strong> (after at least{' '}
                    <strong>{MIN_NAP_HOURS * 60} minutes</strong>), Oli wakes up automatically on his own!
                  </li>
                  <li>
                    Most actions are paused while he sleeps so you don’t wake him, except{' '}
                    <strong>Calming Mist</strong>.
                  </li>
                </ul>
              </div>

              {/* Section 3: Care Actions Reference */}
              <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
                <h3 className="mb-2 font-display text-xs font-bold text-amber-950">🐾 Care Actions & Boosts</h3>
                <div className="flex flex-col gap-1.5">
                  {CARE_ACTIONS.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-amber-950/4 px-2.5 py-1.5 text-[11px]"
                    >
                      <div className="min-w-0">
                        <span className="font-extrabold text-amber-950">{a.short}</span>
                        {a.calmMinutes && (
                          <span className="ml-1.5 rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-purple-800">
                            {a.calmMinutes}m Zen
                          </span>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1">
                        {STAT_KEYS.map((k) => {
                          const val = a.effect[k];
                          if (!val) return null;
                          return (
                            <span
                              key={k}
                              style={{ backgroundColor: STAT_META[k].soft, color: '#432818' }}
                              className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none"
                            >
                              {val > 0 ? `+${val}` : val} {STAT_META[k].label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Moods & Co-op */}
              <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
                <h3 className="mb-1 flex items-center gap-1 font-display text-xs font-bold text-amber-950">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Mood Thresholds & Co-op
                </h3>
                <ul className="flex list-disc flex-col gap-1 pl-4 text-[11px] font-semibold leading-snug text-amber-900/85">
                  <li>
                    <strong className="text-rose-600">Low-Need Alert (&lt; {NEED_THRESHOLD})</strong>: When Hunger or
                    Water drops below {NEED_THRESHOLD} (or Energy/Clean &lt; 20, Joy &lt; 30), the stat bar turns red
                    and Oli’s mood badge tells you what he needs.
                  </li>
                  <li>
                    <strong className="text-amber-700">Thriving (&ge; {THRIVING_THRESHOLD})</strong>: Keep all 5 stats
                    at {THRIVING_THRESHOLD}+ to make Oli ecstatic and trigger confetti!
                  </li>
                  <li>
                    <strong>Petting Oli</strong>: Tap Oli directly on the rug anytime for purrs and thought bubbles.
                  </li>
                  <li>
                    <strong>Real-Time Co-op</strong>: Actions by <strong>Nico</strong> &amp; <strong>Athina</strong>{' '}
                    sync live across both devices.
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
