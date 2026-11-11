import { describe, expect, it } from 'vitest';
import {
  ACCESSORIES,
  accessoryById,
  canAfford,
  hasAffordableItem,
  sanitizeCloset,
  toggleInOutfit,
  withPurchase,
  type ClosetState,
} from './closet';

const bowtie = accessoryById('bowtie')!;
const scarf = accessoryById('scarf')!;
const crown = accessoryById('flower_crown')!;
const suit = accessoryById('suit')!;
const empty: ClosetState = { outfit: {}, owned: [] };

describe('closet shop', () => {
  it('prices rise item by item, with the suit as the most expensive', () => {
    const prices = ACCESSORIES.map((a) => a.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(new Set(prices).size).toBe(prices.length);
    expect(prices[0]).toBeGreaterThan(0);
    expect(ACCESSORIES[ACCESSORIES.length - 1]).toBe(suit);
  });

  it('only lets you buy what the Churu stash can pay for', () => {
    expect(canAfford(bowtie, bowtie.price - 1)).toBe(false);
    expect(canAfford(bowtie, bowtie.price)).toBe(true);
    expect(hasAffordableItem(empty, 0)).toBe(false);
    expect(hasAffordableItem(empty, bowtie.price)).toBe(true);
    expect(hasAffordableItem({ outfit: {}, owned: ['bowtie'] }, bowtie.price)).toBe(false);
  });

  it('buying adds the item and puts it on', () => {
    const afterBowtie = withPurchase(empty, bowtie);
    expect(afterBowtie).toEqual({ owned: ['bowtie'], outfit: { neck: 'bowtie' } });
    expect(withPurchase(afterBowtie, bowtie)).toBe(afterBowtie);
    expect(withPurchase(afterBowtie, suit)).toEqual({ owned: ['bowtie', 'suit'], outfit: { neck: 'bowtie', body: 'suit' } });
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

  it('drops broken or unowned items from saved data', () => {
    expect(sanitizeCloset(null)).toEqual(empty);
    expect(
      sanitizeCloset({ outfit: { neck: 'scarf', head: 'flower_crown', face: 'nope' }, owned: ['flower_crown', 'x', 7] }),
    ).toEqual({ outfit: { head: 'flower_crown' }, owned: ['flower_crown'] });
    expect(sanitizeCloset({ outfit: 'x', owned: 'y' })).toEqual(empty);
  });

  it('keeps items that were unlocked before the shop existed', () => {
    expect(sanitizeCloset({ outfit: { neck: 'scarf', head: 'detective_cap' }, churusEarned: 4, hasNew: true })).toEqual({
      outfit: { neck: 'scarf' },
      owned: ['bowtie', 'flower_crown', 'scarf'],
    });
    expect(sanitizeCloset({ outfit: {}, churusEarned: 0 }).owned).toEqual(['bowtie']);
  });
});
