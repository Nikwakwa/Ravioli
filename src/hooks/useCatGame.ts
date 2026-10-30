import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initCatStorage, ACTIVITY_LIMIT, type CatStorage, type StorageBootstrap } from '../services/catStorage';
import type { ActivityEntry, CatAnimation, CatState, CatStats, LiveCat, Mood, SyncMode, SyncStatus } from '../types';
import {
  applyEffect,
  computeLiveStats,
  deriveMood,
  isThriving,
  materialize,
} from '../utils/decayEngine';
import { actionById, formatLog, SLEEP_ACTION_ID, type CareAction, type ParticleKind } from '../data/actions';
import { celebrate, vibrate } from '../utils/feedback';
import { DEVICE_ID } from '../utils/player';

const TICK_MS = 30_000;
/** Ignore remote animations for events older than this (late delivery after backgrounding). */
const REMOTE_EVENT_MAX_AGE_MS = 90_000;

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
  const busyTimer = useRef<number | undefined>(undefined);

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

            noticeRef.current({ text: entry.message, tone: 'partner', player: entry.player });
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
  const mood: Mood = live ? deriveMood(live) : 'content';

  // Notify when Oli wakes up on his own (piecewise decay crossed the wake point).
  const prevSleeping = useRef<boolean | null>(null);
  useEffect(() => {
    if (!live) return;
    if (prevSleeping.current === true && !live.isSleeping && live.wokeNaturally) {
      noticeRef.current({ text: `${live.name} woke up from his nap, full of energy!`, tone: 'info' });
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
      if (!storage || !player) return;
      setBase((prev) => (prev ? mutator(prev) : prev)); // optimistic, same version
      setNow(Date.now());
      try {
        const res = await storage.commit(mutator, { player, action_id: actionId, message, device_id: DEVICE_ID });
        acceptState(res.state);
        if (res.entry) addEntry(res.entry);
        if (storage.mode === 'supabase') setStatus((s) => (s === 'offline' ? 'live' : s));
      } catch (err) {
        console.error('[useCatGame] commit failed', err);
        noticeRef.current({
          text: err instanceof Error && err.message.includes('popular') ? err.message : 'Couldn’t sync that — check your connection.',
          tone: 'warn',
        });
        const fresh = await storage.refresh();
        if (fresh) setBase(fresh);
      }
    },
    [player, acceptState, addEntry],
  );

  const perform = useCallback(
    (action: CareAction) => {
      if (!base || !live || busy) return;
      if (action.requiresAwake && live.isSleeping) {
        noticeRef.current({ text: `Shh… ${live.name} is napping. Wake him up first.`, tone: 'info' });
        vibrate(10);
        return;
      }
      vibrate(action.haptic);
      lockFor(Math.min(action.durationMs, 1800));
      playEvent({
        actionId: action.id,
        player: player ?? '',
        remote: false,
        effect: action.effect,
        particles: action.particles,
        animation: action.animation,
        durationMs: action.durationMs,
      });

      const wasThriving = isThriving(live);
      const willThrive = isThriving(applyEffect(live, action.effect));
      if (!wasThriving && willThrive) window.setTimeout(celebrate, 500);

      const mutator = (b: CatState): CatState => {
        const t = Date.now();
        const next = applyEffect(materialize(b, t), action.effect);
        if (action.calmMinutes) next.calm_until = new Date(t + action.calmMinutes * 60_000).toISOString();
        return next;
      };
      void commit(mutator, action.id, formatLog(action.log, live.name));
    },
    [base, live, busy, player, playEvent, commit],
  );

  const toggleSleep = useCallback(() => {
    if (!live || busy) return;
    const target = !live.isSleeping;
    vibrate(target ? [20, 80, 20] : 30);
    lockFor(1200);
    playEvent({
      actionId: SLEEP_ACTION_ID,
      player: player ?? '',
      remote: false,
      effect: {},
      particles: [],
      animation: 'yawning',
      durationMs: 1600,
    });
    const mutator = (b: CatState): CatState => ({ ...materialize(b, Date.now()), is_sleeping: target });
    const message = target ? `Tucked ${live.name} in for a cozy nap` : `Gently woke ${live.name} up from his nap`;
    void commit(mutator, SLEEP_ACTION_ID, message);
  }, [live, busy, player, playEvent, commit]);

  return { ready, live, mood, log, mode, status, fallbackReason, event, busy, perform, toggleSleep, now };
}
