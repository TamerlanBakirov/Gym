import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { makeClient, startTestServer, type TestContext } from './helpers.js';

let ctx: TestContext;
let client: ReturnType<typeof makeClient>;

before(async () => {
  ctx = await startTestServer();
  client = makeClient(ctx.base);
  const reg = await client.req('POST', '/api/auth/register', {
    email: 'flow@example.com',
    password: 'secret123',
    name: 'Flow',
  });
  client.setToken(reg.data!.accessToken as string);
});

after(async () => {
  await ctx.close();
});

test('workout catalog is seeded and includes exercises', async () => {
  const { status, data } = await client.req('GET', '/api/workouts');
  assert.equal(status, 200);
  const workouts = data!.workouts as any[];
  assert.ok(workouts.length >= 6);
  assert.ok(workouts[0].exercises.length > 0);
});

test('workouts can be filtered by muscle group', async () => {
  const { data } = await client.req('GET', '/api/workouts?muscle=core');
  const workouts = data!.workouts as any[];
  assert.ok(workouts.length >= 1);
  assert.ok(workouts.every((w) => w.muscle === 'core'));
});

test('profile update completes onboarding and persists fields', async () => {
  const { status, data } = await client.req('PUT', '/api/profile', {
    goal: 'build_muscle',
    level: 'intermediate',
    targetAreas: ['chest', 'arms'],
    daysPerWeek: 4,
    weightKg: 80,
    targetWeightKg: 85,
    hasOnboarded: true,
  });
  assert.equal(status, 200);
  const p = data!.profile as any;
  assert.equal(p.goal, 'build_muscle');
  assert.equal(p.daysPerWeek, 4);
  assert.deepEqual(p.targetAreas, ['chest', 'arms']);
  assert.equal(p.hasOnboarded, true);
});

test('plan reflects the profile', async () => {
  const { status, data } = await client.req('GET', '/api/plan');
  assert.equal(status, 200);
  assert.match(data!.title as string, /Build Muscle/);
  assert.equal((data!.schedule as any[]).length, 4); // daysPerWeek
  assert.ok((data!.estimatedDailyKcal as number) > 0);
});

test('logging a workout appears in the list and stats', async () => {
  const create = await client.req('POST', '/api/logs', {
    workoutTitle: 'Upper Power',
    durationMin: 28,
    kcal: 280,
  });
  assert.equal(create.status, 201);

  const list = await client.req('GET', '/api/logs');
  assert.equal((list.data!.logs as any[]).length, 1);

  const stats = await client.req('GET', '/api/stats');
  assert.equal((stats.data!.totals as any).count, 1);
  assert.equal((stats.data!.totals as any).kcal, 280);
  assert.equal(stats.data!.streak, 1);
});

test('weight entries upsert per day (idempotent)', async () => {
  await client.req('POST', '/api/progress/weight', { weightKg: 79.5 });
  await client.req('POST', '/api/progress/weight', { weightKg: 79.1 });
  const { data } = await client.req('GET', '/api/progress/weight');
  const entries = data!.entries as any[];
  assert.equal(entries.length, 1); // same day → single entry
  assert.equal(entries[0].weightKg, 79.1); // latest value wins
});

test('push token can be registered and cleared', async () => {
  const set = await client.req('POST', '/api/profile/push-token', {
    expoPushToken: 'ExponentPushToken[abc123]',
  });
  assert.equal(set.status, 200);
  assert.equal((set.data!.profile as any).expoPushToken, 'ExponentPushToken[abc123]');

  const clear = await client.req('POST', '/api/profile/push-token', { expoPushToken: null });
  assert.equal((clear.data!.profile as any).expoPushToken, null);
});

test('users cannot see another user\'s logs', async () => {
  const other = makeClient(ctx.base);
  const reg = await other.req('POST', '/api/auth/register', {
    email: 'other@example.com',
    password: 'secret123',
    name: 'Other',
  });
  other.setToken(reg.data!.accessToken as string);
  const list = await other.req('GET', '/api/logs');
  assert.equal((list.data!.logs as any[]).length, 0); // isolated from Flow's logs
});
