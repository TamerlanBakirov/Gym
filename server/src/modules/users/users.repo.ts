import { db } from '../../db/database.js';
import { uid } from '../../lib/crypto.js';
import type { Profile, User } from '../../types.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const now = () => new Date().toISOString();

const toUser = (r: UserRow): User => ({
  id: r.id,
  email: r.email,
  name: r.name,
  createdAt: r.created_at,
});

export const usersRepo = {
  create(email: string, passwordHash: string, name: string): User {
    const id = uid();
    const ts = now();
    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, email, passwordHash, name, ts, ts);
    // Create an empty profile alongside the user.
    db.prepare(
      `INSERT INTO profiles (user_id, created_at, updated_at) VALUES (?, ?, ?)`
    ).run(id, ts, ts);
    return { id, email, name, createdAt: ts };
  },

  findByEmail(email: string): (UserRow & { user: User }) | null {
    const row = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as
      | UserRow
      | undefined;
    return row ? { ...row, user: toUser(row) } : null;
  },

  findById(id: string): User | null {
    const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
    return row ? toUser(row) : null;
  },
};

interface ProfileRow {
  user_id: string;
  gender: string | null;
  goal: string | null;
  level: string | null;
  body_type: string | null;
  target_areas: string;
  equipment: string | null;
  days_per_week: number;
  age_range: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  target_weight_kg: number | null;
  has_onboarded: number;
  reminders: number;
  units: string;
}

const toProfile = (r: ProfileRow): Profile => ({
  gender: r.gender,
  goal: r.goal,
  level: r.level,
  bodyType: r.body_type,
  targetAreas: safeParseArray(r.target_areas),
  equipment: r.equipment,
  daysPerWeek: r.days_per_week,
  ageRange: r.age_range,
  heightCm: r.height_cm,
  weightKg: r.weight_kg,
  targetWeightKg: r.target_weight_kg,
  hasOnboarded: !!r.has_onboarded,
  reminders: !!r.reminders,
  units: (r.units as Profile['units']) ?? 'metric',
});

function safeParseArray(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export interface ProfileInput {
  gender?: string;
  goal?: string;
  level?: string;
  bodyType?: string;
  targetAreas?: string[];
  equipment?: string;
  daysPerWeek?: number;
  ageRange?: string;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  hasOnboarded?: boolean;
  reminders?: boolean;
  units?: 'metric' | 'imperial';
}

export const profilesRepo = {
  get(userId: string): Profile | null {
    const row = db.prepare(`SELECT * FROM profiles WHERE user_id = ?`).get(userId) as
      | ProfileRow
      | undefined;
    return row ? toProfile(row) : null;
  },

  /** Partial update of any profile fields. Returns the updated profile. */
  update(userId: string, input: ProfileInput): Profile {
    const map: Record<string, unknown> = {
      gender: input.gender,
      goal: input.goal,
      level: input.level,
      body_type: input.bodyType,
      target_areas: input.targetAreas ? JSON.stringify(input.targetAreas) : undefined,
      equipment: input.equipment,
      days_per_week: input.daysPerWeek,
      age_range: input.ageRange,
      height_cm: input.heightCm,
      weight_kg: input.weightKg,
      target_weight_kg: input.targetWeightKg,
      has_onboarded:
        input.hasOnboarded === undefined ? undefined : input.hasOnboarded ? 1 : 0,
      reminders: input.reminders === undefined ? undefined : input.reminders ? 1 : 0,
      units: input.units,
    };

    const cols = Object.entries(map).filter(([, v]) => v !== undefined);
    if (cols.length > 0) {
      const setClause = cols.map(([k]) => `${k} = ?`).join(', ');
      const values = cols.map(([, v]) => v as string | number);
      db.prepare(
        `UPDATE profiles SET ${setClause}, updated_at = ? WHERE user_id = ?`
      ).run(...values, new Date().toISOString(), userId);
    }
    return this.get(userId)!;
  },
};
