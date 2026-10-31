export interface ReleaseEntry {
  version: `v${number}.${number}.${number}`;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ReleaseEntry[] = [
  {
    version: 'v0.8.0',
    date: '2026-10-31',
    title: 'Care Manual & Cleaner Action Tiles 📖',
    changes: [
      'Added a "Rules" button in the top bar that opens the Oli Care Manual with exact hourly decay rates, nap rules, and action boosts.',
      'Redesigned the action tiles so every label and stat boost fits cleanly without getting cut off.',
      'Removed the "Fav" badge on Churu and cleared the kiwis off the coffee table.',
    ],
  },
  {
    version: 'v0.7.1',
    date: '2026-10-31',
    title: 'Cute Oli Is Back 🧡',
    changes: [
      'Oli’s last makeover was a bit too realistic (and a little creepy!), so he’s back to his cute, round self.',
      'He keeps a few touches from his real photos: warmer amber eyes, a white muzzle, and a striped tail with a white tip.',
    ],
  },
  {
    version: 'v0.7.0',
    date: '2026-10-31',
    title: 'Real-Life Oli & Your Actual Living Room! 📸🐾',
    changes: [
      'Redesigned Oli from your real photos: his left-ear tip notch, right-ear stippled tattoo, nose freckles, signature dark lower-lip spot, striped chest necklaces, asymmetrical white front socks, and white-tipped ringed tail!',
      'Recreated your actual living room: cream travertine floor tiles, fluffy white high-pile shag rug, dark charcoal sofa with terracotta, sage & triangle pillows, Bedsure cat bed, white coffee table with cork coaster, white cube bookcase with trailing plants, ribbed radiator, tripod lamp, and blue-LED water fountain.',
    ],
  },
  {
    version: 'v0.6.0',
    date: '2026-10-31',
    title: 'Cozy Living Room Focus & Security Hardening',
    changes: [
      'Focused the home exclusively on Oli’s cozy Living Room with a cleaner top bar.',
      'Hardened app security (strict Content Security Policy, canonical activity messages, and input sanitization).',
    ],
  },
  {
    version: 'v0.5.0',
    date: '2026-10-30',
    title: 'Oli’s Favourite Treat: Churu! 🐾',
    changes: [
      'Added Oli’s absolute favourite treat in the Feed menu: a creamy lickable Churu tube!',
      'Watch him happily lick the Churu tube with hearts and sparkles.',
    ],
  },
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
