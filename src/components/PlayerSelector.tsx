import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { PLAYER_PRESETS, playerColor } from '../utils/player';

export function PlayerSelector({
  open,
  current,
  onSelect,
}: {
  open: boolean;
  current: string | null;
  onSelect: (name: string) => void;
}) {
  const [custom, setCustom] = useState(
    current && !(PLAYER_PRESETS as readonly string[]).includes(current) ? current : '',
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-5 backdrop-blur-xs"
        >
          <motion.div
            initial={{ scale: 0.9, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 12 }}
            className="w-full max-w-xs rounded-3xl bg-[#fff7ee] p-5 text-center shadow-2xl border border-amber-900/10"
          >
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <h2 className="font-display text-lg font-bold text-amber-950">Who’s caring for Oli?</h2>
            <p className="mt-0.5 text-xs font-semibold text-amber-900/65">
              Every action is tagged in your shared activity log.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {PLAYER_PRESETS.map((preset) => {
                const c = playerColor(preset);
                const selected = current === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onSelect(preset)}
                    style={{ backgroundColor: c.bg, color: c.fg }}
                    className={`rounded-2xl py-3 font-display text-base font-bold shadow-xs transition-transform active:scale-95 ${
                      selected ? 'ring-2 ring-amber-600' : ''
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (custom.trim()) onSelect(custom.trim().slice(0, 24));
              }}
              className="mt-3 flex gap-1.5"
            >
              <input
                type="text"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Or custom nickname…"
                maxLength={24}
                className="min-w-0 flex-1 rounded-xl border border-amber-900/15 bg-white px-3 py-2 text-xs font-bold text-amber-950 placeholder:text-amber-900/40 focus:outline-2 focus:outline-amber-500"
              />
              <button
                type="submit"
                disabled={!custom.trim()}
                className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-40"
              >
                Save
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
