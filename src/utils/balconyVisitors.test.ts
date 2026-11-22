import { describe, expect, it } from 'vitest';
import {
  HOVER_SPOTS,
  pickBalconyVisitor,
  RAIL_PERCHES,
  VISITOR_META,
  visitorPoolFor,
} from './balconyVisitors';

const SAFE_MOBILE = {
  minX: 62,
  maxX: 338,
  minY: 90,
  maxY: 475,
};

describe('Balcony Bird Watching — Visitors', () => {
  it('picks time-of-day wildlife (birds & butterflies by day, doves at sunset, moths at night)', () => {
    expect(visitorPoolFor('day', false)).toContain('pigeon');
    expect(visitorPoolFor('day', false)).toContain('robin');
    expect(visitorPoolFor('day', false)).toContain('butterfly');

    expect(visitorPoolFor('sunset', false)).toContain('dove');
    expect(visitorPoolFor('sunset', false)).toContain('butterfly');

    expect(visitorPoolFor('night', false)).toEqual(['moth']);
  });

  it('shelters butterflies during rain while birds still visit', () => {
    expect(visitorPoolFor('day', true)).not.toContain('butterfly');
    expect(visitorPoolFor('day', true)).toContain('pigeon');
    expect(visitorPoolFor('sunset', true)).not.toContain('butterfly');
    expect(visitorPoolFor('sunset', true)).toContain('dove');
  });

  it('keeps every rail perch and hover spot inside mobile-safe screen bounds', () => {
    for (const spot of [...RAIL_PERCHES, ...HOVER_SPOTS]) {
      expect(spot.x).toBeGreaterThanOrEqual(SAFE_MOBILE.minX);
      expect(spot.x).toBeLessThanOrEqual(SAFE_MOBILE.maxX);
      expect(spot.y).toBeGreaterThanOrEqual(SAFE_MOBILE.minY);
      expect(spot.y).toBeLessThanOrEqual(SAFE_MOBILE.maxY);
    }
  });

  it('places hovering visitors in air spots and birds on the handrail', () => {
    const moth = pickBalconyVisitor('night', false, 0.5, 0.2);
    expect(moth.kind).toBe('moth');
    expect(moth.hovering).toBe(true);
    expect(HOVER_SPOTS.some((s) => s.x === moth.x && s.y === moth.y)).toBe(true);

    const pigeon = pickBalconyVisitor('day', true, 0, 0);
    expect(pigeon.kind).toBe('pigeon');
    expect(pigeon.hovering).toBe(false);
    expect(RAIL_PERCHES.some((s) => s.x === pigeon.x && s.y === pigeon.y)).toBe(true);
  });

  it('produces fun reaction lines for every visitor species', () => {
    for (const kind of ['pigeon', 'robin', 'dove', 'butterfly', 'moth'] as const) {
      const line = VISITOR_META[kind].pounceLine('Oli');
      expect(line).toContain('Oli');
      expect(line.length).toBeGreaterThan(10);
    }
  });
});
