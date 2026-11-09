export interface ReleaseEntry {
  version: `v${number}.${number}.${number}`;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ReleaseEntry[] = [
  {
    version: 'v0.20.2',
    date: '2026-11-09',
    title: 'Pure Automatic Weather in Luxembourg 🇱🇺🌧️',
    changes: [
      'Rain mode is now completely automatic with no buttons to press: Oli’s window matches the real rain in Luxembourg City.',
      'The weather updates automatically each time you open the app or return to it.',
      'No location permissions or city searches required — fixed right at home in Luxembourg.',
    ],
  },
  {
    version: 'v0.20.1',
    date: '2026-11-09',
    title: 'Outside Weather Sync for Cozy Rain 🌦️🌧️',
    changes: [
      'Oli can now match the real weather outside your window! Turn on "Sync with Outside Weather" to have gentle rain slide down the window whenever it rains in your area.',
      'Tap "Use My Current Location" or type any city name in the world (e.g. Paris, Tokyo, London, Seattle).',
      'The Ambience menu shows the current temperature and outside sky conditions with a quick refresh button.',
      'You can still turn on Cozy Rain manually anytime if you want rain regardless of the weather.',
    ],
  },
  {
    version: 'v0.20.0',
    date: '2026-11-09',
    title: 'Real-Time Atmosphere & Cozy Rain Mode 🌅🌧️',
    changes: [
      'The living room and balcony now change with the real-world clock: bright daytime sunbeams with gentle floating dust motes, warm golden sunset tones, and cozy midnight darkness with twinkling stars and glowing neighbor windows.',
      'A warm windowsill lamp automatically turns on during sunset and night.',
      'New "Ambience" tab in the Menu lets you pick real-time auto lighting or lock in your favorite mood (Day, Golden Hour, or Cozy Night).',
      'Cozy Rain (Cat TV mode): Turn on rain to watch droplets slide down the living room window pane or see the balcony rain streaks while relaxing with Oli.',
      'Tap the new ambience chip right in the top status bar to quickly view or switch moods.',
    ],
  },
  {
    version: 'v0.19.2',
    date: '2026-11-08',
    title: 'No More Leftover Water Bowls 💧🐾',
    changes: [
      'After Oli drinks, eats or plays, moving him to another spot (like the balcony corner or the bistro table) no longer replays the old animation, so no water bowl, food bowl or toy pops up next to him anymore.',
      'While he watches the street with his back to you, bowls and toys never appear in front of him.',
      'The fountain only bubbles faster while he’s actually drinking.',
    ],
  },
  {
    version: 'v0.19.1',
    date: '2026-11-08',
    title: 'Close-Up Rooms Are Back 🛋️🔍',
    changes: [
      'The living room and balcony fill the screen at full size again, so you’re close to Oli instead of looking at a small, far-away room.',
      'On shorter screens the room only slides up a little, just enough that Oli’s paws never hide behind the room switcher or the care buttons.',
    ],
  },
  {
    version: 'v0.19.0',
    date: '2026-11-08',
    title: 'Churu Points, Calmer Cravings & a Roomier Screen 🍬🐾',
    changes: [
      'Churus are now a real treat: cravings and perfect 3/3 minigames earn churu points, 3 points make 1 Churu tube, and you can earn up to 3 tubes per day. The dots next to 🍬 at the top show your progress. Chin-scratch cravings give extra Joy but no points.',
      'Oli asks for something every 12–20 minutes instead of every half-minute, and he no longer sulks (−Joy) about cravings that ran out while the app was closed.',
      'The room now fits above the care buttons, so Oli is never hidden behind them on smaller phones, and the Living Room / Balcony switch stays on one line.',
      'Care and Rest buttons now match the Feed and Play layout, so nothing gets cut off.',
    ],
  },
  {
    version: 'v0.18.5',
    date: '2026-11-08',
    title: 'No More Surprise Messes When Petting 🐾🧹',
    changes: [
      'Petting Oli (for example in his cardboard box) no longer makes a waiting fur clump or throw-up pop out at that exact moment. Messes that build up over time now only appear on the game’s own clock, when the app opens, or when you come back to it.',
    ],
  },
  {
    version: 'v0.18.4',
    date: '2026-11-08',
    title: 'Cuter Balcony Oli: Street Watch & Belly Rolls Redrawn 🐾💕',
    changes: [
      'Redrew Oli from behind for his street-watch corner: furry backs of the ears (no more pink insides showing), round haunches with tiny toes peeking out, tabby stripes down his back, and his striped tail curled on the tiles with a flicking white tip. Pet him and he turns around to give you a happy little smile!',
      'Redrew the belly-up roll so Oli really lies on his back on the warm tiles: long fluffy tummy facing the sky, pink toe beans up in the air, mitten paws kneading, head tilted back with a blissful face, and a gentle happy wiggle when you rub his belly.',
      'Fixed perspective & overlapping on the balcony: Oli is now the same size in every spot, sits behind the closer cypress pot instead of on top of it, and the floor tiles are true squares all the way to the bottom of the screen.',
    ],
  },
  {
    version: 'v0.18.3',
    date: '2026-11-07',
    title: 'Balcony Street Watch & Sunny Belly Rolls ☀️👀🐾',
    changes: [
      'Added Oli’s favorite balcony corner spot: Oli now sits in the cozy left corner looking out and down at the quiet street below through the railing, with his back to us and alert forward-pointing ears.',
      'Added Oli’s warm tile belly-up roll: Oli rolls happily on the sunlit terrace floor with his soft cream belly up in the air, front paws curled like mittens, and blushing smiling face enjoying the sun.',
      'Adjusted the corner cypress pot slightly so the left corner is wide open for Oli to watch the neighborhood street.',
    ],
  },
  {
    version: 'v0.18.2',
    date: '2026-11-07',
    title: 'True 3D Balcony Perspective & Café Set Redesign 🌿🪑✨',
    changes: [
      'Re-imagined the Balcony from a clean, inviting straight-on perspective matching the Living Room, so the floor tiles, railing, hanging pots, bistro table, and folding chairs all share one natural camera angle.',
      'Redesigned the wooden bistro table (with crossed X-legs) flanked by two matching folding bistro chairs facing each other, plus horizontal 3D grey planter boxes with curved rail hooks and blooming pansies.',
    ],
  },
  {
    version: 'v0.18.1',
    date: '2026-11-07',
    title: 'Balcony Design Overhaul & Cozy Spot Polish 🌿🪑🐾',
    changes: [
      'Grounded Oli properly in all 3 balcony spots: sitting on the back terrace tiles beside the cypress pot watching the street, perched cleanly on top of the wooden bistro table, and lounging in the foreground on the sunny tiles without furniture overlapping him.',
      'Rebuilt the balcony architecture and furniture: full-height left apartment wall, aligned vertical railing bars, 3D grey planter boxes with pansies along the steel handrail, a feathery corner cypress tree, and clean terrace tiles with the fallen leaves removed.',
    ],
  },
  {
    version: 'v0.18.0',
    date: '2026-11-07',
    title: 'New Scenery: The Balcony! 🌿🌼🪑',
    changes: [
      'Added your real Balcony as a second scenery, complete with the stainless-steel railing, grey pansy planter boxes, corner cypress pot, wooden bistro table & chairs, square terrace tiles, and neighborhood view across the street.',
      'Added a quick Living Room / Balcony switcher right above the care dock, plus Oli can wander outside on his own when awake.',
      'Oli can hang out by the flower boxes & conifer pot watching the street, perch on the wooden bistro chair, or stretch out on the sunny balcony tiles.',
    ],
  },
  {
    version: 'v0.17.1',
    date: '2026-11-06',
    title: 'Red Ball Sofa Rally & Smooth Tail Spin 🛋️🐾🌀',
    changes: [
      'Redesigned Red Ball into an arcade Sofa Rally: slide Oli’s paw left and right to bounce the rolling red ball back and keep it from rolling under the sofa.',
      'Fixed Oli’s head glitching in Tail Spin when the orbiting tail indicator completes a 360° loop.',
    ],
  },
  {
    version: 'v0.17.0',
    date: '2026-11-06',
    title: 'New Solo Minigames: Tail Spin & Red Ball! 🌀🔴🐾',
    changes: [
      'Added Tail Spin (Chase Tail): help Oli nab his own striped, white-tipped tail as he spins in circles.',
      'Added Red Ball Chase (Red Ball): bat Oli’s favorite small red ball across the floor and pounce to trap it.',
      'Updated the Play tab into a 2×2 grid of 4 interactive games, plus new living room animations and cravings.',
    ],
  },
  {
    version: 'v0.16.17',
    date: '2026-11-06',
    title: 'Real Living Room Makeover 🛋️🌿✨',
    changes: [
      'Updated the rug with the real Moroccan grey diamond pattern and a cleaner shape.',
      'Replaced the generic wall print and lamp with your tropical leaf print and cream cat tree behind the sofa.',
      'Redesigned the tall white bookcase with open shelves and Shaker cabinet doors, positioned closer to the center.',
      'Updated the window with the soft white Roman blind, small windowsill lamp, and all 5 sofa cushions.',
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
