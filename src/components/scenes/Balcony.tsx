import { motion } from 'framer-motion';

/**
 * South-facing sunny balcony: stone balustrade with planters of herbs & flowers,
 * terracotta tiles and a warm sunbathing cushion.
 *
 * Calibrated for the 400×600 stage window (y ≈ 108..436 visible between HUD and Dock),
 * with Oli's sunbathing cushion centered at y = 398.
 */
export function Balcony({ sleeping }: { sleeping: boolean }) {
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="bc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#131838' : '#73c2f0'} />
          <stop offset="65%" stopColor={sleeping ? '#2a2c5e' : '#bfe6fb'} />
          <stop offset="100%" stopColor={sleeping ? '#463b6e' : '#fff1cf'} />
        </linearGradient>
        <radialGradient id="bc-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8c8" />
          <stop offset="55%" stopColor="#ffd862" />
          <stop offset="100%" stopColor="#ffb732" />
        </radialGradient>
        <radialGradient id="bc-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3b4" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff3b4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bc-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#b7ad9f' : '#f3ead9'} />
          <stop offset="100%" stopColor={sleeping ? '#918779' : '#d8c8ae'} />
        </linearGradient>
        <linearGradient id="bc-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#7d5240' : '#da8e60'} />
          <stop offset="100%" stopColor={sleeping ? '#5c3b2e' : '#c06f45'} />
        </linearGradient>
        <linearGradient id="bc-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff7cc" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff7cc" stopOpacity="0.52" />
        </linearGradient>
      </defs>

      {/* Sky (y: 0..330) */}
      <rect width="400" height="330" fill="url(#bc-sky)" />

      {sleeping ? (
        <g>
          <circle cx="308" cy="144" r="26" fill="#fff6d8" />
          <circle cx="320" cy="136" r="22" fill="#181e45" opacity="0.94" />
          {Array.from({ length: 20 }).map((_, i) => {
            const x = ((i * 73) % 380) + 10;
            const y = ((i * 37) % 190) + 40;
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r={i % 3 === 0 ? 1.7 : 1.1}
                fill="#fff"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1.8 + (i % 5) * 0.5, repeat: Infinity, delay: (i % 7) * 0.3 }}
              />
            );
          })}
        </g>
      ) : (
        <g>
          <circle cx="308" cy="146" r="105" fill="url(#bc-glow)" />
          <motion.g
            style={{ originX: 0.5, originY: 0.5 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x="306"
                y="78"
                width="4"
                height="18"
                rx="2"
                fill="#ffd75e"
                opacity="0.7"
                transform={`rotate(${i * 30} 308 146)`}
              />
            ))}
          </motion.g>
          <motion.circle
            cx="308"
            cy="146"
            r="34"
            fill="url(#bc-sun)"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.g animate={{ x: [0, 34, 0] }} transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}>
            <ellipse cx="82" cy="140" rx="30" ry="10" fill="#fff" opacity="0.92" />
            <ellipse cx="100" cy="132" rx="20" ry="11" fill="#fff" opacity="0.92" />
            <ellipse cx="66" cy="135" rx="14" ry="8" fill="#fff" opacity="0.92" />
          </motion.g>
          <motion.g animate={{ x: [0, -24, 0] }} transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}>
            <ellipse cx="196" cy="186" rx="22" ry="7" fill="#fff" opacity="0.82" />
            <ellipse cx="210" cy="181" rx="14" ry="7" fill="#fff" opacity="0.82" />
          </motion.g>
        </g>
      )}

      {/* Distant hills + rooftops (y: 230..326) */}
      <path d="M0 258 Q60 226 130 244 T260 236 T400 232 V328 H0 Z" fill={sleeping ? '#29305e' : '#a6d197'} opacity="0.88" />
      <g fill={sleeping ? '#373c6e' : '#e9b38e'}>
        <rect x="22" y="248" width="36" height="34" />
        <rect x="68" y="254" width="28" height="28" />
        <rect x="254" y="244" width="40" height="38" />
        <rect x="308" y="252" width="32" height="30" />
      </g>
      <g fill={sleeping ? '#48487d' : '#c96a4a'}>
        <path d="M18 250 L40 234 L62 250 Z" />
        <path d="M64 256 L82 242 L100 256 Z" />
        <path d="M250 246 L274 228 L298 246 Z" />
        <path d="M304 254 L324 238 L344 254 Z" />
      </g>
      {sleeping && (
        <g fill="#ffd77a">
          <rect x="32" y="258" width="5" height="6" />
          <rect x="266" y="256" width="5" height="6" />
          <rect x="318" y="262" width="5" height="6" />
        </g>
      )}

      {/* Stone balustrade (y: 264..326) */}
      <rect x="0" y="314" width="400" height="14" fill={sleeping ? '#8a8072' : '#cbb999'} />
      {Array.from({ length: 11 }).map((_, i) => {
        const x = 8 + i * 38;
        return (
          <path
            key={i}
            d={`M${x} 314 h15 v-5 q-5 -8 0 -18 q5 -10 0 -18 v-5 h-15 v5 q-5 8 0 18 q5 10 0 18 Z`}
            fill="url(#bc-stone)"
            stroke={sleeping ? '#7d7365' : '#c9b797'}
            strokeWidth="1"
          />
        );
      })}
      <rect x="-4" y="254" width="408" height="16" rx="4" fill="url(#bc-stone)" />
      <rect x="-4" y="267" width="408" height="3" fill={sleeping ? '#807668' : '#cdbb9b'} />

      {/* Rail planters full of herbs & flowers (y: 200..256) */}
      <Planter x={18} kind="lavender" />
      <Planter x={118} kind="basil" />
      <Planter x={226} kind="geranium" />
      <Planter x={318} kind="rosemary" />

      {/* Terracotta balcony floor (y: 326..600) */}
      <rect y="326" width="400" height="274" fill="url(#bc-tile)" />
      {[356, 390, 428, 470].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#9b502e" strokeWidth="1.4" opacity="0.5" />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={200 + (i - 4) * 46} y1="326" x2={200 + (i - 4) * 82} y2="600" stroke="#9b502e" strokeWidth="1.4" opacity="0.42" />
      ))}

      {/* Warm sunbeam + glow on floor */}
      {!sleeping && (
        <g>
          <path d="M160 80 L310 80 L330 436 L75 436 Z" fill="url(#bc-beam)" opacity="0.45" />
          <motion.ellipse
            cx="200"
            cy="398"
            rx="140"
            ry="38"
            fill="#fff3bf"
            animate={{ opacity: [0.32, 0.52, 0.32] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </g>
      )}

      {/* Sunbathing cushion — centered right under Oli (cy = 398) */}
      <ellipse cx="200" cy="402" rx="116" ry="30" fill="#6d9e90" />
      <ellipse cx="200" cy="397" rx="108" ry="26" fill="#8dc0b1" />
      <ellipse cx="200" cy="397" rx="74" ry="15" fill="none" stroke="#b2dcd0" strokeWidth="3" />

      {/* Potted lemon tree on left (y: 318..416) */}
      <g>
        <path d="M16 376 h52 l-7 42 h-38 Z" fill="#c8693f" />
        <rect x="12" y="370" width="60" height="10" rx="4" fill="#b55a33" />
        <rect x="40" y="314" width="4.5" height="58" fill="#7b5a3f" />
        <circle cx="42" cy="304" r="30" fill="#589852" />
        <circle cx="26" cy="296" r="16" fill="#68aa60" />
        <circle cx="58" cy="294" r="16" fill="#68aa60" />
        {[
          [30, 308],
          [52, 312],
          [42, 288],
          [60, 300],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="4.5" ry="5.5" fill="#f7d33f" />
        ))}
      </g>

      {/* Terracotta flower pot on right (y: 356..418) */}
      <g>
        <path d="M328 384 h48 l-6 34 h-36 Z" fill="#e7e1d6" />
        <rect x="324" y="378" width="56" height="9" rx="4" fill="#d6cdbf" />
        {[
          [336, 362, '#ef5f8f'],
          [352, 354, '#fff'],
          [366, 364, '#f6c343'],
          [344, 370, '#c18cf0'],
        ].map(([x, y, c], i) => (
          <motion.g
            key={i}
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: 0.5, originY: 1 }}
          >
            <line x1={x as number} y1={(y as number) + 5} x2={x as number} y2={380} stroke="#5f9e58" strokeWidth="2" />
            <circle cx={x as number} cy={y as number} r="6.5" fill={c as string} />
            <circle cx={x as number} cy={y as number} r="2.2" fill="#f6c343" />
          </motion.g>
        ))}
      </g>
    </svg>
  );
}

function Planter({ x, kind }: { x: number; kind: 'lavender' | 'basil' | 'geranium' | 'rosemary' }) {
  return (
    <g transform="translate(0 -76)">
      <path d={`M${x} 312 h66 l-5 22 h-56 Z`} fill="#b9603a" />
      <rect x={x - 3} y={308} width={72} height={7} rx="3" fill="#a5532f" />
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
                <line x1={sx} y1={308} x2={sx + (i - 3)} y2={278 - (i % 2) * 7} stroke="#7d9d6a" strokeWidth="1.6" />
                <ellipse cx={sx + (i - 3)} cy={274 - (i % 2) * 7} rx="2.8" ry="7.5" fill={i % 2 ? '#a58ad8' : '#8f74c9'} />
              </g>
            );
          })}
        {kind === 'basil' &&
          Array.from({ length: 9 }).map((_, i) => (
            <ellipse
              key={i}
              cx={x + 10 + (i % 5) * 11}
              cy={300 - Math.floor(i / 5) * 11 - (i % 2) * 4}
              rx="7.5"
              ry="5.5"
              fill={i % 2 ? '#5fae55' : '#74c463'}
            />
          ))}
        {kind === 'geranium' && (
          <g>
            {Array.from({ length: 6 }).map((_, i) => (
              <circle key={`l${i}`} cx={x + 8 + i * 10} cy={302} r="6.5" fill="#5f9e58" />
            ))}
            {[
              [x + 14, 287],
              [x + 33, 280],
              [x + 52, 289],
            ].map(([cx, cy], i) => (
              <g key={i}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <circle
                    key={a}
                    cx={cx + Math.cos((a * Math.PI) / 180) * 4.6}
                    cy={cy + Math.sin((a * Math.PI) / 180) * 4.6}
                    r="4"
                    fill={i === 1 ? '#f7728f' : '#e8434f'}
                  />
                ))}
                <circle cx={cx} cy={cy} r="2.2" fill="#ffd2d8" />
              </g>
            ))}
          </g>
        )}
        {kind === 'rosemary' &&
          Array.from({ length: 8 }).map((_, i) => {
            const sx = x + 8 + i * 7.5;
            const top = 274 + (i % 3) * 7;
            return (
              <g key={i}>
                <line x1={sx} y1={308} x2={sx + (i % 2 ? 3 : -3)} y2={top} stroke="#5b7f5a" strokeWidth="2" />
                {Array.from({ length: 4 }).map((__, j) => (
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
