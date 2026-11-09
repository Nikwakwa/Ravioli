import { motion } from 'framer-motion';
import { CatAvatar } from '../CatAvatar';
import type { CatAnimation, CatSpot, Mood } from '../../types';
import type { TimeOfDay } from '../../utils/atmosphere';

/**
 * Nico & Athina's real Living Room — crafted from their living room photos:
 * - Crisp warm-white walls & large-format cream/beige travertine floor tiles + tile baseboard
 * - Tall white bookcase (open upper shelves with grey storage box & trailing pothos + lower Shaker doors) on the left
 * - White-framed window with folded white Roman blind, neighboring building view, windowsill plant, small white lamp & white ribbed radiator below
 * - Square tropical botanical print (monstera leaves & red flowers) in a light-wood frame
 * - Cream plush cat tree / scratching post with sisal posts, cube condo & top bolster perch behind the sofa corner
 * - Dark charcoal woven L-shaped sofa with 5 throw pillows (terracotta, sage, geometric triangles, sage, terracotta) + tan "Bedsure" bolster cat bed
 * - Modern white coffee table with split-top seam
 * - Fluffy cream high-pile shag rug with Moroccan grey diamond trellis pattern where Oli sits
 * - White cuboid pet water fountain with glowing blue LED status light (placed right of the rug)
 * - Modern enclosed corner litter box (positioned safely in the left corner, away from water)
 * - Empty Amazon delivery cardboard box on the floor ("If it fits, I sits!")
 */
export function LivingRoom({
  sleeping,
  fountainBoost,
  timeOfDay = 'day',
  isRaining = false,
  onTapFountain,
  litterBoxDirty = false,
  onTapLitterBox,
  activeSpot = 'rug',
  onSelectSpot,
  catMood = 'content',
  catAnimation = 'idle',
  catAnimationKey = 0,
  onPetCat,
}: {
  sleeping: boolean;
  fountainBoost: boolean;
  timeOfDay?: TimeOfDay;
  isRaining?: boolean;
  onTapFountain?: () => void;
  litterBoxDirty?: boolean;
  onTapLitterBox?: () => void;
  activeSpot?: CatSpot;
  onSelectSpot?: (spot: CatSpot) => void;
  catMood?: Mood;
  catAnimation?: CatAnimation;
  catAnimationKey?: number;
  onPetCat?: () => void;
}) {
  const isNight = sleeping || timeOfDay === 'night';
  const isSunset = !sleeping && timeOfDay === 'sunset';
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="lr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? '#232238' : isSunset ? '#faece3' : '#f7f5f0'} />
          <stop offset="100%" stopColor={isNight ? '#2f2c48' : isSunset ? '#f1d8c8' : '#ece8df'} />
        </linearGradient>
        <linearGradient id="lr-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? '#423d4f' : isSunset ? '#ecd5c0' : '#e8dfd0'} />
          <stop offset="100%" stopColor={isNight ? '#332f3f' : isSunset ? '#dcbe9f' : '#d8ccb8'} />
        </linearGradient>
        <linearGradient id="lr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? '#131936' : isSunset ? '#7c3aed' : '#a8dbf7'} />
          <stop offset="55%" stopColor={isNight ? '#1e2448' : isSunset ? '#f97316' : '#cce7f8'} />
          <stop offset="100%" stopColor={isNight ? '#2c3163' : isSunset ? '#fef08a' : '#fff8e8'} />
        </linearGradient>
        <radialGradient id="lr-shag" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={isNight ? '#c8c3d4' : isSunset ? '#fff1e0' : '#fcfaf3'} />
          <stop offset="72%" stopColor={isNight ? '#b2acc2' : isSunset ? '#fae0c7' : '#f2ede0'} />
          <stop offset="100%" stopColor={isNight ? '#9b95ad' : isSunset ? '#edd1b4' : '#e3dccb'} />
        </radialGradient>
        <linearGradient id="lr-sunbeam" x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="0%" stopColor={isSunset ? '#fb923c' : '#fffbe8'} stopOpacity={isSunset ? 0.24 : 0.16} />
          <stop offset="65%" stopColor={isSunset ? '#fde047' : '#fffbe8'} stopOpacity={isSunset ? 0.08 : 0.05} />
          <stop offset="100%" stopColor={isSunset ? '#fde047' : '#fffbe8'} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lr-lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd98e" stopOpacity="0.88" />
          <stop offset="55%" stopColor="#ffbe5c" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ffbe5c" stopOpacity="0" />
        </radialGradient>
        <clipPath id="lr-window-glass">
          <rect x="126" y="112" width="92" height="102" rx="2" />
        </clipPath>
        <pattern id="lr-weave" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3 H6 M3 0 V6" stroke="#343942" strokeWidth="0.6" opacity="0.35" />
        </pattern>
      </defs>

      {/* Crisp warm-white wall (y: 0..314) */}
      <rect width="400" height="314" fill="url(#lr-wall)" />

      {/* Matching cream tile baseboard/skirting */}
      <rect y="305" width="400" height="10" fill={isNight ? '#3a3548' : isSunset ? '#dec8b2' : '#dfd5c3'} />
      <line x1="0" y1="305" x2="400" y2="305" stroke={isNight ? '#2c2838' : isSunset ? '#c9b195' : '#cbc0ac'} strokeWidth="1.2" />

      {/* Large-format cream/beige travertine floor tiles (y: 315..600) */}
      <rect y="315" width="400" height="285" fill="url(#lr-floor)" />
      {/* Subtle porcelain tile grout lines */}
      {[346, 384, 428, 478].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke={isNight ? '#2b2736' : isSunset ? '#c9b195' : '#c5b8a1'} strokeWidth="1" opacity="0.55" />
      ))}
      {[
        [85, 315, 346],
        [220, 315, 346],
        [345, 315, 346],
        [45, 346, 384],
        [185, 346, 384],
        [320, 346, 384],
        [110, 384, 428],
        [265, 384, 428],
        [60, 428, 478],
        [215, 428, 478],
      ].map(([x1, y1, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x1 - 12} y2={y2} stroke={isNight ? '#2b2736' : isSunset ? '#c9b195' : '#c5b8a1'} strokeWidth="1" opacity="0.48" />
      ))}

      {/* Tall white bookcase / cabinet on left, positioned closer to center (x: 32..108, y: 112..312) */}
      <g>
        {/* Outer white frame */}
        <rect
          x="32"
          y="112"
          width="76"
          height="200"
          rx="2"
          fill={isNight ? '#c7c4d4' : '#f9f8f5'}
          stroke={isNight ? '#9e9ab0' : '#dcd8ce'}
          strokeWidth="1.4"
        />
        {/* 4 Open horizontal upper shelf recesses */}
        <rect x="37" y="118" width="66" height="28" fill={isNight ? '#8d899e' : '#e8e4da'} />
        <rect x="37" y="150" width="66" height="30" fill={isNight ? '#8d899e' : '#e8e4da'} />
        <rect x="37" y="184" width="66" height="30" fill={isNight ? '#8d899e' : '#e8e4da'} />
        <rect x="37" y="218" width="66" height="26" fill={isNight ? '#8d899e' : '#e8e4da'} />

        {/* Shelf 1 (top): Grey storage box with oval handle */}
        <rect x="64" y="124" width="36" height="22" rx="1.5" fill={isNight ? '#5e5c6e' : '#7a7875'} />
        <rect x="63" y="123" width="38" height="4" rx="1" fill={isNight ? '#6b697c' : '#8a8884'} />
        <ellipse cx="82" cy="135" rx="4.5" ry="2" fill="none" stroke={isNight ? '#8d899e' : '#b5b2ac'} strokeWidth="1" />

        {/* Shelf 2: Glass jar & photo collage board */}
        <rect x="42" y="158" width="14" height="22" rx="3" fill={isNight ? '#b8c2cc' : '#dce6ed'} opacity="0.75" />
        <rect x="62" y="156" width="34" height="24" rx="1" fill={isNight ? '#d5d2e0' : '#faf8f4'} stroke={isNight ? '#9e9ab0' : '#d5d0c5'} strokeWidth="0.8" />
        <rect x="66" y="160" width="11" height="8" fill="#8b99a1" />
        <rect x="80" y="160" width="12" height="8" fill="#c9ab84" />
        <rect x="66" y="170" width="26" height="7" fill="#7a8b7b" />

        {/* Shelf 3: Minimal ceramic & keepsakes */}
        <ellipse cx="52" cy="211" rx="6" ry="3" fill="#f2efe9" />
        <rect x="70" y="202" width="10" height="12" rx="2" fill="#8c6246" />
        <rect x="88" y="203" width="10" height="11" rx="1.5" fill="#d97b54" />

        {/* Shelf 4: Warm wooden box & tall terracotta tin on right */}
        <rect x="40" y="230" width="30" height="14" rx="1" fill="#cfa372" stroke="#b58958" strokeWidth="0.8" />
        <rect x="73" y="226" width="16" height="18" rx="1" fill="#6b5848" />
        <rect x="92" y="220" width="8" height="24" rx="1" fill="#b84a39" />

        {/* Lower Shaker-style double cabinet doors with recessed panels & dark round knobs */}
        <rect
          x="37"
          y="248"
          width="32"
          height="60"
          fill={isNight ? '#bab6c9' : '#f4f2ed'}
          stroke={isNight ? '#9e9ab0' : '#dad5ca'}
          strokeWidth="1"
        />
        <rect
          x="41"
          y="253"
          width="24"
          height="50"
          fill="none"
          stroke={isNight ? '#a6a2b8' : '#e2ded4'}
          strokeWidth="0.8"
        />
        <rect
          x="71"
          y="248"
          width="32"
          height="60"
          fill={isNight ? '#bab6c9' : '#f4f2ed'}
          stroke={isNight ? '#9e9ab0' : '#dad5ca'}
          strokeWidth="1"
        />
        <rect
          x="75"
          y="253"
          width="24"
          height="50"
          fill="none"
          stroke={isNight ? '#a6a2b8' : '#e2ded4'}
          strokeWidth="0.8"
        />
        <circle cx="65" cy="276" r="1.6" fill="#3a3835" />
        <circle cx="75" cy="276" r="1.6" fill="#3a3835" />

        {/* Trailing green pothos plant on top of bookcase */}
        <rect x="44" y="101" width="16" height="11" rx="2" fill="#6b706b" />
        <g fill="#3d7344">
          <circle cx="52" cy="98" r="6.5" />
          <circle cx="59" cy="102" r="5.5" fill="#4c8753" />
          <circle cx="64" cy="109" r="4.8" />
          <circle cx="67" cy="117" r="4" fill="#4c8753" />
          <circle cx="66" cy="125" r="3.2" />
        </g>
      </g>

      {/* Window with white Roman blind, sunny windowsill & white ribbed radiator below (x: 118..226) */}
      <g>
        {/* Outer white window frame */}
        <rect x="120" y="106" width="104" height="114" rx="4" fill="#ffffff" stroke="#d8d4ca" strokeWidth="1.5" />
        <rect x="126" y="112" width="92" height="102" rx="2" fill="url(#lr-sky)" />
        {isNight ? (
          <g>
            <circle cx="194" cy="144" r="10" fill="#fff6d8" />
            <circle cx="199" cy="140" r="9" fill="#131936" />
            {[
              [140, 138],
              [162, 158],
              [204, 172],
              [146, 188],
              [184, 198],
            ].map(([x, y], i) => (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r={1.3}
                fill="#fff"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2 + i * 0.4, repeat: Infinity }}
              />
            ))}
            {/* Night silhouette of neighbouring building with 2 cozy lit windows */}
            <rect x="126" y="148" width="92" height="66" fill="#1e2242" opacity="0.88" />
            <rect x="135" y="154" width="22" height="24" rx="1" fill="#fef08a" opacity="0.85" stroke="#fde047" strokeWidth="0.8" />
            <rect x="184" y="180" width="16" height="18" rx="1" fill="#fef08a" opacity="0.8" stroke="#fde047" strokeWidth="0.8" />
          </g>
        ) : isSunset ? (
          <g>
            {/* Sunset golden neighbouring building facade across the street */}
            <rect x="126" y="138" width="92" height="76" fill="#d97706" opacity="0.82" />
            <rect x="126" y="138" width="44" height="76" fill="#f59e0b" opacity="0.88" />
            {/* Neighbouring facade windows reflecting sunset twilight */}
            <rect x="135" y="148" width="22" height="28" rx="1" fill="#7c3aed" opacity="0.45" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="135" y1="156" x2="157" y2="156" stroke="#fde047" strokeWidth="0.8" />
            <line x1="135" y1="164" x2="157" y2="164" stroke="#fde047" strokeWidth="0.8" />
            <rect x="184" y="146" width="16" height="18" rx="1" fill="#9333ea" opacity="0.4" stroke="#ffffff" strokeWidth="1.2" />
            <rect x="184" y="180" width="16" height="18" rx="1" fill="#fed7aa" stroke="#ffffff" strokeWidth="1.2" />
          </g>
        ) : (
          <g>
            {/* Warm cream/ochre neighboring building facade across the street */}
            <rect x="126" y="138" width="92" height="76" fill="#e6cfa8" opacity="0.85" />
            <rect x="126" y="138" width="44" height="76" fill="#f0eadc" opacity="0.9" />
            {/* Neighbouring facade windows */}
            <rect x="135" y="148" width="22" height="28" rx="1" fill="#8b99a1" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="135" y1="156" x2="157" y2="156" stroke="#d5dce0" strokeWidth="0.8" />
            <line x1="135" y1="164" x2="157" y2="164" stroke="#d5dce0" strokeWidth="0.8" />
            <rect x="184" y="146" width="16" height="18" rx="1" fill="#6f7d8c" stroke="#ffffff" strokeWidth="1.2" />
            <rect x="184" y="180" width="16" height="18" rx="1" fill="#f3f1ec" stroke="#ffffff" strokeWidth="1.2" />
          </g>
        )}
        {/* Animated Rain on the Window Glass (Cat TV) */}
        {isRaining && (
          <g clipPath="url(#lr-window-glass)">
            <rect x="126" y="112" width="92" height="102" fill="#38bdf8" opacity="0.12" />
            {[
              { x: 136, y0: 110, dur: 1.8, delay: 0 },
              { x: 152, y0: 115, dur: 2.2, delay: 0.6 },
              { x: 168, y0: 120, dur: 1.6, delay: 1.1 },
              { x: 184, y0: 112, dur: 2.4, delay: 0.3 },
              { x: 198, y0: 118, dur: 1.9, delay: 0.8 },
              { x: 210, y0: 122, dur: 2.1, delay: 1.4 },
            ].map((drop, i) => (
              <motion.g
                key={`rain-${i}`}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: [0, 42, 85], opacity: [0, 0.85, 0] }}
                transition={{ duration: drop.dur, delay: drop.delay, repeat: Infinity, ease: 'easeIn' }}
              >
                <line
                  x1={drop.x}
                  y1={drop.y0}
                  x2={drop.x - 2}
                  y2={drop.y0 + 10}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                <circle cx={drop.x - 2} cy={drop.y0 + 10} r="1.3" fill="#ffffff" opacity="0.85" />
              </motion.g>
            ))}
            {[
              [142, 135],
              [158, 170],
              [176, 145],
              [192, 162],
              [205, 138],
              [148, 198],
              [188, 204],
            ].map(([x, y], i) => (
              <circle key={`bead-${i}`} cx={x} cy={y} r={1.2} fill="#ffffff" opacity="0.65" />
            ))}
          </g>
        )}
        {/* Center window mullion & handle */}
        <rect x="170.5" y="112" width="3" height="102" fill="#ffffff" />
        <rect x="174" y="160" width="2" height="9" rx="1" fill="#b8b5ad" />
        {/* Soft white fabric Roman blind gathered at top of window (PXL_20261101_155116231.jpg) */}
        <rect
          x="118"
          y="98"
          width="108"
          height="22"
          rx="2"
          fill={isNight ? '#cbc8d8' : isSunset ? '#f5eae0' : '#f4f2ec'}
          stroke={isNight ? '#a6a2b8' : isSunset ? '#dcd2c4' : '#dcd8ce'}
          strokeWidth="1"
        />
        <line x1="119" y1="106" x2="225" y2="106" stroke={isNight ? '#b0acc2' : isSunset ? '#e5d7ca' : '#e2ded4'} strokeWidth="1" />
        <line x1="119" y1="113" x2="225" y2="113" stroke={isNight ? '#b0acc2' : isSunset ? '#e5d7ca' : '#e2ded4'} strokeWidth="1" />

        {/* White windowsill (Spot: 'window') */}
        <g
          onClick={() => (activeSpot === 'window' ? onPetCat?.() : onSelectSpot?.('window'))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (activeSpot === 'window') onPetCat?.();
              else onSelectSpot?.('window');
            }
          }}
          tabIndex={0}
          className="pointer-events-auto cursor-pointer focus:outline-none"
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          role="button"
          aria-current={activeSpot === 'window' ? 'true' : undefined}
          aria-label={activeSpot === 'window' ? 'Pet Oli on the sunny windowsill' : 'Sunny windowsill (cozy spot)'}
        >
          {/* Generous touch target */}
          <rect x="156" y="140" width="76" height="86" fill="transparent" style={{ pointerEvents: 'all' }} />

          {/* Oli perched on the windowsill */}
          {activeSpot === 'window' && (
            <motion.g
              key={`cat-window-${catAnimationKey}`}
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              <CatAvatar
                x={168}
                y={156}
                width={56}
                height={62}
                mood={catMood}
                animation={catAnimation}
                animationKey={catAnimationKey}
                onPet={onPetCat}
                className="pointer-events-auto"
              />
            </motion.g>
          )}

          <rect x="115" y="218" width="114" height="6" rx="2" fill="#ffffff" stroke="#d5d0c5" strokeWidth="1" />
        </g>

        {/* Potted green plant on windowsill */}
        <ellipse cx="144" cy="213" rx="8" ry="6" fill="#4a4642" />
        <g fill="#4c9150">
          <ellipse cx="138" cy="203" rx="4" ry="7" transform="rotate(-24 138 203)" />
          <ellipse cx="144" cy="201" rx="3.8" ry="8" />
          <ellipse cx="151" cy="203" rx="4" ry="7" transform="rotate(26 151 203)" />
        </g>

        {/* Small white cylinder lamp on right edge of windowsill (PXL_20261101_155116231.jpg) */}
        <line x1="217" y1="204" x2="217" y2="218" stroke="#b5b2aa" strokeWidth="1.5" />
        <ellipse cx="217" cy="218" rx="4.5" ry="1.5" fill="#8f8c84" />
        <rect
          x="210"
          y="192"
          width="14"
          height="12"
          rx="2"
          fill={isNight ? '#fff3c4' : isSunset ? '#fed7aa' : '#faf9f5'}
          stroke={isNight ? '#f59e0b' : isSunset ? '#f97316' : '#d8d4ca'}
          strokeWidth="1"
        />
        {/* Warm ambient windowsill lamp glow when night or sunset */}
        {(isNight || isSunset) && (
          <motion.circle
            cx="217"
            cy="198"
            r={isNight ? 52 : 36}
            fill="url(#lr-lamp)"
            animate={{ opacity: isNight ? 0.95 : 0.55 }}
            transition={{ duration: 0.8 }}
          />
        )}

        {/* White vertical-ribbed radiator under window + thermostat dial */}
        <rect x="122" y="232" width="94" height="58" rx="4" fill={isNight ? '#b8b5c7' : isSunset ? '#f6eee4' : '#f7f6f2'} stroke={isNight ? '#8e8ba1' : isSunset ? '#d5cbbe' : '#d8d4c9'} strokeWidth="1.2" />
        {Array.from({ length: 11 }).map((_, i) => (
          <rect
            key={i}
            x={127 + i * 8}
            y={236}
            width={4}
            height={50}
            rx={1.5}
            fill={isNight ? '#9e9bb0' : isSunset ? '#e8ded3' : '#e6e3da'}
          />
        ))}
        {/* Radiator thermostat valve on right */}
        <circle cx="221" cy="240" r="4.5" fill="#f0eee9" stroke="#bab5a9" strokeWidth="1" />
        <circle cx="221" cy="240" r="2" fill="#9c988e" />
      </g>

      {/* Sunbeams streaming into the room through the window + slow floating dust motes */}
      {!isNight && !isRaining && (
        <g pointerEvents="none">
          <polygon points="126,160 220,160 360,440 140,440" fill="url(#lr-sunbeam)" />
          {[
            { cx: 180, cy: 250, r: 1.5, dur: 4.5, delay: 0 },
            { cx: 220, cy: 295, r: 1.7, dur: 5.2, delay: 1.2 },
            { cx: 250, cy: 345, r: 1.4, dur: 4.8, delay: 2.1 },
            { cx: 195, cy: 375, r: 1.6, dur: 5.6, delay: 0.8 },
            { cx: 280, cy: 395, r: 1.3, dur: 4.2, delay: 1.7 },
          ].map((mote, i) => (
            <motion.circle
              key={`mote-${i}`}
              cx={mote.cx}
              cy={mote.cy}
              r={mote.r}
              fill={isSunset ? '#fde047' : '#ffffff'}
              animate={{
                y: [-6, 6, -6],
                x: [-3, 3, -3],
                opacity: [0.25, 0.75, 0.25],
              }}
              transition={{ duration: mote.dur, delay: mote.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </g>
      )}

      {/* Square tropical botanical leaf & flower print on wall (PXL_20261101_155116231.jpg) */}
      <g>
        <rect x="244" y="108" width="52" height="52" rx="2" fill="#c8a273" stroke="#9e784b" strokeWidth="1.2" />
        <rect x="246.5" y="110.5" width="47" height="47" fill="#f8f6f1" />
        {/* Monstera & palm leaves */}
        <path d="M270 156 Q268 140 252 134 Q262 128 272 142 Z" fill="#4f7553" />
        <path d="M272 156 Q278 138 291 132 Q284 146 274 156 Z" fill="#36583b" />
        <path d="M250 116 Q264 114 268 126 Q254 126 250 116 Z" fill="#739172" />
        <ellipse cx="282" cy="124" rx="7" ry="5" transform="rotate(-25 282 124)" fill="#2f4d34" />
        {/* Red/burgundy tropical flowers */}
        <circle cx="268" cy="128" r="4" fill="#9e2a35" />
        <circle cx="275" cy="134" r="3.2" fill="#b83b46" />
        <circle cx="264" cy="135" r="2.5" fill="#d96b75" />
        <circle cx="268" cy="128" r="1.2" fill="#f7e3a1" />
      </g>

      {/* Cream plush cat tree / scratching post behind the sofa corner (PXL_20261101_155125015.jpg) */}
      <g>
        {/* Warm ambient sleep glow */}
        <motion.circle
          cx="256"
          cy="198"
          r={118}
          fill="url(#lr-lamp)"
          animate={{ opacity: isNight ? 0.95 : isSunset ? 0.45 : 0.22 }}
          transition={{ duration: 0.8 }}
        />
        {/* Sisal scratching posts */}
        <rect x="307" y="150" width="5.5" height="80" fill="#d6c6ad" stroke="#baa78a" strokeWidth="0.8" />
        <rect x="327" y="150" width="5.5" height="80" fill="#d6c6ad" stroke="#baa78a" strokeWidth="0.8" />
        {/* Top plush bolster perch */}
        <rect
          x="301"
          y="142"
          width="38"
          height="9"
          rx="4"
          fill={isNight ? '#cbc6d8' : '#efeae0'}
          stroke={isNight ? '#a6a0b8' : '#d5ccb8'}
          strokeWidth="1"
        />
        {/* Middle plush cube condo with arched opening */}
        <rect
          x="304"
          y="174"
          width="32"
          height="26"
          rx="3"
          fill={isNight ? '#c4bfd2' : '#ebe5da'}
          stroke={isNight ? '#9e99b0' : '#d0c7b4'}
          strokeWidth="1"
        />
        <path d="M313 200 V187 A7 7 0 0 1 327 187 V200 Z" fill="#6e6559" />
        {/* Lower platform */}
        <rect
          x="299"
          y="200"
          width="42"
          height="5"
          rx="2"
          fill={isNight ? '#cbc6d8' : '#efeae0'}
          stroke={isNight ? '#a6a0b8' : '#d5ccb8'}
          strokeWidth="0.8"
        />
      </g>

      {/* Dark charcoal woven fabric L-shaped sofa (x: 196..398, y: 226..374) */}
      <g>
        {/* Sofa backrest cushions */}
        <rect x="200" y="228" width="196" height="58" rx="10" fill="#3e444f" />
        <rect x="206" y="234" width="90" height="46" rx="7" fill="#4a515e" />
        <rect x="300" y="234" width="90" height="46" rx="7" fill="#4a515e" />
        <rect x="206" y="234" width="184" height="46" rx="7" fill="url(#lr-weave)" />

        {/* 5 Throw Pillows from PXL_20261101_155133124.jpg: Terracotta, Sage, Geometric Triangles, Sage, Terracotta */}
        {/* 1. Left terracotta-red pillow */}
        <rect x="208" y="240" width="32" height="31" rx="5" fill="#a83b31" stroke="#852820" strokeWidth="0.8" transform="rotate(-6 224 255)" />
        {/* 2. Left sage-olive pillow */}
        <rect x="234" y="242" width="33" height="30" rx="5" fill="#b8b072" stroke="#968e53" strokeWidth="0.8" transform="rotate(-2 250 257)" />
        {/* 3. Center geometric triangle patchwork pillow */}
        <g transform="translate(268 239) rotate(-2)">
          <rect x="0" y="0" width="36" height="32" rx="5" fill="#f2efe9" stroke="#ccc6ba" strokeWidth="0.8" />
          <polygon points="0,0 18,0 9,16" fill="#9ea3a8" />
          <polygon points="18,0 36,0 27,16" fill="#d4cab8" />
          <polygon points="9,16 27,16 18,0" fill="#faf8f4" />
          <polygon points="0,32 18,32 9,16" fill="#d4cab8" />
          <polygon points="18,32 36,32 27,16" fill="#7c8288" />
          <polygon points="9,16 27,16 18,32" fill="#e6e1d6" />
        </g>
        {/* 4. Right sage-olive pillow */}
        <rect x="306" y="242" width="33" height="30" rx="5" fill="#b8b072" stroke="#968e53" strokeWidth="0.8" transform="rotate(3 322 257)" />
        {/* 5. Right terracotta-red pillow */}
        <rect x="342" y="240" width="34" height="31" rx="5" fill="#a83b31" stroke="#852820" strokeWidth="0.8" transform="rotate(7 359 255)" />

        {/* Sofa base & seat cushions */}
        <rect x="194" y="274" width="204" height="40" rx="8" fill="#353a44" />
        <rect x="202" y="270" width="50" height="24" rx="6" fill="#525a68" />
        <rect x="202" y="270" width="50" height="24" rx="6" fill="url(#lr-weave)" />

        {/* Chaise longue extending forward on right (fully supporting Oli's bolster bed) */}
        <path d="M250 274 h148 v74 a10 10 0 0 1 -10 10 h-128 a10 10 0 0 1 -10 -10 Z" fill="#353a44" />
        <rect x="252" y="270" width="142" height="78" rx="8" fill="#525a68" />
        <rect x="252" y="270" width="142" height="78" rx="8" fill="url(#lr-weave)" />
        <rect x="252" y="270" width="142" height="78" rx="8" fill="none" stroke="#424854" strokeWidth="0.8" />
        {/* Left armrest */}
        <rect x="190" y="254" width="16" height="58" rx="7" fill="#3b414c" />

        {/* Oli's tan suede "Bedsure Comfy Pet" bolster bed firmly resting on the sofa chaise (Spot: 'sofa_bed') */}
        <g
          transform="translate(262 278)"
          onClick={() => (activeSpot === 'sofa_bed' ? onPetCat?.() : onSelectSpot?.('sofa_bed'))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (activeSpot === 'sofa_bed') onPetCat?.();
              else onSelectSpot?.('sofa_bed');
            }
          }}
          tabIndex={0}
          className="pointer-events-auto cursor-pointer focus:outline-none"
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          role="button"
          aria-current={activeSpot === 'sofa_bed' ? 'true' : undefined}
          aria-label={activeSpot === 'sofa_bed' ? 'Pet Oli curled up in his Bedsure bolster bed' : 'Oli’s tan bolster bed on the sofa (cozy spot)'}
        >
          {/* Generous touch target */}
          <rect x="-6" y="-36" width="76" height="74" fill="transparent" style={{ pointerEvents: 'all' }} />

          {/* Realistic contact shadow on the sofa fabric grounding the bed firmly */}
          <ellipse cx="32" cy="35" rx="30" ry="7" fill="rgba(15,18,25,0.55)" />
          <ellipse cx="32" cy="33" rx="26" ry="4.5" fill="rgba(10,12,18,0.4)" />

          {/* Cream sherpa inner cushion */}
          <rect x="6" y="4" width="52" height="28" rx="8" fill="#f5ece0" />

          {/* Oli nestled on the sherpa cushion (inside the bolster bed) */}
          {activeSpot === 'sofa_bed' && (
            <motion.g
              key={`cat-sofa-bed-${catAnimationKey}`}
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              <CatAvatar
                x={4}
                y={-40}
                width={56}
                height={62}
                mood={catMood}
                animation={catAnimation}
                animationKey={catAnimationKey}
                onPet={onPetCat}
                className="pointer-events-auto"
              />
            </motion.g>
          )}

          {/* Tan suede bolster walls (wraps right in front of Oli's paws!) */}
          <path
            d="M0 8 Q0 0 8 0 H14 Q18 0 18 8 V16 H46 V8 Q46 0 50 0 H56 Q64 0 64 8 V28 Q64 36 54 36 H10 Q0 36 0 28 Z"
            fill="#b89776"
            stroke="#9c7b5b"
            strokeWidth="1"
          />
          {/* Little brown leather Bedsure patch on front left */}
          <rect x="8" y="23" width="12" height="9" rx="2" fill="#5e3a22" />
          <circle cx="14" cy="27.5" r="2.2" fill="none" stroke="#b89776" strokeWidth="0.7" />
        </g>
      </g>

      {/* Modern white coffee table with split-top seam (PXL_20261101_155116231.jpg) */}
      <g>
        {/* Table shadow */}
        <polygon points="262,386 398,386 400,358 278,358" fill="rgba(35,30,22,0.14)" />
        {/* Square white table legs & apron */}
        <rect x="282" y="346" width="6" height="28" fill="#d5d1c8" />
        <rect x="266" y="354" width="7" height="32" fill="#e2dfd6" />
        <rect x="384" y="354" width="7" height="32" fill="#dcd9d0" />
        <rect x="272" y="354" width="118" height="14" fill="#eae7de" />
        {/* Crisp white tabletop */}
        <polygon points="262,354 398,354 400,334 282,334" fill="#ffffff" stroke="#dedad0" strokeWidth="1" />
        {/* Subtle center split-tabletop line */}
        <line x1="272" y1="344" x2="399" y2="344" stroke="#e5e1d8" strokeWidth="0.9" />
      </g>

      {/* Oli's modern two-tone enclosed litter box in the left corner (repositioned to x=72..132, 100% on screen, far from water) */}
      <g
        transform="translate(62 0)"
        onClick={onTapLitterBox}
        onKeyDown={(e) => {
          if (onTapLitterBox && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onTapLitterBox();
          }
        }}
        tabIndex={onTapLitterBox ? 0 : undefined}
        className={onTapLitterBox ? 'pointer-events-auto cursor-pointer focus:outline-none' : undefined}
        style={onTapLitterBox ? { pointerEvents: 'auto', cursor: 'pointer' } : undefined}
        role={onTapLitterBox ? 'button' : undefined}
        aria-label={onTapLitterBox ? (litterBoxDirty ? 'Scoop Oli’s litter box' : 'Oli’s litter box') : undefined}
      >
        {/* Generous touch target for tapping to scoop */}
        <rect x="4" y="292" width="70" height="84" fill="transparent" style={{ pointerEvents: 'all' }} />

        {/* Soft floor shadow */}
        <ellipse cx="40" cy="372" rx="32" ry="6" fill="rgba(40,32,24,0.22)" />

        {/* Grey slide-out drawer tray base (lower section) */}
        <rect
          x="10"
          y="346"
          width="60"
          height="24"
          rx="4"
          fill={isNight ? '#6a6773' : '#8e8b86'}
          stroke={isNight ? '#54515c' : '#76736e'}
          strokeWidth="1"
        />
        {/* Bottom base lip/runners */}
        <rect
          x="8"
          y="367"
          width="64"
          height="4"
          rx="2"
          fill={isNight ? '#5a5763' : '#7b7873'}
        />
        {/* Recessed front pull handle on drawer face (centered at x=40) */}
        <rect
          x="28"
          y="353"
          width="24"
          height="11"
          rx="3"
          fill={isNight ? '#4c4954' : '#696662'}
        />
        <rect
          x="30"
          y="355"
          width="20"
          height="4"
          rx="1.5"
          fill={isNight ? '#7d7a87' : '#a19e99'}
        />

        {/* Off-white / light cream enclosed upper hood */}
        <rect
          x="10"
          y="318"
          width="60"
          height="31"
          rx="6"
          fill={isNight ? '#cac6d6' : '#f5f3ec'}
          stroke={isNight ? '#9e9ab0' : '#dad5cb'}
          strokeWidth="1.2"
        />
        {/* Split seam line between hood and drawer base */}
        <line
          x1="10"
          y1="346"
          x2="70"
          y2="346"
          stroke={isNight ? '#6a6773' : '#7c7974'}
          strokeWidth="1"
        />

        {/* Roof top panel with rounded corners (centered at x=40) */}
        <rect
          x="10"
          y="316"
          width="60"
          height="5"
          rx="2.5"
          fill={isNight ? '#bab7c7' : '#ece9e0'}
          stroke={isNight ? '#9e9ab0' : '#d8d4ca'}
          strokeWidth="0.8"
        />
        {/* Centered top handle / carbon filter vent */}
        <rect
          x="31"
          y="315"
          width="18"
          height="3"
          rx="1.5"
          fill="#2b292a"
        />
        {/* Symmetrical left and right ventilation / stepping grids */}
        <line
          x1="15"
          y1="318.5"
          x2="27"
          y2="318.5"
          stroke={isNight ? '#8a8799' : '#ccc8be'}
          strokeWidth="0.8"
          strokeDasharray="2 1.5"
        />
        <line
          x1="53"
          y1="318.5"
          x2="65"
          y2="318.5"
          stroke={isNight ? '#8a8799' : '#ccc8be'}
          strokeWidth="0.8"
          strokeDasharray="2 1.5"
        />

        {/* Front swinging flap door opening recess (centered at x=40) */}
        <rect
          x="26"
          y="323"
          width="28"
          height="23"
          rx="4.5"
          fill={isNight ? '#383542' : '#454342'}
        />
        {/* Smoked translucent tinted swinging flap door (centered at x=40) */}
        <rect
          x="27.5"
          y="324.5"
          width="25"
          height="20"
          rx="3"
          fill="#2d2b2f"
          opacity="0.82"
          stroke="#68656b"
          strokeWidth="0.8"
        />
        {/* Glossy glass reflection streak across flap */}
        <line
          x1="30"
          y1="342"
          x2="46"
          y2="326"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Symmetrical top door hinge clips */}
        <rect x="29.5" y="322.5" width="3.5" height="3" rx="0.8" fill="#787570" />
        <rect x="47" y="322.5" width="3.5" height="3" rx="0.8" fill="#787570" />

        {/* Animated Scoop Needed / Dirty status badge floating above (centered at x=40) */}
        {litterBoxDirty && (
          <g>
            {/* Attention ping wave */}
            <motion.circle
              cx="40"
              cy="305"
              r="14"
              fill="rgba(245, 158, 11, 0.22)"
              stroke="#f59e0b"
              strokeWidth="1.4"
              strokeDasharray="3 2"
              animate={{ scale: [0.92, 1.2, 0.92], opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Badge pill */}
            <rect
              x="26"
              y="294"
              width="28"
              height="22"
              rx="7"
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <text
              x="40"
              y="309.5"
              textAnchor="middle"
              fontSize="12"
              fill="#ffffff"
              className="select-none"
            >
              💩
            </text>
          </g>
        )}
      </g>

      {/* Oli's empty Amazon delivery cardboard box on the floor (Spot: 'box') */}
      <g
        onClick={() => (activeSpot === 'box' ? onPetCat?.() : onSelectSpot?.('box'))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (activeSpot === 'box') onPetCat?.();
            else onSelectSpot?.('box');
          }
        }}
        tabIndex={0}
        className="pointer-events-auto cursor-pointer focus:outline-none"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        role="button"
        aria-current={activeSpot === 'box' ? 'true' : undefined}
        aria-label={activeSpot === 'box' ? 'Pet Oli inside his delivery box' : 'Empty Amazon delivery box on the floor (cozy spot)'}
      >
        {/* Generous touch target */}
        <rect x="130" y="295" width="76" height="95" fill="transparent" style={{ pointerEvents: 'all' }} />
        {/* Soft floor shadow */}
        <ellipse cx="166" cy="382" rx="28" ry="6" fill="rgba(40,30,20,0.18)" />

        {/* Open box interior (darker kraft brown) */}
        <polygon points="140,356 192,356 186,378 144,378" fill="#9e7343" />

        {/* Left and right angled open flaps */}
        <polygon points="138,356 130,344 146,346 142,356" fill={isNight ? '#7d664d' : '#b88b56'} stroke={isNight ? '#6a543e' : '#a87c48'} strokeWidth="0.8" />
        <polygon points="194,356 202,344 186,346 190,356" fill={isNight ? '#7d664d' : '#b88b56'} stroke={isNight ? '#6a543e' : '#a87c48'} strokeWidth="0.8" />

        {/* Oli nestled inside the box (behind front cardboard panel) */}
        {activeSpot === 'box' && (
          <motion.g
            key={`cat-box-${catAnimationKey}`}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <CatAvatar
              x={134}
              y={306}
              width={64}
              height={70}
              mood={catMood}
              animation={catAnimation}
              animationKey={catAnimationKey}
              onPet={onPetCat}
              className="pointer-events-auto"
            />
          </motion.g>
        )}

        {/* Corrugated kraft cardboard exterior front panel (covers bottom of Oli) */}
        <polygon points="138,356 194,356 188,382 142,382" fill={isNight ? '#8a7155' : '#c99b64'} stroke={isNight ? '#6a543e' : '#a87c48'} strokeWidth="1" />
        {/* Top fold crease */}
        <line x1="138" y1="356" x2="194" y2="356" stroke="#deb888" strokeWidth="1.2" />

        {/* Front hanging flaps */}
        <polygon points="146,356 156,366 166,356" fill={isNight ? '#786249' : '#b0824e'} stroke={isNight ? '#6a543e' : '#9e7343'} strokeWidth="0.7" />
        <polygon points="168,356 178,366 188,356" fill={isNight ? '#786249' : '#b0824e'} stroke={isNight ? '#6a543e' : '#9e7343'} strokeWidth="0.7" />

        {/* White shipping barcode label */}
        <rect x="146" y="364" width="18" height="11" rx="1.5" fill="#faf8f2" stroke="#d5d0c5" strokeWidth="0.6" />
        <line x1="149" y1="367" x2="149" y2="372" stroke="#333" strokeWidth="0.8" />
        <line x1="151" y1="367" x2="151" y2="372" stroke="#333" strokeWidth="0.6" />
        <line x1="153" y1="367" x2="153" y2="372" stroke="#333" strokeWidth="1.2" />
        <line x1="156" y1="367" x2="156" y2="372" stroke="#333" strokeWidth="0.6" />
        <line x1="159" y1="367" x2="159" y2="372" stroke="#333" strokeWidth="1" />

        {/* Red stamped logo: "FRAGILE / OLI" */}
        <rect x="168" y="365" width="16" height="9" rx="1" fill="none" stroke="#b91c1c" strokeWidth="0.7" strokeDasharray="2 1" />
        <text x="176" y="372" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="#b91c1c" letterSpacing="0.4">
          📦 OLI
        </text>
      </g>

      {/* Fluffy cream high-pile shag rug with Moroccan grey diamond trellis pattern (PXL_20261101_155116231.jpg, Spot: 'rug') */}
      <g
        onClick={() => (activeSpot === 'rug' ? onPetCat?.() : onSelectSpot?.('rug'))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (activeSpot === 'rug') onPetCat?.();
            else onSelectSpot?.('rug');
          }
        }}
        tabIndex={0}
        className="pointer-events-auto cursor-pointer focus:outline-none"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        role="button"
        aria-current={activeSpot === 'rug' ? 'true' : undefined}
        aria-label={activeSpot === 'rug' ? 'Pet Oli on the rug' : 'Fluffy living room rug (cozy spot)'}
      >
        {/* Generous touch target */}
        <rect x="70" y="365" width="260" height="85" fill="transparent" style={{ pointerEvents: 'all' }} />
        {/* Soft drop shadow under thick shag pile */}
        <path
          d="M52 372 L348 372 L368 442 L32 442 Z"
          fill="rgba(60,48,35,0.16)"
        />
        {/* Main perspective cream shag rug silhouette */}
        <path
          d="M54 369 Q200 366 346 369 L364 438 Q200 442 36 438 Z"
          fill="url(#lr-shag)"
          stroke={isNight ? '#aca6bd' : '#dfd7c5'}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Authentic Moroccan Berber grey diamond trellis lines across the rug */}
        <g
          stroke={isNight ? '#9892ab' : '#c6bca8'}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.72"
        >
          {/* Left diamond */}
          <polygon points="122,371 174,403 118,437 64,403" />
          {/* Center diamond */}
          <polygon points="200,370 256,403 200,438 144,403" />
          {/* Right diamond */}
          <polygon points="278,371 336,403 282,437 226,403" />
        </g>

        {/* Oli sitting in all his glory in the center of the plush rug */}
        {activeSpot === 'rug' && (
          <motion.g
            key={`cat-rug-${catAnimationKey}`}
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <CatAvatar
              x={130}
              y={262}
              width={140}
              height={154}
              mood={catMood}
              animation={catAnimation}
              animationKey={catAnimationKey}
              onPet={onPetCat}
              className="pointer-events-auto"
            />
          </motion.g>
        )}
      </g>

      {/* White cuboid LED pet water fountain (foreground z-layer, far from litter box) */}
      <g
        transform="translate(262 404)"
        onClick={onTapFountain}
        onKeyDown={(e) => {
          if (onTapFountain && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onTapFountain();
          }
        }}
        tabIndex={onTapFountain ? 0 : undefined}
        className={onTapFountain ? 'pointer-events-auto cursor-pointer focus:outline-none' : undefined}
        style={onTapFountain ? { pointerEvents: 'auto', cursor: 'pointer' } : undefined}
        role={onTapFountain ? 'button' : undefined}
        aria-label={onTapFountain ? 'Refresh Oli’s water fountain' : undefined}
      >
        {/* Generous transparent touch target for mobile fingers */}
        <rect x="0" y="-8" width="50" height="60" fill="transparent" style={{ pointerEvents: 'all' }} />
        <ellipse cx="25" cy="45" rx="23" ry="5.5" fill="rgba(40,35,28,0.16)" />
        {/* White rounded-square fountain body */}
        <rect x="4" y="6" width="42" height="38" rx="7" fill={isNight ? '#d5d2e3' : '#fbfaf7'} stroke={isNight ? '#aba6bf' : '#d5d0c5'} strokeWidth="1.2" />
        {/* Top water dish recess */}
        <ellipse cx="25" cy="8" rx="18" ry="4.5" fill="#e3ecf2" />
        <ellipse cx="25" cy="8" rx="14.5" ry="3.4" fill="#7fd0f5" />
        {/* Glowing blue LED status indicator on front of fountain */}
        <circle cx="25" cy="32" r="4.5" fill="#38bdf8" opacity="0.35" />
        <motion.circle
          cx="25"
          cy="32"
          r="2.2"
          fill="#00d2ff"
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Bubbling water arch */}
        <motion.path
          d="M25 7 Q20 -2 17 7 M25 7 Q30 -2 33 7"
          stroke="#bfe8fb"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={19 + i * 6}
            r={1.4}
            fill="#ffffff"
            initial={{ cy: 8, opacity: 0 }}
            animate={{ cy: [8, -2 - (fountainBoost ? 8 : 0)], opacity: [0, 1, 0] }}
            transition={{ duration: fountainBoost ? 0.6 : 1.2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </g>
    </svg>
  );
}
