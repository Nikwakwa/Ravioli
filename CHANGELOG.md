# Changelog

All updates to **Oli** are listed here.

---

## `v0.16.2` — 2026-11-01
### Water Fountain Restored & Brought to Front 💧✨
- **Restored Water Fountain:** Fixed an issue where the living room rug was drawn over the water fountain layer. The water fountain with its glowing blue LED status light, bubbling water arch, and stainless steel bowl is now placed in the front on the right side of the room, far from the litter box.

---

## `v0.16.1` — 2026-11-01
### Pixel-Perfect Cozy Nestling & Depth Layering 🛋️📦✨
- **True Physical Nestling:** Integrated Oli directly into the living room scene vector layers so he nestles naturally inside his Bedsure bolster bed and Amazon delivery box without awkward floating overlays.
- **Pixel-Perfect Proportions & Scale:** Adjusted Oli’s size and placement to match each spot’s real-world dimensions — perched neatly on the sunny windowsill ledge, tucked inside the delivery box with head peeking over, and curled up in his sofa bolster bed.
- **Adaptive Thought Bubbles:** Cravings and pet reaction bubbles now dynamically point directly to the top of Oli’s head on all phone screen sizes and aspect ratios.
- **Touch Anywhere:** Tap Oli directly or any part of his bed, box, windowsill, or rug to pet him and hear his sweet cozy purrs.

---

## `v0.16.0` — 2026-11-01
### Where is Oli? Room Roaming & Cozy Spots! 🛋️📦✨
- **Room Roaming & Cozy Spots:** Oli is no longer pinned to the center of the rug! He now roams naturally between **4 authentic cozy lounging spots** around Nico & Athina’s living room:
  - **Fluffy Shag Rug:** The grand center stage for meals, licking Churus, and active minigames.
  - **Bedsure Sofa Bolster Bed:** Curled up in his tan suede bolster bed on the sofa chaise — his favorite spot for cozy naps!
  - **Amazon Delivery Cardboard Box:** Corrugated kraft cardboard box on the floor with shipping label and *"FRAGILE: OLI"* stamp. If it fits, Oli sits!
  - **Sunny Windowsill:** Perched high on the windowsill enjoying the sky, clouds, and flying birds ("Cat TV").
- **Tap-to-Beckon & Quick Spot Bar:** Tap any empty spot in the living room (or use the sleek quick spot switcher) to beckon Oli over with fluid spring hops.
- **Unique Cozy Purrs & Interactions:** Petting Oli in his different lounging spots reveals unique thoughts — sleepy purrs and biscuit-making in his bed, playful box swats and fortress pride in his box, and bird chirping on the windowsill.
- **Natural Routines:** Tucking Oli in for a nap automatically places him in his Bedsure sofa bed. Preparing a meal, treat, or play minigame brings him to the center rug.
- **Litter Box & Water Separation:** Shifted the corner enclosed litter box fully onto the screen (100% visible on all mobile aspect ratios) and moved the LED water fountain to the opposite side of the living room so fresh water is never placed near a litter box.
- **Coffee Table Polish:** Removed the cork coaster from the modern white coffee table.

---

## `v0.15.2` — 2026-11-01
### Crystal-Clear Churu Treat Rules! 🍬✨
- **Simple Stash & Cap:** You start with **1 Churu Tube**, and can collect as many as you want (capped at **99 max** for UI design).
- **Craving Thought Bubbles:** Fulfilling any of Oli’s craving thought bubbles always awards double joy (**2× Joy**) and **+1 Churu Tube 🍬**!
- **3/3 Minigame Mastery:** Scoring **3/3 in any minigame** awards bonus joy and **+1 Churu Tube 🍬**!
- **Pure Clean Routine:** Scooping the litter box or sweeping fur tumbleweeds from the rug keeps Oli clean and healthy (no Churus).

---

## `v0.15.1` — 2026-11-01
### Balanced Churu Treat Economy! 🍬⚖️
- **Rare Delicacy Rebalance:** Churu Tubes now start at **1** (capped at **5 max**), reflecting how rare and prized lickable treats are in real life.
- **3-Craving Streak Reward:** Attention Calls still award double joy (**2× Joy**), but earning a Churu Tube now requires fulfilling a **streak of 3 cravings** in a row.
- **5-Cleanups Milestone:** Scooping the litter box or cleaning up rug messes awards a Churu every **5th cleanup** (instead of every 2nd).
- **Minigame Mastery:** Playing casual minigames awards high bonus Joy (`+15 Joy`), but earning a Churu from a minigame now requires scoring a **3/3 Perfect Play when Oli specifically craves that game** (or a milestone of 3 perfect games in a row).

---

## `v0.15.0` — 2026-11-01
### Real Corner Litter Box & Ginger Fur Tumbleweeds! 📦✨
- **Real Corner Litter Box:** Modeled directly from Oli’s actual home litter box — a modern two-tone enclosed box with a warm-grey slide-out base drawer with front pull handle, an off-white hood, smoked translucent swinging flap door, and textured stepping grid with top-exit hole in the living room corner.
- **Interactive Scooping & Tap-to-Clean:** Every 2nd meal (or after hours away), Oli uses his litter box! Tap the litter box directly in the room (or choose `Care → Scoop Box`) to scoop it clean (+15 Clean, +6 Joy, and earn +1 Churu Tube every 2 scoops). Shows a pulsing alert badge whenever scooping is needed.
- **No More Poop on the Rug:** Real Oli never poops outside his litter box! Rug messes now spawn authentic ginger fur tumbleweeds from his shedding coat (and occasional throw-up when overfed treats). Tapping a fur clump vacuums/sweeps it up with floating fluff sparkles.

---

## `v0.14.0` — 2026-10-31
### Vacation Mode (Pause Clock) & 9 Lives! ✈️🐾
- **Pause Care Clock (Vacation Mode):** Added a dedicated Pause/Resume toggle in the top bar (and inside the Rules manual). Tap **Pause** before taking a flight, traveling, or when you won't have your phone — Oli's stats freeze completely in time with zero decay, no mess spawns, and no expiring whims until you tap **Resume**.
- **9 Lives & Severe Neglect Warning:** If left completely unattended without food and water for over **48 continuous hours at zero stats** (over 2.5 days of complete neglect), Oli can succumb to severe dehydration and pass away. A new emergency vet revival allows you to nurse him back to life using **1 of his 9 lives**!
- **Pure Virtual Pet Identity:** Removed all legacy third-party naming references so Oli stands proudly on his own as a cozy, dedicated virtual cat companion.

---

## `v0.13.1` — 2026-10-31
### Notification Logo & Badge Fix 🔔🐱
- **Full-Color Game Logo Restoration:** Replaced relative asset URLs with guaranteed absolute URLs for the notification icon (`pwa-192x192.png`). OS notification services (Windows Action Center, Android, macOS) run outside the browser scope and fail to load relative URLs, which previously caused them to render a blank/white square placeholder instead of Oli's logo.
- **Dedicated Android Monochrome Badge (`badge-96x96.png`):** Generated a crisp white silhouette of Oli's cat head with transparent cutouts on a 100% transparent background, replacing the opaque peach background badge that Android previously flattened into a solid white square in the status bar and notification header.

---

## `v0.13.0` — 2026-10-31
### Play Micro-Minigames! 🎮🐾
- **Feather Pounce! (`feather_wand`):** 3-round reflex timing minigame where the feather sweeps across the arena — tap **🐾 POUNCE!** while it's inside the narrowing green sweet-spot zone!
- **Which Paw? Left or Right! (`laser_pointer`):** Classic 3-round Left/Right paw game — watch for the subtle red laser glint and guess whether Oli trapped the dot under his **⬅️ Left Paw** or **Right Paw ➡️**!
- **Combo Rewards & Quick Skip:** Score **2/3** for `+8 Bonus Joy`, or **3/3 Perfect Combo 🏆** for `+15 Bonus Joy`, celebratory confetti, and **+1 Churu Tube 🍬** (stacks with `2×` Attention Call cravings!). Includes a `Skip` button for instant play anytime.

---

## `v0.12.0` — 2026-10-31
### Attention Calls ("Meow!" Cravings) & Churu Stash! 💭🍬
- **Attention Calls (`WhimBubble`):** Periodically while awake, Oli displays a thought bubble above his head requesting a specific action (e.g., *Chicken Heart*, *Feather Wand*, *Laser Zoomies*, *Brush Coat*).
- **One-Tap Fulfill & 2× Joy Reward:** Tap the craving bubble directly (or the highlighted `💭 2× Joy` button in the dock) before it expires to grant **2× Joy** and earn **+1 Churu Tube 🍬**! Ignoring a craving leaves Oli pouty (`-8 Joy`).
- **Churu Treat Stash Economy:** `Churu Tubes` are now tracked in a finite stash (`🍬` pill in the top HUD and `×N` badge on the Churu tile, starting with 3 and holding up to 9). Earn extra tubes by fulfilling cravings or scooping every 2nd mess on the rug.

---

## `v0.11.2` — 2026-10-31
### Visible Rug Messes Fix 💩✨
- Fixed a Framer Motion `<motion.g>` SVG transform bug that overwrote `transform="translate(x, y)"` and sent messes to `(0, 0)` behind the top HUD.
- Moved poop & throw-up messes into a dedicated foreground `RoomMesses` layer (`z-20`) inside the Center Stage right beside Oli on the rug, ensuring they are never hidden behind Oli or the bottom dock on any screen size.

---

## `v0.11.1` — 2026-10-31
### Poop & Throw-Up Messes on the Rug! 🤢💩
- Replaced hairball messes with cat **throw-up splats** (`vomit`) on the rug when Oli overeats treats into a tummy ache or is left unattended.

---

## `v0.11.0` — 2026-10-31
### Poop, Hairballs & Rug Cleanup! 💩✨
- **On-Screen Room Messes:** Up to 3 messes (**poop swirls** and **fuzzy ginger hairballs**) can now spawn on the living room rug — after every 2nd meal, when overfed into a tummy ache, or every 2.5 hours away.
- **Interactive Cleanup:** Tap any mess directly on the rug or use **Care → Scoop Mess** (`+15 Clean, +6 Joy`) to whisk it away with sparkles.
- **Mess Consequences:** Uncleaned messes block `Thriving` (`ecstatic`) status and display a live `💩 Mess` counter in the top HUD and `Care` tab.

---

## `v0.10.1` — 2026-10-31
### Interactive Fountain Fix 💧
- Fixed the center-stage wrapper catching pointer events over the Living Room background so tapping the water fountain works reliably on mobile & desktop.

---

## `v0.10.0` — 2026-10-31
### Care Rules, Laser Zoomies & Direct Petting! 🥚🐾
- Streamlined the UI for single-player virtual pet care (parked co-op UI for a future update) and reorganized the dock into **Feed · Play · Care · Rest**.
- **Interactive Petting & Fountain:** Tapping Oli on the rug now grants **+6 Joy** chin scratches (20s cooldown), and tapping the water fountain in the room refreshes his water directly.
- **New Play Action — Laser Zoomies:** High-energy play session (`+32 Joy, -18 Energy, -8 Hunger, -5 Water`) with a custom red laser dot animation.
- **Fullness & Tummy Ache Mechanics:** Meals (`Wet Food`, `Quail Egg`) are refused with a head-shake animation when Oli is already full, and spamming more than 3 treats in 15 minutes causes a **Tummy Ache** that can be soothed by petting, brushing, or misting.
- **Smart Sleep & Energy Rules:** Oli refuses naps when hyper (`85+` Energy), refuses play when tired, and automatically passes out into a nap when Energy drops to `≤ 5`.

---

## `v0.9.1` — 2026-10-31
### Customizable Alert Preferences 🔔
- Added a dedicated **Notification Preferences** sheet (`NotificationModal`) opened from the top-bar bell icon (or from **Rules → Choose Alerts…**).
- Choose individually whether to receive **Low-Need (< 25)**, **Critical (≤ 5)**, **Oli Wakes Up**, and **Partner Co-op Actions** alerts, and pick which specific needs (**Hunger**, **Water**, **Joy**, **Energy**, **Clean**) to watch.

---

## `v0.9.0` — 2026-10-31
### Smart Oli Notifications 🔔
- Added a **🔔 Bell toggle** in the top bar (and a Notifications control with a **Test Alert** button inside the **Rules** manual) to enable system/PWA notifications.
- Automatically notifies you once whenever any stat crosses below **25** (low-need alert) or **5** (critical alert), when Oli finishes his nap and wakes up on his own, or when your co-op partner cares for him while the app is in the background.

---

## `v0.8.0` — 2026-10-31
### Care Manual & Cleaner Action Tiles 📖
- Added a **Rules** button in the top HUD that opens the **Oli Care Manual & Rules** sheet with exact hourly stat decay/recharge rates, nap rules, mood thresholds, and care action boosts.
- Simplified the action tiles in the bottom dock so labels and stat pills never get truncated.
- Removed the "Fav" badge/highlight feature and removed the kiwis from the coffee table.

---

## `v0.7.1` — 2026-10-31
### Cute Oli Is Back 🧡
- Reverted the overly realistic v0.7.0 avatar (slit pupils, eyeliner, lip spot, ear notch, nose freckles, chest bands, striped socks) back to the cute v0.6.0 design.
- Kept only a few photo-inspired touches: warmer amber eyes with rounder pupils, whiter muzzle/bib, a ringed tail with a white tip, and two tiny fangs when yawning.
- The real-life Living Room from v0.7.0 is unchanged.

---

## `v0.7.0` — 2026-10-31
### Real-Life Oli & Your Actual Living Room! 📸🐾
- Redesigned virtual **Oli** from your 16 real photos: added the small V-notch on his left ear tip, prominent dark stippled tattoo in his right ear, nose lentigo freckles, signature central dark lower-lip spot, ginger chest "necklace" stripes, asymmetrical white front socks with pink toe pads, fang yawn, and white-tipped ringed tail.
- Recreated your actual **Living Room**: cream floor tiles, fluffy white high-pile shag rug, dark charcoal woven L-sofa with terracotta, sage-olive & geometric triangle pillows, Oli's tan suede *Bedsure* bolster bed, white coffee table with cork coaster & kiwis, white cube bookcase with rattan basket & trailing plants, window with slatted roller blind & ribbed radiator, wooden tripod floor lamp, and white blue-LED water fountain.

---

## `v0.6.0` — 2026-10-31
### Cozy Living Room Focus & Security Hardening
- Removed the Balcony scene and switcher so the app focuses purely on Oli’s cozy Living Room.
- Added strict Content Security Policy (CSP), canonical activity-log message validation, and input sanitization.

---

## `v0.5.0` — 2026-10-30
### Oli’s Favourite Treat: Churu! 🐾
- Added Oli’s favourite creamy lickable **Churu Tube** to the Feed menu (marked with a `★ Fav` badge).
- Added a custom Churu tube licking animation and Churu thought bubbles when you pet him.

---

## `v0.4.0` — 2026-10-30
### Update Alerts & Simpler Notes
- Added a friendly banner that appears whenever a new update is available so you can reload with one tap.
- Simplified the in-app update notes so they’re warm and easy to read.

---

## `v0.3.0` — 2026-10-30
### What’s New Drawer
- Added a tappable version badge next to Oli’s name that opens the "What’s New" sheet.

---

## `v0.2.0` — 2026-10-30
### Cozy Room Makeover & Night Mode
- Rearranged the Living Room and Sunny Balcony so Oli sits right on his rug and cushion with his fountain and plants in full view.
- Added a soft dark theme for menus while Oli is napping.
- Tapping Oli now shows cute purr and thought bubbles.
- Swiping horizontally on the room switches between the Living Room and Sunny Balcony.

---

## `v0.1.0` — 2026-10-30
### Hello Oli! 🐱
- Meet Oli with his ginger coat, golden eyes, chin freckles, and ear tattoos.
- Feed, hydrate, play, brush, and tuck Oli in for naps together in real time as **Nico** and **Athina**.
