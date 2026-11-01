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
              aria-label={isFurClump ? 'Sweep up ginger fur tumbleweed' : 'Clean up cat throw-up'}
              title="Tap to clean up!"
              className="pointer-events-auto absolute flex h-16 w-16 cursor-pointer flex-col items-center justify-center focus:outline-none"
            >
              <svg viewBox="-26 -32 52 48" className="h-full w-full overflow-visible drop-shadow-md">
                {/* Pulsing attention ring on the rug */}
                <motion.ellipse
                  cx="0"
                  cy="5"
                  rx="19"
                  ry="8.5"
                  fill={isFurClump ? 'rgba(249, 115, 22, 0.13)' : 'rgba(101, 163, 13, 0.18)'}
                  stroke={isFurClump ? '#ea580c' : '#65a30d'}
                  strokeWidth="1.5"
                  strokeDasharray="3.5 2.5"
                  animate={{ scale: [0.94, 1.12, 0.94], opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Ground shadow */}
                <ellipse cx="0" cy="6.5" rx="14" ry="4.8" fill="rgba(45,30,18,0.26)" />

                {isFurClump ? (
                  /* Cute fluffy ginger shed fur tumbleweed */
                  <g>
                    {/* Fluffy ginger fur cluster */}
                    <ellipse cx="-4" cy="3" rx="7.5" ry="5.5" fill="#d97706" />
                    <ellipse cx="4" cy="3" rx="8" ry="6" fill="#ea580c" />
                    <ellipse cx="0" cy="-1" rx="9" ry="6.5" fill="#f59e0b" />
                    <ellipse cx="-2.5" cy="-2.5" rx="6.5" ry="4.5" fill="#fbbf24" />
                    {/* Wispy loose ginger fur strands sticking out */}
                    <g stroke="#b45309" strokeWidth="1.3" strokeLinecap="round" fill="none">
                      <path d="M-8 0 Q-12 -3 -15 -1" />
                      <path d="M6 -2 Q12 -6 15 -3" />
                      <path d="M-2 -7 Q0 -13 4 -12" />
                      <path d="M-6 4 Q-11 7 -14 5" />
                      <path d="M5 4 Q10 8 13 6" />
                    </g>
                    {/* Cream chest-fluff highlight strands */}
                    <g stroke="#fffbeb" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.9">
                      <path d="M-3 -3 Q-1 -6 2 -5" />
                      <path d="M-1 1 Q2 0 4 2" />
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
                  /* Floating shed fur fluff particles */
                  [-6, 1, 7].map((dx, i) => (
                    <motion.circle
                      key={i}
                      cx={dx}
                      cy={-14}
                      r={1.3}
                      fill="#f59e0b"
                      animate={{ y: [0, -8, 0], opacity: [0.35, 0.95, 0.35], x: [0, i % 2 === 0 ? 2 : -2, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.32, ease: 'easeInOut' }}
                    />
                  ))
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
