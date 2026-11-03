export interface ReleaseEntry {
  version: `v${number}.${number}.${number}`;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ReleaseEntry[] = [
  {
    version: 'v0.16.6',
    date: '2026-11-03',
    title: 'Clean & Airy Room Makeover, Dedicated Settings & Guide Page 🛋️✨',
    changes: [
      'Spacious Living Room: Removed the floating spot bar from the main room for an open, airy feel. Tap the sofa bed, delivery box, windowsill, or rug directly in the living room anytime to move Oli or pet him.',
      'Dedicated Care Guide & Settings Page: Moved the version number, Vacation Mode pause button, care rules, and notifications into a clean, slide-out page accessed via a single Menu button.',
      'Uncluttered Header: Simplified the top header so only Oli’s mood, Churu treat stash, and the Menu button are shown, giving full attention to your cozy cat.',
      'Cozy Spots Tab: A dedicated spot switcher with descriptions is available in the Menu for quick browsing of all of Oli’s favorite hangout spots.',
    ],
  },
  {
    version: 'v0.16.4',
    date: '2026-11-02',
    title: 'Comprehensive App Polish, Vacation Protection & Performance Boost 🛡️🚀✨',
    changes: [
      'Vacation Pause Protection: Resuming from Vacation Mode now cleanly preserves peace and quiet — no surprise messes or penalties appear from days spent away.',
      'Auto-Update Precision: Fixed the in-app update detector so new versions are recognized reliably across all browsers.',
      'Smoother Room Roaming: Spritzing Calming Mist while Oli is napping in his sofa bed no longer jolts him to the rug, and launching the app keeps him resting right where you left him.',
      'Honest Activity History: Unanswered craving bubbles and natural fur shedding no longer record misleading care actions in your history feed.',
      'Lightning-Fast Performance: Code-split application assets so the game downloads and starts even faster on mobile connections.',
      'Rock-Solid Database Sync: Upgraded the database schema with full support for Vacation Mode, 9 Lives rescue, and all modern care actions.',
    ],
  },
  {
    version: 'v0.16.3',
    date: '2026-11-01',
    title: 'Automated Scene Safety Tests & Full-Screen Mobile Polish 🧪📱✨',
    changes: [
      'Automated Scene & Layer Safety Tests: Added 15 automated test suites that run on every build to guarantee that interactive items (like the water fountain) can never be hidden behind rugs or background layers.',
      '100% Screen-Safe Mobile Viewport: Adjusted the sofa bolster bed and coffee table candle so that Oli, his cozy bed, and all living room items are completely visible on all narrow mobile phone screens with zero edge clipping.',
      'Cat Hygiene Enforced: Automated tests ensure Oli’s fresh water fountain and litter box stay physically separated on opposite sides of the room.',
    ],
  },
  {
    version: 'v0.16.2',
    date: '2026-11-01',
    title: 'Water Fountain Restored & Brought to Front 💧✨',
    changes: [
      'Restored Water Fountain: Fixed an issue where the living room rug was drawn over the water fountain layer. The water fountain with its glowing blue LED status light, bubbling water arch, and stainless steel bowl is now placed in the front on the right side of the room, far from the litter box.',
    ],
  },
  {
    version: 'v0.16.1',
    date: '2026-11-01',
    title: 'Pixel-Perfect Cozy Nestling & Depth Layering 🛋️📦✨',
    changes: [
      'True 3D Physical Nestling: Integrated Oli directly into the living room scene vector layers so he nestles naturally inside his Bedsure bolster bed and Amazon delivery box without awkward floating overlays.',
      'Pixel-Perfect Proportions & Scale: Adjusted Oli’s size and placement to match each spot’s real-world dimensions — perched neatly on the sunny windowsill ledge, tucked inside the delivery box with head peeking over, and curled up in his sofa bolster bed.',
      'Adaptive Thought Bubbles: Cravings and pet reaction bubbles now dynamically point directly to the top of Oli’s head on all phone screen sizes and aspect ratios.',
      'Touch Anywhere: Tap Oli directly or any part of his bed, box, windowsill, or rug to pet him and hear his sweet cozy purrs.',
    ],
  },
  {
    version: 'v0.16.0',
    date: '2026-11-01',
    title: 'Where is Oli? Room Roaming & Cozy Spots! 🛋️📦✨',
    changes: [
      'Room Roaming & Cozy Spots: Oli now roams naturally between 4 cozy living room spots — the fluffy shag rug, his tan Bedsure bolster cat bed on the sofa chaise, an Amazon delivery cardboard box on the floor ("If it fits, I sits!"), and the sunny windowsill looking out at the sky ("Cat TV")!',
      'Tap to Beckon: Tap any empty spot in the living room (or use the quick spot bar above) to invite Oli over with gentle spring animations!',
      'Unique Cozy Purrs: Tapping Oli in his different spots triggers special thoughts — sweet sleepy snoozes in his sofa bed, playful fortress swats in his box, and bird chirping on the windowsill.',
      'Sofa Bed Sleep Mode: Tucking Oli in for a nap automatically curls him up in his Bedsure bolster bed, and starting a meal or minigame brings him to the center rug.',
      'Repositioned Corner Litter Box & Water: Shifted the enclosed litter box so it is 100% visible on all mobile screens, and moved the fresh water fountain to the opposite side of the room to respect natural cat hygiene instincts.',
      'Coffee Table Polish: Removed the cork coaster from the modern white coffee table.',
    ],
  },
  {
    version: 'v0.15.2',
    date: '2026-11-01',
    title: 'Crystal-Clear Churu Treat Rules! 🍬✨',
    changes: [
      'Simple Starting Stash: Start with 1 Churu Tube, and collect as many as you want (up to 99 max).',
      'Craving Bubbles: Fulfilling Oli’s craving thought bubbles always awards 2× Joy + 1 Churu Tube 🍬!',
      '3/3 Minigame Mastery: Getting 3/3 in any minigame awards Joy + 1 Churu Tube 🍬!',
      'Clean Space: Scooping the litter box or cleaning rug messes keeps Oli fresh and happy (no Churus).',
    ],
  },
  {
    version: 'v0.15.1',
    date: '2026-11-01',
    title: 'Balanced Churu Treat Economy! 🍬⚖️',
    changes: [
      'Rare Delicacy Rebalance: Starting stash is now 1 (capped at 5 max), making Churu Tubes feel like the precious, high-value delicacy they are in real life.',
      '3-Craving Streak: Fulfilling attention calls still grants 2× Joy, but earning a Churu now requires fulfilling a streak of 3 cravings.',
      'Milestone Cleanups: Earning a Churu from cleaning now unlocks every 5th cleanup (instead of every 2nd).',
      'Minigame Mastery: Earning a Churu from games now requires a 3/3 Perfect Play when Oli specifically craves that game (or a 3-streak of perfect games).',
    ],
  },
  {
    version: 'v0.15.0',
    date: '2026-11-01',
    title: 'Real Corner Litter Box & Ginger Fur Tumbleweeds! 📦✨',
    changes: [
      'Real Corner Litter Box: Drawn from Oli’s actual home litter box — a modern two-tone enclosed box with grey slide-out base drawer, off-white hood, tinted swinging flap door, and top exit roof hole in the living room corner.',
      'Tap to Scoop: Every 2nd meal (or after hours away), Oli uses his litter box! Tap the litter box directly (or choose Care → Scoop Box) to scoop it clean (+15 Clean, +6 Joy, and earn +1 Churu Tube every 2 scoops).',
      'No More Poop on the Rug: Real Oli never poops outside his litter box! Rug messes now spawn authentic ginger fur tumbleweeds from his shedding coat (and occasional throw-up when overfed treats).',
    ],
  },
  {
    version: 'v0.14.0',
    date: '2026-10-31',
    title: 'Vacation Mode (Pause Clock) & 9 Lives! ✈️🐾',
    changes: [
      'Pause Care Clock (Vacation Mode): Heading out on a flight or busy for a few days? Tap the Pause button in the top bar to freeze Oli’s stats in time until you return.',
      '9 Lives & Severe Neglect Warning: Left unattended for over 48 continuous hours at zero food and water? Oli can now succumb to extreme neglect — but emergency vet care can miraculously revive him using 1 of his 9 lives!',
      'Pure Virtual Pet Identity: Cleaned all legacy references so Oli shines as his own cozy, dedicated companion.',
    ],
  },
  {
    version: 'v0.13.1',
    date: '2026-10-31',
    title: 'Notification Logo & Badge Fix 🔔🐱',
    changes: [
      'Fixed notifications displaying a white square: OS notification daemons (Windows Action Center, Android, macOS) require fully resolved absolute URLs for the full-color game logo (pwa-192x192.png).',
      'Created a dedicated Android notification badge (badge-96x96.png): an adorable white silhouette of Oli on a 100% transparent background, replacing the opaque badge that Android previously flattened into a solid white block.',
    ],
  },
  {
    version: 'v0.13.0',
    date: '2026-10-31',
    title: 'Play Micro-Minigames! 🎮🐾',
    changes: [
      'Feather Pounce! (Feather Wand): 3-round reflex game — tap POUNCE when the darting feather enters the green sweet-spot zone!',
      'Which Paw? Left or Right! (Laser Zoomies): Classic 3-round paw game — spot the subtle red laser glint and guess which paw Oli traps the dot under!',
      'Minigame Rewards: Score 2/3 for +8 Bonus Joy, or 3/3 Perfect Combo for +15 Bonus Joy, confetti & +1 Churu Tube 🍬!',
    ],
  },
  {
    version: 'v0.12.0',
    date: '2026-10-31',
    title: 'Attention Calls ("Meow!" Cravings) & Churu Stash! 💭🍬',
    changes: [
      'Attention Calls: Oli now periodically displays a "Meow!" craving bubble above his head asking for a specific snack, game, or care action.',
      'Tap the craving bubble directly (or the highlighted 💭 button in the dock) before the timer runs out for 2× Joy and +1 Churu Tube 🍬!',
      'Churu Treat Stash: Churu Tubes are now a collectible stash item (tracked in the top bar, up to 9 max) — earn more by fulfilling cravings or scooping every 2nd mess.',
    ],
  },
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
      'Room Messes: Every 2nd meal (or every 2.5 hours away, or after a treat tummy ache) Oli leaves a poop or ginger hairball on the living room rug!',
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
    title: 'Care Rules, Laser Zoomies & Direct Petting! 🥚🐾',
    changes: [
      'Streamlined into a focused single-player virtual pet with 4 balanced tabs: Feed, Play, Care & Rest.',
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
