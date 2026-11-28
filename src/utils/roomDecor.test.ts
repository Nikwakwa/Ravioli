import { describe, expect, it } from 'vitest';
import {
  canAffordDecor,
  DECOR_ITEMS,
  decorById,
  hasAffordableDecor,
  sanitizeRoomDecor,
  toggleInRoomDecor,
  withDecorPurchase,
  type RoomDecorState,
} from './roomDecor';

const terracotta = decorById('rug_terracotta')!;
const sage = decorById('rug_sage')!;
const pumpkins = decorById('decor_pumpkins')!;
const xmasTree = decorById('decor_xmas_tree')!;
const lavender = decorById('balcony_lavender')!;
const empty: RoomDecorState = { equipped: {}, owned: [] };

describe('roomDecor catalog & shop', () => {
  it('defines positive prices and includes living room, seasonal, and balcony items', () => {
    expect(DECOR_ITEMS.length).toBeGreaterThanOrEqual(9);
    for (const item of DECOR_ITEMS) {
      expect(item.price).toBeGreaterThan(0);
    }
    expect(DECOR_ITEMS.some((d) => d.group === 'living_room')).toBe(true);
    expect(DECOR_ITEMS.some((d) => d.group === 'seasonal')).toBe(true);
    expect(DECOR_ITEMS.some((d) => d.group === 'balcony')).toBe(true);
  });

  it('checks affordability against the Churu stash accurately', () => {
    expect(canAffordDecor(terracotta, terracotta.price - 1)).toBe(false);
    expect(canAffordDecor(terracotta, terracotta.price)).toBe(true);
    expect(hasAffordableDecor(empty, 0)).toBe(false);
    expect(hasAffordableDecor(empty, terracotta.price)).toBe(true);
  });

  it('buying adds the item and immediately equips it in its slot', () => {
    const afterBuy = withDecorPurchase(empty, pumpkins);
    expect(afterBuy).toEqual({ owned: ['decor_pumpkins'], equipped: { seasonal_decor: 'decor_pumpkins' } });
    // Buying an already owned item is a no-op
    expect(withDecorPurchase(afterBuy, pumpkins)).toBe(afterBuy);
    // Buying another item in the same slot replaces the active one while keeping both owned
    const afterTree = withDecorPurchase(afterBuy, xmasTree);
    expect(afterTree).toEqual({
      owned: ['decor_pumpkins', 'decor_xmas_tree'],
      equipped: { seasonal_decor: 'decor_xmas_tree' },
    });
  });

  it('equips one item per slot and returns to default when toggled off', () => {
    let eq = toggleInRoomDecor({}, terracotta);
    expect(eq).toEqual({ rug: 'rug_terracotta' });
    eq = toggleInRoomDecor(eq, lavender);
    expect(eq).toEqual({ rug: 'rug_terracotta', balcony_plants: 'balcony_lavender' });
    eq = toggleInRoomDecor(eq, sage);
    expect(eq).toEqual({ rug: 'rug_sage', balcony_plants: 'balcony_lavender' });
    eq = toggleInRoomDecor(eq, sage);
    expect(eq).toEqual({ balcony_plants: 'balcony_lavender' });
  });

  it('sanitizes invalid or unowned items from saved state', () => {
    expect(sanitizeRoomDecor(null)).toEqual(empty);
    expect(
      sanitizeRoomDecor({
        owned: ['fairy_lights', 'fake_item', 123],
        equipped: { window_lights: 'fairy_lights', rug: 'rug_terracotta' },
      }),
    ).toEqual({
      owned: ['fairy_lights'],
      equipped: { window_lights: 'fairy_lights' },
    });
  });
});
