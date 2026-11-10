import { describe, expect, it } from 'vitest';
import { ACCESSORIES, accessoryById, isUnlocked, newlyUnlocked, sanitizeCloset, toggleInOutfit } from './closet';

const bowtie = accessoryById('bowtie')!;
const scarf = accessoryById('scarf')!;
const crown = accessoryById('flower_crown')!;

describe('closet', () => {
  it('gives the bowtie for free and locks the rest behind earned Churus', () => {
    expect(isUnlocked(bowtie, 0)).toBe(true);
    expect(ACCESSORIES.filter((a) => isUnlocked(a, 0))).toEqual([bowtie]);
    expect(ACCESSORIES.every((a) => isUnlocked(a, 10))).toBe(true);
  });

  it('reports only what a new Churu total just unlocked', () => {
    expect(newlyUnlocked(0, 1).map((a) => a.id)).toEqual(['flower_crown']);
    expect(newlyUnlocked(1, 2)).toEqual([]);
    expect(newlyUnlocked(2, 6).map((a) => a.id)).toEqual(['scarf', 'detective_cap']);
  });

  it('wears one item per slot and takes it off on a second tap', () => {
    let outfit = toggleInOutfit({}, bowtie);
    expect(outfit).toEqual({ neck: 'bowtie' });
    outfit = toggleInOutfit(outfit, crown);
    expect(outfit).toEqual({ neck: 'bowtie', head: 'flower_crown' });
    outfit = toggleInOutfit(outfit, scarf);
    expect(outfit).toEqual({ neck: 'scarf', head: 'flower_crown' });
    expect(toggleInOutfit(outfit, scarf)).toEqual({ head: 'flower_crown' });
  });

  it('drops broken or still-locked items from saved data', () => {
    expect(sanitizeCloset(null)).toEqual({ outfit: {}, churusEarned: 0, hasNew: false });
    expect(
      sanitizeCloset({ outfit: { neck: 'scarf', head: 'flower_crown', face: 'nope' }, churusEarned: 1.9, hasNew: true }),
    ).toEqual({ outfit: { head: 'flower_crown' }, churusEarned: 1, hasNew: true });
    expect(sanitizeCloset({ outfit: 'x', churusEarned: -4 })).toEqual({ outfit: {}, churusEarned: 0, hasNew: false });
  });
});
