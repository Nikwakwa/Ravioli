import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { FortuneModal } from './FortuneModal';
import { setFortuneState } from '../utils/fortune';

const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, val: string) => {
    store.set(key, String(val));
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => {
    store.clear();
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

describe('FortuneModal component', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    setFortuneState({ unlocked: false, lastOpenedDate: null, todayFortuneId: null });
    vi.restoreAllMocks();
  });

  it('renders locked state when not yet unlocked with Churus', () => {
    const html = renderToString(
      <FortuneModal churuStash={2} onUnlock={vi.fn()} onClose={vi.fn()} />
    );

    expect(html).toContain('Daily Fortune Cookie');
    expect(html).toContain('Unlock with Churus');
    expect(html).toContain('need');
    expect(html).toContain('3');
  });

  it('renders unlock button when player has at least 5 Churus', () => {
    const html = renderToString(
      <FortuneModal churuStash={5} onUnlock={vi.fn()} onClose={vi.fn()} />
    );

    expect(html).toContain('Unlock for 🍬 5 Churus');
  });

  it('shows the crack prompt when unlocked and unopened today', () => {
    setFortuneState({ unlocked: true, lastOpenedDate: null, todayFortuneId: null });

    const html = renderToString(
      <FortuneModal churuStash={0} onUnlock={vi.fn()} onClose={vi.fn()} />
    );

    expect(html).toContain('Tap cookie to crack!');
    expect(html).toContain('Crack Open Today’s Cookie');
  });

  it('shows the cracked fortune slip directly if already opened today', () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setFortuneState({ unlocked: true, lastOpenedDate: todayStr, todayFortuneId: 1 });

    const html = renderToString(
      <FortuneModal churuStash={0} onUnlock={vi.fn()} onClose={vi.fn()} />
    );

    expect(html).toContain('Oli’s Daily Cat Wisdom');
    expect(html).toContain('If a problem feels too big to solve');
    expect(html).not.toContain('Moroccan Shag Rug');
    expect(html).not.toContain('Sleepy Loaf');
    expect(html).toContain('Come back tomorrow at sunrise');
    expect(html).toContain('Close');
  });
});
