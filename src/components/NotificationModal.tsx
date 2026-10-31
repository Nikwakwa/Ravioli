import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Bell, BellOff, Check, Flame, Sun, Users, X } from 'lucide-react';
import { STAT_META } from '../data/actions';
import { STAT_KEYS, type StatKey } from '../types';
import { NEED_THRESHOLD } from '../utils/decayEngine';
import { CRITICAL_THRESHOLD, type NotificationPrefs } from '../utils/notifications';
import { STAT_ICONS } from './statIcons';

export interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  prefs: NotificationPrefs;
  onToggleMaster: () => void;
  onChangePrefs: (next: NotificationPrefs) => void;
  onTestNotification: () => void;
}

export function NotificationModal({
  open,
  onClose,
  prefs,
  onToggleMaster,
  onChangePrefs,
  onTestNotification,
}: NotificationModalProps) {
  const toggleFlag = (key: 'lowNeed' | 'critical' | 'wakeUp' | 'partner') => {
    onChangePrefs({ ...prefs, [key]: !prefs[key] });
  };

  const toggleStat = (stat: StatKey) => {
    onChangePrefs({
      ...prefs,
      stats: { ...prefs.stats, [stat]: !prefs.stats[stat] },
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs"
          />
          <motion.div
            key="notif-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border-t border-amber-900/10 bg-[#fff7ee] p-4 pb-6 shadow-2xl"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-amber-900/20" />

            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
                  {prefs.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </span>
                <div>
                  <h2 className="font-display text-base font-bold leading-tight text-amber-950">
                    Notification Preferences
                  </h2>
                  <p className="text-[11px] font-semibold text-amber-800/75">
                    Choose exactly which Oli alerts you want to receive
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-amber-900/10 p-1.5 text-amber-950"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex max-h-[68dvh] touch-pan-y flex-col gap-3 overflow-y-auto pr-1 text-amber-950">
              {/* Master switch card */}
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
                <div>
                  <p className="font-display text-xs font-bold text-amber-950">
                    {prefs.enabled ? '🔔 Notifications Enabled' : '🔕 Notifications Muted'}
                  </p>
                  <p className="text-[10px] font-semibold text-amber-800/75">
                    {prefs.enabled
                      ? 'System & in-app alerts are active for selected events'
                      : 'Tap Enable to allow browser/PWA alerts'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {prefs.enabled && (
                    <button
                      type="button"
                      onClick={onTestNotification}
                      className="rounded-full bg-amber-500/15 px-2.5 py-1.5 text-[10px] font-extrabold text-amber-800 active:scale-95"
                    >
                      Test Alert
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onToggleMaster}
                    className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors active:scale-95 ${
                      prefs.enabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    {prefs.enabled ? 'Enabled ✓' : 'Enable'}
                  </button>
                </div>
              </div>

              {/* Event type toggles */}
              <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
                <h3 className="mb-2 font-display text-xs font-bold text-amber-950">Alert Events</h3>
                <div className="flex flex-col gap-1.5">
                  <ToggleRow
                    icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                    title={`Low-Need Threshold (< ${NEED_THRESHOLD})`}
                    subtitle="Notify once when a watched need drops below 25"
                    checked={prefs.lowNeed}
                    onClick={() => toggleFlag('lowNeed')}
                  />
                  <ToggleRow
                    icon={<Flame className="h-3.5 w-3.5 text-rose-500" />}
                    title={`Critical Need (≤ ${CRITICAL_THRESHOLD})`}
                    subtitle="Urgent alert if a watched need drops to 5 or below"
                    checked={prefs.critical}
                    onClick={() => toggleFlag('critical')}
                  />
                  <ToggleRow
                    icon={<Sun className="h-3.5 w-3.5 text-amber-500" />}
                    title="Oli Wakes Up From Nap"
                    subtitle="Notify when Energy hits 100 and Oli wakes up on his own"
                    checked={prefs.wakeUp}
                    onClick={() => toggleFlag('wakeUp')}
                  />
                  <ToggleRow
                    icon={<Users className="h-3.5 w-3.5 text-sky-600" />}
                    title="Partner Co-op Actions"
                    subtitle="Notify when Nico or Athina cares for Oli in the background"
                    checked={prefs.partner}
                    onClick={() => toggleFlag('partner')}
                  />
                </div>
              </div>

              {/* Per-stat selection */}
              <div className="rounded-2xl border border-amber-900/8 bg-white p-3 shadow-2xs">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-display text-xs font-bold text-amber-950">Which Needs to Watch</h3>
                  <span className="text-[10px] font-bold text-amber-800/70">
                    {STAT_KEYS.filter((k) => prefs.stats[k]).length} of {STAT_KEYS.length} selected
                  </span>
                </div>
                <p className="mb-2.5 text-[10px] font-semibold text-amber-800/75">
                  Tap to choose which specific stats trigger Low-Need and Critical alerts:
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {STAT_KEYS.map((key) => {
                    const meta = STAT_META[key];
                    const Icon = STAT_ICONS[key];
                    const active = prefs.stats[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleStat(key)}
                        className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all active:scale-95 ${
                          active
                            ? 'border-amber-600/30 bg-amber-50/90 text-amber-950 shadow-2xs'
                            : 'border-amber-900/8 bg-amber-950/4 text-amber-900/45 opacity-60'
                        }`}
                      >
                        <Icon className="h-4 w-4" style={{ color: active ? meta.color : '#8c7a6b' }} />
                        <span className="text-[10px] font-extrabold leading-none">{meta.label}</span>
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold ${
                            active ? 'bg-emerald-600 text-white' : 'bg-amber-950/10 text-transparent'
                          }`}
                        >
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ToggleRow({
  icon,
  title,
  subtitle,
  checked,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2.5 rounded-xl bg-amber-950/4 px-3 py-2 text-left transition-colors hover:bg-amber-950/8 active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-2xs">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-display text-xs font-bold leading-tight text-amber-950">{title}</p>
          <p className="text-[10px] font-semibold leading-tight text-amber-800/75">{subtitle}</p>
        </div>
      </div>
      <span
        className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? 'bg-emerald-600 justify-end' : 'bg-amber-950/20 justify-start'
        }`}
      >
        <span className="h-4 w-4 rounded-full bg-white shadow-xs" />
      </span>
    </button>
  );
}
