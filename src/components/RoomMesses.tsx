import { AnimatePresence, motion } from 'framer-motion';
import type { RoomMess } from '../types';

/**
 * Screen-safe rug positions inside the Center Stage (directly above ActionDock,
 * flanking Oli on the rug at z-20 so they can never be hidden behind CatAvatar,
 * ActionDock, or clipped by SVG aspect-ratio slicing).
 */
const SLOT_STYLES: Record<0 | 1 | 2, { left?: string; right?: string; bottom: string }> = {
  0: { right: '9%', bottom: '24px' },
  1: { left: '9%', bottom: '24px' },
  2: { right: '23%', bottom: '6px' },
};

export function RoomMesses({
  messes,
  onClean,
}: {
  messes: RoomMess[];
  onClean: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
      <AnimatePresence>
        {messes.map((mess) => {
          const pos = SLOT_STYLES[mess.slot] ?? SLOT_STYLES[0];
          const isFurClump = mess.kind === 'fur_clump';
          return (
            <motion.button
              key={mess.id}
              type="button"
              initial={{ opacity: 0, scale: 0.3, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.2, y: -16 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              onClick={() => onClean(mess.id)}
              style={pos}
              aria-label={isFurClump ? 'Sweep up fluffy ginger fur clump' : 'Clean up cat throw-up'}
              title="Tap to clean up!"
              className="pointer-events-auto absolute flex h-16 w-16 cursor-pointer flex-col items-center justify-center focus:outline-none"
            >
              <svg viewBox="-26 -32 52 48" className="h-full w-full overflow-visible drop-shadow-sm">
                {/* Pulsing attention ring on the rug */}
                <motion.ellipse
                  cx="0"
                  cy="5"
                  rx="19"
                  ry="8.5"
                  fill={isFurClump ? 'rgba(254, 215, 170, 0.22)' : 'rgba(101, 163, 13, 0.18)'}
                  stroke={isFurClump ? '#f97316' : '#65a30d'}
                  strokeWidth="1.5"
                  strokeDasharray="3.5 2.5"
                  animate={{ scale: [0.94, 1.12, 0.94], opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Ground shadow: soft and airy for fur, flatter & darker for throw-up */}
                <ellipse
                  cx="0"
                  cy="6.5"
                  rx={isFurClump ? 12 : 14}
                  ry={isFurClump ? 3.6 : 4.8}
                  fill={isFurClump ? 'rgba(180, 110, 50, 0.14)' : 'rgba(45,30,18,0.26)'}
                />

                {isFurClump ? (
                  /* Cute, airy, cloud-like ginger fur tumbleweed */
                  <g>
                    {/* Soft pillowy fluff lobes */}
                    <circle cx="-5" cy="2" r="6.2" fill="#fed7aa" />
                    <circle cx="5" cy="2" r="6.5" fill="#fde68a" />
                    <circle cx="0" cy="-2.5" r="7.2" fill="#fff7ed" />
                    <circle cx="-3.5" cy="-4" r="5.2" fill="#ffedd5" />
                    <circle cx="3.8" cy="-3.8" r="5" fill="#fffbeb" />
                    <circle cx="0" cy="1" r="5.5" fill="#ffffff" opacity="0.95" />

                    {/* Fine wispy ginger cat hairs radiating outward like dandelion fluff */}
                    <g stroke="#f59e0b" strokeWidth="1.1" strokeLinecap="round" fill="none">
                      <path d="M-8 -1 Q-14 -4 -17 -1" />
                      <path d="M-6 -6 Q-12 -11 -15 -8" />
                      <path d="M-2 -8 Q-1 -15 3 -14" />
                      <path d="M4 -7 Q9 -14 14 -11" />
                      <path d="M7 -2 Q14 -5 18 -1" />
                      <path d="M7 2 Q14 6 16 9" />
                      <path d="M3 6 Q7 11 11 10" />
                      <path d="M-3 6 Q-7 11 -11 9" />
                      <path d="M-7 3 Q-13 6 -16 4" />
                    </g>

                    {/* Delicate peach/cream hair accents and highlights */}
                    <g stroke="#ea580c" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.75">
                      <path d="M-10 1 Q-15 3 -16 1" />
                      <path d="M8 0 Q15 1 17 3" />
                      <path d="M1 -9 Q5 -12 7 -10" />
                    </g>
                    <g stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none">
                      <path d="M-4 -3 Q-1 -7 3 -5" />
                      <path d="M-3 0 Q0 3 4 1" />
                      <path d="M-5 2 Q-2 4 1 3" />
                    </g>
                  </g>
                ) : (
                  /* Cat throw-up / puke splat on the rug */
                  <g>
                    <path
                      d="M-13 2.5 C-15 -2.5 -8.5 -6 -3.5 -4.8 C0 -7.2 7 -7.2 10.5 -3.5 C15 -2.5 15 3.5 10.5 6 C7 8.2 1.2 7.2 -3.5 8.2 C-9.5 8.2 -12 6 -13 2.5 Z"
                      fill="#9cb83c"
                      stroke="#4d5e14"
                      strokeWidth="1.3"
                    />
                    <ellipse cx="-1" cy="1.2" rx="7.8" ry="3.6" fill="#b8d152" opacity="0.9" />
                    {/* Undigested treat / kibble specks */}
                    <circle cx="-5" cy="1.2" r="1.9" fill="#b45309" />
                    <circle cx="3.5" cy="2.6" r="1.7" fill="#c26a27" />
                    <circle cx="0.6" cy="-1.2" r="1.5" fill="#d97706" />
                    {/* Splatter droplets */}
                    <circle cx="-15.5" cy="4.8" r="1.7" fill="#9cb83c" stroke="#4d5e14" strokeWidth="0.8" />
                    <circle cx="15" cy="3.5" r="1.5" fill="#9cb83c" stroke="#4d5e14" strokeWidth="0.8" />
                  </g>
                )}

                {/* Animated rising particles above the mess */}
                {isFurClump ? (
                  /* Floating shed fur dandelion seeds & sparkling fluff */
                  <g>
                    {/* Wisp 1: soft floating fuzz seed */}
                    <motion.g
                      animate={{ y: [0, -9, 0], opacity: [0.35, 1, 0.35], x: [0, 2, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: 0, ease: 'easeInOut' }}
                    >
                      <circle cx="-5" cy="-14" r="1.6" fill="#fffbeb" stroke="#fbbf24" strokeWidth="0.7" />
                      <path d="M-6.5 -15.5 L-8 -17 M-3.5 -15.5 L-2 -17" stroke="#f59e0b" strokeWidth="0.6" strokeLinecap="round" />
                    </motion.g>

                    {/* Wisp 2: tiny sparkling star in the air */}
                    <motion.path
                      d="M1 -17 L2 -15 L4 -14 L2 -13 L1 -11 L0 -13 L-2 -14 L0 -15 Z"
                      fill="#fde047"
                      animate={{ y: [0, -11, 0], opacity: [0.3, 0.95, 0.3], scale: [0.85, 1.15, 0.85] }}
                      transition={{ duration: 2.1, repeat: Infinity, delay: 0.35, ease: 'easeInOut' }}
                    />

                    {/* Wisp 3: soft floating fluff seed */}
                    <motion.g
                      animate={{ y: [0, -8, 0], opacity: [0.4, 0.95, 0.4], x: [0, -2, 0] }}
                      transition={{ duration: 1.7, repeat: Infinity, delay: 0.65, ease: 'easeInOut' }}
                    >
                      <circle cx="6" cy="-14" r="1.5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.7" />
                      <path d="M4.5 -15.5 L3.5 -17 M7.5 -15.5 L8.5 -17" stroke="#f59e0b" strokeWidth="0.6" strokeLinecap="round" />
                    </motion.g>
                  </g>
                ) : (
                  /* Animated stink waves rising above throw-up */
                  [-6, 0, 6].map((dx, i) => (
                    <motion.path
                      key={i}
                      d={`M${dx} -13 Q${dx - 2.5} -17.5 ${dx} -21 Q${dx + 2.5} -24.5 ${dx} -28`}
                      stroke="#65a30d"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      fill="none"
                      animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.28, ease: 'easeInOut' }}
                    />
                  ))
                )}
              </svg>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
