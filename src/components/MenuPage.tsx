import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellOff,
  Check,
  Flame,
  Moon,
  Pause,
  Play,
  RefreshCw,
  Sun,
} from 'lucide-react';
import { useState } from 'react';
import {
  AUTO_NAP_ENERGY,
  MAX_TREATS_IN_WINDOW,
  MIN_WAKE_ENERGY,
  PET_JOY_BOOST,
  STAT_META,
} from '../data/actions';
import { APP_VERSION, CHANGELOG } from '../data/changelog';
import { STAT_KEYS, type LiveCat, type StatKey } from '../types';
import {
  DECAY_RATES,
  MAX_LIVES,
  NEED_THRESHOLD,
  NEGLECT_DEATH_HOURS,
} from '../utils/decayEngine';
import { CRITICAL_THRESHOLD, type NotificationPrefs } from '../utils/notifications';
import { STAT_ICONS } from './statIcons';

export type MenuTab = 'rules' | 'pause' | 'version' | 'notifications';

export interface MenuPageProps {
  onClose: () => void;
  initialTab?: MenuTab;
  live: LiveCat;
  onTogglePause: () => void;
  availableVersion?: string | null;
  reloading?: boolean;
  onApplyUpdate?: () => void;
  notifPrefs: NotificationPrefs;
  onToggleMasterNotifications: () => void;
  onChangeNotifPrefs: (next: NotificationPrefs) => void;
  onTestNotification: () => void;
}

function minutesPerPoint(ratePerHour: number): string {
  const mins = Math.round((60 / Math.abs(ratePerHour)) * 10) / 10;
  return `1 pt / ${mins}m`;
}

export function MenuPage({
  onClose,
  initialTab = 'rules',
  live,
  onTogglePause,
  availableVersion,
  reloading,
  onApplyUpdate,
  notifPrefs,
  onToggleMasterNotifications,
  onChangeNotifPrefs,
  onTestNotification,
}: MenuPageProps) {
  const [activeTab, setActiveTab] = useState<MenuTab>(initialTab);

  const toggleNotifFlag = (key: 'lowNeed' | 'critical' | 'wakeUp' | 'partner') => {
    onChangeNotifPrefs({ ...notifPrefs, [key]: !notifPrefs[key] });
  };

  const toggleNotifStat = (stat: StatKey) => {
    onChangeNotifPrefs({
      ...notifPrefs,
      stats: { ...notifPrefs.stats, [stat]: !notifPrefs.stats[stat] },
    });
  };

  const tabs: Array<{ id: MenuTab; label: string; icon: string; badge?: boolean }> = [
    { id: 'rules', label: 'Rules', icon: '📖' },
    { id: 'pause', label: live.isPaused ? 'Paused' : 'Vacation', icon: '✈️' },
    { id: 'version', label: 'Updates', icon: '✨', badge: Boolean(availableVersion) },
    { id: 'notifications', label: 'Alerts', icon: notifPrefs.enabled ? '🔔' : '🔕' },
  ];

  return (
    <div className="relative flex h-full w-full flex-col bg-[#fff7ee] text-amber-950">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-20 border-b border-amber-900/10 bg-[#fff7ee]/95 px-3 pt-3 pb-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-amber-900/10 pr-3.5 pl-3 text-xs font-bold whitespace-nowrap text-amber-950 transition-colors hover:bg-amber-900/15 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Oli</span>
          </button>

          <h1 className="truncate font-display text-sm font-extrabold text-amber-950">Guide & Settings</h1>
        </div>

        {/* 4-Column Segmented Tab Bar */}
        <nav className="mt-2.5 grid grid-cols-4 gap-1 rounded-2xl bg-amber-950/6 p-1" aria-label="Menu Sections">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] transition-all active:scale-95 ${
                  active
                    ? 'bg-white text-amber-950 shadow-xs font-black'
                    : 'text-amber-900/70 hover:text-amber-950 font-bold'
                }`}
                aria-pressed={active}
              >
                <span className="text-base leading-none" aria-hidden="true">{t.icon}</span>
                <span className="max-w-full truncate">{t.label}</span>
                {t.badge && (
                  <span className="absolute top-1 right-2 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 touch-pan-y overflow-y-auto p-4 pb-12">
        {/* TAB 1: RULES & GUIDE */}
        {activeTab === 'rules' && (
          <div className="flex flex-col gap-3">
            {/* Vacation Callout if clock is paused */}
            {live.isPaused && (
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-sky-400/35 bg-sky-50 p-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✈️</span>
                  <div>
                    <p className="text-xs font-bold text-sky-950">Care clock is currently paused</p>
                    <p className="text-[10px] text-sky-800/80">Oli is resting safely in Vacation Mode.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('pause')}
                  className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-black text-white shadow-xs active:scale-95"
                >
                  Manage Clock
                </button>
              </div>
            )}

            {/* Section 1: Touch & Room Interaction */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-pink-500/15 text-sm">
                  🐱
                </span>
                <h3 className="font-display text-xs font-bold text-amber-950">Touch & Room Interactions</h3>
              </div>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs font-medium leading-relaxed text-amber-900/85">
                <li>
                  <strong>Chin Scratches:</strong> Tap Oli directly in the living room anytime for cuddles (
                  <strong className="text-pink-600">+{PET_JOY_BOOST} Joy</strong> every 20s).
                </li>
                <li>
                  <strong>Direct Spot Tapping:</strong> Tap the sofa bed, cardboard box, windowsill, or rug in the room
                  to invite Oli there!
                </li>
                <li>
                  <strong>Water Fountain:</strong> Tap the water fountain anytime to refresh Oli’s fresh water.
                </li>
              </ul>
            </div>

            {/* Section 2: Food & Treats */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/15 text-sm">
                  🍗
                </span>
                <h3 className="font-display text-xs font-bold text-amber-950">Meals, Treats & Tummy Aches</h3>
              </div>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs font-medium leading-relaxed text-amber-900/85">
                <li>
                  <strong>Fullness Refusals:</strong> Oli shakes his head at a meal when he’s already full (Food 85+ for
                  Wet Food, 90+ for Quail Egg). Play with him first!
                </li>
                <li>
                  <strong className="text-rose-600">Tummy Aches:</strong> Feeding more than{' '}
                  <strong>{MAX_TREATS_IN_WINDOW} treats</strong> in 15 minutes causes a tummy ache (-10 Joy, -15 Energy,
                  -10 Clean). Soothe it with belly rubs, brushing, or Calming Mist.
                </li>
              </ul>
            </div>

            {/* Section 3: Cleaning & Litter Box */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/15 text-sm">
                  🧹
                </span>
                <h3 className="font-display text-xs font-bold text-amber-950">Clean Home & Litter Box</h3>
              </div>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs font-medium leading-relaxed text-amber-900/85">
                <li>
                  <strong>Corner Litter Box:</strong> Oli uses his box every 2nd meal. Tap it directly to scoop (+15
                  Clean, +6 Joy).
                </li>
                <li>
                  <strong>Fur Tumbleweeds:</strong> Shed ginger fur tumbleweeds appear on the rug — tap them directly or
                  use <strong>Care → Scoop Box</strong> to sweep up.
                </li>
              </ul>
            </div>

            {/* Section 4: Cravings & Minigames */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-sm">
                  🍬
                </span>
                <h3 className="font-display text-xs font-bold text-amber-950">Cravings & Play Minigames</h3>
              </div>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs font-medium leading-relaxed text-amber-900/85">
                <li>
                  <strong>Craving Thought Bubbles:</strong> Tap his craving before time expires for{' '}
                  <strong className="text-pink-600">2× Joy + 1 Churu Tube 🍬</strong>!
                </li>
                <li>
                  <strong>3-Round Minigames:</strong> Play <em>Feather Pounce</em> or <em>Laser Zoomies</em>. Score 3/3
                  for a Perfect Combo (+15 Joy &amp; +1 Churu tube)!
                </li>
              </ul>
            </div>

            {/* Section 5: 9 Lives & Safety */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500/15 text-sm">
                  🛡️
                </span>
                <h3 className="font-display text-xs font-bold text-amber-950">9 Lives & Vacation Safety</h3>
              </div>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs font-medium leading-relaxed text-amber-900/85">
                <li>
                  Oli has <strong>{MAX_LIVES} lives</strong>. Leaving him unattended for over{' '}
                  <strong>{NEGLECT_DEATH_HOURS} hours at 0 food and water</strong> (over 2.5 days) can cause him to pass
                  away.
                </li>
                <li>
                  Always use <strong>Vacation Clock</strong> whenever traveling so Oli stays 100% safe!
                </li>
              </ul>
            </div>

            {/* Section 6: Sleep & Energy */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/15 text-sm">
                  🌙
                </span>
                <h3 className="font-display text-xs font-bold text-amber-950">Sleep & Naps</h3>
              </div>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs font-medium leading-relaxed text-amber-900/85">
                <li>
                  Oli takes a nap when Energy drops below <strong>{AUTO_NAP_ENERGY}</strong>, recharges at{' '}
                  <strong>+{DECAY_RATES.sleeping.energy}/hr</strong>, and wakes up naturally at <strong>100 Energy</strong>.
                </li>
                <li>
                  You can gently wake him early once his Energy reaches at least <strong>{MIN_WAKE_ENERGY}</strong>.
                </li>
              </ul>
            </div>

            {/* Section 7: Hourly Drift Table */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <h3 className="mb-1 font-display text-xs font-bold text-amber-950">⏱️ Hourly Drift Speeds</h3>
              <p className="mb-2 text-[11px] font-medium text-amber-800/75">
                Needs drift smoothly in real time — check in 2–3 times a day!
              </p>
              <div className="overflow-hidden rounded-xl border border-amber-900/10">
                <div className="grid grid-cols-12 bg-amber-950/5 px-2.5 py-1.5 text-[10px] font-extrabold text-amber-900">
                  <span className="col-span-4">Need</span>
                  <span className="col-span-4 flex items-center gap-1">
                    <Sun className="h-3 w-3 text-amber-600" /> Awake
                  </span>
                  <span className="col-span-4 flex items-center gap-1">
                    <Moon className="h-3 w-3 text-indigo-600" /> Napping
                  </span>
                </div>
                {STAT_KEYS.map((key) => {
                  const meta = STAT_META[key];
                  const Icon = STAT_ICONS[key];
                  const awakeRate = DECAY_RATES.awake[key];
                  const sleepRate = DECAY_RATES.sleeping[key];
                  return (
                    <div
                      key={key}
                      className="grid grid-cols-12 items-center border-t border-amber-900/6 px-2.5 py-1.5 text-[11px]"
                    >
                      <div className="col-span-4 flex items-center gap-1.5 font-extrabold">
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: meta.color }} />
                        <span>{meta.label}</span>
                      </div>
                      <div className="col-span-4 leading-tight">
                        <span className="font-extrabold text-rose-600">{awakeRate}/h</span>
                        <span className="block text-[9px] font-semibold text-amber-900/60">
                          ({minutesPerPoint(awakeRate)})
                        </span>
                      </div>
                      <div className="col-span-4 leading-tight">
                        <span
                          className={`font-extrabold ${sleepRate > 0 ? 'text-emerald-600' : 'text-indigo-900'}`}
                        >
                          {sleepRate > 0 ? `+${sleepRate}/h` : `${sleepRate}/h`}
                        </span>
                        <span className="block text-[9px] font-semibold text-amber-900/60">
                          ({minutesPerPoint(sleepRate)})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VACATION CLOCK (PAUSE BUTTON) */}
        {activeTab === 'pause' && (
          <div className="flex flex-col gap-3">
            <div
              className={`rounded-2xl border p-4 shadow-sm transition-colors ${
                live.isPaused
                  ? 'border-sky-400/40 bg-sky-50 text-sky-950'
                  : 'border-amber-900/10 bg-white text-amber-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-2xl">
                  ✈️
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold">Pause Care Clock (Vacation Mode)</h2>
                  <p className="text-xs font-medium opacity-75">
                    Freeze time so Oli stays safe while you are away
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/5 p-3.5">
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-60">Clock Status</span>
                  <p className="font-display text-sm font-black">
                    {live.isPaused ? '✈️ Care Clock Paused' : '🟢 Care Clock Active'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onTogglePause}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black text-white shadow-sm transition-transform active:scale-95 ${
                    live.isPaused ? 'bg-sky-600 hover:bg-sky-500' : 'bg-sky-500 hover:bg-sky-400'
                  }`}
                >
                  {live.isPaused ? (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Resume Clock</span>
                    </>
                  ) : (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pause Clock</span>
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-xs font-medium leading-relaxed opacity-90">
                Taking a flight, studying for finals, or away from your phone? Pause the care clock! Oli’s needs
                (Food, Water, Joy, Energy, Clean) freeze completely in time — no decay, no messes, and no cravings
                until you tap Resume.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <h3 className="mb-2 font-display text-xs font-bold text-amber-950">🛡️ Vacation Mode Protection</h3>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs font-medium text-amber-900/85">
                <li>Stats never drop while paused — zero hunger or thirst.</li>
                <li>Oli’s 9 lives are completely safe from neglect while away.</li>
                <li>No random messes or fur tumbleweeds will appear.</li>
                <li>You can resume the clock anytime with a single tap.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: WHAT’S NEW & APP VERSION */}
        {activeTab === 'version' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-2xl border border-amber-900/10 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-lg">
                  ✨
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold text-amber-950">Ravioli App Version</h2>
                  <p className="text-[11px] font-medium text-amber-800/75">
                    Release notes & updates
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-500 px-3 py-1 font-mono text-xs font-black text-white shadow-2xs">
                {APP_VERSION}
              </span>
            </div>

            {availableVersion && onApplyUpdate && (
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-500/35 bg-emerald-50 p-3.5 shadow-sm">
                <div>
                  <p className="font-display text-xs font-bold text-emerald-950">
                    ✨ New version <span className="font-extrabold">{availableVersion}</span> is ready!
                  </p>
                  <p className="text-[11px] font-medium text-emerald-800/80">
                    Tap Reload to install latest improvements.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onApplyUpdate}
                  disabled={reloading}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-black text-white shadow-xs transition-transform active:scale-95"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${reloading ? 'animate-spin' : ''}`} />
                  <span>{reloading ? 'Reloading…' : 'Reload'}</span>
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {CHANGELOG.map((rel, idx) => (
                <div key={rel.version} className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-black ${
                          idx === 0 ? 'bg-amber-500 text-white' : 'bg-amber-950/8 text-amber-900'
                        }`}
                      >
                        {rel.version}
                      </span>
                      <h3 className="font-display text-xs font-bold text-amber-950">{rel.title}</h3>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-800/60">{rel.date}</span>
                  </div>
                  <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-xs font-medium text-amber-900/85">
                    {rel.changes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS & ALERTS */}
        {activeTab === 'notifications' && (
          <div className="flex flex-col gap-3">
            {/* Master toggle card */}
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-amber-900/10 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
                  {notifPrefs.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </span>
                <div>
                  <h2 className="font-display text-xs font-bold text-amber-950">
                    {notifPrefs.enabled ? 'Notifications Active' : 'Notifications Muted'}
                  </h2>
                  <p className="text-[10px] font-medium text-amber-800/75">
                    {notifPrefs.enabled ? 'Oli care alerts will be delivered' : 'Tap enable to receive care alerts'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleMasterNotifications}
                className={`rounded-full px-3.5 py-1.5 text-xs font-black transition-colors active:scale-95 ${
                  notifPrefs.enabled ? 'bg-emerald-600 text-white' : 'bg-amber-950/10 text-amber-900'
                }`}
              >
                {notifPrefs.enabled ? 'Enabled ✓' : 'Enable'}
              </button>
            </div>

            {/* Test Alert Button */}
            {notifPrefs.enabled && (
              <button
                type="button"
                onClick={onTestNotification}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-amber-900/10 bg-amber-100/60 py-2.5 text-xs font-bold text-amber-950 active:scale-95 hover:bg-amber-100"
              >
                <span>🔔 Send Test Notification</span>
              </button>
            )}

            {!notifPrefs.enabled && (
              <p className="px-1 text-[11px] font-semibold text-amber-800/75">
                Turn on notifications above to choose which alerts you get.
              </p>
            )}

            <fieldset
              disabled={!notifPrefs.enabled}
              className={`flex flex-col gap-3 transition-opacity ${notifPrefs.enabled ? '' : 'opacity-45'}`}
            >
            {/* Event Preferences */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <h3 className="mb-2 font-display text-xs font-bold text-amber-950">Alert Events</h3>
              <div className="flex flex-col gap-2">
                <label className="flex min-h-9 items-center justify-between gap-2 text-xs font-semibold text-amber-950 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Low need alert (below {NEED_THRESHOLD})</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.lowNeed}
                    onChange={() => toggleNotifFlag('lowNeed')}
                    className="h-5 w-5 accent-amber-500 cursor-pointer"
                  />
                </label>
                <label className="flex min-h-9 items-center justify-between gap-2 text-xs font-semibold text-amber-950 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Flame className="h-3.5 w-3.5 text-rose-600" />
                    <span>Critical alert (below {CRITICAL_THRESHOLD})</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.critical}
                    onChange={() => toggleNotifFlag('critical')}
                    className="h-5 w-5 accent-amber-500 cursor-pointer"
                  />
                </label>
                <label className="flex min-h-9 items-center justify-between gap-2 text-xs font-semibold text-amber-950 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    <span>Wake up alert (after nap)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.wakeUp}
                    onChange={() => toggleNotifFlag('wakeUp')}
                    className="h-5 w-5 accent-amber-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Individual Stat Alerts */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <h3 className="mb-2 font-display text-xs font-bold text-amber-950">Track Specific Needs</h3>
              <div className="grid grid-cols-2 gap-2">
                {STAT_KEYS.map((k) => {
                  const Icon = STAT_ICONS[k];
                  const active = notifPrefs.stats[k];
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggleNotifStat(k)}
                      aria-pressed={active}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all active:scale-95 ${
                        active
                          ? 'border-amber-500 bg-amber-50 text-amber-950'
                          : 'border-amber-900/10 text-amber-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5" />
                        <span>{STAT_META[k].label}</span>
                      </div>
                      {active && <Check className="h-3 w-3 text-amber-600 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
            </fieldset>
          </div>
        )}
      </main>
    </div>
  );
}
