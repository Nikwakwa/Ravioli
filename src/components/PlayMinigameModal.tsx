import { AnimatePresence, motion } from 'framer-motion';
import { FastForward, Sparkles, Trophy, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  computeMinigameReward,
  getFeatherSweetSpot,
  isFeatherInSweetSpot,
  MINIGAME_ROUNDS,
  type CareAction,
} from '../data/actions';
import { vibrate } from '../utils/feedback';

export const MINIGAME_ROUND_TIME_SEC = 10.0;
export const FEATHER_ROUND_TIME_SEC = 10.0;
export const LASER_ROUND_TIME_SEC = 5.0;
export const MAX_LASER_POUNCES = 3;
export const LASER_HIT_RADIUS_PX = 26;

export function PlayMinigameModal({
  action,
  catName: _catName,
  whimActive,
  onComplete,
  onCancel,
}: {
  action: CareAction | null;
  catName: string;
  whimActive: boolean;
  onComplete: (hits: number) => void;
  onCancel: () => void;
}) {
  const isFeather = action?.id === 'feather_wand';
  const roundDuration = isFeather ? FEATHER_ROUND_TIME_SEC : LASER_ROUND_TIME_SEC;

  const [round, setRound] = useState(0);
  const [results, setResults] = useState<('hit' | 'miss')[]>([]);
  const [roundFeedback, setRoundFeedback] = useState<'hit' | 'miss' | null>(null);
  const [missReason, setMissReason] = useState<'caught' | 'miss_tap' | 'timeout' | 'out_of_pounces' | null>(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(roundDuration);
  const [pouncesLeft, setPouncesLeft] = useState(MAX_LASER_POUNCES);

  // Feather Pounce position state (0..100%)
  const [featherPos, setFeatherPos] = useState(12);
  const posRef = useRef(12);
  const dirRef = useRef<1 | -1>(1);

  // Laser Zoomies 2D movement state (percentages inside arena)
  const [laserPos, setLaserPos] = useState({ x: 50, y: 50 });
  const [caughtPos, setCaughtPos] = useState<{ x: number; y: number } | null>(null);
  const [missPaws, setMissPaws] = useState<{ id: number; x: number; y: number }[]>([]);

  const laserPosRef = useRef({ x: 50, y: 50 });
  const laserVelRef = useRef({ vx: 50, vy: 40 });
  const laserNextTurnRef = useRef(0);
  const timeLeftRef = useRef(roundDuration);
  const pouncesLeftRef = useRef(MAX_LASER_POUNCES);
  const pounceCooldownRef = useRef(false);
  const arenaRef = useRef<HTMLDivElement | null>(null);

  const timersRef = useRef<number[]>([]);
  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const safeTimeout = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  // Reset state whenever a new minigame action opens
  useEffect(() => {
    clearTimers();
    if (!action) return;
    const dur = action.id === 'feather_wand' ? FEATHER_ROUND_TIME_SEC : LASER_ROUND_TIME_SEC;
    setRound(0);
    setResults([]);
    setRoundFeedback(null);
    setMissReason(null);
    setFinished(false);
    setTimeLeft(dur);
    timeLeftRef.current = dur;
    pouncesLeftRef.current = MAX_LASER_POUNCES;
    setPouncesLeft(MAX_LASER_POUNCES);
    pounceCooldownRef.current = false;

    // Reset Feather state
    posRef.current = 12;
    dirRef.current = 1;
    setFeatherPos(12);

    // Reset Laser state
    laserPosRef.current = { x: 50, y: 50 };
    setLaserPos({ x: 50, y: 50 });
    setCaughtPos(null);
    setMissPaws([]);
    const angle = Math.random() * 2 * Math.PI;
    const initialSpeed = 65;
    laserVelRef.current = { vx: Math.cos(angle) * initialSpeed, vy: Math.sin(angle) * initialSpeed };
    laserNextTurnRef.current = performance.now() + 380 + Math.random() * 400;

    return () => clearTimers();
  }, [action]);

  useEffect(() => {
    if (!action) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if ((e.key === ' ' || e.key === 'Enter') && isFeather && roundFeedback === null && !finished) {
        e.preventDefault();
        const hit = isFeatherInSweetSpot(posRef.current, round);
        advanceRound(hit ? 'hit' : 'miss', hit ? 'caught' : 'miss_tap');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [action, isFeather, round, roundFeedback, finished, onCancel]);

  // Main 60fps animation frame loop for movement & timer countdown
  useEffect(() => {
    if (!action || roundFeedback !== null || finished) return;

    let frameId = 0;
    let lastTs = performance.now();

    // Speed scaling per round
    const featherSpeed = 95 + round * 24; // % per second
    const laserBaseSpeed = 65 + round * 40; // % per second (R1: 65, R2: 105, R3: 145)

    const step = (ts: number) => {
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;

      // 1. Tick round timer
      const nextTime = Math.max(0, timeLeftRef.current - dt);
      timeLeftRef.current = nextTime;
      setTimeLeft(nextTime);

      if (nextTime <= 0) {
        advanceRound('miss', 'timeout');
        return;
      }

      // 2. Animate active game
      if (isFeather) {
        let next = posRef.current + dirRef.current * featherSpeed * dt;
        if (next >= 96) {
          next = 96;
          dirRef.current = -1;
        } else if (next <= 4) {
          next = 4;
          dirRef.current = 1;
        }
        posRef.current = next;
        setFeatherPos(next);
      } else {
        const MIN_X = 10;
        const MAX_X = 90;
        const MIN_Y = 14;
        const MAX_Y = 86;

        // Erratic darting heading jitter
        if (ts >= laserNextTurnRef.current) {
          const newAngle = Math.random() * 2 * Math.PI;
          laserVelRef.current = {
            vx: Math.cos(newAngle) * laserBaseSpeed,
            vy: Math.sin(newAngle) * laserBaseSpeed,
          };
          laserNextTurnRef.current = ts + 320 + Math.random() * 420;
        }

        let nx = laserPosRef.current.x + laserVelRef.current.vx * dt;
        let ny = laserPosRef.current.y + laserVelRef.current.vy * dt;

        // Bounce off walls with natural reflections
        if (nx <= MIN_X) {
          nx = MIN_X;
          laserVelRef.current.vx = Math.abs(laserVelRef.current.vx);
        } else if (nx >= MAX_X) {
          nx = MAX_X;
          laserVelRef.current.vx = -Math.abs(laserVelRef.current.vx);
        }

        if (ny <= MIN_Y) {
          ny = MIN_Y;
          laserVelRef.current.vy = Math.abs(laserVelRef.current.vy);
        } else if (ny >= MAX_Y) {
          ny = MAX_Y;
          laserVelRef.current.vy = -Math.abs(laserVelRef.current.vy);
        }

        laserPosRef.current = { x: nx, y: ny };
        setLaserPos({ x: nx, y: ny });
      }

      frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [action, isFeather, round, roundFeedback, finished]);

  if (!action) return null;

  const advanceRound = (
    outcome: 'hit' | 'miss',
    reason?: 'caught' | 'miss_tap' | 'timeout' | 'out_of_pounces',
  ) => {
    const nextResults = [...results, outcome];
    setResults(nextResults);
    setRoundFeedback(outcome);
    setMissReason(reason ?? null);

    if (outcome === 'hit') {
      vibrate([30, 45, 30]);
    } else {
      vibrate(35);
    }

    if (nextResults.length >= MINIGAME_ROUNDS) {
      safeTimeout(() => {
        setFinished(true);
      }, 550);
      safeTimeout(() => {
        const totalHits = nextResults.filter((r) => r === 'hit').length;
        onComplete(totalHits);
      }, 1550);
    } else {
      safeTimeout(() => {
        setRound((r) => r + 1);
        setRoundFeedback(null);
        setMissReason(null);
        setCaughtPos(null);
        setMissPaws([]);
        pounceCooldownRef.current = false;
        const dur = isFeather ? FEATHER_ROUND_TIME_SEC : LASER_ROUND_TIME_SEC;
        timeLeftRef.current = dur;
        setTimeLeft(dur);
        pouncesLeftRef.current = MAX_LASER_POUNCES;
        setPouncesLeft(MAX_LASER_POUNCES);

        // Reset feather starting side
        posRef.current = Math.random() < 0.5 ? 10 : 90;
        dirRef.current = posRef.current < 50 ? 1 : -1;
        setFeatherPos(posRef.current);

        // Reset laser starting position
        laserPosRef.current = { x: 50, y: 50 };
        setLaserPos({ x: 50, y: 50 });
        const nextRound = round + 1;
        const speed = 65 + nextRound * 40;
        const angle = Math.random() * 2 * Math.PI;
        laserVelRef.current = { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
        laserNextTurnRef.current = performance.now() + 350 + Math.random() * 400;
      }, 650);
    }
  };

  const handleFeatherPounce = () => {
    if (roundFeedback !== null || finished) return;
    const hit = isFeatherInSweetSpot(posRef.current, round);
    advanceRound(hit ? 'hit' : 'miss', hit ? 'caught' : 'miss_tap');
  };

  const handleLaserArenaPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (roundFeedback !== null || finished) return;
    if (!arenaRef.current) return;
    if (pounceCooldownRef.current) return;
    if (pouncesLeftRef.current <= 0) return;

    const rect = arenaRef.current.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;

    const dotPxX = (laserPosRef.current.x / 100) * rect.width;
    const dotPxY = (laserPosRef.current.y / 100) * rect.height;

    // Generous touch target radius so tapping feels fair on phones & mice
    const dist = Math.hypot(tapX - dotPxX, tapY - dotPxY);

    if (dist <= LASER_HIT_RADIUS_PX) {
      setCaughtPos({ x: laserPosRef.current.x, y: laserPosRef.current.y });
      advanceRound('hit', 'caught');
    } else {
      pouncesLeftRef.current -= 1;
      const remaining = pouncesLeftRef.current;
      setPouncesLeft(remaining);

      // Missed pounce attempt: brief cooldown so you cannot drum-roll spam
      pounceCooldownRef.current = true;
      safeTimeout(() => {
        pounceCooldownRef.current = false;
      }, 260);

      const pctX = Math.round((tapX / rect.width) * 100);
      const pctY = Math.round((tapY / rect.height) * 100);
      const pawId = Date.now();
      setMissPaws((prev) => [...prev, { id: pawId, x: pctX, y: pctY }]);
      safeTimeout(() => {
        setMissPaws((prev) => prev.filter((p) => p.id !== pawId));
      }, 450);

      vibrate(20);

      if (remaining <= 0) {
        advanceRound('miss', 'out_of_pounces');
      }
    }
  };

  const hitsSoFar = results.filter((r) => r === 'hit').length;
  const reward = computeMinigameReward(hitsSoFar, MINIGAME_ROUNDS);
  const sweetSpot = getFeatherSweetSpot(round);

  return (
    <AnimatePresence>
      <motion.div
        key="minigame-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
      >
        <motion.div
          key="minigame-card"
          initial={{ opacity: 0, scale: 0.88, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 12 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="relative w-full max-w-[360px] overflow-hidden rounded-3xl border-2 border-amber-400/70 bg-[#fff8ef] p-4 text-amber-950 shadow-2xl"
        >
          {/* Header: Game title + Skip / Close */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/18 text-lg shadow-2xs">
                {isFeather ? '🪶' : '🔴'}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display text-sm font-extrabold leading-tight text-amber-950">
                    {isFeather ? 'Feather Pounce!' : 'Laser Zoomies!'}
                  </h2>
                  {whimActive && (
                    <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-amber-950">
                      💭 2× Joy
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-amber-800/80">
                  {isFeather
                    ? 'Tap POUNCE in the green zone!'
                    : `Catch the red dot in ${MAX_LASER_POUNCES} pounces or less!`}{' '}
                  <span className="whitespace-nowrap text-emerald-700">3/3 = +1 Churu 🍬</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onComplete(1)}
                className="flex h-8 items-center gap-0.5 rounded-full bg-amber-900/10 px-2.5 text-[11px] font-extrabold text-amber-900 hover:bg-amber-900/15 active:scale-95"
                title="Skip minigame and play immediately"
              >
                <FastForward className="h-3 w-3" />
                <span>Skip</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Cancel play"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-900/10 text-amber-900 hover:bg-amber-900/15 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 3-Round Score Tracker with Countdown Badge */}
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-amber-950/6 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold whitespace-nowrap text-amber-900">
                {`Round ${Math.min(MINIGAME_ROUNDS, round + 1)} of ${MINIGAME_ROUNDS}`}
              </span>
              {roundFeedback === null && !finished && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black whitespace-nowrap tabular-nums transition-colors ${
                    timeLeft <= (isFeather ? 3.0 : 2.0)
                      ? 'bg-rose-500/20 text-rose-700 animate-pulse'
                      : 'bg-amber-900/10 text-amber-900'
                  }`}
                >
                  {`⏱️ ${Math.max(0, timeLeft).toFixed(1)}s`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: MINIGAME_ROUNDS }).map((_, i) => {
                const res = results[i];
                return (
                  <span
                    key={i}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black transition-transform ${
                      res === 'hit'
                        ? 'scale-110 bg-emerald-500 text-white shadow-xs'
                        : res === 'miss'
                          ? 'bg-rose-500/20 text-rose-700'
                          : i === round
                            ? 'border-2 border-amber-500 bg-white text-amber-900'
                            : 'bg-amber-950/10 text-amber-900/40'
                    }`}
                  >
                    {res === 'hit' ? '🐾' : res === 'miss' ? '×' : i + 1}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Game Arena */}
          {!finished ? (
            isFeather ? (
              /* ---------------- GAME 1: FEATHER POUNCE REFLEX ---------------- */
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex h-28 w-full flex-col justify-between overflow-hidden rounded-2xl border border-amber-900/12 bg-gradient-to-b from-amber-100/70 to-amber-50 p-3 shadow-inner">
                  {/* Round Countdown Progress Bar */}
                  <div className="relative z-10 h-1.5 w-full overflow-hidden rounded-full bg-amber-950/10">
                    <div
                      style={{
                        width: `${(Math.max(0, timeLeft) / MINIGAME_ROUND_TIME_SEC) * 100}%`,
                      }}
                      className={`h-full transition-[width] duration-75 ${
                        timeLeft <= 3.0 ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>

                  {/* Sweet spot target band */}
                  <div
                    style={{
                      left: `${sweetSpot.min}%`,
                      width: `${sweetSpot.max - sweetSpot.min}%`,
                    }}
                    className="pointer-events-none absolute top-4 bottom-2 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-400/25 transition-all"
                  >
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] leading-none font-black tracking-wider whitespace-nowrap text-white uppercase">
                      Pounce Zone
                    </span>
                  </div>

                  {/* Moving feather indicator */}
                  <div className="relative mt-auto mb-1 h-10 w-full">
                    <div
                      style={{ left: `${featherPos}%` }}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-none"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl shadow-md ring-2 ring-amber-400">
                        🪶
                      </div>
                    </div>
                  </div>
                </div>

                {/* Oli's reaction & hunting status text */}
                <div aria-live="polite" className="flex min-h-8 items-center justify-center gap-1.5 px-1 text-center text-[11px] font-extrabold text-amber-900">
                  <span>🐱</span>
                  <span>
                    {roundFeedback === 'hit'
                      ? 'Caught it! ✨'
                      : roundFeedback === 'miss'
                        ? missReason === 'timeout'
                          ? 'Time’s up!'
                          : 'Missed!'
                        : 'Wait for the green zone...'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleFeatherPounce}
                  disabled={roundFeedback !== null || finished}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 font-display text-base font-black text-white shadow-lg transition-transform active:scale-95 disabled:opacity-60"
                >
                  <span>🐾 POUNCE!</span>
                </button>
              </div>
            ) : (
              /* ---------------- GAME 2: LASER ZOOMIES CHASE ---------------- */
              <div className="flex flex-col items-center gap-3">
                <div
                  ref={arenaRef}
                  onPointerDown={handleLaserArenaPointerDown}
                  className="relative flex h-48 w-full select-none flex-col justify-between overflow-hidden rounded-2xl border-2 border-amber-900/15 bg-gradient-to-b from-[#fdf6ec] to-[#f4e6d0] p-3 shadow-inner cursor-crosshair touch-none"
                >
                  {/* Cozy living room rug grid texture */}
                  <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#78350f_1px,transparent_1px)] [background-size:12px_12px]" />

                  {/* Top HUD: Round Countdown Progress Bar + Pounces Left */}
                  <div className="relative z-10 flex flex-col gap-1.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-950/10">
                      <div
                        style={{
                          width: `${(Math.max(0, timeLeft) / LASER_ROUND_TIME_SEC) * 100}%`,
                        }}
                        className={`h-full transition-[width] duration-75 ${
                          timeLeft <= 2.0 ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-[10px] font-black tracking-wide uppercase text-amber-900/60">
                        Pounces Left
                      </span>
                      <div className="flex items-center gap-1.5" aria-label={`${pouncesLeft} pounces left`}>
                        {Array.from({ length: MAX_LASER_POUNCES }).map((_, i) => {
                          const active = i < pouncesLeft;
                          return (
                            <span
                              key={i}
                              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs transition-all duration-200 ${
                                active
                                  ? 'bg-amber-500/20 text-amber-900 shadow-2xs scale-100 ring-1 ring-amber-500/40'
                                  : 'bg-amber-950/5 text-amber-950/25 scale-90 grayscale'
                              }`}
                            >
                              🐾
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Temporary missed pounce paw prints on the rug */}
                  {missPaws.map((paw) => (
                    <div
                      key={paw.id}
                      style={{ left: `${paw.x}%`, top: `${paw.y}%` }}
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-2xl opacity-50 animate-ping"
                    >
                      🐾
                    </div>
                  ))}

                  {/* Trapped paw stamp when hit */}
                  {caughtPos && (
                    <div
                      style={{ left: `${caughtPos.x}%`, top: `${caughtPos.y}%` }}
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/25 text-3xl shadow-lg ring-2 ring-emerald-400 animate-bounce"
                    >
                      🐾
                    </div>
                  )}

                  {/* Fast darting red laser dot with glowing halo */}
                  {!caughtPos && (
                    <div
                      style={{ left: `${laserPos.x}%`, top: `${laserPos.y}%` }}
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-none"
                    >
                      {/* Pulsing red halo */}
                      <div className="absolute -inset-3 rounded-full bg-rose-500/30 blur-xs animate-ping" />
                      {/* Bright laser core with shadow glow */}
                      <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 shadow-[0_0_10px_#ef4444,0_0_20px_#f43f5e] ring-2 ring-rose-200">
                        <div className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                      </div>
                    </div>
                  )}

                  {/* Arena status message */}
                  <div className="relative z-10 flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-amber-900">
                    <span>🐱</span>
                    <span>
                      {roundFeedback === 'hit'
                        ? 'Caught it! ✨'
                        : roundFeedback === 'miss'
                          ? missReason === 'timeout'
                            ? 'Time’s up!'
                            : missReason === 'out_of_pounces'
                              ? 'Out of pounces!'
                              : 'Too fast!'
                          : pouncesLeft === 1
                            ? 'Last pounce! Make it count!'
                            : pouncesLeft === 2
                              ? 'Missed! 2 pounces left!'
                              : 'Track the red dot and tap to catch it!'}
                    </span>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* ---------------- SUMMARY BANNER ---------------- */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-gradient-to-b from-amber-200/70 to-amber-100/80 p-4 text-center"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
                {reward.tier === 'perfect' ? <Trophy className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
              </div>
              <h3 className="font-display text-base font-black text-amber-950">
                {reward.tier === 'perfect'
                  ? '3/3 Perfect! 🏆'
                  : reward.tier === 'great'
                    ? '2/3 Great! ✨'
                    : `${hitsSoFar}/3 Good effort! 🐾`}
              </h3>
              <p className="text-xs font-extrabold text-emerald-800">
                {reward.tier === 'perfect'
                  ? `+${reward.bonusJoy} Joy & +1 Churu 🍬`
                  : reward.tier === 'great'
                    ? `+${reward.bonusJoy} Joy`
                    : 'Nice try!'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}