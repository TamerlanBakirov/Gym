# Forge — Fitness & Workout App 🏋️

A professional, BetterMe-style fitness mobile app built with **React Native + Expo**.
Personalized onboarding quiz, smart workout plans, live workout sessions with rest
timers, and full progress tracking — all in a polished dark, athletic UI.

## Features

- **Onboarding quiz** — an 8-step BetterMe-style flow (goal, level, body type, target
  areas, equipment, frequency, age) that builds a personalized plan, complete with an
  animated "building your plan" screen and a plan reveal.
- **Workouts** — a curated library of bodyweight/calisthenics & gym workouts, filterable
  by muscle group. Each workout has exercises, sets/reps, rest and a coaching cue.
- **Live workout session** — step-by-step exercise flow with set tracking, rest
  countdown timer, timed-exercise support, haptics, and a celebratory completion screen.
- **Progress tracking** — workout stats, streaks, a 7-day activity chart, weight logging
  with a trend chart, and a recent-activity feed.
- **Profile & settings** — goals overview, reminders toggle, units, and onboarding reset.
- **Local persistence** — all state is saved on-device with AsyncStorage.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Expo SDK 56, React Native 0.85, React 19 |
| Navigation | expo-router (file-based) |
| Language | TypeScript (strict) |
| State | React Context + AsyncStorage |
| UI | Custom design system, expo-linear-gradient, @expo/vector-icons, expo-haptics |
| Animation | react-native-reanimated |

## Project structure

```
app/                         # expo-router routes
  _layout.tsx                # root: providers + stack
  index.tsx                  # entry gate (onboarded? → tabs : onboarding)
  onboarding/                # welcome → quiz → building → plan
  (tabs)/                    # Today, Workouts, Progress, Profile
  workout/[id].tsx           # workout detail
  workout/session.tsx        # live session player
src/
  theme/                     # colors, spacing, typography, gradients
  types/                     # domain types
  data/                      # exercises, workouts, quiz definition
  lib/                       # plan recommendation, date/format helpers
  store/                     # AppContext (state + persistence)
  components/                # Screen, Button, WorkoutCard, ui primitives
```

## Getting started

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with the
**Expo Go** app on your phone.

### Useful scripts

```bash
npm run ios          # open in iOS simulator
npm run android      # open in Android emulator
npm run typecheck    # TypeScript check (tsc --noEmit)
```

## Notes

This is a fully functional MVP. The exercise data is curated locally — there is no
backend yet. Natural next steps: a backend/auth, video demonstrations per exercise,
push-notification reminders, and social/leaderboard features.
