export interface ReleaseEntry {
  version: `v${number}.${number}.${number}`;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ReleaseEntry[] = [
  {
    version: 'v0.11.2',
    date: '2026-10-31',
    title: 'Visible Rug Messes Fix 💩✨',
    changes: [
      'Fixed an SVG transform bug that reset messes to (0, 0) behind the top bar — messes now render in a foreground layer right next to Oli on the rug so they are always clearly visible and easy to tap.',
    ],
  },
  {
    version: 'v0.11.1',
    date: '2026-10-31',
    title: 'Poop & Throw-Up Messes on the Rug! 🤢💩',
    changes: [
      'Replaced hairballs with cat throw-up splats on the rug when Oli eats too many treats or gets neglected!',
      'Tap any poop or throw-up mess directly on the rug (or use Care → Scoop Mess) to clean it up.',
    ],
  },
  {
    version: 'v0.11.0',
    date: '2026-10-31',
    title: 'Poop, Hairballs & Rug Cleanup! 💩✨',
    changes: [
      'Tamagotchi Messes: Every 2nd meal (or every 2.5 hours away, or after a treat tummy ache) Oli leaves a poop or ginger hairball on the living room rug!',
      'Tap any mess directly on the rug — or use Care → Scoop Mess — to clean it up for +15 Clean & +6 Joy.',
      'Active messes block Thriving status and show a badge on the HUD and Care tab until scooped.',
    ],
  },
  {
    version: 'v0.10.1',
    date: '2026-10-31',
    title: 'Interactive Fountain Fix 💧',
    changes: [
      'Fixed an invisible overlay layer that was blocking taps on the living room water fountain.',
    ],
  },
  {
    version: 'v0.10.0',
    date: '2026-10-31',
    title: 'Tamagotchi Rules, Laser Zoomies & Direct Petting! 🥚🐾',
    changes: [
      'Streamlined into a focused single-player Tamagotchi with 4 balanced tabs: Feed, Play, Care & Rest.',
      'Tap Oli directly on the rug for Chin Scratches (+6 Joy) and tap the living room fountain directly to refresh his water!',
      'Added Laser Zoomies in Play — watch Oli chase a glowing red laser dot across the rug.',
      'Fullness & Tummy Aches: Oli shakes his head when too full for a meal, and eating more than 3 treats in 15 minutes gives him a tummy ache (soothe it with belly rubs, brushing, or Calming Mist).',
      'Smart Sleep Rules: Oli refuses naps when hyper (85+ Energy), refuses play when exhausted, and curls up automatically at ≤ 5 Energy.',
    ],
  },
  {
    version: 'v0.9.1',
    date: '2026-10-31',
    title: 'Customizable Alert Preferences 🔔',
    changes: [
      'Tap the bell icon to open the Notification Preferences sheet and choose exactly which events (Low-Need < 25, Critical ≤ 5, Nap Wake-Up, Partner Actions) and which individual stats (Hunger, Water, Joy, Energy, Clean) trigger alerts.',
    ],
  },
  {
    version: 'v0.9.0',
    date: '2026-10-31',
    title: 'Smart Oli Notifications 🔔',
    changes: [
      'Tap the bell icon in the top bar (or inside Rules) to enable browser/PWA notifications.',
      'Get alerted automatically when any need drops below 25 (or critical at 5), when Oli wakes up from a nap, or when your partner cares for him in the background.',
    ],
  },
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
