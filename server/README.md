# Forge API — Backend

A complete REST backend for the Forge fitness app: authentication, profiles,
onboarding, a workout catalog, plan generation, workout logs, weight tracking,
and aggregated stats.

## Stack

- **Node.js + Express** (TypeScript, ESM)
- **`node:sqlite`** — the built-in SQLite of Node 22 (zero native deps, no binary
  downloads; swap to Postgres later by replacing the repository layer)
- **JWT auth** — short-lived access tokens + rotating refresh tokens (hashed at rest)
- **bcryptjs** password hashing, **Zod** request validation, **helmet**, **CORS**,
  **rate limiting** on auth endpoints

> Requires **Node 22+** (for `node:sqlite`). The scripts pass `--experimental-sqlite`.

## Quick start

```bash
cd server
cp .env.example .env        # optional — sensible defaults are built in
npm install
npm run dev                 # http://localhost:4000 (auto-seeds the catalog)
```

Other scripts:

```bash
npm run seed        # (re)seed the exercise + workout catalog
npm run typecheck   # tsc --noEmit
npm run build       # compile to dist/
npm start           # run the compiled server
```

## Data model

`users` → `profiles` (1:1), `exercises`, `workouts`, `workout_exercises` (join),
`workout_logs`, `weight_entries`, `refresh_tokens`. Schema lives in
[`src/db/schema.sql`](src/db/schema.sql) and is applied idempotently on boot.

## API

Base URL: `http://localhost:4000/api`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | – | Create account → user + tokens |
| POST | `/auth/login` | – | Log in → user + tokens |
| POST | `/auth/refresh` | – | Rotate tokens via refresh token |
| POST | `/auth/logout` | – | Revoke a refresh token |
| GET | `/auth/me` | ✓ | Current user + profile |
| GET | `/profile` | ✓ | Get profile |
| PUT | `/profile` | ✓ | Update profile / complete onboarding |
| PATCH | `/profile/settings` | ✓ | Update reminders / units |
| GET | `/workouts` | – | List workouts (`?muscle=` filter) |
| GET | `/workouts/exercises` | – | List all exercises |
| GET | `/workouts/:slug` | – | One workout with its exercises |
| GET | `/plan` | ✓ | Personalized weekly plan |
| GET | `/logs` | ✓ | List workout logs |
| POST | `/logs` | ✓ | Log a completed workout |
| DELETE | `/logs/:id` | ✓ | Delete a log |
| GET | `/progress/weight` | ✓ | List weight entries |
| POST | `/progress/weight` | ✓ | Upsert today's weight |
| GET | `/stats` | ✓ | Totals, streak, weekly activity |

Authenticated requests send `Authorization: Bearer <accessToken>`. On a `401`
the client should call `/auth/refresh` with the stored refresh token.

### Example

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"secret123","name":"You"}'
```

## Project structure

```
src/
  index.ts            # bootstrap: migrate + seed + listen
  app.ts              # express app (helmet, cors, routes, error handling)
  env.ts              # env validation (zod)
  routes.ts           # mounts all module routers under /api
  db/                 # database.ts, schema.sql, seed.ts
  lib/                # crypto, jwt, http helpers
  middleware/         # auth, validate, error
  modules/
    auth/             # register/login/refresh/logout + tokens repo
    users/            # users + profiles repo, profile routes
    workouts/         # catalog repo + routes
    logs/             # workout logs repo + routes
    progress/         # weight repo + routes
    plan/             # plan recommendation service + route
    stats/            # aggregated stats service + route
```

## Switching to Postgres

The data access is isolated in `src/modules/**/**.repo.ts`. Swap `node:sqlite`
for a Postgres client (e.g. `pg`) in `src/db/database.ts` and adjust the repos —
the routes, services, and validation stay the same.
