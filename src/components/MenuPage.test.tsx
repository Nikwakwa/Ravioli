import { describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MenuPage } from './MenuPage';
import { StatusHUD } from './StatusHUD';
import type { LiveCat } from '../types';

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

const mockLive: LiveCat = {
  name: 'Oli',
  hunger: 80,
  hydration: 85,
  energy: 90,
  happiness: 75,
  hygiene: 95,
  isSleeping: false,
  isCalm: false,
  wokeNaturally: false,
  isPaused: false,
  isDeceased: false,
  livesLeft: 9,
};

const defaultNotifPrefs = {
  enabled: true,
  lowNeed: true,
  critical: true,
  wakeUp: true,
  partner: true,
  stats: {
    hunger: true,
    hydration: true,
    energy: true,
    happiness: true,
    hygiene: true,
  },
};

describe('MenuPage Server Rendering & Content', () => {
  it('renders all 4 navigation tabs and rules by default (Cozy Spots scrapped)', () => {
    const html = renderToString(
      <MenuPage
        onClose={vi.fn()}
        live={mockLive}
        onTogglePause={vi.fn()}
        notifPrefs={defaultNotifPrefs}
        onToggleMasterNotifications={vi.fn()}
        onChangeNotifPrefs={vi.fn()}
        onTestNotification={vi.fn()}
      />
    );

    expect(html).toContain('Back to Oli');
    expect(html).toContain('Rules');
    expect(html).toContain('Ambience');
    expect(html).toContain('Vacation');
    expect(html).toContain('Updates');
    expect(html).toContain('Alerts');
    expect(html).toContain('100 Energy');
    // Cozy spots tab is scrapped
    expect(html).not.toContain('Cozy Spots');
  });

  it('renders atmosphere controls when initialTab is atmosphere', () => {
    const html = renderToString(
      <MenuPage
        onClose={vi.fn()}
        initialTab="atmosphere"
        live={mockLive}
        onTogglePause={vi.fn()}
        notifPrefs={defaultNotifPrefs}
        onToggleMasterNotifications={vi.fn()}
        onChangeNotifPrefs={vi.fn()}
        onTestNotification={vi.fn()}
        atmospherePrefs={{ mode: 'sunset' }}
      />
    );

    expect(html).toContain('Real-Time Atmosphere');
    expect(html).toContain('Golden Hour Sunset');
    expect(html).toContain('Luxembourg Weather');
    expect(html).toContain('Automatic outside rain matching');
  });

  it('renders live Luxembourg weather info when weather data is available', () => {
    const html = renderToString(
      <MenuPage
        onClose={vi.fn()}
        initialTab="atmosphere"
        live={mockLive}
        onTogglePause={vi.fn()}
        notifPrefs={defaultNotifPrefs}
        onToggleMasterNotifications={vi.fn()}
        onChangeNotifPrefs={vi.fn()}
        onTestNotification={vi.fn()}
        atmospherePrefs={{ mode: 'auto' }}
        liveWeather={{
          city: 'Luxembourg',
          temperatureC: 11,
          weatherCode: 61,
          label: 'Light rain',
          emoji: '🌧️',
          isRaining: true,
          fetchedAt: Date.now(),
        }}
      />
    );

    expect(html).toContain('Luxembourg Weather');
    expect(html).toContain('Light rain');
    expect(html).toContain('Raining in Luxembourg — Cat TV is on Oli’s window!');
  });

  it('renders pause clock controls when initialTab is pause', () => {
    const html = renderToString(
      <MenuPage
        onClose={vi.fn()}
        initialTab="pause"
        live={mockLive}
        onTogglePause={vi.fn()}
        notifPrefs={defaultNotifPrefs}
        onToggleMasterNotifications={vi.fn()}
        onChangeNotifPrefs={vi.fn()}
        onTestNotification={vi.fn()}
      />
    );

    expect(html).toContain('Pause Care Clock (Vacation Mode)');
    expect(html).toContain('Pause Clock');
    expect(html).toContain('Freeze time so Oli stays safe');
  });

  it('renders changelog and version when initialTab is version', () => {
    const html = renderToString(
      <MenuPage
        onClose={vi.fn()}
        initialTab="version"
        live={mockLive}
        onTogglePause={vi.fn()}
        notifPrefs={defaultNotifPrefs}
        onToggleMasterNotifications={vi.fn()}
        onChangeNotifPrefs={vi.fn()}
        onTestNotification={vi.fn()}
      />
    );

    expect(html).toContain('Ravioli App Version');
    expect(html).toContain('Release notes &amp; updates');
  });
});

describe('StatusHUD Simplified Layout', () => {
  it('renders a clean header with only cat name, Churu stash, and Menu button', () => {
    const handleOpenMenu = vi.fn();
    const tree = StatusHUD({
      live: mockLive,
      mood: 'content',
      churuStash: 3,
      onOpenMenu: handleOpenMenu,
    }) as AnyElement;

    const buttons = findElements(tree, (el) => el.type === 'button');
    // Exactly 1 primary button on the right: Menu
    const menuBtn = buttons.find((b) => b.props?.onClick === handleOpenMenu);
    expect(menuBtn).toBeDefined();

    // Verify individual rules, changelog, and pause buttons are NOT present on HUD
    const ariaLabels = buttons.map((b) => b.props?.['aria-label'] || '').filter(Boolean);
    expect(ariaLabels.some((l) => l.includes('Pause Care Clock'))).toBe(false);
    expect(ariaLabels.some((l) => l.includes('Notification preferences'))).toBe(false);
    expect(ariaLabels.some((l) => l.includes('Care Manual & Rules'))).toBe(false);
  });

  it('renders the Paused badge in header when live.isPaused is true', () => {
    const handleOpenPause = vi.fn();
    const tree = StatusHUD({
      live: { ...mockLive, isPaused: true },
      mood: 'relaxed',
      churuStash: 3,
      onOpenMenu: vi.fn(),
      onOpenPause: handleOpenPause,
    }) as AnyElement;

    const buttons = findElements(tree, (el) => el.type === 'button');
    const pausedBtn = buttons.find((b) => b.props?.onClick === handleOpenPause);
    expect(pausedBtn).toBeDefined();
    pausedBtn?.props?.onClick();
    expect(handleOpenPause).toHaveBeenCalledTimes(1);
  });
});
