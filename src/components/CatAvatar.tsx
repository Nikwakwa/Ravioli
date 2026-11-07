import { AnimatePresence, motion, type TargetAndTransition, type Transition } from 'framer-motion';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CatAnimation, Mood } from '../types';

/**
 * Oli — hand-drawn SVG ginger cat.
 * Warm amber eyes, white muzzle & bib, tabby stripes, tiny dark chin freckles, a
 * subtle ear tattoo inside both ears and a ringed tail with a white tip (as in
 * Oli's real photos). Deliberately kept simple & cute — not every real-life
 * detail belongs on the avatar. Everything is animated with Framer Motion.
 */

const C = {
  coat: '#f08a3c',
  coatLight: '#f6a25c',
  stripe: '#d2681f',
  cream: '#fff6ea',
  creamShade: '#f3dcc0',
  innerEar: '#f5b0a4',
  nose: '#e7808a',
  line: '#6f3f27',
  pupil: '#22130a',
  irisEdge: '#b06d00',
  freckle: '#5a321d',
  tattoo: '#34456b',
};

type EyeState = 'open' | 'wide' | 'halflid' | 'sad' | 'closed' | 'happy';
type MouthState = 'neutral' | 'smile' | 'chew' | 'yawn' | 'frown' | 'lap';

export type CatPose = 'sit' | 'loaf' | 'look_out' | 'belly_up';

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
  pose?: CatPose;
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
    case 'deceased':
      eyes = 'closed';
      mouth = 'neutral';
      earDroop = true;
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
    case 'churu':
      eyes = 'happy';
      mouth = 'lap';
      blush = true;
      earDroop = false;
      break;
    case 'drinking':
      eyes = 'halflid';
      mouth = 'lap';
      break;
    case 'playing':
    case 'laser':
    case 'tail_chase':
    case 'red_ball':
      eyes = 'wide';
      mouth = 'smile';
      earDroop = false;
      break;
    case 'refuse':
      eyes = 'sad';
      mouth = 'frown';
      earDroop = true;
      blush = false;
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
    case 'churu':
      return {
        animate: { y: [0, -3, 1, -3, 1, -3, 0], rotate: [0, 5, 2, 5, 2, 5, 0] },
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
    case 'laser':
      return {
        animate: { rotate: [0, -14, 14, -14, 14, -14, 14, 0], y: [0, -3, 0, -3, 0, -3, 0, 0] },
        transition: { duration: sec, ease: 'easeInOut' },
      };
    case 'tail_chase':
      return {
        animate: {
          x: [0, 12, -10, 14, -8, 12, 0],
          y: [0, 5, -2, 6, -2, 4, 0],
          rotate: [0, 18, -14, 20, -12, 16, 0],
        },
        transition: { duration: sec, ease: 'easeInOut' },
      };
    case 'red_ball':
      return {
        animate: {
          x: [0, -10, 12, -12, 10, -6, 0],
          y: [0, 8, -4, 10, -4, 6, 0],
          rotate: [0, -12, 12, -14, 12, -8, 0],
        },
        transition: { duration: sec, ease: 'easeInOut' },
      };
    case 'refuse':
      return {
        animate: { x: [0, -9, 9, -9, 9, -5, 5, 0], rotate: [0, -6, 6, -6, 6, -3, 3, 0] },
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
            animate={{ rx: wide ? 7.6 : 5.2, ry: wide ? 10.5 : 9.6 }}
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
          <path d="M95 100.5 L96.3 104.5 L97.6 100.8 Z M105 100.5 L103.7 104.5 L102.4 100.8 Z" fill="#fff" />
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

function LaserDot({ sec }: { sec: number }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 1, 1, 1, 0],
        x: [-42, 46, -34, 48, -28, 36, 0],
        y: [2, -6, 6, -4, 4, 0, 2],
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: sec, ease: 'easeInOut' }}
    >
      <circle cx={100} cy={205} r={8} fill="#ff1e42" opacity={0.28} />
      <circle cx={100} cy={205} r={4.5} fill="#ff1e42" opacity={0.65} />
      <circle cx={100} cy={205} r={2.2} fill="#fff5f7" />
    </motion.g>
  );
}

function RedBallToy({ sec }: { sec: number }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 1, 1, 1, 1, 0],
        x: [-36, 38, -28, 34, -18, 12, 0],
        y: [0, -16, 0, -14, 0, -8, 0],
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: sec, ease: 'easeInOut' }}
    >
      {/* Floor shadow */}
      <ellipse cx={100} cy={211} rx={9} ry={3} fill="rgba(40,20,10,0.22)" />
      {/* Glossy small red ball */}
      <circle cx={100} cy={202} r={9.5} fill="#e11d48" stroke="#9f1239" strokeWidth={1.2} />
      <path d="M93 197 Q100 202 107 197" stroke="#fb7185" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.85} />
      <circle cx={96.5} cy={198} r={2.6} fill="#fff1f2" opacity={0.9} />
    </motion.g>
  );
}

function TailSpinSwirl({ sec }: { sec: number }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.9, 0.9, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: sec, ease: 'easeInOut' }}
    >
      <motion.ellipse
        cx={112}
        cy={175}
        rx={58}
        ry={18}
        fill="none"
        stroke="#fbbf24"
        strokeWidth={2.2}
        strokeDasharray="12 10"
        strokeLinecap="round"
        animate={{ strokeDashoffset: [0, -64] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
      />
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

function ChuruTube({ sec }: { sec: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, x: 24, y: 10 }}
      animate={{
        opacity: 1,
        x: [14, 2, 4, 2, 4, 2, 14],
        y: [6, 0, 2, 0, 2, 0, 6],
      }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: sec, ease: 'easeInOut' }}
    >
      {/* Angled tube pointing right at Oli's mouth (100, 108) */}
      <g transform="translate(106 108) rotate(24)">
        {/* Creamy purée dollop at tip */}
        <motion.ellipse
          cx={-3}
          cy={0}
          rx={5.5}
          ry={4}
          fill="#f7d9b5"
          stroke="#e2b98b"
          strokeWidth={0.8}
          animate={{ scale: [1, 1.2, 0.85, 1.15, 0.7] }}
          transition={{ duration: sec, ease: 'easeInOut' }}
        />
        {/* Narrow nozzle */}
        <rect x={0} y={-4} width={10} height={8} rx={2} fill="#fff5eb" stroke="#e56b86" strokeWidth={0.8} />
        {/* Main Churu sachet body */}
        <path d="M8 -8 L64 -10 L64 10 L8 8 Z" fill="#ef5b82" />
        <path d="M22 -8.6 L48 -9.4 L48 9.4 L22 8.6 Z" fill="#fff8f0" />
        {/* Gold accent stripe */}
        <rect x={20} y={-8.6} width={2.5} height={17.2} fill="#f4b942" />
        <rect x={47.5} y={-9.4} width={2.5} height={18.8} fill="#f4b942" />
        {/* CHURU label */}
        <text
          x={35}
          y={2.5}
          textAnchor="middle"
          fontSize={6.2}
          fontFamily="Fredoka, sans-serif"
          fontWeight={700}
          fill="#d93864"
        >
          CHURU
        </text>
        {/* Crimped bottom seal */}
        <rect x={63} y={-10.5} width={5} height={21} rx={1.5} fill="#d93864" />
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
      <path d={d} stroke={C.stripe} strokeWidth={width} fill="none" pathLength={100} strokeDasharray="6 6" opacity={0.75} />
      {/* Soft white tail tip, like the real Oli */}
      <path d={d} stroke={C.cream} strokeWidth={width} fill="none" strokeLinecap="round" pathLength={100} strokeDasharray="10 90" strokeDashoffset={10} />
    
    </>
  );
}

export function CatAvatar({ mood, animation, animationKey, onPet, className, x, y, width, height, pose }: CatAvatarProps) {
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
      churu: 3.0,
      drinking: 2.8,
      purring: 3,
      playing: 3.2,
      laser: 3.2,
      tail_chase: 3.0,
      red_ball: 3.2,
      misting: 2.6,
      brushing: 2.8,
      yawning: 1.6,
      refuse: 1.4,
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

  const pettingTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    return () => window.clearTimeout(pettingTimerRef.current);
  }, []);

  const handlePet = () => {
    if (petting) return;
    setPetting(true);
    window.clearTimeout(pettingTimerRef.current);
    pettingTimerRef.current = window.setTimeout(() => setPetting(false), 1100);
    onPet?.();
  };

  const anim = sleeping && activeAnim !== 'misting' ? 'idle' : activeAnim;
  const expr = expressionFor(mood, anim, petting);
  const head = headMotion(anim, animSec, sleeping);
  const sad = expr.earDroop;

  const isPlayAnim = anim === 'playing' || anim === 'laser' || anim === 'tail_chase' || anim === 'red_ball';
  const tailSpeed =
    anim === 'tail_chase' ? 0.32 : isPlayAnim ? 0.6 : mood === 'ecstatic' || mood === 'happy' ? 2.2 : sad ? 5 : 3.4;

  const headProps = {
    eyes: expr.eyes,
    mouth: expr.mouth,
    earDroop: expr.earDroop,
    earTwitch,
    blush: expr.blush,
    blinking: blinking && !sleeping,
    uid,
    playing: isPlayAnim,
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
          <stop offset="0%" stopColor="#ffe27a" />
          <stop offset="60%" stopColor="#f5b325" />
          <stop offset="100%" stopColor="#d98c0c" />
        </radialGradient>
      </defs>

      <motion.g
        onPointerDown={handlePet}
        style={{ cursor: 'pointer' }}
        animate={
          anim === 'laser' || anim === 'red_ball'
            ? { x: [0, -18, 18, -14, 16, 0], y: [0, -10, 0, -14, 0, -8, 0] }
            : anim === 'tail_chase'
              ? { x: [0, 14, -14, 14, -14, 0], y: [0, -10, 0, -12, 0, -8, 0], rotate: [0, 8, -8, 8, -8, 0] }
              : anim === 'playing'
                ? { y: [0, -12, 0, -16, 0, -10, 0] }
                : petting
                  ? { y: [0, -6, 0] }
                  : anim === 'purring'
                    ? { x: [0, -0.7, 0.7, -0.7, 0.7, 0] }
                    : { y: 0, x: 0, rotate: 0 }
        }
        transition={
          anim === 'purring'
            ? { duration: 0.18, repeat: Math.round(animSec / 0.18) }
            : { duration: isPlayAnim ? animSec : 0.5, ease: 'easeInOut' }
        }
      >
        {(() => {
          const effectivePose: CatPose = sleeping
            ? pose === 'belly_up'
              ? 'belly_up'
              : 'loaf'
            : (pose ?? 'sit');

          return (
            <AnimatePresence mode="wait" initial={false}>
              {effectivePose === 'loaf' && (
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
              )}

              {effectivePose === 'look_out' && (
                <motion.g
                  key="look_out"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  {/* Ground contact shadow */}
                  <ellipse cx={100} cy={207} rx={60} ry={8} fill="rgba(40,20,10,0.2)" />

                  {/* Tail swishing gently on the floor */}
                  <motion.g
                    style={{ originX: 0.1, originY: 0.95 }}
                    animate={{ rotate: [-8, 12, -8] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <TailStripes d="M136 198 C168 202 188 176 182 146 C178 132 168 122 156 124" width={14} />
                  </motion.g>

                  {/* Body seen from back / 3/4 rear with breathing motion */}
                  <motion.g
                    style={{ originY: 1 }}
                    animate={{ scaleY: [1, 1.026, 1], scaleX: [1, 1.01, 1] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <path d="M68 114 C48 138 38 176 48 198 C54 209 146 209 152 198 C162 176 152 138 132 114 Z" fill={C.coat} />
                    {/* Hind legs planted on the tiles */}
                    <ellipse cx={52} cy={188} rx={18} ry={16} fill={C.coat} />
                    <ellipse cx={148} cy={188} rx={18} ry={16} fill={C.coat} />
                    <ellipse cx={54} cy={202} rx={12} ry={6.5} fill={C.cream} />
                    <ellipse cx={146} cy={202} rx={12} ry={6.5} fill={C.cream} />
                    <path d="M50 201 v4 M55 201 v4 M145 201 v4 M150 201 v4" stroke={C.creamShade} strokeWidth={1.3} strokeLinecap="round" />

                    {/* Tabby stripes along the spine and ribs */}
                    <g stroke={C.stripe} strokeWidth={3.5} strokeLinecap="round" fill="none">
                      <path d="M100 128 V152" />
                      <path d="M72 144 Q86 148 94 154" />
                      <path d="M128 144 Q114 148 106 154" />
                      <path d="M66 166 Q84 170 95 178" />
                      <path d="M134 166 Q116 170 105 178" />
                      <path d="M64 186 Q80 188 94 194" />
                      <path d="M136 186 Q120 188 106 194" />
                    </g>

                    {/* Front paws propped forward */}
                    <ellipse cx={88} cy={198} rx={9} ry={6} fill={C.cream} />
                    <ellipse cx={112} cy={198} rx={9} ry={6} fill={C.cream} />
                  </motion.g>

                  {/* Head looking out and down at the street */}
                  <motion.g
                    style={{ originX: 0.5, originY: 1 }}
                    animate={
                      petting
                        ? { rotate: [0, -18, 0], y: [0, -3, 0] }
                        : { rotate: [-1.5, 1.5, -1.5], y: [0, 2.5, 0] }
                    }
                    transition={
                      petting
                        ? { duration: 0.8, ease: 'easeOut' }
                        : { duration: 4.8, repeat: Infinity, ease: 'easeInOut' }
                    }
                  >
                    {/* Back of head contour */}
                    <path
                      d="M100 36 C136 36 160 56 160 84 C160 94 156 102 152 108 L158 112 L148 114 C140 120 124 125 100 125 C76 125 60 120 52 114 L42 112 L48 108 C44 102 40 94 40 84 C40 56 64 36 100 36 Z"
                      fill={C.coat}
                    />
                    <ellipse cx={100} cy={64} rx={34} ry={18} fill={C.coatLight} opacity={0.35} />

                    {/* Back-of-head tabby stripes */}
                    <g stroke={C.stripe} strokeWidth={3.2} strokeLinecap="round" fill="none">
                      <path d="M100 42 V64" />
                      <path d="M88 45 Q90 54 94 62" />
                      <path d="M112 45 Q110 54 106 62" />
                      <path d="M78 54 Q82 62 87 68" />
                      <path d="M122 54 Q118 62 113 68" />
                    </g>

                    {/* Alert ears pointing forward/down */}
                    <path d="M50 72 L46 24 Q46 18 53 21 L88 46 Z" fill={C.coat} />
                    <path d="M150 72 L154 24 Q154 18 147 21 L112 46 Z" fill={C.coat} />
                    {/* Inner ear tufts visible on outer edge */}
                    <path d="M53 62 L49 32 L78 48 Z" fill={C.innerEar} opacity={0.65} />
                    <path d="M147 62 L151 32 L122 48 Z" fill={C.innerEar} opacity={0.65} />

                    {/* Whiskers spreading forward to look down at the street */}
                    <g stroke="#fffaf2" strokeWidth={1.1} strokeLinecap="round">
                      <path d="M46 92 L16 88" />
                      <path d="M45 97 L14 98" />
                      <path d="M47 102 L18 108" />
                      <path d="M154 92 L184 88" />
                      <path d="M155 97 L186 98" />
                      <path d="M153 102 L182 108" />
                    </g>

                    {/* If petted: cheek blush glance */}
                    {petting && (
                      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <ellipse cx={56} cy={94} rx={6} ry={3.5} fill="#ff8fa3" opacity={0.6} />
                      </motion.g>
                    )}
                  </motion.g>

                  {sleeping && <SleepZzz />}
                  {anim === 'purring' && <PurrWaves />}
                </motion.g>
              )}

              {effectivePose === 'belly_up' && (
                <motion.g
                  key="belly_up"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  {/* Broad floor contact shadow on warm tiles */}
                  <ellipse cx={100} cy={172} rx={76} ry={11} fill="rgba(40,20,10,0.18)" />

                  {/* Tail swishing lazily along the warm tiles */}
                  <motion.g
                    style={{ originX: 0.8, originY: 0.8 }}
                    animate={{ rotate: [-6, 10, -6] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <TailStripes d="M162 164 C190 170 202 150 194 126 C190 114 180 108 170 112" width={14} />
                  </motion.g>

                  {/* Body resting on back with gentle belly breathing */}
                  <motion.g
                    style={{ originY: 0.8 }}
                    animate={{ scaleY: [1, 1.035, 1], scaleX: [1, 1.015, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Back fur resting on floor */}
                    <path d="M40 148 C34 122 60 110 100 110 C140 110 166 122 160 148 C156 174 44 174 40 148 Z" fill={C.coat} />

                    {/* Flank tabby stripes */}
                    <g stroke={C.stripe} strokeWidth={3.2} strokeLinecap="round" fill="none">
                      <path d="M46 132 Q56 136 66 134" />
                      <path d="M154 132 Q144 136 134 134" />
                      <path d="M48 148 Q58 151 70 148" />
                      <path d="M152 148 Q142 151 130 148" />
                    </g>

                    {/* Big soft cream belly facing UP */}
                    <ellipse cx={100} cy={142} rx={36} ry={22} fill={C.cream} />
                    <path d="M78 134 C86 126 114 126 122 134 C132 146 124 162 100 164 C76 162 68 146 78 134 Z" fill={C.cream} />
                    {/* Chest & belly fur zigzag texture */}
                    <path d="M92 136 l4 4 l4 -4 l4 4 l4 -4 l4 4" stroke={C.creamShade} strokeWidth={1.4} fill="none" strokeLinecap="round" />
                    <path d="M88 148 l4 3 l4 -3 l4 3 l4 -3 l4 3" stroke={C.creamShade} strokeWidth={1.2} fill="none" strokeLinecap="round" />

                    {/* Back legs relaxed on sides */}
                    <ellipse cx={48} cy={162} rx={16} ry={11} fill={C.coat} transform="rotate(-12 48 162)" />
                    <ellipse cx={40} cy={168} rx={9} ry={6} fill={C.cream} />
                    <ellipse cx={152} cy={162} rx={16} ry={11} fill={C.coat} transform="rotate(12 152 162)" />
                    <ellipse cx={160} cy={168} rx={9} ry={6} fill={C.cream} />

                    {/* Front paws curled happily in the air (kneading / mitten paws) */}
                    <motion.g
                      animate={{ y: [0, -3.5, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <rect x={73} y={114} width={15} height={26} rx={7.5} fill={C.coat} transform="rotate(-18 80 127)" />
                      <ellipse cx={75} cy={113} rx={9} ry={6.5} fill={C.cream} transform="rotate(-18 75 113)" />
                      <circle cx={75} cy={113} r={1.6} fill="#f49fa8" />
                      <circle cx={71} cy={110} r={1} fill="#f49fa8" />
                      <circle cx={75} cy={108} r={1} fill="#f49fa8" />
                      <circle cx={79} cy={110} r={1} fill="#f49fa8" />

                      <rect x={112} y={114} width={15} height={26} rx={7.5} fill={C.coat} transform="rotate(18 120 127)" />
                      <ellipse cx={125} cy={113} rx={9} ry={6.5} fill={C.cream} transform="rotate(18 125 113)" />
                      <circle cx={125} cy={113} r={1.6} fill="#f49fa8" />
                      <circle cx={121} cy={110} r={1} fill="#f49fa8" />
                      <circle cx={125} cy={108} r={1} fill="#f49fa8" />
                      <circle cx={129} cy={110} r={1} fill="#f49fa8" />
                    </motion.g>
                  </motion.g>

                  {/* Head resting upside down / tilted back in pure sunbathing joy */}
                  <motion.g
                    style={{ originX: 0.5, originY: 0.5 }}
                    animate={
                      petting
                        ? { scale: [1, 1.05, 1], rotate: [-2, 2, -2] }
                        : { rotate: [-1, 1, -1] }
                    }
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <path
                      d="M100 46 C134 46 156 66 156 92 C156 102 152 110 147 116 L154 120 L143 122 C135 128 120 132 100 132 C80 132 65 128 57 122 L46 120 L53 116 C48 110 44 102 44 92 C44 66 66 46 100 46 Z"
                      fill={C.coat}
                    />
                    {/* Ears resting against tiles */}
                    <path d="M52 80 L42 40 Q42 34 49 37 L84 60 Z" fill={C.coat} />
                    <path d="M56 72 L49 44 L76 60 Z" fill={C.innerEar} />
                    <path d="M148 80 L158 40 Q158 34 151 37 L116 60 Z" fill={C.coat} />
                    <path d="M144 72 L151 44 L124 60 Z" fill={C.innerEar} />

                    {/* Forehead tabby stripes */}
                    <g stroke={C.stripe} strokeWidth={3.2} strokeLinecap="round" fill="none">
                      <path d="M100 50 V64" />
                      <path d="M89 52 Q91 60 94 64" />
                      <path d="M111 52 Q109 60 106 64" />
                    </g>

                    {/* Cheek blush */}
                    <ellipse cx={68} cy={90} rx={8} ry={4.5} fill="#ff8fa3" opacity={0.5} />
                    <ellipse cx={132} cy={90} rx={8} ry={4.5} fill="#ff8fa3" opacity={0.5} />

                    {/* Blissfully smiling eyes (happy arcs) */}
                    <path d="M74 78 Q83 70 92 78" stroke={C.line} strokeWidth={2.8} fill="none" strokeLinecap="round" />
                    <path d="M108 78 Q117 70 126 78" stroke={C.line} strokeWidth={2.8} fill="none" strokeLinecap="round" />

                    {/* Muzzle, pink nose & smiling mouth */}
                    <ellipse cx={89} cy={98} rx={13} ry={10} fill={C.cream} />
                    <ellipse cx={111} cy={98} rx={13} ry={10} fill={C.cream} />
                    <path d="M94 90 H106 C106 94 102 97.5 100 97.5 C98 97.5 94 94 94 90 Z" fill={C.nose} />
                    <path d="M100 97.5 V101 M92 101 Q100 106 100 101 Q100 106 108 101" stroke={C.line} strokeWidth={2} fill="none" strokeLinecap="round" />
                    <circle cx={96} cy={108} r={1.1} fill={C.freckle} />
                    <circle cx={104} cy={108} r={1.1} fill={C.freckle} />

                    {/* Whiskers */}
                    <g stroke="#fffaf2" strokeWidth={1.1} strokeLinecap="round">
                      <path d="M78 96 L52 91" />
                      <path d="M78 100 L50 101" />
                      <path d="M79 104 L54 110" />
                      <path d="M122 96 L148 91" />
                      <path d="M122 100 L150 101" />
                      <path d="M121 104 L146 110" />
                    </g>
                  </motion.g>

                  {sleeping && <SleepZzz />}
                  {anim === 'purring' && <PurrWaves />}
                </motion.g>
              )}

              {effectivePose === 'sit' && (
                <motion.g key="sit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
                  <ellipse cx={100} cy={209} rx={64} ry={8} fill="rgba(40,20,10,0.2)" />

                  {/* Tail */}
                  <motion.g
                    style={{ originX: 0.05, originY: 0.95 }}
                    animate={sad ? { rotate: [18, 22, 18] } : anim === 'tail_chase' ? { rotate: [-24, 24, -24] } : { rotate: [-7, 10, -7] }}
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
                    {mood === 'deceased' && (
                      <motion.g
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: [0.75, 1, 0.75], y: [-3, -7, -3] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ellipse cx={100} cy={16} rx={22} ry={6} fill="none" stroke="#fcd34d" strokeWidth={3} />
                        <ellipse cx={100} cy={16} rx={24} ry={7.5} fill="none" stroke="#fef08a" strokeWidth={1} opacity={0.6} />
                      </motion.g>
                    )}
                  </motion.g>

                  {anim === 'purring' && <PurrWaves />}
                </motion.g>
              )}
            </AnimatePresence>
          );
        })()}

        {/* Props */}
        <AnimatePresence>
          {(anim === 'eating' || anim === 'eating_egg' || anim === 'treat') && (
            <FoodBowl key="bowl" kind={anim === 'treat' ? 'heart' : anim === 'eating_egg' ? 'egg' : 'wet'} sec={animSec} />
          )}
          {anim === 'churu' && <ChuruTube key="churu" sec={animSec} />}
          {anim === 'drinking' && <WaterDish key="dish" />}
          {anim === 'playing' && <FeatherWand key="wand" sec={animSec} />}
          {anim === 'laser' && <LaserDot key="laser" sec={animSec} />}
          {anim === 'tail_chase' && <TailSpinSwirl key="tail-swirl" sec={animSec} />}
          {anim === 'red_ball' && <RedBallToy key="red-ball" sec={animSec} />}
          {anim === 'brushing' && <Brush key="brush" sec={animSec} />}
        </AnimatePresence>
      </motion.g>
    </svg>
  );
}

export default CatAvatar;
