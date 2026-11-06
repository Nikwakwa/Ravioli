import { AnimatePresence, motion } from 'framer-motion';
import type { CatSpot, CatWhim } from '../types';

const SPOT_WHIM_POS: Record<CatSpot, { left: string; bottom: string }> = {
  rug: { left: '50%', bottom: '236px' },
  sofa_bed: { left: '77%', bottom: '318px' },
  box: { left: '39%', bottom: '268px' },
  window: { left: '49%', bottom: '388px' },
};

export function WhimBubble({
  whim,
  now,
  onFulfill,
  targetPos,
  spot = 'rug',
  containerWidth,
}: {
  whim: CatWhim | null;
  now: number;
  onFulfill: () => void;
  targetPos?: { x: number; y: number };
  spot?: CatSpot;
  /** Width of the play area, used to keep the bubble fully on screen. */
  containerWidth?: number;
}) {
  const remainingMin = whim ? Math.max(1, Math.ceil((whim.expiresAt - now) / 60_000)) : 0;
  const pos = SPOT_WHIM_POS[spot];

  // Keep the bubble inside the screen edges; the tail still points at Oli's head.
  const HALF_BUBBLE = 120;
  const EDGE = 8;
  let bubbleX = targetPos?.x ?? 0;
  if (targetPos && containerWidth && containerWidth > 0) {
    const min = HALF_BUBBLE + EDGE;
    const max = containerWidth - HALF_BUBBLE - EDGE;
    bubbleX = min <= max ? Math.min(max, Math.max(min, targetPos.x)) : containerWidth / 2;
  }
  const tailShift = targetPos ? Math.max(-HALF_BUBBLE + 18, Math.min(HALF_BUBBLE - 18, targetPos.x - bubbleX)) : 0;

  // Not enough room above Oli (e.g. windowsill on short phones)? Show the bubble just below him instead.
  const BUBBLE_HEIGHT = 60;
  const below = Boolean(targetPos && targetPos.y - 12 < BUBBLE_HEIGHT);
  const tail = (
    <div
      style={{ transform: `translateX(${tailShift}px) rotate(${below ? 225 : 45}deg)` }}
      className={`h-2.5 w-2.5 border-r-2 border-b-2 border-amber-400 bg-white/96 ${below ? '-mb-1' : '-mt-1'}`}
    />
  );

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
          style={
            targetPos
              ? { left: `${bubbleX}px`, top: `${below ? targetPos.y + 64 : targetPos.y - 12}px` }
              : { left: pos.left, bottom: pos.bottom }
          }
          transition={{
            opacity: { duration: 0.22 },
            scale: { type: 'spring', stiffness: 340, damping: 22 },
            y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          title="Oli’s craving"
          aria-label={`${whim.label}. ${remainingMin}m left. Tap for 2× Joy and 1 Churu.`}
          className={`pointer-events-auto absolute z-30 flex w-max -translate-x-1/2 cursor-pointer flex-col items-center focus-visible:outline-2 focus-visible:outline-amber-500 ${
            targetPos && !below ? '-translate-y-full' : ''
          }`}
        >
          {below && tail}
          <div className="flex items-center gap-2 rounded-2xl border-2 border-amber-400 bg-white/96 px-3 py-1.5 text-amber-950 shadow-lg backdrop-blur-md">
            <span className="text-base leading-none">{whim.emoji}</span>
            <div className="flex flex-col items-start leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xs font-extrabold whitespace-nowrap">{whim.label}</span>
                <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                  {remainingMin}m
                </span>
              </div>
              <span className="text-[10px] font-extrabold whitespace-nowrap text-pink-600">
                2× Joy + 1 Churu 🍬
              </span>
            </div>
          </div>
          {/* Thought bubble pointer tail */}
          {!below && tail}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
