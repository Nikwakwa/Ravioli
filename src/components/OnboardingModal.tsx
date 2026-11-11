import { useState } from 'react';
import { motion } from 'framer-motion';
import { CatAvatar } from './CatAvatar';
import { playSound } from '../utils/sound';
import { vibrate } from '../utils/feedback';
import { sanitizePlayerName } from '../utils/player';

export interface OnboardingModalProps {
  initialName: string;
  onComplete: (name: string) => void;
}

export function OnboardingModal({ initialName, onComplete }: OnboardingModalProps) {
  const [name, setName] = useState(initialName === 'You' ? '' : initialName);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = sanitizePlayerName(name) || 'Friend';
    vibrate([25, 40, 25]);
    playSound('chime');
    onComplete(clean);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Ravioli"
      className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/40 p-4 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="w-full max-w-sm rounded-3xl border border-amber-900/10 bg-[#fff7ee] p-5 text-amber-950 shadow-2xl"
      >
        {/* Cat Avatar Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-2 flex h-20 w-20 items-end justify-center rounded-2xl bg-amber-200/50 shadow-inner">
            <CatAvatar mood="ecstatic" animation="idle" animationKey={0} className="h-18 w-16" />
            <span className="absolute -top-1.5 -right-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-black shadow-xs">
              🐾
            </span>
          </div>

          <h2 className="font-display text-lg font-black text-amber-950">Welcome to Ravioli!</h2>
          <p className="mt-0.5 text-xs font-semibold text-amber-900/75">
            Meet Oli, your cozy virtual ginger cat.
          </p>
        </div>

        {/* 3 Quick Gameplay Cards */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-900/8 bg-white/80 p-2.5 shadow-2xs">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-sm">
              🍗
            </span>
            <div className="text-left leading-tight">
              <h3 className="font-display text-xs font-bold text-amber-950">Daily Care</h3>
              <p className="mt-0.5 text-[11px] font-medium text-amber-900/80">
                Keep Oli fed, watered, and happy. Tap him directly on the rug anytime for purrs!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-900/8 bg-white/80 p-2.5 shadow-2xs">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-sm">
              🎮
            </span>
            <div className="text-left leading-tight">
              <h3 className="font-display text-xs font-bold text-amber-950">Play &amp; Whims</h3>
              <p className="mt-0.5 text-[11px] font-medium text-amber-900/80">
                Win minigames and fulfill cravings to earn delicious Churu treats (🍬).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-900/8 bg-white/80 p-2.5 shadow-2xs">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-sm">
              🎀
            </span>
            <div className="text-left leading-tight">
              <h3 className="font-display text-xs font-bold text-amber-950">Closet &amp; Badges</h3>
              <p className="mt-0.5 text-[11px] font-medium text-amber-900/80">
                Dress Oli up, crack daily fortune cookies, and discover all 36 medals!
              </p>
            </div>
          </div>
        </div>

        {/* Name input form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div>
            <label htmlFor="player-name-input" className="block text-left text-[11px] font-extrabold text-amber-950">
              What should Oli call you?
            </label>
            <input
              id="player-name-input"
              type="text"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (e.g. Alex)"
              className="mt-1 w-full rounded-xl border border-amber-900/15 bg-white px-3 py-2 text-xs font-bold text-amber-950 placeholder:text-amber-900/40 focus:border-amber-500 focus:outline-hidden shadow-2xs"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-amber-500 py-2.5 text-xs font-extrabold text-amber-950 shadow-md transition-transform hover:bg-amber-400 active:scale-98"
          >
            <span>Say Hello to Oli 🐾</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
