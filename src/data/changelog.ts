export interface ReleaseEntry {
  version: `v${number}.${number}.${number}`;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ReleaseEntry[] = [
  {
    version: 'v0.16.8',
    date: '2026-11-03',
    title: 'Clean Room & Design Polish 🛋️✨',
    changes: [
      'Removed the extra plate next to the water fountain for a cleaner, modern look.',
      'Simplified update notes so they are quick, clear, and easy to read.',
      'Refined header buttons, touch targets, and menu navigation for a smoother feel.',
    ],
  },
  {
    version: 'v0.16.7',
    date: '2026-11-03',
    title: 'Main Screen Update Alerts 🚀',
    changes: [
      'New version alerts now appear right on the main screen for instant 1-tap reloading.',
      'Smart version check ensures you only get alerted for truly newer updates.',
      'Removed the extra spots menu so you can interact with Oli directly in the room.',
    ],
  },
  {
    version: 'v0.16.6',
    date: '2026-11-03',
    title: 'Airy Living Room & Menu Page 📖',
    changes: [
      'Removed the floating spot bar to give the living room more breathing room.',
      'Moved rules, vacation pause, and settings into a clean dedicated menu.',
      'Simplified the top header to keep the focus on Oli.',
    ],
  },
  {
    version: 'v0.16.5',
    date: '2026-11-02',
    title: 'Bolster Bed & Room Touch-Ups 🛋️',
    changes: [
      'Grounded Oli’s bolster bed flush onto the sofa cushion for natural perspective.',
      'Tidied up the coffee table and gave the corner litter box a symmetrical look.',
    ],
  },
  {
    version: 'v0.16.4',
    date: '2026-11-02',
    title: 'Vacation Protection & Faster Loading ✈️',
    changes: [
      'Paused stats safely freeze in time with zero surprise messes when returning.',
      'Faster game loading and smoother room roaming animations.',
    ],
  },
  {
    version: 'v0.16.3',
    date: '2026-11-01',
    title: 'Mobile Screen Polish 📱',
    changes: [
      'Ensured all room items and furniture stay comfortably in view on narrow phone screens.',
      'Added automated visual tests to guarantee clean layer ordering.',
    ],
  },
  {
    version: 'v0.16.2',
    date: '2026-11-01',
    title: 'Water Fountain Foreground 💧',
    changes: [
      'Brought the fresh water fountain to the front of the room with its glowing blue light.',
    ],
  },
  {
    version: 'v0.16.1',
    date: '2026-11-01',
    title: 'Cozy Nestling in Bed & Box 📦',
    changes: [
      'Oli now curls up naturally inside his bolster bed and peeks over his delivery box.',
      'Thought bubbles now point directly to the top of his head on all screen sizes.',
    ],
  },
  {
    version: 'v0.16.0',
    date: '2026-11-01',
    title: 'Room Roaming & Cozy Spots 🐾',
    changes: [
      'Oli can now lounge across the rug, sofa bed, cardboard box, and windowsill.',
      'Tap any spot or tap Oli directly to give him cuddles and hear unique purrs.',
    ],
  },
  {
    version: 'v0.15.2',
    date: '2026-11-01',
    title: 'Clear Churu Treat Rules 🍬',
    changes: [
      'Start with 1 Churu tube and collect up to 99 in your treat stash.',
      'Earn bonus Churus by fulfilling craving bubbles and acing minigames.',
    ],
  },
  {
    version: 'v0.15.0',
    date: '2026-11-01',
    title: 'Corner Litter Box & Fur Tumbleweeds 📦',
    changes: [
      'Added Oli’s modern enclosed corner litter box — tap it anytime to scoop.',
      'Shed fur tumbleweeds appear naturally on the rug to sweep up.',
    ],
  },
  {
    version: 'v0.14.0',
    date: '2026-10-31',
    title: 'Vacation Mode & 9 Lives ✈️🐾',
    changes: [
      'Pause the care clock anytime you travel or study to freeze Oli’s needs safely.',
      'Oli has 9 lives with emergency revival if left unattended for several days.',
    ],
  },
  {
    version: 'v0.13.0',
    date: '2026-10-31',
    title: 'Play Micro-Minigames 🎮',
    changes: [
      'Play Feather Pounce (timing reflexes) and Laser Zoomies (guess which paw).',
      'Score 3/3 for bonus Joy, confetti, and extra Churu treats!',
    ],
  },
  {
    version: 'v0.12.0',
    date: '2026-10-31',
    title: 'Craving Thought Bubbles 💭',
    changes: [
      'Oli periodically thinks of a snack, game, or cuddle he wants.',
      'Tap his craving before time runs out for double Joy and a free Churu tube.',
    ],
  },
  {
    version: 'v0.10.0',
    date: '2026-10-31',
    title: 'Direct Petting & Fullness Rules 🐾',
    changes: [
      'Tap Oli directly on the rug anytime for chin scratches (+12 Joy).',
      'Oli shakes his head when full and gets tummy aches if fed too many treats.',
    ],
  },
  {
    version: 'v0.9.0',
    date: '2026-10-31',
    title: 'Smart Care Notifications 🔔',
    changes: [
      'Choose which alerts you want to receive when needs drop low or Oli wakes up.',
    ],
  },
  {
    version: 'v0.5.0',
    date: '2026-10-30',
    title: 'Oli’s Favourite Treat: Churu 🐾',
    changes: [
      'Feed Oli creamy lickable Churu treats with happy heart reactions.',
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-10-30',
    title: 'Hello Oli! 🐱',
    changes: [
      'Meet Oli — complete with ginger coat, golden eyes, and ear tattoos.',
      'Feed, brush, cuddle, and care for Oli together.',
    ],
  },
];

export const APP_VERSION = CHANGELOG[0].version;
