import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { MAX_LIVES } from '../utils/decayEngine';
import type { LiveCat } from '../types';

export function EmergencyRevivalModal({
  live,
  onRevive,
}: {
  live: LiveCat;
  onRevive: () => void;
}) {
  const isDeceased = live.isDeceased;
  const livesLeft = live.livesLeft ?? MAX_LIVES;

  if (!isDeceased) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="revival-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      >
        <motion.div
          key="revival-card"
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative w-full max-w-[380px] overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-b from-[#1a1424] via-[#231b2e] to-[#15101e] p-5 text-amber-50 shadow-2xl"
        >
          {/* Subtle starry glow */}
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-36 w-36 rounded-full bg-amber-400/15 blur-2xl" />

          {/* Icon & Angel halo */}
          <div className="relative mb-3 flex flex-col items-center">
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/20 text-3xl shadow-inner ring-2 ring-amber-400/40"
            >
              <span>👼</span>
              {/* Little halo */}
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2.5 h-3.5 w-10 rounded-full border-2 border-amber-300 bg-amber-200/20 shadow-[0_0_8px_#fde047]"
              />
            </motion.div>
          </div>

          {/* Heading */}
          <div className="mb-3 text-center">
            <h2 className="font-display text-lg font-black tracking-tight text-amber-100">
              Oli Has Passed Away 💔
            </h2>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-200/80">
              Oli was left alone without food or water for over 2 days and succumbed to severe dehydration.
            </p>
          </div>

          {/* Responsibility reminder card */}
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-left">
            <p className="text-[11px] font-medium leading-relaxed text-amber-100/90">
              Caring for a pet is a real, heartfelt responsibility.
            </p>
            <p className="mt-1.5 text-[10px] font-bold text-sky-300">
              ✈️ <strong>Travel Tip:</strong> Whenever you’re taking a flight, on a long trip, or unable to check in, use{' '}
              <strong className="underline">Vacation Mode</strong> in the Menu to pause his care clock and keep him safe!
            </p>
          </div>

          {/* 9 Lives Counter */}
          <div className="mb-4 flex flex-col items-center gap-1.5 rounded-2xl border border-amber-500/20 bg-amber-950/40 px-3 py-2.5">
            <div className="flex items-center gap-1">
              <span className="font-display text-xs font-bold text-amber-200">9 Lives of Oli:</span>
              <span className="text-xs font-black text-amber-400">
                {livesLeft} / {MAX_LIVES} Remaining
              </span>
            </div>

            {/* 9 Paw indicators */}
            <div className="flex items-center gap-1.5 pt-0.5">
              {Array.from({ length: MAX_LIVES }).map((_, i) => {
                const isAlive = i < livesLeft;
                return (
                  <span
                    key={i}
                    title={isAlive ? `Life ${i + 1}` : 'Spent life'}
                    className={`text-sm transition-transform ${
                      isAlive ? 'scale-105 text-amber-400 drop-shadow-[0_0_3px_#f59e0b]' : 'opacity-25 grayscale'
                    }`}
                  >
                    🐾
                  </span>
                );
              })}
            </div>
          </div>

          {/* Revival Button */}
          <button
            type="button"
            onClick={onRevive}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-3.5 font-display text-sm font-black text-white shadow-lg transition-transform active:scale-95 hover:brightness-105"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {livesLeft > 1
                ? `🩺 Emergency Miracle Revival (Use 1 Life)`
                : livesLeft === 1
                  ? `🩺 Emergency Revival (Last Life!) 🐾`
                  : `✨ Fresh Start: Promise to Care (Restore 9 Lives)`}
            </span>
          </button>

          <p className="mt-2.5 text-center text-[10px] font-semibold text-amber-300/60">
            Oli will wake up hungry and thirsty — have wet food and fresh water ready!
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
