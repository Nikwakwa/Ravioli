import { AnimatePresence, motion } from 'framer-motion';
import type { RoomMess } from '../../types';

const MESS_SLOTS: Record<0 | 1 | 2, { x: number; y: number }> = {
  0: { x: 294, y: 404 },
  1: { x: 108, y: 414 },
  2: { x: 268, y: 428 },
};

/**
 * Nico & Athina's real Living Room — crafted from the 16 photos of Oli at home:
 * - Crisp warm-white walls & large-format cream/beige travertine floor tiles + tile baseboard
 * - White-framed window with slatted roller blind, windowsill plant & white ribbed radiator below
 * - White cube bookcase/shelving unit with books, rattan basket & 3 potted plants on top (including trailing pothos)
 * - Light-wood framed landscape print with wide white mat on the wall
 * - Wooden tripod floor lamp with white drum shade
 * - Dark charcoal woven L-shaped sofa with terracotta-red, sage-olive & geometric triangle cushions + tan "Bedsure" bolster cat bed
 * - Modern white coffee table with cork coaster & candle jar
 * - Fluffy off-white / cream high-pile shag rug where Oli sits
 * - White cuboid pet water fountain with glowing blue LED status light & stainless steel bowl
 */
export function LivingRoom({
  sleeping,
  fountainBoost,
  onTapFountain,
  messes = [],
  onTapMess,
}: {
  sleeping: boolean;
  fountainBoost: boolean;
  onTapFountain?: () => void;
  messes?: RoomMess[];
  onTapMess?: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
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
        {/* White windowsill */}
        <rect x="115" y="218" width="114" height="6" rx="2" fill="#ffffff" stroke="#d5d0c5" strokeWidth="1" />

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
        <rect x="202" y="270" width="108" height="22" rx="6" fill="#525a68" />
        <rect x="202" y="270" width="108" height="22" rx="6" fill="url(#lr-weave)" />

        {/* Chaise longue extending forward on right */}
        <path d="M308 270 h90 v84 a10 10 0 0 1 -10 10 h-70 a10 10 0 0 1 -10 -10 Z" fill="#353a44" />
        <rect x="312" y="270" width="82" height="72" rx="7" fill="#525a68" />
        <rect x="312" y="270" width="82" height="72" rx="7" fill="url(#lr-weave)" />
        {/* Left armrest */}
        <rect x="190" y="254" width="16" height="58" rx="7" fill="#3b414c" />

        {/* Oli's tan suede "Bedsure Comfy Pet" bolster bed on the sofa chaise (PXL_20260104_123003020.jpg) */}
        <g transform="translate(320 286)">
          {/* Cream sherpa inner cushion */}
          <rect x="6" y="4" width="52" height="28" rx="8" fill="#f5ece0" />
          {/* Tan suede bolster walls */}
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

      {/* Modern white coffee table with cork coaster & candle jar (x: 256..396, y: 342..392) */}
      <g>
        {/* Table shadow */}
        <polygon points="262,386 398,386 400,358 278,358" fill="rgba(35,30,22,0.14)" />
        {/* Table legs & apron */}
        <rect x="266" y="354" width="8" height="32" fill="#dcd9d0" />
        <rect x="272" y="354" width="128" height="16" fill="#e6e3da" />
        {/* Crisp white tabletop */}
        <polygon points="262,354 398,354 400,334 282,334" fill="#ffffff" stroke="#dedad0" strokeWidth="1" />
        {/* Round cork coaster (IMG_20251030_201609.jpg) */}
        <ellipse cx="298" cy="344" rx="9" ry="3.2" fill="#b88456" stroke="#99683d" strokeWidth="0.6" />
        {/* Little glass candle jar */}
        <rect x="350" y="335" width="9" height="11" rx="2" fill="#f2efe9" stroke="#ccc7bc" strokeWidth="0.8" />
        <ellipse cx="354.5" cy="335" rx="4.5" ry="1.4" fill="#ffffff" stroke="#ccc7bc" strokeWidth="0.8" />
      </g>

      {/* White cuboid LED pet water fountain + stainless bowl by the left wall (PXL_20260321_203920849.jpg) */}
      <g
        transform="translate(36 350)"
        onClick={onTapFountain}
        className={onTapFountain ? 'pointer-events-auto cursor-pointer' : undefined}
        style={onTapFountain ? { pointerEvents: 'auto', cursor: 'pointer' } : undefined}
        role={onTapFountain ? 'button' : undefined}
        aria-label={onTapFountain ? 'Refresh Oli’s water fountain' : undefined}
      >
        {/* Generous transparent touch target for mobile fingers */}
        <rect x="-10" y="-12" width="96" height="68" fill="transparent" style={{ pointerEvents: 'all' }} />
        <ellipse cx="26" cy="46" rx="34" ry="7" fill="rgba(40,35,28,0.16)" />
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
        {/* Little stainless steel bowl next to the fountain */}
        <path d="M52 34 h22 l-2.5 9 h-17 Z" fill="#b8c2cc" stroke="#8e99a4" strokeWidth="0.8" />
        <ellipse cx="63" cy="34" rx="11" ry="2.8" fill="#e1e7ed" stroke="#8e99a4" strokeWidth="0.8" />
      </g>

      {/* Fluffy off-white / cream high-pile shag rug — centered where Oli sits (IMG_20251030_201609.jpg) */}
      <g>
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
      </g>

      {/* Tamagotchi-style on-screen messes (poop & hairballs) on the rug — tap to scoop! */}
      <AnimatePresence>
        {messes.map((mess) => {
          const pos = MESS_SLOTS[mess.slot] ?? MESS_SLOTS[0];
          const isPoop = mess.kind === 'poop';
          return (
            <motion.g
              key={mess.id}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.2, y: -12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              transform={`translate(${pos.x} ${pos.y})`}
              onClick={() => onTapMess?.(mess.id)}
              className="pointer-events-auto cursor-pointer"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              role="button"
              aria-label={isPoop ? 'Scoop poop mess' : 'Clean ginger hairball'}
            >
              {/* Generous 48x48 invisible touch hitbox for mobile fingers */}
              <rect x="-24" y="-30" width="48" height="48" fill="transparent" style={{ pointerEvents: 'all' }} />

              {/* Subtle pulsing attention ring */}
              <motion.ellipse
                cx="0"
                cy="4"
                rx="16"
                ry="7"
                fill="none"
                stroke={isPoop ? '#b45309' : '#ea580c'}
                strokeWidth="1.2"
                strokeDasharray="3 2"
                animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.35, 0.75, 0.35] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Ground shadow */}
              <ellipse cx="0" cy="6" rx="12" ry="4" fill="rgba(45,30,18,0.22)" />

              {isPoop ? (
                /* Classic Tamagotchi coiled poop swirl */
                <g>
                  <ellipse cx="0" cy="4" rx="10" ry="4" fill="#7c4722" stroke="#4f2b12" strokeWidth="1.1" />
                  <ellipse cx="0" cy="0" rx="7.5" ry="3.4" fill="#8d532a" stroke="#4f2b12" strokeWidth="1.1" />
                  <path
                    d="M-4.5 -2 C-4 -6 2 -6 1 -9.5 C3.8 -7.5 5 -3.5 4.5 -2 Z"
                    fill="#9c5e32"
                    stroke="#4f2b12"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                  <ellipse cx="-2.5" cy="2" rx="2" ry="0.9" fill="#b67849" opacity="0.7" />
                </g>
              ) : (
                /* Fuzzy ginger tabby hairball tuft */
                <g>
                  <ellipse cx="0" cy="2" rx="10.5" ry="5.5" fill="#e0782d" stroke="#8a4212" strokeWidth="1.1" />
                  <circle cx="-4" cy="0" r="4.5" fill="#f08a3c" />
                  <circle cx="4" cy="1" r="4.2" fill="#d96b22" />
                  <circle cx="0" cy="-1.5" r="4.5" fill="#f6a25c" />
                  <path
                    d="M-9 1 l-3 -2 M8 -1 l3 -2 M-3 -5 l-1 -3 M3 -4 l2 -3 M-5 4 l2 -1.5 M3 4 l-2 -1.5"
                    stroke="#8a4212"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* Animated Tamagotchi stink waves rising above the mess */}
              {[-5, 0, 5].map((dx, i) => (
                <motion.path
                  key={i}
                  d={`M${dx} -11 Q${dx - 2} -15 ${dx} -18 Q${dx + 2} -21 ${dx} -24`}
                  stroke={isPoop ? '#65a30d' : '#d97706'}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  fill="none"
                  animate={{ y: [0, -5, 0], opacity: [0.35, 0.9, 0.35] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                />
              ))}
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
}
