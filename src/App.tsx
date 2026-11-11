import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActionDock } from './components/ActionDock';
import { ClosetDrawer, HangerIcon, useCloset } from './components/ClosetDrawer';
import { EmergencyRevivalModal } from './components/EmergencyRevivalModal';
import { FloatingEffects } from './components/FloatingEffects';
import { FortuneModal, useFortune } from './components/FortuneModal';
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
import { hasAffordableItem } from './utils/closet';
import { canAffordFortune, getTodayDateString, isFortuneReady, isFortuneUnlocked } from './utils/fortune';
import { trackBalconyVisit, trackBoxNap, trackDayVisit, trackRainWatch } from './utils/badges';
import { OnboardingModal } from './components/OnboardingModal';
import { hasSeenOnboarding, loadPlayer, markOnboardingSeen, savePlayer } from './utils/player';
import type { CatSpot } from './types';
import {
  loadNotificationPrefs,
  requestNotificationAccess,
  saveNotificationPrefs,
  sendSystemNotification,
  type NotificationPrefs,
} from './utils/notifications';
import {
  fetchLuxembourgAtmosphere,
  isRainingNow,
  loadCachedLuxembourgData,
  resolveTimeOfDay,
  type LiveLuxembourgData,
} from './utils/atmosphere';

/** Re-check the Luxembourg weather at most this often (on resume), and on this interval while open. */
const WEATHER_MIN_GAP_MS = 10 * 60_000;
const WEATHER_REFRESH_MS = 15 * 60_000;
/** One tap on Oli reaches both Oli and the spot he sits on; count it once. */
const PET_TAP_DEDUPE_MS = 400;

export const SPOT_HEAD_SVG: Record<CatSpot, { x: number; y: number }> = {
  rug: { x: 200, y: 261 },
  sofa_bed: { x: 294, y: 244 },
  box: { x: 166, y: 306 },
  window: { x: 196, y: 160 },
  planter: { x: 98, y: 258 },
  bistro_chair: { x: 259, y: 218 },
  balcony_floor: { x: 136, y: 380 },
};

/** Lowest point (in scene units) where Oli can lie in each scene: his paws on the rug / the belly-up roll. */
const SCENE_FLOOR_FOCUS_Y = { living_room: 418, balcony: 458 } as const;

export function App() {
  const [playerName, setPlayerName] = useState<string>(() => loadPlayer());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !hasSeenOnboarding());
  const [menuOpen, setMenuOpen] = useState(false);
  const [closetOpen, setClosetOpen] = useState(false);
  const closeCloset = useCallback(() => setClosetOpen(false), []);
  const closet = useCloset();
  const [fortuneOpen, setFortuneOpen] = useState(false);
  const fortune = useFortune();
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
  const dockRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  // The room fills the whole screen at full size (close-up). Only on short screens, where Oli's
  // paws would end up behind the room switcher / care dock, the room slides up just enough.
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 400,
    height: 600,
  });
  // Top of the room switcher, measured from the top of the screen frame.
  const [switcherTop, setSwitcherTop] = useState<number | null>(null);
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
    bootError,
    live,
    mood,
    tummyAche,
    messes,
    litterBoxDirty,
    churuStash,
    churuProgress,
    buyAccessory,
    buyFortuneCookie,
    handleBadgeUnlocks,
    whim,
    activeMinigame,
    event,
    catAnimation,
    eventPlaying,
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
  } = useCatGame(playerName, pushNotice);
  const { availableVersion, reloading, applyUpdate } = useVersionCheck();

  const [luxData, setLuxData] = useState<LiveLuxembourgData | null>(() => loadCachedLuxembourgData());

  const effectiveTime = resolveTimeOfDay(new Date(now), luxData);
  const isRaining = isRainingNow(luxData, now);
  // Light follows the real clock in Luxembourg only. A daytime nap stays in daylight.
  const isNight = effectiveTime === 'night';
  const isSunset = effectiveTime === 'sunset';

  // Automatically refresh Luxembourg atmosphere (weather, real sunrise/sunset) on launch and resume
  useEffect(() => {
    let cancelled = false;
    let lastAttempt = 0;
    const syncAtmosphere = async (force = false) => {
      const t = Date.now();
      if (!force && t - lastAttempt < WEATHER_MIN_GAP_MS) return;
      lastAttempt = t;
      try {
        const info = await fetchLuxembourgAtmosphere();
        if (!cancelled) {
          setLuxData(info);
        }
      } catch {
        /* Keep cached if offline */
      }
    };

    void syncAtmosphere(true);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncAtmosphere();
      }
    };
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void syncAtmosphere();
    }, WEATHER_REFRESH_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // Track secret discovery badges for Oli's real habits & routines
  useEffect(() => {
    handleBadgeUnlocks(trackDayVisit(getTodayDateString(new Date(now))));
  }, [now, handleBadgeUnlocks]);

  useEffect(() => {
    if (scene === 'balcony') {
      handleBadgeUnlocks(trackBalconyVisit());
    }
  }, [scene, handleBadgeUnlocks]);

  useEffect(() => {
    if (isRaining && (spot === 'window' || scene === 'balcony')) {
      handleBadgeUnlocks(trackRainWatch());
    }
  }, [isRaining, spot, scene, handleBadgeUnlocks]);

  useEffect(() => {
    if (spot === 'box') {
      handleBadgeUnlocks(trackBoxNap());
    }
  }, [spot, handleBadgeUnlocks]);

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
      const switcher = switcherRef.current?.getBoundingClientRect();
      if (switcher) setSwitcherTop(switcher.top - rect.top);
      const stage = stageRef.current;
      if (stage) setStageTop(stage.getBoundingClientRect().top - rect.top);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (stageRef.current) ro.observe(stageRef.current);
    if (dockRef.current) ro.observe(dockRef.current);
    return () => ro.disconnect();
  }, [gameMounted]);

  // How far (px) to slide the room up so the lowest spot where Oli lies (rug / sunny balcony tiles)
  // stays just above the room switcher. Zero on most phones: the room stays full-size and close-up.
  const sceneShift = useMemo(() => {
    if (switcherTop === null) return 0;
    const scale = Math.max(containerSize.width / 400, containerSize.height / 600);
    const offsetY = (containerSize.height - 600 * scale) / 2;
    const lowestOliY = scene === 'balcony' ? SCENE_FLOOR_FOCUS_Y.balcony : SCENE_FLOOR_FOCUS_Y.living_room;
    const paws = offsetY + lowestOliY * scale;
    return Math.max(0, Math.round(paws + 6 - switcherTop));
  }, [scene, containerSize, switcherTop]);

  const targetHeadPos = useMemo(() => {
    const head = SPOT_HEAD_SVG[spot] ?? SPOT_HEAD_SVG.rug;
    const scale = Math.max(containerSize.width / 400, containerSize.height / 600);
    const offsetX = (containerSize.width - 400 * scale) / 2;
    const offsetY = (containerSize.height - 600 * scale) / 2;
    return {
      x: head.x * scale + offsetX,
      y: head.y * scale + offsetY - sceneShift - stageTop,
    };
  }, [spot, containerSize, sceneShift, stageTop]);

  const handleOpenMenu = (tab: MenuTab = 'rules') => {
    setMenuTab(tab);
    setMenuOpen(true);
  };

  const lastPetTapRef = useRef(0);
  const handlePetOli = () => {
    const t = Date.now();
    if (t - lastPetTapRef.current < PET_TAP_DEDUPE_MS) return;
    lastPetTapRef.current = t;
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

  const handleCompleteOnboarding = (name: string) => {
    savePlayer(name);
    setPlayerName(name);
    markOnboardingSeen();
    setShowOnboarding(false);
  };

  const handleChangePlayerName = (name: string) => {
    savePlayer(name);
    setPlayerName(name);
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
        {bootError ? (
          <div role="alert" className="flex flex-col items-center gap-3 px-6 text-center">
            <span className="text-4xl">😿</span>
            <p className="font-display text-sm font-bold">Oli couldn’t load.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-amber-600 px-4 py-2 text-xs font-black text-white shadow-sm active:scale-95"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl animate-bounce">🐱</span>
            <p className="font-display text-sm font-bold">Waking up Oli…</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="flex h-dvh w-full items-center justify-center bg-[#23170f]">
      {/* Mobile portrait frame (full-bleed on phones, phone-sized card on desktop) */}
      <main ref={mainRef} className="safe-shell relative flex h-full w-full max-w-[440px] flex-col justify-between overflow-hidden bg-[#fbe3cb] shadow-2xl">
        {/* Floor colour behind the care dock, filling the strip uncovered when the room slides up */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 transition-colors duration-500"
          style={{
            height: sceneShift > 0 ? sceneShift + 4 : 0,
            backgroundColor: isNight
              ? scene === 'balcony'
                ? '#1c1b26'
                : '#272233'
              : isSunset
                ? scene === 'balcony'
                  ? '#9e796e'
                  : '#b88975'
                : scene === 'balcony'
                  ? '#c9b9a2'
                  : '#e4d6c1',
          }}
        />

        {/* Active Scenery (Living Room or Balcony) with Oli physically nestled inside */}
        <div
          className="pointer-events-none absolute inset-x-0 transition-[top] duration-300"
          style={{ top: -sceneShift, height: containerSize.height }}
        >
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
                  timeOfDay={effectiveTime}
                  isRaining={isRaining}
                  activeSpot={spot}
                  onSelectSpot={setSpot}
                  catMood={mood}
                  catAnimation={catAnimation}
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
                  timeOfDay={effectiveTime}
                  isRaining={isRaining}
                  fountainBoost={eventPlaying && event?.actionId === 'fountain'}
                  onTapFountain={handleTapFountain}
                  litterBoxDirty={litterBoxDirty}
                  onTapLitterBox={handleTapLitterBox}
                  activeSpot={spot}
                  onSelectSpot={setSpot}
                  catMood={mood}
                  catAnimation={catAnimation}
                  catAnimationKey={event?.key ?? 0}
                  onPetCat={handlePetOli}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle sunset/night ambient vignette */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-indigo-950"
            initial={false}
            animate={{ opacity: isNight ? 0.22 : isSunset ? 0.08 : 0 }}
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
            churuPoints={churuProgress.points}
            onBalcony={scene === 'balcony'}
            onOpenMenu={() => handleOpenMenu(live.isPaused ? 'pause' : 'rules')}
            onOpenPause={() => handleOpenMenu('pause')}
            hasUpdate={Boolean(availableVersion)}
            isNight={isNight}
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

          {/* Oli's Daily Fortune Cookie button */}
          <button
            type="button"
            onClick={() => setFortuneOpen(true)}
            title="Oli's Fortune Cookie"
            aria-label="Open Oli's Fortune Cookie"
            className={`pointer-events-auto absolute left-3 bottom-1.5 z-20 flex h-9 w-9 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all active:scale-95 ${
              isNight
                ? 'border-white/10 bg-slate-900/80 text-amber-300'
                : 'border-amber-900/12 bg-white/90 text-amber-700'
            }`}
          >
            <span className="text-base leading-none select-none">🥠</span>
            {isFortuneReady(fortune) ? (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-amber-950 ring-2 ring-white animate-pulse">
                ✨
              </span>
            ) : !isFortuneUnlocked(fortune) && canAffordFortune(churuStash) ? (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-pink-500 ring-2 ring-white" />
            ) : null}
          </button>

          {/* Oli's Closet button */}
          <button
            type="button"
            onClick={() => setClosetOpen(true)}
            title="Oli's Closet"
            aria-label="Open Oli's Closet"
            className={`pointer-events-auto absolute right-3 bottom-1.5 z-20 flex h-9 w-9 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all active:scale-95 ${
              isNight
                ? 'border-white/10 bg-slate-900/80 text-amber-300'
                : 'border-amber-900/12 bg-white/90 text-amber-700'
            }`}
          >
            <HangerIcon className="h-4.5 w-4.5" />
            {hasAffordableItem(closet, churuStash) && (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-pink-500 ring-2 ring-white" />
            )}
          </button>

          {/* Quick Room Switcher Pill (Living Room / Balcony) */}
          <div
            ref={switcherRef}
            role="group"
            aria-label="Switch scenery"
            className={`pointer-events-auto absolute bottom-1.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border p-1 shadow-md backdrop-blur-md transition-colors ${
              isNight
                ? 'border-white/10 bg-slate-900/80 text-amber-50'
                : 'border-amber-900/12 bg-white/90 text-amber-950'
            }`}
          >
            <button
              type="button"
              onClick={() => setScene('living_room')}
              aria-pressed={scene === 'living_room'}
              className={`relative flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-extrabold transition-colors active:scale-95 ${
                scene === 'living_room'
                  ? 'text-amber-950'
                  : isNight
                    ? 'text-indigo-200/75 hover:text-white'
                    : 'text-amber-900/65 hover:text-amber-950'
              }`}
            >
              {scene === 'living_room' && (
                <motion.span
                  layoutId="scene-pill"
                  className={`absolute inset-0 rounded-full shadow-2xs ${
                    isNight ? 'bg-amber-300' : 'bg-amber-400/30 ring-1 ring-amber-500/40'
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
              className={`relative flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-extrabold transition-colors active:scale-95 ${
                scene === 'balcony'
                  ? 'text-amber-950'
                  : isNight
                    ? 'text-indigo-200/75 hover:text-white'
                    : 'text-amber-900/65 hover:text-amber-950'
              }`}
            >
              {scene === 'balcony' && (
                <motion.span
                  layoutId="scene-pill"
                  className={`absolute inset-0 rounded-full shadow-2xs ${
                    isNight ? 'bg-amber-300' : 'bg-emerald-400/35 ring-1 ring-emerald-600/40'
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
        <div ref={dockRef}>
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
            night={isNight}
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

        {/* Oli's Closet (dress-up drawer) */}
        <AnimatePresence>
          {closetOpen && (
            <ClosetDrawer
              churuStash={churuStash}
              onBuy={buyAccessory}
              onClose={closeCloset}
            />
          )}
        </AnimatePresence>

        {/* Oli's Daily Fortune Cookie Modal */}
        {fortuneOpen && (
          <FortuneModal
            churuStash={churuStash}
            onUnlock={buyFortuneCookie}
            onUnlockBadges={handleBadgeUnlocks}
            onClose={() => setFortuneOpen(false)}
          />
        )}

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
                playerName={playerName}
                onChangePlayerName={handleChangePlayerName}
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

        {/* First-time player onboarding */}
        {showOnboarding && ready && Boolean(live) && (
          <OnboardingModal initialName={playerName} onComplete={handleCompleteOnboarding} />
        )}
      </main>
    </div>
    </MotionConfig>
  );
}

export default App;
