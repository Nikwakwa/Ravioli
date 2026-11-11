# 💡 Ravioli — Ideas for Later

A parking spot for ideas we want to build one day but not right now.
When an idea gets picked up, move it into [ROADMAP.md](ROADMAP.md) as a new phase.

---

## 💌 1. Couple Co-op & Sweet Sticky Notes (Nico & Athina)

**The idea:** Transform Oli into a shared daily ritual between Nico and Athina, with live sync, partner updates, and sweet notes left for each other.

### What it adds
- **Live Partner Sync & Activity Feed:** When Athina opens the app, she sees a cute banner: *"Nico brushed Oli 20 minutes ago"* or *"Nico gave him a Quail Egg 💕"*.
- **Fridge & Table Sticky Notes:** A little pastel sticky note on the coffee table or fridge where Nico and Athina can leave short sweet messages for each other (e.g., *"Good luck with your meeting today!"*, *"Oli says hello from his box!"*). Tapping the note opens it up with a handwritten look.
- **Double Love Combo:** If both partners care for Oli within 30 minutes of each other, celebratory hearts float across the screen and Oli gets a 2-hour slow-decay happiness buff.
- **Couple Care Streak & Bond Level:** A little heart counter showing how many days in a row you two have kept Oli thriving together. Reaching streak milestones unlocks special room keepsakes.

---

## 🍼 2. Growing Up: From Baby Oli to Adult Oli (Tamagotchi-style life stages)

**The idea:** Oli starts as a tiny baby kitten and grows up through a few life stages, like a Tamagotchi. Once he becomes an adult he **stays an adult forever**, just like the real Oli today. He never gets old and never dies of old age.

### Life stages (first draft)
| Stage | Roughly how long | What makes it special |
|---|---|---|
| 🍼 **Newborn kitten** | first 1–2 days | Tiny, wobbly, eyes half-closed, sleeps a lot. Needs kitten milk often and lots of warmth (naps in a little nest). |
| 🐾 **Kitten** | next ~3–4 days | Big head and huge eyes, tiny ears, fluffy tail. Super playful, short naps, gets into mischief (knocks things over, climbs the box). |
| ⚡ **Teen cat** | next ~4–5 days | Lanky and long-legged, stripes and white tail tip fully visible. Zoomies, very curious, wants lots of play. |
| 🧡 **Adult Oli** | forever | Today's Oli, with all the current care, spots, cravings and minigames. The final stage: no aging after this. |

### How growing up could work
- **Grows with care, not just time:** each day where his needs stay out of the red earns "growth". A well-cared-for Oli grows on schedule; a neglected one grows more slowly (but is never harmed by it).
- **Each stage has its own needs and look:**
  - Newborn: kitten milk bottle instead of wet food, needs to be kept warm, can't play minigames yet.
  - Kitten: smaller meals more often, short energy bursts, simpler minigames.
  - Teen: more energy and hunger, all minigames unlocked.
  - Adult: the current balance.
- **Growing-up moments:** a little celebration when he reaches a new stage (confetti, "Oli grew up!" card), with the new look revealed.
- **Baby photo album:** save a snapshot at each stage so you can look back at how small he was.
- **Real-Oli details appear as he grows:** e.g. the ear tattoo shows up once he's an adult, matching real life.

---

## 🕊️ 3. Balcony Bird Watching

**The idea:** Bring the balcony to life with visiting wildlife that catches Oli's attention.

### What it adds
- **Visiting Birds & Butterflies:** Pigeons, robins, or colorful butterflies randomly land along the balcony railing.
- **Interactive Reactions:** Tapping a visitor makes Oli perk his ears, focus intently, wiggle his rear, and make a playful pounce attempt toward the railing.
- **Time-of-Day Visitors:** Morning doves during daylight, butterflies in the afternoon, and moths fluttering near the balcony light in the evening.

---

## 🧶 4. Interactive Floor Toys (Physics Play)

**The idea:** Give players a tactile, physics-based mini activity on the living room rug, even when Oli's care bars are already full.

### What it adds
- **Flickable Toys:** Drag and flick little toys across the rug (a crinkled paper receipt ball, a catnip mouse, or a bouncing ping-pong ball).
- **Oli Bats Back:** Oli tracks the toy with his head and playfully bats it back across the rug with a quick paw tap.
- **Playful Distraction:** Helps pass time and burn extra energy before naps without needing a structured minigame modal.

---

## 🪴 5. Cozy Room Customization

**The idea:** Let players personalize Nico & Athina's apartment by spending earned Churu treats on cozy room decor.

### What it adds
- **Room Swaps:**
  - Balcony railing plants (lavender pot, cat grass tray)
  - Living room rug patterns and warm colors
  - Cozy fairy string lights draped above the window
  - Silly delivery stickers on Oli's cardboard box
- **Long-Term Goals:** Gives a fun, visible reward for regular caretaking and saving up Churu treats.

---

## 🔔 6. Notifications even when the app is closed (web push)

**Problem today:** alerts ("Oli is hungry", "Oli woke up") only arrive while the app is open, because they come from timers running inside the app. Phones don't let a closed web app run code.

**The fix:** web push, where a small server sends the alert through Apple's or Google's push service and the phone shows it even when the app is closed.

### Plan
1. **In the app:** when notifications are turned on, register the phone for push and save that registration on Supabase. Every time Oli's stats change, upload his latest snapshot and the alert preferences.
2. **On Supabase:** a scheduled function (every ~5 minutes) works out which alerts are due and sends each one once. His stats change at fixed rates, so it can calculate exactly when a need drops below 25 or when he wakes up without running Oli on the server.
3. **In the app's background script:** add handling for incoming push messages (show the alert, open Oli on tap). This means switching the PWA setup from the auto-generated background script to a custom one.

### Good to know
- We already have a Supabase project (kept awake by `.github/workflows/supabase-keepalive.yml`) plus the parked sync code in `src/services/catStorage.ts` and `supabase/schema.sql`.
- **iPhone:** only works when the app is added to the Home Screen and opened from that icon (iOS 16.4+). Android works in the browser too.
- Alerts may arrive up to ~5 minutes late (the check interval).
- Fits in Supabase's free plan. Needs a push key pair; the private half stays as a Supabase secret.
- Notifications need to be switched on again once after this ships, so the phone can register.
- **Ruled out:** on-device scheduled notifications (dropped by browsers, never on iPhone), Android "background sync" (unreliable, Android only), GitHub scheduled jobs as the sender (often 15–60 min late).

---

## ✅ Completed Ideas

- **Secret Discovery Badges (Shipped in v0.25.0):**
  - 12 quirky cat achievements tracking Oli's authentic habits and routines (box naps, midnight munchies, watching rain, dressing up, cracking fortunes, pounce combos, trying all foods, purr motor, tidy room, balcony lounging, peak floof, daily streak).
  - Rewards +1 Churu tube for each unlocked badge.
  - Trophy Shelf view in the Menu page with completion progress, unlocked badges, and subtle hints for locked ones.
- **Oli’s Daily Fortune Cookie (Shipped in v0.24.0):**
  - Unlockable in the shop for 5 Churus.
  - Interactive SVG fortune cookie with crack animation and sound.
  - 36 unique cat wisdom fortunes and daily compliments with lucky spot/snack/vibe.
  - Resets daily; viewable anytime from the bottom bar and closet shop.
- **Oli’s Closet & Accessories (Shipped in v0.22.0–v0.23.0):**
  - Closet drawer with unlockable bowtie, flower crown, scarf, detective cap, sunglasses, and fancy suit.
- **Purrs, Chirps & Cozy Sound Effects (Shipped in v0.21.0):**
  - Purrs when petted, cute meows, chirps, eating crunches, water trickling, and instant mute button.
- **Real-Time Day & Night Atmosphere (Shipped in v0.20.0–v0.20.3):**
  - Automatic daylight, golden hour, and cozy night lamp matching Luxembourg sunrise & sunset.
  - Automatic rain sync matching live outside Luxembourg weather with window and balcony raindrops.
