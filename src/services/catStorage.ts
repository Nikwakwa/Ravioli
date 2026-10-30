/**
 * Dual-mode data layer.
 *
 * - **Supabase mode** (when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set):
 *   Postgres single-row `cat_state` + `activity_log`, live-synced over
 *   Supabase Realtime WebSockets.
 * - **Local mode** (zero config): localStorage persistence + BroadcastChannel
 *   so multiple tabs on the same device sync instantly — perfect for testing
 *   co-op from minute one.
 *
 * If Supabase is configured but unreachable / not yet migrated, we gracefully
 * fall back to local mode instead of crashing.
 */
import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';
import type { ActivityEntry, CatState, NewActivity, SyncMode, SyncStatus } from '../types';
import { clampStat, createDefaultCatState } from '../utils/decayEngine';

export const ACTIVITY_LIMIT = 10;

export interface StorageListeners {
  onState?: (state: CatState) => void;
  onActivity?: (entry: ActivityEntry) => void;
  onStatus?: (status: SyncStatus) => void;
}

export type CatMutator = (base: CatState) => CatState;

export interface CommitResult {
  state: CatState;
  entry: ActivityEntry | null;
}

export interface CatStorage {
  readonly mode: SyncMode;
  load(): Promise<{ state: CatState; log: ActivityEntry[] }>;
  /** Re-reads the authoritative state (e.g. after the app returns to foreground). */
  refresh(): Promise<CatState | null>;
  /**
   * Applies `mutator` to the freshest base state and persists it.
   * The mutator may be called more than once (conflict retries), so it must be pure.
   */
  commit(mutator: CatMutator, activity: NewActivity | null): Promise<CommitResult>;
  subscribe(listeners: StorageListeners): () => void;
}

// -----------------------------------------------------------------------------
// Sanitizers — never trust persisted / remote data blindly.
// -----------------------------------------------------------------------------

function num(value: unknown, fallback: number): number {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
}

function isoOr(value: unknown, fallback: string | null): string | null {
  if (typeof value !== 'string') return fallback;
  return Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : fallback;
}

export function sanitizeCatState(raw: unknown): CatState {
  const d = createDefaultCatState();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, unknown>;
  return {
    name: typeof r.name === 'string' && r.name.trim() ? r.name.slice(0, 24) : d.name,
    hunger: clampStat(num(r.hunger, d.hunger)),
    hydration: clampStat(num(r.hydration, d.hydration)),
    happiness: clampStat(num(r.happiness, d.happiness)),
    energy: clampStat(num(r.energy, d.energy)),
    hygiene: clampStat(num(r.hygiene, d.hygiene)),
    is_sleeping: r.is_sleeping === true,
    calm_until: isoOr(r.calm_until, null),
    last_updated_at: isoOr(r.last_updated_at, d.last_updated_at) ?? d.last_updated_at,
    version: Math.max(0, Math.floor(num(r.version, 0))),
  };
}

export function sanitizeActivity(raw: unknown): ActivityEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.id == null || typeof r.player !== 'string' || typeof r.message !== 'string') return null;
  return {
    id: String(r.id),
    player: r.player.slice(0, 24),
    action_id: typeof r.action_id === 'string' ? r.action_id : 'unknown',
    message: r.message.slice(0, 160),
    device_id: typeof r.device_id === 'string' ? r.device_id.slice(0, 64) : null,
    created_at: isoOr(r.created_at, new Date().toISOString()) ?? new Date().toISOString(),
  };
}

function toRow(state: CatState) {
  return {
    name: state.name,
    hunger: state.hunger,
    hydration: state.hydration,
    happiness: state.happiness,
    energy: state.energy,
    hygiene: state.hygiene,
    is_sleeping: state.is_sleeping,
    calm_until: state.calm_until,
    last_updated_at: state.last_updated_at,
    version: state.version,
  };
}

function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// -----------------------------------------------------------------------------
// Local mode: localStorage + BroadcastChannel
// -----------------------------------------------------------------------------

const LS_STATE = 'ravioli:v1:cat_state';
const LS_LOG = 'ravioli:v1:activity_log';
const CHANNEL = 'ravioli-sync';
const LOCAL_LOG_RETAIN = 50;

type LocalMessage = { type: 'state'; state: CatState } | { type: 'activity'; entry: ActivityEntry };

/** In-memory shim for browsers where localStorage throws (private mode, quota…). */
const memoryStore = new Map<string, string>();
const safeStorage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryStore.set(key, value);
    }
  },
};

function readJson(key: string): unknown {
  try {
    const raw = safeStorage.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export class LocalCatStorage implements CatStorage {
  readonly mode: SyncMode = 'local';
  private channel: BroadcastChannel | null = null;
  private listeners = new Set<StorageListeners>();

  constructor() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel(CHANNEL);
        this.channel.onmessage = (ev: MessageEvent<LocalMessage>) => this.dispatch(ev.data);
      }
    } catch {
      this.channel = null;
    }
    // Fallback cross-tab sync for browsers without BroadcastChannel.
    window.addEventListener('storage', (ev) => {
      if (this.channel) return;
      if (ev.key === LS_STATE && ev.newValue) {
        this.dispatch({ type: 'state', state: sanitizeCatState(readJson(LS_STATE)) });
      }
    });
  }

  private dispatch(msg: LocalMessage) {
    if (!msg || typeof msg !== 'object') return;
    for (const l of this.listeners) {
      if (msg.type === 'state') l.onState?.(sanitizeCatState(msg.state));
      if (msg.type === 'activity') {
        const entry = sanitizeActivity(msg.entry);
        if (entry) l.onActivity?.(entry);
      }
    }
  }

  private readState(): CatState {
    const raw = readJson(LS_STATE);
    if (!raw) {
      const fresh = createDefaultCatState();
      safeStorage.set(LS_STATE, JSON.stringify(fresh));
      return fresh;
    }
    return sanitizeCatState(raw);
  }

  private readLog(): ActivityEntry[] {
    const raw = readJson(LS_LOG);
    if (!Array.isArray(raw)) return [];
    return raw.map(sanitizeActivity).filter((e): e is ActivityEntry => e !== null);
  }

  async load() {
    return { state: this.readState(), log: this.readLog().slice(0, ACTIVITY_LIMIT) };
  }

  async refresh() {
    return this.readState();
  }

  async commit(mutator: CatMutator, activity: NewActivity | null): Promise<CommitResult> {
    // Same-device writes are effectively serialized by the JS event loop.
    const current = this.readState();
    const next: CatState = { ...mutator(current), version: current.version + 1 };
    safeStorage.set(LS_STATE, JSON.stringify(next));
    this.channel?.postMessage({ type: 'state', state: next } satisfies LocalMessage);

    let entry: ActivityEntry | null = null;
    if (activity) {
      entry = { ...activity, id: uid(), created_at: new Date().toISOString() };
      const log = [entry, ...this.readLog()].slice(0, LOCAL_LOG_RETAIN);
      safeStorage.set(LS_LOG, JSON.stringify(log));
      this.channel?.postMessage({ type: 'activity', entry } satisfies LocalMessage);
    }
    return { state: next, entry };
  }

  subscribe(listeners: StorageListeners) {
    this.listeners.add(listeners);
    listeners.onStatus?.('local');
    return () => {
      this.listeners.delete(listeners);
    };
  }
}

// -----------------------------------------------------------------------------
// Supabase mode: Postgres + Realtime WebSockets
// -----------------------------------------------------------------------------

const MAX_COMMIT_ATTEMPTS = 4;

export class SupabaseCatStorage implements CatStorage {
  readonly mode: SyncMode = 'supabase';
  private client: SupabaseClient;
  private cached: CatState | null = null;

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }

  private async fetchState(): Promise<CatState> {
    const { data, error } = await this.client.from('cat_state').select('*').eq('id', 1).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('cat_state row missing — run supabase/schema.sql in your project.');
    this.cached = sanitizeCatState(data);
    return this.cached;
  }

  async load() {
    const [state, logRes] = await Promise.all([
      this.fetchState(),
      this.client.from('activity_log').select('*').order('created_at', { ascending: false }).limit(ACTIVITY_LIMIT),
    ]);
    if (logRes.error) throw logRes.error;
    const log = (logRes.data ?? []).map(sanitizeActivity).filter((e): e is ActivityEntry => e !== null);
    return { state, log };
  }

  async refresh() {
    try {
      return await this.fetchState();
    } catch (err) {
      console.warn('[catStorage] refresh failed', err);
      return null;
    }
  }

  async commit(mutator: CatMutator, activity: NewActivity | null): Promise<CommitResult> {
    let current = this.cached ?? (await this.fetchState());

    for (let attempt = 0; attempt < MAX_COMMIT_ATTEMPTS; attempt++) {
      const next: CatState = { ...mutator(current), version: current.version + 1 };
      const { data, error } = await this.client
        .from('cat_state')
        .update(toRow(next))
        .eq('id', 1)
        .eq('version', current.version)
        .select('*')
        .maybeSingle();
      if (error) throw error;

      if (data) {
        this.cached = sanitizeCatState(data);
        let entry: ActivityEntry | null = null;
        if (activity) {
          const res = await this.client.from('activity_log').insert(activity).select('*').single();
          if (res.error) console.warn('[catStorage] activity insert failed', res.error);
          else entry = sanitizeActivity(res.data);
        }
        return { state: this.cached, entry };
      }

      // Version conflict: the other phone wrote first. Refetch and re-apply.
      current = await this.fetchState();
    }
    throw new Error('Could not save — Oli is very popular right now. Please try again.');
  }

  subscribe(listeners: StorageListeners) {
    listeners.onStatus?.('connecting');
    const channel: RealtimeChannel = this.client
      .channel('oli-room')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cat_state' }, (payload) => {
        const state = sanitizeCatState(payload.new);
        if (!this.cached || state.version >= this.cached.version) this.cached = state;
        listeners.onState?.(state);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, (payload) => {
        const entry = sanitizeActivity(payload.new);
        if (entry) listeners.onActivity?.(entry);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') listeners.onStatus?.('live');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') listeners.onStatus?.('offline');
        else if (status === 'CLOSED') listeners.onStatus?.('offline');
      });

    const onOffline = () => listeners.onStatus?.('offline');
    const onOnline = () => listeners.onStatus?.('connecting');
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      void this.client.removeChannel(channel);
    };
  }
}

// -----------------------------------------------------------------------------
// Factory
// -----------------------------------------------------------------------------

export interface StorageBootstrap {
  storage: CatStorage;
  state: CatState;
  log: ActivityEntry[];
  /** Set when Supabase was configured but we had to fall back to local mode. */
  fallbackReason: string | null;
}

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && key);
}

export async function initCatStorage(): Promise<StorageBootstrap> {
  if (isSupabaseConfigured()) {
    try {
      const remote = new SupabaseCatStorage(
        import.meta.env.VITE_SUPABASE_URL!.trim(),
        import.meta.env.VITE_SUPABASE_ANON_KEY!.trim(),
      );
      const { state, log } = await remote.load();
      return { storage: remote, state, log, fallbackReason: null };
    } catch (err) {
      console.warn('[catStorage] Supabase unavailable, falling back to local mode.', err);
      const local = new LocalCatStorage();
      const { state, log } = await local.load();
      const reason = err instanceof Error ? err.message : 'Supabase unavailable';
      return { storage: local, state, log, fallbackReason: reason };
    }
  }

  const local = new LocalCatStorage();
  const { state, log } = await local.load();
  return { storage: local, state, log, fallbackReason: null };
}
