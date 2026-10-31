# 🐱 Ravioli — Tamagotchi Gameplay Roadmap

This document tracks our gameplay evolution from a passive care toy into a full **Tamagotchi-style virtual pet game**, along with parked ideas for future updates.

---

## ✅ Phase 1: Core Tamagotchi Rules, Single-Player Focus & Dock Overhaul *(Completed)*

### 1. Single-Player Streamlining (Co-op Temporarily Removed)
- Remove the multi-player selector modal (`PlayerSelector`), partner HUD pill, `SyncDot`, `ActivityFeed` bar above the dock, and partner notification toggle so the screen is clean and focused entirely on Oli.
- Keep `catStorage.ts` and `supabase/schema.sql` intact under the hood so co-op can be re-enabled later without rewriting the backend.

### 2. Streamlined 4-Tab Action Dock (`Feed · Play · Care · Rest`)
- **Delete redundant buttons:**
  - Remove `Chin Scratches` from the dock and make **petting Oli directly on the rug** (`CatAvatar`) grant real `+Joy` (with a soft cooldown so it can't be infinitely spammed).
  - Merge the 1-button `Hydrate` tab into `Care`, and allow tapping the water fountain directly in the `LivingRoom` scene.
- **New 4-Tab Structure:**
  - **Feed:** `Wet Food Pouch`, `Quail Egg Topper`, `Chicken Heart`, `Churu Tube`
  - **Play:** `Feather Wand`, `Laser Zoomies`
  - **Care:** `Fresh Fountain`, `Brush Coat` *(+ `Scoop Mess` in Phase 2)*
  - **Rest:** `Calming Mist`, `Nap Mode`

### 3. Meaningful Food Trade-offs, Refusals & Overfeeding ("Tummy Ache")
- **Food Differentiation:**
  - **Wet Food Pouch (Meal):** `+38 Hunger`, `+5 Water`, `-4 Clean` (messy whiskers!). Refused if `hunger >= 85`.
  - **Quail Egg Topper (Booster Meal):** `+20 Hunger`, `+10 Energy`, `+8 Joy`. Refused if `hunger >= 90`.
  - **Chicken Heart (Crunchy Snack):** `+12 Hunger`, `+18 Joy`.
  - **Churu Tube (Ultimate Treat):** `+10 Hunger`, `+12 Water`, `+30 Joy`.
- **Fullness Refusal:** If Oli is already full (`hunger >= 85` for wet food, `>= 90` for quail egg), he plays a classic Tamagotchi **head-shake refusal animation** (`refuse`) and won't eat a heavy meal.
- **Overfeeding / Treat Spam ("Tummy Ache"):** Feeding more than 2 treats within 15 minutes (or stuffing Oli when `hunger >= 98`) triggers a **Tummy Ache** (`-15 Energy`, `-10 Clean`, `-8 Joy`) and blocks treats for 15 minutes.

### 4. Autonomous Sleep & Energy Rules
- **Hyper Refusal:** If `energy >= 85`, Oli refuses manual Nap Mode (*"Too much energy to nap! Play with him first."*).
- **Exhausted Refusal:** If `energy < 15`, Oli refuses high-energy Play actions (*"Too tired to play! Let him nap or eat a Quail Egg."*).
- **Auto-Pass-Out Nap:** If `energy` decays all the way to `0` while awake, Oli automatically curls up into an exhausted nap in `decayEngine.ts`.

---

## ✅ Phase 2: On-Screen Messes (Poop & Throw-Up) & Interactive Room *(Completed)*

- **Poop & Throw-Up Spawns:** After meals, overfeeding treats, or as `hygiene` decays over time, 1–3 messes (poop swirls or throw-up splats on the rug) appear in `LivingRoom.tsx`.
- **Consequences:** Active messes accelerate `hygiene` and `happiness` decay and prevent Oli from reaching `Thriving` (`ecstatic`) status.
- **Interactive Cleaning:** Tap messes directly in the room (or use `Care → Scoop / Clean`) to whisk them away for a `+Clean` and `+Joy` boost.

---

## ✅ Phase 3: Attention Calls ("Meow!" Whims) & Treat Stash *(Completed)*

- **Specific Cravings / Whims:** Periodically, Oli displays an attention bubble above his head requesting a specific action (e.g., *"Craving a Chicken Heart!"*, *"Wants Feather Wand!"*, *"Wants a Brush!"*).
- **Reward Loop:**
  - Fulfilling the exact whim within the time window grants **2× Joy** and awards **+1 Churu Tube** to your Treat Stash.
  - Ignoring an attention call leaves Oli pouty (`-10 Joy`).
- **Treat Stash Economy:** Make `Churu Tubes` a finite stash item (start with 3, earn more by fulfilling whims, cleaning messes, or winning minigames) so feeding a Churu feels genuinely rewarding.

---

## 🎮 Phase 4: Micro-Minigames for `Play`

Replace passive Play buttons with quick 10-second Tamagotchi minigames:
1. **Feather Pounce Reflex:** The feather wand darts across the screen; tap when Oli's pupils dilate (`3` quick rounds) to score a pounce combo.
2. **Guess Which Paw (Left / Right):** Classic Gen-1 Tamagotchi game — Oli hides a crinkle ball under his left or right paw (`3` guesses).

---

## ⏸️ Parked for Later: Co-op Mode & Progression

*(Saved for future re-introduction once single-player Tamagotchi mechanics are complete)*
- **Live Partner Co-op:** Nico & Athina player switcher (`PlayerSelector`), live Supabase WebSocket sync (`catStorage.ts`), partner activity feed (`ActivityFeed`), and background partner notifications.
- **Double Love Combo:** If both partners care for Oli within 15 minutes of each other, trigger a 2-hour slow-decay buff.
- **Care Streak & Bond Level:** Track consecutive days Oli stays above critical thresholds without neglect.
- **Unlockable Keepsakes & Collars:** Leveling up Bond unlocks visual items in `LivingRoom.tsx` (cardboard box, sunbeam spot, catnip mouse) and accessories on `CatAvatar.tsx` (bowtie collar, bandana).
