import { motion } from 'framer-motion';

/**
 * South-facing sunny balcony: stone balustrade with planters of herbs & flowers,
 * terracotta tiles and a warm sunbathing spot. Turns moonlit in sleep mode.
 */
export function Balcony({ sleeping }: { sleeping: boolean }) {
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="bc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#141a3d' : '#7cc8f2'} />
          <stop offset="65%" stopColor={sleeping ? '#2d2f63' : '#c4e8fb'} />
          <stop offset="100%" stopColor={sleeping ? '#4b3f73' : '#fff1cf'} />
        </linearGradient>
        <radialGradient id="bc-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7c2" />
          <stop offset="55%" stopColor="#ffd75e" />
          <stop offset="100%" stopColor="#ffb938" />
        </radialGradient>
        <radialGradient id="bc-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff2b0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff2b0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bc-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1e7d6" />
          <stop offset="100%" stopColor="#d9cab1" />
        </linearGradient>
        <linearGradient id="bc-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d88c5e" />
          <stop offset="100%" stopColor="#c47248" />
        </linearGradient>
        <linearGradient id="bc-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff6c8" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff6c8" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="400" height="420" fill="url(#bc-sky)" />

      {sleeping ? (
        <g>
          <circle cx="300" cy="120" r="30" fill="#fff6d8" />
          <circle cx="314" cy="110" r="26" fill="#1c2149" opacity="0.92" />
          {Array.from({ length: 22 }).map((_, i) => {
            const x = (i * 73) % 390 + 5;
            const y = ((i * 41) % 260) + 20;
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r={i % 3 === 0 ? 1.8 : 1.1}
                fill="#fff"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1.8 + (i % 5) * 0.5, repeat: Infinity, delay: (i % 7) * 0.3 }}
              />
            );
          })}
        </g>
      ) : (
        <g>
          <circle cx="300" cy="120" r="120" fill="url(#bc-glow)" />
          <motion.g
            style={{ originX: 0.5, originY: 0.5 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x="298" y="40" width="4" height="22" rx="2" fill="#ffd75e" opacity="0.7" transform={`rotate(${i * 30} 300 120)`} />
            ))}
          </motion.g>
          <motion.circle
            cx="300"
            cy="120"
            r="40"
            fill="url(#bc-sun)"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.g animate={{ x: [0, 40, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}>
            <ellipse cx="80" cy="110" rx="34" ry="12" fill="#fff" opacity="0.92" />
            <ellipse cx="102" cy="100" rx="22" ry="13" fill="#fff" opacity="0.92" />
            <ellipse cx="62" cy="104" rx="16" ry="9" fill="#fff" opacity="0.92" />
          </motion.g>
          <motion.g animate={{ x: [0, -30, 0] }} transition={{ duration: 36, repeat: Infinity, ease: 'easeInOut' }}>
            <ellipse cx="190" cy="190" rx="26" ry="8" fill="#fff" opacity="0.8" />
            <ellipse cx="206" cy="184" rx="15" ry="8" fill="#fff" opacity="0.8" />
          </motion.g>
          {/* Swallows */}
          <motion.g animate={{ x: [-40, 440], y: [0, -20] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
            <path d="M0 220 q6 -6 12 0 q6 -6 12 0" stroke="#3a4a60" strokeWidth="1.6" fill="none" />
          </motion.g>
        </g>
      )}

      {/* Distant hills + rooftops (south view) */}
      <path d="M0 330 Q60 290 130 310 T260 300 T400 296 V420 H0 Z" fill={sleeping ? '#2d3466' : '#a9d39a'} opacity="0.85" />
      <g fill={sleeping ? '#3a3f73' : '#e9b38e'}>
        <rect x="20" y="318" width="40" height="40" />
        <rect x="70" y="326" width="30" height="34" />
        <rect x="250" y="312" width="44" height="46" />
        <rect x="310" y="322" width="36" height="36" />
      </g>
      <g fill={sleeping ? '#4a4a80' : '#c96a4a'}>
        <path d="M16 320 L40 302 L64 320 Z" />
        <path d="M66 328 L85 312 L104 328 Z" />
        <path d="M246 314 L272 294 L298 314 Z" />
        <path d="M306 324 L328 306 L350 324 Z" />
      </g>
      {sleeping && (
        <g fill="#ffd77a">
          <rect x="30" y="330" width="6" height="7" />
          <rect x="262" y="326" width="6" height="7" />
          <rect x="320" y="334" width="6" height="7" />
        </g>
      )}

      {/* Stone balustrade */}
      <rect x="0" y="406" width="400" height="16" fill="#cbb999" />
      {Array.from({ length: 11 }).map((_, i) => {
        const x = 8 + i * 38;
        return (
          <path
            key={i}
            d={`M${x} 406 h16 v-6 q-6 -10 0 -22 q6 -12 0 -22 v-6 h-16 v6 q-6 10 0 22 q6 12 0 22 Z`}
            fill="url(#bc-stone)"
            stroke="#c9b797"
            strokeWidth="1"
          />
        );
      })}
      <rect x="-4" y="334" width="408" height="20" rx="4" fill="url(#bc-stone)" />
      <rect x="-4" y="350" width="408" height="4" fill="#cdbb9b" />

      {/* Rail planters with herbs & flowers */}
      <Planter x={18} kind="lavender" />
      <Planter x={118} kind="basil" />
      <Planter x={226} kind="geranium" />
      <Planter x={318} kind="rosemary" />

      {/* Terracotta floor */}
      <rect y="420" width="400" height="180" fill="url(#bc-tile)" />
      {[452, 490, 536, 590].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#b0613b" strokeWidth="1.5" opacity="0.6" />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={200 + (i - 4) * 46} y1="420" x2={200 + (i - 4) * 80} y2="600" stroke="#b0613b" strokeWidth="1.5" opacity="0.5" />
      ))}

      {/* Sunbeam + sunbathing spot */}
      {!sleeping && (
        <g>
          <path d="M150 0 L290 0 L330 540 L70 540 Z" fill="url(#bc-beam)" opacity="0.45" />
          <motion.ellipse
            cx="200"
            cy="510"
            rx="150"
            ry="44"
            fill="#fff3bf"
            animate={{ opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </g>
      )}

      {/* Cushion */}
      <ellipse cx="200" cy="512" rx="112" ry="30" fill="#7fb0a2" />
      <ellipse cx="200" cy="506" rx="104" ry="25" fill="#97c6b8" />
      <ellipse cx="200" cy="506" rx="70" ry="14" fill="none" stroke="#b5ddd0" strokeWidth="3" />

      {/* Lemon tree pot */}
      <g>
        <path d="M14 520 h60 l-8 50 h-44 Z" fill="#c8693f" />
        <rect x="10" y="512" width="68" height="12" rx="4" fill="#b55a33" />
        <rect x="42" y="440" width="5" height="74" fill="#7b5a3f" />
        <circle cx="44" cy="430" r="36" fill="#5f9e58" />
        <circle cx="26" cy="420" r="18" fill="#6fb066" />
        <circle cx="62" cy="418" r="18" fill="#6fb066" />
        {[
          [30, 434],
          [56, 440],
          [44, 410],
          [66, 426],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="5" ry="6" fill="#f7d33f" />
        ))}
      </g>

      {/* Flower pot right */}
      <g>
        <path d="M326 530 h52 l-6 40 h-40 Z" fill="#e7e1d6" />
        <rect x="322" y="524" width="60" height="10" rx="4" fill="#d6cdbf" />
        {[
          [334, 506, '#ef5f8f'],
          [352, 496, '#fff'],
          [368, 508, '#f6c343'],
          [344, 516, '#c18cf0'],
          [362, 520, '#ef5f8f'],
        ].map(([x, y, c], i) => (
          <motion.g
            key={i}
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: 0.5, originY: 1 }}
          >
            <line x1={x as number} y1={(y as number) + 6} x2={x as number} y2={526} stroke="#5f9e58" strokeWidth="2" />
            <circle cx={x as number} cy={y as number} r="7" fill={c as string} />
            <circle cx={x as number} cy={y as number} r="2.5" fill="#f6c343" />
          </motion.g>
        ))}
      </g>

      {/* Little watering can */}
      <g transform="translate(96 560)">
        <path d="M0 0 h28 v18 h-28 Z" fill="#7aa7c7" />
        <path d="M28 4 l18 -10" stroke="#7aa7c7" strokeWidth="4" strokeLinecap="round" />
        <path d="M4 0 q10 -14 20 0" stroke="#5f8eae" strokeWidth="3" fill="none" />
      </g>
    </svg>
  );
}

function Planter({ x, kind }: { x: number; kind: 'lavender' | 'basil' | 'geranium' | 'rosemary' }) {
  return (
    <g>
      <path d={`M${x} 312 h66 l-5 24 h-56 Z`} fill="#b9603a" />
      <rect x={x - 3} y={308} width={72} height={8} rx="3" fill="#a5532f" />
      <motion.g
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 4 + x / 200, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: 0.5, originY: 1 }}
      >
        {kind === 'lavender' &&
          Array.from({ length: 7 }).map((_, i) => {
            const sx = x + 8 + i * 8.5;
            return (
              <g key={i}>
                <line x1={sx} y1={308} x2={sx + (i - 3)} y2={276 - (i % 2) * 8} stroke="#7d9d6a" strokeWidth="1.6" />
                <ellipse cx={sx + (i - 3)} cy={272 - (i % 2) * 8} rx="3" ry="8" fill={i % 2 ? '#a58ad8' : '#8f74c9'} />
              </g>
            );
          })}
        {kind === 'basil' &&
          Array.from({ length: 9 }).map((_, i) => (
            <ellipse
              key={i}
              cx={x + 10 + (i % 5) * 11}
              cy={300 - Math.floor(i / 5) * 12 - (i % 2) * 4}
              rx="8"
              ry="6"
              fill={i % 2 ? '#5fae55' : '#74c463'}
            />
          ))}
        {kind === 'geranium' && (
          <g>
            {Array.from({ length: 6 }).map((_, i) => (
              <circle key={`l${i}`} cx={x + 8 + i * 10} cy={302} r="7" fill="#5f9e58" />
            ))}
            {[
              [x + 14, 286],
              [x + 33, 278],
              [x + 52, 288],
            ].map(([cx, cy], i) => (
              <g key={i}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <circle
                    key={a}
                    cx={cx + Math.cos((a * Math.PI) / 180) * 5}
                    cy={cy + Math.sin((a * Math.PI) / 180) * 5}
                    r="4.5"
                    fill={i === 1 ? '#f7728f' : '#e8434f'}
                  />
                ))}
                <circle cx={cx} cy={cy} r="2.5" fill="#ffd2d8" />
              </g>
            ))}
          </g>
        )}
        {kind === 'rosemary' &&
          Array.from({ length: 8 }).map((_, i) => {
            const sx = x + 8 + i * 7.5;
            const top = 270 + (i % 3) * 8;
            return (
              <g key={i}>
                <line x1={sx} y1={308} x2={sx + (i % 2 ? 3 : -3)} y2={top} stroke="#5b7f5a" strokeWidth="2" />
                {Array.from({ length: 5 }).map((__, j) => (
                  <line
                    key={j}
                    x1={sx}
                    y1={top + 6 + j * 6}
                    x2={sx + (j % 2 ? 4 : -4)}
                    y2={top + 3 + j * 6}
                    stroke="#4f7a52"
                    strokeWidth="1.4"
                  />
                ))}
              </g>
            );
          })}
      </motion.g>
    </g>
  );
}
