import { motion } from 'framer-motion';

/**
 * Cozy living room: plush rug, cat tree, dark-gray angle sofa, plants and a
 * bubbling stainless steel water fountain. ViewBox 400×600, floor line ≈ y 400.
 */
export function LivingRoom({ sleeping, fountainBoost }: { sleeping: boolean; fountainBoost: boolean }) {
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="lr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3dfc8" />
          <stop offset="100%" stopColor="#ecd2b5" />
        </linearGradient>
        <linearGradient id="lr-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c99a6e" />
          <stop offset="100%" stopColor="#b5845a" />
        </linearGradient>
        <linearGradient id="lr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#1d2550' : '#9fd8f5'} />
          <stop offset="100%" stopColor={sleeping ? '#3b3f74' : '#fff0cf'} />
        </linearGradient>
        <radialGradient id="lr-rug" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f7e4cf" />
          <stop offset="70%" stopColor="#eccfb0" />
          <stop offset="100%" stopColor="#dfba95" />
        </radialGradient>
        <linearGradient id="lr-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9aa7b4" />
          <stop offset="35%" stopColor="#eef3f7" />
          <stop offset="60%" stopColor="#c3ced8" />
          <stop offset="100%" stopColor="#8796a5" />
        </linearGradient>
        <radialGradient id="lr-lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd38a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffd38a" stopOpacity="0" />
        </radialGradient>
        <pattern id="lr-dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1.6" fill="#e3c4a3" />
        </pattern>
      </defs>

      {/* Wall */}
      <rect width="400" height="400" fill="url(#lr-wall)" />
      <rect width="400" height="400" fill="url(#lr-dots)" opacity="0.7" />
      <rect y="388" width="400" height="14" fill="#e2c3a1" />

      {/* Window */}
      <g>
        <rect x="128" y="96" width="112" height="150" rx="10" fill="#fff8ee" />
        <rect x="136" y="104" width="96" height="134" rx="6" fill="url(#lr-sky)" />
        {sleeping ? (
          <g>
            <circle cx="206" cy="132" r="12" fill="#fff6d8" />
            <circle cx="211" cy="128" r="11" fill="#2a3166" />
            {[
              [150, 120],
              [170, 150],
              [222, 170],
              [160, 190],
              [200, 208],
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
            <motion.g animate={{ x: [0, 18, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}>
              <ellipse cx="166" cy="140" rx="20" ry="8" fill="#fff" opacity="0.9" />
              <ellipse cx="180" cy="134" rx="14" ry="8" fill="#fff" opacity="0.9" />
            </motion.g>
            <path d="M136 210 Q170 190 200 205 T232 198 V238 H136 Z" fill="#9cc98a" opacity="0.7" />
          </g>
        )}
        <rect x="182" y="104" width="4" height="134" fill="#fff8ee" />
        <rect x="136" y="168" width="96" height="4" fill="#fff8ee" />
        <rect x="120" y="244" width="128" height="10" rx="4" fill="#f7ead9" />
        {/* Curtains */}
        <path d="M112 88 Q118 170 110 262 L132 262 Q126 170 134 88 Z" fill="#e7a07a" />
        <path d="M256 88 Q250 170 258 262 L236 262 Q242 170 234 88 Z" fill="#e7a07a" />
        <rect x="104" y="82" width="160" height="7" rx="3.5" fill="#9b7350" />
        {/* Sill plant */}
        <path d="M150 244 h22 l-3 -16 h-16 Z" fill="#d98b5f" />
        <g fill="#6aa86b">
          <ellipse cx="156" cy="220" rx="5" ry="10" transform="rotate(-25 156 220)" />
          <ellipse cx="166" cy="218" rx="5" ry="11" transform="rotate(20 166 218)" />
          <ellipse cx="161" cy="214" rx="4" ry="11" />
        </g>
      </g>

      {/* Framed paw art */}
      <g>
        <rect x="292" y="120" width="56" height="66" rx="4" fill="#8a6446" />
        <rect x="297" y="125" width="46" height="56" rx="2" fill="#fbf2e6" />
        <g fill="#f08a3c">
          <ellipse cx="320" cy="160" rx="9" ry="7" />
          <circle cx="309" cy="148" r="3.5" />
          <circle cx="316" cy="143" r="3.5" />
          <circle cx="324" cy="143" r="3.5" />
          <circle cx="331" cy="148" r="3.5" />
        </g>
      </g>

      {/* Hanging pothos */}
      <g>
        <line x1="74" y1="0" x2="74" y2="58" stroke="#a88a6a" strokeWidth="1.5" />
        <path d="M60 58 h28 l-4 20 h-20 Z" fill="#f2efe9" />
        <motion.g
          style={{ originX: 0.5, originY: 0 }}
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M64 76 Q56 110 62 140" stroke="#5f9a5f" strokeWidth="2" fill="none" />
          <path d="M82 76 Q92 100 86 128" stroke="#5f9a5f" strokeWidth="2" fill="none" />
          {[
            [60, 92],
            [58, 110],
            [61, 128],
            [62, 142],
            [88, 92],
            [90, 108],
            [87, 124],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="5" ry="3.5" fill={i % 2 ? '#79b878' : '#5f9f62'} transform={`rotate(${i % 2 ? 30 : -30} ${x} ${y})`} />
          ))}
        </motion.g>
      </g>

      {/* Floor */}
      <rect y="400" width="400" height="200" fill="url(#lr-floor)" />
      {[430, 468, 512, 562].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#a77650" strokeWidth="1.2" opacity="0.5" />
      ))}
      {[[60, 400, 430], [220, 430, 468], [130, 468, 512], [300, 468, 512], [80, 512, 562], [260, 512, 562], [180, 562, 600]].map(
        ([x, y1, y2], i) => (
          <line key={i} x1={x} y1={y1} x2={x} y2={y2} stroke="#a77650" strokeWidth="1.2" opacity="0.45" />
        ),
      )}

      {/* Dark gray angle sofa (L-shape) */}
      <g>
        <rect x="222" y="300" width="190" height="72" rx="16" fill="#4a4e57" />
        <rect x="232" y="312" width="80" height="54" rx="12" fill="#585d67" />
        <rect x="318" y="312" width="86" height="54" rx="12" fill="#585d67" />
        <rect x="214" y="352" width="200" height="44" rx="12" fill="#3f434b" />
        <rect x="222" y="350" width="100" height="22" rx="9" fill="#5f646e" />
        {/* Chaise extending forward */}
        <path d="M318 350 h96 v118 a14 14 0 0 1 -14 14 h-70 a14 14 0 0 1 -12 -14 Z" fill="#3f434b" />
        <rect x="324" y="350" width="84" height="102" rx="10" fill="#5f646e" />
        <rect x="206" y="330" width="24" height="70" rx="11" fill="#43474f" />
        {/* Throw pillow + knit blanket */}
        <rect x="246" y="322" width="38" height="32" rx="9" fill="#e3a83c" transform="rotate(-8 265 338)" />
        <path d="M330 380 h72 v48 q-36 10 -72 0 Z" fill="#d97f63" opacity="0.92" />
        <path d="M330 392 h72 M330 404 h72 M330 416 h72" stroke="#c96c50" strokeWidth="2" />
        {/* Legs */}
        <rect x="222" y="394" width="8" height="10" rx="2" fill="#2b2e33" />
        <rect x="330" y="480" width="8" height="10" rx="2" fill="#2b2e33" />
        <rect x="398" y="480" width="8" height="10" rx="2" fill="#2b2e33" />
      </g>

      {/* Floor lamp */}
      <g>
        <motion.ellipse
          cx="198"
          cy="236"
          rx="110"
          ry="110"
          fill="url(#lr-lamp)"
          animate={{ opacity: sleeping ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        />
        <rect x="196" y="236" width="4" height="164" fill="#7a6250" />
        <ellipse cx="198" cy="400" rx="16" ry="4" fill="#5d4a3c" />
        <path d="M180 214 h36 l8 26 h-52 Z" fill={sleeping ? '#ffe2a6' : '#f6e7cf'} />
      </g>

      {/* Cat tree */}
      <g>
        <rect x="40" y="178" width="14" height="300" fill="#d9c49f" />
        <rect x="40" y="178" width="14" height="300" fill="url(#lr-dots)" opacity="0.4" />
        {[200, 230, 260, 290, 320, 350, 380, 410, 440].map((y) => (
          <line key={y} x1="40" y1={y} x2="54" y2={y + 6} stroke="#b9a37e" strokeWidth="1.5" />
        ))}
        <rect x="74" y="300" width="12" height="178" fill="#d9c49f" />
        <rect x="14" y="166" width="72" height="16" rx="7" fill="#8b6a52" />
        <path d="M22 166 q28 -26 56 0 Z" fill="#a68068" />
        <rect x="34" y="290" width="70" height="14" rx="7" fill="#8b6a52" />
        <rect x="10" y="468" width="100" height="18" rx="8" fill="#8b6a52" />
        {/* Dangling toy */}
        <motion.g
          style={{ originX: 0.5, originY: 0 }}
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <line x1="94" y1="304" x2="94" y2="338" stroke="#6e5546" strokeWidth="1" />
          <circle cx="94" cy="342" r="5" fill="#ef5f8f" />
        </motion.g>
      </g>

      {/* Big potted plant (monstera) */}
      <g>
        <path d="M118 446 h40 l-6 36 h-28 Z" fill="#e9e3da" />
        <rect x="114" y="440" width="48" height="10" rx="4" fill="#d6cec2" />
        <g fill="#4f8f58">
          <path d="M138 442 C110 420 104 392 118 378 C132 392 140 414 138 442 Z" />
          <path d="M138 442 C160 414 178 404 186 414 C178 432 160 442 138 442 Z" fill="#5fa868" />
          <path d="M138 442 C130 404 138 372 154 364 C160 388 152 418 138 442 Z" fill="#478a51" />
        </g>
      </g>

      {/* Plush rug */}
      <ellipse cx="200" cy="510" rx="168" ry="52" fill="#d4ab84" />
      <ellipse cx="200" cy="506" rx="160" ry="48" fill="url(#lr-rug)" />
      <ellipse cx="200" cy="506" rx="124" ry="36" fill="none" stroke="#e7b9a1" strokeWidth="5" opacity="0.8" />
      <ellipse cx="200" cy="506" rx="88" ry="25" fill="none" stroke="#f2cdb8" strokeWidth="4" opacity="0.8" />

      {/* Stainless steel water fountain */}
      <g transform="translate(312 500)">
        <ellipse cx="30" cy="38" rx="34" ry="7" fill="rgba(40,30,20,0.22)" />
        <path d="M0 10 h60 l-6 28 h-48 Z" fill="url(#lr-steel)" />
        <ellipse cx="30" cy="10" rx="30" ry="7" fill="#e6edf3" />
        <ellipse cx="30" cy="10" rx="25" ry="5" fill="#8fd3f4" />
        <rect x="25" y="-12" width="10" height="20" rx="3" fill="url(#lr-steel)" />
        <ellipse cx="30" cy="-12" rx="7" ry="2.5" fill="#f2f6f9" />
        {/* Bubbling dome */}
        <motion.path
          d="M30 -14 Q22 -18 18 6 M30 -14 Q38 -18 42 6"
          stroke="#bfe8fb"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        {[0, 1, 2, 3].map((i) => (
          <motion.circle
            key={i}
            cx={22 + i * 5}
            r={1.6}
            fill="#ffffff"
            initial={{ cy: 10, opacity: 0 }}
            animate={{ cy: [10, -4 - (fountainBoost ? 12 : 0)], opacity: [0, 1, 0] }}
            transition={{ duration: fountainBoost ? 0.7 : 1.4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
        {[0, 0.7].map((d) => (
          <motion.ellipse
            key={d}
            cx={30}
            cy={10}
            fill="none"
            stroke="#fff"
            strokeWidth={0.8}
            initial={{ rx: 3, ry: 1, opacity: 0.8 }}
            animate={{ rx: 24, ry: 4.5, opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, delay: d }}
          />
        ))}
      </g>

      {/* Toy mouse */}
      <g transform="translate(60 540) rotate(-12)">
        <ellipse cx="0" cy="0" rx="12" ry="7" fill="#b9b2c9" />
        <circle cx="-9" cy="-5" r="3.5" fill="#d9c6e8" />
        <path d="M12 0 q10 2 14 -6" stroke="#8f86a3" strokeWidth="1.5" fill="none" />
        <circle cx="-11" cy="0" r="1" fill="#3d3549" />
      </g>
    </svg>
  );
}
