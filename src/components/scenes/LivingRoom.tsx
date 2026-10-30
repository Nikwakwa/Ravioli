import { motion } from 'framer-motion';

/**
 * Cozy living room: plush rug, cat tree, dark-gray angle sofa, plants and a
 * bubbling stainless steel water fountain.
 *
 * Stage geometry is calibrated for a 400×600 portrait viewport where:
 * - Top HUD occupies y ≈ 0..108
 * - Open stage window is y ≈ 108..436
 * - Oli sits on the plush rug at y ≈ 340..425
 * - Bottom ActivityFeed + ActionDock occupies y ≈ 436..600
 */
export function LivingRoom({ sleeping, fountainBoost }: { sleeping: boolean; fountainBoost: boolean }) {
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="lr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#2c2747' : '#f5e2cc'} />
          <stop offset="100%" stopColor={sleeping ? '#3a3154' : '#ebd0b3'} />
        </linearGradient>
        <linearGradient id="lr-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#5e4638' : '#cb9c70'} />
          <stop offset="100%" stopColor={sleeping ? '#443228' : '#b28056'} />
        </linearGradient>
        <linearGradient id="lr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#141b3d' : '#96d4f7'} />
          <stop offset="100%" stopColor={sleeping ? '#32356b' : '#fff2d6'} />
        </linearGradient>
        <radialGradient id="lr-rug" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbf0e2" />
          <stop offset="68%" stopColor="#efd4b6" />
          <stop offset="100%" stopColor="#dfba94" />
        </radialGradient>
        <linearGradient id="lr-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9aa7b4" />
          <stop offset="35%" stopColor="#f3f7fa" />
          <stop offset="65%" stopColor="#c3ced8" />
          <stop offset="100%" stopColor="#8493a2" />
        </linearGradient>
        <radialGradient id="lr-lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd78a" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#ffbe5c" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ffbe5c" stopOpacity="0" />
        </radialGradient>
        <pattern id="lr-dots" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="13" cy="13" r="1.4" fill={sleeping ? '#4b4068' : '#e2c2a0'} />
        </pattern>
      </defs>

      {/* Wall (y: 0..316) */}
      <rect width="400" height="316" fill="url(#lr-wall)" />
      <rect width="400" height="316" fill="url(#lr-dots)" opacity="0.65" />
      {/* Baseboard */}
      <rect y="306" width="400" height="12" fill={sleeping ? '#4d3d56' : '#e0c09d'} />
      <line x1="0" y1="306" x2="400" y2="306" stroke={sleeping ? '#3a2d42' : '#cfa982'} strokeWidth="1.5" />

      {/* Floor (y: 316..600) */}
      <rect y="316" width="400" height="284" fill="url(#lr-floor)" />
      {[344, 376, 412, 452, 496].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#8f623f" strokeWidth="1.1" opacity="0.38" />
      ))}
      {[
        [72, 316, 344],
        [235, 344, 376],
        [140, 376, 412],
        [310, 376, 412],
        [90, 412, 452],
        [270, 412, 452],
      ].map(([x, y1, y2], i) => (
        <line key={i} x1={x} y1={y1} x2={x} y2={y2} stroke="#8f623f" strokeWidth="1.1" opacity="0.35" />
      ))}

      {/* Window (center-left wall, y: 108..236) */}
      <g>
        <rect x="122" y="110" width="104" height="122" rx="10" fill="#fff8ee" />
        <rect x="129" y="117" width="90" height="108" rx="6" fill="url(#lr-sky)" />
        {sleeping ? (
          <g>
            <circle cx="196" cy="142" r="11" fill="#fff6d8" />
            <circle cx="201" cy="138" r="10" fill="#1e244d" />
            {[
              [142, 134],
              [162, 158],
              [206, 172],
              [148, 192],
              [188, 204],
            ].map(([x, y], i) => (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r={1.4}
                fill="#fff"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2 + i * 0.4, repeat: Infinity }}
              />
            ))}
          </g>
        ) : (
          <g>
            <motion.g animate={{ x: [0, 14, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}>
              <ellipse cx="158" cy="148" rx="18" ry="7" fill="#fff" opacity="0.92" />
              <ellipse cx="170" cy="143" rx="12" ry="7" fill="#fff" opacity="0.92" />
            </motion.g>
            <path d="M129 202 Q160 185 190 198 T219 192 V225 H129 Z" fill="#9bc989" opacity="0.75" />
          </g>
        )}
        <rect x="172" y="117" width="3.5" height="108" fill="#fff8ee" />
        <rect x="129" y="170" width="90" height="3.5" fill="#fff8ee" />
        <rect x="115" y="230" width="118" height="8" rx="4" fill="#f7ead9" />
        {/* Curtains */}
        <path d="M108 104 Q114 168 106 244 L126 244 Q120 168 128 104 Z" fill="#e59a73" />
        <path d="M240 104 Q234 168 242 244 L222 244 Q228 168 220 104 Z" fill="#e59a73" />
        <rect x="102" y="99" width="144" height="6" rx="3" fill="#9b7350" />
        {/* Sill plant */}
        <path d="M144 230 h18 l-2.5 -13 h-13 Z" fill="#d98b5f" />
        <g fill="#68a669">
          <ellipse cx="149" cy="211" rx="4" ry="8" transform="rotate(-24 149 211)" />
          <ellipse cx="157" cy="210" rx="4" ry="9" transform="rotate(20 157 210)" />
          <ellipse cx="153" cy="207" rx="3.5" ry="9" />
        </g>
      </g>

      {/* Framed paw art */}
      <g>
        <rect x="284" y="122" width="48" height="56" rx="4" fill="#8a6446" />
        <rect x="288" y="126" width="40" height="48" rx="2" fill="#fbf2e6" />
        <g fill="#f08a3c">
          <ellipse cx="308" cy="156" rx="8" ry="6" />
          <circle cx="299" cy="146" r="3" />
          <circle cx="305" cy="142" r="3" />
          <circle cx="311" cy="142" r="3" />
          <circle cx="317" cy="146" r="3" />
        </g>
      </g>

      {/* Floor lamp + warm sleep glow */}
      <g>
        <motion.circle
          cx="204"
          cy="210"
          r="125"
          fill="url(#lr-lamp)"
          animate={{ opacity: sleeping ? 1 : 0.15 }}
          transition={{ duration: 0.8 }}
        />
        <rect x="202" y="206" width="4" height="114" fill="#7a6250" />
        <ellipse cx="204" cy="320" rx="14" ry="4" fill="#5d4a3c" />
        <path d="M188 186 h32 l7 22 h-46 Z" fill={sleeping ? '#ffe3a3' : '#f6e7cf'} />
      </g>

      {/* Cozy dark-gray angle sofa (L-shape on right, y: 232..374) */}
      <g>
        <rect x="224" y="232" width="182" height="62" rx="14" fill="#4a4e57" />
        <rect x="232" y="242" width="76" height="46" rx="10" fill="#595e68" />
        <rect x="312" y="242" width="84" height="46" rx="10" fill="#595e68" />
        <rect x="216" y="278" width="190" height="38" rx="10" fill="#3f434b" />
        <rect x="224" y="276" width="94" height="19" rx="8" fill="#616670" />
        {/* Chaise extending forward */}
        <path d="M314 276 h92 v84 a12 12 0 0 1 -12 12 h-68 a12 12 0 0 1 -12 -12 Z" fill="#3f434b" />
        <rect x="320" y="276" width="80" height="72" rx="9" fill="#616670" />
        <rect x="210" y="258" width="20" height="58" rx="9" fill="#43474f" />
        {/* Mustard throw pillow + terracotta knit blanket */}
        <rect x="244" y="250" width="34" height="28" rx="8" fill="#e5ab3e" transform="rotate(-8 261 264)" />
        <path d="M326 302 h68 v38 q-34 8 -68 0 Z" fill="#d97f63" opacity="0.94" />
        <path d="M326 312 h68 M326 322 h68 M326 332 h68" stroke="#c5694d" strokeWidth="1.8" />
        {/* Legs */}
        <rect x="222" y="315" width="7" height="8" rx="2" fill="#2b2e33" />
        <rect x="324" y="370" width="7" height="8" rx="2" fill="#2b2e33" />
        <rect x="388" y="370" width="7" height="8" rx="2" fill="#2b2e33" />
      </g>

      {/* Cat tree (left side, y: 146..366) */}
      <g>
        <rect x="36" y="158" width="13" height="202" fill="#d9c49f" />
        {[176, 200, 224, 248, 272, 296, 320, 344].map((y) => (
          <line key={y} x1="36" y1={y} x2="49" y2={y + 5} stroke="#b8a17a" strokeWidth="1.4" />
        ))}
        <rect x="68" y="254" width="11" height="106" fill="#d9c49f" />
        {/* Top perch bed */}
        <rect x="12" y="146" width="66" height="14" rx="6" fill="#8b6a52" />
        <path d="M20 146 q25 -20 50 0 Z" fill="#a88269" />
        {/* Middle platform */}
        <rect x="30" y="244" width="64" height="12" rx="6" fill="#8b6a52" />
        {/* Base */}
        <rect x="10" y="354" width="88" height="14" rx="6" fill="#8b6a52" />
        {/* Dangling pom-pom */}
        <motion.g
          style={{ originX: 0.5, originY: 0 }}
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <line x1="86" y1="256" x2="86" y2="284" stroke="#6e5546" strokeWidth="1.2" />
          <circle cx="86" cy="288" r="5" fill="#ef5f8f" />
        </motion.g>
      </g>

      {/* Potted monstera plant (left-center, y: 274..352) */}
      <g>
        <path d="M106 320 h32 l-5 28 h-22 Z" fill="#ece6dd" />
        <rect x="103" y="315" width="38" height="8" rx="3.5" fill="#d8cfc3" />
        <g fill="#4f8f58">
          <path d="M122 316 C100 298 95 276 107 264 C119 276 124 294 122 316 Z" />
          <path d="M122 316 C140 294 154 286 160 294 C154 308 140 316 122 316 Z" fill="#5fa868" />
          <path d="M122 316 C116 286 122 260 135 254 C140 272 133 296 122 316 Z" fill="#478a51" />
        </g>
      </g>

      {/* Plush rug — centered right where Oli sits (cy = 398) */}
      <ellipse cx="195" cy="402" rx="146" ry="42" fill="#cfa37a" />
      <ellipse cx="195" cy="398" rx="140" ry="39" fill="url(#lr-rug)" />
      <ellipse cx="195" cy="398" rx="108" ry="29" fill="none" stroke="#e7b9a1" strokeWidth="4.5" opacity="0.85" />
      <ellipse cx="195" cy="398" rx="74" ry="19" fill="none" stroke="#f2cdb8" strokeWidth="3.5" opacity="0.85" />

      {/* Bubbling stainless steel water fountain — visible on right of rug (x=318, y=384) */}
      <g transform="translate(314 382)">
        <ellipse cx="28" cy="34" rx="32" ry="6.5" fill="rgba(40,25,15,0.24)" />
        <path d="M0 8 h56 l-5 26 h-46 Z" fill="url(#lr-steel)" />
        <ellipse cx="28" cy="8" rx="28" ry="6.5" fill="#e6edf3" />
        <ellipse cx="28" cy="8" rx="23" ry="4.8" fill="#7fd0f5" />
        <rect x="23.5" y="-10" width="9" height="17" rx="3" fill="url(#lr-steel)" />
        <ellipse cx="28" cy="-10" rx="6.5" ry="2.2" fill="#f2f6f9" />
        {/* Water arch */}
        <motion.path
          d="M28 -12 Q20 -15 17 5 M28 -12 Q36 -15 39 5"
          stroke="#bfe8fb"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
        {[0, 1, 2, 3].map((i) => (
          <motion.circle
            key={i}
            cx={20 + i * 5}
            r={1.6}
            fill="#ffffff"
            initial={{ cy: 8, opacity: 0 }}
            animate={{ cy: [8, -4 - (fountainBoost ? 10 : 0)], opacity: [0, 1, 0] }}
            transition={{ duration: fountainBoost ? 0.65 : 1.3, repeat: Infinity, delay: i * 0.28 }}
          />
        ))}
        {[0, 0.7].map((d) => (
          <motion.ellipse
            key={d}
            cx="28"
            cy="8"
            fill="none"
            stroke="#fff"
            strokeWidth={0.9}
            initial={{ rx: 3, ry: 0.9, opacity: 0.85 }}
            animate={{ rx: 22, ry: 4.2, opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, delay: d }}
          />
        ))}
      </g>

      {/* Little toy mouse on the left edge of the rug */}
      <g transform="translate(56 410) rotate(-14)">
        <ellipse cx="0" cy="0" rx="11" ry="6.5" fill="#b9b2c9" />
        <circle cx="-8" cy="-4.5" r="3.2" fill="#d9c6e8" />
        <path d="M11 0 q9 2 13 -5" stroke="#8f86a3" strokeWidth="1.5" fill="none" />
        <circle cx="-10" cy="0" r="1" fill="#3d3549" />
      </g>
    </svg>
  );
}
