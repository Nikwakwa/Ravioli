import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { OnboardingModal } from './OnboardingModal';

describe('OnboardingModal component', () => {
  it('renders welcome screen with 3 quick gameplay cards and name input for Newborn Oli', () => {
    const html = renderToString(
      <OnboardingModal initialName="You" onComplete={vi.fn()} />
    );

    expect(html).toContain('Welcome to Ravioli!');
    expect(html).toContain('Meet baby Oli — raise him from Newborn to Adult Oli!');
    expect(html).toContain('Daily Care');
    expect(html).toContain('Kitten Milk');
    expect(html).toContain('Play &amp; Cravings');
    expect(html).toContain('Closet &amp; Badges');
    expect(html).toContain('What should Oli call you?');
    expect(html).toContain('Say Hello to Oli');
  });

  it('renders adult intro copy when lifeStage is adult', () => {
    const html = renderToString(
      <OnboardingModal initialName="You" lifeStage="adult" onComplete={vi.fn()} />
    );

    expect(html).toContain('Meet Oli, your cozy virtual ginger cat.');
  });
});
