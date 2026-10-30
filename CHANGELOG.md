# Changelog

All notable changes to **Ravioli (Oli the Cat)** are documented here.
Versioning follows `vx.y.z` — every push to `main` increments the version.

---

## `v0.3.0` — 2026-10-30
### Version Numbering & In-App Changelog
- Added `vx.y.z` version tracking across `CHANGELOG.md`, `package.json`, Git tags, and the live app UI.
- Added a tappable **`v0.3.0`** version pill in the top HUD that opens an in-app **What’s New** changelog drawer.
- Retroactively tagged previous pushes (`v0.1.0` and `v0.2.0`).

---

## `v0.2.0` — 2026-10-30
### Elite UX/UI Overhaul
- **Stage Geometry Calibration:** Shifted the Living Room and Sunny Balcony horizon and floor so Oli sits directly on the plush rug and sunbathing cushion, keeping the bubbling stainless steel fountain, lemon tree, sofa, and cat tree in full view above the dock.
- **Zero-Jump Action Dock:** Locked action cards to a fixed height with single-line stat pills and a `😴 Zzz` indicator for sleep-locked actions.
- **Unclipped 5-Stat HUD:** Redesigned each stat meter as a 3-tier vertical micro-card (`Icon + Value`, spring bar, centered label) so labels never truncate on compact phones.
- **Night-Mode Glass Surfaces:** HUD, Activity pill, and Action Dock now transition to a warm dark-slate frosted glass theme while Oli is napping.
- **Petting Speech Bubbles & Scoped Swipes:** Tapping Oli now pops up mood-aware speech bubbles, and horizontal room swipes are scoped strictly to the center stage.

---

## `v0.1.0` — 2026-10-30
### Initial Launch
- **Oli (`<CatAvatar />`):** Custom animated SVG ginger cat with golden eyes, dark chin freckles, `OL1` / `2FX` inner-ear tattoos, breathing, blinking, tail wagging, and loaf sleep pose.
- **Cozy Scenes:** Swipable **Living Room** and **Sunny Balcony** with day and night/sleep atmospheres.
- **Tamagotchi Time Engine:** Serverless timestamp-delta decay and piecewise sleep energy regeneration with 18 unit tests.
- **Care Actions & Co-Op Sync:** Feed, Hydrate, Play, and Comfort actions synced live between **Nico** and **Athina** via Supabase Realtime (with local `BroadcastChannel` fallback) and automated GitHub Pages deployment.
