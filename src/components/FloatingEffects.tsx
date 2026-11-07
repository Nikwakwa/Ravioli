import { AnimatePresence, motion } from 'framer-motion';
import { STAT_META, type ParticleKind } from '../data/actions';
import type { GameEvent } from '../hooks/useCatGame';
import { STAT_KEYS, type CatSpot, type Mood, type StatKey } from '../types';
import { STAT_ICONS } from './statIcons';

const PET_LINES: Record<Mood, string[]> = {
  sleeping: ['Zzz… dreaming of a Churu tube…', 'Purr… five more minutes… 😴', 'Soft sleepy purrs… 🌙'],
  relaxed: ['So cozy right now… ✨', 'Mmm… warm & zen~ 😌', 'Slow blink of love 🧡'],
  ecstatic: ['PURRRR!! Best humans ever! 😻', 'Churu-powered zoomies!! 🧡✨', 'Making biscuits on the rug! 🐾'],
  happy: ['Prrrr… right under the chin~ 🧡', 'Did someone say Churu?! 😺', 'Happy tail swishes! ✨'],
  content: ['Purrrr… 🧡', 'Little nose boop! 🐾', 'Soft ginger floof~ ✨'],
  hungry: ['Meow? Could I have a Churu tube? 🐾', 'Tiny tummy rumble… 🥺', 'Dreaming of Churu & quail eggs…'],
  thirsty: ['Mew… fountain splash please? 💧', 'Thirsty little ginger boy 💧'],
  tired: ['Biiiig stretch & yawn… 🥱', 'Ready for a cozy nap soon…'],
  sad: ['Needed that cuddle… 🧡', 'Purr… stay with me a bit? 🥺'],
  grubby: ['Brush my floof please? 🪮', 'A little messy today~'],
  deceased: ['Resting peacefully… 🕊️', 'Oli needs emergency vet care 💔'],
};

const SPOT_PET_LINES: Record<CatSpot, string[]> = {
  rug: ['Purrrr… 🧡', 'Little nose boop! 🐾', 'Soft ginger floof~ ✨', 'Right under the chin~ 😺'],
  sofa_bed: [
    'Zzz… curled up in my Bedsure bed… 🛋️🧡',
    'Baking biscuits on the sofa cushion~ 🐾',
    'Soft sleepy purrs in the bolster bed… 🌙',
    'Warm & cozy ginger cinnamon roll~ ✨',
  ],
  box: [
    'If it fits, Oli sits! 📦✨',
    'Cardboard fortress: no dogs allowed! 🐾',
    'Playful swat from inside the box! 😼',
    'Best delivery ever: 100% ginger floof! 📦🧡',
  ],
  window: [
    'Chirp chirp! Watching the pigeons outside~ 🕊️✨',
    'Warm sunbeam nap on the windowsill ☀️',
    'Watching the clouds drift by… ☁️',
    'Cat TV is on: 10/10 entertainment! 🌿',
  ],
  planter: [
    'Sniffing the yellow & purple pansies~ 🌼✨',
    'Watching the street & trees below! 🌲🐾',
    'Inspecting the little cypress pot~ 🌿',
    'Fresh balcony breeze in my whiskers! 🍃🧡',
  ],
  bistro_chair: [
    'King of the sunny bistro table! 🪑😼',
    'Best café seat on the balcony~ ☕🧡',
    'Perched high for neighborhood watch! 👀✨',
    'Sunbathing on the wooden slats~ ☀️🐾',
  ],
  balcony_floor: [
    'Warm balcony tiles on my belly~ ☀️🧡',
    'Basking in the golden sunbeam~ ☀️🐾',
    'Stretching out in the fresh air~ 🌿✨',
    'Rolling on the sunny terrace! 😺',
  ],
};

const SPOT_BUBBLE_OFFSETS: Record<CatSpot, { left: string; bottom: string }> = {
  rug: { left: '50%', bottom: '232px' },
  sofa_bed: { left: '77%', bottom: '315px' },
  box: { left: '39%', bottom: '265px' },
  window: { left: '49%', bottom: '385px' },
  planter: { left: '33%', bottom: '335px' },
  bistro_chair: { left: '65%', bottom: '380px' },
  balcony_floor: { left: '35%', bottom: '280px' },
};

/**
 * Renders floating "+35 Hunger" stat bubbles, tap-to-pet thought bubbles, and
 * burst particles (hearts, water ripples, purr waves, calming mist, sparkles, crumbs) around Oli.
 */
export function FloatingEffects({
  event,
  tapHeartKey,
  mood,
  targetPos,
  spot = 'rug',
}: {
  event: GameEvent | null;
  tapHeartKey: number;
  mood: Mood;
  targetPos?: { x: number; y: number };
  spot?: CatSpot;
}) {
  const deltas: { key: StatKey; delta: number }[] = event
    ? STAT_KEYS.flatMap((k) => {
        const d = event.effect[k];
        return d ? [{ key: k, delta: d }] : [];
      })
    : [];

  const petLines = PET_LINES[mood] ?? PET_LINES.content;
  const spotLines = SPOT_PET_LINES[spot] ?? SPOT_PET_LINES.rug;
  // Alternate between mood line and cozy spot line
  const petLine =
    tapHeartKey % 2 === 1 && spot !== 'rug'
      ? spotLines[Math.floor(tapHeartKey / 2) % spotLines.length]
      : petLines[tapHeartKey % petLines.length];

  const pos = SPOT_BUBBLE_OFFSETS[spot];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Tap-to-pet thought bubble + floating heart */}
      <AnimatePresence>
        {tapHeartKey > 0 && (
          <motion.div
            key={`tap-${tapHeartKey}`}
            initial={{ opacity: 0, y: 12, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: -18, scale: [0.8, 1.03, 1, 0.96] }}
            transition={{ duration: 1.8, times: [0, 0.15, 0.8, 1], ease: 'easeOut' }}
            style={
              targetPos
                ? { left: `${targetPos.x}px`, top: `${targetPos.y - 10}px` }
                : { left: pos.left, bottom: pos.bottom }
            }
            className={`absolute z-20 flex -translate-x-1/2 flex-col items-center ${
              targetPos ? '-translate-y-full' : ''
            }`}
          >
            <div className="rounded-2xl border border-amber-900/10 bg-white/95 px-3 py-1 text-xs font-extrabold whitespace-nowrap text-amber-950 shadow-md">
              {petLine}
            </div>
            <div className="-mt-1 h-2 w-2 rotate-45 border-r border-b border-amber-900/10 bg-white/95" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating stat bubbles */}
      <AnimatePresence>
        {event && deltas.length > 0 && (
          <div
            key={`bubbles-${event.key}`}
            style={
              targetPos
                ? { left: `${targetPos.x}px`, top: `${targetPos.y - 12}px` }
                : { left: pos.left, bottom: pos.bottom }
            }
            className={`absolute z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 ${
              targetPos ? '-translate-y-full' : ''
            }`}
          >
            {deltas.map(({ key, delta }, i) => {
              const meta = STAT_META[key];
              const Icon = STAT_ICONS[key];
              const positive = delta > 0;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16, scale: 0.75 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -56 - i * 10, scale: [0.75, 1.06, 1] }}
                  transition={{ duration: 1.9, delay: i * 0.14, ease: 'easeOut' }}
                  style={{ backgroundColor: meta.soft, borderColor: meta.color, color: '#3b2416' }}
                  className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-extrabold shadow-md"
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                  <span>
                    {positive ? `+${delta}` : delta} {meta.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Particle bursts */}
      <AnimatePresence>
        {event && (
          <div key={`particles-${event.key}`} className="absolute inset-0">
            {event.particles.map((kind) => (
              <ParticleBurst key={kind} kind={kind} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ParticleBurst({ kind }: { kind: ParticleKind }) {
  if (kind === 'hearts') {
    const offsets = [-64, -36, -12, 16, 42, 68];
    return (
      <>
        {offsets.map((dx, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: dx * 0.3, y: 0, scale: 0.4 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: dx,
              y: -110 - (i % 3) * 22,
              scale: [0.4, 1.15, 0.9],
              rotate: dx * 0.3,
            }}
            transition={{ duration: 1.8, delay: i * 0.08, ease: 'easeOut' }}
            className="absolute left-1/2 bottom-[140px] -translate-x-1/2 text-xl"
          >
            {i % 2 === 0 ? '💖' : '🧡'}
          </motion.span>
        ))}
      </>
    );
  }

  if (kind === 'purr') {
    const notes = ['♪', '♡', '♫', '🧡', '♪'];
    return (
      <>
        {notes.map((sym, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: side * 24, y: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], x: side * (56 + i * 10), y: -60 - i * 14, scale: [0.6, 1.1, 0.9] }}
              transition={{ duration: 1.6, delay: i * 0.16, ease: 'easeOut' }}
              className="absolute left-1/2 bottom-[140px] -translate-x-1/2 text-lg font-bold text-amber-600"
            >
              {sym}
            </motion.span>
          );
        })}
      </>
    );
  }

  if (kind === 'ripples') {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.85, scale: 0.3 }}
            animate={{ opacity: 0, scale: 2.2 }}
            transition={{ duration: 1.5, delay: i * 0.25, ease: 'easeOut' }}
            className="absolute left-1/2 bottom-[60px] h-14 w-28 -translate-x-1/2 rounded-full border-2 border-sky-400"
          />
        ))}
        {[-38, -14, 14, 38].map((dx, i) => (
          <motion.span
            key={`d-${i}`}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], x: dx, y: [-10, -54, -20] }}
            transition={{ duration: 1.2, delay: i * 0.1 }}
            className="absolute left-1/2 bottom-[90px] -translate-x-1/2 text-base"
          >
            💧
          </motion.span>
        ))}
      </>
    );
  }

  if (kind === 'mist') {
    const clouds = [-60, -24, 16, 56];
    return (
      <>
        {clouds.map((dx, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: dx * 0.4, y: 10, scale: 0.5 }}
            animate={{ opacity: [0, 0.65, 0], x: dx, y: -70 - i * 10, scale: 1.6 }}
            transition={{ duration: 2.3, delay: i * 0.12, ease: 'easeOut' }}
            className="absolute left-1/2 bottom-[120px] h-16 w-16 -translate-x-1/2 rounded-full bg-purple-300/60 blur-md"
          />
        ))}
        {[-44, 0, 44].map((dx, i) => (
          <motion.span
            key={`sp-${i}`}
            initial={{ opacity: 0, x: dx, y: 0 }}
            animate={{ opacity: [0, 1, 0], x: dx * 1.2, y: -80 }}
            transition={{ duration: 2, delay: 0.2 + i * 0.15 }}
            className="absolute left-1/2 bottom-[140px] -translate-x-1/2 text-base"
          >
            ✨
          </motion.span>
        ))}
      </>
    );
  }

  if (kind === 'sparkles' || kind === 'stars') {
    const glyphs = kind === 'stars' ? ['⭐', '✨', '🌟', '✨', '⭐'] : ['✨', '🫧', '✨', '💛', '✨'];
    const xs = [-62, -30, 0, 32, 62];
    return (
      <>
        {xs.map((dx, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: dx * 0.5, y: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0], x: dx, y: -85 - (i % 2) * 20, scale: [0.4, 1.2, 0.7] }}
            transition={{ duration: 1.5, delay: i * 0.09, ease: 'easeOut' }}
            className="absolute left-1/2 bottom-[140px] -translate-x-1/2 text-lg"
          >
            {glyphs[i]}
          </motion.span>
        ))}
      </>
    );
  }

  // crumbs
  return (
    <>
      {[-28, -10, 12, 30].map((dx, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: dx * 0.4, y: 0 }}
          animate={{ opacity: [0, 1, 0], x: dx, y: -48 - i * 8 }}
          transition={{ duration: 1.2, delay: i * 0.1 }}
          className="absolute left-1/2 bottom-[110px] -translate-x-1/2 text-sm"
        >
          😋
        </motion.span>
      ))}
    </>
  );
}
