import { DayRecord } from './types';
import { dateKey, daysAgoKey } from './utils';

/**
 * Game progression for ReelLess, derived ONLY from the stored history and
 * the current goal. Nothing here invents data:
 *
 * - A "quest" is a past day (strictly before today) that exists in history
 *   and finished at or under the current daily goal. Today's day is still
 *   in progress, so it never counts as a completed quest.
 * - Level = 1 + floor(questsCompleted / 3): one level per three finished
 *   quests. XP progress toward the next level is (questsCompleted % 3) / 3.
 * - Energy hearts map Volt's remaining charge today (1 - today/goal,
 *   clamped 0..1) onto 5 hearts, rounded to the nearest heart. Over the
 *   goal means zero hearts.
 */
export interface Progress {
  questsCompleted: number;
  level: number;
  xpFrac: number; // 0..1 toward next level
  questsToNextLevel: number;
  heartsFilled: number; // 0..5
  heartsTotal: 5;
}

export function deriveProgress(
  history: Record<string, DayRecord>,
  goal: number,
  todayTotal: number,
): Progress {
  const today = dateKey(new Date());
  const questsCompleted = Object.values(history).filter(
    (d) => d.date < today && d.total <= goal,
  ).length;
  const level = 1 + Math.floor(questsCompleted / 3);
  const xpFrac = (questsCompleted % 3) / 3;
  const charge = goal <= 0 ? 0 : Math.max(0, Math.min(1, 1 - todayTotal / goal));
  const heartsFilled = todayTotal > goal ? 0 : Math.round(charge * 5);
  return {
    questsCompleted,
    level,
    xpFrac,
    questsToNextLevel: 3 - (questsCompleted % 3),
    heartsFilled,
    heartsTotal: 5,
  };
}

export interface Badge {
  id: string;
  title: string;
  condition: string;
  unlocked: boolean;
}

/**
 * Achievement badges. Every condition is evaluated against the stored
 * history only (breaks are not recorded by the app, so no break badge is
 * offered — an unlock state we cannot prove is never shown as earned).
 * "Under goal" always means the current daily goal, same as quests.
 */
export function deriveBadges(
  history: Record<string, DayRecord>,
  goal: number,
): Badge[] {
  const today = dateKey(new Date());
  const past = Object.values(history).filter((d) => d.date < today);
  const underGoalDays = past.filter((d) => d.total <= goal).length;
  const lightestPast = past.length ? Math.min(...past.map((d) => d.total)) : Infinity;
  let last7Total = 0;
  for (let i = 1; i <= 7; i++) {
    last7Total += history[daysAgoKey(i)]?.total ?? 0;
  }
  const recordedDays = Object.keys(history).length;

  return [
    {
      id: 'first-steps',
      title: 'First Steps',
      condition: 'Finish a day at or under your goal',
      unlocked: underGoalDays >= 1,
    },
    {
      id: 'hat-trick',
      title: 'Hat Trick',
      condition: '3 days at or under your goal',
      unlocked: underGoalDays >= 3,
    },
    {
      id: 'high-five',
      title: 'High Five',
      condition: '5 days at or under your goal',
      unlocked: underGoalDays >= 5,
    },
    {
      id: 'feather-day',
      title: 'Feather Day',
      condition: 'A day of 25 reels or fewer',
      unlocked: lightestPast <= 25,
    },
    {
      id: 'quiet-week',
      title: 'Quiet Week',
      condition: 'Last 7 full days under 500 reels total',
      unlocked: past.length >= 7 && last7Total < 500,
    },
    {
      id: 'seasoned',
      title: 'Seasoned Scroller',
      condition: '10 days of counts recorded',
      unlocked: recordedDays >= 10,
    },
  ];
}
