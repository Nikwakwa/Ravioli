import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initCatStorage, ACTIVITY_LIMIT, type CatStorage, type StorageBootstrap } from '../services/catStorage';
import type {
  ActivityEntry,
  CatAnimation,
  CatState,
  CatStats,
  LiveCat,
  MessKind,
  Mood,
  RoomMess,
  SyncMode,
  SyncStatus,
} from '../types';
import {
  applyEffect,
  computeLiveStats,
  deriveMood,
  isThriving,
  materialize,
  nextNeed,
} from '../utils/decayEngine';
import {
  actionById,
  AUTO_NAP_ENERGY,
  formatLog,
  MAX_ROOM_MESSES,
  MAX_SLEEP_ENERGY,
  MAX_TREATS_IN_WINDOW,
  MESS_SPAWN_HOURS,
  MIN_WAKE_ENERGY,
  PET_ACTION_ID,
  PET_COOLDOWN_MS,
  PET_JOY_BOOST,
  SLEEP_ACTION_ID,
  TREAT_WINDOW_MS,
  TUMMY_ACHE_MS,
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
const LS_MEAL_COUNT = 'ravioli:v1:meal_count';

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

function loadMesses(): RoomMess[] {
  try {
    const raw = window.localStorage.getItem(LS_MESSES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is RoomMess =>
          m &&
          typeof m.id === 'string' &&
          (m.kind === 'poop' || m.kind === 'hairball') &&
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

function incrementMealCount(): number {
  try {
    const raw = window.localStorage.getItem(LS_MEAL_COUNT);
    const next = (raw ? Number(raw) || 0 : 0) + 1;
    window.localStorage.setItem(LS_MEAL_COUNT, String(next));
    return next;
  } catch {
    return 1;
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
  const busyTimer = useRef<number | undefined>(undefined);
  const lastPetRef = useRef<number>(0);

  const tummyAche = tummyAcheUntil > now;

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
  // Tamagotchi clock: 30 s tick + foreground refresh
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

  // Derive mood with Tamagotchi tummy-ache & room-mess overrides (messes block 'ecstatic'!)
  const mood: Mood = useMemo(() => {
    if (!live) return 'content';
    if (live.isSleeping) return 'sleeping';
    if (tummyAche) return 'sad';
    if (messes.length >= 2) return 'grubby';
    const raw = deriveMood(live);
    if (messes.length > 0 && raw === 'ecstatic') return 'happy';
    return raw;
  }, [live, tummyAche, messes.length]);

  // Schedule an exact timer for the next low-need threshold crossing so alerts fire right on time.
  useEffect(() => {
    if (!live) return;
    const upcoming = nextNeed(live);
    if (!upcoming) return;
    const delayMs = Math.min(Math.max(1000, Math.ceil(upcoming.hours * 3_600_000) + 250), 2_147_483_647);
    const timer = window.setTimeout(() => setNow(Date.now()), delayMs);
    return () => window.clearTimeout(timer);
  }, [live]);

  // Detect low-need (< 25) and critical (<= 5) threshold crossings and notify once per crossing.
  const alertedRef = useRef<AlertedMap | null>(null);
  useEffect(() => {
    if (!live) return;
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

  // Notify when Oli wakes up on his own (piecewise decay crossed the wake point).
  const prevSleeping = useRef<boolean | null>(null);
  useEffect(() => {
    if (!live) return;
    if (prevSleeping.current === true && !live.isSleeping && live.wokeNaturally) {
      const msg = `${live.name} woke up from his nap, full of energy!`;
      noticeRef.current({ text: msg, tone: 'info' });
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
    async (mutator: (b: CatState) => CatState, actionId: string, message: string) => {
      const storage = storageRef.current;
      const actor = player ?? 'Nico';
      if (!storage) return;
      setBase((prev) => (prev ? mutator(prev) : prev));
      setNow(Date.now());
      try {
        const res = await storage.commit(mutator, { player: actor, action_id: actionId, message, device_id: DEVICE_ID });
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

  // Passive Tamagotchi mess catch-up: spawn 1 mess per MESS_SPAWN_HOURS (2.5h) elapsed, up to 3 max.
  useEffect(() => {
    if (!ready || !live) return;
    const lastMs = loadLastMessAt(now);
    const hoursSince = (now - lastMs) / MS_PER_HOUR;
    if (hoursSince < MESS_SPAWN_HOURS) return;

    const countToSpawn = Math.min(MAX_ROOM_MESSES - messes.length, Math.floor(hoursSince / MESS_SPAWN_HOURS));
    saveLastMessAt(now);
    if (countToSpawn <= 0) return;

    setMesses((prev) => {
      const next = [...prev];
      for (let i = 0; i < countToSpawn; i++) {
        const slot = pickFreeMessSlot(next);
        if (slot === null) break;
        const kind: MessKind = live.hygiene < 45 || i % 2 === 1 ? 'hairball' : 'poop';
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

    // Apply a stink penalty for messes left while away
    const penalty: Partial<CatStats> = {
      hygiene: -6 * countToSpawn,
      happiness: -4 * countToSpawn,
    };
    const mutator = (b: CatState): CatState => applyEffect(materialize(b, now), penalty);
    void commit(mutator, 'scoop_mess', `Scooped up ${live.name}’s mess from the rug`);
  }, [ready, live, now, messes.length, commit]);

  // Autonomous pass-out nap: if Oli's Energy drops to <= AUTO_NAP_ENERGY (5) while awake, he curls up to nap automatically.
  const autoNappingRef = useRef(false);
  useEffect(() => {
    if (!live || live.isSleeping || busy || autoNappingRef.current) return;
    if (live.energy <= AUTO_NAP_ENERGY) {
      autoNappingRef.current = true;
      noticeRef.current({
        text: `😴 ${live.name} got completely exhausted and curled up for a nap!`,
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

  /** Cleans a specific mess on the rug (by id) or the oldest mess when called from the Care dock. */
  const cleanMess = useCallback(
    (messId?: string) => {
      if (!base || !live || busy) return;
      const target = messId ? messes.find((m) => m.id === messId) : messes[0];
      if (!target) {
        noticeRef.current({
          text: '✨ The living room is already spotless — no messes to scoop!',
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
          target.kind === 'poop'
            ? `✨ Scooped up ${live.name}’s poop! The rug is fresh & clean.`
            : `✨ Cleaned up ${live.name}’s hairball from the rug!`,
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

      const willThrive = remaining.length === 0 && isThriving(applyEffect(live, scoopAction.effect));
      if (willThrive) window.setTimeout(celebrate, 450);

      const mutator = (b: CatState): CatState => applyEffect(materialize(b, Date.now()), scoopAction.effect);
      void commit(mutator, scoopAction.id, formatLog(scoopAction.log, live.name));
    },
    [base, live, busy, messes, player, playEvent, commit],
  );

  const perform = useCallback(
    (action: CareAction) => {
      if (!base || !live || busy) return;

      // Special case: Care -> Scoop Mess delegates to cleanMess()
      if (action.id === 'scoop_mess') {
        cleanMess();
        return;
      }

      // 1. Sleeping check
      if (action.requiresAwake && live.isSleeping) {
        noticeRef.current({ text: `Shh… ${live.name} is napping. Wake him up in Rest first.`, tone: 'info' });
        vibrate(10);
        return;
      }

      // 2. Tummy ache check on food/treats
      if (tummyAche && action.category === 'feed') {
        triggerRefusal(`🤢 ${live.name} has a tummy ache! Pet his belly, Brush him, or use Calming Mist first.`);
        return;
      }

      // 3. Fullness check on meals
      if (action.maxHunger !== undefined && live.hunger >= action.maxHunger) {
        triggerRefusal(`😋 ${live.name} is too full for ${action.short.toLowerCase()} right now! Play with him first.`);
        return;
      }

      // 4. Hydration check on fountain
      if (action.maxHydration !== undefined && live.hydration >= action.maxHydration) {
        triggerRefusal(`💧 ${live.name} isn’t thirsty right now — his fountain is already fresh!`);
        return;
      }

      // 5. Energy check on play actions
      if (action.minEnergy !== undefined && live.energy < action.minEnergy) {
        triggerRefusal(`🥱 ${live.name} is too tired for ${action.short}! Let him nap or feed him a Quail Egg.`);
        return;
      }

      // 6. Overfeeding / Treat-spam check (4th treat in 15m triggers a Tummy Ache + Hairball!)
      const nowMs = Date.now();
      if (action.isTreat) {
        const recent = loadRecentTreats(nowMs);
        if (recent.length >= MAX_TREATS_IN_WINDOW || (live.hunger >= 98 && recent.length >= 2)) {
          const until = nowMs + TUMMY_ACHE_MS;
          setTummyAcheUntil(until);
          saveTummyAcheUntil(until);
          spawnMess('hairball');
          const achePenalty: Partial<CatStats> = { happiness: -10, energy: -15, hygiene: -10 };
          lockFor(1600);
          vibrate([40, 60, 40, 60, 40]);
          noticeRef.current({
            text: `🤢 Too many treats gave ${live.name} a tummy ache & a hairball! Tap the hairball to clean up.`,
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

      // 7. Soothe tummy ache if using Brush or Calming Mist
      if (tummyAche && action.soothesTummy) {
        clearTummyAche();
        noticeRef.current({
          text: `🧡 That helped! ${live.name}’s tummy feels much better now.`,
          tone: 'info',
        });
      }

      // 8. Digestion: every 2nd meal (Wet Food or Quail Egg) spawns a poop mess right after Oli finishes eating!
      if (action.id === 'wet_food' || action.id === 'quail_egg') {
        const meals = incrementMealCount();
        if (meals % 2 === 0) {
          window.setTimeout(() => {
            spawnMess('poop', `💩 Nature calls! ${live.name} left a mess on the rug — tap it to scoop!`);
          }, action.durationMs + 200);
        }
      }

      vibrate(action.haptic);
      lockFor(Math.min(action.durationMs, 1800));
      playEvent({
        actionId: action.id,
        player: player ?? 'Nico',
        remote: false,
        effect: action.effect,
        particles: action.particles,
        animation: action.animation,
        durationMs: action.durationMs,
      });

      const wasThriving = messes.length === 0 && isThriving(live);
      const willThrive = messes.length === 0 && isThriving(applyEffect(live, action.effect));
      if (!wasThriving && willThrive) window.setTimeout(celebrate, 500);

      const mutator = (b: CatState): CatState => {
        const t = Date.now();
        const next = applyEffect(materialize(b, t), action.effect);
        if (action.calmMinutes) next.calm_until = new Date(t + action.calmMinutes * 60_000).toISOString();
        return next;
      };
      void commit(mutator, action.id, formatLog(action.log, live.name));
    },
    [base, live, busy, tummyAche, messes.length, player, playEvent, commit, triggerRefusal, clearTummyAche, cleanMess, spawnMess],
  );

  /** Direct interactive petting on Oli's rug avatar (replaces the old Chin Scratches dock button). */
  const petOli = useCallback(() => {
    if (!base || !live) return;
    vibrate([25, 25, 35, 25, 25]);

    if (live.isSleeping) return;

    const nowMs = Date.now();
    // If Oli has a tummy ache, rubbing his belly soothes it right away!
    if (tummyAche) {
      clearTummyAche();
      lastPetRef.current = nowMs;
      const boost: Partial<CatStats> = { happiness: PET_JOY_BOOST };
      noticeRef.current({
        text: `🧡 Belly rubs soothed ${live.name}’s tummy ache!`,
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

    // Grant +Joy boost if off the 20s petting cooldown
    if (nowMs - lastPetRef.current >= PET_COOLDOWN_MS && !busy) {
      lastPetRef.current = nowMs;
      const boost: Partial<CatStats> = { happiness: PET_JOY_BOOST };
      playEvent({
        actionId: PET_ACTION_ID,
        player: player ?? 'Nico',
        remote: false,
        effect: boost,
        particles: ['purr', 'hearts'],
        animation: 'purring',
        durationMs: 2200,
      });

      const wasThriving = messes.length === 0 && isThriving(live);
      const willThrive = messes.length === 0 && isThriving(applyEffect(live, boost));
      if (!wasThriving && willThrive) window.setTimeout(celebrate, 500);

      const mutator = (b: CatState): CatState => applyEffect(materialize(b, nowMs), boost);
      void commit(mutator, PET_ACTION_ID, `Gave ${live.name} chin scratches — purr session!`);
    }
  }, [base, live, busy, tummyAche, messes.length, player, playEvent, commit, clearTummyAche]);

  const toggleSleep = useCallback(() => {
    if (!live || busy) return;
    const target = !live.isSleeping;

    // Tamagotchi sleep rules:
    // 1. Cannot force Oli to nap if he's already full of energy (>= 85)
    if (target && live.energy >= MAX_SLEEP_ENERGY) {
      triggerRefusal(`⚡ ${live.name} has too much energy to nap right now! Play with him first.`);
      return;
    }

    // 2. Cannot wake Oli up if he's still deeply exhausted (< 20)
    if (!target && live.energy < MIN_WAKE_ENERGY) {
      noticeRef.current({
        text: `😴 ${live.name} is still too exhausted to wake up (Energy < ${MIN_WAKE_ENERGY}). Let him rest a bit longer!`,
        tone: 'warn',
      });
      vibrate([20, 40, 20]);
      return;
    }

    vibrate(target ? [20, 80, 20] : 30);
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

  return {
    ready,
    live,
    mood,
    tummyAche,
    messes,
    log,
    mode,
    status,
    fallbackReason,
    event,
    busy,
    perform,
    petOli,
    cleanMess,
    toggleSleep,
    now,
  };
}
