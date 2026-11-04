import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { demoReelCountAdapter } from '../services/reelCountAdapter';
import { DayRecord, PlatformId, PLATFORMS, emptyPlatformCounts } from '../types';
import { dateKey, todayKey } from '../utils';

export interface ReelLessState {
  onboarded: boolean;
  goal: number;
  platforms: Record<PlatformId, boolean>;
  history: Record<string, DayRecord>;
  goalModalDismissedFor: string | null;
  lastCountedIndex: number;

  todayRecord: () => DayRecord;
  incrementReel: (platform: PlatformId) => void;
  setGoal: (goal: number) => void;
  togglePlatform: (id: PlatformId) => void;
  completeOnboarding: (goal: number, platforms: Record<PlatformId, boolean>) => void;
  dismissGoalModal: () => void;
  resetDemo: () => void;
  exportJson: () => string;
}

function allPlatformsOn(): Record<PlatformId, boolean> {
  const out = {} as Record<PlatformId, boolean>;
  PLATFORMS.forEach((p) => (out[p.id] = true));
  return out;
}

function freshToday(): DayRecord {
  const key = todayKey();
  return { date: key, total: 0, byPlatform: emptyPlatformCounts() };
}

export const useStore = create<ReelLessState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      goal: 100,
      platforms: allPlatformsOn(),
      history: demoReelCountAdapter.seedHistory(14),
      goalModalDismissedFor: null,
      lastCountedIndex: -1,

      todayRecord: () => {
        const key = todayKey();
        return get().history[key] ?? freshToday();
      },

      incrementReel: (platform) => {
        const key = todayKey();
        set((s) => {
          const current = s.history[key] ?? freshToday();
          const next: DayRecord = {
            ...current,
            total: current.total + 1,
            byPlatform: { ...current.byPlatform, [platform]: current.byPlatform[platform] + 1 },
          };
          return { history: { ...s.history, [key]: next } };
        });
      },

      setGoal: (goal) => set({ goal: Math.max(10, Math.min(500, Math.round(goal))) }),

      togglePlatform: (id) =>
        set((s) => ({ platforms: { ...s.platforms, [id]: !s.platforms[id] } })),

      completeOnboarding: (goal, platforms) => set({ onboarded: true, goal, platforms }),

      dismissGoalModal: () => set({ goalModalDismissedFor: todayKey() }),

      resetDemo: () =>
        set({
          history: demoReelCountAdapter.seedHistory(14),
          goalModalDismissedFor: null,
          lastCountedIndex: -1,
        }),

      exportJson: () => {
        const s = get();
        return JSON.stringify(
          {
            app: 'ReelLess',
            exportedAt: new Date().toISOString(),
            goal: s.goal,
            platforms: s.platforms,
            history: s.history,
          },
          null,
          2,
        );
      },
    }),
    {
      name: 'reelless-state-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        goal: s.goal,
        platforms: s.platforms,
        history: s.history,
        goalModalDismissedFor: s.goalModalDismissedFor,
        lastCountedIndex: s.lastCountedIndex,
      }),
    },
  ),
);

export function selectToday(s: ReelLessState): DayRecord {
  const key = dateKey(new Date());
  return s.history[key] ?? { date: key, total: 0, byPlatform: emptyPlatformCounts() };
}

export function selectYesterday(s: ReelLessState): DayRecord {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const key = dateKey(d);
  return s.history[key] ?? { date: key, total: 0, byPlatform: emptyPlatformCounts() };
}
