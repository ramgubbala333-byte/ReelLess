# ReelLess

Count every reel. ReelLess counts each short video you watch and shows the number while you
scroll, with a daily goal, a battery mascot (Volt) that drains as you scroll, stats, and a
daily fewer-reels-wins duel with friends.

Working name, pending final lock. Built with Expo SDK 58, TypeScript, expo-router, Zustand +
AsyncStorage. Local-first, no backend.

## What works in this build (Expo Go)

- **Demo Reels feed**: a simulated vertical feed. Every reel you land on increments today's
  count in real time, with a floating count pill over the feed.
- **Today**: hero count, goal ring, time-spent estimate, yesterday comparison, per-platform
  counts, Volt's charge state.
- **Stats**: weekly bar chart, today / yesterday / week / all-time totals, per-platform
  breakdown, lightest-day callout.
- **Duel**: you vs a demo rival, win/lose state, share-style challenge sheet with a link.
- **Limits**: daily goal in onboarding and Settings. Crossing it empties Volt and raises a
  statement screen with a cooldown break (demo shield, 60 second countdown).
- **Onboarding**: 4 steps. No survey.
- **Dormant paywall**: PRO screen with the grandfathering promise printed. Paywall is off;
  everything is free in v1.
- Counting sits behind `src/services/reelCountAdapter.ts`. Past days are seeded demo history.

## Native build roadmap

1. **Home-screen widget** (count + Volt, live). Priority 1.
2. **Live cross-app counting**: Android Accessibility overlay for the floating count pill;
   iOS Screen Time frameworks (FamilyControls / DeviceActivity) on Apple devices.
3. **Real blocking** when the goal is crossed, inside the target apps.
4. **Accounts + real friend duels** (Supabase), RevenueCat paywall behind the dormant stub.
5. Optional Google sign-in + cloud backup; guest mode stays the default.

## Run

```
npm install
npx expo start --tunnel ngrok --port 8084
```

## Verify

```
npm run typecheck
npx expo export --platform android   # Metro bundle resolution check
npx expo export --platform web       # web build used for interaction checks
```
