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
import { useEffect, useState } from 'react';
import {
  AUTO_NAP_ENERGY,
  CHURU_POINTS_PER_TUBE,
  MAX_CHURUS_EARNED_PER_DAY,
  MAX_TREATS_IN_WINDOW,
  MIN_WAKE_ENERGY,
  PET_JOY_BOOST,
  STAT_META,
} from '../data/actions';
import { APP_VERSION, CHANGELOG } from '../data/changelog';
import { STAT_KEYS, type LiveCat, type StatKey } from '../types';
import {
  DECAY_RATES,
  NEED_THRESHOLD,
  NEGLECT_DEATH_HOURS,
} from '../utils/decayEngine';
import { CRITICAL_THRESHOLD, type NotificationPrefs } from '../utils/notifications';
import { isIosDevice, isPushConfigured, isStandalonePwa } from '../utils/pushSync';
import {
  BADGES,
  countEarnedMedals,
  getBadgeLevel,
  getBadgeProgress,
  markBadgesSeen,
  useBadges,
} from '../utils/badges';
import { resetAllGameData, sanitizePlayerName } from '../utils/player';
import { STAT_ICONS } from './statIcons';

export type MenuTab = 'rules' | 'badges' | 'pause' | 'version' | 'notifications';

export interface MenuPageProps {
  onClose: () => void;
  initialTab?: MenuTab;
  live: LiveCat;
  playerName?: string;
  onChangePlayerName?: (name: string) => void;
  onTogglePause: () => void;
  availableVersion?: string | null;
  reloading?: boolean;
  onApplyUpdate?: () => void;
  notifPrefs: NotificationPrefs;
  onToggleMasterNotifications: () => void;
  onChangeNotifPrefs: (next: NotificationPrefs) => void;
  onTestNotification: () => void;
}

export function MenuPage({
  onClose,
  initialTab = 'rules',
  live,
  playerName = 'Friend',
  onChangePlayerName,
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
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const [copiedDiagnostics, setCopiedDiagnostics] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const badgeState = useBadges();
  const medals = countEarnedMedals(badgeState);
  const maxMedals = BADGES.length * 3;

  useEffect(() => {
    if (activeTab === 'badges') {
      markBadgesSeen();
    }
  }, [activeTab]);

  const handleSaveName = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = sanitizePlayerName(tempName) || 'Friend';
    onChangePlayerName?.(clean);
    setEditingName(false);
  };

  const handleCopyDiagnostics = async () => {
    const statsSummary = STAT_KEYS.map((k) => `${k}: ${Math.round(live[k])}`).join(', ');
    const text = `Ravioli v${APP_VERSION}
Caretaker: ${playerName}
Cat: Oli (Lives: ${live.livesLeft}/9, Paused: ${live.isPaused ? 'Yes' : 'No'})
Stats: ${statsSummary}
Medals: ${medals.total}/${maxMedals} (${medals.gold}🥇 ${medals.silver}🥈 ${medals.bronze}🥉)
Time: ${new Date().toISOString()}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedDiagnostics(true);
      window.setTimeout(() => setCopiedDiagnostics(false), 2500);
    } catch {
      /* no-op */
    }
  };

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
    { id: 'badges', label: 'Badges', icon: '🏆', badge: badgeState.hasUnseen },
    { id: 'pause', label: live.isPaused ? 'Paused' : 'Vacation', icon: '✈️' },
    { id: 'notifications', label: 'Alerts', icon: notifPrefs.enabled ? '🔔' : '🔕' },
    { id: 'version', label: 'Updates', icon: '✨', badge: Boolean(availableVersion) },
  ];

  return (
    <div className="relative flex h-full w-full flex-col bg-[#fff7ee] text-amber-950">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-20 border-b border-amber-900/10 bg-[#fff7ee]/95 px-3 pt-3 pb-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-amber-900/10 pr-3.5 pl-3 text-xs font-bold whitespace-nowrap text-amber-950 transition-colors hover:bg-amber-900/15 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Oli</span>
          </button>

          <h1 className="truncate font-display text-sm font-extrabold text-amber-950">Guide & Settings</h1>
        </div>

        {/* 5-Column Segmented Tab Bar */}
        <nav className="mt-2.5 grid grid-cols-5 gap-1 rounded-2xl bg-amber-950/6 p-1" role="tablist" aria-label="Menu Sections">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  if (t.id === 'badges') markBadgesSeen();
                  setActiveTab(t.id);
                }}
                className={`relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] sm:text-[11px] transition-all active:scale-95 ${
                  active
                    ? 'bg-white text-amber-950 shadow-xs font-black'
                    : 'text-amber-900/70 hover:text-amber-950 font-bold'
                }`}
                role="tab"
                aria-selected={active}
              >
                <span className="text-base leading-none" aria-hidden="true">{t.icon}</span>
                <span className="max-w-full truncate">{t.label}</span>
                {t.badge && (
                  <span className="absolute top-1 right-1.5 flex h-2 w-2">
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
          <div className="flex flex-col gap-2.5">
            {/* Vacation Callout if clock is paused */}
            {live.isPaused && (
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-sky-400/35 bg-sky-50 p-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✈️</span>
                  <div>
                    <p className="text-xs font-bold text-sky-950">Care clock paused</p>
                    <p className="text-[10px] text-sky-800/80">Oli is resting in Vacation Mode.</p>
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

            {/* Caretaker Profile Card */}
            <div className="flex items-center justify-between rounded-2xl border border-amber-900/10 bg-white p-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-sm">
                  👤
                </span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-900/60">
                    Caretaker
                  </span>
                  <div className="font-display text-xs font-black text-amber-950">
                    {editingName ? (
                      <form onSubmit={handleSaveName} className="mt-0.5 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={tempName}
                          maxLength={20}
                          onChange={(e) => setTempName(e.target.value)}
                          className="w-28 rounded-lg border border-amber-400 bg-amber-50/50 px-2 py-0.5 text-xs font-black text-amber-950 focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-black text-amber-950"
                        >
                          Save
                        </button>
                      </form>
                    ) : (
                      <span>{playerName}</span>
                    )}
                  </div>
                </div>
              </div>
              {!editingName && (
                <button
                  type="button"
                  onClick={() => {
                    setTempName(playerName);
                    setEditingName(true);
                  }}
                  className="rounded-xl bg-amber-900/8 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-900/15 active:scale-95"
                >
                  Edit Name
                </button>
              )}
            </div>

            {/* Quick Rule Cards */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-pink-500/15 text-xs">🐱</span>
                <h3 className="font-display text-xs font-bold text-amber-950">Touch & Spots</h3>
              </div>
              <ul className="flex list-disc flex-col gap-1 pl-4 text-xs font-medium text-amber-900/85">
                <li><strong>Pet Oli:</strong> Tap him anytime (+{PET_JOY_BOOST} Joy).</li>
                <li><strong>Living Room &amp; Balcony:</strong> Use the bottom switcher or tap any cozy spot (sofa bed, box, window, rug, flower boxes, bistro chair, or balcony tiles).</li>
                <li><strong>Fountain:</strong> Tap to refresh his water (+40 Water).</li>
                <li><strong>Sound:</strong> Tap the speaker next to Menu to mute or unmute.</li>
                <li><strong>Closet:</strong> Tap the hanger to dress Oli up. Buy accessories with Churus.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-xs">🍗</span>
                <h3 className="font-display text-xs font-bold text-amber-950">Food & Treats</h3>
              </div>
              <ul className="flex list-disc flex-col gap-1 pl-4 text-xs font-medium text-amber-900/85">
                <li><strong>Fullness:</strong> Oli refuses food when full. Play with him first!</li>
                <li><strong>Tummy aches:</strong> Max {MAX_TREATS_IN_WINDOW} treats per 15 min. Soothe with belly rubs, brushing, or mist.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/15 text-xs">🧹</span>
                <h3 className="font-display text-xs font-bold text-amber-950">Cleaning & Litter</h3>
              </div>
              <ul className="flex list-disc flex-col gap-1 pl-4 text-xs font-medium text-amber-900/85">
                <li><strong>Litter box:</strong> Used every 2 meals. Tap directly to scoop (+15 Clean).</li>
                <li><strong>Rug messes:</strong> Fur clumps appear every few hours (throw-up when he’s grubby or ate too many treats). Tap to clean.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-xs">🍬</span>
                <h3 className="font-display text-xs font-bold text-amber-950">Cravings & Minigames</h3>
              </div>
              <ul className="flex list-disc flex-col gap-1 pl-4 text-xs font-medium text-amber-900/85">
                <li><strong>Cravings:</strong> Every 12–20 min Oli wants something. Fulfill it for 2× Joy + 1 churu point 🍬 (chin scratches give Joy only).</li>
                <li><strong>Minigames:</strong> Score 3/3 in Feather, Laser, Tail Spin, or Red Ball for +1 churu point 🍬.</li>
                <li><strong>Churus:</strong> {CHURU_POINTS_PER_TUBE} points = 1 Churu tube (the dots next to 🍬 at the top). Up to {MAX_CHURUS_EARNED_PER_DAY} tubes per day.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-xs">🌙</span>
                <h3 className="font-display text-xs font-bold text-amber-950">Sleep & Safety</h3>
              </div>
              <ul className="flex list-disc flex-col gap-1 pl-4 text-xs font-medium text-amber-900/85">
                <li><strong>Naps:</strong> Auto-naps below {AUTO_NAP_ENERGY} Energy (+{DECAY_RATES.sleeping.energy}/hr, wakes at 100 Energy). Wake early at {MIN_WAKE_ENERGY}+.</li>
                <li><strong>Vacation Mode:</strong> Pause the clock in Vacation tab when you travel.</li>
                <li><strong>9 Lives:</strong> Extreme neglect ({NEGLECT_DEATH_HOURS}h without food/water) costs 1 life.</li>
              </ul>
            </div>

            {/* Hourly Drift Table */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
              <h3 className="mb-1.5 font-display text-xs font-bold text-amber-950">⏱️ Hourly Drift</h3>
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
                      </div>
                      <div className="col-span-4 leading-tight">
                        <span
                          className={`font-extrabold ${sleepRate > 0 ? 'text-emerald-600' : 'text-indigo-900'}`}
                        >
                          {sleepRate > 0 ? `+${sleepRate}/h` : `${sleepRate}/h`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Beta Feedback Card */}
            <div className="rounded-2xl border border-amber-900/10 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 text-sm">
                  💬
                </span>
                <div>
                  <h3 className="font-display text-xs font-bold text-amber-950">Beta Feedback</h3>
                  <p className="text-[11px] font-medium text-amber-900/75">
                    Share thoughts, bugs, or ideas with the creator.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <a
                  href="mailto:nikwakwa@gmail.com?subject=Ravioli%20Beta%20Feedback&body=Hi!%0A%0AHere%20is%20my%20feedback%20for%20Ravioli:%0A%0A"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2 text-xs font-extrabold text-amber-950 shadow-xs hover:bg-amber-400 active:scale-95"
                >
                  <span>✉️ Email Feedback</span>
                </a>
                <button
                  type="button"
                  onClick={() => void handleCopyDiagnostics()}
                  className="flex items-center gap-1 rounded-xl border border-amber-900/15 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100/50 active:scale-95"
                  title="Copy game version and stats to clipboard"
                >
                  <span>{copiedDiagnostics ? '✓ Copied!' : '📋 Copy Info'}</span>
                </button>
              </div>
            </div>

            {/* Reset / Start Over Card */}
            <div className="rounded-2xl border border-rose-300/60 bg-rose-50/50 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xs font-bold text-rose-950">Start Over (Reset Game)</h3>
                  <p className="text-[11px] font-medium text-rose-900/75">
                    Clear all saved data and start fresh from Day 1.
                  </p>
                </div>
                {!confirmingReset && (
                  <button
                    type="button"
                    onClick={() => setConfirmingReset(true)}
                    className="rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-100 active:scale-95"
                  >
                    Reset…
                  </button>
                )}
              </div>

              {confirmingReset && (
                <div className="mt-3 rounded-xl border border-rose-300 bg-white p-3 text-rose-950">
                  <p className="text-xs font-bold">⚠️ Are you sure you want to reset everything?</p>
                  <p className="mt-1 text-[11px] font-medium text-rose-800">
                    This clears Oli’s needs, outfits, fortunes, and badges so you can test from scratch.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetAllGameData();
                        window.location.reload();
                      }}
                      className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-black text-white shadow-xs active:scale-95 hover:bg-rose-700"
                    >
                      Yes, Reset Everything
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingReset(false)}
                      className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-900 active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: BADGES & TROPHY SHELF */}
        {activeTab === 'badges' && (
          <div className="flex flex-col gap-3">
            {/* Header progress card */}
            <div className="rounded-3xl border border-amber-300/60 bg-gradient-to-br from-amber-100/90 via-amber-50 to-orange-50 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/30 text-2xl shadow-xs">
                    🏆
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-black text-amber-950">
                      Badges
                    </h3>
                    <p className="text-[11px] font-bold text-amber-800/80">
                      {`${medals.total} of ${maxMedals} Medals · 🥇 ${medals.gold} 🥈 ${medals.silver} 🥉 ${medals.bronze}`}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-950/10 px-2.5 py-1 font-display text-xs font-black text-amber-950">
                  {`${Math.round((medals.total / maxMedals) * 100)}%`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-amber-900/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 transition-all duration-500"
                  style={{ width: `${(medals.total / maxMedals) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] font-semibold text-amber-900/70">
                Level up each badge from Bronze to Silver and Gold for +1 🍬 at every tier!
              </p>
            </div>

            {/* Badges List */}
            <ul className="flex flex-col gap-2.5">
              {BADGES.map((badge) => {
                const currentLevel = getBadgeLevel(badgeState, badge.id);
                const progress = getBadgeProgress(badge.id, badgeState.stats, currentLevel);
                const isGold = currentLevel === 'gold';
                const isSilver = currentLevel === 'silver';
                const isBronze = currentLevel === 'bronze';
                const isLocked = !currentLevel;

                return (
                  <li
                    key={badge.id}
                    className={`flex flex-col gap-2 rounded-2xl border p-3 transition-all ${
                      isGold
                        ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50/60 shadow-xs'
                        : isSilver
                          ? 'border-slate-300 bg-slate-50/80 shadow-xs'
                          : isBronze
                            ? 'border-amber-700/30 bg-amber-900/4 shadow-xs'
                            : 'border-amber-900/10 bg-amber-950/3 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-2xs ${
                            isGold
                              ? 'bg-amber-100 ring-2 ring-amber-400'
                              : isSilver
                                ? 'bg-slate-200 ring-2 ring-slate-300'
                                : isBronze
                                  ? 'bg-amber-200/50 ring-2 ring-amber-700/40'
                                  : 'bg-amber-950/8 grayscale opacity-50'
                          }`}
                        >
                          {badge.emoji}
                        </span>
                        {!isLocked && (
                          <span className="absolute -bottom-1 -right-1 text-sm drop-shadow-xs">
                            {isGold ? '🥇' : isSilver ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-display text-xs font-black text-amber-950 truncate">
                            {badge.name}
                          </h4>
                          {isGold && (
                            <span className="rounded-full border border-amber-400/80 bg-amber-400/25 px-1.5 py-0.5 text-[9px] font-black text-amber-950">
                              🥇 Gold (Max ✨)
                            </span>
                          )}
                          {isSilver && (
                            <span className="rounded-full border border-slate-300 bg-slate-200 px-1.5 py-0.5 text-[9px] font-black text-slate-800">
                              🥈 Silver
                            </span>
                          )}
                          {isBronze && (
                            <span className="rounded-full border border-amber-700/30 bg-amber-900/10 px-1.5 py-0.5 text-[9px] font-black text-amber-900">
                              🥉 Bronze
                            </span>
                          )}
                          {isLocked && (
                            <span className="rounded-full bg-amber-950/8 px-1.5 py-0.5 text-[9px] font-bold text-amber-900/60">
                              🔒 Locked
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] font-semibold text-amber-900/80">
                          {isLocked ? badge.hint : badge.description}
                        </p>
                      </div>
                    </div>

                    {/* Tier Milestones Row */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-amber-900/6">
                      {(['bronze', 'silver', 'gold'] as const).map((tier) => {
                        const tierDef = badge.tiers[tier];
                        const tierUnlocked =
                          tier === 'bronze'
                            ? Boolean(isBronze || isSilver || isGold)
                            : tier === 'silver'
                              ? Boolean(isSilver || isGold)
                              : Boolean(isGold);
                        const medalIcon = tier === 'gold' ? '🥇' : tier === 'silver' ? '🥈' : '🥉';
                        const tierLabel = tier === 'gold' ? 'Gold' : tier === 'silver' ? 'Silver' : 'Bronze';

                        return (
                          <div
                            key={tier}
                            className={`flex flex-col items-center justify-center rounded-xl p-1 text-center transition-colors ${
                              tierUnlocked
                                ? tier === 'gold'
                                  ? 'bg-amber-400/25 border border-amber-400/70 text-amber-950'
                                  : tier === 'silver'
                                    ? 'bg-slate-200/90 border border-slate-300 text-slate-800'
                                    : 'bg-amber-900/10 border border-amber-700/30 text-amber-900'
                                : 'bg-amber-950/4 border border-dashed border-amber-900/15 text-amber-900/50'
                            }`}
                          >
                            <span className="text-[10px] font-black flex items-center gap-0.5">
                              <span>{medalIcon}</span>
                              <span>{tierLabel}</span>
                              {tierUnlocked && <span className="text-emerald-700 text-[9px]">✓</span>}
                            </span>
                            <span className="text-[9px] font-semibold truncate max-w-full">
                              {tierDef.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress to next tier */}
                    {!isGold && (
                      <div className="pt-0.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-900/70 mb-1">
                          <span>{`Next: ${progress.label}`}</span>
                          <span className="tabular-nums font-mono">{`${progress.current} / ${progress.target}`}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-900/10">
                          <div
                            className="h-full rounded-full bg-amber-500 transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.round((progress.current / progress.target) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
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
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-xl">
                  ✈️
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold">Pause Care Clock (Vacation Mode)</h2>
                  <p className="text-xs font-medium opacity-75">
                    Freeze time so Oli stays safe while you are away
                  </p>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between rounded-2xl bg-black/5 p-3">
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-60">Status</span>
                  <p className="font-display text-sm font-black">
                    {live.isPaused ? '✈️ Paused' : '🟢 Active'}
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

              <p className="mt-3 text-xs font-medium leading-relaxed opacity-85">
                Traveling or busy? Pause the clock! Stats, messes, and cravings freeze in time until you resume.
              </p>
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
                    {notifPrefs.enabled
                      ? isPushConfigured()
                        ? 'Live alerts arrive even when closed'
                        : 'Care alerts will be sent while open'
                      : 'Turn on to get care alerts'}
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

            {isIosDevice() && !isStandalonePwa() && (
              <p className="rounded-xl border border-amber-500/20 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-900">
                📱 On iPhone, add Ravioli to your Home Screen first so alerts arrive when the app is closed.
              </p>
            )}

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
                    <span>Low need alert (&lt; {NEED_THRESHOLD})</span>
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
                    <span>Critical alert (&lt;= {CRITICAL_THRESHOLD})</span>
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
