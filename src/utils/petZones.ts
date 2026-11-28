import type { ParticleKind } from '../data/actions';
import type { CatAnimation, CatSpot, PetZone } from '../types';
import type { SoundName } from './sound';

export type CatPoseKind = 'sit' | 'loaf' | 'look_out' | 'belly_up';

export interface PetZoneMeta {
  id: PetZone;
  label: string;
  animation: CatAnimation;
  sound: SoundName;
  particles: ParticleKind[];
  haptic: number | number[];
  durationMs: number;
  /** Whether this petting spot grants Oli's 5-minute relaxed calm mood. */
  grantsCalm: boolean;
  lines: readonly string[];
  logPhrase: (catName: string) => string;
}

export const PET_ZONE_META: Record<PetZone, PetZoneMeta> = {
  chin: {
    id: 'chin',
    label: 'Chin Scratches',
    animation: 'purring',
    sound: 'purr',
    particles: ['purr', 'hearts'],
    haptic: [25, 25, 35, 25, 25],
    durationMs: 2200,
    grantsCalm: true,
    lines: [
      'Prrrr… right under the chin~ 🧡',
      'Loud motorboat purrs! ✨',
      'Eyes squinted in pure bliss~ 😌',
      'Never stop the chin rubs! 🐾',
    ],
    logPhrase: (cat) => `Gave ${cat} chin scratches — purr session!`,
  },
  nose: {
    id: 'nose',
    label: 'Nose Boop',
    animation: 'nose_boop',
    sound: 'sneeze',
    particles: ['sparkles'],
    haptic: [15, 35, 15],
    durationMs: 1500,
    grantsCalm: false,
    lines: [
      '*Boop!* Cute tiny sneeze! 🤧',
      '*Pff-choo!* Tickled my whiskers! ✨',
      'Blink blink… boop accepted! 🐾',
      'Hey! That’s my pink nose! 🧡',
    ],
    logPhrase: (cat) => `Booped ${cat}’s little pink nose!`,
  },
  back: {
    id: 'back',
    label: 'Back Strokes',
    animation: 'back_stretch',
    sound: 'chirp',
    particles: ['sparkles', 'purr'],
    haptic: [20, 45, 25],
    durationMs: 2000,
    grantsCalm: false,
    lines: [
      'Biiiig cozy stretch! ✨',
      'Tail straight up! Happy cat! 🧡',
      'Ooh, right along the back~ 😺',
      'Stretching all the way to my toes! 🐾',
    ],
    logPhrase: (cat) => `Stroked ${cat}’s back for a big cozy stretch!`,
  },
  belly: {
    id: 'belly',
    label: 'Belly Rubs',
    animation: 'belly_trap',
    sound: 'play_swat',
    particles: ['stars'],
    haptic: [18, 25, 18, 25, 30],
    durationMs: 1800,
    grantsCalm: false,
    lines: [
      'It’s a trap! Playful paw grab! 😼🐾',
      'Touch the floof, get the paws! ⚡',
      'Playful bunny kicks activated! 🐾',
      'Tummy trap sprung! Hehe~ 🧡',
    ],
    logPhrase: (cat) => `Rubbed ${cat}’s belly — playful paw trap!`,
  },
};

/**
 * Maps a pointer coordinate in CatAvatar's 200×220 SVG viewBox to one of the
 * four interactive petting spots, adapted for Oli's current pose.
 */
export function resolvePetZone(svgX: number, svgY: number, pose: CatPoseKind = 'sit'): PetZone {
  const x = Number.isFinite(svgX) ? svgX : 100;
  const y = Number.isFinite(svgY) ? svgY : 110;

  if (pose === 'look_out') {
    // Facing away from camera: upper area is head/ears (peeks back for chin rubs), lower is his back.
    return y < 105 ? 'chin' : 'back';
  }

  if (pose === 'belly_up') {
    // Head sits on the left (~x: 18..82, y: 120..186), cream belly stretches across x: 82..166.
    if (x < 82) {
      if (x >= 34 && x <= 64 && y >= 140 && y <= 168) {
        return 'nose';
      }
      return 'chin';
    }
    if (y <= 194 && x <= 168) {
      return 'belly';
    }
    return 'back';
  }

  if (pose === 'loaf') {
    // Curled loaf: face is slightly lower-center (y ~ 115..185), curved back is above/sides.
    if (x >= 76 && x <= 118 && y >= 134 && y <= 162) {
      return 'nose';
    }
    if (x >= 56 && x <= 136 && y > 162 && y <= 196) {
      return 'chin';
    }
    return 'back';
  }

  // Default 'sit' pose:
  // Pink nose sits at (100, 95) inside the head (y: 30..124).
  if (x >= 78 && x <= 122 && y >= 74 && y <= 104) {
    return 'nose';
  }
  // Under-chin, cheeks & neck ruff.
  if (y > 104 && y <= 136) {
    return 'chin';
  }
  if (y >= 74 && y <= 104) {
    return 'chin';
  }
  // Top of head / ears / upper shoulders and outer flanks feel natural for back strokes.
  if (y < 74) {
    return 'back';
  }
  // Center lower cream bib/tummy between front legs = belly trap; outer orange flanks = back.
  if (x >= 68 && x <= 132) {
    return 'belly';
  }
  return 'back';
}

/** Sensible default petting zone when triggered via keyboard or outer spot container. */
export function defaultPetZoneForSpot(spot: CatSpot): PetZone {
  if (spot === 'balcony_floor') return 'belly';
  if (spot === 'planter') return 'back';
  return 'chin';
}

/** Returns a cute reaction line for a given petting spot. */
export function pickPetZoneLine(zone: PetZone, tapIndex: number): string {
  const lines = PET_ZONE_META[zone].lines;
  return lines[Math.abs(Math.floor(tapIndex)) % lines.length];
}
