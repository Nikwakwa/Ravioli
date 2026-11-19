import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import type { LifeStage } from '../types';
import { celebrate } from '../utils/feedback';
import { STAGE_META } from '../utils/lifeStage';
import { CatAvatar } from './CatAvatar';

export interface GrowthCelebrationModalProps {
  stage: LifeStage;
  onClose: () => void;
}

export function GrowthCelebrationModal({ stage, onClose }: GrowthCelebrationModalProps) {
  const meta = STAGE_META[stage];
  const isAdult = stage === 'adult';

  useEffect(() => {
    celebrate();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Oli grew up into ${meta.fullName}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.68, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.82, y: -20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative w-full max-w-xs sm:max-w-sm overflow-hidden rounded-3xl border border-amber-900/15 bg-gradient-to-b from-[#fffaf3] via-[#fff5e6] to-[#ffeed6] p-5 text-center text-amber-950 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close celebration"
          className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-900/8 text-amber-900/70 hover:bg-amber-900/15 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-900 shadow-2xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          <span>{isAdult ? 'All Grown Up!' : 'Oli Grew Up!'}</span>
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
        </motion.div>

        {/* Newly grown Oli portrait */}
        <div className="relative my-3.5 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute h-32 w-32 rounded-full opacity-45 blur-md"
            style={{
              background: 'radial-gradient(circle, #fde047 0%, #fb923c 60%, transparent 80%)',
            }}
          />
          <motion.div
            initial={{ scale: 0.72, y: 8 }}
            animate={{ scale: [0.72, 1.06, 1], y: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.15 }}
            className="relative flex h-28 w-28 items-end justify-center rounded-3xl border-2 border-amber-400/70 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 pb-1 shadow-lg ring-4 ring-amber-300/35"
          >
            <CatAvatar
              mood="ecstatic"
              animation="idle"
              animationKey={0}
              lifeStage={stage}
              className="h-24 w-22"
            />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 300, delay: 0.28 }}
              className="absolute -right-2 -bottom-2 flex h-9 w-9 items-center justify-center rounded-full border border-amber-900/10 bg-white text-xl shadow-md"
            >
              {meta.emoji}
            </motion.span>
          </motion.div>
        </div>

        {/* Title & tagline */}
        <h2 className="font-display text-xl font-black leading-tight text-amber-950">
          {isAdult ? 'Oli is now Adult Oli!' : `Oli is now a ${meta.fullName}!`}
        </h2>
        <p className="mt-1.5 px-2 text-xs font-semibold leading-relaxed text-amber-900/85">
          {meta.tagline}
        </p>

        {/* Unlocked highlights */}
        <ul className="mt-3 flex flex-col gap-1.5 rounded-2xl border border-amber-900/10 bg-white/80 p-3 text-left text-xs font-bold text-amber-950 shadow-2xs">
          {meta.unlockHighlights.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">✨</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {/* Celebration Churu gift */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-pink-400/35 bg-pink-50/90 px-3 py-2 text-xs font-black text-pink-950 shadow-2xs"
        >
          <span className="text-base leading-none">🍬</span>
          <span>+1 Churu tube to celebrate!</span>
        </motion.div>

        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="mt-4 w-full rounded-2xl bg-amber-500 py-2.5 text-xs font-black text-amber-950 shadow-sm transition-all hover:bg-amber-400 active:scale-95"
        >
          {isAdult ? 'Yay, Adult Oli! 🧡' : 'Yay, Oli! 🐾'}
        </button>
      </motion.div>
    </div>
  );
}
