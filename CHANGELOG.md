# Changelog

All updates to **Oli** are listed here.

---

## `v0.11.1` — 2026-10-31
### Poop & Throw-Up Messes on the Rug! 🤢💩
- Replaced hairball messes with cat **throw-up splats** (`vomit`) on the rug when Oli overeats treats into a tummy ache or is left unattended.

---

## `v0.11.0` — 2026-10-31
### Poop, Hairballs & Rug Cleanup! 💩✨
- **On-Screen Tamagotchi Messes:** Up to 3 messes (**poop swirls** and **fuzzy ginger hairballs**) can now spawn on the living room rug — after every 2nd meal, when overfed into a tummy ache, or every 2.5 hours away.
- **Interactive Cleanup:** Tap any mess directly on the rug or use **Care → Scoop Mess** (`+15 Clean, +6 Joy`) to whisk it away with sparkles.
- **Mess Consequences:** Uncleaned messes block `Thriving` (`ecstatic`) status and display a live `💩 Mess` counter in the top HUD and `Care` tab.

---

## `v0.10.1` — 2026-10-31
### Interactive Fountain Fix 💧
- Fixed the center-stage wrapper catching pointer events over the Living Room background so tapping the water fountain works reliably on mobile & desktop.

---

## `v0.10.0` — 2026-10-31
### Tamagotchi Rules, Laser Zoomies & Direct Petting! 🥚🐾
- Streamlined the UI for single-player Tamagotchi gameplay (parked co-op UI for a future update) and reorganized the dock into **Feed · Play · Care · Rest**.
- **Interactive Petting & Fountain:** Tapping Oli on the rug now grants **+6 Joy** chin scratches (20s cooldown), and tapping the water fountain in the room refreshes his water directly.
- **New Play Action — Laser Zoomies:** High-energy play session (`+32 Joy, -18 Energy, -8 Hunger, -5 Water`) with a custom red laser dot animation.
- **Fullness & Tummy Ache Mechanics:** Meals (`Wet Food`, `Quail Egg`) are refused with a head-shake animation when Oli is already full, and spamming more than 3 treats in 15 minutes causes a **Tummy Ache** that can be soothed by petting, brushing, or misting.
- **Tamagotchi Sleep & Energy Rules:** Oli refuses naps when hyper (`85+` Energy), refuses play when tired, and automatically passes out into a nap when Energy drops to `≤ 5`.

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
