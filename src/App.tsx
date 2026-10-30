import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { ActionDock } from './components/ActionDock';
import { ActivityFeed } from './components/ActivityFeed';
import { CatAvatar } from './components/CatAvatar';
import { ChangelogModal } from './components/ChangelogModal';
import { FloatingEffects } from './components/FloatingEffects';
import { PlayerSelector } from './components/PlayerSelector';
import { Balcony } from './components/scenes/Balcony';
import { LivingRoom } from './components/scenes/LivingRoom';
import { StatusHUD } from './components/StatusHUD';
import { useCatGame, type Notice } from './hooks/useCatGame';
import { useVersionCheck } from './hooks/useVersionCheck';
import type { SceneId } from './types';
import { vibrate } from './utils/feedback';
import { loadPlayer, playerColor, savePlayer } from './utils/player';

export function App() {
  const [player, setPlayer] = useState<string | null>(() => loadPlayer());
  const [pickerOpen, setPickerOpen] = useState<boolean>(() => !loadPlayer());
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [scene, setScene] = useState<SceneId>('room');
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [tapHeartKey, setTapHeartKey] = useState(0);
  const noticeTimer = useRef<number | undefined>(undefined);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipeCurrent = useRef<{ x: number; y: number } | null>(null);

  const pushNotice = useCallback((n: Omit<Notice, 'id'>) => {
    setNotice({ ...n, id: Date.now() });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3200);
  }, []);

  const { ready, live, mood, log, mode, status, event, busy, perform, toggleSleep, now } = useCatGame(
    player ?? 'Nico',
    pushNotice,
  );
  const { availableVersion, reloading, applyUpdate } = useVersionCheck();

  const handleSelectPlayer = (name: string) => {
    savePlayer(name);
    setPlayer(name);
    setPickerOpen(false);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    swipeStart.current = { x: e.clientX, y: e.clientY };
    swipeCurrent.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!swipeStart.current) return;
    swipeCurrent.current = { x: e.clientX, y: e.clientY };
  };

  const finishSwipe = (endX?: number, endY?: number) => {
    const start = swipeStart.current;
    const end = endX !== undefined && endY !== undefined ? { x: endX, y: endY } : swipeCurrent.current;
    swipeStart.current = null;
    swipeCurrent.current = null;
    if (!start || !end) return;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      setSwipeDir(dx < 0 ? 1 : -1);
      setScene((prev) => (prev === 'room' ? 'balcony' : 'room'));
      vibrate(12);
    }
  };

  const handlePetOli = () => {
    vibrate([15, 25, 15]);
    setTapHeartKey((k) => k + 1);
  };

  if (!ready || !live) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-[#fbe3cb] text-amber-950">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl animate-bounce">🐱</span>
          <p className="font-display text-sm font-bold">Waking up Oli…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-[#23170f]">
      {/* Mobile portrait frame (full-bleed on phones, phone-sized card on desktop) */}
      <main className="safe-shell relative flex h-full w-full max-w-[440px] flex-col justify-between overflow-hidden bg-[#fbe3cb] shadow-2xl">
        {/* Scene background */}
        <div className="pointer-events-none absolute inset-0">
          <AnimatePresence mode="wait" initial={false}>
            {scene === 'room' ? (
              <motion.div
                key="room"
                initial={{ opacity: 0, x: -32 * swipeDir }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 * swipeDir }}
                transition={{ duration: 0.26, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <LivingRoom sleeping={live.isSleeping} fountainBoost={event?.actionId === 'fountain'} />
              </motion.div>
            ) : (
              <motion.div
                key="balcony"
                initial={{ opacity: 0, x: 32 * swipeDir }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 32 * swipeDir }}
                transition={{ duration: 0.26, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <Balcony sleeping={live.isSleeping} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle sleep-mode ambient vignette */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-indigo-950"
            initial={false}
            animate={{ opacity: live.isSleeping ? (scene === 'room' ? 0.22 : 0.12) : 0 }}
            transition={{ duration: 0.7 }}
          />
        </div>

        {/* Top HUD */}
        <StatusHUD
          live={live}
          mood={mood}
          scene={scene}
          onSceneChange={(s) => {
            setSwipeDir(s === 'balcony' ? 1 : -1);
            setScene(s);
            vibrate(10);
          }}
          player={player ?? 'Nico'}
          onOpenPlayer={() => setPickerOpen(true)}
          onOpenChangelog={() => setChangelogOpen(true)}
          hasUpdate={Boolean(availableVersion)}
          mode={mode}
          status={status}
        />

        {/* New version available banner */}
        <AnimatePresence>
          {availableVersion && (
            <motion.div
              key="update-banner"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="relative z-30 mx-3 mt-1"
            >
              <button
                type="button"
                onClick={() => void applyUpdate()}
                disabled={reloading}
                className="flex w-full items-center justify-between gap-2 rounded-2xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-lg transition-transform active:scale-[0.99]"
              >
                <span>✨ A new update ({availableVersion}) is ready!</span>
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px]">
                  <RefreshCw className={`h-3 w-3 ${reloading ? 'animate-spin' : ''}`} />
                  {reloading ? 'Reloading…' : 'Reload'}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Partner / info toast */}
        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: -12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.92 }}
              className="pointer-events-none fixed top-28 left-1/2 z-30 -translate-x-1/2 rounded-full bg-amber-950/90 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-amber-50 shadow-lg backdrop-blur-md"
            >
              {notice.player && (
                <span
                  style={{ backgroundColor: playerColor(notice.player).bg, color: playerColor(notice.player).fg }}
                  className="mr-1.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                >
                  {notice.player}
                </span>
              )}
              {notice.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center stage: swipeable scene area + Oli sitting on the rug/cushion */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => finishSwipe(e.clientX, e.clientY)}
          onPointerCancel={() => finishSwipe()}
          className="relative z-10 flex flex-1 items-end justify-center pb-3"
        >
          <FloatingEffects event={event} tapHeartKey={tapHeartKey} mood={mood} />
          <div className="relative h-56 w-56 sm:h-60 sm:w-60">
            <CatAvatar
              mood={mood}
              animation={event?.animation ?? 'idle'}
              animationKey={event?.key ?? 0}
              onPet={handlePetOli}
              className="h-full w-full drop-shadow-md"
            />
          </div>
        </div>

        {/* Bottom co-op pill + tactile care dock */}
        <div>
          <ActivityFeed log={log} now={now} isSleeping={live.isSleeping} />
          <ActionDock isSleeping={live.isSleeping} busy={busy} onAction={perform} onToggleSleep={toggleSleep} />
        </div>

        <PlayerSelector open={pickerOpen} current={player} onSelect={handleSelectPlayer} />
        <ChangelogModal
          open={changelogOpen}
          onClose={() => setChangelogOpen(false)}
          availableVersion={availableVersion}
          onReload={() => void applyUpdate()}
        />
      </main>
    </div>
  );
}

export default App;
