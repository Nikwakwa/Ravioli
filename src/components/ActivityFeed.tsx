import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, History, X } from 'lucide-react';
import { useState } from 'react';
import type { ActivityEntry } from '../types';
import { formatActivityTime } from '../utils/feedback';
import { playerColor } from '../utils/player';

export function ActivityFeed({ log, now }: { log: ActivityEntry[]; now: number }) {
  const [open, setOpen] = useState(false);
  const latest = log[0];

  return (
    <>
      {/* Compact pill above the dock */}
      <div className="relative z-20 mx-3 mb-1.5 flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-xs shadow-xs backdrop-blur-md border border-amber-900/10 active:scale-[0.99] transition-transform"
        >
          <span className="flex min-w-0 items-center gap-2">
            <History className="h-3.5 w-3.5 shrink-0 text-amber-700" />
            {latest ? (
              <span className="truncate font-semibold text-amber-950">
                <PlayerBadge name={latest.player} /> <span className="text-amber-900/85">{latest.message}</span>
              </span>
            ) : (
              <span className="truncate font-semibold text-amber-900/60">Co-op activity log — tap a care action below!</span>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-amber-800/70">
            {latest && <span>{formatActivityTime(latest.created_at, now)}</span>}
            <ChevronUp className="h-3.5 w-3.5" />
          </span>
        </button>
      </div>

      {/* Slide-up drawer with the last 10 actions */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl bg-[#fff7ee] p-4 pb-6 shadow-2xl border-t border-amber-900/10"
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-amber-900/20" />
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-bold text-amber-950">Couples Co-Op Activity</h2>
                  <p className="text-xs font-semibold text-amber-900/65">Last {log.length || 0} moments with Oli (live synced)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-amber-900/10 p-1.5 text-amber-950"
                  aria-label="Close activity log"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {log.length === 0 ? (
                <p className="py-8 text-center text-xs font-semibold text-amber-900/60">
                  No care actions yet — feed or cuddle Oli to start your shared log!
                </p>
              ) : (
                <ul className="flex max-h-72 touch-pan-y flex-col gap-2 overflow-y-auto pr-1">
                  {log.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-2 rounded-2xl bg-white px-3 py-2 text-xs shadow-2xs border border-amber-900/5"
                    >
                      <span className="min-w-0 font-semibold text-amber-950">
                        <PlayerBadge name={entry.player} /> — {entry.message}
                      </span>
                      <span className="shrink-0 text-[11px] font-bold tabular-nums text-amber-800/70">
                        at {formatActivityTime(entry.created_at, now)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function PlayerBadge({ name }: { name: string }) {
  const c = playerColor(name);
  return (
    <span style={{ backgroundColor: c.bg, color: c.fg }} className="inline-block rounded-full px-2 py-0.5 text-[11px] font-extrabold">
      {name}
    </span>
  );
}
