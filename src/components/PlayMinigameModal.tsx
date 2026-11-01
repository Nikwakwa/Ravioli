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

function pickSide(): 'left' | 'right' {
  return Math.random() < 0.5 ? 'left' : 'right';
}

export function PlayMinigameModal({
  action,
  catName,
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

  const [round, setRound] = useState(0);
  const [results, setResults] = useState<('hit' | 'miss')[]>([]);
  const [roundFeedback, setRoundFeedback] = useState<'hit' | 'miss' | null>(null);
  const [finished, setFinished] = useState(false);

  // Feather Pounce state (0..100%)
  const [featherPos, setFeatherPos] = useState(12);
  const posRef = useRef(12);
  const dirRef = useRef<1 | -1>(1);

  // Laser Left/Right state
  const [targetSide, setTargetSide] = useState<'left' | 'right'>(() => pickSide());
  const [chosenSide, setChosenSide] = useState<'left' | 'right' | null>(null);

  // Reset state whenever a new minigame opens
  useEffect(() => {
    if (!action) return;
    setRound(0);
    setResults([]);
    setRoundFeedback(null);
    setFinished(false);
    posRef.current = 12;
    dirRef.current = 1;
    setFeatherPos(12);
    setTargetSide(pickSide());
    setChosenSide(null);
  }, [action]);

  // Animate the feather back and forth at 60fps during active Feather Pounce rounds
  useEffect(() => {
    if (!action || !isFeather || roundFeedback !== null || finished) return;
    let frameId = 0;
    let lastTs = performance.now();
    // Speed increases slightly each round (% per second)
    const speedPerSec = 95 + round * 24;

    const step = (ts: number) => {
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      let next = posRef.current + dirRef.current * speedPerSec * dt;
      if (next >= 96) {
        next = 96;
        dirRef.current = -1;
      } else if (next <= 4) {
        next = 4;
        dirRef.current = 1;
      }
      posRef.current = next;
      setFeatherPos(next);
      frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [action, isFeather, round, roundFeedback, finished]);

  if (!action) return null;

  const advanceRound = (outcome: 'hit' | 'miss') => {
    const nextResults = [...results, outcome];
    setResults(nextResults);
    setRoundFeedback(outcome);

    if (nextResults.length >= MINIGAME_ROUNDS) {
      window.setTimeout(() => {
        setFinished(true);
      }, 550);
      window.setTimeout(() => {
        const totalHits = nextResults.filter((r) => r === 'hit').length;
        onComplete(totalHits);
      }, 1550);
    } else {
      window.setTimeout(() => {
        setRound((r) => r + 1);
        setRoundFeedback(null);
        setChosenSide(null);
        setTargetSide(pickSide());
        posRef.current = Math.random() < 0.5 ? 10 : 90;
        dirRef.current = posRef.current < 50 ? 1 : -1;
        setFeatherPos(posRef.current);
      }, 620);
    }
  };

  const handleFeatherPounce = () => {
    if (roundFeedback !== null || finished) return;
    const hit = isFeatherInSweetSpot(posRef.current, round);
    advanceRound(hit ? 'hit' : 'miss');
  };

  const handlePickPaw = (side: 'left' | 'right') => {
    if (roundFeedback !== null || finished) return;
    setChosenSide(side);
    const hit = side === targetSide;
    advanceRound(hit ? 'hit' : 'miss');
  };

  const hitsSoFar = results.filter((r) => r === 'hit').length;
  const reward = computeMinigameReward(hitsSoFar, MINIGAME_ROUNDS, whimActive);
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
                    {isFeather ? 'Feather Pounce!' : 'Which Paw? Left or Right!'}
                  </h2>
                  {whimActive && (
                    <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-amber-950">
                      💭 2× Joy
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-amber-800/80">
                  {isFeather
                    ? 'Tap POUNCE when the feather enters the green zone!'
                    : `Spot the red glint & guess which paw ${catName} traps it under!`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onComplete(1)}
                className="flex items-center gap-0.5 rounded-full bg-amber-900/10 px-2 py-1 text-[10px] font-extrabold text-amber-900 hover:bg-amber-900/15 active:scale-95"
                title="Skip minigame and play immediately"
              >
                <FastForward className="h-3 w-3" />
                <span>Skip</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Cancel play"
                className="rounded-full bg-amber-900/10 p-1 text-amber-900 hover:bg-amber-900/15"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 3-Round Score Tracker */}
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-amber-950/6 px-3 py-1.5">
            <span className="text-[11px] font-extrabold text-amber-900">
              Round {Math.min(MINIGAME_ROUNDS, round + 1)} of {MINIGAME_ROUNDS}
            </span>
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
            <span className="text-[10px] font-extrabold text-emerald-700">3/3 = +1 Churu 🍬</span>
          </div>

          {/* Game Arena */}
          {!finished ? (
            isFeather ? (
              /* ---------------- GAME 1: FEATHER POUNCE REFLEX ---------------- */
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex h-28 w-full flex-col justify-between overflow-hidden rounded-2xl border border-amber-900/12 bg-gradient-to-b from-amber-100/70 to-amber-50 p-3 shadow-inner">
                  {/* Sweet spot target band */}
                  <div
                    style={{
                      left: `${sweetSpot.min}%`,
                      width: `${sweetSpot.max - sweetSpot.min}%`,
                    }}
                    className="pointer-events-none absolute inset-y-2 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-400/25 transition-all"
                  >
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-1.5 py-0.2 text-[8px] font-black tracking-wider text-white uppercase">
                      Pounce Zone
                    </span>
                  </div>

                  {/* Moving feather indicator */}
                  <div className="relative my-auto h-10 w-full">
                    <div
                      style={{ left: `${featherPos}%` }}
                      className=" absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-none"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl shadow-md ring-2 ring-amber-400">
                        🪶
                      </div>
                    </div>
                  </div>

                  {/* Oli's dilated hunting eyes at the bottom of the arena */}
                  <div className="relative z-10 flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-amber-900">
                    <span>🐱</span>
                    <span>
                      {roundFeedback === 'hit'
                        ? `✨ GOT IT! ${catName} pounced right on the feather!`
                        : roundFeedback === 'miss'
                          ? '💨 Whoosh! The feather slipped past his paws!'
                          : `${catName}’s pupils are huge… wait for the green zone!`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFeatherPounce}
                  disabled={roundFeedback !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 font-display text-base font-black text-white shadow-lg transition-transform active:scale-95 disabled:opacity-60"
                >
                  <span>🐾 POUNCE!</span>
                </button>
              </div>
            ) : (
              /* ---------------- GAME 2: LASER LEFT / RIGHT PAW GUESS ---------------- */
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex w-full flex-col items-center rounded-2xl border border-amber-900/12 bg-gradient-to-b from-amber-100/70 to-amber-50 p-3 shadow-inner">
                  <p className="mb-2 text-center text-[11px] font-extrabold text-amber-900">
                    {roundFeedback === 'hit'
                      ? `🔴 CAUGHT IT! ${catName} trapped the laser dot!`
                      : roundFeedback === 'miss'
                        ? `💨 Zipped away! It was under his ${targetSide.toUpperCase()} paw!`
                        : 'Which paw did the red laser dot zip under?'}
                  </p>

                  <div className="grid w-full grid-cols-2 gap-3">
                    {(['left', 'right'] as const).map((side) => {
                      const isTarget = targetSide === side;
                      const isChosen = chosenSide === side;
                      const revealed = roundFeedback !== null;

                      return (
                        <button
                          key={side}
                          type="button"
                          disabled={revealed}
                          onClick={() => handlePickPaw(side)}
                          className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3.5 transition-all active:scale-95 ${
                            revealed && isTarget
                              ? 'border-emerald-500 bg-emerald-50 shadow-md'
                              : revealed && isChosen && !isTarget
                                ? 'border-rose-400 bg-rose-50'
                                : 'border-amber-900/15 bg-white hover:border-amber-400 hover:bg-amber-50/60 shadow-xs'
                          }`}
                        >
                          {/* Subtle red laser glint tell before choosing */}
                          {!revealed && isTarget && (
                            <motion.span
                              animate={{ opacity: [0.2, 0.75, 0.2], scale: [0.9, 1.25, 0.9] }}
                              transition={{ duration: 0.9, repeat: Infinity }}
                              className="pointer-events-none absolute top-2.5 right-3 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]"
                            />
                          )}

                          {/* Ginger paw with white sock */}
                          <motion.div
                            animate={
                              revealed && (isChosen || isTarget)
                                ? { y: -8, rotate: side === 'left' ? -8 : 8 }
                                : { y: [0, -2, 0] }
                            }
                            transition={{ duration: 0.45 }}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-2xl"
                          >
                            {revealed ? (isTarget ? '🔴' : '🐾') : '🐾'}
                          </motion.div>

                          <span className="font-display text-xs font-extrabold text-amber-950">
                            {side === 'left' ? '⬅️ Left Paw' : 'Right Paw ➡️'}
                          </span>
                        </button>
                      );
                    })}
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
                  ? `3/3 PERFECT POUNCE! 🏆`
                  : reward.tier === 'great'
                    ? `2/3 GREAT PLAY! ✨`
                    : `${hitsSoFar}/3 Fun Workout! 🐾`}
              </h3>
              <p className="text-xs font-extrabold text-emerald-800">
                {reward.tier === 'perfect'
                  ? whimActive
                    ? `+${reward.bonusJoy} Bonus Joy & +1 Churu Tube 🍬 earned!`
                    : `+${reward.bonusJoy} Bonus Joy for a flawless 3/3 run!`
                  : reward.tier === 'great'
                    ? `+${reward.bonusJoy} Bonus Joy for sharp reflexes!`
                    : `${catName} had a blast chasing it around the rug!`}
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
