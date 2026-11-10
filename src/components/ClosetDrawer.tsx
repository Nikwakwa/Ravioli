import { useEffect, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, X } from 'lucide-react';
import {
  ACCESSORIES,
  getCloset,
  getEmptyCloset,
  isUnlocked,
  markClosetSeen,
  subscribeCloset,
  toggleAccessory,
  type ClosetState,
} from '../utils/closet';
import { vibrate } from '../utils/feedback';
import { playSound } from '../utils/sound';
import { AccessoryIcon } from './CatAccessories';
import { CatAvatar } from './CatAvatar';

export function useCloset(): ClosetState {
  return useSyncExternalStore(subscribeCloset, getCloset, getEmptyCloset);
}

/** Little clothes hanger (the closet button's icon). */
export function HangerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 9.5 V8.2 a2.4 2.4 0 1 0 -2.4 -2.4" />
      <path d="M12 9.5 L21 16.2 a1.5 1.5 0 0 1 -0.9 2.7 H3.9 a1.5 1.5 0 0 1 -0.9 -2.7 Z" />
    </svg>
  );
}

/** Bottom drawer where accessories are put on or taken off. */
export function ClosetDrawer({ onClose }: { onClose: () => void }) {
  const closet = useCloset();

  useEffect(() => {
    markClosetSeen();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      key="closet-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-end bg-black/35"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Oli's Closet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-3xl bg-[#fff7ee] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-amber-950 shadow-2xl"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-amber-900/15" />

        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-20 w-20 shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-amber-100/70">
            <CatAvatar mood="happy" animation="idle" animationKey={0} className="h-[76px] w-[70px]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-bold">Oli’s Closet</h2>
            <p className="text-xs font-semibold text-amber-900/75">Tap to put on or take off.</p>
            <p className="mt-0.5 text-[11px] font-bold text-pink-700">🍬 {closet.churusEarned} Churus earned</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close closet"
            className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-full bg-amber-950/8 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="grid grid-cols-2 gap-2">
          {ACCESSORIES.map((item) => {
            const unlocked = isUnlocked(item, closet.churusEarned);
            const wearing = closet.outfit[item.slot] === item.id;
            const missing = item.unlockAt - closet.churusEarned;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={!unlocked}
                  aria-pressed={wearing}
                  onClick={() => {
                    vibrate(15);
                    playSound('pop');
                    toggleAccessory(item.id);
                  }}
                  className={`flex w-full items-center gap-2 rounded-2xl border p-2 text-left transition-all active:scale-[0.98] ${
                    wearing
                      ? 'border-emerald-500/60 bg-emerald-50 shadow-xs'
                      : unlocked
                        ? 'border-amber-900/10 bg-white'
                        : 'border-amber-900/8 bg-amber-950/4'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 ${
                      unlocked ? '' : 'opacity-40 grayscale'
                    }`}
                  >
                    <AccessoryIcon id={item.id} className="h-8 w-9" />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-xs font-extrabold">{item.name}</span>
                    {wearing ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-700">
                        <Check className="h-3 w-3" /> Wearing
                      </span>
                    ) : unlocked ? (
                      <span className="text-[10px] font-bold text-amber-800/70">Tap to wear</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-900/55">
                        <Lock className="h-3 w-3" /> {missing} more 🍬
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </motion.div>
  );
}
