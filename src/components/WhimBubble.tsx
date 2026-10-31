import { AnimatePresence, motion } from 'framer-motion';
import type { CatWhim } from '../types';

export function WhimBubble({
  whim,
  now,
  onFulfill,
}: {
  whim: CatWhim | null;
  now: number;
  onFulfill: () => void;
}) {
  const remainingMin = whim ? Math.max(1, Math.ceil((whim.expiresAt - now) / 60_000)) : 0;

  return (
    <AnimatePresence>
      {whim && (
        <motion.button
          key={whim.id}
          type="button"
          onClick={onFulfill}
          initial={{ opacity: 0, y: 12, scale: 0.82 }}
          animate={{ opacity: 1, y: [0, -4, 0], scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.82 }}
          whileTap={{ scale: 0.94 }}
          transition={{
            opacity: { duration: 0.22 },
            scale: { type: 'spring', stiffness: 340, damping: 22 },
            y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          title="Tap to fulfill Oli’s craving!"
          className="pointer-events-auto absolute bottom-[236px] left-1/2 z-20 flex -translate-x-1/2 cursor-pointer flex-col items-center focus:outline-none"
        >
          <div className="flex items-center gap-2 rounded-2xl border-2 border-amber-400 bg-white/96 px-3 py-1.5 text-amber-950 shadow-lg backdrop-blur-md">
            <span className="text-base leading-none">{whim.emoji}</span>
            <div className="flex flex-col items-start leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xs font-extrabold whitespace-nowrap">{whim.label}</span>
                <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800">
                  {remainingMin}m
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-pink-600">
                Tap or use action · 2× Joy + 1 Churu 🍬
              </span>
            </div>
          </div>
          {/* Thought bubble pointer tail */}
          <div className="-mt-1 h-2.5 w-2.5 rotate-45 border-r-2 border-b-2 border-amber-400 bg-white/96" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
