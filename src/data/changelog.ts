export interface ReleaseEntry {
  version: `v${number}.${number}.${number}`;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ReleaseEntry[] = [
  {
    version: 'v0.3.0',
    date: '2026-10-30',
    title: 'Version Numbering & In-App Changelog',
    changes: [
      'Added vx.y.z version tracking across the app, CHANGELOG.md, and Git tags.',
      'Tap the version badge in the top bar anytime to see what changed in each push.',
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-10-30',
    title: 'UX/UI Overhaul & Night Glass Theme',
    changes: [
      'Recalibrated Living Room & Balcony stage so Oli sits right on the rug and cushion with the fountain and plants in full view.',
      'Fixed-height Action Dock so switching tabs never jumps the layout.',
      'Redesigned 5-stat HUD cards so labels never clip on mobile screens.',
      'Added cozy night-mode frosted glass surfaces while Oli is napping.',
      'Tapping Oli now pops up mood-aware purr & thought bubbles.',
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-10-30',
    title: 'Initial Launch — Hello Oli!',
    changes: [
      'Animated SVG Oli with ginger tabby coat, golden eyes, chin freckles, and ear tattoos.',
      'Living Room & Sunny Balcony scenes with swipe navigation.',
      'Serverless Tamagotchi timestamp-delta decay engine + piecewise nap auto-wake.',
      'Real-time co-op sync for Nico & Athina via Supabase Realtime + GitHub Pages PWA deploy.',
    ],
  },
];

export const APP_VERSION = CHANGELOG[0].version;
