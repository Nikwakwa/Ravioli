# 🐱 Ravioli — Virtual Pet Gameplay Roadmap

This document tracks our gameplay evolution from a passive care toy into a full **virtual pet game & cozy cat companion**, along with parked ideas for future updates.

---

## ✅ Phase 1: Core Care Rules, Single-Player Focus & Dock Overhaul *(Completed)*

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
- **Fullness Refusal:** If Oli is already full (`hunger >= 85` for wet food, `>= 90` for quail egg), he plays a cute **head-shake refusal animation** (`refuse`) and won't eat a heavy meal.
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

## ✅ Phase 4: Micro-Minigames for `Play` *(Completed)*

Replace passive Play buttons with quick 10-second interactive minigames:
1. **Feather Pounce Reflex:** The feather wand darts across the screen; tap when Oli's pupils dilate (`3` quick rounds) to score a pounce combo.
2. **Guess Which Paw (Left / Right):** Classic guessing game — Oli hides the laser dot under his left or right paw (`3` guesses).

---

## ✅ Phase 5: Vacation Mode (Pause Care Clock) & 9-Lives Neglect Warning *(Completed)*

- **Pause Care Clock (Vacation Mode):** Tap the Pause button in the top bar to freeze time and stat decay whenever taking a long flight or away for a few days.
- **9 Lives & Severe Neglect Protection:** If left unattended for over 48 continuous hours at zero food and water (over 2.5 days of complete neglect), Oli can succumb to severe dehydration. Miraculous emergency vet care revives him using 1 of his 9 lives!

---

## ✅ Phase 6: Real Corner Litter Box & Ginger Fur Tumbleweeds *(Completed in v0.15.0)*

- **Authentic Corner Litter Box:** Modeled directly from Oli’s actual home litter box (grey slide-out drawer tray base, off-white hood, smoked translucent swinging flap door, and textured stepping grid with top-exit hole in the living room corner).
- **Interactive Scooping & Digestion:** Every 2nd meal (or after hours away), Oli uses his litter box! Tap the litter box directly in the room (or use `Care → Scoop Box`) to scoop it clean (+15 Clean, +6 Joy, and earn +1 Churu Tube every 2 scoops).
- **No More Poop on the Rug:** Real Oli never poops outside his litter box! Rug messes now spawn authentic ginger fur tumbleweeds from his shedding coat (and occasional throw-up when overfed treats). Tapping a fur clump vacuums/sweeps it up with floating fluff sparkles.

---

## ✅ Phase 7: Where is Oli? Room Roaming & Cozy Spots *(Completed in v0.16.0)*

- **Dynamic Room Roaming:** Oli dynamically lounges in 4 authentic spots around Nico & Athina's living room:
  - Center shag rug (for meals and minigames)
  - Tan Bedsure bolster cat bed on the sofa chaise (for naps and sleep mode)
  - Corrugated cardboard delivery box on the floor ("If it fits, I sits!")
  - Sunny windowsill looking at the sky & clouds ("Cat TV")
- **Interactive Beckoning & Quick Switcher:** Tap any empty spot in the living room or use the spot bar above the dock to call Oli over with spring hop animations.
- **Unique Spot Pet Reactions:** Distinct cozy thoughts when petted in bed, in the box, or on the windowsill.
- **Litter Box Separation & Polish:** Shifted enclosed corner litter box 100% on screen, moved water fountain across the room, and removed the cork coaster.

---

## ⏸️ Parked for Later

Ideas saved for later (growing up from baby to adult, notifications when the app is closed, co-op mode & progression) now live in [IDEAS.md](IDEAS.md).
