import { describe, expect, it } from 'vitest';
import type { ReactElement } from 'react';
import { Balcony } from './Balcony';
import { SPOT_HEAD_SVG } from '../../App';
import { isBalconySpot, sceneForSpot, type CatSpot } from '../../types';

const SAFE_MOBILE = {
  minX: 62,
  maxX: 338,
  minY: 90,
  maxY: 475,
};

type AnyElement = ReactElement<Record<string, any>>;

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

describe('Balcony — Scenery & Mobile Safe Bounds', () => {
  it('correctly maps balcony spots to the balcony scene', () => {
    expect(isBalconySpot('planter')).toBe(true);
    expect(isBalconySpot('bistro_chair')).toBe(true);
    expect(isBalconySpot('balcony_floor')).toBe(true);
    expect(isBalconySpot('rug')).toBe(false);

    expect(sceneForSpot('planter')).toBe('balcony');
    expect(sceneForSpot('bistro_chair')).toBe('balcony');
    expect(sceneForSpot('balcony_floor')).toBe('balcony');
    expect(sceneForSpot('rug')).toBe('living_room');
  });

  it('ensures Oli is 100% visible inside each of the 3 balcony cozy spots without mobile edge clipping', () => {
    const spots: CatSpot[] = ['planter', 'bistro_chair', 'balcony_floor'];

    for (const spot of spots) {
      const tree = Balcony({ sleeping: false, activeSpot: spot }) as AnyElement;
      const avatarList = findElements(tree, (el) => typeof el.type === 'function' && el.type.name === 'CatAvatar');
      expect(avatarList.length, `Oli must render when activeSpot is ${spot}`).toBe(1);

      const avatar = avatarList[0];
      const minX = avatar.props.x as number;
      const maxX = minX + (avatar.props.width as number);
      const minY = avatar.props.y as number;
      const maxY = minY + (avatar.props.height as number);

      expect(minX, `Oli left edge in ${spot}`).toBeGreaterThanOrEqual(SAFE_MOBILE.minX);
      expect(maxX, `Oli right edge in ${spot}`).toBeLessThanOrEqual(SAFE_MOBILE.maxX);
      expect(minY, `Oli top edge in ${spot}`).toBeGreaterThanOrEqual(SAFE_MOBILE.minY);
      expect(maxY, `Oli bottom edge in ${spot}`).toBeLessThanOrEqual(SAFE_MOBILE.maxY);
    }
  });

  it('physically nestles Oli on the wooden bistro chair seat behind the chair backrest slats', () => {
    const tree = Balcony({ sleeping: false, activeSpot: 'bistro_chair' }) as AnyElement;
    const chairGroup = findElements(tree, (el) => {
      const label = el.props?.['aria-label'] || '';
      return typeof label === 'string' && label.toLowerCase().includes('bistro');
    })[0];

    expect(chairGroup).toBeDefined();
    // Find the foreground chair subgroup containing both CatAvatar and the backrest slats
    const foregroundChair = (chairGroup.props.children as AnyElement[])[3];
    const children = foregroundChair.props.children as AnyElement[];

    const catIdx = children.findIndex((c) => {
      return findElements(c, (inner) => typeof inner.type === 'function' && inner.type.name === 'CatAvatar').length > 0;
    });
    const backrestIdx = children.findIndex((c) => c.type === 'polygon' && c.props?.points === '210,352 280,334 277,343 207,361');

    expect(catIdx).toBeGreaterThan(-1);
    expect(backrestIdx).toBeGreaterThan(-1);
    expect(backrestIdx).toBeGreaterThan(catIdx);
  });

  it('provides generous touch targets (>= 40x40) with pointer-events enabled for all 3 balcony spots', () => {
    const tree = Balcony({
      sleeping: false,
      onSelectSpot: () => {},
    }) as AnyElement;

    const interactiveGroups = findElements(tree, (el) => el.props?.role === 'button');
    expect(interactiveGroups.length).toBe(3);

    for (const group of interactiveGroups) {
      const label = group.props?.['aria-label'];
      expect(label).toBeTruthy();

      const touchRects = findElements(group, (el) => el.type === 'rect' && el.props?.fill === 'transparent');
      expect(touchRects.length).toBeGreaterThanOrEqual(1);

      const target = touchRects[0];
      expect(parseFloat(target.props.width)).toBeGreaterThanOrEqual(40);
      expect(parseFloat(target.props.height)).toBeGreaterThanOrEqual(40);
      expect(target.props.style?.pointerEvents).toBe('all');
    }
  });

  it('defines screen-safe head coordinates in SPOT_HEAD_SVG for all balcony spots', () => {
    const spots: CatSpot[] = ['planter', 'bistro_chair', 'balcony_floor'];
    for (const spot of spots) {
      const coord = SPOT_HEAD_SVG[spot];
      expect(coord).toBeDefined();
      expect(coord.x).toBeGreaterThanOrEqual(SAFE_MOBILE.minX);
      expect(coord.x).toBeLessThanOrEqual(SAFE_MOBILE.maxX);
      expect(coord.y).toBeGreaterThanOrEqual(SAFE_MOBILE.minY);
      expect(coord.y).toBeLessThanOrEqual(SAFE_MOBILE.maxY);
    }
  });
});
