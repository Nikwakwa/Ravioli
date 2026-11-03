import { motion } from 'framer-motion';
import { CatAvatar } from '../CatAvatar';
import type { CatAnimation, CatSpot, Mood } from '../../types';

/**
 * Nico & Athina's real Living Room — crafted from the 16 photos of Oli at home:
 * - Crisp warm-white walls & large-format cream/beige travertine floor tiles + tile baseboard
 * - White-framed window with slatted roller blind, windowsill plant & white ribbed radiator below
 * - White cube bookcase/shelving unit with books, rattan basket & 3 potted plants on top (including trailing pothos)
 * - Light-wood framed landscape print with wide white mat on the wall
 * - Wooden tripod floor lamp with white drum shade
 * - Dark charcoal woven L-shaped sofa with terracotta-red, sage-olive & geometric triangle cushions + tan "Bedsure" bolster cat bed
 * - Modern white coffee table with candle jar (cork coaster removed)
 * - Fluffy off-white / cream high-pile shag rug where Oli sits
 * - White cuboid pet water fountain with glowing blue LED status light & stainless steel bowl (placed right of the rug)
 * - Modern enclosed corner litter box (positioned safely in the left corner, away from water)
 * - Empty Amazon delivery cardboard box on the floor ("If it fits, I sits!")
 */
export function LivingRoom({
  sleeping,
  fountainBoost,
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
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="lr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#232238' : '#f7f5f0'} />
          <stop offset="100%" stopColor={sleeping ? '#2f2c48' : '#ece8df'} />
        </linearGradient>
        <linearGradient id="lr-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#423d4f' : '#e8dfd0'} />
          <stop offset="100%" stopColor={sleeping ? '#332f3f' : '#d8ccb8'} />
        </linearGradient>
        <linearGradient id="lr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#131936' : '#a8dbf7'} />
          <stop offset="100%" stopColor={sleeping ? '#2c3163' : '#fff8e8'} />
        </linearGradient>
        <radialGradient id="lr-shag" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={sleeping ? '#c8c3d4' : '#fcfaf3'} />
          <stop offset="72%" stopColor={sleeping ? '#b2acc2' : '#f2ede0'} />
          <stop offset="100%" stopColor={sleeping ? '#9b95ad' : '#e3dccb'} />
        </radialGradient>
        <radialGradient id="lr-lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd98e" stopOpacity="0.88" />
          <stop offset="55%" stopColor="#ffbe5c" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ffbe5c" stopOpacity="0" />
        </radialGradient>
        <pattern id="lr-weave" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3 H6 M3 0 V6" stroke="#343942" strokeWidth="0.6" opacity="0.35" />
        </pattern>
      </defs>

      {/* Crisp warm-white wall (y: 0..314) */}
      <rect width="400" height="314" fill="url(#lr-wall)" />

      {/* Matching cream tile baseboard/skirting */}
      <rect y="305" width="400" height="10" fill={sleeping ? '#3a3548' : '#dfd5c3'} />
      <line x1="0" y1="305" x2="400" y2="305" stroke={sleeping ? '#2c2838' : '#cbc0ac'} strokeWidth="1.2" />

      {/* Large-format cream/beige travertine floor tiles (y: 315..600) */}
      <rect y="315" width="400" height="285" fill="url(#lr-floor)" />
      {/* Subtle porcelain tile grout lines */}
      {[346, 384, 428, 478].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke={sleeping ? '#2b2736' : '#c5b8a1'} strokeWidth="1" opacity="0.55" />
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
        <line key={i} x1={x1} y1={y1} x2={x1 - 12} y2={y2} stroke={sleeping ? '#2b2736' : '#c5b8a1'} strokeWidth="1" opacity="0.48" />
      ))}

      {/* White cube bookcase / Kallax shelving unit on left (y: 142..312) */}
      <g>
        {/* Outer frame */}
        <rect x="8" y="146" width="96" height="164" rx="2" fill={sleeping ? '#c7c4d4' : '#f9f8f5'} stroke={sleeping ? '#9e9ab0' : '#dcd8ce'} strokeWidth="1.5" />
        {/* Shelf cubbies (2 columns x 3 rows) */}
        <rect x="14" y="152" width="40" height="38" fill={sleeping ? '#8d899e' : '#e6e1d6'} />
        <rect x="58" y="152" width="40" height="38" fill={sleeping ? '#8d899e' : '#e6e1d6'} />
        <rect x="14" y="195" width="40" height="38" fill={sleeping ? '#8d899e' : '#e6e1d6'} />
        <rect x="58" y="195" width="40" height="38" fill={sleeping ? '#8d899e' : '#e6e1d6'} />
        {/* Lower cabinet doors */}
        <rect x="14" y="238" width="41" height="66" fill={sleeping ? '#bab6c9' : '#f3f1ec'} stroke={sleeping ? '#9e9ab0' : '#dad5ca'} strokeWidth="1" />
        <rect x="57" y="238" width="41" height="66" fill={sleeping ? '#bab6c9' : '#f3f1ec'} stroke={sleeping ? '#9e9ab0' : '#dad5ca'} strokeWidth="1" />
        <circle cx="50" cy="270" r="1.5" fill="#78756e" />
        <circle cx="62" cy="270" r="1.5" fill="#78756e" />

        {/* Woven rattan basket in top-left cubby (IMG_20250709_195907.jpg) */}
        <rect x="16" y="155" width="36" height="34" rx="2" fill="#b8804a" />
        <rect x="28" y="160" width="12" height="5" rx="2" fill="#6e4723" />
        <path d="M16 166 H52 M16 174 H52 M16 182 H52" stroke="#9c6836" strokeWidth="1" opacity="0.6" />

        {/* Colorful books in top-right & middle cubbies */}
        <rect x="61" y="160" width="5" height="29" fill="#c94a38" />
        <rect x="66.5" y="158" width="6" height="31" fill="#2f5c8f" />
        <rect x="73" y="162" width="4.5" height="27" fill="#e0a938" />
        <rect x="78" y="159" width="6" height="30" fill="#3d7a5a" />
        <rect x="85" y="164" width="5" height="25" rx="1" fill="#e8e2d5" transform="rotate(10 87 176)" />

        <rect x="17" y="204" width="5.5" height="28" fill="#5e4b8b" />
        <rect x="23" y="202" width="6" height="30" fill="#d96b43" />
        <rect x="30" y="206" width="5" height="26" fill="#468284" />
        {/* Little decorative house/jar in middle-right cubby */}
        <path d="M72 232 v-13 l6 -6 l6 6 v13 Z" fill="#f5efe6" />
        <path d="M71 219 l7 -7 l7 7 Z" fill="#c85a48" />

        {/* 3 Potted plants on top of the shelf + trailing green pothos on right (IMG_20250709_195907.jpg) */}
        {/* Left small green plant */}
        <rect x="18" y="138" width="11" height="8" rx="1.5" fill="#2c2e33" />
        <path d="M23.5 138 Q16 129 19 124 M23.5 138 Q24 126 24 121 M23.5 138 Q31 129 28 124" stroke="#558b52" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Center dark-burgundy/purple indoor plant */}
        <rect x="52" y="136" width="13" height="10" rx="2" fill="#dcd6cc" />
        <g fill="#4a2338">
          <ellipse cx="54" cy="128" rx="3" ry="8" transform="rotate(-24 54 128)" />
          <ellipse cx="58.5" cy="125" rx="3.2" ry="9" />
          <ellipse cx="63" cy="128" rx="3" ry="8" transform="rotate(24 63 128)" />
          <ellipse cx="51" cy="132" rx="2.5" ry="6" transform="rotate(-45 51 132)" fill="#632f4b" />
          <ellipse cx="66" cy="132" rx="2.5" ry="6" transform="rotate(45 66 132)" fill="#632f4b" />
        </g>
        {/* Right bushy cascading green plant */}
        <rect x="82" y="136" width="14" height="10" rx="2" fill="#8c969e" />
        <g fill="#3a7542">
          <circle cx="89" cy="130" r="8" />
          <circle cx="96" cy="134" r="7" fill="#498c52" />
          <circle cx="101" cy="142" r="6.5" />
          <circle cx="104" cy="151" r="6" fill="#498c52" />
          <circle cx="103" cy="160" r="5" />
          <circle cx="106" cy="168" r="4" fill="#5aa163" />
        </g>
      </g>

      {/* Window with white frame, slatted roller blind & white ribbed radiator below (x: 118..226) */}
      <g>
        {/* Outer white window frame */}
        <rect x="120" y="106" width="104" height="114" rx="4" fill="#ffffff" stroke="#d8d4ca" strokeWidth="1.5" />
        <rect x="126" y="112" width="92" height="102" rx="2" fill="url(#lr-sky)" />
        {sleeping ? (
          <g>
            <circle cx="194" cy="144" r="10" fill="#fff6d8" />
            <circle cx="199" cy="140" r="9" fill="#1b2147" />
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
          </g>
        ) : (
          <g>
            <motion.g animate={{ x: [0, 12, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}>
              <ellipse cx="158" cy="150" rx="16" ry="6" fill="#fff" opacity="0.9" />
              <ellipse cx="170" cy="146" rx="11" ry="6" fill="#fff" opacity="0.9" />
            </motion.g>
          </g>
        )}
        {/* Slatted roller blind / shutter at top of window (with tiny light perforations like IMG_20250802_084158.jpg) */}
        <rect x="126" y="112" width="92" height="22" fill={sleeping ? '#3a3d4d' : '#7b808a'} />
        {[116, 121, 126, 131].map((y) => (
          <line key={y} x1="126" y1={y} x2="218" y2={y} stroke="#eff2f7" strokeWidth="1" strokeDasharray="2 3" opacity={sleeping ? 0.25 : 0.75} />
        ))}
        {/* Center window mullion & handle */}
        <rect x="170.5" y="112" width="3" height="102" fill="#ffffff" />
        <rect x="174" y="160" width="2" height="9" rx="1" fill="#b8b5ad" />
        {/* White windowsill (Spot: 'window') */}
        <g
          onClick={() => (activeSpot === 'window' ? onPetCat?.() : onSelectSpot?.('window'))}
          className="pointer-events-auto cursor-pointer"
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

        {/* Potted green plant on windowsill (PXL_20260215_160817495.jpg) */}
        <ellipse cx="144" cy="213" rx="8" ry="6" fill="#5b6068" />
        <g fill="#4c9150">
          <ellipse cx="139" cy="204" rx="3.5" ry="7" transform="rotate(-22 139 204)" />
          <ellipse cx="144" cy="202" rx="3.5" ry="8" />
          <ellipse cx="149" cy="204" rx="3.5" ry="7" transform="rotate(24 149 204)" />
        </g>

        {/* White vertical-ribbed radiator under window + round thermostat dial (IMG_20250802_104208.jpg) */}
        <rect x="122" y="232" width="94" height="58" rx="4" fill={sleeping ? '#b8b5c7' : '#f7f6f2'} stroke={sleeping ? '#8e8ba1' : '#d8d4c9'} strokeWidth="1.2" />
        {Array.from({ length: 11 }).map((_, i) => (
          <rect
            key={i}
            x={127 + i * 8}
            y={236}
            width={4}
            height={50}
            rx={1.5}
            fill={sleeping ? '#9e9bb0' : '#e6e3da'}
          />
        ))}
        {/* Radiator thermostat valve on right */}
        <circle cx="221" cy="240" r="4.5" fill="#f0eee9" stroke="#bab5a9" strokeWidth="1" />
        <circle cx="221" cy="240" r="2" fill="#9c988e" />
      </g>

      {/* Light-wood framed landscape print with wide white mat (PXL_20260321_203920849.jpg) */}
      <g>
        <rect x="294" y="118" width="54" height="44" rx="2" fill="#c89e6e" stroke="#9e7649" strokeWidth="1.2" />
        <rect x="297" y="121" width="48" height="38" fill="#faf8f5" />
        {/* Landscape picture inside mat */}
        <rect x="305" y="128" width="32" height="24" fill="#d8cfc4" />
        <path d="M305 144 Q314 138 322 142 T337 139 V152 H305 Z" fill="#8b7362" />
        <path d="M305 147 Q318 144 337 146 V152 H305 Z" fill="#5e493b" />
      </g>

      {/* Wooden tripod floor lamp with round white drum shade (IMG_20250812_201843.jpg) */}
      <g>
        <motion.circle
          cx="256"
          cy="198"
          r="118"
          fill="url(#lr-lamp)"
          animate={{ opacity: sleeping ? 0.95 : 0.22 }}
          transition={{ duration: 0.8 }}
        />
        {/* Wooden tripod legs */}
        <line x1="256" y1="212" x2="241" y2="314" stroke="#cfa46e" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="256" y1="212" x2="271" y2="314" stroke="#cfa46e" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="256" y1="212" x2="256" y2="316" stroke="#b58954" strokeWidth="2.6" strokeLinecap="round" />
        <rect x="249" y="210" width="14" height="4" rx="1.5" fill="#b58954" />
        {/* White cylinder drum shade */}
        <rect
          x="237"
          y="174"
          width="38"
          height="36"
          rx="3"
          fill={sleeping ? '#ffe8ad' : '#fcfbf7'}
          stroke={sleeping ? '#e0b96c' : '#dedad0'}
          strokeWidth="1.2"
        />
      </g>

      {/* Dark charcoal woven fabric L-shaped sofa (x: 196..398, y: 226..374) */}
      <g>
        {/* Sofa backrest cushions */}
        <rect x="200" y="228" width="196" height="58" rx="10" fill="#3e444f" />
        <rect x="206" y="234" width="90" height="46" rx="7" fill="#4a515e" />
        <rect x="300" y="234" width="90" height="46" rx="7" fill="#4a515e" />
        <rect x="206" y="234" width="184" height="46" rx="7" fill="url(#lr-weave)" />

        {/*Throw Pillows from Oli's photos! */}
        {/* 1. Sage / olive-yellow pillow (IMG_20250707_182932.jpg & IMG_20250709_195907.jpg) */}
        <rect x="208" y="240" width="34" height="32" rx="6" fill="#c7bf74" stroke="#9e9650" strokeWidth="0.8" transform="rotate(-6 225 256)" />
        {/* 2. Terracotta / rust-red woven pillow (IMG_20250802_084158.jpg) */}
        <rect x="234" y="244" width="34" height="30" rx="6" fill="#b54738" stroke="#8f3226" strokeWidth="0.8" transform="rotate(4 251 259)" />
        {/* 3. Geometric triangle patchwork pillow (IMG_20250802_084158.jpg) */}
        <g transform="translate(268 238) rotate(-3)">
          <rect x="0" y="0" width="38" height="34" rx="5" fill="#f2efe9" stroke="#ccc6ba" strokeWidth="0.8" />
          <polygon points="0,0 19,0 9.5,17" fill="#9ea3a8" />
          <polygon points="19,0 38,0 28.5,17" fill="#d4cab8" />
          <polygon points="9.5,17 28.5,17 19,0" fill="#faf8f4" />
          <polygon points="0,34 19,34 9.5,17" fill="#d4cab8" />
          <polygon points="19,34 38,34 28.5,17" fill="#7c8288" />
          <polygon points="9.5,17 28.5,17 19,34" fill="#e6e1d6" />
        </g>
        {/* 4. Second terracotta pillow on right */}
        <rect x="354" y="242" width="32" height="30" rx="6" fill="#b54738" transform="rotate(8 370 257)" />

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
          className="pointer-events-auto cursor-pointer"
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

      {/* Modern white coffee table (x: 256..396, y: 342..392) */}
      <g>
        {/* Table shadow */}
        <polygon points="262,386 398,386 400,358 278,358" fill="rgba(35,30,22,0.14)" />
        {/* Table legs & apron */}
        <rect x="266" y="354" width="8" height="32" fill="#dcd9d0" />
        <rect x="272" y="354" width="128" height="16" fill="#e6e3da" />
        {/* Crisp white tabletop */}
        <polygon points="262,354 398,354 400,334 282,334" fill="#ffffff" stroke="#dedad0" strokeWidth="1" />
      </g>

      {/* Oli's modern two-tone enclosed litter box in the left corner (repositioned to x=72..132, 100% on screen, far from water) */}
      <g
        transform="translate(62 0)"
        onClick={onTapLitterBox}
        className={onTapLitterBox ? 'pointer-events-auto cursor-pointer' : undefined}
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
          fill={sleeping ? '#6a6773' : '#8e8b86'}
          stroke={sleeping ? '#54515c' : '#76736e'}
          strokeWidth="1"
        />
        {/* Bottom base lip/runners */}
        <rect
          x="8"
          y="367"
          width="64"
          height="4"
          rx="2"
          fill={sleeping ? '#5a5763' : '#7b7873'}
        />
        {/* Recessed front pull handle on drawer face (centered at x=40) */}
        <rect
          x="28"
          y="353"
          width="24"
          height="11"
          rx="3"
          fill={sleeping ? '#4c4954' : '#696662'}
        />
        <rect
          x="30"
          y="355"
          width="20"
          height="4"
          rx="1.5"
          fill={sleeping ? '#7d7a87' : '#a19e99'}
        />

        {/* Off-white / light cream enclosed upper hood */}
        <rect
          x="10"
          y="318"
          width="60"
          height="31"
          rx="6"
          fill={sleeping ? '#cac6d6' : '#f5f3ec'}
          stroke={sleeping ? '#9e9ab0' : '#dad5cb'}
          strokeWidth="1.2"
        />
        {/* Split seam line between hood and drawer base */}
        <line
          x1="10"
          y1="346"
          x2="70"
          y2="346"
          stroke={sleeping ? '#6a6773' : '#7c7974'}
          strokeWidth="1"
        />

        {/* Roof top panel with rounded corners (centered at x=40) */}
        <rect
          x="10"
          y="316"
          width="60"
          height="5"
          rx="2.5"
          fill={sleeping ? '#bab7c7' : '#ece9e0'}
          stroke={sleeping ? '#9e9ab0' : '#d8d4ca'}
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
          stroke={sleeping ? '#8a8799' : '#ccc8be'}
          strokeWidth="0.8"
          strokeDasharray="2 1.5"
        />
        <line
          x1="53"
          y1="318.5"
          x2="65"
          y2="318.5"
          stroke={sleeping ? '#8a8799' : '#ccc8be'}
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
          fill={sleeping ? '#383542' : '#454342'}
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
        className="pointer-events-auto cursor-pointer"
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
        <polygon points="138,356 130,344 146,346 142,356" fill={sleeping ? '#7d664d' : '#b88b56'} stroke={sleeping ? '#6a543e' : '#a87c48'} strokeWidth="0.8" />
        <polygon points="194,356 202,344 186,346 190,356" fill={sleeping ? '#7d664d' : '#b88b56'} stroke={sleeping ? '#6a543e' : '#a87c48'} strokeWidth="0.8" />

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
        <polygon points="138,356 194,356 188,382 142,382" fill={sleeping ? '#8a7155' : '#c99b64'} stroke={sleeping ? '#6a543e' : '#a87c48'} strokeWidth="1" />
        {/* Top fold crease */}
        <line x1="138" y1="356" x2="194" y2="356" stroke="#deb888" strokeWidth="1.2" />

        {/* Front hanging flaps */}
        <polygon points="146,356 156,366 166,356" fill={sleeping ? '#786249' : '#b0824e'} stroke={sleeping ? '#6a543e' : '#9e7343'} strokeWidth="0.7" />
        <polygon points="168,356 178,366 188,356" fill={sleeping ? '#786249' : '#b0824e'} stroke={sleeping ? '#6a543e' : '#9e7343'} strokeWidth="0.7" />

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

      {/* Fluffy off-white / cream high-pile shag rug — centered where Oli sits (Spot: 'rug') */}
      <g
        onClick={() => (activeSpot === 'rug' ? onPetCat?.() : onSelectSpot?.('rug'))}
        className="pointer-events-auto cursor-pointer"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        role="button"
        aria-current={activeSpot === 'rug' ? 'true' : undefined}
        aria-label={activeSpot === 'rug' ? 'Pet Oli on the rug' : 'Fluffy living room rug (cozy spot)'}
      >
        {/* Generous touch target */}
        <rect x="70" y="365" width="260" height="85" fill="transparent" style={{ pointerEvents: 'all' }} />
        {/* Soft drop shadow under thick shag pile */}
        <path
          d="M42 404 Q48 368 198 366 Q348 368 362 406 Q368 442 198 444 Q36 442 42 404 Z"
          fill="rgba(60,48,35,0.16)"
        />
        {/* Main high-pile cream shag silhouette */}
        <path
          d="M44 401 Q50 365 198 363 Q346 365 360 403 Q366 438 198 440 Q38 438 44 401 Z"
          fill="url(#lr-shag)"
          stroke={sleeping ? '#aca6bd' : '#dfd7c5'}
          strokeWidth="2"
          strokeDasharray="6 3"
        />
        {/* Fluffy shaggy yarn tufts & texture across the rug */}
        <g stroke={sleeping ? '#9e98b0' : '#d8ceba'} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.85">
          {[
            [72, 392], [96, 384], [128, 378], [164, 375], [204, 376], [244, 378], [282, 383], [316, 390],
            [64, 408], [92, 402], [122, 398], [156, 395], [238, 396], [274, 401], [308, 406], [336, 412],
            [78, 424], [112, 420], [148, 423], [188, 426], [228, 425], [266, 422], [302, 424], [328, 426],
          ].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y} l5 -3 m-1 4 l6 -1 m-10 0 l-4 -2`} />
          ))}
        </g>
        <g stroke={sleeping ? '#dcd8eb' : '#ffffff'} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9">
          {[
            [84, 388], [114, 382], [148, 379], [184, 377], [222, 379], [262, 382], [298, 388],
            [74, 414], [104, 412], [136, 415], [252, 414], [288, 413], [320, 416],
            [94, 428], [132, 430], [172, 431], [212, 431], [248, 429], [284, 428],
          ].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y} l6 -2 m-2 3 l5 0`} />
          ))}
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
        className={onTapFountain ? 'pointer-events-auto cursor-pointer' : undefined}
        style={onTapFountain ? { pointerEvents: 'auto', cursor: 'pointer' } : undefined}
        role={onTapFountain ? 'button' : undefined}
        aria-label={onTapFountain ? 'Refresh Oli’s water fountain' : undefined}
      >
        {/* Generous transparent touch target for mobile fingers */}
        <rect x="0" y="-8" width="50" height="60" fill="transparent" style={{ pointerEvents: 'all' }} />
        <ellipse cx="25" cy="45" rx="23" ry="5.5" fill="rgba(40,35,28,0.16)" />
        {/* White rounded-square fountain body */}
        <rect x="4" y="6" width="42" height="38" rx="7" fill={sleeping ? '#d5d2e3' : '#fbfaf7'} stroke={sleeping ? '#aba6bf' : '#d5d0c5'} strokeWidth="1.2" />
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
