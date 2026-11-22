import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  BOX_SHUFFLE_ROUND_TIME_SEC,
  buildSnackDeck,
  CAT_TRIVIA_ROUND_TIME_SEC,
  generatePawPattern,
  generateShuffleSwaps,
  getBoxShuffleConfig,
  getPawPatternConfig,
  getPeekTiming,
  getSnackRoundConfig,
  MAX_PEEK_MISTAKES,
  PAW_PADS,
  PEEK_A_BOO_ROUND_TIME_SEC,
  PEEK_SPOTS,
  type SnackCard,
} from '../data/brainGames';
import type { PreparedTriviaQuestion } from '../data/catTrivia';
import { vibrate } from '../utils/feedback';
import { playSound } from '../utils/sound';

export type BrainOutcomeReason =
  | 'caught'
  | 'timeout'
  | 'out_of_boops'
  | 'decoy_tap'
  | 'wrong_box'
  | 'wrong_step'
  | 'wrong_answer';

export interface BrainGameCommonProps {
  round: number;
  roundFeedback: 'hit' | 'miss' | null;
  missReason: string | null;
  timeLeft: number;
  finished: boolean;
  onRoundResult: (outcome: 'hit' | 'miss', reason: BrainOutcomeReason) => void;
  onPauseTimer: (paused: boolean) => void;
}

/* ============================================================================
 * ACTIVE GAME: PEEK-A-BOO (6 spots, multi-boop reflex + decoy mouse in R2–R3)
 * ==========================================================================*/
export function PeekABooGame({
  round,
  roundFeedback,
  missReason,
  timeLeft,
  finished,
  onRoundResult,
  onPauseTimer,
}: BrainGameCommonProps) {
  const cfg = getPeekTiming(round);
  const [activeSpot, setActiveSpot] = useState<number | null>(null);
  const [decoySpot, setDecoySpot] = useState<number | null>(null);
  const [boopsHit, setBoopsHit] = useState(0);
  const [chancesLeft, setChancesLeft] = useState(MAX_PEEK_MISTAKES);
  const [boopedSpot, setBoopedSpot] = useState<number | null>(null);
  const [wrongSpot, setWrongSpot] = useState<number | null>(null);
  const [lastMistakeWasDecoy, setLastMistakeWasDecoy] = useState(false);

  const boopsHitRef = useRef(0);
  const chancesLeftRef = useRef(MAX_PEEK_MISTAKES);
  const lastSpotRef = useRef<number>(-1);
  const cycleTriggerRef = useRef<(() => void) | null>(null);
  const wrongTimerRef = useRef<number | undefined>(undefined);
  const boopFlashTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    onPauseTimer(false);
  }, [round, onPauseTimer]);

  useEffect(() => {
    window.clearTimeout(wrongTimerRef.current);
    window.clearTimeout(boopFlashTimerRef.current);
    boopsHitRef.current = 0;
    chancesLeftRef.current = MAX_PEEK_MISTAKES;
    setBoopsHit(0);
    setChancesLeft(MAX_PEEK_MISTAKES);
    setBoopedSpot(null);
    setWrongSpot(null);
    setLastMistakeWasDecoy(false);
    setActiveSpot(null);
    setDecoySpot(null);
    return () => {
      window.clearTimeout(wrongTimerRef.current);
      window.clearTimeout(boopFlashTimerRef.current);
    };
  }, [round]);

  useEffect(() => {
    if (roundFeedback !== null || finished) return;
    const { peekMs, hideMs, hasDecoy } = getPeekTiming(round);
    let cancelled = false;
    let timerId: number | undefined;

    const clearCycle = () => {
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
        timerId = undefined;
      }
    };

    const schedule = (fn: () => void, ms: number) => {
      clearCycle();
      timerId = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const showNext = () => {
      const allIds = PEEK_SPOTS.map((s) => s.id);
      const candidates = allIds.filter((s) => s !== lastSpotRef.current);
      const next = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
      lastSpotRef.current = next;
      setActiveSpot(next);

      if (hasDecoy && Math.random() < 0.7) {
        const decoyPool = allIds.filter((s) => s !== next);
        setDecoySpot(decoyPool[Math.floor(Math.random() * decoyPool.length)] ?? null);
      } else {
        setDecoySpot(null);
      }

      schedule(() => {
        setActiveSpot(null);
        setDecoySpot(null);
        schedule(showNext, hideMs);
      }, peekMs);
    };

    // Expose quick-advance when the player nails a boop so the next peek pops up briskly
    cycleTriggerRef.current = () => {
      setActiveSpot(null);
      setDecoySpot(null);
      schedule(showNext, Math.min(200, hideMs));
    };

    schedule(showNext, 260);

    return () => {
      cancelled = true;
      cycleTriggerRef.current = null;
      clearCycle();
    };
  }, [round, roundFeedback, finished]);

  const handleTapSpot = (spotId: number) => {
    if (roundFeedback !== null || finished) return;

    if (activeSpot === spotId) {
      const nextHits = boopsHitRef.current + 1;
      boopsHitRef.current = nextHits;
      setBoopsHit(nextHits);
      setBoopedSpot(spotId);
      setLastMistakeWasDecoy(false);

      if (nextHits >= cfg.boopsRequired) {
        onRoundResult('hit', 'caught');
        return;
      }

      playSound('pop');
      vibrate([20, 30]);
      window.clearTimeout(boopFlashTimerRef.current);
      boopFlashTimerRef.current = window.setTimeout(() => {
        setBoopedSpot((cur) => (cur === spotId ? null : cur));
      }, 240);
      cycleTriggerRef.current?.();
      return;
    }

    const hitDecoy = decoySpot === spotId;
    const remaining = Math.max(0, chancesLeftRef.current - 1);
    chancesLeftRef.current = remaining;
    setChancesLeft(remaining);
    setWrongSpot(spotId);
    setLastMistakeWasDecoy(hitDecoy);
    vibrate(25);
    window.clearTimeout(wrongTimerRef.current);
    wrongTimerRef.current = window.setTimeout(() => {
      setWrongSpot((cur) => (cur === spotId ? null : cur));
    }, 340);

    if (remaining <= 0) {
      onRoundResult('miss', hitDecoy ? 'decoy_tap' : 'out_of_boops');
    } else {
      playSound('miss');
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex w-full flex-col gap-2 overflow-hidden rounded-2xl border-2 border-amber-900/12 bg-gradient-to-b from-[#fdf6ec] to-[#f4e6d0] p-3 shadow-inner">
        {/* Top bar: countdown + boop goal + mistakes left */}
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-950/10">
            <div
              style={{ width: `${(Math.max(0, timeLeft) / PEEK_A_BOO_ROUND_TIME_SEC) * 100}%` }}
              className={`h-full transition-[width] duration-75 ${timeLeft <= 2.5 ? 'bg-rose-500' : 'bg-amber-500'}`}
            />
          </div>
          <div className="flex items-center justify-between px-0.5">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black tracking-wide uppercase ${
                boopsHit > 0
                  ? 'bg-emerald-500/20 text-emerald-800 ring-1 ring-emerald-500/40'
                  : 'bg-amber-900/10 text-amber-900'
              }`}
            >
              {`Boops: ${boopsHit}/${cfg.boopsRequired}`}
            </span>
            <div className="flex items-center gap-1" aria-label={`${chancesLeft} tries left`}>
              {Array.from({ length: MAX_PEEK_MISTAKES }).map((_, i) => (
                <span
                  key={i}
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs transition-all ${
                    i < chancesLeft
                      ? 'bg-amber-500/20 text-amber-900 ring-1 ring-amber-500/40'
                      : 'bg-amber-950/5 text-amber-950/25 grayscale'
                  }`}
                >
                  🐾
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 6 Cozy Hiding Spots (3×2 grid) */}
        <div className="grid grid-cols-3 gap-1.5">
          {PEEK_SPOTS.map((spot) => {
            const isPeeking = activeSpot === spot.id && boopedSpot !== spot.id;
            const isDecoy = decoySpot === spot.id && activeSpot !== spot.id;
            const isBooped = boopedSpot === spot.id;
            const isWrong = wrongSpot === spot.id;

            return (
              <motion.button
                key={spot.id}
                type="button"
                whileTap={{ scale: 0.94 }}
                animate={isWrong ? { x: [-4, 4, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.22 }}
                disabled={roundFeedback !== null || finished}
                onClick={() => handleTapSpot(spot.id)}
                aria-label={`Peek at ${spot.label}`}
                className={`relative flex h-[74px] flex-col items-center justify-end rounded-xl border-2 px-1.5 pb-1.5 pt-1 transition-colors ${
                  isBooped
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : isPeeking
                      ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-400/50'
                      : isWrong
                        ? 'border-rose-400 bg-rose-50/85'
                        : 'border-amber-900/12 bg-white/80 hover:bg-white'
                }`}
              >
                {/* Peeking Oli or sneaky decoy mouse */}
                <motion.div
                  initial={false}
                  animate={
                    isPeeking || isBooped || isDecoy
                      ? { y: 0, opacity: 1, scale: 1 }
                      : { y: 14, opacity: 0, scale: 0.7 }
                  }
                  transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                  className="pointer-events-none absolute top-1 flex flex-col items-center"
                >
                  <span className="text-2xl leading-none select-none">
                    {isBooped ? '😻' : isPeeking ? '🐱' : isDecoy ? '🐭' : ''}
                  </span>
                </motion.div>

                {/* Cozy hiding spot label */}
                <div className="relative z-10 flex items-center gap-1 rounded-lg bg-amber-100/95 px-2 py-0.5 shadow-2xs ring-1 ring-amber-900/10">
                  <span className="text-xs leading-none" aria-hidden="true">
                    {spot.emoji}
                  </span>
                  <span className="text-[9px] font-extrabold text-amber-950">{spot.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Status text */}
        <div aria-live="polite" className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-amber-900">
          <span>🙈</span>
          <span>
            {roundFeedback === 'hit'
              ? 'Fast paws! Caught every peek! ✨'
              : roundFeedback === 'miss'
                ? missReason === 'timeout'
                  ? 'Time’s up!'
                  : missReason === 'decoy_tap'
                    ? 'That was a toy mouse! 🐭'
                    : 'Out of tries!'
                : lastMistakeWasDecoy
                  ? 'Watch out — skip the toy mouse 🐭!'
                  : cfg.hasDecoy
                    ? 'Boop Oli 🐱 — ignore the decoy mouse 🐭!'
                    : 'Boop Oli fast before he ducks away!'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * BRAIN GAME: PAW PATTERN (Simon-Says Sequence Memory — Unlocks at Teen)
 * ==========================================================================*/
export function PawPatternGame({
  round,
  roundFeedback,
  missReason,
  timeLeft,
  finished,
  onRoundResult,
  onPauseTimer,
}: BrainGameCommonProps) {
  const cfg = getPawPatternConfig(round);
  const [sequence, setSequence] = useState<number[]>(() => generatePawPattern(cfg.steps));
  const [phase, setPhase] = useState<'watch' | 'repeat' | 'done'>('watch');
  const [litPad, setLitPad] = useState<number | null>(null);
  const [watchIdx, setWatchIdx] = useState<number>(-1);
  const [inputStep, setInputStep] = useState<number>(0);
  const [wrongPad, setWrongPad] = useState<number | null>(null);
  const [expectedPad, setExpectedPad] = useState<number | null>(null);

  const flashTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (finished) return;
    window.clearTimeout(flashTimerRef.current);
    const roundCfg = getPawPatternConfig(round);
    const seq = generatePawPattern(roundCfg.steps);

    setSequence(seq);
    setPhase('watch');
    setLitPad(null);
    setWatchIdx(-1);
    setInputStep(0);
    setWrongPad(null);
    setExpectedPad(null);
    onPauseTimer(true);

    let cancelled = false;
    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(id);
    };

    const stride = roundCfg.stepMs + roundCfg.gapMs;
    seq.forEach((padId, idx) => {
      schedule(() => {
        setWatchIdx(idx);
        setLitPad(padId);
        playSound('pop');
      }, 360 + idx * stride);

      schedule(() => {
        setLitPad(null);
      }, 360 + idx * stride + roundCfg.stepMs);
    });

    schedule(() => {
      setLitPad(null);
      setWatchIdx(-1);
      setPhase('repeat');
      onPauseTimer(false);
    }, 360 + seq.length * stride + 80);

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(flashTimerRef.current);
    };
  }, [round, finished, onPauseTimer]);

  const handleTapPad = (padId: number) => {
    if (phase !== 'repeat' || roundFeedback !== null || finished) return;

    const target = sequence[inputStep];
    if (padId === target) {
      setLitPad(padId);
      vibrate(15);
      playSound('pop');
      window.clearTimeout(flashTimerRef.current);
      flashTimerRef.current = window.setTimeout(() => {
        setLitPad(null);
      }, 220);

      const nextStep = inputStep + 1;
      setInputStep(nextStep);
      if (nextStep >= sequence.length) {
        setPhase('done');
        onRoundResult('hit', 'caught');
      }
    } else {
      setWrongPad(padId);
      setExpectedPad(target);
      setPhase('done');
      onRoundResult('miss', 'wrong_step');
    }
  };

  useEffect(() => {
    if (phase !== 'repeat' || roundFeedback !== null || finished) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') handleTapPad(0);
      else if (e.key === '2') handleTapPad(1);
      else if (e.key === '3') handleTapPad(2);
      else if (e.key === '4') handleTapPad(3);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, roundFeedback, finished, inputStep, sequence]);

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative flex w-full flex-col gap-2.5 overflow-hidden rounded-2xl border-2 border-amber-900/12 bg-gradient-to-b from-[#fdf6ec] to-[#f4e6d0] p-3 shadow-inner">
        {/* Top bar: countdown + step progress dots */}
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-950/10">
            <div
              style={{ width: `${(Math.max(0, timeLeft) / cfg.timeSec) * 100}%` }}
              className={`h-full transition-[width] duration-75 ${
                phase === 'watch'
                  ? 'bg-amber-400/50'
                  : timeLeft <= 2.5
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
              }`}
            />
          </div>
          <div className="flex items-center justify-between px-0.5">
            <span className="rounded-full bg-amber-900/10 px-2 py-0.5 text-[10px] font-black text-amber-900">
              {phase === 'watch'
                ? `👀 Watch (${Math.max(0, watchIdx + 1)}/${cfg.steps})`
                : phase === 'repeat'
                  ? `🐾 Your turn (${inputStep}/${cfg.steps})`
                  : roundFeedback === 'hit'
                    ? '✨ Nailed it!'
                    : '🐾 Oops!'}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: cfg.steps }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    phase === 'watch'
                      ? i <= watchIdx
                        ? 'bg-amber-500'
                        : 'bg-amber-950/15'
                      : i < inputStep
                        ? 'bg-emerald-500'
                        : 'bg-amber-950/15'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2×2 Paw Pillow Pads */}
        <div className="mx-auto grid w-full max-w-[260px] grid-cols-2 gap-2.5">
          {PAW_PADS.map((pad) => {
            const isLit = litPad === pad.id;
            const isWrong = wrongPad === pad.id;
            const isExpected = expectedPad === pad.id;

            return (
              <motion.button
                key={pad.id}
                type="button"
                whileTap={phase === 'repeat' ? { scale: 0.94 } : undefined}
                animate={isWrong ? { x: [-4, 4, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.22 }}
                disabled={phase !== 'repeat' || roundFeedback !== null || finished}
                onClick={() => handleTapPad(pad.id)}
                aria-label={`${pad.label} pillow`}
                className={`relative flex h-16 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 shadow-xs transition-all duration-150 ${
                  isWrong
                    ? 'border-rose-500 bg-rose-200 text-rose-950'
                    : isExpected
                      ? 'border-emerald-500 bg-emerald-200 text-emerald-950 ring-2 ring-emerald-400'
                      : isLit
                        ? pad.litClass
                        : `${pad.idleClass} ${phase === 'repeat' ? 'hover:brightness-105 cursor-pointer' : 'opacity-90'}`
                }`}
              >
                <span className="text-2xl leading-none select-none" aria-hidden="true">
                  {isLit && phase === 'watch' ? '🐾' : pad.emoji}
                </span>
                <span className="text-[10px] font-black tracking-wide uppercase">
                  {pad.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Status text */}
        <div aria-live="polite" className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-amber-900">
          <span>🐱</span>
          <span>
            {roundFeedback === 'hit'
              ? 'Perfect paw memory! ✨'
              : roundFeedback === 'miss'
                ? missReason === 'timeout'
                  ? 'Time’s up!'
                  : 'Wrong pillow — almost had it!'
                : phase === 'watch'
                  ? 'Watch which pillows Oli taps…'
                  : 'Repeat Oli’s paw pattern in order!'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * BRAIN GAME 2: BOX SHUFFLE (Cardboard shell game — Unlocks at Kitten)
 * ==========================================================================*/
const SLOT_LEFT_PCT = [18, 50, 82] as const;

export function BoxShuffleGame({
  round,
  roundFeedback,
  missReason,
  timeLeft,
  finished,
  onRoundResult,
  onPauseTimer,
}: BrainGameCommonProps) {
  const config = getBoxShuffleConfig(round);
  const [phase, setPhase] = useState<'reveal' | 'shuffling' | 'pick' | 'done'>('reveal');
  // boxSlots[boxId] = current visual slot (0 = left, 1 = middle, 2 = right)
  const [boxSlots, setBoxSlots] = useState<[number, number, number]>([0, 1, 2]);
  const [treatBoxId, setTreatBoxId] = useState<number>(1);
  const [pickedBoxId, setPickedBoxId] = useState<number | null>(null);
  const [swappingSlots, setSwappingSlots] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (finished) return;
    const cfg = getBoxShuffleConfig(round);
    const startTreatBox = Math.floor(Math.random() * 3);
    const swaps = generateShuffleSwaps(cfg.swaps);

    setTreatBoxId(startTreatBox);
    setBoxSlots([0, 1, 2]);
    setPickedBoxId(null);
    setSwappingSlots(null);
    setPhase('reveal');
    onPauseTimer(true);

    let cancelled = false;
    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(id);
    };

    schedule(() => {
      setPhase('shuffling');
      let currentSlots: [number, number, number] = [0, 1, 2];

      swaps.forEach(([slotA, slotB], stepIdx) => {
        schedule(() => {
          const boxA = currentSlots.findIndex((s) => s === slotA);
          const boxB = currentSlots.findIndex((s) => s === slotB);
          const nextSlots: [number, number, number] = [...currentSlots];
          if (boxA !== -1 && boxB !== -1) {
            nextSlots[boxA] = slotB;
            nextSlots[boxB] = slotA;
          }
          currentSlots = nextSlots;
          setSwappingSlots([slotA, slotB]);
          setBoxSlots(nextSlots);
          playSound('pop');
        }, stepIdx * cfg.swapMs + 140);
      });

      schedule(() => {
        setSwappingSlots(null);
        setPhase('pick');
        onPauseTimer(false);
      }, swaps.length * cfg.swapMs + 220);
    }, cfg.revealMs);

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [round, finished, onPauseTimer]);

  const handlePickBox = (boxId: number) => {
    if (phase !== 'pick' || roundFeedback !== null || finished) return;
    setPickedBoxId(boxId);
    setPhase('done');
    const hit = boxId === treatBoxId;
    onRoundResult(hit ? 'hit' : 'miss', hit ? 'caught' : 'wrong_box');
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative flex h-48 w-full flex-col justify-between overflow-hidden rounded-2xl border-2 border-amber-900/12 bg-gradient-to-b from-[#fdf6ec] to-[#f4e6d0] p-3 shadow-inner">
        {/* Top bar: countdown + phase badge */}
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-950/10">
            <div
              style={{ width: `${(Math.max(0, timeLeft) / BOX_SHUFFLE_ROUND_TIME_SEC) * 100}%` }}
              className={`h-full transition-[width] duration-75 ${
                phase !== 'pick'
                  ? 'bg-amber-400/50'
                  : timeLeft <= 2.5
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
              }`}
            />
          </div>
          <div className="flex items-center justify-between px-0.5">
            <span className="rounded-full bg-amber-900/10 px-2 py-0.5 text-[10px] font-black text-amber-900">
              {phase === 'reveal'
                ? `👀 Spot the ${config.treatEmoji}`
                : phase === 'shuffling'
                  ? '🔀 Shuffling…'
                  : phase === 'pick'
                    ? '🐾 Pick a box!'
                    : roundFeedback === 'hit'
                      ? '✨ Found it!'
                      : '📦 Wrong box!'}
            </span>
            <span className="text-[10px] font-extrabold text-amber-900/70">
              {`${config.swaps} swaps`}
            </span>
          </div>
        </div>

        {/* 3 Sliding Cardboard Boxes */}
        <div className="relative my-auto h-24 w-full">
          {[0, 1, 2].map((boxId) => {
            const slot = boxSlots[boxId];
            const hasTreat = boxId === treatBoxId;
            const isPicked = pickedBoxId === boxId;
            const lifted =
              (phase === 'reveal' && hasTreat) ||
              (phase === 'done' && (hasTreat || isPicked)) ||
              (roundFeedback === 'miss' && hasTreat);
            const isSwapping = swappingSlots !== null && swappingSlots.includes(slot);

            return (
              <button
                key={boxId}
                type="button"
                disabled={phase !== 'pick' || roundFeedback !== null || finished}
                onClick={() => handlePickBox(boxId)}
                aria-label={`Cardboard box ${slot + 1}`}
                style={{
                  left: `${SLOT_LEFT_PCT[slot]}%`,
                  transitionDuration: `${Math.max(220, config.swapMs - 40)}ms`,
                }}
                className={`absolute top-1/2 flex h-20 w-[27%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl transition-[left] ease-in-out ${
                  phase === 'pick' ? 'cursor-pointer active:scale-95' : 'cursor-default'
                }`}
              >
                {/* Hidden treat sitting underneath the box */}
                <div
                  className={`absolute bottom-1 flex h-9 w-9 items-center justify-center rounded-full text-2xl transition-opacity duration-200 ${
                    lifted && hasTreat ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {config.treatEmoji}
                </div>

                {/* Cardboard box lid that lifts up when revealing */}
                <div
                  className={`relative z-10 flex h-16 w-full flex-col items-center justify-center rounded-2xl border-2 shadow-md transition-all duration-300 ${
                    lifted
                      ? '-translate-y-6 scale-95'
                      : isSwapping
                        ? '-translate-y-1.5'
                        : 'translate-y-0'
                  } ${
                    phase === 'done' && isPicked && hasTreat
                      ? 'border-emerald-500 bg-emerald-100'
                      : phase === 'done' && isPicked && !hasTreat
                        ? 'border-rose-400 bg-rose-100'
                        : phase === 'pick'
                          ? 'border-amber-500/70 bg-gradient-to-b from-[#e9c496] to-[#d6a36a] hover:brightness-105'
                          : 'border-amber-800/30 bg-gradient-to-b from-[#e9c496] to-[#d6a36a]'
                  }`}
                >
                  <span className="text-2xl leading-none select-none" aria-hidden="true">
                    📦
                  </span>
                  <span className="mt-0.5 text-[9px] font-black tracking-wide uppercase text-amber-950/75">
                    {phase === 'done' && isPicked && !hasTreat ? 'Empty' : 'Box'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Status line */}
        <div aria-live="polite" className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-amber-900">
          <span>🐱</span>
          <span>
            {roundFeedback === 'hit'
              ? `Found the ${config.treatName}! ✨`
              : roundFeedback === 'miss'
                ? missReason === 'timeout'
                  ? 'Time’s up!'
                  : `It was under another box!`
                : phase === 'reveal'
                  ? `Watch where the ${config.treatName} hides!`
                  : phase === 'shuffling'
                    ? 'Keep your eyes on the box…'
                    : 'Tap the box hiding the treat!'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * BRAIN GAME 3: SNACK MATCH (Memory Flip Pairs — Unlocks at Teen)
 * ==========================================================================*/
export function SnackMatchGame({
  round,
  roundFeedback,
  missReason,
  timeLeft,
  finished,
  onRoundResult,
  onPauseTimer,
}: BrainGameCommonProps) {
  const config = getSnackRoundConfig(round);
  const [deck, setDeck] = useState<SnackCard[]>(() => buildSnackDeck(config.pairs));
  const [phase, setPhase] = useState<'preview' | 'playing'>('preview');
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const mismatchTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (finished) return;
    window.clearTimeout(mismatchTimerRef.current);
    const cfg = getSnackRoundConfig(round);
    setDeck(buildSnackDeck(cfg.pairs));
    setPhase('preview');
    setFlippedUids([]);
    setMatchedPairIds([]);
    setLocked(false);
    onPauseTimer(true);

    const id = window.setTimeout(() => {
      setPhase('playing');
      onPauseTimer(false);
    }, cfg.previewMs);

    return () => {
      window.clearTimeout(id);
      window.clearTimeout(mismatchTimerRef.current);
    };
  }, [round, finished, onPauseTimer]);

  const handleFlipCard = (card: SnackCard) => {
    if (phase !== 'playing' || locked || roundFeedback !== null || finished) return;
    if (matchedPairIds.includes(card.pairId) || flippedUids.includes(card.uid)) return;

    playSound('pop');
    vibrate(12);

    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length < 2) return;

    const firstCard = deck.find((c) => c.uid === nextFlipped[0]);
    if (firstCard && firstCard.pairId === card.pairId) {
      const nextMatched = [...matchedPairIds, card.pairId];
      setMatchedPairIds(nextMatched);
      setFlippedUids([]);
      vibrate([20, 35]);

      if (nextMatched.length >= config.pairs) {
        onRoundResult('hit', 'caught');
      }
    } else {
      setLocked(true);
      window.clearTimeout(mismatchTimerRef.current);
      mismatchTimerRef.current = window.setTimeout(() => {
        setFlippedUids([]);
        setLocked(false);
      }, 500);
    }
  };

  const gridColsClass =
    config.columns === 2 ? 'grid-cols-2 max-w-[200px]' : config.columns === 3 ? 'grid-cols-3 max-w-[260px]' : 'grid-cols-4';

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative flex min-h-52 w-full flex-col justify-between overflow-hidden rounded-2xl border-2 border-amber-900/12 bg-gradient-to-b from-[#fdf6ec] to-[#f4e6d0] p-3 shadow-inner">
        {/* Top bar: countdown + pair counter */}
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-950/10">
            <div
              style={{ width: `${(Math.max(0, timeLeft) / config.timeSec) * 100}%` }}
              className={`h-full transition-[width] duration-75 ${
                phase === 'preview'
                  ? 'bg-amber-400/50'
                  : timeLeft <= 3.0
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
              }`}
            />
          </div>
          <div className="flex items-center justify-between px-0.5">
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-800">
              {`Pairs: ${matchedPairIds.length}/${config.pairs}`}
            </span>
            <span className="text-[10px] font-extrabold text-amber-900/70">
              {phase === 'preview' ? '👀 Memorize!' : '🃏 Match all pairs'}
            </span>
          </div>
        </div>

        {/* Card Grid */}
        <div className={`mx-auto my-2 grid w-full gap-2 ${gridColsClass}`}>
          {deck.map((card) => {
            const isMatched = matchedPairIds.includes(card.pairId);
            const isFaceUp = phase === 'preview' || isMatched || flippedUids.includes(card.uid);

            return (
              <motion.button
                key={card.uid}
                type="button"
                whileTap={!isFaceUp ? { scale: 0.93 } : undefined}
                disabled={phase !== 'playing' || isFaceUp || locked || roundFeedback !== null || finished}
                onClick={() => handleFlipCard(card)}
                aria-label={isFaceUp ? card.label : 'Hidden snack card'}
                className={`flex h-14 items-center justify-center rounded-xl border-2 text-2xl transition-all duration-200 ${
                  isMatched
                    ? 'border-emerald-400 bg-emerald-50 shadow-2xs scale-95'
                    : isFaceUp
                      ? 'border-amber-400 bg-white shadow-sm'
                      : 'border-amber-800/20 bg-gradient-to-b from-amber-200 to-orange-200/90 hover:brightness-105 shadow-xs'
                }`}
              >
                <span className="select-none">{isFaceUp ? card.emoji : '🐾'}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Status text */}
        <div aria-live="polite" className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-amber-900">
          <span>🐱</span>
          <span>
            {roundFeedback === 'hit'
              ? 'All snacks matched! ✨'
              : roundFeedback === 'miss'
                ? missReason === 'timeout'
                  ? 'Time’s up!'
                  : 'Almost had it!'
                : phase === 'preview'
                  ? 'Quick peek — remember the spots!'
                  : 'Flip two matching cards!'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * BRAIN GAME 4: CAT TRIVIA (Knowledge Quiz — Unlocks at Adult!)
 * ==========================================================================*/
export interface CatTriviaGameProps extends BrainGameCommonProps {
  question: PreparedTriviaQuestion;
}

const CHOICE_LETTERS = ['A', 'B', 'C'] as const;

export function CatTriviaGame({
  round,
  roundFeedback,
  missReason,
  timeLeft,
  finished,
  question,
  onRoundResult,
  onPauseTimer,
}: CatTriviaGameProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelectedIndex(null);
    onPauseTimer(false);
  }, [round, onPauseTimer]);

  const handleChoose = (idx: number) => {
    if (roundFeedback !== null || finished || selectedIndex !== null) return;
    setSelectedIndex(idx);
    const isCorrect = idx === question.answerIndex;
    onRoundResult(isCorrect ? 'hit' : 'miss', isCorrect ? 'caught' : 'wrong_answer');
  };

  useEffect(() => {
    if (roundFeedback !== null || finished) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') handleChoose(0);
      else if (e.key === '2') handleChoose(1);
      else if (e.key === '3') handleChoose(2);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [round, roundFeedback, finished, selectedIndex, question]);

  const answered = roundFeedback !== null;

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative flex w-full flex-col gap-2.5 overflow-hidden rounded-2xl border-2 border-amber-900/12 bg-gradient-to-b from-[#fdf6ec] to-[#f4e6d0] p-3 shadow-inner">
        {/* Round Countdown Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-950/10">
          <div
            style={{ width: `${(Math.max(0, timeLeft) / CAT_TRIVIA_ROUND_TIME_SEC) * 100}%` }}
            className={`h-full transition-[width] duration-75 ${timeLeft <= 3.5 ? 'bg-rose-500' : 'bg-amber-500'}`}
          />
        </div>

        {/* Question prompt */}
        <p className="font-display text-[13px] font-extrabold leading-snug text-amber-950">
          {question.prompt}
        </p>

        {/* 3 Multiple-Choice Buttons */}
        <div className="flex flex-col gap-1.5">
          {question.choices.map((choice, idx) => {
            const isCorrectChoice = idx === question.answerIndex;
            const isPicked = selectedIndex === idx;

            let toneClass = 'border-amber-900/12 bg-white/90 text-amber-950 hover:bg-amber-50';
            if (answered) {
              if (isCorrectChoice) {
                toneClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-400';
              } else if (isPicked) {
                toneClass = 'border-rose-400 bg-rose-50 text-rose-900';
              } else {
                toneClass = 'border-amber-900/8 bg-white/50 text-amber-900/50';
              }
            }

            return (
              <motion.button
                key={`${question.id}-${idx}`}
                type="button"
                whileTap={!answered ? { scale: 0.98 } : undefined}
                disabled={answered || finished}
                onClick={() => handleChoose(idx)}
                className={`flex w-full items-center gap-2 rounded-xl border-2 px-2.5 py-2 text-left text-xs font-bold transition-colors ${toneClass}`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                    answered && isCorrectChoice
                      ? 'bg-emerald-500 text-white'
                      : answered && isPicked
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-900/10 text-amber-900'
                  }`}
                >
                  {answered && isCorrectChoice ? '✓' : answered && isPicked ? '×' : CHOICE_LETTERS[idx]}
                </span>
                <span className="leading-snug">{choice}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Post-answer fun fact or prompt hint */}
        <div
          aria-live="polite"
          className={`flex min-h-8 items-center justify-center rounded-xl px-2.5 py-1.5 text-center text-[11px] font-bold leading-snug ${
            answered
              ? roundFeedback === 'hit'
                ? 'bg-emerald-500/15 text-emerald-900'
                : 'bg-rose-500/12 text-rose-900'
              : 'bg-amber-950/5 text-amber-900/80'
          }`}
        >
          {answered
            ? `${roundFeedback === 'hit' ? '✨ Correct! ' : missReason === 'timeout' ? '⏱️ Time’s up! ' : '🐱 Good to know: '}${question.fact}`
            : 'Tap the best answer (or press 1, 2, 3)!'}
        </div>
      </div>
    </div>
  );
}
