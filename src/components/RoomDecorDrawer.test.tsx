import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RoomDecorDrawer } from './RoomDecorDrawer';

describe('RoomDecorDrawer component', () => {
  it('renders Living Room, Seasonal & Table, and Balcony Plants sections with Churu balance', () => {
    const html = renderToStaticMarkup(
      <RoomDecorDrawer churuStash={6} onBuy={vi.fn(() => true)} onClose={vi.fn()} />,
    );

    expect(html).toContain('Room Decor');
    expect(html).toContain('Living Room');
    expect(html).toContain('Seasonal &amp; Table');
    expect(html).toContain('Balcony Plants');
    expect(html).toContain('Terracotta Rug');
    expect(html).toContain('Cozy Pumpkins');
    expect(html).toContain('Mini Christmas Tree');
    expect(html).toContain('Lavender Pots');
    expect(html).toContain('Cat Grass Tray');
    expect(html).toContain('🍬 6 to spend');
  });

  it('shows Buy pills for affordable items and remaining Churu count for pricier ones', () => {
    const html = renderToStaticMarkup(
      <RoomDecorDrawer churuStash={4} onBuy={vi.fn(() => true)} onClose={vi.fn()} />,
    );

    expect(html).toContain('Buy 🍬 4');
    expect(html).toContain('need 4 more');
  });
});
