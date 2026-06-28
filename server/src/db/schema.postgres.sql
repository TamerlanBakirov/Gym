-- Forge schema (Postgres). Applied idempotently on startup.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id          TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gender           TEXT,
  goal             TEXT,
  level            TEXT,
  body_type        TEXT,
  target_areas     TEXT NOT NULL DEFAULT '[]',
  equipment        TEXT,
  days_per_week    INTEGER NOT NULL DEFAULT 3,
  age_range        TEXT,
  height_cm        DOUBLE PRECISION,
  weight_kg        DOUBLE PRECISION,
  target_weight_kg DOUBLE PRECISION,
  has_onboarded    INTEGER NOT NULL DEFAULT 0,
  reminders        INTEGER NOT NULL DEFAULT 1,
  units            TEXT NOT NULL DEFAULT 'metric',
  expo_push_token  TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  muscle       TEXT NOT NULL,
  duration_sec INTEGER,
  reps         INTEGER,
  sets         INTEGER NOT NULL,
  rest_sec     INTEGER NOT NULL,
  equipment    TEXT NOT NULL,
  cue          TEXT NOT NULL,
  emoji        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workouts (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  subtitle     TEXT NOT NULL,
  muscle       TEXT NOT NULL,
  level        TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  kcal         INTEGER NOT NULL,
  gradient     TEXT NOT NULL,
  emoji        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  workout_id  TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  PRIMARY KEY (workout_id, position)
);

CREATE TABLE IF NOT EXISTS workout_logs (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id    TEXT,
  workout_title TEXT NOT NULL,
  date          TEXT NOT NULL,
  duration_min  INTEGER NOT NULL,
  kcal          INTEGER NOT NULL,
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_logs_user_date ON workout_logs(user_id, date);

CREATE TABLE IF NOT EXISTS weight_entries (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date      TEXT NOT NULL,
  weight_kg DOUBLE PRECISION NOT NULL,
  UNIQUE (user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_weights_user_date ON weight_entries(user_id, date);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens(user_id);
