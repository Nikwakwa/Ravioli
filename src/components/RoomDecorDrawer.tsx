import { useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import {
  canAffordDecor,
  DECOR_ITEMS,
  getEmptyRoomDecor,
  getRoomDecor,
  isDecorOwned,
  subscribeRoomDecor,
  toggleRoomDecor,
  type DecorId,
  type DecorRoomGroup,
  type RoomDecorState,
} from '../utils/roomDecor';
import { vibrate } from '../utils/feedback';
import { playSound } from '../utils/sound';

export function useRoomDecor(): RoomDecorState {
  return useSyncExternalStore(subscribeRoomDecor, getRoomDecor, getEmptyRoomDecor);
}

const GROUPS: ReadonlyArray<{ id: DecorRoomGroup; title: string; emoji: string }> = [
  { id: 'living_room', title: 'Living Room', emoji: '🛋️' },
  { id: 'seasonal', title: 'Seasonal & Table', emoji: '✨' },
  { id: 'balcony', title: 'Balcony Plants', emoji: '🌿' },
];

/** Bottom drawer where players personalize the Living Room and Balcony with Churus. */
export function RoomDecorDrawer({
  churuStash,
  onBuy,
  onClose,
}: {
  churuStash: number;
  /** Pays for the room decor item with Churus. Returns false if it could not be bought. */
  onBuy: (id: DecorId) => boolean;
  onClose: () => void;
}) {
  const decor = useRoomDecor();
  // Buying takes two taps (price, then confirm) so Churus are never spent by accident.
  const [confirming, setConfirming] = useState<DecorId | null>(null);

  return (
    <motion.div
      key="room-decor-backdrop"
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
        aria-label="Room Decor"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85dvh] w-full touch-pan-y overflow-y-auto rounded-t-3xl bg-[#fff7ee] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-amber-950 shadow-2xl"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-amber-900/15" />

        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100/80 text-2xl">
            🪴
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-bold">Room Decor</h2>
            <p className="text-xs font-semibold text-amber-900/75">Buy with Churus, then tap to place.</p>
            <p className="mt-0.5 text-[11px] font-bold text-pink-700">🍬 {churuStash} to spend</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close room decor"
            className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-full bg-amber-950/8 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          {GROUPS.map((group) => {
            const items = DECOR_ITEMS.filter((d) => d.group === group.id);
            return (
              <section key={group.id}>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-amber-900/65">
                  <span>{group.emoji}</span>
                  <span>{group.title}</span>
                </h3>
                <ul className="grid grid-cols-2 gap-2">
                  {items.map((item) => {
                    const owned = isDecorOwned(decor, item.id);
                    const placed = decor.equipped[item.slot] === item.id;
                    const affordable = canAffordDecor(item, churuStash);
                    const isConfirming = confirming === item.id;

                    const handleTap = () => {
                      if (owned) {
                        setConfirming(null);
                        vibrate(15);
                        playSound('pop');
                        toggleRoomDecor(item.id);
                        return;
                      }
                      if (!affordable) {
                        setConfirming(null);
                        vibrate([20, 40, 20]);
                        playSound('miss');
                        return;
                      }
                      if (!isConfirming) {
                        vibrate(15);
                        playSound('pop');
                        setConfirming(item.id);
                        return;
                      }
                      onBuy(item.id);
                      setConfirming(null);
                    };

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-pressed={owned ? placed : undefined}
                          aria-disabled={!owned && !affordable}
                          onClick={handleTap}
                          className={`flex w-full items-center gap-2 rounded-2xl border p-2 text-left transition-all active:scale-[0.98] ${
                            placed
                              ? 'border-emerald-500/60 bg-emerald-50 shadow-xs'
                              : isConfirming
                                ? 'border-pink-500/70 bg-pink-50 shadow-xs'
                                : owned || affordable
                                  ? 'border-amber-900/10 bg-white'
                                  : 'border-amber-900/8 bg-amber-950/4'
                          }`}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-xl ${
                              owned || affordable ? '' : 'opacity-45 grayscale'
                            }`}
                          >
                            {item.emoji}
                          </span>
                          <span className="min-w-0 leading-tight">
                            <span className="block truncate text-xs font-extrabold">{item.name}</span>
                            {placed ? (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-700">
                                <Check className="h-3 w-3" /> Placed
                              </span>
                            ) : owned ? (
                              <span className="text-[10px] font-bold text-amber-800/70">Tap to place</span>
                            ) : isConfirming ? (
                              <span className="text-[10px] font-black text-pink-700">Tap again to buy</span>
                            ) : affordable ? (
                              <span className="inline-block rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                                Buy 🍬 {item.price}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-900/55">
                                🍬 {item.price} · need {item.price - churuStash} more
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
