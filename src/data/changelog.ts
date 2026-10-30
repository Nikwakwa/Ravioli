export interface ReleaseEntry {
  version: `v${number}.${number}.${number}`;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ReleaseEntry[] = [
  {
    version: 'v0.4.0',
    date: '2026-10-30',
    title: 'Update Alerts & Simpler Notes',
    changes: [
      'A friendly banner now lets you know whenever a new update is ready, with a one-tap reload button.',
      'Rewrote these update notes in plain, cozy language.',
    ],
  },
  {
    version: 'v0.3.0',
    date: '2026-10-30',
    title: 'What’s New Drawer',
    changes: [
      'Tap the version badge next to Oli’s name anytime to see the latest additions.',
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-10-30',
    title: 'Cozy Room Makeover & Night Mode',
    changes: [
      'Oli now sits right on his plush rug and sunny balcony cushion, with his water fountain and plants in full view.',
      'Tucking Oli in for a nap now dims the menus into a soft night theme.',
      'Tap Oli to pet him and see what he’s thinking!',
      'Swiping left or right on the room switches between the Living Room and the Sunny Balcony.',
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-10-30',
    title: 'Hello Oli! 🐱',
    changes: [
      'Meet Oli — complete with his ginger coat, golden eyes, tiny chin freckles, and little ear tattoos.',
      'Feed him wet food, chicken hearts, or quail eggs, refresh his fountain, play feather wand, or give him chin scratches.',
      'Care for Oli together in real time as Nico & Athina.',
    ],
  },
];

export const APP_VERSION = CHANGELOG[0].version;
