import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initCatStorage, ACTIVITY_LIMIT, type CatStorage, type StorageBootstrap } from '../services/catStorage';
import type {
  ActivityEntry,
  CatAnimation,
  CatSpot,
  CatState,
  CatStats,
  CatWhim,
  LiveCat,
  MessKind,
  Mood,
  RoomMess,
  SceneId,
  SyncMode,
  SyncStatus,
} from '../types';
import { isBalconySpot, sceneForSpot } from '../types';
import {
  applyEffect,
  computeLiveStats,
  deriveMood,
  hoursUntilNaturalWake,
  isThriving,
  materialize,
  MAX_LIVES,
  nextNeed,
} from '../utils/decayEngine';
import {
  actionById,
  AUTO_NAP_ENERGY,
  computeMinigameReward,
  DEFAULT_CHURU_STASH,
  formatLog,
  MAX_CHURU_STASH,
  MAX_ROOM_MESSES,
  MAX_SLEEP_ENERGY,
  MAX_TREATS_IN_WINDOW,
  MESS_SPAWN_HOURS,
  MINIGAME_ROUNDS,
  MIN_WAKE_ENERGY,
  PAUSE_ACTION_ID,
  PET_ACTION_ID,
  PET_COOLDOWN_MS,
  PET_JOY_BOOST,
  pickCandidateWhim,
  REVIVE_ACTION_ID,
  SLEEP_ACTION_ID,
  TREAT_WINDOW_MS,
  TUMMY_ACHE_MS,
  WHIM_COOLDOWN_MS,
  WHIM_DURATION_MS,
  type CareAction,
  type ParticleKind,
} from '../data/actions';
import { celebrate, vibrate } from '../utils/feedback';
import {
  evaluateStatThresholds,
  loadAlertedMap,
  loadNotificationPrefs,
  saveAlertedMap,
  sendSystemNotification,
  type AlertedMap,
} from '../utils/notifications';
import { DEVICE_ID } from '../utils/player';

const TICK_MS = 30_000;
const REMOTE_EVENT_MAX_AGE_MS = 90_000;
const MS_PER_HOUR = 3_600_000;

const LS_TREATS = 'ravioli:v1:recent_treats';
const LS_TUMMY_ACHE = 'ravioli:v1:tummy_ache_until';
const LS_MESSES = 'ravioli:v1:room_messes';
const LS_LAST_MESS_AT = 'ravioli:v1:last_mess_at';
const LS_LITTER_DIRTY = 'ravioli:v1:litter_box_dirty';
const LS_LAST_LITTER_AT = 'ravioli:v1:last_litter_at';
const LS_MEAL_COUNT = 'ravioli:v1:meal_count';
const LS_CHURU_STASH = 'ravioli:v1:churu_stash';
const LS_ACTIVE_WHIM = 'ravioli:v1:active_whim';
const LS_LAST_WHIM_AT = 'ravioli:v1:last_whim_at';
const LS_SPOT = 'ravioli:v1:cat_spot';
const LS_LAST_ROAM_AT = 'ravioli:v1:last_roam_at';

const VALID_SPOTS: readonly CatSpot[] = [
  'rug',
  'sofa_bed',
  'box',
  'window',
  'planter',
  'bistro_chair',
  'balcony_floor',
];

function loadCatSpot(): CatSpot {
  try {
    const raw = localStorage.getItem(LS_SPOT);
    if (raw && (VALID_SPOTS as readonly string[]).includes(raw)) {
      return raw as CatSpot;
    }
  } catch {
    // ignore
  }
  return 'rug';
}

function saveCatSpot(spot: CatSpot): void {
  try {
    localStorage.setItem(LS_SPOT, spot);
  } catch {
    // ignore
  }
}

function loadLastRoamAt(): number {
  try {
    const raw = localStorage.getItem(LS_LAST_ROAM_AT);
    if (raw) {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {
    // ignore
  }
  return Date.now();
}

function saveLastRoamAt(timestamp: number): void {
  try {
    localStorage.setItem(LS_LAST_ROAM_AT, String(timestamp));
  } catch {
    // ignore
  }
}

export interface GameEvent {
  key: number;
  actionId: string;
  player: string;
  remote: boolean;
  effect: Partial<CatStats>;
  particles: ParticleKind[];
  animation: CatAnimation;
  durationMs: number;
}

export interface Notice {
  id: number;
  text: string;
  tone: 'info' | 'partner' | 'warn';
  player?: string;
}

let bootPromise: Promise<StorageBootstrap> | null = null;
const bootOnce = () => (bootPromise ??= initCatStorage());

let eventSeq = 0;

function sortLog(entries: ActivityEntry[]): ActivityEntry[] {
  return [...entries].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, ACTIVITY_LIMIT);
}

export function pickFreeMessSlot(existing: RoomMess[]): 0 | 1 | 2 | null {
  if (existing.length >= MAX_ROOM_MESSES) return null;
  const used = new Set(existing.map((m) => m.slot));
  for (const s of [0, 1, 2] as const) {
    if (!used.has(s)) return s;
  }
  return null;
}

function loadLitterBoxDirty(): boolean {
  try {
    return window.localStorage.getItem(LS_LITTER_DIRTY) === 'true';
  } catch {
    return false;
  }
}

function saveLitterBoxDirty(dirty: boolean) {
  try {
    if (dirty) window.localStorage.setItem(LS_LITTER_DIRTY, 'true');
    else window.localStorage.removeItem(LS_LITTER_DIRTY);
  } catch {
    // ignore
  }
}

function loadLastLitterAt(fallbackMs: number): number {
  try {
    const raw = window.localStorage.getItem(LS_LAST_LITTER_AT);
    const n = raw ? Number(raw) : NaN;
    if (Number.isFinite(n) && n > 0) return n;
    window.localStorage.setItem(LS_LAST_LITTER_AT, String(fallbackMs));
    return fallbackMs;
  } catch {
    return fallbackMs;
  }
}

function saveLastLitterAt(ms: number) {
  try {
    window.localStorage.setItem(LS_LAST_LITTER_AT, String(ms));
  } catch {
    // ignore
  }
}

function loadMesses(): RoomMess[] {
  try {
    const raw = window.localStorage.getItem(LS_MESSES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((m) => {
        if (!m) return null;
        if (m.kind === 'hairball') return { ...m, kind: 'vomit' };
        if (m.kind === 'poop') return { ...m, kind: 'fur_clump' };
        return m;
      })
      .filter(
        (m): m is RoomMess =>
          m &&
          typeof m.id === 'string' &&
          (m.kind === 'fur_clump' || m.kind === 'vomit') &&
          (m.slot === 0 || m.slot === 1 || m.slot === 2),
      )
      .slice(0, MAX_ROOM_MESSES);
  } catch {
    return [];
  }
}

function saveMesses(messes: RoomMess[]) {
  try {
    window.localStorage.setItem(LS_MESSES, JSON.stringify(messes.slice(0, MAX_ROOM_MESSES)));
  } catch {
    // ignore
  }
}

function loadLastMessAt(fallbackMs: number): number {
  try {
    const raw = window.localStorage.getItem(LS_LAST_MESS_AT);
    const n = raw ? Number(raw) : NaN;
    if (Number.isFinite(n) && n > 0) return n;
    window.localStorage.setItem(LS_LAST_MESS_AT, String(fallbackMs));
    return fallbackMs;
  } catch {
    return fallbackMs;
  }
}

function saveLastMessAt(ms: number) {
  try {
    window.localStorage.setItem(LS_LAST_MESS_AT, String(ms));
  } catch {
    // ignore
  }
}

function incrementCounter(key: string): number {
  try {
    const raw = window.localStorage.getItem(key);
    const next = (raw ? Number(raw) || 0 : 0) + 1;
    window.localStorage.setItem(key, String(next));
    return next;
  } catch {
    return 1;
  }
}

function loadChuruStash(): number {
  try {
    const raw = window.localStorage.getItem(LS_CHURU_STASH);
    if (raw === null) return DEFAULT_CHURU_STASH;
    const n = Math.floor(Number(raw));
    if (!Number.isFinite(n)) return DEFAULT_CHURU_STASH;
    return Math.max(0, Math.min(MAX_CHURU_STASH, n));
  } catch {
    return DEFAULT_CHURU_STASH;
  }
}

function saveChuruStash(count: number) {
  try {
    window.localStorage.setItem(LS_CHURU_STASH, String(Math.max(0, Math.min(MAX_CHURU_STASH, count))));
  } catch {
    // ignore
  }
}

function loadActiveWhim(): CatWhim | null {
  try {
    const raw = window.localStorage.getItem(LS_ACTIVE_WHIM);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<CatWhim>;
    if (
      p &&
      typeof p.id === 'string' &&
      typeof p.actionId === 'string' &&
      typeof p.label === 'string' &&
      typeof p.emoji === 'string' &&
      typeof p.expiresAt === 'number'
    ) {
      return p as CatWhim;
    }
    return null;
  } catch {
    return null;
  }
}

function saveActiveWhim(whim: CatWhim | null) {
  try {
    if (whim) window.localStorage.setItem(LS_ACTIVE_WHIM, JSON.stringify(whim));
    else window.localStorage.removeItem(LS_ACTIVE_WHIM);
  } catch {
    // ignore
  }
}

function loadLastWhimAt(): number {
  try {
    const raw = window.localStorage.getItem(LS_LAST_WHIM_AT);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function saveLastWhimAt(ms: number) {
  try {
    window.localStorage.setItem(LS_LAST_WHIM_AT, String(ms));
  } catch {
    // ignore
  }
}

function loadRecentTreats(nowMs: number): number[] {
  try {
    const raw = window.localStorage.getItem(LS_TREATS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is number => typeof t === 'number' && nowMs - t < TREAT_WINDOW_MS);
  } catch {
    return [];
  }
}

function saveRecentTreats(treats: number[]) {
  try {
    window.localStorage.setItem(LS_TREATS, JSON.stringify(treats));
  } catch {
    // ignore
  }
}

function loadTummyAcheUntil(): number {
  try {
    const raw = window.localStorage.getItem(LS_TUMMY_ACHE);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function saveTummyAcheUntil(untilMs: number) {
  try {
    if (untilMs > 0) window.localStorage.setItem(LS_TUMMY_ACHE, String(untilMs));
    else window.localStorage.removeItem(LS_TUMMY_ACHE);
  } catch {
    // ignore
  }
}

export function useCatGame(player: string | null, onNotice: (n: Omit<Notice, 'id'>) => void) {
  const storageRef = useRef<CatStorage | null>(null);
  const noticeRef = useRef(onNotice);
  noticeRef.current = onNotice;

  const [ready, setReady] = useState(false);
  const [base, setBase] = useState<CatState | null>(null);
  const [log, setLog] = useState<ActivityEntry[]>([]);
  const [mode, setMode] = useState<SyncMode>('local');
  const [status, setStatus] = useState<SyncStatus>('connecting');
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [tummyAcheUntil, setTummyAcheUntil] = useState<number>(() => loadTummyAcheUntil());
  const [messes, setMesses] = useState<RoomMess[]>(() => loadMesses());
  const [litterBoxDirty, setLitterBoxDirty] = useState<boolean>(() => loadLitterBoxDirty());
  const [churuStash, setChuruStash] = useState<number>(() => loadChuruStash());
  const [whim, setWhim] = useState<CatWhim | null>(() => loadActiveWhim());
  const [activeMinigame, setActiveMinigame] = useState<CareAction | null>(null);
  const [spot, setSpotState] = useState<CatSpot>(() => loadCatSpot());
  const busyTimer = useRef<number | undefined>(undefined);
  const lastPetRef = useRef<number>(0);

  useEffect(() => {
    return () => window.clearTimeout(busyTimer.current);
  }, []);

  const tummyAche = tummyAcheUntil > now;

  const dirtyLitterBox = useCallback((announce?: string) => {
    setLitterBoxDirty(true);
    saveLitterBoxDirty(true);
    saveLastLitterAt(Date.now());
    if (announce) {
      noticeRef.current({ text: announce, tone: 'warn' });
      vibrate([25, 45, 25]);
    }
  }, []);

  const updateChuruStash = useCallback((updater: (prev: number) => number): number => {
    let nextVal = DEFAULT_CHURU_STASH;
    setChuruStash((prev) => {
      nextVal = Math.max(0, Math.min(MAX_CHURU_STASH, updater(prev)));
      saveChuruStash(nextVal);
      return nextVal;
    });
    return nextVal;
  }, []);

  const clearWhim = useCallback(() => {
    setWhim(null);
    saveActiveWhim(null);
    saveLastWhimAt(Date.now());
  }, []);

  const clearTummyAche = useCallback(() => {
    setTummyAcheUntil(0);
    saveTummyAcheUntil(0);
    saveRecentTreats([]);
  }, []);

  const spawnMess = useCallback((kind: MessKind, announce?: string): boolean => {
    let spawned = false;
    setMesses((prev) => {
      const slot = pickFreeMessSlot(prev);
      if (slot === null) return prev;
      spawned = true;
      const next: RoomMess[] = [
        ...prev,
        {
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          kind,
          slot,
          created_at: new Date().toISOString(),
        },
      ];
      saveMesses(next);
      saveLastMessAt(Date.now());
      return next;
    });
    if (spawned && announce) {
      noticeRef.current({ text: announce, tone: 'warn' });
      vibrate([25, 45, 25]);
    }
    return spawned;
  }, []);

  /** Accept a state only if it is not older than what we already have. */
  const acceptState = useCallback((incoming: CatState) => {
    setBase((prev) => (!prev || incoming.version >= prev.version ? incoming : prev));
    setNow(Date.now());
  }, []);

  const addEntry = useCallback((entry: ActivityEntry) => {
    setLog((prev) => (prev.some((e) => e.id === entry.id) ? prev : sortLog([entry, ...prev])));
  }, []);

  const playEvent = useCallback((ev: Omit<GameEvent, 'key'>) => {
    setEvent({ ...ev, key: ++eventSeq });
  }, []);

  const triggerRefusal = useCallback(
    (message: string) => {
      noticeRef.current({ text: message, tone: 'warn' });
      vibrate([20, 40, 20]);
      playEvent({
        actionId: 'refuse',
        player: player ?? 'You',
        remote: false,
        effect: {},
        particles: [],
        animation: 'refuse',
        durationMs: 1400,
      });
    },
    [player, playEvent],
  );

  // ---------------------------------------------------------------------------
  // Boot + realtime subscription
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    bootOnce()
      .then((boot) => {
        if (cancelled) return;
        storageRef.current = boot.storage;
        setMode(boot.storage.mode);
        setFallbackReason(boot.fallbackReason);
        setBase(boot.state);
        setLog(sortLog(boot.log));
        setNow(Date.now());
        setReady(true);

        unsubscribe = boot.storage.subscribe({
          onStatus: setStatus,
          onState: acceptState,
          onActivity: (entry) => {
            addEntry(entry);
            if (entry.device_id === DEVICE_ID) return;
            if (Date.now() - Date.parse(entry.created_at) > REMOTE_EVENT_MAX_AGE_MS) return;

            const action = actionById(entry.action_id);
            if (action) {
              playEvent({
                actionId: action.id,
                player: entry.player,
                remote: true,
                effect: action.effect,
                particles: action.particles,
                animation: action.animation,
                durationMs: action.durationMs,
              });
              vibrate(30);
            } else if (entry.action_id === SLEEP_ACTION_ID) {
              playEvent({
                actionId: SLEEP_ACTION_ID,
                player: entry.player,
                remote: true,
                effect: {},
                particles: [],
                animation: 'yawning',
                durationMs: 1600,
              });
            }
          },
        });
      })
      .catch((err) => {
        console.error('[useCatGame] boot failed', err);
        noticeRef.current({ text: 'Could not load Oli. Please reload the app.', tone: 'warn' });
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [acceptState, addEntry, playEvent]);

  // ---------------------------------------------------------------------------
  // Pet care clock: 30 s tick + foreground refresh
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    const onForeground = () => {
      if (document.visibilityState !== 'visible') return;
      setNow(Date.now());
      void storageRef.current?.refresh().then((s) => s && acceptState(s));
    };
    document.addEventListener('visibilitychange', onForeground);
    window.addEventListener('focus', onForeground);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onForeground);
      window.removeEventListener('focus', onForeground);
    };
  }, [acceptState]);

  const live: LiveCat | null = useMemo(() => (base ? computeLiveStats(base, now) : null), [base, now]);

  const scene: SceneId = useMemo(() => sceneForSpot(spot), [spot]);

  const setSpot = useCallback(
    (target: CatSpot, silent = false) => {
      if (live?.isSleeping && target !== 'sofa_bed') {
        if (!silent) {
          vibrate(15);
          noticeRef.current({ text: `😴 Shh… ${live.name} is sleeping on the sofa.`, tone: 'info' });
        }
        return;
      }
      setSpotState(target);
      saveCatSpot(target);
      saveLastRoamAt(Date.now());
      if (!silent) {
        vibrate(20);
        const lines: Record<CatSpot, string> = {
          sofa_bed: '🛋️ Curled up on the sofa bed',
          box: '📦 Hopped into his delivery box',
          window: '🪟 Watching birds on the windowsill',
          rug: '🐾 Back on the living room rug',
          planter: '🌼 Sniffing the pansies & watching the street',
          bistro_chair: '🪑 Perched on the balcony bistro chair',
          balcony_floor: '☀️ Stretching out on the sunny balcony tiles',
        };
        noticeRef.current({ text: lines[target], tone: 'info' });
      }
    },
    [live],
  );

  const setScene = useCallback(
    (targetScene: SceneId) => {
      if (targetScene === scene) return;
      if (targetScene === 'balcony') {
        if (live?.isSleeping) {
          vibrate(15);
          noticeRef.current({ text: `😴 Shh… ${live.name} is sleeping on the sofa inside.`, tone: 'info' });
          return;
        }
        setSpot('planter');
      } else {
        setSpot(live?.isSleeping ? 'sofa_bed' : 'rug');
      }
    },
    [scene, live, setSpot],
  );

  // Keep Oli in his Bedsure bolster bed on the sofa while sleeping
  useEffect(() => {
    if (live?.isSleeping && spot !== 'sofa_bed') {
      setSpotState('sofa_bed');
      saveCatSpot('sofa_bed');
    }
  }, [live?.isSleeping, spot]);

  // Spontaneous roaming when awake & idle (every ~15 minutes) across Living Room & Balcony
  useEffect(() => {
    if (!live || live.isSleeping || live.isDeceased || live.isPaused || busy) return;
    const lastRoam = loadLastRoamAt();
    const elapsed = now - lastRoam;
    if (elapsed > 15 * 60_000) {
      saveLastRoamAt(now);
      const nextSpot = VALID_SPOTS[Math.floor(Math.random() * VALID_SPOTS.length)];
      if (nextSpot !== spot) {
        setSpotState(nextSpot);
        saveCatSpot(nextSpot);
      }
    }
  }, [now, live, busy, spot]);

  // Derive mood with tummy-ache, room-mess, litter box & deceased overrides (messes block 'ecstatic'!)
  const mood: Mood = useMemo(() => {
    if (!live) return 'content';
    if (live.isDeceased) return 'deceased';
    if (live.isSleeping) return 'sleeping';
    if (tummyAche) return 'sad';
    if (messes.length >= 2 || (litterBoxDirty && messes.length >= 1)) return 'grubby';
    const raw = deriveMood(live);
    if ((messes.length > 0 || litterBoxDirty) && raw === 'ecstatic') return 'happy';
    return raw;
  }, [live, tummyAche, messes.length, litterBoxDirty]);

  // Schedule an exact timer for the next low-need threshold crossing so alerts fire right on time.
  useEffect(() => {
    if (!live || live.isPaused || live.isDeceased) return;
    const upcoming = nextNeed(live);
    if (!upcoming) return;
    const delayMs = Math.min(Math.max(1000, Math.ceil(upcoming.hours * 3_600_000) + 250), 2_147_483_647);
    const timer = window.setTimeout(() => setNow(Date.now()), delayMs);
    return () => window.clearTimeout(timer);
  }, [live]);

  // Detect low-need (< 25) and critical (<= 5) threshold crossings and notify once per crossing.
  const alertedRef = useRef<AlertedMap | null>(null);
  useEffect(() => {
    if (!live || live.isPaused || live.isDeceased) return;
    alertedRef.current ??= loadAlertedMap();
    const prefs = loadNotificationPrefs();
    const { nextAlerted, alerts } = evaluateStatThresholds(live, alertedRef.current, prefs);
    alertedRef.current = nextAlerted;
    saveAlertedMap(nextAlerted);

    if (alerts.length > 0) {
      const first = alerts[0];
      noticeRef.current({ text: first.title, tone: first.tone });
      vibrate([30, 50, 30]);
      for (const a of alerts) {
        void sendSystemNotification(a.title, a.body, a.tag);
      }
    }
  }, [live]);

  // Send an urgent rescue alert if Oli ever succumbs to prolonged neglect
  const deceasedAlertedRef = useRef(false);
  useEffect(() => {
    if (live?.isDeceased && !deceasedAlertedRef.current) {
      deceasedAlertedRef.current = true;
      void sendSystemNotification(
        '🚨 Oli needs you!',
        'Oli was left alone too long. Open the app to revive him.',
        'oli-emergency',
      );
    } else if (live && !live.isDeceased) {
      deceasedAlertedRef.current = false;
    }
  }, [live?.isDeceased]);

  // Notify when Oli wakes up on his own (piecewise decay crossed the wake point).
  const prevSleeping = useRef<boolean | null>(null);
  useEffect(() => {
    if (!live) return;
    if (prevSleeping.current === true && !live.isSleeping && live.wokeNaturally) {
      const msg = `${live.name} woke up from his nap!`;
      noticeRef.current({ text: msg, tone: 'info' });
      saveLastMessAt(Date.now());
      saveLastLitterAt(Date.now());
      if (loadNotificationPrefs().wakeUp) {
        void sendSystemNotification(`☀️ ${live.name} woke up!`, msg, 'oli-wake');
      }
      playEvent({ actionId: 'wake', player: '', remote: true, effect: {}, particles: [], animation: 'yawning', durationMs: 1600 });
    }
    prevSleeping.current = live.isSleeping;
  }, [live, playEvent]);

  const lockFor = (ms: number) => {
    setBusy(true);
    window.clearTimeout(busyTimer.current);
    busyTimer.current = window.setTimeout(() => setBusy(false), ms);
  };

  /** Optimistically apply locally, then commit with conflict-safe retries. */
  const commit = useCallback(
    async (
      mutator: (b: CatState) => CatState,
      actionIdOrActivity: string | { actionId: string; message: string } | null,
      maybeMessage?: string,
    ) => {
      const storage = storageRef.current;
      const actor = player ?? 'Nico';
      if (!storage) return;
      setBase((prev) => (prev ? mutator(prev) : prev));
      setNow(Date.now());
      try {
        let activityPayload: { player: string; action_id: string; message: string; device_id: string } | null = null;
        if (typeof actionIdOrActivity === 'string') {
          activityPayload = {
            player: actor,
            action_id: actionIdOrActivity,
            message: maybeMessage ?? '',
            device_id: DEVICE_ID,
          };
        } else if (actionIdOrActivity && typeof actionIdOrActivity === 'object') {
          activityPayload = {
            player: actor,
            action_id: actionIdOrActivity.actionId,
            message: actionIdOrActivity.message,
            device_id: DEVICE_ID,
          };
        }
        const res = await storage.commit(mutator, activityPayload);
        acceptState(res.state);
        if (res.entry) addEntry(res.entry);
        if (storage.mode === 'supabase') setStatus((s) => (s === 'offline' ? 'live' : s));
      } catch (err) {
        console.error('[useCatGame] commit failed', err);
        noticeRef.current({
          text: err instanceof Error && err.message.includes('popular') ? err.message : 'Couldn’t save — please try again.',
          tone: 'warn',
        });
        const fresh = await storage.refresh();
        if (fresh) setBase(fresh);
      }
    },
    [player, acceptState, addEntry],
  );

  // ---------------------------------------------------------------------------
  // Phase 3: Attention Calls ("Meow!" Whims / Cravings) lifecycle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!ready || !live || live.isPaused || live.isDeceased) return;

    // Clear whim if Oli falls asleep, gets a tummy ache, or clock is paused/deceased
    if (whim && (live.isSleeping || tummyAche || live.isPaused || live.isDeceased)) {
      clearWhim();
      return;
    }

    // Check if an active whim has expired
    if (whim) {
      const msLeft = whim.expiresAt - now;
      if (msLeft <= 0) {
        clearWhim();
        noticeRef.current({
          text: '😿 Craving expired (-8 Joy)',
          tone: 'warn',
        });
        const mutator = (b: CatState): CatState => applyEffect(materialize(b, Date.now()), { happiness: -8 });
        void commit(mutator, null);
        return;
      }
      const expireTimer = window.setTimeout(() => setNow(Date.now()), Math.min(msLeft + 200, 60_000));
      return () => window.clearTimeout(expireTimer);
    }

    // Otherwise, if Oli is awake & feeling fine, schedule his next Attention Call!
    if (live.isSleeping || tummyAche || live.isPaused || live.isDeceased) return;
    const elapsedSinceLast = Date.now() - loadLastWhimAt();
    const waitMs = Math.max(8_000, WHIM_COOLDOWN_MS - elapsedSinceLast);

    const spawnTimer = window.setTimeout(() => {
      const candidate = pickCandidateWhim(live);
      if (!candidate) return;
      const nextWhim: CatWhim = {
        ...candidate,
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        expiresAt: Date.now() + WHIM_DURATION_MS,
      };
      setWhim(nextWhim);
      saveActiveWhim(nextWhim);
      saveLastWhimAt(Date.now());
      vibrate([20, 40, 20]);
      noticeRef.current({
        text: `💭 Craving: ${nextWhim.label}`,
        tone: 'info',
      });
    }, waitMs);

    return () => window.clearTimeout(spawnTimer);
  }, [ready, live, whim, now, tummyAche, clearWhim, commit]);

  // Passive room mess & litter box catch-up: spawn 1 fur tumbleweed per MESS_SPAWN_HOURS (2.5h) elapsed, up to 3 max.
  // Also dirty the litter box if away for 3.5h+.
  // Note: While Oli is sleeping, he never sheds, vomits, or dirties the litter box!
  useEffect(() => {
    if (!ready || !live || live.isPaused || live.isDeceased) return;

    // While Oli is actively sleeping, do not spawn messes or dirty the litter box.
    if (live.isSleeping) {
      saveLastMessAt(now);
      saveLastLitterAt(now);
      return;
    }

    // If Oli was previously sleeping and woke naturally while away,
    // only count the time elapsed AFTER he woke up!
    let effectiveMessBase = loadLastMessAt(now);
    let effectiveLitterBase = loadLastLitterAt(now);

    if (base?.is_sleeping) {
      const napHours = hoursUntilNaturalWake(base.energy);
      const napEndMs = Date.parse(base.last_updated_at) + napHours * MS_PER_HOUR;
      if (Number.isFinite(napEndMs)) {
        if (effectiveMessBase < napEndMs) effectiveMessBase = napEndMs;
        if (effectiveLitterBase < napEndMs) effectiveLitterBase = napEndMs;
      }
    }

    // Check litter box catch-up (only while awake)
    const hoursSinceLitter = Math.max(0, (now - effectiveLitterBase) / MS_PER_HOUR);
    if (hoursSinceLitter >= 3.5 && !litterBoxDirty) {
      setLitterBoxDirty(true);
      saveLitterBoxDirty(true);
      saveLastLitterAt(now);
    }

    const hoursSince = Math.max(0, (now - effectiveMessBase) / MS_PER_HOUR);
    if (hoursSince < MESS_SPAWN_HOURS) return;

    const countToSpawn = Math.min(MAX_ROOM_MESSES - messes.length, Math.floor(hoursSince / MESS_SPAWN_HOURS));
    saveLastMessAt(now);
    if (countToSpawn <= 0) return;

    setMesses((prev) => {
      const next = [...prev];
      for (let i = 0; i < countToSpawn; i++) {
        const slot = pickFreeMessSlot(next);
        if (slot === null) break;
        const kind: MessKind = live.hygiene < 45 && i % 2 === 1 ? 'vomit' : 'fur_clump';
        next.push({
          id: `${now.toString(36)}-${i}-${Math.random().toString(36).slice(2, 5)}`,
          kind,
          slot,
          created_at: new Date(now).toISOString(),
        });
      }
      saveMesses(next);
      return next;
    });

    // Apply a hygiene/joy penalty for unattended shedding
    const penalty: Partial<CatStats> = {
      hygiene: -6 * countToSpawn,
      happiness: -4 * countToSpawn,
    };
    const mutator = (b: CatState): CatState => applyEffect(materialize(b, now), penalty);
    void commit(mutator, null);
  }, [ready, live, base, now, messes.length, litterBoxDirty, commit]);

  // Autonomous pass-out nap: if Oli's Energy drops to <= AUTO_NAP_ENERGY (5) while awake, he curls up to nap automatically.
  const autoNappingRef = useRef(false);
  useEffect(() => {
    if (!live || live.isSleeping || live.isPaused || live.isDeceased || busy || autoNappingRef.current) return;
    if (live.energy <= AUTO_NAP_ENERGY) {
      autoNappingRef.current = true;
      saveLastMessAt(Date.now());
      saveLastLitterAt(Date.now());
      noticeRef.current({
        text: `😴 ${live.name} fell asleep from exhaustion.`,
        tone: 'info',
      });
      playEvent({
        actionId: SLEEP_ACTION_ID,
        player: player ?? 'Nico',
        remote: false,
        effect: {},
        particles: [],
        animation: 'yawning',
        durationMs: 1600,
      });
      const mutator = (b: CatState): CatState => ({ ...materialize(b, Date.now()), is_sleeping: true });
      void commit(mutator, SLEEP_ACTION_ID, `Tucked ${live.name} in for a cozy nap`).finally(() => {
        autoNappingRef.current = false;
      });
    }
  }, [live, busy, player, playEvent, commit]);

  /** Scoops and cleans Oli’s enclosed corner litter box. */
  const scoopLitterBox = useCallback(() => {
    if (!base || !live || busy) return;
    if (!litterBoxDirty) {
      noticeRef.current({
        text: '✨ Litter box is already clean.',
        tone: 'info',
      });
      vibrate(15);
      return;
    }

    const scoopAction = actionById('scoop_mess')!;
    setLitterBoxDirty(false);
    saveLitterBoxDirty(false);
    saveLastLitterAt(Date.now());

    vibrate(scoopAction.haptic);
    lockFor(1000);
    noticeRef.current({
      text: '✨ Litter box scooped clean.',
      tone: 'info',
    });
    playEvent({
      actionId: scoopAction.id,
      player: player ?? 'Nico',
      remote: false,
      effect: scoopAction.effect,
      particles: scoopAction.particles,
      animation: live.isSleeping ? 'idle' : scoopAction.animation,
      durationMs: scoopAction.durationMs,
    });

    const willThrive = messes.length === 0 && isThriving(applyEffect(live, scoopAction.effect));
    if (willThrive) window.setTimeout(celebrate, 450);

    const mutator = (b: CatState): CatState => applyEffect(materialize(b, Date.now()), scoopAction.effect);
    void commit(mutator, scoopAction.id, formatLog(scoopAction.log, live.name));
  }, [base, live, busy, litterBoxDirty, messes.length, player, playEvent, commit]);

  /** Cleans a specific mess on the rug (by id) or the oldest mess when called from the Care dock. */
  const cleanMess = useCallback(
    (messId?: string) => {
      if (!base || !live || busy) return;
      const target = messId ? messes.find((m) => m.id === messId) : messes[0];
      if (!target) {
        if (litterBoxDirty) {
          scoopLitterBox();
          return;
        }
        noticeRef.current({
          text: '✨ Room is already spotless.',
          tone: 'info',
        });
        vibrate(15);
        return;
      }

      const scoopAction = actionById('scoop_mess')!;
      const remaining = messes.filter((m) => m.id !== target.id);
      setMesses(remaining);
      saveMesses(remaining);
      saveLastMessAt(Date.now());

      vibrate(scoopAction.haptic);
      lockFor(1000);
      noticeRef.current({
        text:
          target.kind === 'fur_clump'
            ? '✨ Swept up fur tumbleweed.'
            : '✨ Cleaned up mess.',
        tone: 'info',
      });
      playEvent({
        actionId: scoopAction.id,
        player: player ?? 'Nico',
        remote: false,
        effect: scoopAction.effect,
        particles: scoopAction.particles,
        animation: live.isSleeping ? 'idle' : scoopAction.animation,
        durationMs: scoopAction.durationMs,
      });

      const willThrive = remaining.length === 0 && !litterBoxDirty && isThriving(applyEffect(live, scoopAction.effect));
      if (willThrive) window.setTimeout(celebrate, 450);

      const logMsg =
        target.kind === 'fur_clump'
          ? `Swept up ${live.name}’s fur tumbleweed`
          : `Cleaned up ${live.name}’s mess`;
      const mutator = (b: CatState): CatState => applyEffect(materialize(b, Date.now()), scoopAction.effect);
      void commit(mutator, scoopAction.id, logMsg);
    },
    [base, live, busy, messes, litterBoxDirty, scoopLitterBox, player, playEvent, commit],
  );

  const perform = useCallback(
    (action: CareAction, minigameHits?: number) => {
      if (!base || !live || busy) return;

      if (live.isDeceased) {
        noticeRef.current({ text: '💔 Oli needs emergency revival first.', tone: 'warn' });
        vibrate([20, 40, 20]);
        return;
      }

      if (live.isPaused) {
        triggerRefusal('✈️ Care clock is paused. Resume in Menu or header.');
        return;
      }

      // Special case: Care -> Scoop Box cleans either the litter box or rug mess
      if (action.id === 'scoop_mess') {
        if ((litterBoxDirty || messes.length > 0) && isBalconySpot(spot)) {
          setSpot('rug', true);
        }
        if (litterBoxDirty) {
          scoopLitterBox();
        } else if (messes.length > 0) {
          cleanMess();
        } else {
          noticeRef.current({
            text: '✨ Litter box and room are already clean.',
            tone: 'info',
          });
          vibrate(15);
        }
        return;
      }

      // When doing an active care action, awake Oli trots to the floor of his current scenery
      // (or inside to the living room rug if using the indoor water fountain).
      if (action.id !== 'scoop_mess' && !live.isSleeping) {
        if (action.id === 'fountain') {
          if (spot !== 'rug') setSpot('rug', true);
        } else if (isBalconySpot(spot)) {
          if (spot !== 'balcony_floor') setSpot('balcony_floor', true);
        } else if (spot !== 'rug') {
          setSpot('rug', true);
        }
      }

      // 1. Sleeping check
      if (action.requiresAwake && live.isSleeping) {
        noticeRef.current({ text: `Shh… ${live.name} is napping. Wake him in Rest.`, tone: 'info' });
        vibrate(10);
        return;
      }

      // 2. Tummy ache check on food/treats
      if (tummyAche && action.category === 'feed') {
        triggerRefusal(`🤢 ${live.name} has a tummy ache! Pet, brush, or mist him first.`);
        return;
      }

      // 3. Churu Stash check when feeding a Churu Tube
      if (action.id === 'churu' && churuStash <= 0) {
        triggerRefusal('🍬 Out of Churus! Win minigames or cravings to get more.');
        return;
      }

      // 4. Fullness check on meals
      if (action.maxHunger !== undefined && live.hunger >= action.maxHunger) {
        triggerRefusal(`😋 ${live.name} is too full! Play with him first.`);
        return;
      }

      // 5. Hydration check on fountain
      if (action.maxHydration !== undefined && live.hydration >= action.maxHydration) {
        triggerRefusal(`💧 ${live.name} isn’t thirsty right now.`);
        return;
      }

      // 6. Energy check on play actions
      if (action.minEnergy !== undefined && live.energy < action.minEnergy) {
        triggerRefusal(`🥱 ${live.name} is too tired! Let him nap first.`);
        return;
      }

      // 6b. Phase 4: Launch interactive Minigame for Play actions!
      if (action.category === 'play' && minigameHits === undefined) {
        vibrate(15);
        setActiveMinigame(action);
        return;
      }

      // 7. Overfeeding / Treat-spam check (4th treat in 15m triggers a Tummy Ache + Throw-up!)
      const nowMs = Date.now();
      if (action.isTreat) {
        const recent = loadRecentTreats(nowMs);
        if (recent.length >= MAX_TREATS_IN_WINDOW || (live.hunger >= 98 && recent.length >= 2)) {
          const until = nowMs + TUMMY_ACHE_MS;
          setTummyAcheUntil(until);
          saveTummyAcheUntil(until);
          spawnMess('vomit');
          const achePenalty: Partial<CatStats> = { happiness: -10, energy: -15, hygiene: -10 };
          lockFor(1600);
          vibrate([40, 60, 40, 60, 40]);
          noticeRef.current({
            text: '🤢 Too many treats! Clean up the mess and soothe his tummy.',
            tone: 'warn',
          });
          playEvent({
            actionId: 'tummy_ache',
            player: player ?? 'Nico',
            remote: false,
            effect: achePenalty,
            particles: [],
            animation: 'refuse',
            durationMs: 1600,
          });
          const mutator = (b: CatState): CatState => applyEffect(materialize(b, nowMs), achePenalty);
          void commit(mutator, action.id, formatLog(action.log, live.name));
          return;
        }
        saveRecentTreats([...recent, nowMs]);
      }

      // 8. Spend 1 Churu Tube if using Churu
      if (action.id === 'churu') {
        updateChuruStash((c) => c - 1);
      }

      // 9. Check if this action fulfills Oli's active Attention Call / Whim + apply Minigame bonuses!
      const matchedWhim = whim && whim.actionId === action.id;
      const finalEffect: Partial<CatStats> = { ...action.effect };
      const mgReward =
        minigameHits !== undefined ? computeMinigameReward(minigameHits, MINIGAME_ROUNDS) : null;

      if (mgReward && mgReward.bonusJoy > 0) {
        finalEffect.happiness = (finalEffect.happiness ?? 0) + mgReward.bonusJoy;
      }

      if (matchedWhim) {
        clearWhim();
        const baseJoy = finalEffect.happiness ?? 8;
        finalEffect.happiness = Math.max(16, baseJoy * 2);
        const earnedChurus = 1 + (mgReward?.churuBonus ?? 0);
        updateChuruStash((c) => c + earnedChurus);
        noticeRef.current({
          text: `🎉 Craving fulfilled! +${finalEffect.happiness} Joy, +${earnedChurus} Churu 🍬`,
          tone: 'info',
        });
      } else if (mgReward) {
        if (mgReward.tier === 'perfect') {
          updateChuruStash((c) => c + 1);
          noticeRef.current({
            text: `🏆 3/3 Perfect! +${finalEffect.happiness} Joy, +1 Churu 🍬`,
            tone: 'info',
          });
        } else if (mgReward.bonusJoy > 0) {
          noticeRef.current({
            text: `✨ 2/3 Great! +${finalEffect.happiness} Joy`,
            tone: 'info',
          });
        }
      }

      // 10. Soothe tummy ache if using Brush or Calming Mist
      if (tummyAche && action.soothesTummy) {
        clearTummyAche();
        noticeRef.current({
          text: '🧡 Tummy ache soothed!',
          tone: 'info',
        });
      }

      // 11. Digestion: every 2nd meal (Wet Food or Quail Egg) uses Oli’s corner litter box!
      if (action.id === 'wet_food' || action.id === 'quail_egg') {
        const meals = incrementCounter(LS_MEAL_COUNT);
        if (meals % 2 === 0) {
          window.setTimeout(() => {
            dirtyLitterBox('🚽 Litter box needs scooping.');
          }, action.durationMs + 200);
        }
      }

      vibrate(action.haptic);
      lockFor(Math.min(action.durationMs, 1800));
      playEvent({
        actionId: action.id,
        player: player ?? 'Nico',
        remote: false,
        effect: finalEffect,
        particles:
          matchedWhim || mgReward?.tier === 'perfect'
            ? Array.from(new Set([...action.particles, 'hearts' as const, 'sparkles' as const]))
            : action.particles,
        animation: action.animation,
        durationMs: action.durationMs,
      });

      const wasThriving = messes.length === 0 && !litterBoxDirty && isThriving(live);
      const willThrive = messes.length === 0 && !litterBoxDirty && isThriving(applyEffect(live, finalEffect));
      if ((!wasThriving && willThrive) || mgReward?.tier === 'perfect') {
        window.setTimeout(celebrate, 350);
      }

      const mutator = (b: CatState): CatState => {
        const t = Date.now();
        const next = applyEffect(materialize(b, t), finalEffect);
        if (action.calmMinutes) next.calm_until = new Date(t + action.calmMinutes * 60_000).toISOString();
        return next;
      };
      void commit(mutator, action.id, formatLog(action.log, live.name));
    },
    [
      base,
      live,
      busy,
      tummyAche,
      churuStash,
      whim,
      messes.length,
      litterBoxDirty,
      scoopLitterBox,
      dirtyLitterBox,
      player,
      playEvent,
      commit,
      triggerRefusal,
      clearTummyAche,
      clearWhim,
      cleanMess,
      spawnMess,
      updateChuruStash,
      spot,
      setSpot,
    ],
  );

  /** Direct interactive petting on Oli's rug avatar (replaces the old Chin Scratches dock button). */
  const petOli = useCallback(() => {
    if (!base || !live || busy) return;
    if (live.isDeceased) return;
    if (live.isPaused) {
      triggerRefusal('✈️ Care clock is paused. Resume in Menu or header.');
      return;
    }
    vibrate([25, 25, 35, 25, 25]);

    if (live.isSleeping) return;

    const nowMs = Date.now();
    // If Oli has a tummy ache, rubbing his belly soothes it right away!
    if (tummyAche) {
      clearTummyAche();
      lastPetRef.current = nowMs;
      const boost: Partial<CatStats> = { happiness: PET_JOY_BOOST };
      noticeRef.current({
        text: '🧡 Belly rubs soothed his tummy!',
        tone: 'info',
      });
      playEvent({
        actionId: PET_ACTION_ID,
        player: player ?? 'Nico',
        remote: false,
        effect: boost,
        particles: ['purr', 'hearts'],
        animation: 'purring',
        durationMs: 2200,
      });
      const mutator = (b: CatState): CatState => applyEffect(materialize(b, nowMs), boost);
      void commit(mutator, PET_ACTION_ID, `Gave ${live.name} chin scratches — purr session!`);
      return;
    }

    // If Oli's active whim is Chin Scratches, fulfill it immediately even if on pet cooldown!
    const matchedWhim = whim && whim.actionId === PET_ACTION_ID;
    if (matchedWhim || (nowMs - lastPetRef.current >= PET_COOLDOWN_MS && !busy)) {
      lastPetRef.current = nowMs;
      const joyDelta = matchedWhim ? PET_JOY_BOOST * 2 : PET_JOY_BOOST;
      const boost: Partial<CatStats> = { happiness: joyDelta };

      if (matchedWhim) {
        clearWhim();
        updateChuruStash((c) => c + 1);
        noticeRef.current({
          text: `🎉 Craving fulfilled! +${joyDelta} Joy, +1 Churu 🍬`,
          tone: 'info',
        });
      }

      playEvent({
        actionId: PET_ACTION_ID,
        player: player ?? 'Nico',
        remote: false,
        effect: boost,
        particles: ['purr', 'hearts'],
        animation: 'purring',
        durationMs: 2200,
      });

      const wasThriving = messes.length === 0 && !litterBoxDirty && isThriving(live);
      const willThrive = messes.length === 0 && !litterBoxDirty && isThriving(applyEffect(live, boost));
      if (!wasThriving && willThrive) window.setTimeout(celebrate, 500);

      const mutator = (b: CatState): CatState => applyEffect(materialize(b, nowMs), boost);
      void commit(mutator, PET_ACTION_ID, `Gave ${live.name} chin scratches — purr session!`);
    }
  }, [base, live, busy, tummyAche, whim, messes.length, litterBoxDirty, churuStash, player, playEvent, commit, clearTummyAche, clearWhim, updateChuruStash, triggerRefusal]);

  /** Tapping the Whim thought bubble directly above Oli's head performs the requested action! */
  const fulfillWhim = useCallback(() => {
    if (!whim) return;
    if (whim.actionId === PET_ACTION_ID) {
      petOli();
      return;
    }
    const action = actionById(whim.actionId);
    if (action) perform(action);
  }, [whim, petOli, perform]);

  const completeMinigame = useCallback(
    (hits: number) => {
      if (!activeMinigame) return;
      const action = activeMinigame;
      setActiveMinigame(null);
      perform(action, hits);
    },
    [activeMinigame, perform],
  );

  const cancelMinigame = useCallback(() => {
    setActiveMinigame(null);
  }, []);

  const toggleSleep = useCallback(() => {
    if (!live || busy || live.isDeceased) return;
    if (live.isPaused) {
      triggerRefusal(`✈️ Care clock is paused. Tap "✈️ Paused" above or open the Menu to resume!`);
      return;
    }
    const target = !live.isSleeping;

    // Sleep rules:
    // 1. Cannot force Oli to nap if he's already full of energy (>= 85)
    if (target && live.energy >= MAX_SLEEP_ENERGY) {
      triggerRefusal(`⚡ ${live.name} has too much energy to nap! Play with him first.`);
      return;
    }

    // 2. Cannot wake Oli up if he's still deeply exhausted (< 20)
    if (!target && live.energy < MIN_WAKE_ENERGY) {
      noticeRef.current({
        text: `😴 Still too tired to wake up (${Math.round(live.energy)}/100 Energy).`,
        tone: 'warn',
      });
      vibrate([20, 40, 20]);
      return;
    }

    vibrate(target ? [20, 80, 20] : 30);
    saveLastMessAt(Date.now());
    saveLastLitterAt(Date.now());
    if (target) {
      setSpot('sofa_bed', true);
    }
    lockFor(1200);
    playEvent({
      actionId: SLEEP_ACTION_ID,
      player: player ?? 'Nico',
      remote: false,
      effect: {},
      particles: [],
      animation: 'yawning',
      durationMs: 1600,
    });
    const mutator = (b: CatState): CatState => ({ ...materialize(b, Date.now()), is_sleeping: target });
    const message = target ? `Tucked ${live.name} in for a cozy nap` : `Gently woke ${live.name} up from his nap`;
    void commit(mutator, SLEEP_ACTION_ID, message);
  }, [live, busy, player, playEvent, commit, triggerRefusal]);

  /** Freezes or unfreezes time drift so travel/flights don't cause unintended decay or neglect. */
  const togglePause = useCallback(() => {
    if (!base || !live || live.isDeceased) return;
    const isCurrentlyPaused = Boolean(base.paused_at);
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();

    if (isCurrentlyPaused) {
      const mutator = (b: CatState): CatState => ({
        ...b,
        paused_at: null,
        last_updated_at: nowIso,
      });
      // Refresh passive event timestamps so hours spent on vacation do not trigger instant messes or penalties
      saveLastMessAt(nowMs);
      saveLastLitterAt(nowMs);
      saveLastWhimAt(nowMs);
      saveLastRoamAt(nowMs);
      noticeRef.current({ text: '▶️ Care clock resumed.', tone: 'info' });
      vibrate([20, 60, 20]);
      void commit(mutator, PAUSE_ACTION_ID, 'Resumed the care clock');
    } else {
      const mutator = (b: CatState): CatState => {
        const mat = materialize(b, nowMs);
        return {
          ...mat,
          paused_at: nowIso,
          last_updated_at: nowIso,
        };
      };
      noticeRef.current({ text: '✈️ Care clock paused (Vacation Mode).', tone: 'info' });
      vibrate(30);
      void commit(mutator, PAUSE_ACTION_ID, 'Paused the care clock');
    }
  }, [base, live, commit]);

  /** Miraculously revives Oli from severe neglect using 1 of his 9 lives. */
  const reviveOli = useCallback(() => {
    if (!base || !live || !live.isDeceased) return;
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const currentLives = live.livesLeft;
    const nextLives = currentLives > 0 ? currentLives - 1 : MAX_LIVES;

    const mutator = (b: CatState): CatState => ({
      ...b,
      hunger: 35,
      hydration: 35,
      happiness: 30,
      energy: 40,
      hygiene: 40,
      is_sleeping: false,
      calm_until: null,
      deceased_at: null,
      paused_at: null,
      lives_left: nextLives,
      last_updated_at: nowIso,
    });

    setMesses([]);
    saveMesses([]);
    setLitterBoxDirty(false);
    saveLitterBoxDirty(false);
    saveLastMessAt(nowMs);
    saveLastLitterAt(nowMs);
    saveLastWhimAt(nowMs);
    saveLastRoamAt(nowMs);
    clearWhim();
    clearTummyAche();

    noticeRef.current({
      text: `🩺 Oli revived! (${nextLives} lives left)`,
      tone: 'info',
    });
    vibrate([40, 80, 40, 80, 40]);
    celebrate();
    void commit(mutator, REVIVE_ACTION_ID, 'Emergency revival brought Oli back');
  }, [base, live, clearTummyAche, clearWhim, commit]);

  return {
    ready,
    live,
    mood,
    tummyAche,
    messes,
    litterBoxDirty,
    churuStash,
    whim,
    activeMinigame,
    log,
    mode,
    status,
    fallbackReason,
    event,
    busy,
    perform,
    completeMinigame,
    cancelMinigame,
    petOli,
    cleanMess,
    scoopLitterBox,
    fulfillWhim,
    toggleSleep,
    togglePause,
    reviveOli,
    spot,
    setSpot,
    scene,
    setScene,
    now,
  };
}
