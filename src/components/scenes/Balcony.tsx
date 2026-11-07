import { motion } from 'framer-motion';
import { CatAvatar } from '../CatAvatar';
import type { CatAnimation, CatSpot, Mood } from '../../types';

/**
 * Nico & Athina's real Balcony — crafted from their balcony photo (PXL_20261101_155226747.jpg):
 * - Left exterior cream stucco apartment wall grounding the balcony corner
 * - Neighboring cream European house across the street with pitched slate roof, roller-shutter windows & garage doors
 * - Sunlit green conifers & golden autumn foliage on the left, paved street lane & round red/blue no-parking sign below
 * - Brushed stainless-steel tubular balcony railing (back horizontal section + right perspective section extending full-bleed)
 * - Round matte-grey planter pot in the back-left corner with a tall, wispy upward-sweeping green cypress shrub
 * - Two 3D grey rectangular planter boxes mounted on the right railing with bracket hooks & multi-petaled yellow/purple pansies
 * - Large square warm-sandstone outdoor terrace tiles in clean perspective (no clutter)
 * - Weathered wooden-slat folding bistro table & two matching folding chairs with black metal frames
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
          <stop offset="0%" stopColor={sleeping ? '#11162e' : '#a8dbf7'} />
          <stop offset="60%" stopColor={sleeping ? '#1e2448' : '#dff0fc'} />
          <stop offset="100%" stopColor={sleeping ? '#282d54' : '#fbf4e4'} />
        </linearGradient>
        <linearGradient id="bal-wall-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={sleeping ? '#4b475c' : '#e6dfd3'} />
          <stop offset="100%" stopColor={sleeping ? '#5c576e' : '#f3ede2'} />
        </linearGradient>
        <linearGradient id="bal-tiles" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#484354' : '#e7dbc9'} />
          <stop offset="50%" stopColor={sleeping ? '#3c3748' : '#dccbb6'} />
          <stop offset="100%" stopColor={sleeping ? '#2f2b3a' : '#cbb8a0'} />
        </linearGradient>
        <linearGradient id="bal-steel-h" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sleeping ? '#98a0b8' : '#f7f9fb'} />
          <stop offset="45%" stopColor={sleeping ? '#70778f' : '#c6ced6'} />
          <stop offset="100%" stopColor={sleeping ? '#494e61' : '#858e98'} />
        </linearGradient>
        <linearGradient id="bal-steel-v" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={sleeping ? '#98a0b8' : '#f4f7f9'} />
          <stop offset="50%" stopColor={sleeping ? '#70778f' : '#c2cad2'} />
          <stop offset="100%" stopColor={sleeping ? '#494e61' : '#858e98'} />
        </linearGradient>
        <linearGradient id="bal-pot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={sleeping ? '#575b6b' : '#7d8288'} />
          <stop offset="55%" stopColor={sleeping ? '#474b59' : '#686d73'} />
          <stop offset="100%" stopColor={sleeping ? '#393c47' : '#55595e'} />
        </linearGradient>
      </defs>

      {/* 1. Sky backdrop */}
      <rect width="400" height="320" fill="url(#bal-sky)" />

      {/* Night stars & crescent moon when sleeping */}
      {sleeping && (
        <g>
          <circle cx="104" cy="106" r="9.5" fill="#fff6d8" />
          <circle cx="108" cy="103" r="8.2" fill="#141a36" />
          {[
            [78, 92],
            [134, 96],
            [168, 82],
            [248, 86],
            [316, 94],
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

      {/* 2. Background Left: Sunlit golden autumn trees, deep green conifers & quiet street below */}
      <g>
        {/* Warm sunlit golden-amber autumn foliage */}
        <circle cx="106" cy="116" r="34" fill={sleeping ? '#2c362b' : '#dba638'} />
        <circle cx="128" cy="132" r="28" fill={sleeping ? '#333f30' : '#e6b84a'} />
        <circle cx="82" cy="128" r="30" fill={sleeping ? '#232f24' : '#5e7e42'} />
        {/* Layered evergreen conifers */}
        <polygon points="96,74 68,168 124,168" fill={sleeping ? '#1c2820' : '#2e4c2a'} />
        <polygon points="110,90 82,182 138,182" fill={sleeping ? '#223227' : '#395b33'} />
        <polygon points="136,112 114,200 158,200" fill={sleeping ? '#1d2b22' : '#31502b'} />
        <rect x="56" y="148" width="102" height="58" fill={sleeping ? '#213026' : '#3a5b33'} />

        {/* Quiet paved street & sidewalk visible through the back railing */}
        <rect x="56" y="204" width="110" height="98" fill={sleeping ? '#383846' : '#a6a29a'} />
        <polygon points="58,204 124,204 142,256 58,256" fill={sleeping ? '#2e2e3b' : '#8c8880'} />
        {/* Street curb line */}
        <line x1="58" y1="256" x2="164" y2="254" stroke={sleeping ? '#4a4a5a' : '#c4bfb6'} strokeWidth="2" />
      </g>

      {/* 3. Background Center-Right: Neighboring cream-stucco European house across the street */}
      <g>
        {/* Pitched dark slate roof */}
        <polygon
          points="144,108 178,74 344,80 364,112"
          fill={sleeping ? '#2b2938' : '#555049'}
          stroke={sleeping ? '#1f1d29' : '#403c36'}
          strokeWidth="1.2"
        />
        {/* Roof dormer */}
        <rect x="208" y="84" width="36" height="16" rx="1" fill={sleeping ? '#44485c' : '#d2d8de'} stroke={sleeping ? '#2b2938' : '#555049'} strokeWidth="1" />
        <polygon points="204,100 248,100 252,107 200,107" fill={sleeping ? '#5c6278' : '#b0b8c0'} />

        {/* Left angled wall wing */}
        <polygon points="150,108 176,104 176,262 150,262" fill={sleeping ? '#686478' : '#e0d8c8'} />
        {/* Main cream stucco facade */}
        <rect x="176" y="104" width="122" height="158" fill={sleeping ? '#787388' : '#f0e8da'} />
        {/* Right adjoining warm-beige townhouse facade */}
        <rect x="298" y="108" width="102" height="154" fill={sleeping ? '#6d6274' : '#e2cbb5'} />
        {/* Vertical rain gutter pipes */}
        <line x1="176" y1="104" x2="176" y2="262" stroke={sleeping ? '#4a4759' : '#8c857b'} strokeWidth="1.8" />
        <line x1="298" y1="108" x2="298" y2="262" stroke={sleeping ? '#4a4759' : '#9c8d7e'} strokeWidth="1.6" />

        {/* Upper row windows with white roller shutters (volets roulants) */}
        {/* Window 1 (left, half-lowered shutter) */}
        <rect x="190" y="116" width="42" height="27" rx="1.5" fill={sleeping ? '#2c3146' : '#4a525a'} stroke="#ffffff" strokeWidth="1.5" />
        <rect x="191" y="117" width="40" height="16" fill={sleeping ? '#8a869c' : '#eae6de'} />
        <line x1="191" y1="122.5" x2="231" y2="122.5" stroke="#cbc6bc" strokeWidth="0.8" />
        <line x1="191" y1="128" x2="231" y2="128" stroke="#cbc6bc" strokeWidth="0.8" />

        {/* Window 2 (center-right, double pane) */}
        <rect x="248" y="119" width="36" height="25" rx="1.5" fill={sleeping ? '#2c3146' : '#555e68'} stroke="#ffffff" strokeWidth="1.5" />
        <rect x="249" y="120" width="17" height="23" fill={sleeping ? '#8a869c' : '#eae6de'} />
        <rect x="266" y="120" width="17" height="13" fill={sleeping ? '#8a869c' : '#eae6de'} />

        {/* Window 3 (right townhouse window) */}
        <rect x="310" y="123" width="30" height="23" rx="1.5" fill={sleeping ? '#2c3146' : '#4a525a'} stroke="#ffffff" strokeWidth="1.5" />
        <rect x="324" y="124" width="15" height="21" fill={sleeping ? '#8a869c' : '#eae6de'} />

        {/* Lower row windows (closed white roller shutters) */}
        <rect x="190" y="160" width="42" height="26" rx="1.5" fill={sleeping ? '#827e94' : '#e7e2d7'} stroke="#ffffff" strokeWidth="1.4" />
        <line x1="191" y1="168.5" x2="231" y2="168.5" stroke="#ccc6ba" strokeWidth="0.8" />
        <line x1="191" y1="177" x2="231" y2="177" stroke="#ccc6ba" strokeWidth="0.8" />

        <rect x="248" y="162" width="36" height="24" rx="1.5" fill={sleeping ? '#827e94' : '#e7e2d7'} stroke="#ffffff" strokeWidth="1.4" />
        <line x1="266" y1="162" x2="266" y2="186" stroke="#ccc6ba" strokeWidth="1" />

        {/* Ground floor stone base & white garage doors */}
        <rect x="176" y="200" width="122" height="58" fill={sleeping ? '#5e596e' : '#d2c5b2'} />
        <rect x="188" y="206" width="36" height="40" fill={sleeping ? '#7d7990' : '#eeeae2'} stroke="#b8aea0" strokeWidth="1" />
        <rect x="232" y="206" width="34" height="40" fill={sleeping ? '#7d7990' : '#eeeae2'} stroke="#b8aea0" strokeWidth="1" />
      </g>

      {/* 4. Garden greenery & bushes outside the right railing */}
      <g>
        <polygon points="164,256 400,256 400,600 204,298" fill={sleeping ? '#1c2820' : '#354f2b'} />
        {/* Soft layered garden shrubs visible behind the vertical railing bars */}
        <circle cx="224" cy="242" r="24" fill={sleeping ? '#27382b' : '#4a6b3b'} />
        <circle cx="256" cy="252" r="26" fill={sleeping ? '#2d4031' : '#567a45'} />
        <circle cx="298" cy="246" r="32" fill={sleeping ? '#243428' : '#436335'} />
        <circle cx="338" cy="272" r="36" fill={sleeping ? '#2c3e30' : '#517540'} />
        <circle cx="282" cy="318" r="34" fill={sleeping ? '#253629' : '#466738'} />
        <circle cx="328" cy="364" r="40" fill={sleeping ? '#2d4031' : '#537843'} />
        <circle cx="356" cy="430" r="44" fill={sleeping ? '#243428' : '#426134'} />
      </g>

      {/* 5. Left exterior apartment wall column (full height from y=0 to balcony floor y=308) */}
      <g>
        <polygon
          points="0,0 56,0 60,308 0,312"
          fill="url(#bal-wall-left)"
          stroke={sleeping ? '#3d394d' : '#cfc6b8'}
          strokeWidth="1.2"
        />
        {/* Subtle vertical architectural trim along the left wall edge */}
        <line x1="14" y1="0" x2="18" y2="310" stroke={sleeping ? '#3d394d' : '#d2c9ba'} strokeWidth="1.5" />
        <line x1="56" y1="0" x2="60" y2="308" stroke={sleeping ? '#3d394d' : '#c7beaf'} strokeWidth="1.2" />
      </g>

      {/* 6. Warm Sandstone Balcony Floor Tiles & White Concrete Railing Curb */}
      <g>
        {/* Main balcony floor surface */}
        <polygon points="0,306 204,298 400,564 400,600 0,600" fill="url(#bal-tiles)" />

        {/* Perspective tile grid lines (clean square stone slabs, zero clutter) */}
        <g stroke={sleeping ? '#282433' : '#9c8c79'} strokeWidth="1.2" opacity="0.65">
          {/* Longitudinal tile seams radiating from back to front */}
          <line x1="62" y1="304" x2="36" y2="600" />
          <line x1="112" y1="302" x2="132" y2="600" />
          <line x1="160" y1="300" x2="236" y2="600" />
          <line x1="204" y1="298" x2="342" y2="600" />

          {/* Transverse horizontal tile seams */}
          <line x1="0" y1="334" x2="228" y2="328" />
          <line x1="0" y1="370" x2="255" y2="364" />
          <line x1="0" y1="414" x2="288" y2="407" />
          <line x1="0" y1="468" x2="328" y2="460" />
          <line x1="0" y1="534" x2="376" y2="525" />
        </g>

        {/* White concrete parapet curb along back railing base */}
        <polygon
          points="56,296 208,291 208,300 56,305"
          fill={sleeping ? '#8e8a9e' : '#f5f2eb'}
          stroke={sleeping ? '#686478' : '#d4cec3'}
          strokeWidth="1"
        />
        {/* White concrete parapet curb angling forward along right railing base (full bleed to right edge) */}
        <polygon
          points="200,296 212,292 408,552 408,576 392,576"
          fill={sleeping ? '#8e8a9e' : '#f5f2eb'}
          stroke={sleeping ? '#686478' : '#d4cec3'}
          strokeWidth="1"
        />
        {/* Subtle inner step shadow of the right curb */}
        <line x1="200" y1="298" x2="394" y2="574" stroke={sleeping ? '#5c586b' : '#b8ae9e'} strokeWidth="1.5" />
      </g>

      {/* 7. Back Stainless-Steel Balcony Railing (horizontal section x: 58..206, y: 202..296) */}
      <g>
        {/* Vertical balusters */}
        {[72, 90, 108, 126, 144, 162, 180, 196].map((x) => (
          <line
            key={x}
            x1={x}
            y1="214"
            x2={x}
            y2="292"
            stroke={sleeping ? '#686e82' : '#b5bdc6'}
            strokeWidth="2.4"
          />
        ))}
        {/* Left & corner main support posts */}
        <rect x="60" y="204" width="5.5" height="94" rx="1.5" fill="url(#bal-steel-v)" />
        <rect x="201" y="202" width="6" height="94" rx="1.5" fill="url(#bal-steel-v)" />
        {/* Upper & lower horizontal sub-rails */}
        <rect x="58" y="213" width="148" height="3.2" fill={sleeping ? '#757b91' : '#c8cfd6'} />
        <rect x="58" y="289" width="148" height="3.2" fill={sleeping ? '#757b91' : '#c8cfd6'} />
        {/* Brushed stainless-steel tubular top handrail */}
        <rect
          x="56"
          y="200"
          width="152"
          height="7.5"
          rx="3.7"
          fill="url(#bal-steel-h)"
          stroke={sleeping ? '#454959' : '#8a939e'}
          strokeWidth="0.8"
        />
      </g>

      {/* 8. Right Perspective Stainless-Steel Railing & Hanging Pansy Planter Boxes (extends full-bleed to x=404) */}
      {/*
        Geometry along the right railing:
        At t=0 (corner): x=204, topRailY=203, upperSubY=214, lowerSubY=290
        At t=1 (right edge): x=404, topRailY=427, upperSubY=441, lowerSubY=556
        Every vertical baluster connects (x, upperSubY(t)) straight down to (x, lowerSubY(t))!
      */}
      <g>
        {/* Strictly vertical balusters interpolated cleanly between upperSub and lowerSub */}
        {[0.06, 0.13, 0.20, 0.27, 0.34, 0.41, 0.48, 0.55, 0.62, 0.69, 0.76, 0.83, 0.90, 0.97].map((t, i) => {
          const x = 204 + t * 200;
          const yTop = 214 + t * 227;
          const yBot = 290 + t * 266;
          return (
            <line
              key={i}
              x1={x}
              y1={yTop}
              x2={x}
              y2={yBot}
              stroke={sleeping ? '#686e82' : '#b2bac2'}
              strokeWidth="2.5"
            />
          );
        })}

        {/* Mid support post along the right railing (at t = 0.40 -> x = 284) */}
        <line
          x1="284"
          y1="293"
          x2="284"
          y2="404"
          stroke={sleeping ? '#8a91a6' : '#cfd6de'}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Lower & upper angled sub-rails extending full-bleed off the right edge */}
        <line x1="204" y1="290" x2="404" y2="556" stroke={sleeping ? '#757b91' : '#c4cbd2'} strokeWidth="3.2" />
        <line x1="204" y1="214" x2="404" y2="441" stroke={sleeping ? '#757b91' : '#c4cbd2'} strokeWidth="3.2" />

        {/* Hanging Grey Planter Box 1 (upper-right along the railing, tucked against outer side of rail) */}
        <g>
          {/* Matte-grey rectangular planter box body & 3D end-cap */}
          <polygon
            points="214,210 274,258 270,290 212,240"
            fill={sleeping ? '#5c6070' : '#858a90'}
            stroke={sleeping ? '#434654' : '#686d73'}
            strokeWidth="1.1"
          />
          <polygon
            points="274,258 288,253 284,284 270,290"
            fill={sleeping ? '#707587' : '#9fa5ab'}
            stroke={sleeping ? '#434654' : '#686d73'}
            strokeWidth="1.1"
          />
          {/* Lush foliage & multi-petaled pansies blooming ABOVE Box 1 */}
          <g>
            {/* Deep burgundy/plum leaves on the back-left of Box 1 */}
            <circle cx="222" cy="204" r="8.5" fill={sleeping ? '#3b1d2e' : '#5e1f34'} />
            <circle cx="231" cy="209" r="8" fill={sleeping ? '#4a2439' : '#732841'} />
            <circle cx="216" cy="210" r="7" fill={sleeping ? '#331827' : '#4d182a'} />
            {/* Fresh green pansy foliage */}
            <circle cx="242" cy="218" r="9.5" fill={sleeping ? '#2d4a2e' : '#467038'} />
            <circle cx="254" cy="228" r="10" fill={sleeping ? '#365737' : '#558546'} />
            <circle cx="266" cy="238" r="9.5" fill={sleeping ? '#2d4a2e' : '#467038'} />
            <circle cx="274" cy="246" r="8.5" fill={sleeping ? '#3c613e' : '#629452'} />
            {/* Pansy blossoms */}
            {[
              [248, 221],
              [260, 231],
              [271, 240],
            ].map(([px, py], idx) => (
              <g key={idx} transform={`translate(${px} ${py})`}>
                <circle cx="-2.2" cy="-2" r="3" fill="#4c1d95" />
                <circle cx="2.2" cy="-2" r="3" fill="#581c87" />
                <circle cx="-2.4" cy="1.8" r="3.2" fill="#facc15" />
                <circle cx="2.4" cy="1.8" r="3.2" fill="#eab308" />
                <circle cx="0" cy="2.6" r="3" fill="#fde047" />
                <circle cx="0" cy="0.4" r="1.2" fill="#ca8a04" />
              </g>
            ))}
          </g>
        </g>

        {/* Hanging Grey Planter Box 2 (foreground-right along the railing) */}
        <g>
          {/* Matte-grey rectangular planter box body */}
          <polygon
            points="286,282 342,344 336,380 282,316"
            fill={sleeping ? '#555968' : '#7c8187'}
            stroke={sleeping ? '#3e414d' : '#5f6469'}
            strokeWidth="1.2"
          />
          {/* Lush green foliage & yellow/purple pansies blooming ABOVE Box 2 */}
          <g>
            <circle cx="294" cy="276" r="10.5" fill={sleeping ? '#2d4a2e' : '#467038'} />
            <circle cx="306" cy="286" r="11.5" fill={sleeping ? '#365737' : '#568646'} />
            <circle cx="320" cy="298" r="11.5" fill={sleeping ? '#2d4a2e' : '#48733a'} />
            <circle cx="332" cy="310" r="10.5" fill={sleeping ? '#3c613e' : '#629452'} />
            <circle cx="300" cy="292" r="9.5" fill={sleeping ? '#3c613e' : '#689c57'} />
            <circle cx="316" cy="306" r="9.5" fill={sleeping ? '#365737' : '#568646'} />
            {/* Multi-petaled yellow & deep violet pansy blooms */}
            {[
              [293, 273],
              [306, 282],
              [319, 293],
              [330, 305],
            ].map(([px, py], idx) => (
              <g key={idx} transform={`translate(${px} ${py})`}>
                <circle cx="-2.5" cy="-2.2" r="3.4" fill="#4c1d95" />
                <circle cx="2.5" cy="-2.2" r="3.4" fill="#3b0764" />
                <circle cx="-2.6" cy="2" r="3.5" fill="#facc15" />
                <circle cx="2.6" cy="2" r="3.5" fill="#eab308" />
                <circle cx="0" cy="2.8" r="3.3" fill="#fde047" />
                <circle cx="0" cy="0.5" r="1.3" fill="#b45309" />
              </g>
            ))}
          </g>
        </g>

        {/* Continuous Brushed Stainless-Steel Tubular Top Handrail running cleanly to the right edge */}
        <line
          x1="204"
          y1="203"
          x2="404"
          y2="427"
          stroke={sleeping ? '#63697d' : '#96a0aa'}
          strokeWidth="9.5"
          strokeLinecap="round"
        />
        <line
          x1="204"
          y1="202"
          x2="404"
          y2="426"
          stroke={sleeping ? '#8c93a8' : '#dde3e8'}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1="205"
          y1="200.5"
          x2="404"
          y2="424"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity={sleeping ? 0.35 : 0.8}
        />

        {/* Cream metal hanging bracket strap clasping over the top handrail on Box 2 */}
        <rect
          x="291"
          y="296"
          width="5.5"
          height="24"
          rx="2.2"
          fill={sleeping ? '#8e8a9e' : '#dfd9cc'}
          stroke={sleeping ? '#5c586b' : '#b5ae9e'}
          strokeWidth="0.8"
          transform="rotate(10 294 308)"
        />
      </g>

      {/* 9. Back-Left Corner Conifer Pot + Cozy Spot 1: 'planter' (Sniffing pansies & watching the street) */}
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
        <rect x="64" y="160" width="136" height="180" fill="transparent" style={{ pointerEvents: 'all' }} />

        {/* Contact shadow on the balcony tiles under the round grey pot */}
        <ellipse cx="88" cy="316" rx="23" ry="5.5" fill="rgba(35,28,20,0.28)" />

        {/* Tapered round matte-grey planter pot sitting firmly on the corner tiles */}
        <path
          d="M67 274 L109 274 L104 314 Q88 317 72 314 Z"
          fill="url(#bal-pot)"
          stroke={sleeping ? '#3a3d4a' : '#52565b'}
          strokeWidth="1.1"
        />
        {/* Pot upper rim & dark soil */}
        <ellipse
          cx="88"
          cy="274"
          rx="22"
          ry="5"
          fill={sleeping ? '#323540' : '#45484c'}
          stroke={sleeping ? '#686d80' : '#8d9399'}
          strokeWidth="1.4"
        />
        <ellipse cx="88" cy="274.5" rx="18" ry="3.4" fill="#3b2f26" />

        {/* Lush upright feathery cypress / thuja shrub (layered upward-sweeping boughs, no egg blobs!) */}
        <g>
          {/* Deep evergreen core silhouette with natural upward-sweeping branch tips */}
          <path
            d="M84 148
               C78 158 72 170 76 176
               C68 186 66 200 72 206
               C64 218 63 234 70 240
               C64 252 65 266 71 273
               Q88 278 105 273
               C110 264 110 250 104 240
               C109 230 108 214 101 206
               C105 196 103 182 96 176
               C98 166 92 156 84 148 Z"
            fill={sleeping ? '#253a28' : '#3b5e2d'}
          />
          {/* Mid-tone layered feathery cypress fronds */}
          <path
            d="M85 154
               C80 164 75 174 79 180
               C72 190 71 202 76 208
               C69 220 69 234 75 240
               C70 250 71 264 75 271
               Q88 275 101 271
               C105 262 104 248 99 240
               C103 230 102 216 96 208
               C99 198 98 186 92 180
               C94 170 89 160 85 154 Z"
            fill={sleeping ? '#304b34' : '#4e7a3d'}
          />
          {/* Sunlit inner evergreen highlights */}
          <path
            d="M85 162
               C81 172 78 182 81 188
               C76 198 76 208 80 214
               C75 224 75 236 80 242
               C76 252 77 262 80 268
               Q87 271 95 268
               C98 260 97 248 93 242
               C96 232 95 220 91 214
               C93 204 92 194 88 188
               C89 178 87 168 85 162 Z"
            fill={sleeping ? '#3b5c40' : '#649650'}
          />
          {/* Fine wispy upward needle strokes */}
          <g stroke={sleeping ? '#466b4c' : '#7cb066'} strokeWidth="1.3" strokeLinecap="round" fill="none">
            <path d="M84 156 Q81 168 78 176" />
            <path d="M86 164 Q90 174 93 182" />
            <path d="M82 184 Q76 194 74 204" />
            <path d="M88 188 Q94 198 97 206" />
            <path d="M80 212 Q74 224 72 234" />
            <path d="M90 216 Q96 226 99 236" />
            <path d="M81 242 Q75 254 74 264" />
            <path d="M89 244 Q95 256 97 266" />
          </g>
        </g>

        {/* Oli sitting firmly on the first row of balcony tiles between the conifer pot and flower boxes */}
        {activeSpot === 'planter' && (
          <motion.g
            key={`cat-planter-${catAnimationKey}`}
            initial={{ opacity: 0, scale: 0.88, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <ellipse cx="158" cy="332" rx="26" ry="5.5" fill="rgba(35,28,20,0.24)" />
            <CatAvatar
              x={120}
              y={254}
              width={76}
              height={84}
              mood={catMood}
              animation={catAnimation}
              animationKey={catAnimationKey}
              onPet={onPetCat}
              className="pointer-events-auto"
            />
          </motion.g>
        )}
      </g>

      {/* 10. Weathered Wooden-Slat Folding Bistro Table & Chairs + Cozy Spot 2: 'bistro_chair' */}
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
            ? 'Pet Oli on the wooden bistro table'
            : 'Wooden bistro table and chairs (cozy spot)'
        }
      >
        {/* Generous touch target inside SAFE_MOBILE */}
        <rect x="168" y="272" width="136" height="186" fill="transparent" style={{ pointerEvents: 'all' }} />

        {/* Soft ambient floor shadow beneath the bistro set */}
        <ellipse cx="236" cy="426" rx="54" ry="15" fill="rgba(35,28,20,0.18)" />

        {/* A. Back Folding Chair (tucked behind the table, facing forward) */}
        <g>
          {/* Black metal side frame & back legs */}
          <line x1="186" y1="278" x2="178" y2="386" stroke="#23262b" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="242" y1="275" x2="230" y2="382" stroke="#23262b" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="178" cy="386" r="2.2" fill="#181a1e" />
          {/* 2 horizontal weathered wood backrest slats */}
          <polygon
            points="182,279 246,276 245,285 181,288"
            fill={sleeping ? '#736c7d' : '#a89886'}
            stroke={sleeping ? '#524d59' : '#786b5c'}
            strokeWidth="0.9"
          />
          <polygon
            points="181,291 245,288 244,297 180,300"
            fill={sleeping ? '#6b6575' : '#9c8c7a'}
            stroke={sleeping ? '#524d59' : '#786b5c'}
            strokeWidth="0.9"
          />
          {/* Black metal vertical bracket bars on backrest */}
          <line x1="190" y1="279" x2="189" y2="299" stroke="#23262b" strokeWidth="2.2" />
          <line x1="237" y1="277" x2="236" y2="297" stroke="#23262b" strokeWidth="2.2" />
        </g>

        {/* B. Square Folding Bistro Table (center) */}
        <g>
          {/* Black wrought-iron crossed X-legs connecting underside of table to floor */}
          <g stroke="#202328" strokeWidth="2.8" strokeLinecap="round">
            {/* Left pair of crossed legs */}
            <line x1="182" y1="354" x2="212" y2="424" />
            <line x1="216" y1="352" x2="174" y2="416" />
            {/* Right pair of crossed legs */}
            <line x1="244" y1="348" x2="272" y2="418" />
            <line x1="276" y1="346" x2="234" y2="412" />
            {/* Crossbar stabilizer under table */}
            <line x1="194" y1="388" x2="254" y2="382" strokeWidth="2.2" />
          </g>
          {/* Flared black metal feet resting on the tiles */}
          <circle cx="174" cy="416" r="2.6" fill="#16181c" />
          <circle cx="212" cy="424" r="2.6" fill="#16181c" />
          <circle cx="234" cy="412" r="2.5" fill="#16181c" />
          <circle cx="272" cy="418" r="2.6" fill="#16181c" />

          {/* Dark metal under-frame supporting the wooden slats */}
          <polygon points="174,322 274,314 286,354 182,364" fill="#2b2e33" opacity="0.85" />

          {/* 6 Weathered wooden tabletop slats laid cleanly in perspective */}
          {[
            { pts: '170,318 272,310 274,316 172,324', fill: '#b0a08e', side: '172,324 274,316 274,318 172,326' },
            { pts: '172,325 275,317 277,323 174,331', fill: '#a49482', side: '174,331 277,323 277,325 174,333' },
            { pts: '175,332 278,324 281,330 177,338', fill: '#b5a593', side: '177,338 281,330 281,332 177,340' },
            { pts: '177,339 281,331 284,337 180,346', fill: '#9e8e7c', side: '180,346 284,337 284,339 180,348' },
            { pts: '180,347 285,338 288,345 183,354', fill: '#ada08e', side: '183,354 288,345 288,347 183,356' },
            { pts: '183,355 288,346 292,353 186,363', fill: '#a29280', side: '186,363 292,353 292,356 186,366' },
          ].map((slat, idx) => (
            <g key={idx}>
              <polygon points={slat.side} fill={sleeping ? '#4e4959' : '#6e6152'} />
              <polygon
                points={slat.pts}
                fill={sleeping ? '#736c7d' : slat.fill}
                stroke={sleeping ? '#524d59' : '#736657'}
                strokeWidth="0.7"
              />
            </g>
          ))}
        </g>

        {/* C. Foreground Folding Chair (pulled up to the front-right of the table) */}
        <g>
          {/* Black metal folding legs */}
          <g stroke="#1e2025" strokeWidth="2.8" strokeLinecap="round">
            <line x1="208" y1="396" x2="222" y2="454" />
            <line x1="256" y1="390" x2="270" y2="446" />
            <line x1="206" y1="388" x2="246" y2="440" />
            {/* Front leg stretcher bar */}
            <line x1="216" y1="432" x2="263" y2="424" strokeWidth="2.2" />
          </g>
          <circle cx="222" cy="454" r="2.6" fill="#141619" />
          <circle cx="270" cy="446" r="2.6" fill="#141619" />
          <circle cx="246" cy="440" r="2.4" fill="#141619" />

          {/* 4 Weathered wooden seat slats */}
          {[
            ['200,382 252,372 255,377 203,387', '#a69684'],
            ['203,388 256,378 259,383 206,393', '#b2a290'],
            ['206,394 260,384 263,389 209,399', '#9c8c7a'],
            ['210,400 264,390 268,396 214,406', '#aa9a88'],
          ].map(([pts, color], idx) => (
            <polygon
              key={idx}
              points={pts}
              fill={sleeping ? '#6d6776' : color}
              stroke={sleeping ? '#4e4957' : '#6e6152'}
              strokeWidth="0.8"
            />
          ))}

          {/* Angled black metal backrest uprights & 2 wooden backrest slats */}
          <line x1="214" y1="406" x2="232" y2="362" stroke="#1e2025" strokeWidth="3" strokeLinecap="round" />
          <line x1="266" y1="395" x2="286" y2="352" stroke="#1e2025" strokeWidth="3" strokeLinecap="round" />
          <polygon
            points="226,364 288,350 285,358 223,372"
            fill={sleeping ? '#787182' : '#b2a290'}
            stroke={sleeping ? '#4e4957' : '#6e6152'}
            strokeWidth="0.9"
          />
          <polygon
            points="221,375 283,361 280,369 218,383"
            fill={sleeping ? '#6e6878' : '#a29280'}
            stroke={sleeping ? '#4e4957' : '#6e6152'}
            strokeWidth="0.9"
          />
          {/* Black metal brackets holding backrest slats */}
          <line x1="231" y1="363" x2="224" y2="382" stroke="#1e2025" strokeWidth="2.6" />
          <line x1="279" y1="352" x2="272" y2="371" stroke="#1e2025" strokeWidth="2.6" />
        </g>

        {/* Oli perched squarely in the center of the flat wooden bistro tabletop */}
        {activeSpot === 'bistro_chair' && (
          <motion.g
            key={`cat-bistro-${catAnimationKey}`}
            initial={{ opacity: 0, scale: 0.88, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <ellipse cx="230" cy="350" rx="25" ry="5.5" fill="rgba(30,22,15,0.3)" />
            <CatAvatar
              x={196}
              y={281}
              width={68}
              height={75}
              mood={catMood}
              animation={catAnimation}
              animationKey={catAnimationKey}
              onPet={onPetCat}
              className="pointer-events-auto"
            />
          </motion.g>
        )}
      </g>

      {/* 11. Foreground Sunny Balcony Tiles Cozy Spot 3: 'balcony_floor' (Rendered AFTER table so Oli is never covered!) */}
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
        {/* Generous touch target on the foreground left/center tiles */}
        <rect x="74" y="340" width="126" height="125" fill="transparent" style={{ pointerEvents: 'all' }} />

        {/* Oli lounging in the foreground on the warm sandstone balcony tiles */}
        {activeSpot === 'balcony_floor' && (
          <motion.g
            key={`cat-balcony-floor-${catAnimationKey}`}
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <ellipse cx="146" cy="442" rx="46" ry="9" fill="rgba(35,28,20,0.22)" />
            <CatAvatar
              x={80}
              y={308}
              width={132}
              height={145}
              mood={catMood}
              animation={catAnimation}
              animationKey={catAnimationKey}
              onPet={onPetCat}
              className="pointer-events-auto"
            />
          </motion.g>
        )}
      </g>
    </svg>
  );
}
