import { DayRecord, PlatformId, PLATFORMS, emptyPlatformCounts } from '../types';
import { dateKey, daysAgoKey, seededRandom } from '../utils';

/**
 * Reel counting sits behind this interface. The v1 implementation is a
 * seeded demo: the in-app Reels feed reports each watched reel, and past
 * days are generated deterministically. Live cross-app counting (Android
 * Accessibility overlay, iOS Screen Time frameworks) ships with the
 * native build and will implement this same interface.
 */
export interface ReelCountAdapter {
  readonly kind: 'demo' | 'live';
  seedHistory(days: number): Record<string, DayRecord>;
  friendCountFor(date: string): { name: string; count: number };
}

function buildDay(date: string, total: number): DayRecord {
  const byPlatform = emptyPlatformCounts();
  let remaining = total;
  PLATFORMS.forEach((p, i) => {
    if (i === PLATFORMS.length - 1) {
      byPlatform[p.id] = remaining;
    } else {
      const share = Math.round(total * (0.12 + seededRandom(`${date}-${p.id}`) * 0.3));
      const v = Math.min(share, remaining);
      byPlatform[p.id] = v;
      remaining -= v;
    }
  });
  return { date, total, byPlatform };
}

export const demoReelCountAdapter: ReelCountAdapter = {
  kind: 'demo',

  seedHistory(days: number): Record<string, DayRecord> {
    const out: Record<string, DayRecord> = {};
    for (let i = 1; i <= days; i++) {
      const key = daysAgoKey(i);
      const base = 55 + Math.floor(seededRandom(`reelless-${key}`) * 130);
      const weekendBoost = [0, 6].includes(new Date(key + 'T12:00:00').getDay()) ? 35 : 0;
      out[key] = buildDay(key, base + weekendBoost);
    }
    const today = dateKey(new Date());
    out[today] = { date: today, total: 0, byPlatform: emptyPlatformCounts() };
    return out;
  },

  friendCountFor(date: string): { name: string; count: number } {
    const count = 38 + Math.floor(seededRandom(`friend-${date}`) * 120);
    return { name: 'Maya', count };
  },
};

export function isValidPlatform(id: string): id is PlatformId {
  return PLATFORMS.some((p) => p.id === id);
}
