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
}

/** Live view computed on the fly by the decay engine. */
export interface LiveCat extends CatStats {
  name: string;
  isSleeping: boolean;
  isCalm: boolean;
  /** True when Oli woke up on his own because his energy reached 100. */
  wokeNaturally: boolean;
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
  | 'grubby';

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

export type MessKind = 'poop' | 'hairball';

export interface RoomMess {
  id: string;
  kind: MessKind;
  /** Which of the 3 floor/rug positions (0, 1, or 2) this mess occupies. */
  slot: 0 | 1 | 2;
  created_at: string;
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
  | 'misting'
  | 'brushing'
  | 'yawning'
  | 'refuse';
