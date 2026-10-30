import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { APP_VERSION, CHANGELOG } from '../data/changelog';

export function ChangelogModal({
  open,
  onClose,
  availableVersion,
  onReload,
}: {
  open: boolean;
  onClose: () => void;
  availableVersion?: string | null;
  onReload?: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cl-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs"
          />
          <motion.div
            key="cl-sheet"
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
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-bold text-amber-950">What’s New</h2>
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-extrabold text-amber-800">
                    {APP_VERSION}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-amber-900/10 p-1.5 text-amber-950"
                aria-label="Close changelog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {availableVersion && onReload && (
              <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-50 px-3 py-2.5">
                <span className="text-xs font-bold text-emerald-950">
                  ✨ New version <span className="font-extrabold">{availableVersion}</span> is ready!
                </span>
                <button
                  type="button"
                  onClick={onReload}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow-xs active:scale-95"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reload
                </button>
              </div>
            )}

            <div className="flex max-h-80 touch-pan-y flex-col gap-2.5 overflow-y-auto pr-1">
              {CHANGELOG.map((rel, idx) => (
                <div
                  key={rel.version}
                  className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-extrabold ${
                          idx === 0 ? 'bg-amber-500 text-white' : 'bg-amber-950/8 text-amber-900'
                        }`}
                      >
                        {rel.version}
                      </span>
                      <h3 className="font-display text-xs font-bold text-amber-950">{rel.title}</h3>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800/60">{rel.date}</span>
                  </div>
                  <ul className="mt-2 flex list-disc flex-col gap-1 pl-3.5 text-[11px] font-semibold text-amber-900/80">
                    {rel.changes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
