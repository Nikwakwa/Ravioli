import { motion } from 'framer-motion';
import { CatAvatar } from '../CatAvatar';
import type { CatAnimation, CatSpot, Mood } from '../../types';

/**
 * Nico & Athina's real Balcony — crafted from their balcony photo (PXL_20261101_155226747.jpg):
 * - Neighboring cream/beige European house across the street with pitched slate roof, roller-shutter windows & garage doors
 * - Sunlit green conifers & golden autumn trees on the left, driveway lane & round red/blue no-parking street sign below
 * - Brushed stainless-steel tubular balcony railing (back horizontal section + right perspective section) with vertical bars
 * - Round matte-grey planter pot in the back-left corner with a tall, fluffy green cypress/conifer shrub
 * - Grey rectangular railing planter boxes on the right overflowing with yellow & deep purple/burgundy pansies (violas)
 * - Large square warm-beige outdoor terrace tiles in perspective with a few tiny fallen autumn leaves
 * - Weathered rustic wooden-slat folding bistro table & two matching folding chairs with black metal frames
 */
export function Balcony({
  sleeping,
  activeSpot = 'planter',
  onSelectSpot,
  catMood = 'content',
  catAnimation = 'idle',
  catAnimationKey = 0,
  onPetCat,
}: {
  sleeping: boolean;
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
        <linearGradient id="bal-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#11162e' : '#b8dff8'} />
          <stop offset="65%" stopColor={sleeping ? '#1e2448' : '#e6f2fc'} />
          <stop offset="100%" stopColor={sleeping ? '#282d54' : '#fdf6e6'} />
        </linearGradient>
        <linearGradient id="bal-tiles" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#484354' : '#e2d5c4'} />
          <stop offset="55%" stopColor={sleeping ? '#3c3748' : '#d6c6b2'} />
          <stop offset="100%" stopColor={sleeping ? '#2f2b3a' : '#c7b59e'} />
        </linearGradient>
        <linearGradient id="bal-steel-h" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#8e94a8' : '#f2f5f8'} />
          <stop offset="45%" stopColor={sleeping ? '#686e82' : '#bcc4cc'} />
          <stop offset="100%" stopColor={sleeping ? '#454959' : '#7f8892'} />
        </linearGradient>
        <linearGradient id="bal-steel-diag" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={sleeping ? '#454959' : '#7a828c'} />
          <stop offset="50%" stopColor={sleeping ? '#757b91' : '#ccd3da'} />
          <stop offset="100%" stopColor={sleeping ? '#989fb5' : '#f5f8fa'} />
        </linearGradient>
        <linearGradient id="bal-sun" cx="0.2" cy="0.1" r="0.8" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#ffe799" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffe799" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Sky backdrop */}
      <rect width="400" height="310" fill="url(#bal-sky)" />

      {/* Night stars & moon when sleeping */}
      {sleeping && (
        <g>
          <circle cx="96" cy="112" r="9" fill="#fff6d8" />
          <circle cx="100" cy="109" r="8" fill="#151b38" />
          {[
            [78, 96],
            [128, 102],
            [160, 88],
            [240, 92],
            [312, 98],
          ].map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={1.3}
              fill="#ffffff"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.2 + i * 0.35, repeat: Infinity }}
            />
          ))}
        </g>
      )}

      {/* Left background: sunlit autumn trees, dark conifers & quiet street lane */}
      <g>
        {/* Distant golden-lit autumn canopy */}
        <circle cx="102" cy="112" r="34" fill={sleeping ? '#2c382c' : '#d6a136'} />
        <circle cx="122" cy="128" r="28" fill={sleeping ? '#334231' : '#e0b344'} />
        <circle cx="80" cy="126" r="32" fill={sleeping ? '#233025' : '#58783e'} />
        {/* Deep green pine / conifer trees */}
        <polygon points="94,76 68,162 120,162" fill={sleeping ? '#1c2921' : '#2f4d2b'} />
        <polygon points="104,92 76,178 132,178" fill={sleeping ? '#223328' : '#3a5c34'} />
        <polygon points="132,115 112,202 152,202" fill={sleeping ? '#1d2b22' : '#32522c'} />
        <rect x="52" y="140" width="96" height="65" fill={sleeping ? '#213026' : '#3b5c34'} />

        {/* Quiet paved street & driveway below */}
        <polygon points="48,200 156,200 156,292 48,292" fill={sleeping ? '#383846' : '#9c9891'} />
        <polygon points="56,188 118,188 135,238 56,238" fill={sleeping ? '#2f2f3c' : '#85827b'} />

        {/* Round blue & red no-parking street sign on metal post (PXL_20261101_155226747.jpg) */}
        <line x1="118" y1="224" x2="118" y2="276" stroke={sleeping ? '#6c7080' : '#9a9ea4'} strokeWidth="2" />
        <ellipse cx="118" cy="224" rx="5.5" ry="9" fill="#1d4ed8" stroke="#dc2626" strokeWidth="2.2" />
        <line x1="114" y1="218" x2="122" y2="230" stroke="#dc2626" strokeWidth="2" />
      </g>

      {/* Neighboring cream/beige European house across the street (x: 138..395, y: 65..290) */}
      <g>
        {/* Pitched dark slate roof */}
        <polygon points="132,106 168,72 340,78 360,112" fill={sleeping ? '#2b2938' : '#57524b'} stroke={sleeping ? '#1f1d29' : '#423e38'} strokeWidth="1.2" />
        {/* Skylight / roof dormer */}
        <rect x="198" y="84" width="38" height="16" rx="1" fill={sleeping ? '#44485c' : '#cfd6dc'} stroke={sleeping ? '#2b2938' : '#57524b'} strokeWidth="1" />
        <polygon points="194,100 242,100 246,107 190,107" fill={sleeping ? '#5c6278' : '#aeb7c0'} />

        {/* Left wing facade (angled slightly) */}
        <polygon points="140,106 166,102 166,245 140,245" fill={sleeping ? '#686478' : '#dfd7c8'} />
        {/* Main cream stucco facade */}
        <rect x="166" y="102" width="124" height="148" fill={sleeping ? '#787388' : '#ede5d6'} />
        {/* Right adjoining warm-terracotta/beige townhouse facade */}
        <rect x="290" y="106" width="105" height="144" fill={sleeping ? '#6d6274' : '#dfc6b0'} />
        {/* Vertical rain gutter pipe */}
        <line x1="166" y1="102" x2="166" y2="248" stroke={sleeping ? '#4a4759' : '#8c857b'} strokeWidth="2" />
        <line x1="290" y1="104" x2="290" y2="248" stroke={sleeping ? '#4a4759' : '#9c8d7e'} strokeWidth="1.8" />

        {/* Upper row windows with white roller shutters (volets roulants) */}
        {/* Window 1 (wide, half-lowered shutter) */}
        <rect x="182" y="114" width="44" height="28" rx="1" fill={sleeping ? '#2c3146' : '#4a525a'} stroke="#ffffff" strokeWidth="1.5" />
        <rect x="183" y="115" width="42" height="17" fill={sleeping ? '#8a869c' : '#e8e4dc'} />
        <line x1="183" y1="121" x2="225" y2="121" stroke="#cbc6bc" strokeWidth="0.8" />
        <line x1="183" y1="127" x2="225" y2="127" stroke="#cbc6bc" strokeWidth="0.8" />

        {/* Window 2 (double pane, right pane open) */}
        <rect x="242" y="118" width="36" height="26" rx="1" fill={sleeping ? '#2c3146' : '#555e68'} stroke="#ffffff" strokeWidth="1.5" />
        <rect x="243" y="119" width="17" height="24" fill={sleeping ? '#8a869c' : '#e8e4dc'} />
        <rect x="260" y="119" width="17" height="13" fill={sleeping ? '#8a869c' : '#e8e4dc'} />

        {/* Window 3 (right townhouse window) */}
        <rect x="302" y="122" width="32" height="24" rx="1" fill={sleeping ? '#2c3146' : '#4a525a'} stroke="#ffffff" strokeWidth="1.5" />
        <rect x="317" y="123" width="16" height="22" fill={sleeping ? '#8a869c' : '#e8e4dc'} />

        {/* Lower row windows (closed white roller shutters) */}
        <rect x="182" y="160" width="42" height="26" rx="1" fill={sleeping ? '#827e94' : '#e5e0d5'} stroke="#ffffff" strokeWidth="1.4" />
        <line x1="183" y1="168" x2="223" y2="168" stroke="#ccc6ba" strokeWidth="0.8" />
        <line x1="183" y1="176" x2="223" y2="176" stroke="#ccc6ba" strokeWidth="0.8" />

        <rect x="242" y="162" width="36" height="24" rx="1" fill={sleeping ? '#827e94' : '#e5e0d5'} stroke="#ffffff" strokeWidth="1.4" />
        <line x1="259" y1="162" x2="259" y2="186" stroke="#ccc6ba" strokeWidth="1" />

        {/* Ground floor rusticated stone base & white garage doors */}
        <rect x="166" y="198" width="124" height="52" fill={sleeping ? '#5e596e' : '#cfc2ae'} />
        <rect x="178" y="204" width="36" height="38" fill={sleeping ? '#7d7990' : '#ece8e0'} stroke="#b8aea0" strokeWidth="1" />
        <rect x="222" y="204" width="32" height="38" fill={sleeping ? '#7d7990' : '#ece8e0'} stroke="#b8aea0" strokeWidth="1" />

        {/* Bush & bare autumn branches on the right side of the street */}
        <circle cx="294" cy="196" r="24" fill={sleeping ? '#283329' : '#4f6339'} opacity="0.9" />
        <g stroke={sleeping ? '#3d394a' : '#6e5d4f'} strokeWidth="1.1" fill="none" opacity="0.75">
          <path d="M335 240 Q320 175 290 95" />
          <path d="M322 180 Q300 145 274 115" />
          <path d="M348 235 Q344 165 358 92" />
          <path d="M344 165 Q325 130 308 102" />
        </g>
      </g>

      {/* Garden greenery just below the balcony railing */}
      <polygon points="145,252 400,252 400,600 190,288" fill={sleeping ? '#1a241e' : '#314726'} />
      <g fill={sleeping ? '#243329' : '#446134'} opacity="0.85">
        <circle cx="220" cy="285" r="26" />
        <circle cx="265" cy="315" r="32" />
        <circle cx="310" cy="365" r="38" />
        <circle cx="345" cy="425" r="42" />
      </g>

      {/* Left cream exterior apartment wall pillar */}
      <polygon points="0,85 52,92 58,295 0,295" fill={sleeping ? '#5c586b' : '#e6dfd1'} stroke={sleeping ? '#454254' : '#c9bfb0'} strokeWidth="1.2" />

      {/* Warm beige square balcony floor tiles (y: 288..600) */}
      <polygon points="0,292 186,288 368,600 0,600" fill="url(#bal-tiles)" />

      {/* White painted concrete parapet curb along the back & right railing base */}
      <polygon points="48,286 192,283 196,291 48,294" fill={sleeping ? '#8a869c' : '#f2efe9'} stroke={sleeping ? '#686478' : '#d5cfc4'} strokeWidth="1" />
      <polygon points="186,288 196,284 388,600 364,600" fill={sleeping ? '#8a869c' : '#f2efe9'} stroke={sleeping ? '#686478' : '#cfc8bc'} strokeWidth="1.2" />

      {/* Perspective balcony tile grout lines (matching the square slab grid in PXL_20261101_155226747.jpg) */}
      <g stroke={sleeping ? '#262230' : '#7d7060'} strokeWidth="1.3" opacity="0.65">
        {/* Radiating longitudinal tile seams from back to front */}
        <line x1="56" y1="293" x2="28" y2="600" />
        <line x1="108" y1="291" x2="132" y2="600" />
        <line x1="156" y1="290" x2="246" y2="600" />
        {/* Transverse horizontal tile seams */}
        <line x1="0" y1="322" x2="206" y2="318" />
        <line x1="0" y1="358" x2="228" y2="352" />
        <line x1="0" y1="402" x2="255" y2="395" />
        <line x1="0" y1="456" x2="288" y2="446" />
        <line x1="0" y1="520" x2="326" y2="508" />
      </g>

      {/* Cute little fallen brown autumn leaves on the balcony tiles (from photo) */}
      <g fill={sleeping ? '#3d2822' : '#6b3a24'} opacity="0.85">
        <ellipse cx="92" cy="434" rx="4.5" ry="2" transform="rotate(24 92 434)" />
        <ellipse cx="222" cy="466" rx="5.5" ry="2.6" transform="rotate(-18 222 466)" />
        <ellipse cx="152" cy="378" rx="3.8" ry="1.8" transform="rotate(12 152 378)" />
      </g>

      {/* Back Stainless-Steel Balcony Railing (horizontal section x: 48..194) */}
      <g>
        {/* Vertical balusters */}
        {[58, 76, 94, 112, 130, 148, 166, 184].map((x) => (
          <line
            key={x}
            x1={x}
            y1="196"
            x2={x}
            y2="286"
            stroke={sleeping ? '#686e82' : '#b4bcc4'}
            strokeWidth="2.4"
          />
        ))}
        {/* Corner support posts */}
        <rect x="52" y="190" width="5" height="98" rx="1.5" fill="url(#bal-steel-h)" />
        <rect x="187" y="190" width="5" height="98" rx="1.5" fill="url(#bal-steel-h)" />
        {/* Upper & lower sub-rails */}
        <rect x="48" y="206" width="144" height="3.2" fill={sleeping ? '#757b91' : '#c6cdd4'} />
        <rect x="48" y="276" width="144" height="3.2" fill={sleeping ? '#757b91' : '#c6cdd4'} />
        {/* Tubular top handrail */}
        <rect x="46" y="188" width="148" height="7" rx="3.5" fill="url(#bal-steel-h)" stroke={sleeping ? '#454959' : '#8a939e'} strokeWidth="0.8" />
      </g>

      {/* Round grey planter pot & tall green cypress shrub in the back-left corner + Cozy Spot: 'planter' */}
      <g
        onClick={() => (activeSpot === 'planter' ? onPetCat?.() : onSelectSpot?.('planter'))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (activeSpot === 'planter') onPetCat?.();
            else onSelectSpot?.('planter');
          }
        }}
        tabIndex={0}
        className="pointer-events-auto cursor-pointer focus:outline-none"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        role="button"
        aria-current={activeSpot === 'planter' ? 'true' : undefined}
        aria-label={
          activeSpot === 'planter'
            ? 'Pet Oli by the balcony flower boxes and conifer pot'
            : 'Balcony conifer pot and pansy flower boxes (cozy spot)'
        }
      >
        {/* Generous touch target inside SAFE_MOBILE */}
        <rect x="68" y="175" width="122" height="122" fill="transparent" style={{ pointerEvents: 'all' }} />

        {/* Floor shadow under round planter pot */}
        <ellipse cx="95" cy="298" rx="22" ry="5.5" fill="rgba(35,30,22,0.28)" />

        {/* Matte charcoal-grey round planter pot */}
        <polygon
          points="74,262 116,262 111,296 79,296"
          fill={sleeping ? '#4e5261' : '#73787d'}
          stroke={sleeping ? '#3a3d4a' : '#5a5f63'}
          strokeWidth="1"
        />
        <ellipse
          cx="95"
          cy="262"
          rx="22"
          ry="4.8"
          fill={sleeping ? '#3d404d' : '#55595e'}
          stroke={sleeping ? '#5e6273' : '#858a90'}
          strokeWidth="1.2"
        />

        {/* Tall fluffy green cypress / thuja shrub rising from the pot */}
        <g fill={sleeping ? '#2d4531' : '#4a6e35'}>
          <ellipse cx="92" cy="246" rx="18" ry="16" />
          <ellipse cx="86" cy="224" rx="15" ry="18" fill={sleeping ? '#355239' : '#58803e'} />
          <ellipse cx="78" cy="200" rx="12" ry="16" />
          <ellipse cx="73" cy="180" rx="8.5" ry="13" fill={sleeping ? '#3e5e42' : '#689449'} />
          <circle cx="101" cy="238" r="11" fill={sleeping ? '#38573d' : '#5c8541'} />
        </g>

        {/* Oli perched by the conifer pot & flower boxes watching the street */}
        {activeSpot === 'planter' && (
          <motion.g
            key={`cat-planter-${catAnimationKey}`}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <ellipse cx="150" cy="283" rx="22" ry="5" fill="rgba(35,30,22,0.22)" />
            <CatAvatar
              x={118}
              y={214}
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
      </g>

      {/* Right Angled Stainless-Steel Railing & Hanging Pansy Flower Boxes */}
      <g>
        {/* Perspective vertical balusters along the right railing */}
        {[
          [202, 198, 294],
          [216, 212, 316],
          [232, 228, 342],
          [248, 245, 368],
          [266, 263, 398],
          [284, 281, 428],
          [304, 301, 462],
          [324, 321, 496],
        ].map(([x, y1, y2], i) => (
          <line
            key={i}
            x1={x}
            y1={y1}
            x2={x - 6}
            y2={y2}
            stroke={sleeping ? '#686e82' : '#b0b8c0'}
            strokeWidth="2.5"
          />
        ))}

        {/* Mid railing support post */}
        <line x1="258" y1="252" x2="246" y2="378" stroke={sleeping ? '#8a91a6' : '#d2d8de'} strokeWidth="5.5" />

        {/* Lower & upper angled sub-rails */}
        <line x1="190" y1="276" x2="365" y2="565" stroke={sleeping ? '#757b91' : '#c2c9d0'} strokeWidth="3.2" />
        <line x1="190" y1="206" x2="395" y2="412" stroke={sleeping ? '#757b91' : '#c2c9d0'} strokeWidth="3.2" />

        {/* Hanging Grey Planter Box 1 (upper-right along the railing) */}
        <g>
          <polygon
            points="210,224 274,264 268,296 206,252"
            fill={sleeping ? '#5c6070' : '#8c9196'}
            stroke={sleeping ? '#434654' : '#6e7378'}
            strokeWidth="1"
          />
          <polygon
            points="274,264 294,260 288,292 268,296"
            fill={sleeping ? '#707587' : '#a8adb2'}
            stroke={sleeping ? '#434654' : '#6e7378'}
            strokeWidth="1"
          />
          {/* Deep burgundy & green foliage + yellow/purple pansy blooms */}
          <g>
            <circle cx="222" cy="220" r="9" fill={sleeping ? '#3b1d2e' : '#591c2f'} />
            <circle cx="234" cy="226" r="10" fill={sleeping ? '#2c472c' : '#466e38'} />
            <circle cx="250" cy="236" r="11" fill={sleeping ? '#335233' : '#527d42'} />
            <circle cx="268" cy="244" r="11" fill={sleeping ? '#2c472c' : '#426934'} />
            <circle cx="282" cy="246" r="9.5" fill={sleeping ? '#355435' : '#568245'} />
            {/* Yellow & purple pansy flowers */}
            <circle cx="258" cy="236" r="4" fill="#facc15" />
            <circle cx="258" cy="236" r="1.6" fill="#4c1d3d" />
            <circle cx="272" cy="240" r="4.2" fill="#eab308" />
            <circle cx="272" cy="240" r="1.8" fill="#581c87" />
            <circle cx="282" cy="244" r="3.8" fill="#fde047" />
            <circle cx="282" cy="244" r="1.5" fill="#4c1d3d" />
          </g>
        </g>

        {/* Hanging Grey Planter Box 2 (foreground-right with yellow & purple pansies) */}
        <g>
          <polygon
            points="276,292 338,354 330,392 270,328"
            fill={sleeping ? '#555968' : '#80858a'}
            stroke={sleeping ? '#3e414d' : '#63686d'}
            strokeWidth="1.2"
          />
          {/* Cream metal hanging bracket strap */}
          <rect x="284" y="302" width="6" height="24" rx="2" fill={sleeping ? '#8e8a9e' : '#dcd6c8'} transform="rotate(10 287 314)" />
          {/* Lush green pansy leaves */}
          <g fill={sleeping ? '#2d4a2e' : '#48733a'}>
            <circle cx="288" cy="288" r="11" />
            <circle cx="304" cy="296" r="13" fill={sleeping ? '#365737' : '#588747'} />
            <circle cx="320" cy="308" r="13" />
            <circle cx="332" cy="320" r="11" fill={sleeping ? '#365737' : '#588747'} />
            <circle cx="298" cy="304" r="10" fill={sleeping ? '#3d613e' : '#659653'} />
          </g>
          {/* Yellow & deep purple/burgundy pansies (violas) */}
          <g>
            <circle cx="284" cy="286" r="4.5" fill="#facc15" />
            <circle cx="284" cy="286" r="2" fill="#4a154b" />
            <circle cx="298" cy="284" r="5" fill="#fde047" />
            <circle cx="298" cy="284" r="2.2" fill="#581c87" />
            <circle cx="312" cy="290" r="4.8" fill="#eab308" />
            <circle cx="312" cy="290" r="2.1" fill="#3b0764" />
            <circle cx="324" cy="298" r="4.5" fill="#facc15" />
            <circle cx="324" cy="298" r="1.9" fill="#4a154b" />
          </g>
        </g>

        {/* Main brushed stainless-steel tubular top handrail angling forward */}
        <line
          x1="188"
          y1="191"
          x2="398"
          y2="398"
          stroke="url(#bal-steel-diag)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <line
          x1="189"
          y1="189"
          x2="398"
          y2="396"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity={sleeping ? 0.35 : 0.75}
        />
      </g>

      {/* Sunny Balcony Tiles Cozy Spot ('balcony_floor') */}
      <g
        onClick={() => (activeSpot === 'balcony_floor' ? onPetCat?.() : onSelectSpot?.('balcony_floor'))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (activeSpot === 'balcony_floor') onPetCat?.();
            else onSelectSpot?.('balcony_floor');
          }
        }}
        tabIndex={0}
        className="pointer-events-auto cursor-pointer focus:outline-none"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        role="button"
        aria-current={activeSpot === 'balcony_floor' ? 'true' : undefined}
        aria-label={
          activeSpot === 'balcony_floor'
            ? 'Pet Oli on the warm balcony tiles'
            : 'Sunny balcony floor tiles (cozy spot)'
        }
      >
        {/* Generous touch target */}
        <rect x="74" y="310" width="128" height="135" fill="transparent" style={{ pointerEvents: 'all' }} />

        {/* Subtle warm sunbeam patch on the tiles */}
        {!sleeping && (
          <ellipse cx="144" cy="412" rx="54" ry="22" fill="#fffbeb" opacity="0.28" />
        )}

        {/* Oli lounging on the sunny balcony floor tiles */}
        {activeSpot === 'balcony_floor' && (
          <motion.g
            key={`cat-balcony-floor-${catAnimationKey}`}
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <ellipse cx="144" cy="426" rx="44" ry="10" fill="rgba(35,30,22,0.22)" />
            <CatAvatar
              x={86}
              y={310}
              width={116}
              height={128}
              mood={catMood}
              animation={catAnimation}
              animationKey={catAnimationKey}
              onPet={onPetCat}
              className="pointer-events-auto"
            />
          </motion.g>
        )}
      </g>

      {/* Weathered Wooden Slat Folding Bistro Table & Chairs + Cozy Spot: 'bistro_chair' */}
      <g
        onClick={() => (activeSpot === 'bistro_chair' ? onPetCat?.() : onSelectSpot?.('bistro_chair'))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (activeSpot === 'bistro_chair') onPetCat?.();
            else onSelectSpot?.('bistro_chair');
          }
        }}
        tabIndex={0}
        className="pointer-events-auto cursor-pointer focus:outline-none"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        role="button"
        aria-current={activeSpot === 'bistro_chair' ? 'true' : undefined}
        aria-label={
          activeSpot === 'bistro_chair'
            ? 'Pet Oli on the wooden bistro chair'
            : 'Wooden bistro table and chair (cozy spot)'
        }
      >
        {/* Generous touch target inside SAFE_MOBILE */}
        <rect x="144" y="275" width="138" height="186" fill="transparent" style={{ pointerEvents: 'all' }} />

        {/* 1. Back folding chair (tucked behind the table) */}
        <g>
          {/* Black metal back posts */}
          <line x1="158" y1="274" x2="152" y2="365" stroke="#25282c" strokeWidth="2.4" />
          <line x1="212" y1="272" x2="198" y2="360" stroke="#25282c" strokeWidth="2.4" />
          {/* 2 weathered wooden backrest slats */}
          <polygon
            points="154,274 216,271 215,280 154,283"
            fill={sleeping ? '#6e6875' : '#9c8f80'}
            stroke={sleeping ? '#524d59' : '#786c5e'}
            strokeWidth="0.9"
          />
          <polygon
            points="154,286 215,283 214,292 154,295"
            fill={sleeping ? '#686270' : '#948778'}
            stroke={sleeping ? '#524d59' : '#786c5e'}
            strokeWidth="0.9"
          />
        </g>

        {/* 2. Folding Bistro Table (center) */}
        <g>
          {/* Floor shadow under table & chairs */}
          <ellipse cx="212" cy="422" rx="58" ry="16" fill="rgba(30,25,18,0.2)" />

          {/* Crossed black metal folding table legs */}
          <g stroke="#22252a" strokeWidth="2.6" strokeLinecap="round">
            <line x1="160" y1="316" x2="196" y2="412" />
            <line x1="196" y1="314" x2="150" y2="404" />
            <line x1="226" y1="312" x2="254" y2="406" />
            <line x1="256" y1="326" x2="206" y2="414" />
          </g>
          {/* Little round black metal feet */}
          <circle cx="150" cy="404" r="2.5" fill="#1a1c20" />
          <circle cx="196" cy="412" r="2.5" fill="#1a1c20" />

          {/* 6 Weathered wooden tabletop slats in perspective */}
          {[
            ['146,306 232,299 235,305 148,312', '#9e9182'],
            ['149,314 237,306 241,312 151,320', '#a89b8c'],
            ['152,322 243,314 247,320 155,328', '#96897a'],
            ['156,330 249,321 254,328 159,337', '#a39686'],
            ['160,339 256,329 261,336 164,346', '#918475'],
            ['165,348 263,337 268,345 169,356', '#9c8f80'],
          ].map(([pts, color], idx) => (
            <polygon
              key={idx}
              points={pts}
              fill={sleeping ? '#6d6776' : color}
              stroke={sleeping ? '#4e4957' : '#6e6255'}
              strokeWidth="0.9"
            />
          ))}
        </g>

        {/* 3. Foreground Folding Wooden Slat Chair */}
        <g>
          {/* Curved black metal chair legs */}
          <g stroke="#22252a" strokeWidth="2.6" strokeLinecap="round" fill="none">
            <path d="M188 386 L204 456" />
            <path d="M238 380 L254 446" />
            <path d="M182 372 L226 436" />
            <line x1="196" y1="422" x2="244" y2="414" strokeWidth="2" />
          </g>
          <circle cx="204" cy="456" r="2.6" fill="#1a1c20" />
          <circle cx="254" cy="446" r="2.6" fill="#1a1c20" />

          {/* 4 Weathered wooden seat slats */}
          {[
            ['176,368 232,356 235,362 179,374', '#9a8d7e'],
            ['180,376 237,363 240,369 183,382', '#a6998a'],
            ['184,384 242,370 246,376 188,390', '#918475'],
            ['189,392 248,377 252,383 193,398', '#9e9182'],
          ].map(([pts, color], idx) => (
            <polygon
              key={idx}
              points={pts}
              fill={sleeping ? '#686270' : color}
              stroke={sleeping ? '#4b4654' : '#6b5f52'}
              strokeWidth="0.9"
            />
          ))}

          {/* Oli perched on the wooden slat chair seat (behind the front chair backrest!) */}
          {activeSpot === 'bistro_chair' && (
            <motion.g
              key={`cat-bistro-${catAnimationKey}`}
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              <ellipse cx="224" cy="382" rx="22" ry="5" fill="rgba(25,20,15,0.32)" />
              <CatAvatar
                x={192}
                y={320}
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

          {/* Foreground chair backrest posts & 2 wooden backrest slats */}
          <line x1="194" y1="398" x2="218" y2="352" stroke="#22252a" strokeWidth="3" strokeLinecap="round" />
          <line x1="250" y1="382" x2="278" y2="338" stroke="#22252a" strokeWidth="3" strokeLinecap="round" />
          <polygon
            points="210,352 280,334 277,343 207,361"
            fill={sleeping ? '#756f7e' : '#a89b8c'}
            stroke={sleeping ? '#4e4957' : '#6e6255'}
            strokeWidth="0.9"
          />
          <polygon
            points="204,364 274,346 271,354 201,372"
            fill={sleeping ? '#6d6776' : '#9a8d7e'}
            stroke={sleeping ? '#4e4957' : '#6e6255'}
            strokeWidth="0.9"
          />
          {/* Black metal brackets on backrest slats */}
          <line x1="215" y1="350" x2="207" y2="371" stroke="#22252a" strokeWidth="2.8" />
          <line x1="269" y1="336" x2="261" y2="357" stroke="#22252a" strokeWidth="2.8" />
        </g>
      </g>
    </svg>
  );
}
