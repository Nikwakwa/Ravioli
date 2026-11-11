import { useEffect, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import {
  FORTUNE_COOKIE_PRICE,
  canAffordFortune,
  getFortuneState,
  getTodayDateString,
  getTodayFortune,
  hasOpenedToday,
  isFortuneUnlocked,
  openTodayFortune,
  subscribeFortune,
  type Fortune,
  type FortuneState,
} from '../utils/fortune';
import { trackFortuneCrack, type BadgeDefinition } from '../utils/badges';
import { vibrate } from '../utils/feedback';
import { playSound } from '../utils/sound';

export function useFortune(): FortuneState {
  return useSyncExternalStore(subscribeFortune, getFortuneState, getFortuneState);
}

/** Crisp golden SVG illustration of a Fortune Cookie */
function FortuneCookieGraphic({
  cracked = false,
  className = '',
}: {
  cracked?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Left Cookie Half */}
      <motion.svg
        viewBox="0 0 70 80"
        className="h-16 w-14 drop-shadow-md"
        animate={cracked ? { x: -18, rotate: -15, scale: 0.95 } : { x: 0, rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <defs>
          <linearGradient id="cookieGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>
        <path
          d="M 60 12 C 38 10, 12 28, 14 56 C 15 68, 28 74, 44 68 C 55 64, 60 48, 58 40 C 56 32, 64 20, 60 12 Z"
          fill="url(#cookieGradLeft)"
          stroke="#a16207"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Crisp toasted crease */}
        <path
          d="M 50 25 C 40 32, 38 48, 44 62"
          fill="none"
          stroke="#854d0e"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      </motion.svg>

      {/* Right Cookie Half */}
      <motion.svg
        viewBox="0 0 70 80"
        className="-ml-3 h-16 w-14 drop-shadow-md"
        animate={cracked ? { x: 18, rotate: 15, scale: 0.95 } : { x: 0, rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <defs>
          <linearGradient id="cookieGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
        <path
          d="M 10 12 C 32 10, 58 28, 56 56 C 55 68, 42 74, 26 68 C 15 64, 10 48, 12 40 C 14 32, 6 20, 10 12 Z"
          fill="url(#cookieGradRight)"
          stroke="#a16207"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Crisp toasted crease */}
        <path
          d="M 20 25 C 30 32, 32 48, 26 62"
          fill="none"
          stroke="#854d0e"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      </motion.svg>
    </div>
  );
}

function formatDateDisplay(d = new Date()): string {
  try {
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  } catch {
    return getTodayDateString(d);
  }
}

export function FortuneModal({
  churuStash,
  onUnlock,
  onUnlockBadges,
  onClose,
}: {
  churuStash: number;
  onUnlock: () => boolean;
  onUnlockBadges?: (unlocks: BadgeDefinition[]) => void;
  onClose: () => void;
}) {
  const fortuneState = useFortune();
  const unlocked = isFortuneUnlocked(fortuneState);
  const alreadyOpened = hasOpenedToday(fortuneState);

  const [cracked, setCracked] = useState(alreadyOpened);
  const [activeFortune, setActiveFortune] = useState<Fortune>(() => getTodayFortune(fortuneState));

  useEffect(() => {
    if (alreadyOpened) {
      setCracked(true);
      setActiveFortune(getTodayFortune(fortuneState));
    }
  }, [alreadyOpened, fortuneState]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCrack = () => {
    if (cracked) return;
    vibrate([25, 45, 25]);
    playSound('crunch');
    playSound('chime');
    const opened = openTodayFortune();
    setActiveFortune(opened);
    setCracked(true);
    const unlocks = trackFortuneCrack();
    onUnlockBadges?.(unlocks);
  };

  const handleUnlock = () => {
    if (!canAffordFortune(churuStash)) {
      vibrate([20, 40, 20]);
      playSound('miss');
      return;
    }
    const ok = onUnlock();
    if (ok) {
      vibrate([25, 35, 40]);
      playSound('chime');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="fortune-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Oli's Daily Fortune Cookie"
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[370px] overflow-hidden rounded-3xl border border-amber-300/40 bg-[#fffdf9] p-5 text-amber-950 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between border-b border-amber-900/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-lg shadow-xs">
                🥠
              </span>
              <div>
                <h2 className="font-display text-sm font-extrabold text-amber-950">Daily Fortune Cookie</h2>
                <p className="text-[11px] font-semibold text-amber-800/70">
                  {unlocked ? formatDateDisplay() : 'Unlock with Churus'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close fortune modal"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-950/8 text-amber-900 hover:bg-amber-950/15 active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!unlocked ? (
            /* LOCKED STATE: Shop preview to unlock for 5 Churus */
            <div className="flex flex-col items-center py-2 text-center">
              <div className="relative my-2 flex items-center justify-center">
                <FortuneCookieGraphic className="scale-110" />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-md ring-2 ring-white">
                  🔒
                </span>
              </div>

              <h3 className="font-display mt-2 text-base font-bold text-amber-950">Oli’s Fortune Cookie</h3>
              <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
                Unlock daily fortunes to crack open fresh cat wisdom and a sweet daily thought every morning.
              </p>

              <div className="mt-4 w-full">
                {canAffordFortune(churuStash) ? (
                  <button
                    type="button"
                    onClick={handleUnlock}
                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-pink-500 py-3 font-display text-sm font-black text-white shadow-md transition-all active:scale-[0.98]"
                  >
                    <Sparkles className="h-4 w-4" />
                    {`Unlock for 🍬 ${FORTUNE_COOKIE_PRICE} Churus`}
                  </button>
                ) : (
                  <div className="rounded-2xl border border-amber-900/10 bg-amber-50/80 p-3 text-center">
                    <p className="text-xs font-bold text-amber-900">
                      {`Cost: 🍬 ${FORTUNE_COOKIE_PRICE} Churus`}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-amber-800/70">
                      {`You have 🍬 ${churuStash} · need ${FORTUNE_COOKIE_PRICE - churuStash} more`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : !cracked ? (
            /* UNLOCKED & UNCRACKED: Tap to crack open */
            <div className="flex flex-col items-center py-3 text-center">
              <motion.button
                type="button"
                onClick={handleCrack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative my-3 flex cursor-pointer flex-col items-center focus:outline-hidden"
              >
                <motion.div
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <FortuneCookieGraphic className="scale-125" />
                </motion.div>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-300">
                  <Sparkles className="h-3 w-3 text-amber-600" /> Tap cookie to crack!
                </span>
              </motion.button>

              <button
                type="button"
                onClick={handleCrack}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-amber-500 py-3 font-display text-sm font-black text-white shadow-md transition-all active:scale-[0.98]"
              >
                Crack Open Today’s Cookie 🥠
              </button>
            </div>
          ) : (
            /* UNLOCKED & CRACKED: Read today's fortune slip */
            <div className="flex flex-col items-center pt-1 text-center">
              <FortuneCookieGraphic cracked className="scale-90 opacity-80" />

              {/* Fortune Parchment Paper Slip */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="relative -mt-2 w-full rounded-2xl border-2 border-dashed border-amber-300 bg-[#fffbf2] p-4 text-center shadow-md"
              >
                <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-pink-700">
                  ✨ Oli’s Daily Cat Wisdom ✨
                </div>

                <p className="font-display px-1 text-sm font-extrabold leading-snug text-amber-950 sm:text-base">
                  “{activeFortune.text}”
                </p>

                {/* Lucky details */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 border-t border-amber-900/10 pt-2.5 text-[10px] font-bold text-amber-900">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5">
                    🛋️ {activeFortune.luckySpot}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5">
                    🍬 {activeFortune.luckySnack}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5">
                    {activeFortune.luckyVibe}
                  </span>
                </div>
              </motion.div>

              <p className="mt-3 text-[11px] font-semibold text-amber-900/60">
                Come back tomorrow at sunrise for a fresh fortune! 🌅
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full rounded-2xl bg-amber-950/8 py-2.5 text-xs font-bold text-amber-900 transition-all hover:bg-amber-950/12 active:scale-[0.98]"
              >
                Keep in Mind & Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
