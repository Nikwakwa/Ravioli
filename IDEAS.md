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

## 🎀 2. Dress-Up & Cute Accessories (Oli's Closet)

**The idea:** Let Athina customize Oli with adorable, lightweight accessories that appear on his avatar across all his cozy spots.

### What it adds
- **Cute Accessories:**
  - Red gentleman bowtie
  - Flower crown / floral collar
  - Cozy knit winter scarf
  - Tiny detective cap
  - Cool sunglasses when lounging on the sunny balcony
- **Closet Wardrobe:** A simple hanger icon opens a cozy closet drawer where you can equip or remove items anytime.
- **Unlockable Rewards:** Earn new accessories by keeping up care streaks, completing Churu point goals, or reaching co-op bond milestones.

---

## 📸 3. Polaroid Scrapbook (Memory Album)

**The idea:** A camera feature to capture Oli's funniest and cutest moments and save them into a keepsake photo album.

### What it adds
- **Snap a Polaroid:** Tap a little camera icon in the corner to snap a candid Polaroid-style photo of Oli wherever he's lounging (loafing in his delivery box, belly-up on the balcony, watching the street, or curled in bed).
- **Oli's Thoughts & Date Stamp:** Each photo gets stamped with the date and a funny thought bubble from Oli (e.g., *"Caught napping on duty"*, *"Surveying my kingdom"*, *"Sun warmed my belly just right"*).
- **Scrapbook Album:** A pastel photo album you can flip through from the menu to look back on all your favorite snapshots and save them to your phone.

---

## 🐾 4. Purrs, Chirps & Cozy Sound Effects

**The idea:** Bring Oli to life with gentle, soothing sounds and tactile feedback.

### What it adds
- **Purring on Pets:** A soft, rhythmic purring sound and subtle vibration whenever Athina rubs Oli's chin or pets his soft belly.
- **Cute Cat Chirps & Meows:** A gentle "mrp?" or friendly chirp when calling Oli over to a new spot or tapping him while awake.
- **Cozy Room Sounds:** Crisp crunching when eating a Chicken Heart, soft slurping for Churu treats, gentle water trickling at the fountain, and quiet autumn wind on the balcony.
- **Discreet Mute Switch:** An easy sound toggle in the corner so she can mute it instantly in public or at work.

---

## 🌅 5. Real-Time Day & Night Atmosphere

**The idea:** Make the living room and balcony mirror the real-world time of day and cozy weather.

### What it adds
- **Daylight (Morning & Afternoon):** Bright, warm sunshine with soft sunbeams stretching across the Moroccan shag rug.
- **Golden Hour (Late Afternoon / Sunset):** Beautiful amber and orange lighting across the balcony railing and living room walls.
- **Cozy Night Mode:** The room gently dims, the little white windowsill lamp turns on with a warm golden glow, and Oli curls up peacefully in his bolster bed for the night.
- **Rainy Day Cat TV:** Gentle raindrops sliding down the living room window glass for Oli (and Athina) to watch.

---

## 🍼 6. Growing Up: From Baby Oli to Adult Oli (Tamagotchi-style life stages)

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

### Things to decide before building
- Should the current adult Oli stay as is, with "start as a baby" only for a new game? Or offer a one-time "relive Oli's kittenhood" story from the Menu?
- Exact stage lengths (days vs. growth points).
- New drawings needed: newborn, kitten and teen versions of every pose (sit, loaf, sleeping, belly-up, back view).
- How the 9-lives neglect rule applies to a baby (probably gentler: a baby gets "rescued" rather than losing a life).

---

## 🔔 Notifications even when the app is closed (web push)

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
