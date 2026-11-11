import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, X } from 'lucide-react';
import type { BadgeUnlock } from '../utils/badges';
import { celebrate } from '../utils/feedback';

export interface BadgeCelebrationModalProps {
  unlock: BadgeUnlock;
  onClose: () => void;
  onViewBadges: () => void;
}

export function BadgeCelebrationModal({
  unlock,
  onClose,
  onViewBadges,
}: BadgeCelebrationModalProps) {
  const isGold = unlock.tier === 'gold';
  const isSilver = unlock.tier === 'silver';
  const medal = isGold ? '🥇' : isSilver ? '🥈' : '🥉';
  const tierName = isGold ? 'Gold' : isSilver ? 'Silver' : 'Bronze';

  // Fire confetti burst upon celebration appearance
  useEffect(() => {
    celebrate();
  }, []);

  // Keyboard navigation & auto-dismiss after 6.5s
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const timer = window.setTimeout(() => {
      onClose();
    }, 6500);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={unlock.isLevelUp ? `Badge Leveled Up: ${unlock.badge.name}` : `Badge Unlocked: ${unlock.badge.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.65, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative w-full max-w-xs sm:max-w-sm overflow-hidden rounded-3xl border border-amber-900/15 bg-gradient-to-b from-[#fffaf3] via-[#fff5e6] to-[#ffeed6] p-5 text-center text-amber-950 shadow-2xl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close celebration"
          className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-900/8 text-amber-900/70 hover:bg-amber-900/15 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-2xs"
          style={{
            backgroundColor: isGold ? '#fef3c7' : isSilver ? '#e2e8f0' : '#ffedd5',
            color: isGold ? '#78350f' : isSilver ? '#1e293b' : '#7c2d12',
            border: `1px solid ${isGold ? '#f59e0b' : isSilver ? '#94a3b8' : '#ea580c'}40`,
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{unlock.isLevelUp ? 'Badge Leveled Up!' : 'New Badge Unlocked!'}</span>
          <Sparkles className="h-3.5 w-3.5" />
        </motion.div>

        {/* Big Animated Badge Icon */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Subtle spinning glow effect behind icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute h-28 w-28 rounded-full opacity-40 blur-md pointer-events-none"
            style={{
              background: isGold
                ? 'radial-gradient(circle, #fde047 0%, #f59e0b 60%, transparent 80%)'
                : isSilver
                  ? 'radial-gradient(circle, #cbd5e1 0%, #94a3b8 60%, transparent 80%)'
                  : 'radial-gradient(circle, #fed7aa 0%, #ea580c 60%, transparent 80%)',
            }}
          />

          <motion.div
            initial={{ scale: 0.7, rotate: -8 }}
            animate={{ scale: [0.7, 1.08, 1], rotate: [0, 4, 0] }}
            transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.15 }}
            className={`relative flex h-24 w-24 items-center justify-center rounded-3xl border-2 shadow-lg ${
              isGold
                ? 'border-amber-400 bg-gradient-to-br from-amber-100 via-amber-200 to-yellow-300 ring-4 ring-amber-300/40'
                : isSilver
                  ? 'border-slate-300 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 ring-4 ring-slate-300/40'
                  : 'border-amber-700/40 bg-gradient-to-br from-amber-100 via-amber-200/70 to-orange-200 ring-4 ring-amber-700/20'
            }`}
          >
            <span className="text-5xl select-none filter drop-shadow-sm leading-none" role="img" aria-label={unlock.badge.name}>
              {unlock.badge.emoji}
            </span>

            {/* Medal icon badge on bottom-right corner */}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 300, delay: 0.3 }}
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl shadow-md border border-amber-900/10"
            >
              {medal}
            </motion.span>
          </motion.div>
        </div>

        {/* Badge Name & Tier Subtitle */}
        <h2 className="font-display text-xl font-black text-amber-950 leading-tight">
          {unlock.badge.name}
        </h2>
        <p className="mt-0.5 text-xs font-black text-amber-900/75">
          {`${tierName} Medal (${medal})`}
        </p>

        {/* Badge Description */}
        <p className="mt-2 text-xs font-semibold text-amber-900/85 px-2 leading-relaxed">
          {unlock.badge.description}
        </p>

        {/* Reward Callout */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-3.5 flex items-center justify-center gap-2 rounded-2xl border border-pink-400/35 bg-pink-50/90 px-3 py-2 text-xs font-black text-pink-950 shadow-2xs"
        >
          <span className="text-base leading-none">🍬</span>
          <span>+1 Churu tube added to your stash!</span>
        </motion.div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="w-full rounded-2xl bg-amber-500 py-2.5 text-xs font-black text-amber-950 shadow-sm hover:bg-amber-400 active:scale-95 transition-all"
          >
            Awesome! 🐾
          </button>
          <button
            type="button"
            onClick={onViewBadges}
            className="flex items-center justify-center gap-1.5 w-full rounded-2xl bg-amber-900/8 py-2 text-xs font-bold text-amber-900 hover:bg-amber-900/15 active:scale-95 transition-all"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>View Badges</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
