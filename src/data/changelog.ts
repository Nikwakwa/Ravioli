export interface ReleaseEntry {
  version: `v${number}.${number}.${number}`;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ReleaseEntry[] = [
  {
    version: 'v0.24.0',
    date: '2026-11-11',
    title: 'Daily Fortune Cookie 🥠',
    changes: [
      'Unlock Oli’s Daily Fortune Cookie in the closet shop for 5 Churus.',
      'Crack open a fresh cat fortune and cute thought every morning.',
      'Tap the cookie icon on the screen anytime to re-read today’s fortune.',
    ],
  },
  {
    version: 'v0.23.0',
    date: '2026-11-11',
    title: 'Closet Shop & Fancy Suit 🤵',
    changes: [
      'Closet items are now bought with Churus (what you already had stays yours).',
      'New Fancy Suit: the priciest item at 20 Churus.',
      'Nicer sounds for scooping the litter box and sweeping fur.',
    ],
  },
  {
    version: 'v0.22.1',
    date: '2026-11-10',
    title: 'Quieter Balcony 🌿',
    changes: ['Removed the wind sound on the balcony.'],
  },
  {
    version: 'v0.22.0',
    date: '2026-11-10',
    title: 'Oli’s Closet 🎀',
    changes: [
      'Oli has a closet: tap the hanger to dress him up.',
      'Bowtie is free. Earn Churus to unlock 4 more accessories.',
      'Accessories show in every room and pose.',
    ],
  },
  {
    version: 'v0.21.0',
    date: '2026-11-10',
    title: 'Purrs, Chirps & Cozy Sounds 🐾🔊',
    changes: [
      'Oli now purrs when petted and chirps when he moves or wants something.',
      'Eating, drinking, brushing and the balcony wind all have gentle sounds.',
      'New sound button next to Menu mutes everything in one tap.',
    ],
  },
  {
    version: 'v0.20.8',
    date: '2026-11-10',
    title: 'Daytime Naps Stay Sunny ☀️😴',
    changes: [
      'Daytime naps no longer turn the screen dark: the light follows the real clock.',
      'At night the whole balcony goes dark now, not just the sky.',
    ],
  },
  {
    version: 'v0.20.7',
    date: '2026-11-09',
    title: 'Weather & Bug Fixes 🌦️',
    changes: [
      'Live Luxembourg weather and sunset now actually work in the app.',
      'One tap on Oli now counts as one pet (no more double Joy).',
      'Skip no longer erases a finished minigame score.',
    ],
  },
  {
    version: 'v0.20.6',
    date: '2026-11-09',
    title: 'Security & Stability Hardening 🛡️',
    changes: [
      'Hardened app security policy against plugin and injection risks.',
      'Added timeout protection to prevent hanging network requests.',
      'Protected solar and weather calculations against corrupted timestamps.',
    ],
  },
  {
    version: 'v0.20.5',
    date: '2026-11-09',
    title: 'UX & Design Polish 🌟',
    changes: [
      'Connected live weather permissions so rain sync works in all browsers.',
      'Balanced menu tabs so all 4 buttons fill the bar evenly.',
      'Improved nighttime contrast and low-need alert animations.',
    ],
  },
  {
    version: 'v0.20.4',
    date: '2026-11-09',
    title: 'Clean & Simple Updates 📝',
    changes: [
      'Shortened all update notes so they are quick and easy to read.',
    ],
  },
  {
    version: 'v0.20.3',
    date: '2026-11-09',
    title: 'Automatic Sunlight & Sunset 🌅',
    changes: [
      'Room lighting now matches real sunrise and sunset in Luxembourg.',
      'Removed the Ambience menu to keep things simple.',
    ],
  },
  {
    version: 'v0.20.2',
    date: '2026-11-09',
    title: 'Automatic Weather 🌧️',
    changes: [
      'Rain on Oli’s window now matches the real weather in Luxembourg.',
      'Updates automatically whenever you open the app.',
    ],
  },
  {
    version: 'v0.20.1',
    date: '2026-11-09',
    title: 'Weather Sync 🌦️',
    changes: [
      'Added outside weather sync so rain on the window matches real weather.',
    ],
  },
  {
    version: 'v0.20.0',
    date: '2026-11-09',
    title: 'Real-Time Atmosphere & Rain 🌅🌧️',
    changes: [
      'The room and balcony now change lighting with the time of day.',
      'The windowsill lamp lights up at sunset and night.',
      'Added gentle rain on the window.',
    ],
  },
  {
    version: 'v0.19.2',
    date: '2026-11-08',
    title: 'Clean Room Animations 💧🐾',
    changes: [
      'Fixed bowls and toys reappearing after Oli moves to a new spot.',
      'The water fountain only bubbles faster while Oli is drinking.',
    ],
  },
  {
    version: 'v0.19.1',
    date: '2026-11-08',
    title: 'Room View Polish 🛋️',
    changes: [
      'Restored full-size room views across all phone screens.',
      'Oli is never hidden behind buttons on smaller screens.',
    ],
  },
  {
    version: 'v0.19.0',
    date: '2026-11-08',
    title: 'Churu Points & Calmer Cravings 🍬🐾',
    changes: [
      'Earn Churu tubes by completing cravings and minigames.',
      'Cravings now appear every 12–20 minutes instead of every 30 seconds.',
      'Cleaned up button layout on smaller phones.',
    ],
  },
  {
    version: 'v0.18.5',
    date: '2026-11-08',
    title: 'Smoother Petting 🐾🧹',
    changes: [
      'Petting Oli no longer triggers surprise messes.',
    ],
  },
  {
    version: 'v0.18.4',
    date: '2026-11-08',
    title: 'Cuter Balcony Poses 🐾💕',
    changes: [
      'Redrew Oli watching the street, with a happy turn when petted.',
      'Redrew the belly-up roll on the warm terrace tiles.',
      'Fixed furniture overlap on the balcony.',
    ],
  },
  {
    version: 'v0.18.3',
    date: '2026-11-07',
    title: 'Street Watch & Belly Rolls ☀️🐾',
    changes: [
      'Added street watching in the left balcony corner.',
      'Added a cozy belly-up roll on the sunny floor.',
    ],
  },
  {
    version: 'v0.18.2',
    date: '2026-11-07',
    title: 'Balcony 3D Perspective & Café Set 🌿🪑',
    changes: [
      'Matched balcony perspective to the living room.',
      'Added wooden bistro table and chairs with flower planters.',
    ],
  },
  {
    version: 'v0.18.1',
    date: '2026-11-07',
    title: 'Balcony Polish 🌿🐾',
    changes: [
      'Fixed Oli positioning so furniture never overlaps him.',
      'Cleaned up railing, planters, and floor tiles.',
    ],
  },
  {
    version: 'v0.18.0',
    date: '2026-11-07',
    title: 'New Room: The Balcony 🌿🌼',
    changes: [
      'Added the outdoor balcony with street views and bistro seating.',
      'Quick switch between Living Room and Balcony.',
      'New spots for Oli to explore outside.',
    ],
  },
  {
    version: 'v0.17.1',
    date: '2026-11-06',
    title: 'Red Ball Rally & Tail Spin Fix 🛋️🐾',
    changes: [
      'Redesigned Red Ball into a paw-sliding rally game.',
      'Fixed animation glitch in Tail Spin.',
    ],
  },
  {
    version: 'v0.17.0',
    date: '2026-11-06',
    title: 'New Minigames: Tail Spin & Red Ball 🌀🔴',
    changes: [
      'Added two new minigames: Tail Spin and Red Ball.',
      'Updated Play menu into a 2×2 game grid.',
    ],
  },
  {
    version: 'v0.16.17',
    date: '2026-11-06',
    title: 'Living Room Makeover 🛋️🌿',
    changes: [
      'Updated living room furniture and decor to match the real apartment.',
      'Added cat tree, bookcase, Roman blind, and windowsill lamp.',
    ],
  },
  {
    version: 'v0.16.15',
    date: '2026-11-06',
    title: 'Laser Zoomies Balance & Tap Limit 🔴🐾',
    changes: [
      'Added a 3-pounce limit per round to Laser Zoomies to prevent effortless tap spamming.',
      'Reduced Laser Zoomies round timer to 5 seconds for a snappy, exciting reflex challenge.',
      'Added a live Pounces Left counter so you can easily track your remaining attempts.',
    ],
  },
  {
    version: 'v0.16.14',
    date: '2026-11-06',
    title: 'Punchy & Human Text 📝✨',
    changes: [
      'Streamlined pop-ups, toast notices, and action refusals so they are quick and easy to read at a glance.',
      'Crisp, simplified care guide rules and minigame instructions.',
      'Shorter, clearer thought bubbles and alert labels.',
    ],
  },
  {
    version: 'v0.16.13',
    date: '2026-11-06',
    title: 'Full App Audit, Security & Polish 🛡️✨',
    changes: [
      'Protected emergency revival from old messes right after waking up.',
      'Aligned all care rules and Churu rewards across the app and menu.',
      'Strengthened app security and cleaned up unused code.',
    ],
  },
  {
    version: 'v0.16.12',
    date: '2026-11-05',
    title: 'Small-Screen Polish & Clearer Labels 📱✨',
    changes: [
      'Care buttons use compact icons matching top meters.',
      'Renamed hunger meter to Food so a full bar means full tummy.',
      'Craving bubbles stay neatly centered over Oli on all screen sizes.',
      'Tidier menu, alerts, and night-time text readability.',
    ],
  },
  {
    version: 'v0.16.11',
    date: '2026-11-05',
    title: 'Peaceful Sleep & Fluffy Fur Makeover 😴✨',
    changes: [
      'Peaceful Sleep: Oli will no longer shed fur, throw up, or dirty his litter box while he is sleeping.',
      'Fluffy Fur Makeover: Redesigned shed fur into a light, airy puff of cream and ginger fuzz so it clearly looks like soft cat hair.',
    ],
  },
  {
    version: 'v0.16.10',
    date: '2026-11-04',
    title: '10-Second Minigame Timers ⏱️🐾',
    changes: [
      'Extended the round countdown timer from 4 to 10 seconds for more relaxed, comfortable play.',
      'Adjusted the low-time warning so you still get a clear heads-up in the final 3 seconds.',
    ],
  },
  {
    version: 'v0.16.9',
    date: '2026-11-04',
    title: 'Laser Zoomies & Minigame Timers 🔴⏱️',
    changes: [
      'Rebuilt Laser Zoomies into an active chase where you tap a fast darting red dot across the rug.',
      'Added a 4-second countdown timer to each round so minigames stay quick, exciting, and snappy.',
      'Balanced Feather Pounce with a fair target zone that rewards good timing.',
    ],
  },
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
