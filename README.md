# Forge — Fitness & Workout App 🏋️

A professional, BetterMe-style fitness platform: a **React Native + Expo** mobile
app backed by a full **Node + Express + SQLite** REST API. Account sign-up,
personalized onboarding quiz, smart workout plans, live workout sessions with rest
timers, and progress tracking that syncs to the server.

This repo has two parts:

- **`/` (root)** — the Expo mobile app
- **[`/server`](server)** — the backend API ([server/README.md](server/README.md))

## Features

- **Accounts & auth** — register / log in with JWT (access + auto-refreshing refresh
  tokens). Sessions persist on-device; all user data is stored server-side.
- **Onboarding quiz** — an 8-step BetterMe-style flow (goal, level, body type, target
  areas, equipment, frequency, age) that builds a personalized plan, complete with an
  animated "building your plan" screen and a plan reveal. The resulting profile is saved
  to the backend.
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
| State | React Context (session + server data) |
| Networking | `fetch` API client with token storage + auto-refresh on 401 |
| UI | Custom design system, expo-linear-gradient, @expo/vector-icons, expo-haptics |
| Animation | react-native-reanimated |
| Backend | Node + Express + `node:sqlite` + JWT ([/server](server)) |

## Project structure

```
app/                         # expo-router routes
  _layout.tsx                # root: providers + stack
  index.tsx                  # entry gate (auth? onboarded? → tabs)
  auth/                      # login / register
  onboarding/                # welcome → quiz → building → plan
  (tabs)/                    # Today, Workouts, Progress, Profile
  workout/[id].tsx           # workout detail
  workout/session.tsx        # live session player
src/
  api/                       # API client, token store, typed endpoints
  config.ts                  # API base URL resolution
  theme/                     # colors, spacing, typography, gradients
  types/                     # domain types
  data/                      # exercises, workouts, quiz definition
  lib/                       # plan recommendation, date/format helpers
  store/                     # AppContext (session + server data)
  components/                # Screen, Button, WorkoutCard, ui primitives
server/                      # backend API (see server/README.md)
```

## Getting started

**1. Start the backend** (requires Node 22+):

```bash
cd server
npm install
npm run dev          # http://localhost:4000 (auto-seeds the catalog)
```

**2. Start the app** (in another terminal, from the repo root):

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with the
**Expo Go** app on your phone.

> **Connecting to the API:** the app reads the API URL from `extra.apiUrl` in
> `app.json` (default `http://localhost:4000`). On a **physical device**, `localhost`
> points at the phone — set your machine's LAN IP instead, e.g.
> `EXPO_PUBLIC_API_URL=http://192.168.1.20:4000 npx expo start`.

### Useful scripts

```bash
npm run ios          # open in iOS simulator
npm run android      # open in Android emulator
npm run typecheck    # TypeScript check (tsc --noEmit)
```

## Notes

A fully functional, end-to-end product: the app authenticates against the backend and
persists profile, workout logs, weight entries, and settings server-side. The workout
catalog is seeded into the database and mirrored locally for instant, offline browsing.

Natural next steps: video demonstrations per exercise, push-notification reminders,
social/leaderboard features, and a managed Postgres deployment.
