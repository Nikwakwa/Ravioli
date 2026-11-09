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
import {
  DEFAULT_ATMOSPHERE_PREFS,
  getAtmosphereSummary,
  resolveTimeOfDay,
  type AtmosphereMode,
  type AtmospherePrefs,
  type LiveWeatherInfo,
} from '../utils/atmosphere';
import { STAT_ICONS } from './statIcons';

export type MenuTab = 'rules' | 'atmosphere' | 'pause' | 'version' | 'notifications';

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
  atmospherePrefs?: AtmospherePrefs;
  onChangeAtmosphere?: (next: AtmospherePrefs) => void;
  liveWeather?: LiveWeatherInfo | null;
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
  atmospherePrefs = DEFAULT_ATMOSPHERE_PREFS,
  onChangeAtmosphere,
  liveWeather,
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

  const currentEffectiveTime = resolveTimeOfDay(atmospherePrefs.mode);
  const currentSummary = getAtmosphereSummary(
    currentEffectiveTime,
    Boolean(liveWeather?.isRaining),
    atmospherePrefs.mode
  );

  const tabs: Array<{ id: MenuTab; label: string; icon: string; badge?: boolean }> = [
    { id: 'rules', label: 'Rules', icon: '📖' },
    { id: 'atmosphere', label: 'Ambience', icon: '🌅' },
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

        {/* 5-Column Segmented Tab Bar */}
        <nav className="mt-2.5 grid grid-cols-5 gap-1 rounded-2xl bg-amber-950/6 p-1" aria-label="Menu Sections">
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
          </div>
        )}

        {/* TAB 2: REAL-TIME ATMOSPHERE & AMBIENCE */}
        {activeTab === 'atmosphere' && (
          <div className="flex flex-col gap-3">
            {/* Current Ambience Status Card */}
            <div className="rounded-2xl border border-amber-900/10 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-2xl">
                  {currentSummary.emoji}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="font-display text-sm font-bold text-amber-950">Real-Time Atmosphere</h2>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                      {currentSummary.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-amber-900/75 leading-relaxed">
                    {currentSummary.tagline}
                  </p>
                </div>
              </div>
            </div>

            {/* Time of Day Lighting Modes */}
            <div className="rounded-2xl border border-amber-900/10 bg-white p-4 shadow-sm">
              <h3 className="font-display text-xs font-bold text-amber-950 uppercase tracking-wider opacity-75">
                Lighting & Time of Day
              </h3>
              <p className="mt-0.5 text-xs font-medium text-amber-900/70">
                Oli’s home naturally follows your clock, or you can pick your favorite atmosphere anytime.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'auto' as AtmosphereMode,
                    label: 'Real-Time Clock (Auto)',
                    emoji: '⏰',
                    desc: 'Sunbeams by day (07:00–17:30), golden sunset in the evening, and starlight with cozy lamp at night.',
                  },
                  {
                    id: 'day' as AtmosphereMode,
                    label: 'Sunny Daylight',
                    emoji: '☀️',
                    desc: 'Crisp bright daylight with soft sunbeams streaming across the rug.',
                  },
                  {
                    id: 'sunset' as AtmosphereMode,
                    label: 'Golden Hour Sunset',
                    emoji: '🌅',
                    desc: 'Warm sunset glow across the balcony and rich apricot light on the walls.',
                  },
                  {
                    id: 'night' as AtmosphereMode,
                    label: 'Cozy Night Mode',
                    emoji: '🌙',
                    desc: 'Starlit sky, crescent moon, and the warm windowsill lamp on.',
                  },
                ].map((opt) => {
                  const selected = atmospherePrefs.mode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeAtmosphere?.({ ...atmospherePrefs, mode: opt.id })}
                      className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-all active:scale-[0.99] ${
                        selected
                          ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-1 ring-amber-500/30'
                          : 'border-amber-900/10 bg-amber-900/3 hover:bg-amber-900/6'
                      }`}
                    >
                      <span className="text-xl leading-none pt-0.5">{opt.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${selected ? 'text-amber-950 font-black' : 'text-amber-900'}`}>
                            {opt.label}
                          </span>
                          {selected && <Check className="h-4 w-4 text-amber-600" />}
                        </div>
                        <p className="mt-0.5 text-[11px] font-medium text-amber-900/70 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Luxembourg Outside Weather Card */}
            <div className="rounded-2xl border border-sky-900/10 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-xl">
                  {liveWeather?.isRaining ? '🌧️' : liveWeather ? liveWeather.emoji : '🇱🇺'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-sm font-bold text-amber-950">
                      Luxembourg Weather
                    </h3>
                    <span className="text-xs">🇱🇺</span>
                  </div>
                  <p className="text-xs font-medium text-amber-900/70">
                    Automatic outside rain matching
                  </p>
                </div>
              </div>

              {liveWeather ? (
                <div className="mt-3.5 flex items-center justify-between rounded-xl bg-sky-50/70 p-3 border border-sky-900/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{liveWeather.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-sky-950">
                        {liveWeather.label} • {Math.round(liveWeather.temperatureC)}°C
                      </p>
                      <p className="text-[11px] font-medium text-sky-900/75 mt-0.5">
                        {liveWeather.isRaining
                          ? '🌧️ Raining in Luxembourg — Cat TV is on Oli’s window!'
                          : '☀️ Dry in Luxembourg — clear window'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3.5 rounded-xl bg-sky-50/50 p-3 text-xs text-sky-900/70">
                  Checking weather in Luxembourg…
                </div>
              )}

              <p className="mt-3 text-xs font-medium text-amber-900/75 leading-relaxed">
                Oli’s window automatically matches the real rain in Luxembourg City each time the app is launched.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: VACATION CLOCK (PAUSE BUTTON) */}
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
                    {notifPrefs.enabled ? 'Care alerts will be sent' : 'Turn on to get care alerts'}
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
