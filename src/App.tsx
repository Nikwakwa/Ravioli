import { AnimatePresence, motion } from 'framer-motion';
import { Play, RefreshCw } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { ActionDock } from './components/ActionDock';
import { CatAvatar } from './components/CatAvatar';
import { ChangelogModal } from './components/ChangelogModal';
import { EmergencyRevivalModal } from './components/EmergencyRevivalModal';
import { FloatingEffects } from './components/FloatingEffects';
import { GuideModal } from './components/GuideModal';
import { NotificationModal } from './components/NotificationModal';
import { PlayMinigameModal } from './components/PlayMinigameModal';
import { RoomMesses } from './components/RoomMesses';
import { LivingRoom } from './components/scenes/LivingRoom';
import { StatusHUD } from './components/StatusHUD';
import { WhimBubble } from './components/WhimBubble';
import { actionById } from './data/actions';
import { useCatGame, type Notice } from './hooks/useCatGame';
import { useVersionCheck } from './hooks/useVersionCheck';
import {
  loadNotificationPrefs,
  requestNotificationAccess,
  saveNotificationPrefs,
  sendSystemNotification,
  type NotificationPrefs,
} from './utils/notifications';

export function App() {
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(() => loadNotificationPrefs());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [tapHeartKey, setTapHeartKey] = useState(0);
  const noticeTimer = useRef<number | undefined>(undefined);

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
    fulfillWhim,
    toggleSleep,
    togglePause,
    reviveOli,
    now,
  } = useCatGame('Nico', pushNotice);
  const { availableVersion, reloading, applyUpdate } = useVersionCheck();

  const handlePetOli = () => {
    setTapHeartKey((k) => k + 1);
    petOli();
  };

  const handleTapFountain = () => {
    const fountain = actionById('fountain');
    if (fountain) perform(fountain);
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
        'You can customize which alerts to receive anytime.',
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
      <main className="safe-shell relative flex h-full w-full max-w-[440px] flex-col justify-between overflow-hidden bg-[#fbe3cb] shadow-2xl">
        {/* Cozy Living Room background */}
        <div className="pointer-events-none absolute inset-0">
          <LivingRoom
            sleeping={live.isSleeping}
            fountainBoost={event?.actionId === 'fountain'}
            onTapFountain={handleTapFountain}
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
          churuStash={churuStash}
          onOpenChangelog={() => setChangelogOpen(true)}
          onOpenGuide={() => setGuideOpen(true)}
          onTogglePause={togglePause}
          notificationsOn={notifPrefs.enabled}
          onToggleNotifications={() => setNotifOpen(true)}
          hasUpdate={Boolean(availableVersion)}
        />

        {/* Care Clock Paused (Vacation Mode) banner */}
        <AnimatePresence>
          {live.isPaused && (
            <motion.div
              key="paused-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-30 mx-3 mt-1"
            >
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-sky-400/35 bg-sky-950/90 px-3.5 py-2 text-sky-100 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="text-base">✈️</span>
                  <div>
                    <p className="text-xs font-bold leading-tight text-white">Care Clock Paused (Vacation Mode)</p>
                    <p className="text-[10px] text-sky-200/80">Oli is resting safely. Stats will not decay.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={togglePause}
                  className="flex items-center gap-1 rounded-xl bg-sky-500 px-3 py-1 text-xs font-black text-white shadow-sm transition-transform active:scale-95 hover:bg-sky-400"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Resume</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Center stage: Oli sitting on the living room plush rug */}
        <div className="pointer-events-none relative z-10 flex flex-1 items-end justify-center pb-5">
          <FloatingEffects event={event} tapHeartKey={tapHeartKey} mood={mood} />
          <WhimBubble whim={whim} now={now} onFulfill={fulfillWhim} />
          <div className="pointer-events-auto relative h-56 w-56 sm:h-60 sm:w-60">
            <CatAvatar
              mood={mood}
              animation={event?.animation ?? 'idle'}
              animationKey={event?.key ?? 0}
              onPet={handlePetOli}
              className="h-full w-full drop-shadow-md"
            />
          </div>
          <RoomMesses messes={messes} onClean={cleanMess} />
        </div>

        {/* Bottom tactile care dock */}
        <div>
          <ActionDock
            live={live}
            tummyAche={tummyAche}
            messCount={messes.length}
            churuStash={churuStash}
            whimActionId={whim?.actionId ?? null}
            busy={busy}
            onAction={perform}
            onToggleSleep={toggleSleep}
          />
        </div>

        <PlayMinigameModal
          action={activeMinigame}
          catName={live.name}
          whimActive={Boolean(whim && activeMinigame && whim.actionId === activeMinigame.id)}
          onComplete={completeMinigame}
          onCancel={cancelMinigame}
        />
        <NotificationModal
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          prefs={notifPrefs}
          onToggleMaster={() => void handleToggleMasterNotifications()}
          onChangePrefs={handleChangeNotifPrefs}
          onTestNotification={handleTestNotification}
        />
        <GuideModal
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
          isPaused={live.isPaused}
          onTogglePause={togglePause}
          notificationsOn={notifPrefs.enabled}
          onToggleNotifications={() => {
            setGuideOpen(false);
            setNotifOpen(true);
          }}
          onTestNotification={handleTestNotification}
        />
        <EmergencyRevivalModal live={live} onRevive={reviveOli} />
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
