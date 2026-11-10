import { motion } from 'framer-motion';
import { CatAvatar } from '../CatAvatar';
import type { CatAnimation, CatSpot, Mood } from '../../types';
import type { TimeOfDay } from '../../utils/atmosphere';

/**
 * Unified 3D pinhole camera projection so every architectural line, tile seam,
 * railing bar, hanging planter box, cypress pot, bistro tabletop slat, and
 * folding chair frame shares one exact perspective system:
 *   X: horizontal cm from vanishing center (-left, +right)
 *   Y: vertical cm above the balcony floor (0 = floor, +up)
 *   Z: depth cm from camera (+into scene)
 *
 * VP_X = 236 centers the vanishing axis right through the bistro café set on the
 * right side of the terrace so BOTH folding chairs open naturally in 3/4 view
 * toward the table while leaving the sunny left terrace walkway completely open!
 */
const VP_X = 236;
const VP_Y = 146;
const Y_CAM = 164;
const FOCAL = 295;

function proj(X: number, Y: number, Z: number): [number, number] {
  const s = FOCAL / Z;
  return [
    Math.round((VP_X + X * s) * 10) / 10,
    Math.round((VP_Y + (Y_CAM - Y) * s) * 10) / 10,
  ];
}

function pts(...coords: [number, number, number][]): string {
  return coords
    .map(([X, Y, Z]) => {
      const [x, y] = proj(X, Y, Z);
      return `${x},${y}`;
    })
    .join(' ');
}

function PansyBloom({
  cx,
  cy,
  scale = 1,
  rotate = 0,
  variant = 'yellow-top',
  night = false,
}: {
  cx: number;
  cy: number;
  scale?: number;
  rotate?: number;
  variant?: 'yellow-top' | 'purple-top';
  night?: boolean;
}) {
  const dim = night ? 0.68 : 1;
  const purple = variant === 'purple-top' ? '#581c87' : '#6b21a8';
  const yellow = variant === 'yellow-top' ? '#facc15' : '#eab308';
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})`} opacity={dim}>
      {/* Two upper velvet purple petals */}
      <circle cx="-2.4" cy="-2.2" r="3.1" fill={purple} />
      <circle cx="2.4" cy="-2.2" r="3.1" fill={purple} />
      {/* Two bright golden side petals */}
      <circle cx="-3.1" cy="1.1" r="2.8" fill={yellow} />
      <circle cx="3.1" cy="1.1" r="2.8" fill={yellow} />
      {/* Broad lower yellow petal */}
      <ellipse cx="0" cy="2.9" rx="3.4" ry="2.7" fill="#fde047" />
      {/* Dark purple pansy "face" blotch & tiny orange eye */}
      <ellipse cx="0" cy="0.8" rx="1.7" ry="1.4" fill="#3b0764" />
      <circle cx="0" cy="0.6" r="0.7" fill="#f97316" />
    </g>
  );
}

/**
 * Hanging 3D matte-grey rectangular balcony planter box (jardinière)
 * with slender curved metal J-hooks arching cleanly over the round stainless-steel handrail.
 */
function HangingPlanterBox({
  xLeft,
  xRight,
  night,
  hasBurgundyLeft = false,
  pansies,
}: {
  xLeft: number;
  xRight: number;
  night: boolean;
  hasBurgundyLeft?: boolean;
  pansies: { xRatio: number; dy: number; scale?: number; rotate?: number; variant?: 'yellow-top' | 'purple-top' }[];
}) {
  const zBack = 289;
  const zFront = 272;
  const yRimTop = 96;
  const yRimBot = 92;
  const yBot = 69;
  const inset = 2.4;

  const bodySide = night ? '#464a56' : '#5c6169';
  const rimFront = night ? '#676c7a' : '#858b94';
  const rimTop = night ? '#797f8f' : '#9aa0a9';
  const soilFill = night ? '#252129' : '#3d2f24';
  const hookFill = night ? '#8a8e9e' : '#dcd6ca';
  const hookStroke = night ? '#575b6b' : '#9e9688';

  const hookXs = [xLeft + 13, xRight - 13];
  const [boxLeftPx, boxTopPy] = proj(xLeft, yRimTop, zFront);
  const [boxRightPx] = proj(xRight, yRimTop, zFront);
  const boxWidthPx = boxRightPx - boxLeftPx;

  return (
    <g>
      {/* 1. Recessed dark soil bed visible inside top rim */}
      <polygon
        points={pts(
          [xLeft + 1.2, yRimTop - 0.8, zBack - 1],
          [xRight - 1.2, yRimTop - 0.8, zBack - 1],
          [xRight - 1.2, yRimTop - 0.8, zFront + 1.2],
          [xLeft + 1.2, yRimTop - 0.8, zFront + 1.2],
        )}
        fill={soilFill}
      />

      {/* 2. Organic mounded foliage, burgundy leaves & pansies rising naturally out of the soil */}
      <g>
        {hasBurgundyLeft && (
          <g>
            <circle cx={boxLeftPx + 8} cy={boxTopPy - 7.5} r="7.8" fill={night ? '#3e2334' : '#681e34'} />
            <circle cx={boxLeftPx + 17} cy={boxTopPy - 10} r="7" fill={night ? '#4b293d' : '#7f2640'} />
            <circle cx={boxLeftPx + 13} cy={boxTopPy - 3.5} r="6.2" fill={night ? '#361e2d' : '#541628'} />
          </g>
        )}
        {/* Varied organic green leaf clusters */}
        {[
          { t: 0.12, dy: -4.5, r: 7.4, shade: 0 },
          { t: 0.25, dy: -8.5, r: 9.2, shade: 1 },
          { t: 0.39, dy: -6.2, r: 8.4, shade: 0 },
          { t: 0.52, dy: -9.5, r: 9.6, shade: 1 },
          { t: 0.66, dy: -6.8, r: 8.6, shade: 0 },
          { t: 0.79, dy: -8.2, r: 8.8, shade: 1 },
          { t: 0.9, dy: -4.8, r: 7.2, shade: 0 },
        ].map((leaf, idx) => {
          const lx = boxLeftPx + boxWidthPx * leaf.t;
          const ly = boxTopPy + leaf.dy;
          return (
            <g key={idx}>
              <circle
                cx={lx}
                cy={ly}
                r={leaf.r}
                fill={
                  night
                    ? leaf.shade
                      ? '#354f3e'
                      : '#2a4032'
                    : leaf.shade
                      ? '#5d8c49'
                      : '#49723a'
                }
              />
              <circle
                cx={lx + (idx % 2 === 0 ? 3.2 : -3.2)}
                cy={ly + 3.8}
                r={leaf.r * 0.68}
                fill={night ? '#23362a' : '#3d6230'}
              />
            </g>
          );
        })}

        {/* Blooming yellow & purple pansies */}
        {pansies.map((p, idx) => (
          <PansyBloom
            key={idx}
            cx={boxLeftPx + boxWidthPx * p.xRatio}
            cy={boxTopPy + p.dy}
            scale={p.scale ?? 0.95}
            rotate={p.rotate ?? 0}
            variant={p.variant ?? (idx % 2 === 0 ? 'yellow-top' : 'purple-top')}
            night={night}
          />
        ))}
      </g>

      {/* 3. 3D Side End-Cap (when inner edge faces camera X=0) */}
      {xLeft > 0 && (
        <g>
          <polygon
            points={pts(
              [xLeft, yRimBot, zBack],
              [xLeft, yRimBot, zFront],
              [xLeft + inset, yBot, zFront + inset],
              [xLeft + inset, yBot, zBack - inset],
            )}
            fill={bodySide}
          />
          <polygon
            points={pts(
              [xLeft - 0.8, yRimTop, zBack],
              [xLeft - 0.8, yRimTop, zFront - 0.6],
              [xLeft - 0.8, yRimBot, zFront - 0.6],
              [xLeft - 0.8, yRimBot, zBack],
            )}
            fill={bodySide}
          />
        </g>
      )}
      {xRight < 0 && (
        <g>
          <polygon
            points={pts(
              [xRight, yRimBot, zFront],
              [xRight, yRimBot, zBack],
              [xRight - inset, yBot, zBack - inset],
              [xRight - inset, yBot, zFront + inset],
            )}
            fill={bodySide}
          />
          <polygon
            points={pts(
              [xRight + 0.8, yRimTop, zFront - 0.6],
              [xRight + 0.8, yRimTop, zBack],
              [xRight + 0.8, yRimBot, zBack],
              [xRight + 0.8, yRimBot, zFront - 0.6],
            )}
            fill={bodySide}
          />
        </g>
      )}

      {/* 4. Tapered 3D Matte Slate-Grey Trough Front Body */}
      <polygon
        points={pts(
          [xLeft, yRimBot, zFront],
          [xRight, yRimBot, zFront],
          [xRight - inset, yBot, zFront + inset],
          [xLeft + inset, yBot, zFront + inset],
        )}
        fill="url(#bal-planter-front)"
        stroke={night ? '#3e424e' : '#525760'}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      {/* Crisp cast shadow directly beneath the protruding upper rim collar */}
      <polygon
        points={pts(
          [xLeft + 0.2, yRimBot, zFront],
          [xRight - 0.2, yRimBot, zFront],
          [xRight - 0.5, yRimBot - 2.2, zFront + 0.2],
          [xLeft + 0.5, yRimBot - 2.2, zFront + 0.2],
        )}
        fill="rgba(20,24,30,0.24)"
      />

      {/* 5. Protruding Molded Upper Rim Collar (Top bevel + Front face) */}
      <polygon
        points={pts(
          [xLeft - 0.8, yRimTop, zFront - 0.8],
          [xRight + 0.8, yRimTop, zFront - 0.8],
          [xRight + 0.8, yRimTop, zFront + 0.6],
          [xLeft - 0.8, yRimTop, zFront + 0.6],
        )}
        fill={rimTop}
      />
      <polygon
        points={pts(
          [xLeft - 0.8, yRimTop, zFront - 0.8],
          [xRight + 0.8, yRimTop, zFront - 0.8],
          [xRight + 0.8, yRimBot, zFront - 0.6],
          [xLeft - 0.8, yRimBot, zFront - 0.6],
        )}
        fill={rimFront}
        stroke={night ? '#4b4f5c' : '#636872'}
        strokeWidth="0.7"
      />
      {/* Subtle highlight along top front edge */}
      <line
        x1={proj(xLeft, yRimTop, zFront - 0.8)[0]}
        y1={proj(xLeft, yRimTop, zFront - 0.8)[1]}
        x2={proj(xRight, yRimTop, zFront - 0.8)[0]}
        y2={proj(xRight, yRimTop, zFront - 0.8)[1]}
        stroke={night ? '#9197a8' : '#b7bec7'}
        strokeWidth="0.9"
      />

      {/* Small trailing green leaf tips spilling naturally over the grey rim */}
      <ellipse
        cx={boxLeftPx + boxWidthPx * 0.31}
        cy={boxTopPy + 1.8}
        rx="4.2"
        ry="2.3"
        transform={`rotate(18 ${boxLeftPx + boxWidthPx * 0.31} ${boxTopPy + 1.8})`}
        fill={night ? '#2c4435' : '#538040'}
      />
      <ellipse
        cx={boxLeftPx + boxWidthPx * 0.72}
        cy={boxTopPy + 1.6}
        rx="3.8"
        ry="2.1"
        transform={`rotate(-15 ${boxLeftPx + boxWidthPx * 0.72} ${boxTopPy + 1.6})`}
        fill={night ? '#2c4435' : '#538040'}
      />

      {/* 6. Two Compact Curved Metal Hanging Clips hooking cleanly over the steel handrail */}
      {hookXs.map((hx, idx) => {
        const [railTopL, railTopY] = proj(hx - 1.5, 103.6, 290);
        const [railTopR] = proj(hx + 1.5, 103.6, 290);
        const [frontTopL, frontTopY] = proj(hx - 1.5, 98.5, zFront - 1.1);
        const [frontTopR] = proj(hx + 1.5, 98.5, zFront - 1.1);
        const [clipBotL, clipBotY] = proj(hx - 1.5, 90.8, zFront - 0.9);
        const [clipBotR] = proj(hx + 1.5, 90.8, zFront - 0.9);
        const midX = (frontTopL + frontTopR) / 2;
        return (
          <g key={idx}>
            <path
              d={`M ${railTopL} ${railTopY + 2} Q ${railTopL} ${railTopY - 2.2} ${(railTopL + frontTopL) / 2} ${railTopY - 1.5} L ${frontTopL} ${frontTopY} L ${clipBotL} ${clipBotY} L ${clipBotR} ${clipBotY} L ${frontTopR} ${frontTopY} L ${(railTopR + frontTopR) / 2} ${railTopY - 1.5} Q ${railTopR} ${railTopY - 2.2} ${railTopR} ${railTopY + 2} Z`}
              fill={hookFill}
              stroke={hookStroke}
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
            <circle cx={midX} cy={clipBotY - 2.2} r="0.8" fill={night ? '#555868' : '#7d766a'} />
          </g>
        );
      })}
    </g>
  );
}

/**
 * 3D Folding Wooden-Slat Bistro Chair (Fermob style) projected accurately in 3D space.
 * side === 'left' faces +X (toward table on right); side === 'right' faces -X (toward table on left).
 */
function FoldingBistroChair({
  side,
  xSeatInner,
  zFront,
  zBack,
  night,
}: {
  side: 'left' | 'right';
  xSeatInner: number;
  zFront: number;
  zBack: number;
  night: boolean;
}) {
  const seatDepth = 25;
  const xSeatOuter = side === 'left' ? xSeatInner - seatDepth : xSeatInner + seatDepth;
  const xBackTop = side === 'left' ? xSeatOuter - 7 : xSeatOuter + 7;
  const ySeat = 41;
  const yBackTop = 78;

  const metalFar = night ? '#1a1c24' : '#262930';
  const metalNear = night ? '#12141a' : '#1b1e24';
  const woodStroke = night ? '#4c4657' : '#6c5f50';
  const woodSide = night ? '#575063' : '#7d6e5d';
  const slatPalette = night
    ? ['#736c80', '#6b6478', '#777084', '#6e677b']
    : ['#b5a490', '#a79682', '#b9a894', '#ab9a86'];

  const backXAt = (y: number) =>
    xSeatOuter + ((y - ySeat) / (yBackTop - ySeat)) * (xBackTop - xSeatOuter);

  const zF = zFront + 1;
  const zB = zBack - 1;
  const xFootFront = side === 'left' ? xSeatInner - 1.5 : xSeatInner + 1.5;
  const xFootBack = side === 'left' ? xSeatOuter - 1.5 : xSeatOuter + 1.5;
  const xSeatFrontPivot = side === 'left' ? xSeatInner - 2.2 : xSeatInner + 2.2;

  const seatSlats = [0, 1, 2, 3].map((i) => {
    const t0 = (i * 6.3 + 0.5) / seatDepth;
    const t1 = (i * 6.3 + 5.4) / seatDepth;
    const xa = xSeatOuter + (xSeatInner - xSeatOuter) * t0;
    const xb = xSeatOuter + (xSeatInner - xSeatOuter) * t1;
    const xMin = Math.min(xa, xb);
    const xMax = Math.max(xa, xb);
    return { xMin, xMax, color: slatPalette[i] };
  });

  const orderedSeatSlats =
    side === 'right'
      ? [...seatSlats].sort((a, b) => b.xMin - a.xMin)
      : [...seatSlats].sort((a, b) => a.xMin - b.xMin);

  const [shadowCx, shadowCy] = proj((xSeatInner + xSeatOuter) / 2, 0, (zFront + zBack) / 2);

  return (
    <g>
      {/* Ground contact shadow */}
      <ellipse cx={shadowCx} cy={shadowCy} rx="23" ry="5.5" fill="rgba(35,28,20,0.16)" />

      {/* 1. Far-side black steel folding X-frame (z = zB) */}
      <g stroke={metalFar} strokeWidth="2.3" strokeLinecap="round">
        <line
          x1={proj(xFootFront, 0, zB)[0]}
          y1={proj(xFootFront, 0, zB)[1]}
          x2={proj(xSeatOuter, ySeat, zB)[0]}
          y2={proj(xSeatOuter, ySeat, zB)[1]}
        />
        <line
          x1={proj(xSeatOuter, ySeat, zB)[0]}
          y1={proj(xSeatOuter, ySeat, zB)[1]}
          x2={proj(xBackTop, yBackTop, zB)[0]}
          y2={proj(xBackTop, yBackTop, zB)[1]}
        />
        <line
          x1={proj(xFootBack, 0, zB)[0]}
          y1={proj(xFootBack, 0, zB)[1]}
          x2={proj(xSeatFrontPivot, ySeat, zB)[0]}
          y2={proj(xSeatFrontPivot, ySeat, zB)[1]}
        />
      </g>
      <circle cx={proj(xFootFront, 0, zB)[0]} cy={proj(xFootFront, 0, zB)[1]} r="1.9" fill={metalFar} />
      <circle cx={proj(xFootBack, 0, zB)[0]} cy={proj(xFootBack, 0, zB)[1]} r="1.9" fill={metalFar} />

      {/* 2. Horizontal cross-stretchers connecting far & near leg frames */}
      <g stroke={metalFar} strokeWidth="1.8" strokeLinecap="round">
        <line
          x1={proj(xFootFront + (side === 'left' ? -3.5 : 3.5), 10, zB)[0]}
          y1={proj(xFootFront + (side === 'left' ? -3.5 : 3.5), 10, zB)[1]}
          x2={proj(xFootFront + (side === 'left' ? -3.5 : 3.5), 10, zF)[0]}
          y2={proj(xFootFront + (side === 'left' ? -3.5 : 3.5), 10, zF)[1]}
        />
        <line
          x1={proj(xFootBack + (side === 'left' ? 3.5 : -3.5), 11, zB)[0]}
          y1={proj(xFootBack + (side === 'left' ? 3.5 : -3.5), 11, zB)[1]}
          x2={proj(xFootBack + (side === 'left' ? 3.5 : -3.5), 11, zF)[0]}
          y2={proj(xFootBack + (side === 'left' ? 3.5 : -3.5), 11, zF)[1]}
        />
      </g>

      {/* 3. Two Weathered Wooden Backrest Slats (both chairs open in 3/4 view toward VP_X=236!) */}
      {[
        { y0: 54.5, y1: 62, fill: slatPalette[2] },
        { y0: 66, y1: 73.5, fill: slatPalette[0] },
      ].map((bs, idx) => {
        const x0 = backXAt(bs.y0);
        const x1 = backXAt(bs.y1);
        const dxThick = side === 'left' ? 1.4 : -1.4;
        return (
          <g key={idx}>
            <polygon
              points={pts(
                [x1, bs.y1, zBack],
                [x1 + dxThick, bs.y1, zBack],
                [x1 + dxThick, bs.y1, zFront],
                [x1, bs.y1, zFront],
              )}
              fill={woodSide}
            />
            <polygon
              points={pts(
                [x1 + dxThick, bs.y1, zBack],
                [x1 + dxThick, bs.y1, zFront],
                [x0 + dxThick, bs.y0, zFront],
                [x0 + dxThick, bs.y0, zBack],
              )}
              fill={bs.fill}
              stroke={woodStroke}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            <polygon
              points={pts(
                [x1, bs.y1, zFront],
                [x1 + dxThick, bs.y1, zFront],
                [x0 + dxThick, bs.y0, zFront],
                [x0, bs.y0, zFront],
              )}
              fill={woodSide}
            />
          </g>
        );
      })}

      {/* 4. Four Weathered Wooden Seat Slats */}
      {orderedSeatSlats.map((slat, idx) => {
        const yTop = ySeat + 1.6;
        return (
          <g key={idx}>
            {slat.xMin > 0 && (
              <polygon
                points={pts(
                  [slat.xMin, yTop, zBack],
                  [slat.xMin, yTop, zFront],
                  [slat.xMin, ySeat, zFront],
                  [slat.xMin, ySeat, zBack],
                )}
                fill={woodSide}
              />
            )}
            {slat.xMax < 0 && (
              <polygon
                points={pts(
                  [slat.xMax, yTop, zFront],
                  [slat.xMax, yTop, zBack],
                  [slat.xMax, ySeat, zBack],
                  [slat.xMax, ySeat, zFront],
                )}
                fill={woodSide}
              />
            )}
            <polygon
              points={pts(
                [slat.xMin, yTop, zFront],
                [slat.xMax, yTop, zFront],
                [slat.xMax, ySeat, zFront],
                [slat.xMin, ySeat, zFront],
              )}
              fill={woodSide}
            />
            <polygon
              points={pts(
                [slat.xMin, yTop, zBack],
                [slat.xMax, yTop, zBack],
                [slat.xMax, yTop, zFront],
                [slat.xMin, yTop, zFront],
              )}
              fill={slat.color}
              stroke={woodStroke}
              strokeWidth="0.65"
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* 5. Near-side black steel folding X-frame (z = zF) */}
      <g stroke={metalNear} strokeWidth="2.6" strokeLinecap="round">
        <line
          x1={proj(xFootFront, 0, zF)[0]}
          y1={proj(xFootFront, 0, zF)[1]}
          x2={proj(xSeatOuter, ySeat, zF)[0]}
          y2={proj(xSeatOuter, ySeat, zF)[1]}
        />
        <line
          x1={proj(xSeatOuter, ySeat, zF)[0]}
          y1={proj(xSeatOuter, ySeat, zF)[1]}
          x2={proj(xBackTop, yBackTop, zF)[0]}
          y2={proj(xBackTop, yBackTop, zF)[1]}
        />
        <line
          x1={proj(xFootBack, 0, zF)[0]}
          y1={proj(xFootBack, 0, zF)[1]}
          x2={proj(xSeatFrontPivot, ySeat, zF)[0]}
          y2={proj(xSeatFrontPivot, ySeat, zF)[1]}
        />
      </g>
      <circle
        cx={proj((xFootFront + xSeatOuter) / 2, ySeat * 0.51, zF)[0]}
        cy={proj((xFootFront + xSeatOuter) / 2, ySeat * 0.51, zF)[1]}
        r="1.1"
        fill="#9ca3af"
      />
      <circle cx={proj(xFootFront, 0, zF)[0]} cy={proj(xFootFront, 0, zF)[1]} r="2.3" fill={metalNear} />
      <circle cx={proj(xFootBack, 0, zF)[0]} cy={proj(xFootBack, 0, zF)[1]} r="2.3" fill={metalNear} />
    </g>
  );
}

/**
 * Nico & Athina's Sunny Balcony — crafted in clean, unified 1-point perspective
 * matching the Living Room scenery and inspired by their real balcony:
 * - Warm square sandstone terrace tiles (clean & leaf-free!) with white concrete parapet curb
 * - Brushed stainless-steel railing with corner return & neighborhood view across the street
 * - Two 3D matte-grey rectangular planter boxes with metal J-hooks & yellow/purple pansies
 * - Tapered cylindrical matte-grey corner pot with a lush feathery cypress tree
 * - Classic French wooden-slat folding bistro table (with crossed X-legs!) flanked by two folding chairs
 * - 3 grounded, occlusion-free cozy spots for Oli:
 *     1. 'planter'       — Sitting in the open left corner with his back to us, watching the street
 *     2. 'bistro_chair'  — Perched proudly in the center of the wooden bistro tabletop
 *     3. 'balcony_floor' — Rolling belly-up in the sunny foreground on the warm sandstone tiles
 */
export function Balcony({
  timeOfDay = 'day',
  isRaining = false,
  activeSpot = 'planter',
  onSelectSpot,
  catMood = 'content',
  catAnimation = 'idle',
  catAnimationKey = 0,
  onPetCat,
}: {
  timeOfDay?: TimeOfDay;
  isRaining?: boolean;
  activeSpot?: CatSpot;
  onSelectSpot?: (spot: CatSpot) => void;
  catMood?: Mood;
  catAnimation?: CatAnimation;
  catAnimationKey?: number;
  onPetCat?: () => void;
}) {
  // Lighting follows the real time of day, even when Oli naps during the day.
  const night = timeOfDay === 'night';
  const isNight = night;
  const isSunset = timeOfDay === 'sunset';

  // Back railing & right side return geometry in 3D world space (relative to VP_X = 236)
  const zRailBack = 290;
  const xWallLeft = -182; // -> x_svg = 50.9 at Z=290
  const xCornerRight = 114; // -> x_svg = 352.0 at Z=290
  const zReturnFront = 192;

  // Bistro table 3D bounds (centered around X = +15 -> x_svg ~ 227..294, leaving generous space for Oli!)
  const tX0 = -8;
  const tX1 = 38;
  const tZBack = 238;
  const tZFront = 196;
  const tY = 59;

  const tableSlatColors = isNight
    ? ['#756e82', '#6c6579', '#797286', '#6a6377', '#746d81', '#6e677b']
    : isSunset
      ? ['#c99a7c', '#be8f71', '#cf9f81', '#b8896c', '#c7977a', '#bf8e71']
      : ['#b8a793', '#aa9985', '#bda995', '#a4937f', '#b4a38f', '#ac9b87'];

  const tableSlats = [0, 1, 2, 3, 4, 5].map((i) => {
    const slatSpan = (tZBack - tZFront) / 6;
    const zB = tZBack - i * slatSpan - 0.35;
    const zF = tZBack - (i + 1) * slatSpan + 0.45;
    return { zB, zF, color: tableSlatColors[i] };
  });

  // Cypress pot 3D coordinates (under the left planter box, leaving the left corner open for street watch)
  const [potBaseCx, potBaseCy] = proj(-70, 0, 262);
  const [potRimCx, potRimCy] = proj(-70, 39, 262);

  // Stand Oli's avatar on the tiles at world point (X, Z): footY is where his paws touch the
  // ground inside the 200x220 avatar drawing. Widths are picked so he stays the same-sized cat
  // in every spot once perspective is taken into account.
  const placeOli = (X: number, Z: number, footY: number, width: number) => {
    const height = Math.round(width * 1.1 * 10) / 10;
    const [cx, floorY] = proj(X, 0, Z);
    return {
      x: Math.round((cx - width / 2) * 10) / 10,
      y: Math.round((floorY - (footY / 220) * height) * 10) / 10,
      width,
      height,
    };
  };
  // Street watch: sitting on the tiles right against the railing curb in the open left corner
  const lookOutBox = placeOli(-130, 278, 207, 66);
  // Belly-up roll in the sunny foreground, clear of the café set
  const bellyUpBox = placeOli(-36, 160, 200, 150);

  return (
    <svg
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="bal-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? '#0f1631' : isSunset ? '#312e81' : '#8ecaf6'} />
          <stop offset="58%" stopColor={isNight ? '#1c254b' : isSunset ? '#c026d3' : '#cde8fb'} />
          <stop offset="100%" stopColor={isNight ? '#2a315c' : isSunset ? '#f97316' : '#faf2e1'} />
        </linearGradient>

        <radialGradient id="bal-sunglow" cx="25%" cy="18%" r="55%">
          <stop offset="0%" stopColor={isSunset ? '#fef08a' : '#fff7d6'} stopOpacity={isNight ? '0' : isSunset ? '0.75' : '0.65'} />
          <stop offset="60%" stopColor={isSunset ? '#fb923c' : '#ffeab3'} stopOpacity={isNight ? '0' : isSunset ? '0.28' : '0.18'} />
          <stop offset="100%" stopColor={isSunset ? '#f97316' : '#ffeab3'} stopOpacity="0" />
        </radialGradient>

        <linearGradient id="bal-tiles" x1="0.15" y1="0" x2="0.65" y2="1">
          <stop offset="0%" stopColor={isNight ? '#443f52' : isSunset ? '#dfbda7' : '#e6dac8'} />
          <stop offset="55%" stopColor={isNight ? '#3a3547' : isSunset ? '#cc9f83' : '#d8cab5'} />
          <stop offset="100%" stopColor={isNight ? '#2f2b3b' : isSunset ? '#ba8669' : '#c9b9a2'} />
        </linearGradient>

        <linearGradient id="bal-wall-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={isNight ? '#534f66' : isSunset ? '#fbeae0' : '#f4efe6'} />
          <stop offset="78%" stopColor={isNight ? '#474358' : isSunset ? '#f1dbce' : '#eae3d6'} />
          <stop offset="100%" stopColor={isNight ? '#3a3749' : isSunset ? '#e2c6b4' : '#dad1c1'} />
        </linearGradient>

        <linearGradient id="bal-steel-h" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? '#8a91a8' : isSunset ? '#fde047' : '#eef2f6'} />
          <stop offset="40%" stopColor={isNight ? '#adb4ca' : isSunset ? '#fed7aa' : '#ffffff'} />
          <stop offset="78%" stopColor={isNight ? '#686f85' : isSunset ? '#fb923c' : '#b7c0ca'} />
          <stop offset="100%" stopColor={isNight ? '#4f5568' : isSunset ? '#b45309' : '#8d97a3'} />
        </linearGradient>

        <linearGradient id="bal-steel-v" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={isNight ? '#6c7389' : isSunset ? '#f59e0b' : '#b8c1cb'} />
          <stop offset="45%" stopColor={isNight ? '#9ea5bc' : isSunset ? '#fed7aa' : '#f2f5f8'} />
          <stop offset="100%" stopColor={isNight ? '#555b70' : isSunset ? '#b45309' : '#8e98a4'} />
        </linearGradient>

        <linearGradient id="bal-planter-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? '#5c606e' : isSunset ? '#8b7c79' : '#7b818a'} />
          <stop offset="100%" stopColor={isNight ? '#434753' : isSunset ? '#6b5c5a' : '#5b6068'} />
        </linearGradient>

        <linearGradient id="bal-pot-cyl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={isNight ? '#646878' : isSunset ? '#8f837f' : '#858b94'} />
          <stop offset="32%" stopColor={isNight ? '#727788' : isSunset ? '#9e918d' : '#969ca6'} />
          <stop offset="72%" stopColor={isNight ? '#525665' : isSunset ? '#796c68' : '#6c727b'} />
          <stop offset="100%" stopColor={isNight ? '#3f424f' : isSunset ? '#5d514d' : '#525760'} />
        </linearGradient>
      </defs>

      {/* 1. Sky Backdrop + Sunlight / Night Stars */}
      <rect width="400" height="325" fill="url(#bal-sky)" />
      <rect width="400" height="325" fill="url(#bal-sunglow)" />

      {isNight && (
        <g>
          <circle cx="332" cy="64" r="13" fill="#fff6d6" />
          <circle cx="338" cy="59" r="11.5" fill="#131b3a" />
          {[
            [78, 46],
            [126, 68],
            [184, 38],
            [248, 56],
            [292, 40],
            [366, 86],
          ].map(([sx, sy], i) => (
            <motion.circle
              key={i}
              cx={sx}
              cy={sy}
              r={1.3}
              fill="#ffffff"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.2 + i * 0.35, repeat: Infinity }}
            />
          ))}
        </g>
      )}

      {/* Outdoor Rain Over Balcony */}
      {isRaining && (
        <g pointerEvents="none">
          <rect width="400" height="325" fill="#38bdf8" opacity="0.10" />
          {[
            { x: 45, y: 30, dur: 1.4, delay: 0 },
            { x: 95, y: 70, dur: 1.7, delay: 0.3 },
            { x: 145, y: 40, dur: 1.5, delay: 0.7 },
            { x: 210, y: 80, dur: 1.9, delay: 0.2 },
            { x: 275, y: 50, dur: 1.6, delay: 0.5 },
            { x: 340, y: 90, dur: 1.8, delay: 0.9 },
            { x: 175, y: 120, dur: 1.5, delay: 0.4 },
            { x: 310, y: 140, dur: 1.7, delay: 0.8 },
          ].map((drop, i) => (
            <motion.line
              key={`bal-rain-${i}`}
              x1={drop.x}
              y1={drop.y}
              x2={drop.x - 3}
              y2={drop.y + 16}
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.65"
              animate={{ y: [0, 80, 160], opacity: [0, 0.75, 0] }}
              transition={{ duration: drop.dur, delay: drop.delay, repeat: Infinity, ease: 'easeIn' }}
            />
          ))}
        </g>
      )}

      {/* 2. Background Left: Golden autumn trees & evergreen conifers across the quiet street */}
      <g>
        <circle cx="96" cy="122" r="34" fill={night ? '#2c352d' : '#dfa93a'} />
        <circle cx="128" cy="136" r="28" fill={night ? '#333d32' : '#ebc054'} />
        <circle cx="72" cy="138" r="28" fill={night ? '#232e26' : '#668749'} />
        <polygon points="88,78 60,174 116,174" fill={night ? '#1c2822' : '#355630'} />
        <polygon points="108,94 80,186 136,186" fill={night ? '#223129' : '#40663a'} />
        <polygon points="134,114 112,198 156,198" fill={night ? '#1d2b24' : '#365831'} />
        <rect x="48" y="156" width="118" height="58" fill={night ? '#202f27' : '#3d6136'} />
      </g>

      {/* 3. Background Center-Right: Neighboring European cream-stucco house */}
      <g>
        <polygon
          points="154,112 186,78 352,82 376,114"
          fill={night ? '#2b2a3a' : '#655f58'}
          stroke={night ? '#201f2c' : '#524d47'}
          strokeWidth="1"
        />
        <rect
          x="220"
          y="86"
          width="36"
          height="16"
          rx="1"
          fill={night ? '#464a5e' : '#dce1e6'}
          stroke={night ? '#2b2a3a' : '#655f58'}
          strokeWidth="0.9"
        />
        <polygon points="216,102 260,102 264,108 212,108" fill={night ? '#5b6076' : '#bcc4cc'} />

        <polygon points="158,112 182,108 182,252 158,252" fill={isNight ? '#646075' : isSunset ? '#f1dbce' : '#e5ddd0'} />
        <rect x="182" y="108" width="128" height="146" fill={isNight ? '#736f86' : isSunset ? '#fbeae0' : '#f3ece0'} />
        <rect x="310" y="112" width="90" height="142" fill={isNight ? '#685f72' : isSunset ? '#ebd5bf' : '#e7d4c0'} />
        <line x1="182" y1="108" x2="182" y2="252" stroke={isNight ? '#4a4759' : isSunset ? '#baa99a' : '#b2a99c'} strokeWidth="1.4" />
        <line x1="310" y1="112" x2="310" y2="252" stroke={isNight ? '#4a4759' : isSunset ? '#baa99a' : '#bba998'} strokeWidth="1.4" />

        {/* Upper floor windows with soft sky-reflecting glass & white roller shutters (warm night lights) */}
        <rect x="198" y="120" width="42" height="26" rx="1.5" fill={isNight ? '#fef08a' : isSunset ? '#a855f7' : '#7b8c9c'} opacity={isNight ? 0.9 : 1} stroke="#ffffff" strokeWidth="1.5" />
        <rect x="199" y="121" width="40" height="14" fill={isNight ? '#87839b' : '#eeeae2'} />
        <line x1="199" y1="126" x2="239" y2="126" stroke={isNight ? '#6d6980' : '#d5cfc4'} strokeWidth="0.8" />
        <line x1="199" y1="131" x2="239" y2="131" stroke={isNight ? '#6d6980' : '#d5cfc4'} strokeWidth="0.8" />

        <rect x="256" y="122" width="38" height="24" rx="1.5" fill={isNight ? '#fef08a' : isSunset ? '#9333ea' : '#7b8c9c'} opacity={isNight ? 0.85 : 1} stroke="#ffffff" strokeWidth="1.5" />
        <rect x="257" y="123" width="18" height="22" fill={isNight ? '#87839b' : '#eeeae2'} />
        <rect x="276" y="123" width="17" height="11" fill={isNight ? '#87839b' : '#eeeae2'} />

        <rect x="324" y="125" width="32" height="23" rx="1.5" fill={isNight ? '#2f354b' : isSunset ? '#7c3aed' : '#7b8c9c'} stroke="#ffffff" strokeWidth="1.5" />
        <rect x="340" y="126" width="15" height="21" fill={isNight ? '#87839b' : '#eeeae2'} />

        {/* Lower floor shuttered windows */}
        <rect x="198" y="162" width="42" height="25" rx="1.5" fill={isNight ? '#817d94' : '#ece7dd'} stroke="#ffffff" strokeWidth="1.4" />
        <line x1="199" y1="170" x2="239" y2="170" stroke={isNight ? '#6b677d' : '#d5cfc4'} strokeWidth="0.8" />
        <line x1="199" y1="178" x2="239" y2="178" stroke={isNight ? '#6b677d' : '#d5cfc4'} strokeWidth="0.8" />

        <rect x="256" y="164" width="38" height="23" rx="1.5" fill={isNight ? '#817d94' : '#ece7dd'} stroke="#ffffff" strokeWidth="1.4" />
        <line x1="275" y1="164" x2="275" y2="187" stroke={isNight ? '#6b677d' : '#d5cfc4'} strokeWidth="0.9" />
      </g>

      {/* 4. Quiet street & lush green garden hedges visible through the balcony railing balusters */}
      <g>
        <rect x="48" y="210" width="124" height="108" fill={night ? '#343544' : '#b8b2a8'} />
        <line x1="48" y1="252" x2="172" y2="252" stroke={night ? '#494a5c' : '#d4cec4'} strokeWidth="2" />

        <rect x="160" y="214" width="240" height="190" fill={night ? '#1e2b23' : '#3e5e35'} />
        <circle cx="182" cy="236" r="24" fill={night ? '#26372c' : '#4e7342'} />
        <circle cx="222" cy="232" r="28" fill={night ? '#2c3f32' : '#587f4a'} />
        <circle cx="268" cy="234" r="30" fill={night ? '#243429' : '#486c3c'} />
        <circle cx="318" cy="238" r="32" fill={night ? '#2b3d31' : '#557b47'} />
        <circle cx="364" cy="254" r="36" fill={night ? '#233328' : '#45683a'} />
        <circle cx="382" cy="306" r="40" fill={night ? '#2a3c30' : '#507643'} />
      </g>

      {/* 5. Warm Square Sandstone Balcony Floor Tiles (40x40cm slabs projected from VP) */}
      <g>
        <polygon
          points={`${proj(xWallLeft, 0, zRailBack).join(',')} ${proj(xCornerRight, 0, zRailBack).join(',')} ${proj(xCornerRight, 0, 120).join(',')} 400,600 0,600 ${proj(xWallLeft, 0, 215).join(',')}`}
          fill="url(#bal-tiles)"
        />

        {/* Perspective tile grout grid — longitudinal rays from VP & foreshortened transverse rows */}
        <g stroke={night ? '#282436' : '#a69682'} strokeWidth="1.15" opacity="0.58">
          {[-148, -110, -72, -34, 4, 42, 80].map((tileX) => {
            const [x1, y1] = proj(tileX, 0, zRailBack);
            const [x2, y2] = proj(tileX, 0, 92);
            return <line key={tileX} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
          {[252, 214, 176, 138, 100].map((tileZ) => {
            const [xL, yRow] = proj(xWallLeft - 15, 0, tileZ);
            const [xR] = proj(xCornerRight, 0, tileZ);
            return <line key={tileZ} x1={Math.max(0, xL)} y1={yRow} x2={Math.min(400, xR)} y2={yRow} />;
          })}
        </g>
      </g>

      {/* 6. White Concrete Parapet Curb (Back + Right Perspective Return) */}
      <g>
        <polygon
          points={pts(
            [xWallLeft, 9, zRailBack + 5],
            [xCornerRight + 5, 9, zRailBack + 5],
            [xCornerRight, 9, zRailBack],
            [xWallLeft, 9, zRailBack],
          )}
          fill={night ? '#9894aa' : '#faf8f3'}
        />
        <polygon
          points={pts(
            [xWallLeft, 9, zRailBack],
            [xCornerRight, 9, zRailBack],
            [xCornerRight, 0, zRailBack],
            [xWallLeft, 0, zRailBack],
          )}
          fill={night ? '#817d93' : '#ebe6dc'}
          stroke={night ? '#656176' : '#cfc8ba'}
          strokeWidth="0.9"
        />

        <polygon
          points={pts(
            [xCornerRight, 9, zRailBack],
            [xCornerRight + 6, 9, zRailBack + 5],
            [xCornerRight + 6, 9, zReturnFront],
            [xCornerRight, 9, zReturnFront],
          )}
          fill={night ? '#9894aa' : '#faf8f3'}
        />
        <polygon
          points={pts(
            [xCornerRight, 9, zRailBack],
            [xCornerRight, 9, zReturnFront],
            [xCornerRight, 0, zReturnFront],
            [xCornerRight, 0, zRailBack],
          )}
          fill={night ? '#777388' : '#e2dcd0'}
          stroke={night ? '#5e5a6e' : '#c7bfb0'}
          strokeWidth="0.9"
        />
      </g>

      {/* 7. Left Exterior Stucco Apartment Wall Column (clean continuous 3D base + tile skirting) */}
      <g>
        <polygon
          points={`0,0 ${proj(xWallLeft, 164, zRailBack)[0]},0 ${proj(xWallLeft, 0, zRailBack).join(',')} ${proj(xWallLeft, 0, 224).join(',')}`}
          fill="url(#bal-wall-left)"
          stroke={night ? '#383447' : '#cdc3b3'}
          strokeWidth="1.1"
        />
        {/* Subtle stone skirting baseboard along the receding wall base */}
        <polygon
          points={pts(
            [xWallLeft, 7, zRailBack],
            [xWallLeft, 0, zRailBack],
            [xWallLeft, 0, 224],
            [xWallLeft, 7, 224],
          )}
          fill={night ? '#433f54' : '#ded5c5'}
          stroke={night ? '#343042' : '#c6bba8'}
          strokeWidth="0.8"
        />
        {/* Front exterior wall return face */}
        <polygon
          points={`0,0 18,0 18,${proj(xWallLeft, 0, 232)[1]} 0,${proj(xWallLeft, 0, 232)[1]}`}
          fill={night ? '#59556d' : '#f8f4ec'}
        />
        <rect
          x="0"
          y={proj(xWallLeft, 0, 232)[1] - 8}
          width="18"
          height="8"
          fill={night ? '#4b475e' : '#e7dfd0'}
        />
        <line
          x1="18"
          y1="0"
          x2="18"
          y2={proj(xWallLeft, 0, 232)[1]}
          stroke={night ? '#3d394f' : '#d5ccb9'}
          strokeWidth="1.2"
        />
        <line
          x1="0"
          y1={proj(xWallLeft, 0, 232)[1]}
          x2="18"
          y2={proj(xWallLeft, 0, 232)[1]}
          stroke={night ? '#383447' : '#c7beae'}
          strokeWidth="1.2"
        />
      </g>

      {/* 8. Brushed Stainless-Steel Balcony Railing (Horizontal Back + Right Perspective Return) */}
      <g>
        {[-166, -150, -134, -118, -102, -86, -70, -54, -38, -22, -6, 10, 26, 42, 58, 74, 90, 102].map((bx) => {
          const [xTop, yTop] = proj(bx, 93, zRailBack);
          const [, yBot] = proj(bx, 14, zRailBack);
          return (
            <line
              key={bx}
              x1={xTop}
              y1={yTop}
              x2={xTop}
              y2={yBot}
              stroke={night ? '#6e748a' : '#bcc5ce'}
              strokeWidth="2.1"
            />
          );
        })}

        <line
          x1={proj(xWallLeft, 93, zRailBack)[0]}
          y1={proj(xWallLeft, 93, zRailBack)[1]}
          x2={proj(xCornerRight, 93, zRailBack)[0]}
          y2={proj(xCornerRight, 93, zRailBack)[1]}
          stroke={night ? '#7d849c' : '#ced5dd'}
          strokeWidth="3"
        />
        <line
          x1={proj(xWallLeft, 14, zRailBack)[0]}
          y1={proj(xWallLeft, 14, zRailBack)[1]}
          x2={proj(xCornerRight, 14, zRailBack)[0]}
          y2={proj(xCornerRight, 14, zRailBack)[1]}
          stroke={night ? '#7d849c' : '#ced5dd'}
          strokeWidth="3"
        />

        {[-178, -80, 18, xCornerRight].map((px) => {
          const [xP, yTop] = proj(px, 101, zRailBack);
          const [, yBot] = proj(px, 9, zRailBack);
          return <rect key={px} x={xP - 2.6} y={yTop} width="5.2" height={yBot - yTop} rx="1.4" fill="url(#bal-steel-v)" />;
        })}

        {[274, 258, 242, 226, 210].map((rz) => {
          const [rx, ryTop] = proj(xCornerRight, 93, rz);
          const [, ryBot] = proj(xCornerRight, 14, rz);
          return (
            <line
              key={rz}
              x1={rx}
              y1={ryTop}
              x2={rx}
              y2={ryBot}
              stroke={night ? '#686e84' : '#b2bcc6'}
              strokeWidth="2.3"
            />
          );
        })}
        <line
          x1={proj(xCornerRight, 93, zRailBack)[0]}
          y1={proj(xCornerRight, 93, zRailBack)[1]}
          x2={proj(xCornerRight, 93, zReturnFront)[0]}
          y2={proj(xCornerRight, 93, zReturnFront)[1]}
          stroke={night ? '#7a8199' : '#c6ced7'}
          strokeWidth="3.2"
        />
        <line
          x1={proj(xCornerRight, 14, zRailBack)[0]}
          y1={proj(xCornerRight, 14, zRailBack)[1]}
          x2={proj(xCornerRight, 14, zReturnFront)[0]}
          y2={proj(xCornerRight, 14, zReturnFront)[1]}
          stroke={night ? '#7a8199' : '#c6ced7'}
          strokeWidth="3.2"
        />

        {/* Continuous Brushed Stainless-Steel Tubular Top Handrail */}
        <rect
          x={proj(xWallLeft, 104, zRailBack)[0] - 2}
          y={proj(xWallLeft, 104, zRailBack)[1]}
          width={proj(xCornerRight, 104, zRailBack)[0] - proj(xWallLeft, 104, zRailBack)[0] + 4}
          height="6.8"
          rx="3.4"
          fill="url(#bal-steel-h)"
          stroke={night ? '#4b5063' : '#8b95a1'}
          strokeWidth="0.8"
        />
        <polygon
          points={pts(
            [xCornerRight - 1, 104, zRailBack],
            [xCornerRight + 4, 104, zRailBack],
            [xCornerRight + 4, 98, zReturnFront],
            [xCornerRight - 1, 98, zReturnFront],
          )}
          fill="url(#bal-steel-h)"
          stroke={night ? '#4b5063' : '#8b95a1'}
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </g>

      {/* 9. Two 3D Hanging Grey Planter Boxes + Corner Cypress Pot (Cozy Spot 1: 'planter') */}
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
            ? 'Pet Oli watching the street in the left corner'
            : 'Left balcony corner overlooking the street (cozy spot)'
        }
      >
        <rect x="62" y="185" width="250" height="152" fill="transparent" style={{ pointerEvents: 'all' }} />

        {/* Oli in the left corner with his back to us, watching the quiet street below.
            Drawn before the planter boxes and pot because they are closer to the camera. */}
        {activeSpot === 'planter' && (
          <motion.g
            key={`cat-planter-${catAnimationKey}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <CatAvatar
              x={lookOutBox.x}
              y={lookOutBox.y}
              width={lookOutBox.width}
              height={lookOutBox.height}
              pose="look_out"
              mood={catMood}
              animation={catAnimation}
              animationKey={catAnimationKey}
              onPet={onPetCat}
              className="pointer-events-auto"
            />
          </motion.g>
        )}

        {/* Left Hanging Grey Planter Box */}
        <HangingPlanterBox
          xLeft={-92}
          xRight={-22}
          night={night}
          hasBurgundyLeft
          pansies={[
            { xRatio: 0.32, dy: -6, scale: 0.94, rotate: -8, variant: 'yellow-top' },
            { xRatio: 0.55, dy: -8.8, scale: 1.0, rotate: 6, variant: 'purple-top' },
            { xRatio: 0.79, dy: -5.4, scale: 0.92, rotate: -5, variant: 'yellow-top' },
          ]}
        />

        {/* Right Hanging Grey Planter Box */}
        <HangingPlanterBox
          xLeft={-4}
          xRight={66}
          night={night}
          pansies={[
            { xRatio: 0.2, dy: -5.8, scale: 0.93, rotate: 7, variant: 'purple-top' },
            { xRatio: 0.43, dy: -8.8, scale: 1.0, rotate: -6, variant: 'yellow-top' },
            { xRatio: 0.65, dy: -5.5, scale: 0.95, rotate: 8, variant: 'purple-top' },
            { xRatio: 0.85, dy: -7.2, scale: 0.9, rotate: -9, variant: 'yellow-top' },
          ]}
        />

        {/* Corner Tapered Cylindrical Matte-Grey Pot & Natural Layered Cypress Tree */}
        <g>
          <ellipse cx={potBaseCx + 2} cy={potBaseCy + 2} rx="21" ry="5.2" fill="rgba(35,28,20,0.22)" />

          <path
            d={`M ${potRimCx - 19.5} ${potRimCy + 3} L ${potBaseCx - 15} ${potBaseCy - 1} A 15 4.4 0 0 0 ${potBaseCx + 15} ${potBaseCy - 1} L ${potRimCx + 19.5} ${potRimCy + 3} Z`}
            fill="url(#bal-pot-cyl)"
            stroke={night ? '#3d404d' : '#525760'}
            strokeWidth="0.9"
          />

          <path
            d={`M ${potRimCx - 21} ${potRimCy - 3} L ${potRimCx - 20.2} ${potRimCy + 4} A 20.2 5 0 0 0 ${potRimCx + 20.2} ${potRimCy + 4} L ${potRimCx + 21} ${potRimCy - 3} Z`}
            fill="url(#bal-pot-cyl)"
            stroke={night ? '#3d404d' : '#50555e'}
            strokeWidth="0.9"
          />
          <ellipse
            cx={potRimCx}
            cy={potRimCy - 3}
            rx="21"
            ry="5"
            fill={night ? '#787d8f' : '#9ba1ab'}
            stroke={night ? '#4b4f5e' : '#636973'}
            strokeWidth="0.8"
          />
          <ellipse cx={potRimCx} cy={potRimCy - 3} rx="18" ry="3.9" fill={night ? '#241f26' : '#3b2d22'} />

          {/* Natural Layered Botanical Cypress Fronds (no cartoony noodle lines!) */}
          <g>
            {/* Deep shadow evergreen core */}
            <path
              d={`M ${potRimCx} ${potRimCy - 116}
                  C ${potRimCx - 7} ${potRimCy - 100}, ${potRimCx - 12} ${potRimCy - 84}, ${potRimCx - 10} ${potRimCy - 72}
                  C ${potRimCx - 16} ${potRimCy - 58}, ${potRimCx - 18} ${potRimCy - 40}, ${potRimCx - 15} ${potRimCy - 28}
                  C ${potRimCx - 20} ${potRimCy - 16}, ${potRimCx - 18} ${potRimCy - 4}, ${potRimCx - 13} ${potRimCy - 1}
                  Q ${potRimCx} ${potRimCy + 2}, ${potRimCx + 13} ${potRimCy - 1}
                  C ${potRimCx + 19} ${potRimCy - 5}, ${potRimCx + 20} ${potRimCy - 17}, ${potRimCx + 15} ${potRimCy - 29}
                  C ${potRimCx + 18} ${potRimCy - 43}, ${potRimCx + 16} ${potRimCy - 59}, ${potRimCx + 10} ${potRimCy - 73}
                  C ${potRimCx + 11} ${potRimCy - 86}, ${potRimCx + 6} ${potRimCy - 102}, ${potRimCx} ${potRimCy - 116} Z`}
              fill={night ? '#213529' : '#365c30'}
            />
            {/* Tiered upward cypress tufts (mid-green) */}
            <path
              d={`M ${potRimCx - 0.5} ${potRimCy - 112}
                  C ${potRimCx - 6} ${potRimCy - 96}, ${potRimCx - 9} ${potRimCy - 82}, ${potRimCx - 5} ${potRimCy - 74}
                  C ${potRimCx - 12} ${potRimCy - 62}, ${potRimCx - 14} ${potRimCy - 46}, ${potRimCx - 9} ${potRimCy - 38}
                  C ${potRimCx - 15} ${potRimCy - 26}, ${potRimCx - 15} ${potRimCy - 10}, ${potRimCx - 9} ${potRimCy - 2}
                  Q ${potRimCx} ${potRimCy + 1}, ${potRimCx + 8} ${potRimCy - 3}
                  C ${potRimCx + 12} ${potRimCy - 12}, ${potRimCx + 11} ${potRimCy - 25}, ${potRimCx + 6} ${potRimCy - 35}
                  C ${potRimCx + 11} ${potRimCy - 47}, ${potRimCx + 10} ${potRimCy - 61}, ${potRimCx + 4} ${potRimCy - 71}
                  C ${potRimCx + 7} ${potRimCy - 83}, ${potRimCx + 4} ${potRimCy - 98}, ${potRimCx - 0.5} ${potRimCy - 112} Z`}
              fill={night ? '#2c4636' : '#4d7d41'}
            />
            {/* Warm sunlit sage-green frond highlights on the sunlit left side */}
            <path
              d={`M ${potRimCx - 1} ${potRimCy - 105}
                  C ${potRimCx - 5} ${potRimCy - 92}, ${potRimCx - 7} ${potRimCy - 80}, ${potRimCx - 3} ${potRimCy - 74}
                  C ${potRimCx - 9} ${potRimCy - 62}, ${potRimCx - 10} ${potRimCy - 48}, ${potRimCx - 5} ${potRimCy - 41}
                  C ${potRimCx - 11} ${potRimCy - 30}, ${potRimCx - 11} ${potRimCy - 14}, ${potRimCx - 5} ${potRimCy - 5}
                  C ${potRimCx - 1} ${potRimCy - 12}, ${potRimCx - 1} ${potRimCy - 26}, ${potRimCx + 1} ${potRimCy - 36}
                  C ${potRimCx + 2} ${potRimCy - 50}, ${potRimCx + 2} ${potRimCy - 66}, ${potRimCx} ${potRimCy - 80} Z`}
              fill={night ? '#375643' : '#659954'}
            />
          </g>
        </g>

      </g>

      {/* 10. 3D Wooden-Slat Folding Bistro Table & Two Matching Folding Chairs (Cozy Spot 2: 'bistro_chair') */}
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
            ? 'Pet Oli on the sunny wooden bistro table'
            : 'Wooden bistro table & chairs (cozy spot)'
        }
      >
        <rect x="174" y="220" width="164" height="176" fill="transparent" style={{ pointerEvents: 'all' }} />

        {/* Soft ambient shadow beneath the center bistro table */}
        <ellipse
          cx={proj((tX0 + tX1) / 2, 0, (tZFront + tZBack) / 2)[0]}
          cy={proj((tX0 + tX1) / 2, 0, (tZFront + tZBack) / 2)[1]}
          rx="40"
          ry="9"
          fill="rgba(35,28,20,0.17)"
        />

        {/* A. Right Folding Bistro Chair (facing left toward the open right side of the table) */}
        <FoldingBistroChair side="right" xSeatInner={42} zFront={204} zBack={232} night={night} />

        {/* B. Left Folding Bistro Chair (facing right toward the open left side of the table) */}
        <FoldingBistroChair side="left" xSeatInner={-12} zFront={204} zBack={232} night={night} />

        {/* C. Center Square Wooden-Slat Folding Bistro Table (with iconic crossed X-legs on back & front!) */}
        <g>
          {/* 1. Back black steel X-leg frame (Z = tZBack - 3, leaving left & right knee sides open!) */}
          <g stroke={night ? '#1a1d26' : '#282c35'} strokeWidth="2.4" strokeLinecap="round">
            <line
              x1={proj(tX0 + 3.5, tY - 1.5, tZBack - 3)[0]}
              y1={proj(tX0 + 3.5, tY - 1.5, tZBack - 3)[1]}
              x2={proj(tX1 - 3.5, 0, tZBack - 3)[0]}
              y2={proj(tX1 - 3.5, 0, tZBack - 3)[1]}
            />
            <line
              x1={proj(tX1 - 3.5, tY - 1.5, tZBack - 3)[0]}
              y1={proj(tX1 - 3.5, tY - 1.5, tZBack - 3)[1]}
              x2={proj(tX0 + 3.5, 0, tZBack - 3)[0]}
              y2={proj(tX0 + 3.5, 0, tZBack - 3)[1]}
            />
          </g>
          <circle cx={proj(tX0 + 3.5, 0, tZBack - 3)[0]} cy={proj(tX0 + 3.5, 0, tZBack - 3)[1]} r="2" fill="#181b20" />
          <circle cx={proj(tX1 - 3.5, 0, tZBack - 3)[0]} cy={proj(tX1 - 3.5, 0, tZBack - 3)[1]} r="2" fill="#181b20" />

          {/* 2. Central pivot axle connecting back X-hub to front X-hub */}
          <line
            x1={proj((tX0 + tX1) / 2, (tY - 1.5) * 0.5, tZBack - 3)[0]}
            y1={proj((tX0 + tX1) / 2, (tY - 1.5) * 0.5, tZBack - 3)[1]}
            x2={proj((tX0 + tX1) / 2, (tY - 1.5) * 0.5, tZFront + 3)[0]}
            y2={proj((tX0 + tX1) / 2, (tY - 1.5) * 0.5, tZFront + 3)[1]}
            stroke={night ? '#181a22' : '#22262e'}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* 3. Front black steel X-leg frame (Z = tZFront + 3) */}
          <g stroke={night ? '#12141b' : '#1b1e24'} strokeWidth="2.8" strokeLinecap="round">
            <line
              x1={proj(tX0 + 3.5, tY - 1.5, tZFront + 3)[0]}
              y1={proj(tX0 + 3.5, tY - 1.5, tZFront + 3)[1]}
              x2={proj(tX1 - 3.5, 0, tZFront + 3)[0]}
              y2={proj(tX1 - 3.5, 0, tZFront + 3)[1]}
            />
            <line
              x1={proj(tX1 - 3.5, tY - 1.5, tZFront + 3)[0]}
              y1={proj(tX1 - 3.5, tY - 1.5, tZFront + 3)[1]}
              x2={proj(tX0 + 3.5, 0, tZFront + 3)[0]}
              y2={proj(tX0 + 3.5, 0, tZFront + 3)[1]}
            />
          </g>
          {/* Metallic hinge rivet at front X-crossing */}
          <circle
            cx={proj((tX0 + tX1) / 2, (tY - 1.5) * 0.5, tZFront + 3)[0]}
            cy={proj((tX0 + tX1) / 2, (tY - 1.5) * 0.5, tZFront + 3)[1]}
            r="1.2"
            fill="#9ca3af"
          />
          <circle cx={proj(tX0 + 3.5, 0, tZFront + 3)[0]} cy={proj(tX0 + 3.5, 0, tZFront + 3)[1]} r="2.5" fill="#14161b" />
          <circle cx={proj(tX1 - 3.5, 0, tZFront + 3)[0]} cy={proj(tX1 - 3.5, 0, tZFront + 3)[1]} r="2.5" fill="#14161b" />

          {/* 4. Dark steel under-apron frame beneath tabletop slats */}
          <polygon
            points={pts(
              [tX0 + 1.5, tY - 1.4, tZBack - 1],
              [tX1 - 1.5, tY - 1.4, tZBack - 1],
              [tX1 - 1.5, tY - 1.4, tZFront + 1],
              [tX0 + 1.5, tY - 1.4, tZFront + 1],
            )}
            fill="#23262d"
          />

          {/* 5. Six Weathered Wooden Tabletop Slats (drawn back-to-front in exact 1-point perspective) */}
          {tableSlats.map((slat, idx) => {
            const yTop = tY + 1.8;
            return (
              <g key={idx}>
                {/* Shaded front vertical thickness edge of plank */}
                <polygon
                  points={pts(
                    [tX0, yTop, slat.zF],
                    [tX1, yTop, slat.zF],
                    [tX1, tY, slat.zF],
                    [tX0, tY, slat.zF],
                  )}
                  fill={night ? '#4e4859' : '#736453'}
                />
                {/* Warm sunlit top wood plank surface */}
                <polygon
                  points={pts(
                    [tX0, yTop, slat.zB],
                    [tX1, yTop, slat.zB],
                    [tX1, yTop, slat.zF],
                    [tX0, yTop, slat.zF],
                  )}
                  fill={slat.color}
                  stroke={night ? '#4b4556' : '#6c5e4e'}
                  strokeWidth="0.65"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
        </g>

        {/* D. Oli perched squarely in the center of the flat horizontal wooden bistro tabletop */}
        {activeSpot === 'bistro_chair' && (
          <motion.g
            key={`cat-bistro-${catAnimationKey}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <CatAvatar
              x={224}
              y={214}
              width={70}
              height={77}
              mood={catMood}
              animation={catAnimation}
              animationKey={catAnimationKey}
              onPet={onPetCat}
              className="pointer-events-auto"
            />
          </motion.g>
        )}
      </g>

      {/* 11. Foreground Sunny Balcony Tiles (Cozy Spot 3: 'balcony_floor' — rendered AFTER bistro set) */}
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
        <rect x="76" y="330" width="166" height="145" fill="transparent" style={{ pointerEvents: 'all' }} />

        {activeSpot === 'balcony_floor' && (
          <motion.g
            key={`cat-balcony-floor-${catAnimationKey}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <CatAvatar
              x={bellyUpBox.x}
              y={bellyUpBox.y}
              width={bellyUpBox.width}
              height={bellyUpBox.height}
              pose="belly_up"
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

export default Balcony;
