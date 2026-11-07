/** The five core needs, each 0–100. */
export interface CatStats {
  hunger: number;
  hydration: number;
  happiness: number;
  energy: number;
  hygiene: number;
}

export type StatKey = keyof CatStats;

export const STAT_KEYS: readonly StatKey[] = ['hunger', 'hydration', 'happiness', 'energy', 'hygiene'] as const;

/** Persisted (base) cat state — mirrors the `cat_state` table row. */
export interface CatState extends CatStats {
  name: string;
  is_sleeping: boolean;
  /** ISO timestamp until which Oli is relaxed by the pheromone mist (nullable). */
  calm_until: string | null;
  /** ISO timestamp of the last time stats were materialized. */
  last_updated_at: string;
  /** Monotonic counter for optimistic concurrency (co-op race safety). */
  version: number;
  /** ISO timestamp when the care clock was paused (e.g. flight/vacation mode). Null when ticking normally. */
  paused_at?: string | null;
  /** ISO timestamp when Oli passed away from prolonged neglect (>= 48h at 0 hunger & 0 hydration). Null when alive. */
  deceased_at?: string | null;
  /** Number of lives remaining (out of 9). Defaults to 9. */
  lives_left?: number;
}

/** Live view computed on the fly by the decay engine. */
export interface LiveCat extends CatStats {
  name: string;
  isSleeping: boolean;
  isCalm: boolean;
  /** True when Oli woke up on his own because his energy reached 100. */
  wokeNaturally: boolean;
  isPaused: boolean;
  isDeceased: boolean;
  livesLeft: number;
}

export type Mood =
  | 'sleeping'
  | 'relaxed'
  | 'ecstatic'
  | 'happy'
  | 'content'
  | 'hungry'
  | 'thirsty'
  | 'tired'
  | 'sad'
  | 'grubby'
  | 'deceased';

export interface ActivityEntry {
  id: string;
  player: string;
  action_id: string;
  message: string;
  /** Random per-device/tab id so clients can tell their own echoes from partner actions. */
  device_id: string | null;
  created_at: string;
}

export type NewActivity = Omit<ActivityEntry, 'id' | 'created_at'>;

export type SyncMode = 'supabase' | 'local';
export type SyncStatus = 'connecting' | 'live' | 'local' | 'offline' | 'error';

export type MessKind = 'fur_clump' | 'vomit';

/** Cozy lounging spots around Nico & Athina's living room. */
export type CatSpot = 'rug' | 'sofa_bed' | 'box' | 'window';

export interface RoomMess {
  id: string;
  kind: MessKind;
  /** Which of the 3 floor/rug positions (0, 1, or 2) this mess occupies. */
  slot: 0 | 1 | 2;
  created_at: string;
}

/** Attention call ("Meow!" whim/craving) for a specific care action. */
export interface CatWhim {
  id: string;
  actionId: string;
  label: string;
  emoji: string;
  expiresAt: number;
}

/** Transient, purely visual animation the cat should play. */
export type CatAnimation =
  | 'idle'
  | 'eating'
  | 'eating_egg'
  | 'treat'
  | 'churu'
  | 'drinking'
  | 'purring'
  | 'playing'
  | 'laser'
  | 'tail_chase'
  | 'red_ball'
  | 'misting'
  | 'brushing'
  | 'yawning'
  | 'refuse';
