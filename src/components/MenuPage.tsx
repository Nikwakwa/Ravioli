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
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  AUTO_NAP_ENERGY,
  CARE_ACTIONS,
  MAX_SLEEP_ENERGY,
  MAX_TREATS_IN_WINDOW,
  MIN_WAKE_ENERGY,
  PET_JOY_BOOST,
  STAT_META,
} from '../data/actions';
import { APP_VERSION, CHANGELOG } from '../data/changelog';
import { STAT_KEYS, type CatSpot, type LiveCat, type StatKey } from '../types';
import {
  DECAY_RATES,
  MAX_LIVES,
  MIN_NAP_HOURS,
  NEED_THRESHOLD,
  NEGLECT_DEATH_HOURS,
  THRIVING_THRESHOLD,
} from '../utils/decayEngine';
import { CRITICAL_THRESHOLD, type NotificationPrefs } from '../utils/notifications';
import { STAT_ICONS } from './statIcons';

export type MenuTab = 'rules' | 'pause' | 'spots' | 'version' | 'notifications';

export interface MenuPageProps {
  onClose: () => void;
  initialTab?: MenuTab;
  live: LiveCat;
  spot: CatSpot;
  onSelectSpot: (spot: CatSpot) => void;
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
  spot,
  onSelectSpot,
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
    { id: 'rules', label: 'Rules & Guide', icon: '📖' },
    { id: 'pause', label: live.isPaused ? 'Clock Paused' : 'Vacation Clock', icon: '✈️' },
    { id: 'spots', label: 'Cozy Spots', icon: '🛋️' },
    { id: 'version', label: APP_VERSION, icon: '✨', badge: Boolean(availableVersion) },
    { id: 'notifications', label: 'Alerts', icon: notifPrefs.enabled ? '🔔' : '🔕' },
  ];

  const spotsList: Array<{ id: CatSpot; label: string; emoji: string; desc: string }> = [
    {
      id: 'rug',
      label: 'Fluffy Living Room Rug',
      emoji: '🧶',
      desc: 'High-pile cream shag rug in the center of the room. Perfect for chin scratches and tummy rubs.',
    },
    {
      id: 'sofa_bed',
      label: 'Sofa Bolster Bed',
      emoji: '🛋️',
      desc: 'Oli’s tan Bedsure bolster cat bed nestled safely on the dark sofa cushion. Warm and peaceful.',
    },
    {
      id: 'box',
      label: 'Amazon Delivery Box',
      emoji: '📦',
      desc: 'Empty cardboard box on the floor. If it fits, he sits! Oli loves peeking his head over the edge.',
    },
    {
      id: 'window',
      label: 'Sunny Windowsill',
      emoji: '🪟',
      desc: 'Perched high up on the windowsill next to the potted plant, watching the clouds and birds outside.',
    },
  ];

  return (
    <div className="relative flex h-full w-full flex-col bg-[#fff7ee] text-amber-950">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-20 border-b border-amber-900/10 bg-[#fff7ee]/95 px-4 pt-3 pb-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-full bg-amber-900/10 px-3 py-1.5 text-xs font-bold text-amber-950 transition-colors hover:bg-amber-900/15 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Oli</span>
          </button>

          <h1 className="font-display text-sm font-extrabold text-amber-950">Care Guide & Settings</h1>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-amber-900/10 p-1.5 text-amber-950 transition-colors hover:bg-amber-900/15 active:scale-95"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Horizontal Navigation Tabs */}
        <nav className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" aria-label="Menu Sections">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                  active
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-900/8 text-amber-900/80 hover:bg-amber-900/12 hover:text-amber-950'
                }`}
                aria-pressed={active}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {t.badge && (
                  <span className="relative flex h-2 w-2">
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
            <div className="rounded-2xl border border-amber-900/10 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-lg">
                  📖
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold text-amber-950">Oli Care Manual & Rules</h2>
                  <p className="text-[11px] font-semibold text-amber-800/75">
                    Care rules, fullness, tummy aches & 9 lives
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Vacation Callout if clock is paused */}
            {live.isPaused && (
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-sky-400/30 bg-sky-50 p-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✈️</span>
                  <div>
                    <p className="text-xs font-bold text-sky-950">Care clock is currently paused</p>
                    <p className="text-[10px] text-sky-800/80">Oli is resting safely in Vacation Mode.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('pause')}
                  className="rounded-full bg-sky-600 px-3 py-1 text-xs font-extrabold text-white shadow-xs"
                >
                  Manage Clock
                </button>
              </div>
            )}

            {/* Section 1: Core Care Rules */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <h3 className="mb-2 font-display text-xs font-bold text-amber-950">
                🐾 Core Care Rules: Fullness, Treats & Petting
              </h3>
              <ul className="flex list-disc flex-col gap-2 pl-4 text-[11px] font-semibold leading-snug text-amber-900/85">
                <li>
                  <strong>Interactive Chin Scratches:</strong> Tap Oli directly in the living room anytime he’s awake to
                  give him chin scratches (<strong className="text-pink-600">+{PET_JOY_BOOST} Joy</strong> every 20s)!
                </li>
                <li>
                  <strong>Tap the Fountain:</strong> You can also tap the glowing blue LED water fountain in the living room
                  directly to refresh his water.
                </li>
                <li>
                  <strong>Fullness Refusals:</strong> Oli shakes his head and refuses heavy meals (
                  <strong>Wet Food</strong> at 85+ Hunger, <strong>Quail Egg</strong> at 90+ Hunger) when his belly is
                  already full. Play with him first to work up an appetite!
                </li>
                <li>
                  <strong className="text-rose-600">Tummy Ache (Overfeeding):</strong> Feeding more than{' '}
                  <strong>{MAX_TREATS_IN_WINDOW} treats</strong> (Churu or Chicken Heart) within 15 minutes gives Oli
                  a tummy ache (-10 Joy, -15 Energy, -10 Clean) and makes him throw up on the rug. Rub his belly,{' '}
                  <strong>Brush</strong> him, or use <strong>Calming Mist</strong> to soothe it!
                </li>
                <li>
                  <strong>📦 Corner Litter Box & Fur Tumbleweeds:</strong> Real Oli always uses his litter box! Every 2nd
                  meal (or after hours away), Oli uses his litter box in the corner — tap it directly to scoop (+15 Clean, +6
                  Joy)! Shed ginger fur tumbleweeds appear on the rug — tap them directly or use{' '}
                  <strong>Care → Scoop Box</strong> to clean them up.
                </li>
                <li>
                  <strong>💭 Attention Calls (“Meow!” Cravings):</strong> Periodically Oli shows a craving bubble above
                  his head. Tap the bubble before time runs out for{' '}
                  <strong className="text-pink-600">2× Joy + 1 Churu Tube 🍬</strong>! Ignoring a craving makes him
                  pouty (-8 Joy).
                </li>
                <li>
                  <strong>🍬 Churu Treat Stash:</strong> Earn more Churus by fulfilling Oli’s{' '}
                  <strong>craving thought bubbles</strong> or scoring a <strong>3/3 Perfect Play</strong> in minigames.
                  Scooping the litter box and sweeping fur tumbleweeds keeps Oli’s home clean and happy!
                </li>
                <li>
                  <strong>🎮 3-Round Play Minigames:</strong> Choosing <strong>Feather Wand</strong> launches{' '}
                  <em>Feather Pounce!</em> (reflex timing) and <strong>Laser Zoomies</strong> launches{' '}
                  <em>Which Paw? Left or Right!</em> Score <strong>2/3</strong> for +8 Bonus Joy, or{' '}
                  <strong className="text-emerald-700">3/3 Perfect Combo</strong> for +15 Bonus Joy &{' '}
                  <strong>+1 Churu Tube 🍬</strong>!
                </li>
                <li>
                  <strong className="text-rose-700">🐾 9 Lives & Severe Neglect Warning:</strong> While normal sleep
                  and busy workdays are completely safe, leaving Oli unattended for over{' '}
                  <strong>{NEGLECT_DEATH_HOURS} continuous hours at 0 food and water</strong> (over 2.5 days of complete
                  neglect) can cause him to pass away! Oli has <strong>{MAX_LIVES} lives</strong> — an emergency vet revival
                  will nurse him back to life, but please use <strong>Vacation Clock</strong> whenever traveling so he
                  stays safe!
                </li>
              </ul>
            </div>

            {/* Section 2: Sleep & Naps */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <h3 className="mb-2 flex items-center gap-1.5 font-display text-xs font-bold text-amber-950">
                <Moon className="h-3.5 w-3.5 text-indigo-500" />
                <span>Sleep, Naps & Energy Recharge</span>
              </h3>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[11px] font-semibold leading-snug text-amber-900/85">
                <li>
                  Tap <strong>Sleep</strong> in the bottom dock to tuck Oli in for a nap.
                </li>
                <li>
                  If Energy drops below <strong>{AUTO_NAP_ENERGY}</strong>, Oli curls up and falls asleep on his own.
                </li>
                <li>
                  While asleep, Energy recharges at <strong>+{DECAY_RATES.sleeping.energy}/hr</strong>. Hunger and Thirst
                  decay at half speed.
                </li>
                <li>
                  Oli automatically wakes up once fully rested at <strong>{MAX_SLEEP_ENERGY} Energy</strong>.
                </li>
                <li>
                  You can gently wake him early once he has rested at least <strong>{MIN_NAP_HOURS}h</strong> and reached{' '}
                  <strong>{MIN_WAKE_ENERGY} Energy</strong>.
                </li>
              </ul>
            </div>

            {/* Section 3: Stat Decay Speeds Table */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <h3 className="mb-1 font-display text-xs font-bold text-amber-950">⏱️ Stat Decay Speeds</h3>
              <p className="mb-2 text-[10px] font-semibold text-amber-800/75">
                Oli’s 5 stats drift continuously in real time — even while the app is closed.
              </p>
              <div className="overflow-hidden rounded-xl border border-amber-900/10">
                <div className="grid grid-cols-12 bg-amber-950/5 px-2.5 py-1.5 text-[10px] font-extrabold text-amber-900">
                  <span className="col-span-4">Stat</span>
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

            {/* Section 4: Care Actions Reference */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <h3 className="mb-2 font-display text-xs font-bold text-amber-950">🐾 Care Actions & Trade-offs</h3>
              <div className="flex flex-col gap-1.5">
                {CARE_ACTIONS.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-amber-950/4 px-2.5 py-1.5 text-[11px]"
                  >
                    <div className="min-w-0">
                      <span className="font-extrabold text-amber-950">{a.short}</span>
                      {a.calmMinutes && (
                        <span className="ml-1.5 rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-purple-800">
                          {a.calmMinutes}m Zen
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-1">
                      {STAT_KEYS.map((k) => {
                        const val = a.effect[k];
                        if (!val) return null;
                        return (
                          <span
                            key={k}
                            style={{ backgroundColor: STAT_META[k].soft, color: '#432818' }}
                            className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none"
                          >
                            {val > 0 ? `+${val}` : val} {STAT_META[k].label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Mood Thresholds */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <h3 className="mb-1 flex items-center gap-1 font-display text-xs font-bold text-amber-950">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Mood Thresholds</span>
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-4 text-[11px] font-semibold leading-snug text-amber-900/85">
                <li>
                  <strong className="text-rose-600">Low-Need Alert (&lt; {NEED_THRESHOLD})</strong>: When Hunger or
                  Water drops below {NEED_THRESHOLD} (or Energy/Clean &lt; 20, Joy &lt; 30), the stat bar turns red
                  and Oli’s mood badge tells you what he needs.
                </li>
                <li>
                  <strong className="text-amber-700">Thriving (&ge; {THRIVING_THRESHOLD})</strong>: Keep all 5 stats
                  at {THRIVING_THRESHOLD}+ to make Oli ecstatic and trigger confetti!
                </li>
              </ul>
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
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-2xl">
                  ✈️
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold">Pause Care Clock (Vacation Mode)</h2>
                  <p className="text-[11px] font-semibold opacity-75">
                    Freeze time so Oli stays safe while you are away
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-black/5 p-3">
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-60">Status</span>
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

              <p className="mt-3 text-[11px] font-medium leading-relaxed opacity-90">
                Taking a flight, studying for finals, or away from your phone? Pause the care clock! Oli’s needs
                (Hunger, Thirst, Energy, Joy, Clean) freeze completely in time — no decay, no messes, and no cravings
                until you tap Resume.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <h3 className="mb-2 font-display text-xs font-bold text-amber-950">🛡️ Vacation Mode Protection</h3>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[11px] font-semibold text-amber-900/85">
                <li>Stats never drop while paused — zero hunger or thirst.</li>
                <li>Oli’s 9 lives are completely safe from neglect while away.</li>
                <li>No random messes or fur tumbleweeds will appear.</li>
                <li>You can resume the clock anytime with a single tap.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: COZY SPOTS */}
        {activeTab === 'spots' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-amber-900/10 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-lg">
                  🛋️
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold text-amber-950">Where Oli Hangs Out</h2>
                  <p className="text-[11px] font-semibold text-amber-800/75">
                    Tap a cozy spot below to move Oli there
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {spotsList.map((s) => {
                const isCurrent = spot === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectSpot(s.id)}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.99] ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                        : 'border-amber-900/8 bg-white hover:bg-amber-50/50'
                    }`}
                  >
                    <span className="text-2xl leading-none">{s.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-display text-xs font-bold text-amber-950">{s.label}</h3>
                        {isCurrent && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
                            <Check className="h-3 w-3 stroke-[3]" />
                            <span>Here now</span>
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] font-medium leading-snug text-amber-900/75">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-amber-900/8 bg-amber-100/50 p-3 text-[11px] font-semibold text-amber-900/85">
              💡 <strong>Direct Touch Tip:</strong> You can also tap the sofa bolster bed, cardboard box, windowsill, or
              rug directly in the living room anytime to move Oli there or pet him!
            </div>
          </div>
        )}

        {/* TAB 4: WHAT’S NEW & APP VERSION */}
        {activeTab === 'version' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-2xl border border-amber-900/10 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-lg">
                  ✨
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold text-amber-950">Ravioli App Version</h2>
                  <p className="text-[11px] font-semibold text-amber-800/75">
                    Release notes, features & updates
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-500 px-2.5 py-1 font-mono text-xs font-black text-white shadow-2xs">
                {APP_VERSION}
              </span>
            </div>

            {availableVersion && onApplyUpdate && (
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-500/35 bg-emerald-50 p-3.5 shadow-sm">
                <div>
                  <p className="font-display text-xs font-bold text-emerald-950">
                    ✨ New version <span className="font-extrabold">{availableVersion}</span> is ready!
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-800/80">
                    Tap Reload to get the latest features.
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

            <div className="flex flex-col gap-2.5">
              {CHANGELOG.map((rel, idx) => (
                <div key={rel.version} className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-extrabold ${
                          idx === 0 ? 'bg-amber-500 text-white' : 'bg-amber-950/8 text-amber-900'
                        }`}
                      >
                        {rel.version}
                      </span>
                      <h3 className="font-display text-xs font-bold text-amber-950">{rel.title}</h3>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800/60">{rel.date}</span>
                  </div>
                  <ul className="mt-2 flex list-disc flex-col gap-1 pl-3.5 text-[11px] font-semibold text-amber-900/80">
                    {rel.changes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS & ALERTS */}
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
                  <p className="text-[10px] font-semibold text-amber-800/75">
                    {notifPrefs.enabled ? 'Oli alerts will be delivered' : 'Tap enable to receive care alerts'}
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
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-amber-900/10 bg-amber-100/60 py-2.5 text-xs font-bold text-amber-950 active:scale-95"
              >
                <span>🔔 Send Test Notification</span>
              </button>
            )}

            {/* Event Preferences */}
            <div className="rounded-2xl border border-amber-900/8 bg-white p-3.5 shadow-2xs">
              <h3 className="mb-2 font-display text-xs font-bold text-amber-950">Alert Events</h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between gap-2 text-xs font-semibold text-amber-950">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Low need alert (below {NEED_THRESHOLD})</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.lowNeed}
                    onChange={() => toggleNotifFlag('lowNeed')}
                    className="h-4 w-4 accent-amber-500"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-xs font-semibold text-amber-950">
                  <div className="flex items-center gap-2">
                    <Flame className="h-3.5 w-3.5 text-rose-600" />
                    <span>Critical alert (below {CRITICAL_THRESHOLD})</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.critical}
                    onChange={() => toggleNotifFlag('critical')}
                    className="h-4 w-4 accent-amber-500"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-xs font-semibold text-amber-950">
                  <div className="flex items-center gap-2">
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    <span>Wake up alert (after nap)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.wakeUp}
                    onChange={() => toggleNotifFlag('wakeUp')}
                    className="h-4 w-4 accent-amber-500"
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
                      className={`flex items-center justify-between rounded-xl border p-2 text-xs font-bold transition-all ${
                        active
                          ? 'border-amber-500 bg-amber-50 text-amber-950'
                          : 'border-amber-900/10 text-amber-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 capitalize">
                        <Icon className="h-3.5 w-3.5" />
                        <span>{k}</span>
                      </div>
                      {active && <Check className="h-3 w-3 text-amber-600 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
