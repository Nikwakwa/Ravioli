import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActionDock } from './components/ActionDock';
import { EmergencyRevivalModal } from './components/EmergencyRevivalModal';
import { FloatingEffects } from './components/FloatingEffects';
import { MenuPage, type MenuTab } from './components/MenuPage';
import { PlayMinigameModal } from './components/PlayMinigameModal';
import { RoomMesses } from './components/RoomMesses';
import { Balcony } from './components/scenes/Balcony';
import { LivingRoom } from './components/scenes/LivingRoom';
import { StatusHUD } from './components/StatusHUD';
import { WhimBubble } from './components/WhimBubble';
import { actionById } from './data/actions';
import { useCatGame, type Notice } from './hooks/useCatGame';
import { useVersionCheck } from './hooks/useVersionCheck';
import type { CatSpot } from './types';
import {
  loadNotificationPrefs,
  requestNotificationAccess,
  saveNotificationPrefs,
  sendSystemNotification,
  type NotificationPrefs,
} from './utils/notifications';

export const SPOT_HEAD_SVG: Record<CatSpot, { x: number; y: number }> = {
  rug: { x: 200, y: 261 },
  sofa_bed: { x: 294, y: 244 },
  box: { x: 166, y: 306 },
  window: { x: 196, y: 160 },
  planter: { x: 106, y: 256 },
  bistro_chair: { x: 259, y: 218 },
  balcony_floor: { x: 145, y: 340 },
};

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTab, setMenuTab] = useState<MenuTab>('rules');
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(() => loadNotificationPrefs());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [tapHeartKey, setTapHeartKey] = useState(0);
  const noticeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(noticeTimer.current);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);
  const mainRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 400,
    height: 600,
  });
  // Distance from the top of the screen frame to the center stage (below the HUD).
  // Bubbles live inside the stage, so Oli's head position must be shifted by this amount.
  const [stageTop, setStageTop] = useState(0);

  const pushNotice = useCallback((n: Omit<Notice, 'id'>) => {
    setNotice({ ...n, id: Date.now() });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3200);
  }, []);

  const {
    ready,
    live,
    mood,
    tummyAche,
    messes,
    litterBoxDirty,
    churuStash,
    whim,
    activeMinigame,
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
  } = useCatGame('Nico', pushNotice);
  const { availableVersion, reloading, applyUpdate } = useVersionCheck();

  // Re-measure once the game screen is mounted (the loading screen has no frame to measure).
  const gameMounted = ready && Boolean(live);
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
      const stage = stageRef.current;
      if (stage) setStageTop(stage.getBoundingClientRect().top - rect.top);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [gameMounted]);

  const targetHeadPos = useMemo(() => {
    const head = SPOT_HEAD_SVG[spot] ?? SPOT_HEAD_SVG.rug;
    const scale = Math.max(containerSize.width / 400, containerSize.height / 600);
    const offsetX = (containerSize.width - 400 * scale) / 2;
    const offsetY = (containerSize.height - 600 * scale) / 2;
    return {
      x: head.x * scale + offsetX,
      y: head.y * scale + offsetY - stageTop,
    };
  }, [spot, containerSize, stageTop]);

  const handleOpenMenu = (tab: MenuTab = 'rules') => {
    setMenuTab(tab);
    setMenuOpen(true);
  };

  const handlePetOli = () => {
    setTapHeartKey((k) => k + 1);
    petOli();
  };

  const handleTapFountain = () => {
    const fountain = actionById('fountain');
    if (fountain) perform(fountain);
  };

  const handleTapLitterBox = () => {
    scoopLitterBox();
  };

  const handleChangeNotifPrefs = (next: NotificationPrefs) => {
    saveNotificationPrefs(next);
    setNotifPrefs(next);
  };

  const handleToggleMasterNotifications = async () => {
    if (notifPrefs.enabled) {
      handleChangeNotifPrefs({ ...notifPrefs, enabled: false });
      pushNotice({ text: '🔕 Oli notifications muted', tone: 'info' });
      return;
    }
    const res = await requestNotificationAccess();
    if (res === 'granted') {
      const next = { ...notifPrefs, enabled: true };
      handleChangeNotifPrefs(next);
      pushNotice({ text: '🔔 Oli notifications enabled!', tone: 'info' });
      void sendSystemNotification(
        '🔔 Oli notifications enabled!',
        'You can customize which alerts to receive anytime in the Menu.',
        'oli-test',
      );
    } else if (res === 'denied') {
      handleChangeNotifPrefs({ ...notifPrefs, enabled: false });
      pushNotice({ text: 'Notifications blocked by browser settings.', tone: 'warn' });
    } else {
      pushNotice({ text: 'Notifications are not supported on this browser.', tone: 'warn' });
    }
  };

  const handleTestNotification = () => {
    pushNotice({ text: '🔔 Sent test notification!', tone: 'info' });
    void sendSystemNotification(
      '🐱 Meow from Oli!',
      'Notifications are working! You’ll be alerted when any need drops below 25.',
      'oli-test',
    );
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
      <main ref={mainRef} className="safe-shell relative flex h-full w-full max-w-[440px] flex-col justify-between overflow-hidden bg-[#fbe3cb] shadow-2xl">
        {/* Active Scenery (Living Room or Balcony) with Oli physically nestled inside */}
        <div className="pointer-events-none absolute inset-0">
          <AnimatePresence mode="sync" initial={false}>
            {scene === 'balcony' ? (
              <motion.div
                key="scene-balcony"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="pointer-events-none absolute inset-0"
              >
                <Balcony
                  sleeping={live.isSleeping}
                  activeSpot={spot}
                  onSelectSpot={setSpot}
                  catMood={mood}
                  catAnimation={event?.animation ?? 'idle'}
                  catAnimationKey={event?.key ?? 0}
                  onPetCat={handlePetOli}
                />
              </motion.div>
            ) : (
              <motion.div
                key="scene-living-room"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="pointer-events-none absolute inset-0"
              >
                <LivingRoom
                  sleeping={live.isSleeping}
                  fountainBoost={event?.actionId === 'fountain'}
                  onTapFountain={handleTapFountain}
                  litterBoxDirty={litterBoxDirty}
                  onTapLitterBox={handleTapLitterBox}
                  activeSpot={spot}
                  onSelectSpot={setSpot}
                  catMood={mood}
                  catAnimation={event?.animation ?? 'idle'}
                  catAnimationKey={event?.key ?? 0}
                  onPetCat={handlePetOli}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle sleep-mode ambient vignette */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-indigo-950"
            initial={false}
            animate={{ opacity: live.isSleeping ? 0.22 : 0 }}
            transition={{ duration: 0.7 }}
          />
        </div>

        {/* Top HUD + update banner; toasts drop in just below so they never cover the need meters */}
        <div className="relative z-30">
          {/* Top HUD */}
          <StatusHUD
            live={live}
            mood={mood}
            tummyAche={tummyAche}
            messCount={messes.length}
            litterBoxDirty={litterBoxDirty}
            churuStash={churuStash}
            onOpenMenu={() => handleOpenMenu(live.isPaused ? 'pause' : 'rules')}
            onOpenPause={() => handleOpenMenu('pause')}
            hasUpdate={Boolean(availableVersion)}
          />

          {/* New version available banner on main screen */}
          <AnimatePresence>
            {availableVersion && (
              <motion.div
                key="update-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative z-30 mx-3 mt-1"
              >
                <button
                  type="button"
                  onClick={() => void applyUpdate()}
                  disabled={reloading}
                  className="flex w-full items-center justify-between gap-2 rounded-2xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-lg transition-transform active:scale-[0.99] hover:bg-emerald-500"
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

          {/* Screen-reader announcement for toasts */}
          <div aria-live="polite" className="sr-only">
            {notice?.text ?? ''}
          </div>

          {/* Info / Refusal toast */}
          <AnimatePresence>
            {notice && (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: -12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.92 }}
                className={`pointer-events-none absolute top-full left-1/2 z-30 mt-2 w-max max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-2xl px-3.5 py-2 text-center text-xs font-bold shadow-lg backdrop-blur-md ${
                  notice.tone === 'warn'
                    ? 'bg-rose-950/92 text-rose-50'
                    : 'bg-amber-950/90 text-amber-50'
                }`}
              >
                {notice.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center stage overlay: floating effects, whims, messes & quick room switcher */}
        <div ref={stageRef} className="pointer-events-none relative z-10 flex flex-1 items-end justify-center pb-5">
          <FloatingEffects
            event={event}
            tapHeartKey={tapHeartKey}
            mood={mood}
            spot={spot}
            // Keep short-lived pet/stat bubbles from sliding under the HUD on short phones
            targetPos={{ x: targetHeadPos.x, y: Math.max(targetHeadPos.y, 56) }}
          />
          <WhimBubble
            whim={whim}
            now={now}
            onFulfill={fulfillWhim}
            spot={spot}
            targetPos={targetHeadPos}
            containerWidth={containerSize.width}
          />
          {scene === 'living_room' && <RoomMesses messes={messes} onClean={cleanMess} />}

          {/* Quick Room Switcher Pill (Living Room / Balcony) */}
          <div
            role="group"
            aria-label="Switch scenery"
            className={`pointer-events-auto absolute bottom-1.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border p-1 shadow-md backdrop-blur-md transition-colors ${
              live.isSleeping
                ? 'border-white/10 bg-slate-900/80 text-amber-50'
                : 'border-amber-900/12 bg-white/90 text-amber-950'
            }`}
          >
            <button
              type="button"
              onClick={() => setScene('living_room')}
              aria-pressed={scene === 'living_room'}
              className={`relative flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold transition-colors active:scale-95 ${
                scene === 'living_room'
                  ? 'text-amber-950'
                  : live.isSleeping
                    ? 'text-indigo-200/75 hover:text-white'
                    : 'text-amber-900/65 hover:text-amber-950'
              }`}
            >
              {scene === 'living_room' && (
                <motion.span
                  layoutId="scene-pill"
                  className={`absolute inset-0 rounded-full shadow-2xs ${
                    live.isSleeping ? 'bg-amber-300' : 'bg-amber-400/30 ring-1 ring-amber-500/40'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-xs leading-none">🛋️</span>
              <span className="relative z-10">Living Room</span>
            </button>

            <button
              type="button"
              onClick={() => setScene('balcony')}
              aria-pressed={scene === 'balcony'}
              className={`relative flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold transition-colors active:scale-95 ${
                scene === 'balcony'
                  ? 'text-amber-950'
                  : live.isSleeping
                    ? 'text-indigo-200/75 hover:text-white'
                    : 'text-amber-900/65 hover:text-amber-950'
              }`}
            >
              {scene === 'balcony' && (
                <motion.span
                  layoutId="scene-pill"
                  className={`absolute inset-0 rounded-full shadow-2xs ${
                    live.isSleeping ? 'bg-amber-300' : 'bg-emerald-400/35 ring-1 ring-emerald-600/40'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-xs leading-none">🌿</span>
              <span className="relative z-10">Balcony</span>
            </button>
          </div>
        </div>

        {/* Bottom tactile care dock */}
        <div>
          <ActionDock
            live={live}
            tummyAche={tummyAche}
            messCount={messes.length}
            litterBoxDirty={litterBoxDirty}
            churuStash={churuStash}
            whimActionId={whim?.actionId ?? null}
            busy={busy}
            onAction={perform}
            onToggleSleep={toggleSleep}
          />
        </div>

        {/* Modals & Separate Menu Page */}
        <PlayMinigameModal
          action={activeMinigame}
          catName={live.name}
          whimActive={Boolean(whim && activeMinigame && whim.actionId === activeMinigame.id)}
          onComplete={completeMinigame}
          onCancel={cancelMinigame}
        />

        <EmergencyRevivalModal live={live} onRevive={reviveOli} />

        {/* Separate Menu Page (Rules, Vacation Pause, Version/Updates, Notifications) */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="menu-page"
              initial={{ x: '100%', opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute inset-0 z-50 flex flex-col bg-[#fff7ee] text-amber-950 overflow-hidden shadow-2xl"
            >
              <MenuPage
                onClose={() => setMenuOpen(false)}
                initialTab={menuTab}
                live={live}
                onTogglePause={togglePause}
                availableVersion={availableVersion}
                reloading={reloading}
                onApplyUpdate={() => void applyUpdate()}
                notifPrefs={notifPrefs}
                onToggleMasterNotifications={() => void handleToggleMasterNotifications()}
                onChangeNotifPrefs={handleChangeNotifPrefs}
                onTestNotification={handleTestNotification}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
