import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { OnboardingModal } from './OnboardingModal';

describe('OnboardingModal component', () => {
  it('renders welcome screen with 3 quick gameplay cards and name input', () => {
    const html = renderToString(
      <OnboardingModal initialName="You" onComplete={vi.fn()} />
    );

    expect(html).toContain('Welcome to Ravioli!');
    expect(html).toContain('Meet Oli, your cozy virtual ginger cat.');
    expect(html).toContain('Daily Care');
    expect(html).toContain('Play &amp; Whims');
    expect(html).toContain('Closet &amp; Badges');
    expect(html).toContain('What should Oli call you?');
    expect(html).toContain('Say Hello to Oli');
  });
});
