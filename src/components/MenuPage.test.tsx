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
  it('renders all 5 navigation tabs and rules by default (Cozy Spots scrapped)', () => {
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
    expect(html).toContain('Badges');
    expect(html).not.toContain('Ambience');
    expect(html).toContain('Vacation');
    expect(html).toContain('Updates');
    expect(html).toContain('Alerts');
    expect(html).toContain('100 Energy');
    // Cozy spots and Ambience tabs are scrapped
    expect(html).not.toContain('Cozy Spots');
  });

  it('renders badges and trophy shelf when initialTab is badges', () => {
    const html = renderToString(
      <MenuPage
        onClose={vi.fn()}
        initialTab="badges"
        live={mockLive}
        onTogglePause={vi.fn()}
        notifPrefs={defaultNotifPrefs}
        onToggleMasterNotifications={vi.fn()}
        onChangeNotifPrefs={vi.fn()}
        onTestNotification={vi.fn()}
      />
    );

    expect(html).toContain('Discovery Badges');
    expect(html).toContain('Medals');
    expect(html).toContain('If It Fits I Sits');
    expect(html).toContain('Bronze');
    expect(html).toContain('Silver');
    expect(html).toContain('Gold');
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
