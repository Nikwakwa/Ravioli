import { AnimatePresence, motion } from 'framer-motion';
import { FastForward, Sparkles, Trophy, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  computeMinigameReward,
  getFeatherSweetSpot,
  getTailCatchZone,
  isFeatherInSweetSpot,
  isTailInCatchZone,
  MINIGAME_ROUNDS,
  type CareAction,
} from '../data/actions';
import { vibrate } from '../utils/feedback';

export const MINIGAME_ROUND_TIME_SEC = 10.0;
export const FEATHER_ROUND_TIME_SEC = 10.0;
export const LASER_ROUND_TIME_SEC = 5.0;
export const TAIL_ROUND_TIME_SEC = 8.0;
export const RED_BALL_ROUND_TIME_SEC = 8.0;
export const MAX_LASER_POUNCES = 3;
export const RED_BALL_BATS_REQUIRED = 2;
export const RED_BALL_PADDLE_HALF_WIDTH_PCT = 17;
export const LASER_HIT_RADIUS_PX = 26;

function getRoundDurationSec(actionId?: string): number {
  switch (actionId) {
    case 'feather_wand':
      return FEATHER_ROUND_TIME_SEC;
    case 'tail_chase':
      return TAIL_ROUND_TIME_SEC;
    case 'red_ball':
      return RED_BALL_ROUND_TIME_SEC;
    case 'laser_pointer':
    default:
      return LASER_ROUND_TIME_SEC;
  }
}

/** Polar-to-cartesian helper for drawing the SVG circular Nab Zone arc in Tail Spin. */
function polarToCartesian(cx: number, cy: number, r: number, angleDegFromTop: number) {
  const rad = ((angleDegFromTop - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeTopArc(cx: number, cy: number, r: number, halfSpanDeg: number): string {
  const start = polarToCartesian(cx, cy, r, -halfSpanDeg);
  const end = polarToCartesian(cx, cy, r, halfSpanDeg);
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

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
  const isTail = action?.id === 'tail_chase';
  const isRedBall = action?.id === 'red_ball';

  const roundDuration = getRoundDurationSec(action?.id);

  const [round, setRound] = useState(0);
  const [results, setResults] = useState<('hit' | 'miss')[]>([]);
  const [roundFeedback, setRoundFeedback] = useState<'hit' | 'miss' | null>(null);
  const [missReason, setMissReason] = useState<
    'caught' | 'miss_tap' | 'timeout' | 'out_of_pounces' | 'under_sofa' | null
  >(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(roundDuration);
  const [pouncesLeft, setPouncesLeft] = useState(MAX_LASER_POUNCES);

  // Feather Pounce position state (0..100%)
  const [featherPos, setFeatherPos] = useState(12);
  const posRef = useRef(12);
  const dirRef = useRef<1 | -1>(1);

  // Tail Spin continuous unwrapped angle (deg, 0 = top 12 o'clock; never modulo-wrapped so rotation never snaps)
  const [tailAngle, setTailAngle] = useState(180);
  const tailAngleRef = useRef(180);
  const tailDirRef = useRef<1 | -1>(1);

  // Laser Zoomies & Red Ball 2D movement state (percentages inside arena)
  const [laserPos, setLaserPos] = useState({ x: 50, y: 50 });
  const [caughtPos, setCaughtPos] = useState<{ x: number; y: number } | null>(null);
  const [missPaws, setMissPaws] = useState<{ id: number; x: number; y: number }[]>([]);

  // Red Ball "Sofa Bounce" paddle goalie state
  const [pawX, setPawX] = useState(50);
  const pawXRef = useRef(50);
  const [ballBats, setBallBats] = useState(0);
  const ballBatsRef = useRef(0);
  const [batBouncePos, setBatBouncePos] = useState<{ x: number; y: number } | null>(null);
  const [ballSpinDeg, setBallSpinDeg] = useState(0);
  const ballSpinRef = useRef(0);

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

  const launchRedBallForRound = (roundIdx: number) => {
    const startX = 26 + Math.random() * 48;
    const startPos = { x: startX, y: 18 };
    laserPosRef.current = startPos;
    setLaserPos(startPos);
    const vy = 52 + roundIdx * 13; // R1: 52%/s, R2: 65%/s, R3: 78%/s downward
    const vxMag = 36 + roundIdx * 12;
    const vxDir = startX < 50 ? 1 : -1;
    laserVelRef.current = { vx: vxDir * vxMag, vy };
  };

  // Reset state whenever a new minigame action opens
  useEffect(() => {
    clearTimers();
    if (!action) return;
    const dur = getRoundDurationSec(action.id);
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

    // Reset Tail state
    tailAngleRef.current = 180;
    tailDirRef.current = 1;
    setTailAngle(180);

    // Reset Red Ball / Laser state
    setCaughtPos(null);
    setMissPaws([]);
    pawXRef.current = 50;
    setPawX(50);
    ballBatsRef.current = 0;
    setBallBats(0);
    setBatBouncePos(null);
    ballSpinRef.current = 0;
    setBallSpinDeg(0);

    if (action.id === 'red_ball') {
      launchRedBallForRound(0);
    } else {
      laserPosRef.current = { x: 50, y: 50 };
      setLaserPos({ x: 50, y: 50 });
      const angle = Math.random() * 2 * Math.PI;
      const initialSpeed = 65;
      laserVelRef.current = { vx: Math.cos(angle) * initialSpeed, vy: Math.sin(angle) * initialSpeed };
      laserNextTurnRef.current = performance.now() + 380 + Math.random() * 400;
    }

    return () => clearTimers();
  }, [action]);

  useEffect(() => {
    if (!action) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if ((e.key === ' ' || e.key === 'Enter') && roundFeedback === null && !finished) {
        if (isFeather) {
          e.preventDefault();
          const hit = isFeatherInSweetSpot(posRef.current, round);
          advanceRound(hit ? 'hit' : 'miss', hit ? 'caught' : 'miss_tap');
        } else if (isTail) {
          e.preventDefault();
          const hit = isTailInCatchZone(tailAngleRef.current, round);
          advanceRound(hit ? 'hit' : 'miss', hit ? 'caught' : 'miss_tap');
        }
      } else if (isRedBall && roundFeedback === null && !finished) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          const next = Math.max(16, pawXRef.current - 10);
          pawXRef.current = next;
          setPawX(next);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          const next = Math.min(84, pawXRef.current + 10);
          pawXRef.current = next;
          setPawX(next);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [action, isFeather, isTail, isRedBall, round, roundFeedback, finished, onCancel]);

  // Main 60fps animation frame loop for movement & timer countdown
  useEffect(() => {
    if (!action || roundFeedback !== null || finished) return;

    let frameId = 0;
    let lastTs = performance.now();

    // Speed scaling per round
    const featherSpeed = 95 + round * 24; // % per second
    const tailSpeed = 195 + round * 45; // deg per second (R1: 195, R2: 240, R3: 285)
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
      } else if (isTail) {
        // Unwrapped continuous angle so Oli's center head & tail never glitch at 360° -> 0°
        const nextAngle = tailAngleRef.current + tailDirRef.current * tailSpeed * dt;
        tailAngleRef.current = nextAngle;
        setTailAngle(nextAngle);
      } else if (isRedBall) {
        const MIN_X = 10;
        const MAX_X = 90;
        const MIN_Y = 16;
        const PAW_LINE_Y = 74;

        const prevY = laserPosRef.current.y;
        let nx = laserPosRef.current.x + laserVelRef.current.vx * dt;
        let ny = laserPosRef.current.y + laserVelRef.current.vy * dt;

        // Bounce off left and right walls
        if (nx <= MIN_X) {
          nx = MIN_X;
          laserVelRef.current.vx = Math.abs(laserVelRef.current.vx);
        } else if (nx >= MAX_X) {
          nx = MAX_X;
          laserVelRef.current.vx = -Math.abs(laserVelRef.current.vx);
        }

        // Bounce off top wall
        if (ny <= MIN_Y) {
          ny = MIN_Y;
          laserVelRef.current.vy = Math.abs(laserVelRef.current.vy);
        }

        // Check if ball is crossing Oli's sliding paw paddle line on its way toward the sofa
        if (laserVelRef.current.vy > 0 && prevY <= PAW_LINE_Y + 4 && ny >= PAW_LINE_Y - 3) {
          const offsetFromPaw = nx - pawXRef.current;
          if (Math.abs(offsetFromPaw) <= RED_BALL_PADDLE_HALF_WIDTH_PCT) {
            const nextBats = ballBatsRef.current + 1;
            ballBatsRef.current = nextBats;
            setBallBats(nextBats);

            if (nextBats >= RED_BALL_BATS_REQUIRED) {
              // Second save traps the red ball under Oli's paw!
              laserPosRef.current = { x: nx, y: PAW_LINE_Y };
              setLaserPos({ x: nx, y: PAW_LINE_Y });
              setCaughtPos({ x: nx, y: PAW_LINE_Y });
              advanceRound('hit', 'caught');
              return;
            }

            // First save: bat the ball back up across the floor!
            ny = PAW_LINE_Y - 3.5;
            const bounceVy = -(56 + round * 14);
            const deflectionVx = offsetFromPaw * 2.4 + (Math.random() - 0.5) * 18;
            const clampedVx = Math.max(-78, Math.min(78, laserVelRef.current.vx * 0.55 + deflectionVx));
            laserVelRef.current = {
              vx: Math.abs(clampedVx) < 28 ? (clampedVx >= 0 ? 34 : -34) : clampedVx,
              vy: bounceVy,
            };

            vibrate([20, 35]);
            setBatBouncePos({ x: nx, y: PAW_LINE_Y });
            safeTimeout(() => {
              setBatBouncePos(null);
            }, 380);
          }
        }

        // Missed the paw paddle — rolled under the sofa!
        if (ny >= 92) {
          laserPosRef.current = { x: nx, y: 92 };
          setLaserPos({ x: nx, y: 92 });
          advanceRound('miss', 'under_sofa');
          return;
        }

        laserPosRef.current = { x: nx, y: ny };
        setLaserPos({ x: nx, y: ny });

        const speedMag = Math.hypot(laserVelRef.current.vx, laserVelRef.current.vy);
        ballSpinRef.current += speedMag * dt * 4.2;
        setBallSpinDeg(ballSpinRef.current);
      } else {
        const MIN_X = 10;
        const MAX_X = 90;
        const MIN_Y = 14;
        const MAX_Y = 86;

        // Erratic darting heading jitter for laser pointer
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
  }, [action, isFeather, isTail, isRedBall, round, roundFeedback, finished]);

  if (!action) return null;

  const advanceRound = (
    outcome: 'hit' | 'miss',
    reason?: 'caught' | 'miss_tap' | 'timeout' | 'out_of_pounces' | 'under_sofa',
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
        const nextRound = round + 1;
        setRound(nextRound);
        setRoundFeedback(null);
        setMissReason(null);
        setCaughtPos(null);
        setMissPaws([]);
        setBatBouncePos(null);
        ballBatsRef.current = 0;
        setBallBats(0);
        pounceCooldownRef.current = false;

        const dur = getRoundDurationSec(action.id);
        timeLeftRef.current = dur;
        setTimeLeft(dur);
        pouncesLeftRef.current = MAX_LASER_POUNCES;
        setPouncesLeft(MAX_LASER_POUNCES);

        // Reset feather starting side
        posRef.current = Math.random() < 0.5 ? 10 : 90;
        dirRef.current = posRef.current < 50 ? 1 : -1;
        setFeatherPos(posRef.current);

        // Reset tail starting position & alternate spin direction each round
        tailDirRef.current = nextRound % 2 === 1 ? -1 : 1;
        tailAngleRef.current = 180;
        setTailAngle(180);

        if (isRedBall) {
          launchRedBallForRound(nextRound);
        } else {
          laserPosRef.current = { x: 50, y: 50 };
          setLaserPos({ x: 50, y: 50 });
          const speed = 65 + nextRound * 40;
          const angle = Math.random() * 2 * Math.PI;
          laserVelRef.current = { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
          laserNextTurnRef.current = performance.now() + 350 + Math.random() * 400;
        }
      }, 650);
    }
  };

  const handleFeatherPounce = () => {
    if (roundFeedback !== null || finished) return;
    const hit = isFeatherInSweetSpot(posRef.current, round);
    advanceRound(hit ? 'hit' : 'miss', hit ? 'caught' : 'miss_tap');
  };

  const handleTailNab = () => {
    if (roundFeedback !== null || finished) return;
    const hit = isTailInCatchZone(tailAngleRef.current, round);
    advanceRound(hit ? 'hit' : 'miss', hit ? 'caught' : 'miss_tap');
  };

  const updateRedBallPawFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arenaRef.current || roundFeedback !== null || finished) return;
    const rect = arenaRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rawPct = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(16, Math.min(84, rawPct));
    pawXRef.current = clamped;
    setPawX(clamped);
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
  const tailCatchZone = getTailCatchZone(round);

  const headerEmoji = isFeather ? '🪶' : isTail ? '🌀' : '🔴';
  const headerTitle = isFeather
    ? 'Feather Pounce!'
    : isTail
      ? 'Tail Spin!'
      : isRedBall
        ? 'Red Ball Rally!'
        : 'Laser Zoomies!';
  const headerInstruction = isFeather
    ? 'Tap POUNCE in the green zone!'
    : isTail
      ? 'Nab his tail in the green zone!'
      : isRedBall
        ? 'Slide Oli’s paw to keep the ball from rolling under the sofa!'
        : `Catch the red dot in ${MAX_LASER_POUNCES} pounces or less!`;

  const lowTimeThreshold = isFeather || isTail || isRedBall ? 2.5 : 2.0;

  // Tail Spin orbit coordinates (radius = 38% around center 50%, 50%)
  const tailRad = (tailAngle * Math.PI) / 180;
  const tailOrbitX = 50 + Math.sin(tailRad) * 38;
  const tailOrbitY = 50 - Math.cos(tailRad) * 38;
  const isTailCurrentlyInZone = isTailInCatchZone(tailAngle, round);
  // Smooth periodic head motion (sin/cos of tailRad) so Oli's head follows the tail without ever snapping at 360°
  const headOffsetX = Math.sin(tailRad) * 2.5;
  const headOffsetY = -Math.cos(tailRad) * 2.5;
  const headTiltDeg = Math.sin(tailRad) * 16;

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
                {headerEmoji}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display text-sm font-extrabold leading-tight text-amber-950">
                    {headerTitle}
                  </h2>
                  {whimActive && (
                    <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-amber-950">
                      💭 2× Joy
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-amber-800/80">
                  {headerInstruction}{' '}
                  <span className="whitespace-nowrap text-emerald-700">3/3 = +1 🍬 point</span>
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
                    timeLeft <= lowTimeThreshold
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
                        width: `${(Math.max(0, timeLeft) / FEATHER_ROUND_TIME_SEC) * 100}%`,
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
            ) : isTail ? (
              /* ---------------- GAME 2: SOLO TAIL SPIN CHASE ---------------- */
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex h-48 w-full flex-col items-center justify-between overflow-hidden rounded-2xl border border-amber-900/12 bg-gradient-to-b from-amber-100/70 to-[#fdf6ec] p-3 shadow-inner">
                  {/* Round Countdown Progress Bar */}
                  <div className="relative z-10 h-1.5 w-full overflow-hidden rounded-full bg-amber-950/10">
                    <div
                      style={{
                        width: `${(Math.max(0, timeLeft) / TAIL_ROUND_TIME_SEC) * 100}%`,
                      }}
                      className={`h-full transition-[width] duration-75 ${
                        timeLeft <= 2.5 ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>

                  {/* Circular 360° Tail Spin Ring */}
                  <div className="relative my-auto flex h-36 w-36 items-center justify-center">
                    {/* SVG ring + green Nab Zone arc at top */}
                    <svg viewBox="0 0 120 120" className="pointer-events-none absolute inset-0 h-full w-full">
                      <circle
                        cx={60}
                        cy={60}
                        r={45.5}
                        fill="none"
                        stroke="rgba(120, 53, 15, 0.14)"
                        strokeWidth={9}
                        strokeDasharray="6 5"
                      />
                      <path
                        d={describeTopArc(60, 60, 45.5, tailCatchZone.halfSpanDeg)}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={11}
                        strokeLinecap="round"
                        opacity={isTailCurrentlyInZone ? 0.95 : 0.65}
                      />
                    </svg>

                    {/* Nab Zone pill at 12 o'clock */}
                    <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] leading-none font-black tracking-wider whitespace-nowrap text-white uppercase shadow-xs">
                      Nab Zone
                    </span>

                    {/* Center Oli smoothly tracking his tail without loop-wrap snaps */}
                    <div className="flex flex-col items-center justify-center rounded-full bg-white/85 px-2.5 py-1.5 shadow-xs ring-1 ring-amber-900/10">
                      <span
                        style={{
                          transform: `translate(${headOffsetX.toFixed(2)}px, ${headOffsetY.toFixed(2)}px) rotate(${headTiltDeg.toFixed(2)}deg)`,
                        }}
                        className="inline-block text-2xl leading-none select-none transition-none"
                      >
                        🐱
                      </span>
                      <span className="mt-0.5 text-[9px] font-black text-amber-800/80">
                        {round % 2 === 1 ? '↺ Spin' : '↻ Spin'}
                      </span>
                    </div>

                    {/* Orbiting ginger-and-white tail tip */}
                    <div
                      style={{ left: `${tailOrbitX}%`, top: `${tailOrbitY}%` }}
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-none"
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md ring-2 transition-transform ${
                          isTailCurrentlyInZone ? 'scale-110 ring-emerald-500' : 'ring-amber-400'
                        }`}
                      >
                        <svg viewBox="0 0 32 32" className="h-6 w-6">
                          {/* Ginger tail with tabby stripes and Oli's white tip */}
                          <path
                            d="M7 24 C10 15 17 9 25 8"
                            stroke="#f08a3c"
                            strokeWidth={6.5}
                            strokeLinecap="round"
                            fill="none"
                          />
                          <path
                            d="M9 21 C12 15 16 11 21 9"
                            stroke="#d2681f"
                            strokeWidth={6.5}
                            strokeDasharray="3 3.5"
                            fill="none"
                          />
                          <path
                            d="M21 9 C23 8.3 24.5 8 25.5 8"
                            stroke="#fff6ea"
                            strokeWidth={6.5}
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Oli's reaction & status text */}
                <div aria-live="polite" className="flex min-h-8 items-center justify-center gap-1.5 px-1 text-center text-[11px] font-extrabold text-amber-900">
                  <span>🐱</span>
                  <span>
                    {roundFeedback === 'hit'
                      ? 'Got his own tail! 🌀✨'
                      : roundFeedback === 'miss'
                        ? missReason === 'timeout'
                          ? 'Time’s up!'
                          : 'Dizzy miss! 💫'
                        : 'Tap NAB TAIL when the white tip hits the green arc!'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTailNab}
                  disabled={roundFeedback !== null || finished}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 font-display text-base font-black text-white shadow-lg transition-transform active:scale-95 disabled:opacity-60"
                >
                  <span>🌀 NAB TAIL!</span>
                </button>
              </div>
            ) : isRedBall ? (
              /* ---------------- GAME 3: RED BALL SOFA RALLY (PADDLE GOALIE) ---------------- */
              <div className="flex flex-col items-center gap-2.5">
                <div
                  ref={arenaRef}
                  onPointerDown={updateRedBallPawFromPointer}
                  onPointerMove={(e) => {
                    if (e.buttons > 0 || e.pointerType === 'mouse' || e.pointerType === 'touch') {
                      updateRedBallPawFromPointer(e);
                    }
                  }}
                  className="relative flex h-52 w-full select-none flex-col justify-between overflow-hidden rounded-2xl border-2 border-amber-900/15 bg-gradient-to-b from-[#fdf6ec] to-[#f4e6d0] p-3 shadow-inner cursor-ew-resize touch-none"
                >
                  {/* Cozy living room rug grid texture */}
                  <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#78350f_1px,transparent_1px)] [background-size:12px_12px]" />

                  {/* Top HUD: Round Countdown + Save Counter */}
                  <div className="relative z-10 flex flex-col gap-1.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-950/10">
                      <div
                        style={{
                          width: `${(Math.max(0, timeLeft) / RED_BALL_ROUND_TIME_SEC) * 100}%`,
                        }}
                        className={`h-full transition-[width] duration-75 ${
                          timeLeft <= 2.5 ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between px-0.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black tracking-wide uppercase transition-colors ${
                          ballBats >= 1
                            ? 'bg-emerald-500/20 text-emerald-800 ring-1 ring-emerald-500/40'
                            : 'bg-amber-900/10 text-amber-900/75'
                        }`}
                      >
                        {`Saves: ${ballBats}/${RED_BALL_BATS_REQUIRED}`}
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-900/70">
                        ↔ Slide paw to block
                      </span>
                    </div>
                  </div>

                  {/* Bounce burst when Oli bats the ball back */}
                  {batBouncePos && (
                    <div
                      style={{ left: `${batBouncePos.x}%`, top: `${batBouncePos.y}%` }}
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/30 text-lg font-black text-emerald-900 ring-2 ring-emerald-400 animate-ping"
                    >
                      🐾
                    </div>
                  )}

                  {/* Trapped paw stamp when caught on 2nd save */}
                  {caughtPos && (
                    <div
                      style={{ left: `${caughtPos.x}%`, top: `${caughtPos.y}%` }}
                      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/25 text-3xl shadow-lg ring-2 ring-emerald-400 animate-bounce"
                    >
                      🐾
                    </div>
                  )}

                  {/* Rolling Small Red Ball */}
                  {!caughtPos && (
                    <div
                      style={{ left: `${laserPos.x}%`, top: `${laserPos.y}%` }}
                      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-none"
                    >
                      <div className="absolute -bottom-1 left-1/2 h-2 w-6 -translate-x-1/2 rounded-full bg-amber-950/25 blur-[1px]" />
                      <div
                        style={{ transform: `rotate(${ballSpinDeg}deg)` }}
                        className={`relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-red-600 to-rose-900 shadow-md ring-2 ${
                          ballBats >= 1 ? 'ring-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.45)]' : 'ring-red-200/80'
                        }`}
                      >
                        <div className="h-4 w-4 rounded-full border border-dashed border-white/45" />
                        <div className="absolute top-1 left-1.5 h-2 w-2 rounded-full bg-white/85" />
                      </div>
                    </div>
                  )}

                  {/* Oli's Sliding Paw Paddle along the defense line (y = 74%) */}
                  <div
                    style={{
                      left: `${pawX}%`,
                      top: '74%',
                      width: `${RED_BALL_PADDLE_HALF_WIDTH_PCT * 2}%`,
                    }}
                    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-none"
                  >
                    <div className="flex h-7 w-full items-center justify-center gap-1 rounded-full border-2 border-amber-500 bg-gradient-to-b from-amber-300 to-amber-400 px-2 shadow-md">
                      <span className="text-sm leading-none">🐾</span>
                      <span className="text-[9px] font-black tracking-wider uppercase text-amber-950">
                        Oli’s Paw
                      </span>
                    </div>
                  </div>

                  {/* Dark "Under the Sofa" hazard gap at the bottom edge */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-7 items-center justify-center border-t-2 border-dashed border-rose-500/40 bg-stone-900/85 text-[10px] font-black tracking-wider text-rose-200 uppercase">
                    🛋️ Under the Sofa — Don’t let it roll in!
                  </div>
                </div>

                {/* Status message below arena */}
                <div aria-live="polite" className="flex min-h-6 items-center justify-center gap-1.5 px-1 text-center text-[11px] font-extrabold text-amber-900">
                  <span>🐱</span>
                  <span>
                    {roundFeedback === 'hit'
                      ? 'Saved & trapped the red ball! ✨'
                      : roundFeedback === 'miss'
                        ? missReason === 'under_sofa'
                          ? 'Lost under the sofa! 🛋️'
                          : 'Time’s up!'
                        : ballBats >= 1
                          ? 'Nice bat! Bounce it 1 more time to trap it!'
                          : 'Slide or tap left & right to bounce the ball back!'}
                  </span>
                </div>
              </div>
            ) : (
              /* ---------------- GAME 4: LASER ZOOMIES CHASE ---------------- */
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
                  ? `+${reward.bonusJoy} Joy & +1 churu point 🍬`
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