/**
 * Dual-mode data layer (hardened).
 *
 * - **Supabase mode** (when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set):
 *   Postgres single-row `cat_state` + `activity_log`, live-synced over
 *   Supabase Realtime WebSockets.
 * - **Local mode** (zero config): localStorage persistence + BroadcastChannel
 *   so multiple tabs on the same device sync instantly.
 *
 * Security hardening:
 * - Untrusted remote/persisted rows are strictly sanitized: `name` is pinned to
 *   `'Oli'`, `action_id` is checked against the known action allowlist, and
 *   canonical log messages are reconstructed from `action_id` so direct REST
 *   calls with the public anon key cannot inject phishing links or spoofed text.
 */
import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';
import { actionById, formatLog, PET_ACTION_ID, SLEEP_ACTION_ID } from '../data/actions';
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

/** Strips HTML tags, control chars, angle brackets, quotes, and URLs from user-facing strings. */
export function cleanText(input: string, maxLen: number): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[\u0000-\u001F\u007F<>`"']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeCatState(raw: unknown): CatState {
  const d = createDefaultCatState();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, unknown>;
  return {
    name: 'Oli',
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

/** Canonicalizes activity entries so arbitrary text cannot be injected via the public anon API. */
export function sanitizeActivity(raw: unknown): ActivityEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.id == null || typeof r.player !== 'string' || typeof r.action_id !== 'string') return null;

  const player = cleanText(r.player, 24);
  if (!player) return null;

  const actionId = cleanText(r.action_id, 48);
  const knownAction = actionById(actionId);

  let message: string;
  if (knownAction) {
    message = formatLog(knownAction.log, 'Oli');
  } else if (actionId === PET_ACTION_ID) {
    message = 'Gave Oli chin scratches — purr session!';
  } else if (actionId === SLEEP_ACTION_ID) {
    const rawMsg = typeof r.message === 'string' ? r.message : '';
    message = rawMsg.toLowerCase().includes('woke')
      ? 'Gently woke Oli up from his nap'
      : 'Tucked Oli in for a cozy nap';
  } else {
    // Reject unknown action_ids so external API callers cannot inject custom strings.
    return null;
  }

  return {
    id: cleanText(String(r.id), 64) || uid(),
    player,
    action_id: actionId,
    message,
    device_id: typeof r.device_id === 'string' ? cleanText(r.device_id, 64) : null,
    created_at: isoOr(r.created_at, new Date().toISOString()) ?? new Date().toISOString(),
  };
}

function toRow(state: CatState) {
  return {
    name: 'Oli',
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
    const current = this.readState();
    const next: CatState = sanitizeCatState({ ...mutator(current), version: current.version + 1 });
    safeStorage.set(LS_STATE, JSON.stringify(next));
    this.channel?.postMessage({ type: 'state', state: next } satisfies LocalMessage);

    let entry: ActivityEntry | null = null;
    if (activity) {
      entry = sanitizeActivity({ ...activity, id: uid(), created_at: new Date().toISOString() });
      if (entry) {
        const log = [entry, ...this.readLog()].slice(0, LOCAL_LOG_RETAIN);
        safeStorage.set(LS_LOG, JSON.stringify(log));
        this.channel?.postMessage({ type: 'activity', entry } satisfies LocalMessage);
      }
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
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      throw new Error('VITE_SUPABASE_URL must use https://');
    }
    this.client = createClient(parsed.origin, anonKey, {
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
      const next: CatState = sanitizeCatState({ ...mutator(current), version: current.version + 1 });
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
          const safePayload: NewActivity = {
            player: cleanText(activity.player, 24) || 'Nico',
            action_id: cleanText(activity.action_id, 48),
            message: cleanText(activity.message, 160),
            device_id: activity.device_id ? cleanText(activity.device_id, 64) : null,
          };
          const res = await this.client.from('activity_log').insert(safePayload).select('*').single();
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
  // Single-player local mode (Co-op Supabase sync is parked in ROADMAP.md for a future update).
  const local = new LocalCatStorage();
  const { state, log } = await local.load();
  return { storage: local, state, log, fallbackReason: null };
}
