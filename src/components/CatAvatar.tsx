import { AnimatePresence, motion, type TargetAndTransition, type Transition } from 'framer-motion';
import { useEffect, useId, useMemo, useState } from 'react';
import type { CatAnimation, Mood } from '../types';

/**
 * Oli — hand-drawn SVG ginger cat.
 * Golden eyes, cream muzzle & bib, tabby stripes, tiny dark chin freckles and a
 * subtle ear tattoo inside both ears. Everything is animated with Framer Motion.
 */

const C = {
  coat: '#f08a3c',
  coatLight: '#f6a25c',
  stripe: '#d2681f',
  cream: '#fff1dc',
  creamShade: '#f6dcbc',
  innerEar: '#f5b0a4',
  nose: '#e7808a',
  line: '#6f3f27',
  pupil: '#22130a',
  irisEdge: '#b67700',
  freckle: '#5a321d',
  tattoo: '#34456b',
};

type EyeState = 'open' | 'wide' | 'halflid' | 'sad' | 'closed' | 'happy';
type MouthState = 'neutral' | 'smile' | 'chew' | 'yawn' | 'frown' | 'lap';

export interface CatAvatarProps {
  mood: Mood;
  animation: CatAnimation;
  /** Changes every time a new animation should (re)start. */
  animationKey: number;
  onPet?: () => void;
  className?: string;
  /** Placement when nested inside another SVG (scene overlay). */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

function expressionFor(mood: Mood, animation: CatAnimation, petting: boolean) {
  let eyes: EyeState = 'open';
  let mouth: MouthState = 'neutral';
  let earDroop = false;
  let blush = false;

  switch (mood) {
    case 'ecstatic':
      eyes = 'wide';
      mouth = 'smile';
      blush = true;
      break;
    case 'happy':
      mouth = 'smile';
      blush = true;
      break;
    case 'relaxed':
      eyes = 'halflid';
      mouth = 'smile';
      blush = true;
      break;
    case 'tired':
      eyes = 'halflid';
      break;
    case 'hungry':
    case 'thirsty':
    case 'sad':
    case 'grubby':
      eyes = 'sad';
      mouth = 'frown';
      earDroop = true;
      break;
    case 'sleeping':
      eyes = 'closed';
      mouth = 'smile';
      break;
    default:
      break;
  }

  switch (animation) {
    case 'eating':
    case 'eating_egg':
      eyes = 'happy';
      mouth = 'chew';
      break;
    case 'treat':
    case 'purring':
    case 'brushing':
      eyes = 'happy';
      mouth = 'smile';
      blush = true;
      earDroop = false;
      break;
    case 'drinking':
      eyes = 'halflid';
      mouth = 'lap';
      break;
    case 'playing':
      eyes = 'wide';
      mouth = 'smile';
      earDroop = false;
      break;
    case 'misting':
      eyes = 'halflid';
      mouth = 'smile';
      blush = true;
      break;
    case 'yawning':
      eyes = 'closed';
      mouth = 'yawn';
      break;
    default:
      break;
  }

  if (petting && mood !== 'sleeping') {
    eyes = 'happy';
    mouth = 'smile';
    blush = true;
  }
  return { eyes, mouth, earDroop, blush };
}

function headMotion(animation: CatAnimation, sec: number, sleeping: boolean): { animate: TargetAndTransition; transition: Transition } {
  if (sleeping) {
    return {
      animate: { rotate: [0, 1.5, 0], y: [0, 1.5, 0] },
      transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
    };
  }
  switch (animation) {
    case 'eating':
    case 'eating_egg':
      return {
        animate: { y: [0, 22, 15, 22, 15, 22, 15, 0], rotate: [0, 0, 2, -2, 2, -2, 0, 0] },
        transition: { duration: sec, ease: 'easeInOut' },
      };
    case 'treat':
      return {
        animate: { y: [0, 20, 13, 20, 0, -4, 0], rotate: [0, 0, 3, -3, 0, -8, 0] },
        transition: { duration: sec, ease: 'easeInOut' },
      };
    case 'drinking':
      return {
        animate: { y: [0, 24, 19, 24, 19, 24, 19, 24, 0] },
        transition: { duration: sec, ease: 'easeInOut' },
      };
    case 'purring':
      return {
        animate: { rotate: [0, -10, -6, -10, -6, -10, 0], y: [0, -4, -3, -4, -3, -4, 0] },
        transition: { duration: sec, ease: 'easeInOut' },
      };
    case 'playing':
      return {
        animate: { rotate: [0, -14, 14, -14, 14, -14, 14, 0], y: [0, -3, 0, -3, 0, -3, 0, 0] },
        transition: { duration: sec, ease: 'easeInOut' },
      };
    case 'misting':
      return {
        animate: { rotate: [0, -4, 0, -4, 0], y: [0, -3, 0, -2, 0] },
        transition: { duration: sec, ease: 'easeInOut' },
      };
    case 'brushing':
      return {
        animate: { rotate: [0, 8, 4, 8, 4, 8, 0] },
        transition: { duration: sec, ease: 'easeInOut' },
      };
    case 'yawning':
      return {
        animate: { rotate: [0, -6, -6, 0], y: [0, -5, -5, 0] },
        transition: { duration: sec, ease: 'easeInOut' },
      };
    default:
      return {
        animate: { rotate: [-2, 2, -2], y: [0, 0.8, 0] },
        transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
      };
  }
}

// -----------------------------------------------------------------------------
// Eyes
// -----------------------------------------------------------------------------

function Eye({
  cx,
  cy,
  state,
  blinking,
  side,
  uid,
  lookX,
  playing,
}: {
  cx: number;
  cy: number;
  state: EyeState;
  blinking: boolean;
  side: 'l' | 'r';
  uid: string;
  lookX: number;
  playing: boolean;
}) {
  if (state === 'closed') {
    return (
      <path d={`M${cx - 11} ${cy + 1} Q${cx} ${cy + 9} ${cx + 11} ${cy + 1}`} stroke={C.line} strokeWidth={2.6} fill="none" strokeLinecap="round" />
    );
  }
  if (state === 'happy') {
    return (
      <path d={`M${cx - 11} ${cy + 4} Q${cx} ${cy - 8} ${cx + 11} ${cy + 4}`} stroke={C.line} strokeWidth={2.8} fill="none" strokeLinecap="round" />
    );
  }

  const clipId = `${uid}-eye-${side}`;
  const wide = state === 'wide';
  const outer = side === 'l' ? -1 : 1;

  return (
    <motion.g animate={{ scaleY: blinking ? 0.08 : 1 }} transition={{ duration: 0.08 }}>
      <defs>
        <clipPath id={clipId}>
          <ellipse cx={cx} cy={cy} rx={12} ry={13} />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={cy} rx={12} ry={13} fill={`url(#${uid}-iris)`} stroke={C.irisEdge} strokeWidth={1.3} />
      <g clipPath={`url(#${clipId})`}>
        <motion.g
          animate={playing ? { x: [0, -4, 4, -4, 4, -4, 4, 0] } : { x: lookX }}
          transition={playing ? { duration: 3.2, ease: 'easeInOut' } : { type: 'spring', stiffness: 120, damping: 14 }}
        >
          <motion.ellipse
            cx={cx}
            cy={cy + 0.5}
            animate={{ rx: wide ? 7.2 : 4.2, ry: wide ? 10.5 : 9.6 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            fill={C.pupil}
          />
          <circle cx={cx - 3.8} cy={cy - 5} r={3.1} fill="#fff" />
          <circle cx={cx + 3.6} cy={cy + 4.2} r={1.3} fill="#fff" opacity={0.85} />
        </motion.g>
        {state === 'halflid' && (
          <path
            d={`M${cx - 14} ${cy - 15} H${cx + 14} V${cy - 1} Q${cx} ${cy + 3} ${cx - 14} ${cy - 1} Z`}
            fill={C.coat}
          />
        )}
        {state === 'sad' && (
          <path
            d={`M${cx - 14} ${cy - 15} H${cx + 14} V${cy - 15 + (outer > 0 ? 13 : 4)} L${cx - 14} ${cy - 15 + (outer > 0 ? 4 : 13)} Z`}
            fill={C.coat}
          />
        )}
      </g>
      {state === 'halflid' && (
        <path d={`M${cx - 12} ${cy - 1} Q${cx} ${cy + 3} ${cx + 12} ${cy - 1}`} stroke={C.line} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      )}
    </motion.g>
  );
}

function Mouth({ state }: { state: MouthState }) {
  const stroke = { stroke: C.line, strokeWidth: 1.9, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (state) {
    case 'smile':
      return <path d="M100 99 V102 M100 102 Q94 109 88 103 M100 102 Q106 109 112 103" {...stroke} />;
    case 'frown':
      return <path d="M100 99 V103 M92 108 Q100 102 108 108" {...stroke} />;
    case 'chew':
      return (
        <motion.g animate={{ scaleY: [1, 0.4, 1] }} transition={{ duration: 0.32, repeat: Infinity }}>
          <ellipse cx={100} cy={105} rx={5} ry={4} fill="#9b3d3d" />
          <path d="M100 99 V101" {...stroke} />
        </motion.g>
      );
    case 'lap':
      return (
        <g>
          <path d="M100 99 V102 M100 102 Q95 106 90 103 M100 102 Q105 106 110 103" {...stroke} />
          <motion.ellipse
            cx={100}
            cy={107}
            rx={3}
            fill="#f08a96"
            animate={{ ry: [0, 4, 0] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        </g>
      );
    case 'yawn':
      return (
        <motion.g initial={{ scaleY: 0.2 }} animate={{ scaleY: [0.2, 1, 1, 0.2] }} transition={{ duration: 1.5 }}>
          <ellipse cx={100} cy={107} rx={7} ry={8} fill="#8d3434" />
          <ellipse cx={100} cy={111} rx={4} ry={3} fill="#f08a96" />
        </motion.g>
      );
    default:
      return <path d="M100 99 V102 M100 102 Q95 107 90 104 M100 102 Q105 107 110 104" {...stroke} />;
  }
}

// -----------------------------------------------------------------------------
// Head
// -----------------------------------------------------------------------------

function Head({
  eyes,
  mouth,
  earDroop,
  earTwitch,
  blush,
  blinking,
  uid,
  playing,
}: {
  eyes: EyeState;
  mouth: MouthState;
  earDroop: boolean;
  earTwitch: boolean;
  blush: boolean;
  blinking: boolean;
  uid: string;
  playing: boolean;
}) {
  const earRot = earDroop ? 16 : 0;
  return (
    <g>
      {/* Ears (with tiny ID tattoos inside) */}
      <motion.g
        style={{ originX: 0.7, originY: 1 }}
        animate={{ rotate: -earRot + (earTwitch ? -9 : 0) }}
        transition={{ type: 'spring', stiffness: 260, damping: 12 }}
      >
        <path d="M50 66 L45 19 Q45 12 52 15 L90 40 Z" fill={C.coat} />
        <path d="M56 58 L53 25 L82 42 Z" fill={C.innerEar} />
        <path d="M55 50 l6 -4 M56 42 l5 -1" stroke={C.cream} strokeWidth={1.4} strokeLinecap="round" opacity={0.9} />
        <text
          x={63}
          y={46}
          fontSize={4.6}
          fontFamily="ui-monospace, monospace"
          fontWeight={700}
          fill={C.tattoo}
          opacity={0.55}
          transform="rotate(28 63 46)"
        >
          OL1
        </text>
      </motion.g>
      <motion.g
        style={{ originX: 0.3, originY: 1 }}
        animate={{ rotate: earRot }}
        transition={{ type: 'spring', stiffness: 260, damping: 12 }}
      >
        <path d="M150 66 L155 19 Q155 12 148 15 L110 40 Z" fill={C.coat} />
        <path d="M144 58 L147 25 L118 42 Z" fill={C.innerEar} />
        <path d="M145 50 l-6 -4 M144 42 l-5 -1" stroke={C.cream} strokeWidth={1.4} strokeLinecap="round" opacity={0.9} />
        <text
          x={128}
          y={50}
          fontSize={4.6}
          fontFamily="ui-monospace, monospace"
          fontWeight={700}
          fill={C.tattoo}
          opacity={0.55}
          transform="rotate(-28 133 46)"
        >
          2FX
        </text>
      </motion.g>

      {/* Head shape with cheek fluff */}
      <path
        d="M100 30 C137 30 161 52 161 82 C161 92 158 100 153 106 L160 110 L149 112 C141 119 125 124 100 124 C75 124 59 119 51 112 L40 110 L47 106 C42 100 39 92 39 82 C39 52 63 30 100 30 Z"
        fill={C.coat}
      />
      <ellipse cx={100} cy={58} rx={34} ry={18} fill={C.coatLight} opacity={0.45} />

      {/* Tabby "M" + cheek stripes */}
      <g stroke={C.stripe} strokeWidth={3.4} strokeLinecap="round" fill="none">
        <path d="M100 35 V50" />
        <path d="M89 37 Q91 45 94 50" />
        <path d="M111 37 Q109 45 106 50" />
        <path d="M44 82 Q52 81 57 85" />
        <path d="M45 94 Q52 91 58 94" />
        <path d="M156 82 Q148 81 143 85" />
        <path d="M155 94 Q148 91 142 94" />
      </g>

      {/* Muzzle + chin */}
      <ellipse cx={89} cy={101} rx={14} ry={11} fill={C.cream} />
      <ellipse cx={111} cy={101} rx={14} ry={11} fill={C.cream} />
      <ellipse cx={100} cy={112} rx={11} ry={8} fill={C.cream} />

      {/* Blush */}
      <motion.g animate={{ opacity: blush ? 1 : 0 }} transition={{ duration: 0.4 }}>
        <ellipse cx={63} cy={98} rx={8} ry={4.5} fill="#ff8fa3" opacity={0.45} />
        <ellipse cx={137} cy={98} rx={8} ry={4.5} fill="#ff8fa3" opacity={0.45} />
      </motion.g>

      {/* Eyes */}
      <Eye cx={76} cy={80} state={eyes} blinking={blinking} side="l" uid={uid} lookX={0} playing={playing} />
      <Eye cx={124} cy={80} state={eyes} blinking={blinking} side="r" uid={uid} lookX={0} playing={playing} />

      {/* Nose + mouth */}
      <path d="M93.5 92 H106.5 C106.5 96 102.5 99.5 100 99.5 C97.5 99.5 93.5 96 93.5 92 Z" fill={C.nose} />
      <ellipse cx={98} cy={93.5} rx={2} ry={1} fill="#fff" opacity={0.5} />
      <Mouth state={mouth} />

      {/* Tiny dark chin freckles */}
      <g fill={C.freckle}>
        <circle cx={95.5} cy={114} r={1.25} />
        <circle cx={100.5} cy={116.5} r={1.3} />
        <circle cx={105} cy={113.5} r={1.1} />
        <circle cx={98.5} cy={111.5} r={0.8} />
      </g>

      {/* Whiskers */}
      <motion.g
        stroke="#fffaf2"
        strokeWidth={1.1}
        strokeLinecap="round"
        animate={{ rotate: [0, -2, 0, 1.5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M78 101 L52 96" />
        <path d="M78 105 L50 106" />
        <path d="M79 109 L54 115" />
        <path d="M122 101 L148 96" />
        <path d="M122 105 L150 106" />
        <path d="M121 109 L146 115" />
      </motion.g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// Props & effects (bowl, fountain dish, feather wand, brush, Zzz)
// -----------------------------------------------------------------------------

function FoodBowl({ kind, sec }: { kind: 'wet' | 'heart' | 'egg'; sec: number }) {
  return (
    <motion.g initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }} transition={{ duration: 0.3 }}>
      <path d="M68 199 H132 L125 216 H75 Z" fill="#c4ced8" />
      <path d="M75 212 H125 L124 216 H76 Z" fill="#a9b5c1" />
      <ellipse cx={100} cy={199} rx={32} ry={5.5} fill="#e9eef3" />
      <motion.g initial={{ scale: 1 }} animate={{ scale: [1, 1, 0.25] }} transition={{ duration: sec, times: [0, 0.3, 1] }}>
        {kind === 'wet' && <ellipse cx={100} cy={198.5} rx={24} ry={4} fill="#a55a35" />}
        {kind === 'heart' && <path d="M100 202 C92 196 92 191 96 191 C98 191 100 193 100 194 C100 193 102 191 104 191 C108 191 108 196 100 202 Z" fill="#8c2a2a" />}
        {kind === 'egg' && (
          <g>
            <ellipse cx={100} cy={198.5} rx={22} ry={3.5} fill="#a55a35" />
            <ellipse cx={100} cy={196} rx={7} ry={3.5} fill="#fff8e6" />
            <circle cx={100} cy={196} r={2.4} fill="#f6c343" />
          </g>
        )}
      </motion.g>
    </motion.g>
  );
}

function WaterDish() {
  return (
    <motion.g initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }} transition={{ duration: 0.3 }}>
      <path d="M66 199 H134 L127 216 H73 Z" fill="#cfd8e1" />
      <path d="M66 199 H134 L133 202 H67 Z" fill="#f2f6f9" />
      <ellipse cx={100} cy={199} rx={33} ry={5.5} fill="#e9eef3" />
      <ellipse cx={100} cy={199} rx={27} ry={4} fill="#8fd3f4" />
      {[0, 0.5, 1].map((d) => (
        <motion.ellipse
          key={d}
          cx={100}
          cy={199}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1}
          initial={{ rx: 2, ry: 0.6, opacity: 0.9 }}
          animate={{ rx: 26, ry: 3.8, opacity: 0 }}
          transition={{ duration: 1.4, repeat: Infinity, delay: d, ease: 'easeOut' }}
        />
      ))}
      {/* Fountain bubbler */}
      <rect x={96} y={190} width={8} height={9} rx={2} fill="#b8c4cf" />
      <motion.path
        d="M100 190 Q100 184 100 186"
        stroke="#bfe8fb"
        strokeWidth={3}
        strokeLinecap="round"
        animate={{ d: ['M100 190 Q100 184 100 186', 'M100 190 Q101 181 100 184', 'M100 190 Q100 184 100 186'] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
    </motion.g>
  );
}

function FeatherWand({ sec }: { sec: number }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, rotate: [-22, 22, -22, 22, -22, 22, -10] }}
      exit={{ opacity: 0 }}
      transition={{ duration: sec, ease: 'easeInOut' }}
      style={{ originX: 1, originY: 0 }}
    >
      <path d="M232 -30 Q190 0 150 36" stroke="#8d6748" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d="M150 36 Q140 42 138 54" stroke="#cfc3b5" strokeWidth={1} fill="none" />
      <g transform="translate(138 54)">
        <path d="M0 0 C-10 6 -14 20 -8 32 C-2 22 4 12 0 0 Z" fill="#ef5f8f" />
        <path d="M0 0 C8 8 10 22 2 30 C0 20 -2 10 0 0 Z" fill="#45b7c9" />
        <path d="M0 0 C-3 10 -3 20 -2 28" stroke="#fff" strokeWidth={0.8} fill="none" />
      </g>
    </motion.g>
  );
}

function Brush({ sec }: { sec: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: [10, -26, 10, -26, 10, -26, 10], y: [0, 14, 0, 14, 0, 14, 0], rotate: [-8, 4, -8, 4, -8, 4, -8] }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: sec, ease: 'easeInOut' }}
    >
      <g transform="translate(150 130) rotate(-30)">
        <rect x={0} y={0} width={34} height={12} rx={5} fill="#c48a5a" />
        <rect x={30} y={3} width={30} height={6} rx={3} fill="#a46e43" />
        {Array.from({ length: 7 }).map((_, i) => (
          <path key={i} d={`M${3 + i * 4.6} 12 v6`} stroke="#5a4636" strokeWidth={1.4} strokeLinecap="round" />
        ))}
      </g>
    </motion.g>
  );
}

function SleepZzz() {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <motion.text
          key={i}
          x={132}
          y={114}
          fontFamily="Fredoka, sans-serif"
          fontWeight={700}
          fontSize={13 + i * 4}
          fill="#e0e7ff"
          stroke="#4338ca"
          strokeWidth={0.8}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], x: [0, 10, 20, 30], y: [0, -22, -44, -66] }}
          transition={{ duration: 3.4, repeat: Infinity, delay: i * 1.1, ease: 'easeOut' }}
        >
          z
        </motion.text>
      ))}
    </g>
  );
}

function PurrWaves() {
  return (
    <g stroke="#ffb27a" strokeWidth={2} fill="none" strokeLinecap="round">
      {[0, 0.35, 0.7].map((d) => (
        <g key={d}>
          <motion.path
            d="M36 110 Q30 118 36 126"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: [0, 1, 0], x: [-0, -12] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: d }}
          />
          <motion.path
            d="M164 110 Q170 118 164 126"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: [0, 1, 0], x: [0, 12] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: d }}
          />
        </g>
      ))}
    </g>
  );
}

// -----------------------------------------------------------------------------
// Poses
// -----------------------------------------------------------------------------

function TailStripes({ d, width }: { d: string; width: number }) {
  return (
    <>
      <path d={d} stroke={C.coat} strokeWidth={width} fill="none" strokeLinecap="round" />
      <path d={d} stroke={C.stripe} strokeWidth={width} fill="none" strokeDasharray="5 9" opacity={0.65} />
    </>
  );
}

export function CatAvatar({ mood, animation, animationKey, onPet, className, x, y, width, height }: CatAvatarProps) {
  const rawId = useId();
  const uid = useMemo(() => `oli${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [rawId]);
  const sleeping = mood === 'sleeping';
  const [blinking, setBlinking] = useState(false);
  const [earTwitch, setEarTwitch] = useState(false);
  const [petting, setPetting] = useState(false);
  const [activeAnim, setActiveAnim] = useState<CatAnimation>('idle');
  const [animSec, setAnimSec] = useState(2.5);

  // Map incoming animation trigger → timed active animation.
  useEffect(() => {
    if (animation === 'idle') return;
    const durations: Record<CatAnimation, number> = {
      idle: 0,
      eating: 2.6,
      eating_egg: 2.4,
      treat: 2.2,
      drinking: 2.8,
      purring: 3,
      playing: 3.2,
      misting: 2.6,
      brushing: 2.8,
      yawning: 1.6,
    };
    const sec = durations[animation];
    setActiveAnim(animation);
    setAnimSec(sec);
    const t = window.setTimeout(() => setActiveAnim('idle'), sec * 1000);
    return () => window.clearTimeout(t);
  }, [animation, animationKey]);

  // Random natural blinking.
  useEffect(() => {
    let alive = true;
    let timer: number;
    const loop = () => {
      timer = window.setTimeout(() => {
        if (!alive) return;
        setBlinking(true);
        window.setTimeout(() => alive && setBlinking(false), 140);
        // Occasional double blink.
        if (Math.random() < 0.25) {
          window.setTimeout(() => alive && setBlinking(true), 300);
          window.setTimeout(() => alive && setBlinking(false), 440);
        }
        loop();
      }, 2200 + Math.random() * 3800);
    };
    loop();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);

  // Random ear twitch.
  useEffect(() => {
    let alive = true;
    let timer: number;
    const loop = () => {
      timer = window.setTimeout(() => {
        if (!alive) return;
        setEarTwitch(true);
        window.setTimeout(() => alive && setEarTwitch(false), 220);
        loop();
      }, 5000 + Math.random() * 7000);
    };
    loop();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);

  const handlePet = () => {
    if (petting) return;
    setPetting(true);
    window.setTimeout(() => setPetting(false), 1100);
    onPet?.();
  };

  const anim = sleeping && activeAnim !== 'misting' ? 'idle' : activeAnim;
  const expr = expressionFor(mood, anim, petting);
  const head = headMotion(anim, animSec, sleeping);
  const sad = expr.earDroop;

  const tailSpeed = anim === 'playing' ? 0.7 : mood === 'ecstatic' || mood === 'happy' ? 2.2 : sad ? 5 : 3.4;

  const headProps = {
    eyes: expr.eyes,
    mouth: expr.mouth,
    earDroop: expr.earDroop,
    earTwitch,
    blush: expr.blush,
    blinking: blinking && !sleeping,
    uid,
    playing: anim === 'playing',
  };

  return (
    <svg
      viewBox="0 0 200 220"
      x={x}
      y={y}
      width={width}
      height={height}
      className={className}
      style={{ overflow: 'visible' }}
      role="img"
      aria-label={`Oli the ginger cat, ${mood}`}
    >
      <defs>
        <radialGradient id={`${uid}-iris`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#ffe36b" />
          <stop offset="60%" stopColor="#f7bd12" />
          <stop offset="100%" stopColor="#e09a00" />
        </radialGradient>
      </defs>

      <motion.g
        onPointerDown={handlePet}
        style={{ cursor: 'pointer' }}
        animate={
          anim === 'playing'
            ? { y: [0, -12, 0, -16, 0, -10, 0] }
            : petting
              ? { y: [0, -6, 0] }
              : anim === 'purring'
                ? { x: [0, -0.7, 0.7, -0.7, 0.7, 0] }
                : { y: 0, x: 0 }
        }
        transition={
          anim === 'purring'
            ? { duration: 0.18, repeat: Math.round(animSec / 0.18) }
            : { duration: anim === 'playing' ? animSec : 0.5, ease: 'easeInOut' }
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {sleeping ? (
            <motion.g key="loaf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
              <ellipse cx={100} cy={206} rx={80} ry={8} fill="rgba(40,20,10,0.22)" />
              <motion.g
                style={{ originY: 1 }}
                animate={{ scaleY: [1, 1.05, 1] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M26 198 C22 160 60 136 102 136 C144 136 180 160 175 198 C174 206 28 206 26 198 Z" fill={C.coat} />
                <g stroke={C.stripe} strokeWidth={3.6} strokeLinecap="round" fill="none" opacity={0.85}>
                  <path d="M70 142 Q74 152 70 160" />
                  <path d="M100 138 Q104 148 100 156" />
                  <path d="M130 142 Q134 152 130 160" />
                  <path d="M156 156 Q156 166 150 172" />
                </g>
              </motion.g>
              <TailStripes d="M168 194 C172 212 120 214 96 210 C80 208 64 206 56 200" width={13} />
              <ellipse cx={82} cy={200} rx={11} ry={5} fill={C.cream} />
              <ellipse cx={112} cy={201} rx={11} ry={5} fill={C.cream} />
              <g transform="translate(-4 62) rotate(-10 100 80)">
                <motion.g animate={head.animate} transition={head.transition}>
                  <Head {...headProps} />
                </motion.g>
              </g>
              <SleepZzz />
            </motion.g>
          ) : (
            <motion.g key="sit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
              <ellipse cx={100} cy={209} rx={64} ry={8} fill="rgba(40,20,10,0.2)" />

              {/* Tail */}
              <motion.g
                style={{ originX: 0.05, originY: 0.95 }}
                animate={sad ? { rotate: [18, 22, 18] } : { rotate: [-7, 10, -7] }}
                transition={{ duration: tailSpeed, repeat: Infinity, ease: 'easeInOut' }}
              >
                <TailStripes d="M140 197 C172 197 188 172 182 142 C179 126 170 117 160 120" width={15} />
              </motion.g>

              {/* Body (breathing) */}
              <motion.g
                style={{ originY: 1 }}
                animate={{ scaleY: [1, 1.028, 1], scaleX: [1, 1.01, 1] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M66 112 C46 136 37 176 47 198 C53 209 147 209 153 198 C163 176 154 136 134 112 Z" fill={C.coat} />
                <ellipse cx={58} cy={188} rx={19} ry={17} fill={C.coat} />
                <ellipse cx={142} cy={188} rx={19} ry={17} fill={C.coat} />
                <g stroke={C.stripe} strokeWidth={3.5} strokeLinecap="round" fill="none">
                  <path d="M51 150 Q60 147 66 152" />
                  <path d="M47 166 Q57 162 65 167" />
                  <path d="M149 150 Q140 147 134 152" />
                  <path d="M153 166 Q143 162 135 167" />
                  <path d="M44 190 Q52 176 70 176" opacity={0.55} />
                  <path d="M156 190 Q148 176 130 176" opacity={0.55} />
                </g>
                <path d="M82 116 C71 140 73 176 100 186 C127 176 129 140 118 116 Z" fill={C.cream} />
                <path d="M88 126 l4 4 l4 -4 l4 4 l4 -4 l4 4" stroke={C.creamShade} strokeWidth={1.4} fill="none" strokeLinecap="round" />
                {/* Front legs + paws */}
                <rect x={73} y={150} width={19} height={54} rx={9.5} fill={C.coat} />
                <rect x={108} y={150} width={19} height={54} rx={9.5} fill={C.coat} />
                <path d="M74 168 h17 M74 180 h17 M109 168 h17 M109 180 h17" stroke={C.stripe} strokeWidth={2.4} strokeLinecap="round" opacity={0.6} />
                <ellipse cx={83} cy={203} rx={13} ry={8} fill={C.cream} />
                <ellipse cx={117} cy={203} rx={13} ry={8} fill={C.cream} />
                <path d="M79 200 v5 M85 200 v5 M113 200 v5 M119 200 v5" stroke={C.creamShade} strokeWidth={1.4} strokeLinecap="round" />
              </motion.g>

              {/* Head */}
              <motion.g key={`head-${animationKey}-${anim}`} style={{ originX: 0.5, originY: 1 }} animate={head.animate} transition={head.transition}>
                <Head {...headProps} />
              </motion.g>

              {anim === 'purring' && <PurrWaves />}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Props */}
        <AnimatePresence>
          {(anim === 'eating' || anim === 'eating_egg' || anim === 'treat') && (
            <FoodBowl key="bowl" kind={anim === 'treat' ? 'heart' : anim === 'eating_egg' ? 'egg' : 'wet'} sec={animSec} />
          )}
          {anim === 'drinking' && <WaterDish key="dish" />}
          {anim === 'playing' && <FeatherWand key="wand" sec={animSec} />}
          {anim === 'brushing' && <Brush key="brush" sec={animSec} />}
        </AnimatePresence>
      </motion.g>
    </svg>
  );
}

export default CatAvatar;
