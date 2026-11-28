import { describe, expect, it } from 'vitest';
import { defaultPetZoneForSpot, PET_ZONE_META, pickPetZoneLine, resolvePetZone } from './petZones';

describe('petZones — resolvePetZone', () => {
  it('maps sitting Oli coordinates to nose, chin, back, and belly', () => {
    expect(resolvePetZone(100, 94, 'sit')).toBe('nose');
    expect(resolvePetZone(100, 118, 'sit')).toBe('chin');
    expect(resolvePetZone(55, 92, 'sit')).toBe('chin');
    expect(resolvePetZone(100, 52, 'sit')).toBe('back');
    expect(resolvePetZone(52, 168, 'sit')).toBe('back');
    expect(resolvePetZone(100, 165, 'sit')).toBe('belly');
  });

  it('maps belly_up pose tummy to belly and face to nose/chin', () => {
    expect(resolvePetZone(122, 174, 'belly_up')).toBe('belly');
    expect(resolvePetZone(50, 152, 'belly_up')).toBe('nose');
    expect(resolvePetZone(28, 172, 'belly_up')).toBe('chin');
    expect(resolvePetZone(175, 198, 'belly_up')).toBe('back');
  });

  it('maps look_out pose back vs head cleanly', () => {
    expect(resolvePetZone(100, 155, 'look_out')).toBe('back');
    expect(resolvePetZone(100, 72, 'look_out')).toBe('chin');
  });

  it('handles non-finite coordinates safely without throwing', () => {
    expect(resolvePetZone(Number.NaN, Number.POSITIVE_INFINITY, 'sit')).toBe('chin');
  });
});

describe('petZones — defaults & reaction metadata', () => {
  it('picks sensible defaults per lounging spot', () => {
    expect(defaultPetZoneForSpot('balcony_floor')).toBe('belly');
    expect(defaultPetZoneForSpot('planter')).toBe('back');
    expect(defaultPetZoneForSpot('rug')).toBe('chin');
    expect(defaultPetZoneForSpot('box')).toBe('chin');
  });

  it('gives each petting zone its own animation, sound, and rotating thought lines', () => {
    const animations = new Set(Object.values(PET_ZONE_META).map((m) => m.animation));
    expect(animations.size).toBe(4);
    expect(PET_ZONE_META.chin.grantsCalm).toBe(true);
    expect(PET_ZONE_META.belly.grantsCalm).toBe(false);

    for (const zone of ['chin', 'nose', 'back', 'belly'] as const) {
      const line0 = pickPetZoneLine(zone, 0);
      const line1 = pickPetZoneLine(zone, 1);
      expect(line0.length).toBeGreaterThan(0);
      expect(line1.length).toBeGreaterThan(0);
      expect(line0).not.toBe(line1);
    }
  });
});
