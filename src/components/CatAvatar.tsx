import { AnimatePresence, motion, type TargetAndTransition, type Transition } from 'framer-motion';
import { useEffect, useId, useMemo, useState } from 'react';
import type { CatAnimation, Mood } from '../types';

/**
 * Oli — hand-crafted SVG portrait based on real photos of Oli:
 * - Rich orange-ginger mackerel tabby coat with chestnut stripes & buff highlights
 * - Right ear (viewer's left): slightly rounded tip + prominent dark blue-black stippled ID tattoo
 * - Left ear (viewer's right): signature small V-shaped notch near the tip + faint inner tattoo
 * - Amber-gold / hazel-gold eyes with dark eyeliner rims & pale cream "spectacles"
 * - Terracotta-pink nose with tiny dark lentigo freckles
 * - Snowy-white whisker pads & chin with his signature dark black-brown central lower-lip spot
 * - Cream throat & striped ginger chest "necklace" bands
 * - Tabby-barred front legs with white socks/mittens & pink toe beans
 * - Ringed tail with alternating dark ginger & cream-white bands and a pure white tail tip
 */

const C = {
  coat: '#e57c2e',
  coatDeep: '#cf6419',
  coatLight: '#f39c52',
  coatBuff: '#f8be82',
  stripe: '#ab430b',
  stripeDark: '#873005',
  cream: '#fffaf2',
  creamWarm: '#faeedb',
  creamShade: '#ead5b8',
  innerEar: '#f0b3aa',
  innerEarDeep: '#df948a',
  nose: '#e27d78',
  noseRim: '#b55450',
  pawPad: '#efb0b6',
  line: '#592d16',
  eyeliner: '#381c0c',
  pupil: '#190e07',
  irisEdge: '#8f5d06',
  freckle: '#321a0e',
  lipSpot: '#26130b',
  chinSkin: '#d9bdb8',
  tattoo: '#253549',
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
      earDroop = true;
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
        animate: { rotate: [-1.8, 1.8, -1.8], y: [0, 0.8, 0] },
        transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
      };
  }
}

// -----------------------------------------------------------------------------
// Eyes — Golden-amber / hazel-gold with dark eyeliner rims & pale spectacles
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
  const outer = side === 'l' ? -1 : 1;

  if (state === 'closed') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={13.5} ry={12.5} fill={C.creamWarm} opacity={0.55} />
        <path
          d={`M${cx - 11.5} ${cy + 0.5} Q${cx} ${cy + 8.5} ${cx + 11.5} ${cy + 0.5}`}
          stroke={C.eyeliner}
          strokeWidth={2.6}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M${cx + outer * 10} ${cy + 1} l${outer * 4} 2`}
          stroke={C.stripe}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </g>
    );
  }
  if (state === 'happy') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={13.5} ry={12.5} fill={C.creamWarm} opacity={0.55} />
        <path
          d={`M${cx - 11} ${cy + 3.5} Q${cx} ${cy - 7.5} ${cx + 11} ${cy + 3.5}`}
          stroke={C.eyeliner}
          strokeWidth={2.8}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    );
  }

  const clipId = `${uid}-eye-${side}`;
  const wide = state === 'wide';
  const tilt = side === 'l' ? 7 : -7;

  return (
    <g>
      {/* Pale cream "spectacle" ring around eye */}
      <ellipse cx={cx} cy={cy + 0.5} rx={14.5} ry={14} fill={C.creamWarm} opacity={0.7} />
      {/* Inner tear-duct corner highlight */}
      <circle cx={cx - outer * 11.5} cy={cy + 3} r={2.4} fill={C.cream} opacity={0.9} />

      <motion.g animate={{ scaleY: blinking ? 0.08 : 1 }} transition={{ duration: 0.08 }} style={{ originY: `${cy}px` }}>
        <defs>
          <clipPath id={clipId}>
            <ellipse cx={cx} cy={cy} rx={12.2} ry={12.8} transform={`rotate(${tilt} ${cx} ${cy})`} />
          </clipPath>
        </defs>
        {/* Amber-gold iris with dark eyeliner rim */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={12.2}
          ry={12.8}
          transform={`rotate(${tilt} ${cx} ${cy})`}
          fill={`url(#${uid}-iris)`}
          stroke={C.eyeliner}
          strokeWidth={1.9}
        />
        <g clipPath={`url(#${clipId})`}>
          {/* Subtle iris texture ring */}
          <ellipse cx={cx} cy={cy} rx={9.2} ry={9.8} fill="none" stroke="#9e6d08" strokeWidth={0.7} strokeDasharray="1.5 2.5" opacity={0.55} />
          <motion.g
            animate={playing ? { x: [0, -4, 4, -4, 4, -4, 4, 0] } : { x: lookX }}
            transition={playing ? { duration: 3.2, ease: 'easeInOut' } : { type: 'spring', stiffness: 120, damping: 14 }}
          >
            {/* Vertical slit / dilated pupil (like Oli's photos in sun vs indoor light) */}
            <motion.ellipse
              cx={cx}
              cy={cy + 0.4}
              animate={{ rx: wide ? 7.6 : 3.4, ry: wide ? 10.8 : 10.2 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              fill={C.pupil}
            />
            <circle cx={cx - 3.6} cy={cy - 4.6} r={3.0} fill="#fff" />
            <circle cx={cx + 3.5} cy={cy + 4.0} r={1.25} fill="#fff" opacity={0.85} />
          </motion.g>
          {/* Upper inner shadow under lid */}
          <path d={`M${cx - 14} ${cy - 13} Q${cx} ${cy - 8} ${cx + 14} ${cy - 13} V${cy - 16} H${cx - 14} Z`} fill="#241206" opacity={0.22} />

          {state === 'halflid' && (
            <path
              d={`M${cx - 15} ${cy - 15} H${cx + 15} V${cy - 1} Q${cx} ${cy + 2.5} ${cx - 15} ${cy - 1} Z`}
              fill={C.coat}
            />
          )}
          {state === 'sad' && (
            <path
              d={`M${cx - 15} ${cy - 15} H${cx + 15} V${cy - 15 + (outer > 0 ? 13 : 4)} L${cx - 15} ${cy - 15 + (outer > 0 ? 4 : 13)} Z`}
              fill={C.coat}
            />
          )}
        </g>
        {state === 'halflid' && (
          <path
            d={`M${cx - 12.2} ${cy - 1} Q${cx} ${cy + 2.5} ${cx + 12.2} ${cy - 1}`}
            stroke={C.eyeliner}
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </motion.g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// Mouth — Includes Oli's signature dark central lower-lip spot & big fang yawn
// -----------------------------------------------------------------------------

function Mouth({ state }: { state: MouthState }) {
  const stroke = { stroke: C.line, strokeWidth: 1.85, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  // Signature dark lentigo spot right at the center of Oli's lower lip + subtle side mottling
  const lipFreckles = (
    <g>
      <ellipse cx={100} cy={104.2} rx={1.9} ry={2.2} fill={C.lipSpot} />
      <circle cx={96.5} cy={104.8} r={0.95} fill={C.lipSpot} opacity={0.8} />
      <circle cx={103.4} cy={104.7} r={0.85} fill={C.lipSpot} opacity={0.75} />
    </g>
  );

  switch (state) {
    case 'smile':
      return (
        <g>
          {lipFreckles}
          <path d="M100 98.5 V102.5 M100 102.5 Q94 108.5 87.5 103 M100 102.5 Q106 108.5 112.5 103" {...stroke} />
        </g>
      );
    case 'frown':
      return (
        <g>
          {lipFreckles}
          <path d="M100 98.5 V103 M92 108 Q100 102.5 108 108" {...stroke} />
        </g>
      );
    case 'chew':
      return (
        <motion.g animate={{ scaleY: [1, 0.45, 1] }} transition={{ duration: 0.32, repeat: Infinity }}>
          <ellipse cx={100} cy={105.5} rx={5.5} ry={4.2} fill="#7d2929" />
          <ellipse cx={100} cy={107} rx={3.6} ry={2.2} fill="#e8838e" />
          <circle cx={100} cy={109.5} r={1.6} fill={C.lipSpot} />
          <path d="M100 98.5 V101.5" {...stroke} />
        </motion.g>
      );
    case 'lap':
      return (
        <g>
          {lipFreckles}
          <path d="M100 98.5 V102 M100 102 Q95 106 89.5 103 M100 102 Q105 106 110.5 103" {...stroke} />
          <motion.ellipse
            cx={100}
            cy={107.5}
            rx={3.4}
            fill="#f0828f"
            animate={{ ry: [0, 4.5, 0] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        </g>
      );
    case 'yawn':
      // Inspired directly by IMG_20250815_195236.jpg (Oli's epic fang yawn!)
      return (
        <motion.g initial={{ scaleY: 0.2 }} animate={{ scaleY: [0.2, 1.05, 1, 0.2] }} transition={{ duration: 1.5 }} style={{ originY: '100px' }}>
          <ellipse cx={100} cy={108} rx={8.5} ry={10.5} fill="#6e2226" stroke={C.lipSpot} strokeWidth={1.2} />
          {/* Curled pink tongue */}
          <path d="M95 108 Q100 105 105 108 Q106 119 100 120 Q94 119 95 108 Z" fill="#e86f7c" />
          <path d="M100 108 V117" stroke="#c94f5d" strokeWidth={0.9} strokeLinecap="round" />
          {/* Upper & lower white fangs */}
          <path d="M94.5 100.5 L95.8 106.5 L97.2 101 Z" fill="#fffdf7" />
          <path d="M105.5 100.5 L104.2 106.5 L102.8 101 Z" fill="#fffdf7" />
          <path d="M95.5 115.5 L96.4 112.5 L97.3 115.5 Z" fill="#fffdf7" />
          <path d="M104.5 115.5 L103.6 112.5 L102.7 115.5 Z" fill="#fffdf7" />
          {/* Little dark gum lentigo spot visible when yawning */}
          <circle cx={93.2} cy={109} r={1.1} fill={C.lipSpot} />
        </motion.g>
      );
    default:
      return (
        <g>
          {lipFreckles}
          <path d="M100 98.5 V102.5 M100 102.5 Q94.5 106.8 89 103.8 M100 102.5 Q105.5 106.8 111 103.8" {...stroke} />
        </g>
      );
  }
}

// -----------------------------------------------------------------------------
// Head — Real Oli's ears (tattoo + left-ear notch), tabby M, cheek ribbons & nose freckles
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
  const earRot = earDroop ? 15 : 0;
  return (
    <g>
      {/* OLI'S RIGHT EAR (viewer's left): slightly rounded tip + prominent dark stippled tattoo */}
      <motion.g
        style={{ originX: 0.7, originY: 1 }}
        animate={{ rotate: -earRot + (earTwitch ? -9 : 0) }}
        transition={{ type: 'spring', stiffness: 260, damping: 12 }}
      >
        <path d="M48 68 L39 20 C38 11 46 9 53 14 L89 41 Z" fill={C.coatDeep} />
        <path d="M50 66 L41 21 C40 13 47 11 53 15 L87 41 Z" fill={C.coat} />
        <path d="M55 59 L47 23 C46 18 50 17 54 20 L81 43 Z" fill={C.innerEar} />
        <path d="M58 56 L53 31 L76 44 Z" fill={C.innerEarDeep} opacity={0.45} />
        {/* Realistic stippled blue-black ear tattoo inside right ear (matches Oli's photos) */}
        <g fill={C.tattoo} opacity={0.72} transform="rotate(24 58 34)">
          <path
            d="M52 29 C50 28 49 31 52 32 C55 33 54 36 51 35 M57 29 C59 29 60 32 58 34 L56 36 M54 38 C56 37 59 38 58 40"
            stroke={C.tattoo}
            strokeWidth={1.55}
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={50.5} cy={27.5} r={0.9} />
          <circle cx={55} cy={27} r={1.0} />
          <circle cx={60} cy={31} r={0.85} />
          <circle cx={52} cy={38} r={0.95} />
          <circle cx={57} cy={41} r={0.8} />
        </g>
        {/* Long pale cream ear furnishings (tufts) */}
        <path
          d="M53 56 Q62 50 67 48 M54 49 Q61 45 65 44 M56 42 Q61 40 64 40"
          stroke={C.cream}
          strokeWidth={1.6}
          strokeLinecap="round"
          fill="none"
          opacity={0.92}
        />
      </motion.g>

      {/* OLI'S LEFT EAR (viewer's right): sharp tip with signature outer V-notch + faint tattoo */}
      <motion.g
        style={{ originX: 0.3, originY: 1 }}
        animate={{ rotate: earRot }}
        transition={{ type: 'spring', stiffness: 260, damping: 12 }}
      >
        {/* Outer silhouette includes the distinctive small nick/notch at (156, 25) */}
        <path
          d="M152 68 L160 31 L155.5 27.5 L159.5 24 L158 17 C157 10 150 10 145 15 L111 41 Z"
          fill={C.coatDeep}
        />
        <path
          d="M150 66 L158.5 31 L154.2 27.5 L158 24 L156.8 18 C156 12 150 12 145 16 L113 41 Z"
          fill={C.coat}
        />
        <path
          d="M145 59 L153 27.5 L150.5 25.5 L152.5 23 C152 18 148 18 144 21 L119 43 Z"
          fill={C.innerEar}
        />
        <path d="M142 56 L147 31 L124 44 Z" fill={C.innerEarDeep} opacity={0.45} />
        {/* Faint secondary tattoo trace inside left ear */}
        <g opacity={0.38} transform="rotate(-24 142 35)">
          <path d="M140 31 Q143 33 141 36 M145 32 L144 37" stroke={C.tattoo} strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <circle cx={142} cy={29} r={0.8} fill={C.tattoo} />
        </g>
        {/* Long pale cream ear furnishings */}
        <path
          d="M147 56 Q138 50 133 48 M146 49 Q139 45 135 44 M144 42 Q139 40 136 40"
          stroke={C.cream}
          strokeWidth={1.6}
          strokeLinecap="round"
          fill="none"
          opacity={0.92}
        />
      </motion.g>

      {/* Head shape with plush cheek ruffs */}
      <path
        d="M100 29 C137 29 162 52 162 82 C162 92 158 100 153 106 L160 110 L149 113 C140 120 124 125 100 125 C76 125 60 120 51 113 L40 110 L47 106 C42 100 38 92 38 82 C38 52 63 29 100 29 Z"
        fill={C.coat}
      />
      {/* Warm crown & cheek shading */}
      <ellipse cx={100} cy={54} rx={36} ry={18} fill={C.coatLight} opacity={0.5} />
      <path d="M44 88 Q54 114 82 121 L118 121 Q146 114 156 88 Q148 106 100 108 Q52 106 44 88 Z" fill={C.creamWarm} opacity={0.45} />

      {/* Classic tabby forehead "M" + crown stripes + double cheek ribbons */}
      <g stroke={C.stripe} strokeWidth={3.1} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Forehead M */}
        <path d="M84 56 L87 38 L94 49 L100 35 L106 49 L113 38 L116 56" strokeWidth={2.9} />
        {/* Outer brow arches */}
        <path d="M72 58 Q77 44 83 37" strokeWidth={2.4} opacity={0.85} />
        <path d="M128 58 Q123 44 117 37" strokeWidth={2.4} opacity={0.85} />
        {/* Left cheek ribbons (sweeping back from outer eye & mid-cheek) */}
        <path d="M62 81 Q51 82 43 88" />
        <path d="M65 92 Q52 93 44 100" />
        {/* Right cheek ribbons */}
        <path d="M138 81 Q149 82 157 88" />
        <path d="M135 92 Q148 93 156 100" />
      </g>
      {/* Cream stripe between cheek ribbons (characteristic of Oli's side profile) */}
      <path d="M63 86 Q52 87 44 94 M137 86 Q148 87 156 94" stroke={C.creamWarm} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.75} />

      {/* Snowy-white inverted-V muzzle blaze & plush whisker pads + chin */}
      <path
        d="M100 76 C93 82 86 90 73 95 C69 102 74 113 86 114 C91 119 109 119 114 114 C126 113 131 102 127 95 C114 90 107 82 100 76 Z"
        fill={C.cream}
      />
      <ellipse cx={87} cy={101.5} rx={15} ry={11} fill={C.cream} />
      <ellipse cx={113} cy={101.5} rx={15} ry={11} fill={C.cream} />
      {/* Chin with subtle pinkish-grey speckled skin tone showing through short white fur */}
      <ellipse cx={100} cy={113} rx={12.5} ry={7.5} fill={C.cream} />
      <ellipse cx={100} cy={111.5} rx={8.5} ry={4.8} fill={C.chinSkin} opacity={0.38} />

      {/* Warm ginger-buff nose bridge (Oli's nose bridge is orange-buff down to the pink nose) */}
      <path d="M93 66 Q100 63 107 66 L105.5 92 H94.5 Z" fill={C.coatLight} />
      <path d="M95 70 Q100 68 105 70 L104 91 H96 Z" fill={C.coatBuff} opacity={0.65} />

      {/* Blush */}
      <motion.g animate={{ opacity: blush ? 1 : 0 }} transition={{ duration: 0.4 }}>
        <ellipse cx={63} cy={98} rx={8} ry={4.5} fill="#ff8fa3" opacity={0.45} />
        <ellipse cx={137} cy={98} rx={8} ry={4.5} fill="#ff8fa3" opacity={0.45} />
      </motion.g>

      {/* Eyes */}
      <Eye cx={76} cy={79} state={eyes} blinking={blinking} side="l" uid={uid} lookX={0} playing={playing} />
      <Eye cx={124} cy={79} state={eyes} blinking={blinking} side="r" uid={uid} lookX={0} playing={playing} />

      {/* Long white eyebrow whiskers (super prominent in Oli's photos!) */}
      <g stroke="#fffdf9" strokeWidth={1.05} strokeLinecap="round" fill="none" opacity={0.9}>
        <path d="M68 65 Q58 46 46 38" />
        <path d="M73 63 Q65 44 55 34" />
        <path d="M132 65 Q142 46 154 38" />
        <path d="M127 63 Q135 44 145 34" />
      </g>

      {/* Terracotta-pink nose + dark rim + real Oli's nose lentigo freckles */}
      <path
        d="M92.8 91.5 Q100 89.5 107.2 91.5 C107.2 95.8 102.8 99.2 100 99.5 C97.2 99.2 92.8 95.8 92.8 91.5 Z"
        fill={C.nose}
        stroke={C.noseRim}
        strokeWidth={0.9}
      />
      {/* Nostril curves */}
      <path d="M94.2 94.5 Q96.5 95.5 97.2 97.2 M105.8 94.5 Q103.5 95.5 102.8 97.2" stroke={C.noseRim} strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <ellipse cx={98} cy={92.8} rx={2.2} ry={0.9} fill="#fff" opacity={0.42} />
      {/* Tiny dark lentigo freckles on Oli's nose leather */}
      <circle cx={96.8} cy={92.2} r={0.85} fill={C.freckle} opacity={0.85} />
      <circle cx={102.2} cy={91.8} r={0.95} fill={C.freckle} opacity={0.9} />
      <circle cx={100.6} cy={93.4} r={0.65} fill={C.freckle} opacity={0.75} />

      {/* Mouth + signature central lower-lip spot */}
      <Mouth state={mouth} />

      {/* Subtle whisker-pad follicle dots & chin speckles */}
      <g fill={C.freckle} opacity={0.45}>
        <circle cx={84} cy={99} r={0.75} />
        <circle cx={81} cy={102.5} r={0.75} />
        <circle cx={116} cy={99} r={0.75} />
        <circle cx={119} cy={102.5} r={0.75} />
        <circle cx={96.5} cy={113.5} r={0.9} />
        <circle cx={102.8} cy={114.2} r={0.85} />
      </g>

      {/* Long white cheek whiskers */}
      <motion.g
        stroke="#fffdf9"
        strokeWidth={1.25}
        strokeLinecap="round"
        fill="none"
        animate={{ rotate: [0, -1.6, 0, 1.4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M79 100 Q58 96 34 94" />
        <path d="M78 104 Q56 104 31 106" />
        <path d="M80 108 Q60 112 38 118" />
        <path d="M121 100 Q142 96 166 94" />
        <path d="M122 104 Q144 104 169 106" />
        <path d="M120 108 Q140 112 162 118" />
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
// Tail — Alternating rich dark ginger & pale cream rings with a white tip
// -----------------------------------------------------------------------------

function TailStripes({ d, width }: { d: string; width: number }) {
  return (
    <>
      {/* Base warm ginger tail */}
      <path d={d} stroke={C.coat} strokeWidth={width} fill="none" strokeLinecap="round" />
      {/* Pale cream bands along the tail */}
      <path d={d} stroke={C.creamWarm} strokeWidth={width - 0.6} fill="none" strokeDasharray="6 10" strokeDashoffset="3" opacity={0.88} />
      {/* Bold dark ginger-chestnut tabby rings */}
      <path d={d} stroke={C.stripe} strokeWidth={width} fill="none" strokeDasharray="6 10" opacity={0.88} />
      {/* Snowy-white tail tip (Oli's signature white-tipped ringed tail!) */}
      <path d={d} stroke={C.cream} strokeWidth={width + 0.4} fill="none" strokeLinecap="round" pathLength={100} strokeDasharray="14 100" strokeDashoffset="-86" />
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
      churu: 3.0,
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
        {/* Warm golden-amber / hazel-gold iris gradient matching PXL_20260905_091720609~2.jpg */}
        <radialGradient id={`${uid}-iris`} cx="48%" cy="44%" r="58%">
          <stop offset="0%" stopColor="#d9b436" />
          <stop offset="35%" stopColor="#f2c438" />
          <stop offset="75%" stopColor="#cf8e12" />
          <stop offset="100%" stopColor="#8c5605" />
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
                animate={{ scaleY: [1, 1.045, 1] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Curled ginger loaf body (inspired by IMG_20250709_195907.jpg & PXL_20260906_174747974.PORTRAIT.jpg) */}
                <path d="M26 198 C22 158 58 134 102 134 C146 134 180 158 175 198 C174 206 28 206 26 198 Z" fill={C.coat} />
                {/* Cream underbelly & chest band */}
                <path d="M40 198 Q78 184 128 198 Z" fill={C.creamWarm} opacity={0.85} />
                {/* Rich mackerel tabby body stripes */}
                <g stroke={C.stripe} strokeWidth={3.6} strokeLinecap="round" fill="none" opacity={0.88}>
                  <path d="M64 143 Q70 158 63 176" />
                  <path d="M84 137 Q90 155 83 175" />
                  <path d="M104 136 Q111 154 104 176" />
                  <path d="M124 139 Q132 156 124 178" />
                  <path d="M144 146 Q151 162 142 182" />
                  <path d="M160 158 Q163 170 156 184" />
                </g>
              </motion.g>
              {/* Ringed tail wrapped around the front with snowy-white tail tip */}
              <TailStripes d="M168 194 C172 212 122 213 96 209 C80 207 66 204 56 198" width={13} />
              {/* White front paws peeking out (like IMG_20250709_195907.jpg) */}
              <ellipse cx={64} cy={201} rx={12.5} ry={5.5} fill={C.cream} />
              <path d="M59 199 v4 M64 199 v4 M69 199 v4" stroke={C.creamShade} strokeWidth={1.3} strokeLinecap="round" />
              <ellipse cx={108} cy={201.5} rx={11} ry={5} fill={C.cream} />
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

              {/* Ringed tail with white tip */}
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
                {/* Main seated torso */}
                <path d="M66 112 C45 136 37 176 47 198 C53 209 147 209 153 198 C163 176 155 136 134 112 Z" fill={C.coat} />
                <ellipse cx={58} cy={188} rx={19} ry={17} fill={C.coat} />
                <ellipse cx={142} cy={188} rx={19} ry={17} fill={C.coat} />

                {/* Snowy-cream throat patch & chest buff undercoat (matches IMG_20250813_212527.jpg & PXL_20260905_091720609~2.jpg) */}
                <path d="M74 115 C64 138 66 175 100 188 C134 175 136 138 126 115 Z" fill={C.creamWarm} />
                <path d="M80 114 C75 126 83 136 100 137 C117 136 125 126 120 114 Z" fill={C.cream} />

                {/* Oli's signature ginger tabby chest "necklace" bands */}
                <path d="M69 133 Q100 145 131 133" stroke={C.stripe} strokeWidth={4.2} fill="none" strokeLinecap="round" opacity={0.85} />
                <path d="M65 144 Q100 158 135 144" stroke={C.coatDeep} strokeWidth={4.8} fill="none" strokeLinecap="round" opacity={0.9} />
                <path d="M72 155 Q100 166 128 155" stroke={C.stripe} strokeWidth={3.4} fill="none" strokeLinecap="round" opacity={0.75} />

                {/* Flank mackerel stripes */}
                <g stroke={C.stripe} strokeWidth={3.6} strokeLinecap="round" fill="none">
                  <path d="M51 148 Q61 145 68 151" />
                  <path d="M46 163 Q57 159 66 165" />
                  <path d="M43 178 Q55 173 66 178" />
                  <path d="M149 148 Q139 145 132 151" />
                  <path d="M154 163 Q143 159 134 165" />
                  <path d="M157 178 Q145 173 134 178" />
                </g>

                {/* Front legs with bold ginger tabby bars + asymmetrical white socks (like IMG_20250815_195236.jpg) */}
                {/* Right front leg (viewer's left) — higher white sock */}
                <rect x={72} y={148} width={20} height={55} rx={10} fill={C.coatLight} />
                <path d="M72 174 H92 V203 H72 Z" fill={C.cream} />
                <path d="M73 158 Q82 161 91 158 M73 168 Q82 171 91 168" stroke={C.stripe} strokeWidth={3.2} fill="none" strokeLinecap="round" />

                {/* Left front leg (viewer's right) — ginger bars lower down + white ankle sock */}
                <rect x={108} y={148} width={20} height={55} rx={10} fill={C.coatLight} />
                <path d="M108 182 H128 V203 H108 Z" fill={C.cream} />
                <path
                  d="M109 158 Q118 161 127 158 M109 168 Q118 171 127 168 M109 177 Q118 180 127 177"
                  stroke={C.stripe}
                  strokeWidth={3.2}
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Plump white paws with hint of pink toe cushions */}
                <ellipse cx={82} cy={203} rx={13.5} ry={8} fill={C.cream} />
                <ellipse cx={118} cy={203} rx={13.5} ry={8} fill={C.cream} />
                <ellipse cx={82} cy={206.5} rx={8} ry={2.2} fill={C.pawPad} opacity={0.55} />
                <ellipse cx={118} cy={206.5} rx={8} ry={2.2} fill={C.pawPad} opacity={0.55} />
                <path d="M77.5 199.5 v6 M82.5 199 v6.5 M87.5 199.5 v6 M113.5 199.5 v6 M118.5 199 v6.5 M123.5 199.5 v6" stroke={C.creamShade} strokeWidth={1.4} strokeLinecap="round" />
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
          {anim === 'churu' && <ChuruTube key="churu" sec={animSec} />}
          {anim === 'drinking' && <WaterDish key="dish" />}
          {anim === 'playing' && <FeatherWand key="wand" sec={animSec} />}
          {anim === 'brushing' && <Brush key="brush" sec={animSec} />}
        </AnimatePresence>
      </motion.g>
    </svg>
  );
}

export default CatAvatar;
