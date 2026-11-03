import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActionDock } from './components/ActionDock';
import { EmergencyRevivalModal } from './components/EmergencyRevivalModal';
import { FloatingEffects } from './components/FloatingEffects';
import { MenuPage, type MenuTab } from './components/MenuPage';
import { PlayMinigameModal } from './components/PlayMinigameModal';
import { RoomMesses } from './components/RoomMesses';
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
  const mainRef = useRef<HTMLElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 400,
    height: 600,
  });

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
    now,
  } = useCatGame('Nico', pushNotice);
  const { availableVersion, reloading, applyUpdate } = useVersionCheck();

  const targetHeadPos = useMemo(() => {
    const head = SPOT_HEAD_SVG[spot] ?? SPOT_HEAD_SVG.rug;
    const scale = Math.max(containerSize.width / 400, containerSize.height / 600);
    const offsetX = (containerSize.width - 400 * scale) / 2;
    const offsetY = (containerSize.height - 600 * scale) / 2;
    return {
      x: head.x * scale + offsetX,
      y: head.y * scale + offsetY,
    };
  }, [spot, containerSize]);

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
        {/* Cozy Living Room background with Oli physically nestled inside */}
        <div className="pointer-events-none absolute inset-0">
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

          {/* Subtle sleep-mode ambient vignette */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-indigo-950"
            initial={false}
            animate={{ opacity: live.isSleeping ? 0.22 : 0 }}
            transition={{ duration: 0.7 }}
          />
        </div>

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

        {/* Info / Refusal toast */}
        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: -12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.92 }}
              className={`pointer-events-none fixed top-28 left-1/2 z-30 max-w-[92vw] -translate-x-1/2 rounded-2xl px-3.5 py-1.5 text-center text-xs font-bold shadow-lg backdrop-blur-md ${
                notice.tone === 'warn'
                  ? 'bg-rose-950/92 text-rose-50'
                  : 'bg-amber-950/90 text-amber-50'
              }`}
            >
              {notice.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center stage overlay: floating effects, whims, messes */}
        <div className="pointer-events-none relative z-10 flex flex-1 items-end justify-center pb-5">
          <FloatingEffects
            event={event}
            tapHeartKey={tapHeartKey}
            mood={mood}
            spot={spot}
            targetPos={targetHeadPos}
          />
          <WhimBubble
            whim={whim}
            now={now}
            onFulfill={fulfillWhim}
            spot={spot}
            targetPos={targetHeadPos}
          />
          <RoomMesses messes={messes} onClean={cleanMess} />
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

        {/* Separate Menu Page (Rules, Vacation Pause, Cozy Spots, Version/Updates, Notifications) */}
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
                spot={spot}
                onSelectSpot={(s) => {
                  setSpot(s);
                  pushNotice({ text: `Oli moved to the ${s === 'sofa_bed' ? 'sofa bed' : s}! 🐾`, tone: 'info' });
                }}
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
