import { Droplets, Drumstick, Heart, Sparkles, Zap, type LucideIcon } from 'lucide-react';
import type { StatKey } from '../types';

export const STAT_ICONS: Record<StatKey, LucideIcon> = {
  hunger: Drumstick,
  hydration: Droplets,
  happiness: Heart,
  energy: Zap,
  hygiene: Sparkles,
};
