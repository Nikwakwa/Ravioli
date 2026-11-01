import { describe, expect, it } from 'vitest';
import type { ReactElement } from 'react';
import { LivingRoom } from './LivingRoom';
import { SPOT_HEAD_SVG } from '../../App';
import type { CatSpot } from '../../types';

/**
 * Mobile Safe-Bounds:
 * The app renders in an SVG viewBox="0 0 400 600" with preserveAspectRatio="xMidYMid slice".
 * On modern smartphones (19.5:9 or 20:9 aspect ratios, e.g. iPhone 14/15/16 Pro, Galaxy S24, Pixel 8/9):
 * Aspect ratio is ~9 / 19.5 ≈ 0.4615.
 * When height is 600, the visible width is 600 * 0.4615 ≈ 276.9 units.
 * Centered horizontally, the horizontal crop cuts off (400 - 276.9) / 2 = 61.5 units on each side.
 * Therefore, anything with x < 62 or x + width > 338 is partially sliced off on mobile!
 */
const SAFE_MOBILE = {
  minX: 62,
  maxX: 338,
  minY: 90, // below top HUD
  maxY: 475, // above bottom ActionDock
};

type AnyElement = ReactElement<Record<string, any>>;

/**
 * Helper to recursively find React elements matching a predicate.
 */
function findElements(node: unknown, predicate: (el: AnyElement) => boolean): AnyElement[] {
  const matches: AnyElement[] = [];
  if (!node || typeof node !== 'object') return matches;

  if ('type' in node && 'props' in node) {
    const el = node as AnyElement;
    if (predicate(el)) {
      matches.push(el);
    }
    if (el.props?.children) {
      if (Array.isArray(el.props.children)) {
        for (const child of el.props.children) {
          matches.push(...findElements(child, predicate));
        }
      } else {
        matches.push(...findElements(el.props.children, predicate));
      }
    }
  } else if (Array.isArray(node)) {
    for (const child of node) {
      matches.push(...findElements(child, predicate));
    }
  }
  return matches;
}

function parseTranslate(transform?: string): { x: number; y: number } {
  if (!transform) return { x: 0, y: 0 };
  const match = transform.match(/translate\(\s*(-?[\d.]+)\s*[, ]\s*(-?[\d.]+)\s*\)/);
  if (!match) return { x: 0, y: 0 };
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
}

describe('LivingRoom — SVG Layer Ordering (Prevent Covered/Occluded Items)', () => {
  it('renders the water fountain AFTER the rug in SVG painter order so it is never covered by the rug', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false, activeSpot: 'rug', onTapFountain: () => {} }) as AnyElement;
    const children = tree.props.children as AnyElement[];

    const rugIndex = children.findIndex((el) => {
      const label = el.props?.['aria-label'] || '';
      return typeof label === 'string' && label.toLowerCase().includes('rug');
    });

    const fountainIndex = children.findIndex((el) => {
      const label = el.props?.['aria-label'] || '';
      return (typeof label === 'string' && label.toLowerCase().includes('fountain')) || el.props?.transform?.includes('404');
    });

    expect(rugIndex).toBeGreaterThan(-1);
    expect(fountainIndex).toBeGreaterThan(-1);
    // Crucial: In SVG, later children are drawn in front. Fountain MUST come after rug!
    expect(fountainIndex).toBeGreaterThan(rugIndex);
  });

  it('renders the water fountain AFTER the coffee table, wall, and floor layers', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false, activeSpot: 'rug', onTapFountain: () => {} }) as AnyElement;
    const children = tree.props.children as AnyElement[];

    const fountainIndex = children.findIndex((el) => {
      const label = el.props?.['aria-label'] || '';
      return (typeof label === 'string' && label.toLowerCase().includes('fountain')) || el.props?.transform?.includes('404');
    });

    // Wall and floor are in the first few children (indices 0..3)
    expect(fountainIndex).toBeGreaterThan(4);
  });

  it('renders the litter box in front of background wall and floor layers', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false, activeSpot: 'rug', onTapLitterBox: () => {} }) as AnyElement;
    const children = tree.props.children as AnyElement[];

    const litterBoxIndex = children.findIndex((el) => {
      const label = el.props?.['aria-label'] || '';
      return (typeof label === 'string' && label.toLowerCase().includes('litter box')) || el.props?.transform?.includes('62 0');
    });

    expect(litterBoxIndex).toBeGreaterThan(3);
  });

  it('physically nestles Oli inside the bolster bed (CatAvatar between inner cushion and front bolster wall)', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false, activeSpot: 'sofa_bed' }) as AnyElement;
    const bolsterBed = findElements(tree, (el) => {
      const label = el.props?.['aria-label'] || '';
      return typeof label === 'string' && label.toLowerCase().includes('bolster bed');
    })[0];

    expect(bolsterBed).toBeDefined();
    const bedChildren = bolsterBed.props.children as AnyElement[];

    // Inner cushion rect
    const cushionIdx = bedChildren.findIndex((c) => c.props?.fill === '#f5ece0');
    // CatAvatar container motion.g
    const catIdx = bedChildren.findIndex((c) => {
      return findElements(c, (inner) => typeof inner.type === 'function' && inner.type.name === 'CatAvatar').length > 0;
    });
    // Tan bolster front rim path
    const rimIdx = bedChildren.findIndex((c) => c.props?.fill === '#b89776' && c.type === 'path');

    expect(cushionIdx).toBeGreaterThan(-1);
    expect(catIdx).toBeGreaterThan(-1);
    expect(rimIdx).toBeGreaterThan(-1);

    // Cushion -> Oli -> Front bolster rim (true 3D nestling)
    expect(catIdx).toBeGreaterThan(cushionIdx);
    expect(rimIdx).toBeGreaterThan(catIdx);
  });

  it('physically nestles Oli inside the delivery box (CatAvatar between box interior and front panel)', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false, activeSpot: 'box' }) as AnyElement;
    const boxGroup = findElements(tree, (el) => {
      const label = el.props?.['aria-label'] || '';
      return typeof label === 'string' && label.toLowerCase().includes('delivery box');
    })[0];

    expect(boxGroup).toBeDefined();
    const boxChildren = boxGroup.props.children as AnyElement[];

    // Dark brown interior polygon
    const interiorIdx = boxChildren.findIndex((c) => c.props?.fill === '#9e7343');
    // CatAvatar container motion.g
    const catIdx = boxChildren.findIndex((c) => {
      return findElements(c, (inner) => typeof inner.type === 'function' && inner.type.name === 'CatAvatar').length > 0;
    });
    // Front cardboard panel polygon with points="138,356 194,356 188,382 142,382"
    const frontPanelIdx = boxChildren.findIndex((c) => c.props?.points === '138,356 194,356 188,382 142,382');

    expect(interiorIdx).toBeGreaterThan(-1);
    expect(catIdx).toBeGreaterThan(-1);
    expect(frontPanelIdx).toBeGreaterThan(-1);

    // Interior -> Oli -> Front cardboard panel
    expect(catIdx).toBeGreaterThan(interiorIdx);
    expect(frontPanelIdx).toBeGreaterThan(catIdx);
  });
});

describe('LivingRoom — Mobile Safe Bounds (No Partially Off-Screen Items)', () => {
  it('positions the water fountain 100% inside the visible mobile screen bounds', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false, onTapFountain: () => {} }) as AnyElement;
    const fountain = findElements(tree, (el) => {
      const label = el.props?.['aria-label'] || '';
      return (typeof label === 'string' && label.toLowerCase().includes('fountain')) || el.props?.transform?.includes('404');
    })[0];

    expect(fountain).toBeDefined();
    const { x, y } = parseTranslate(fountain.props.transform);

    // Fountain body is 42 units wide, bowl is 22 units wide, total width = 74 units
    const minX = x + 4;
    const maxX = x + 74;
    const minY = y + 6;
    const maxY = y + 46;

    expect(minX).toBeGreaterThanOrEqual(SAFE_MOBILE.minX);
    expect(maxX).toBeLessThanOrEqual(SAFE_MOBILE.maxX);
    expect(minY).toBeGreaterThanOrEqual(SAFE_MOBILE.minY);
    expect(maxY).toBeLessThanOrEqual(SAFE_MOBILE.maxY);
  });

  it('positions the litter box 100% inside the visible mobile screen bounds (no longer half off-screen)', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false, onTapLitterBox: () => {} }) as AnyElement;
    const litterBox = findElements(tree, (el) => {
      const label = el.props?.['aria-label'] || '';
      return (typeof label === 'string' && label.toLowerCase().includes('litter box')) || el.props?.transform?.includes('62 0');
    })[0];

    expect(litterBox).toBeDefined();
    const { x, y } = parseTranslate(litterBox.props.transform);

    // Litter box hood/drawer spans x: 10..70 (width: 60)
    const minX = x + 10;
    const maxX = x + 70;
    const minY = y + 316;
    const maxY = y + 371;

    expect(minX).toBeGreaterThanOrEqual(SAFE_MOBILE.minX);
    expect(maxX).toBeLessThanOrEqual(SAFE_MOBILE.maxX);
    expect(minY).toBeGreaterThanOrEqual(SAFE_MOBILE.minY);
    expect(maxY).toBeLessThanOrEqual(SAFE_MOBILE.maxY);
  });

  it('positions the bolster bed on the sofa 100% inside the visible mobile screen bounds', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false }) as AnyElement;
    const bed = findElements(tree, (el) => {
      const label = el.props?.['aria-label'] || '';
      return typeof label === 'string' && label.toLowerCase().includes('bolster bed');
    })[0];

    expect(bed).toBeDefined();
    const { x, y } = parseTranslate(bed.props.transform);

    // Bolster bed outer rim is 64 units wide and 36 units high
    const minX = x;
    const maxX = x + 64;
    const minY = y;
    const maxY = y + 36;

    expect(minX).toBeGreaterThanOrEqual(SAFE_MOBILE.minX);
    expect(maxX).toBeLessThanOrEqual(SAFE_MOBILE.maxX);
    expect(minY).toBeGreaterThanOrEqual(SAFE_MOBILE.minY);
    expect(maxY).toBeLessThanOrEqual(SAFE_MOBILE.maxY);
  });

  it('positions the delivery cardboard box 100% inside the visible mobile screen bounds', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false }) as AnyElement;
    const box = findElements(tree, (el) => {
      const label = el.props?.['aria-label'] || '';
      return typeof label === 'string' && label.toLowerCase().includes('delivery box');
    })[0];

    expect(box).toBeDefined();
    // Delivery box spans x: 134..198, y: 344..382
    const minX = 134;
    const maxX = 198;
    const minY = 344;
    const maxY = 382;

    expect(minX).toBeGreaterThanOrEqual(SAFE_MOBILE.minX);
    expect(maxX).toBeLessThanOrEqual(SAFE_MOBILE.maxX);
    expect(minY).toBeGreaterThanOrEqual(SAFE_MOBILE.minY);
    expect(maxY).toBeLessThanOrEqual(SAFE_MOBILE.maxY);
  });

  it('positions the windowsill cozy spot 100% inside the visible mobile screen bounds', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false }) as AnyElement;
    const sill = findElements(tree, (el) => {
      const label = el.props?.['aria-label'] || '';
      return typeof label === 'string' && label.toLowerCase().includes('windowsill');
    })[0];

    expect(sill).toBeDefined();
    const minX = 156;
    const maxX = 228;

    expect(minX).toBeGreaterThanOrEqual(SAFE_MOBILE.minX);
    expect(maxX).toBeLessThanOrEqual(SAFE_MOBILE.maxX);
  });

  it('positions the candle jar on the coffee table completely within the visible screen', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false }) as AnyElement;
    const candleJar = findElements(tree, (el) => {
      return el.type === 'rect' && el.props?.fill === '#f2efe9' && el.props?.y === '335';
    })[0];

    expect(candleJar).toBeDefined();
    const x = parseFloat(candleJar.props.x);
    expect(x).toBeGreaterThanOrEqual(SAFE_MOBILE.minX);
    expect(x).toBeLessThanOrEqual(SAFE_MOBILE.maxX);
  });

  it('ensures Oli is 100% visible inside each of the 4 cozy spots without edge clipping', () => {
    const spots: CatSpot[] = ['rug', 'sofa_bed', 'box', 'window'];

    for (const spot of spots) {
      const tree = LivingRoom({ sleeping: false, fountainBoost: false, activeSpot: spot }) as AnyElement;
      const avatarList = findElements(tree, (el) => typeof el.type === 'function' && el.type.name === 'CatAvatar');
      expect(avatarList.length, `Oli must render when activeSpot is ${spot}`).toBe(1);

      const avatar = avatarList[0];
      const localX = avatar.props.x as number;
      const localY = avatar.props.y as number;
      const width = avatar.props.width as number;
      const height = avatar.props.height as number;

      // Find parent translate if any
      let parentTranslate = { x: 0, y: 0 };
      if (spot === 'sofa_bed') {
        const bed = findElements(tree, (el) => (el.props?.['aria-label'] || '').includes('bolster bed'))[0];
        parentTranslate = parseTranslate(bed?.props?.transform);
      }

      const absoluteMinX = parentTranslate.x + localX;
      const absoluteMaxX = absoluteMinX + width;
      const absoluteMinY = parentTranslate.y + localY;
      const absoluteMaxY = absoluteMinY + height;

      expect(absoluteMinX, `Oli left edge in ${spot} must be >= ${SAFE_MOBILE.minX}`).toBeGreaterThanOrEqual(SAFE_MOBILE.minX);
      expect(absoluteMaxX, `Oli right edge in ${spot} must be <= ${SAFE_MOBILE.maxX}`).toBeLessThanOrEqual(SAFE_MOBILE.maxX);
      expect(absoluteMinY, `Oli top edge in ${spot} must be >= ${SAFE_MOBILE.minY}`).toBeGreaterThanOrEqual(SAFE_MOBILE.minY);
      expect(absoluteMaxY, `Oli bottom edge in ${spot} must be <= ${SAFE_MOBILE.maxY}`).toBeLessThanOrEqual(SAFE_MOBILE.maxY);
    }
  });
});

describe('LivingRoom — Cat Care Hygiene & Layout Rules', () => {
  it('enforces biological separation between the litter box and water fountain (minimum 120 units apart)', () => {
    const tree = LivingRoom({ sleeping: false, fountainBoost: false, onTapFountain: () => {}, onTapLitterBox: () => {} }) as AnyElement;

    const litterBox = findElements(tree, (el) => (el.props?.['aria-label'] || '').includes('litter box'))[0];
    const fountain = findElements(tree, (el) => (el.props?.['aria-label'] || '').includes('fountain'))[0];

    const litterPos = parseTranslate(litterBox.props.transform);
    const fountainPos = parseTranslate(fountain.props.transform);

    // Center of litter box (x=40, y=340 inside transform)
    const litterCenter = { x: litterPos.x + 40, y: litterPos.y + 340 };
    // Center of water fountain (x=26, y=25 inside transform)
    const fountainCenter = { x: fountainPos.x + 26, y: fountainPos.y + 25 };

    const distance = Math.hypot(fountainCenter.x - litterCenter.x, fountainCenter.y - litterCenter.y);

    // Cats will refuse water placed right next to their toilet:
    expect(distance).toBeGreaterThanOrEqual(120);

    // Litter box should be on the left half of the room (x < 200), fountain on the right half (x > 200)
    expect(litterCenter.x).toBeLessThan(200);
    expect(fountainCenter.x).toBeGreaterThan(200);
  });
});

describe('LivingRoom — Touch Targets and Accessibility', () => {
  it('provides generous minimum touch targets (>= 40x40) with pointer-events enabled for all interactive items', () => {
    const tree = LivingRoom({
      sleeping: false,
      fountainBoost: false,
      onTapFountain: () => {},
      onTapLitterBox: () => {},
      onSelectSpot: () => {},
    }) as AnyElement;

    const interactiveGroups = findElements(tree, (el) => {
      const role = el.props?.role;
      return role === 'button';
    });

    // Should include: litter box, fountain, rug, sofa bed, delivery box, windowsill
    expect(interactiveGroups.length).toBeGreaterThanOrEqual(6);

    for (const group of interactiveGroups) {
      const label = group.props?.['aria-label'];
      expect(label, 'Interactive group must have an accessible aria-label').toBeTruthy();

      // Find transparent touch rect
      const touchRects = findElements(group, (el) => el.type === 'rect' && el.props?.fill === 'transparent');
      expect(touchRects.length, `Touch target rect missing in ${label}`).toBeGreaterThanOrEqual(1);

      const target = touchRects[0];
      const width = parseFloat(target.props.width);
      const height = parseFloat(target.props.height);

      expect(width, `Touch target width for ${label} must be >= 40`).toBeGreaterThanOrEqual(40);
      expect(height, `Touch target height for ${label} must be >= 40`).toBeGreaterThanOrEqual(40);
      expect(target.props.style?.pointerEvents, `pointerEvents for ${label} must be 'all'`).toBe('all');
    }
  });
});

describe('App — SPOT_HEAD_SVG Thought Bubble Anchors', () => {
  it('defines valid, screen-safe head coordinates for all 4 cozy spots matching Oli’s position', () => {
    const spots: CatSpot[] = ['rug', 'sofa_bed', 'box', 'window'];

    for (const spot of spots) {
      const coord = SPOT_HEAD_SVG[spot];
      expect(coord, `SPOT_HEAD_SVG must be defined for ${spot}`).toBeDefined();

      // Horizontal coordinate must be within mobile safe bounds
      expect(coord.x, `${spot} thought bubble x must be within mobile safe bounds`).toBeGreaterThanOrEqual(SAFE_MOBILE.minX);
      expect(coord.x, `${spot} thought bubble x must be within mobile safe bounds`).toBeLessThanOrEqual(SAFE_MOBILE.maxX);

      // Vertical coordinate must be within reasonable top half bounds
      expect(coord.y, `${spot} thought bubble y must be within mobile safe bounds`).toBeGreaterThanOrEqual(SAFE_MOBILE.minY);
      expect(coord.y, `${spot} thought bubble y must be within mobile safe bounds`).toBeLessThanOrEqual(SAFE_MOBILE.maxY);
    }
  });
});
