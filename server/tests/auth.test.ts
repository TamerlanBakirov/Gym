import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { makeClient, startTestServer, type TestContext } from './helpers.js';

let ctx: TestContext;
let client: ReturnType<typeof makeClient>;

before(async () => {
  ctx = await startTestServer();
  client = makeClient(ctx.base);
});

after(async () => {
  await ctx.close();
});

test('health check responds', async () => {
  const res = await fetch(`${ctx.base}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
});

test('register creates a user with tokens and an un-onboarded profile', async () => {
  const { status, data } = await client.req('POST', '/api/auth/register', {
    email: 'Ada@Example.com',
    password: 'secret123',
    name: 'Ada',
  });
  assert.equal(status, 201);
  assert.equal((data!.user as any).email, 'ada@example.com'); // normalized lower-case
  assert.ok(data!.accessToken);
  assert.ok(data!.refreshToken);
  assert.equal((data!.profile as any).hasOnboarded, false);
});

test('duplicate email is rejected with 409', async () => {
  const { status } = await client.req('POST', '/api/auth/register', {
    email: 'dupe@example.com',
    password: 'secret123',
    name: 'One',
  });
  assert.equal(status, 201);
  const again = await client.req('POST', '/api/auth/register', {
    email: 'dupe@example.com',
    password: 'secret123',
    name: 'Two',
  });
  assert.equal(again.status, 409);
});

test('validation errors return 400 with field details', async () => {
  const { status, data } = await client.req('POST', '/api/auth/register', {
    email: 'not-an-email',
    password: 'x',
  });
  assert.equal(status, 400);
  assert.ok((data!.details as any).email);
  assert.ok((data!.details as any).password);
});

test('login succeeds with correct credentials and fails otherwise', async () => {
  await client.req('POST', '/api/auth/register', {
    email: 'log@example.com',
    password: 'secret123',
    name: 'Log',
  });
  const ok = await client.req('POST', '/api/auth/login', {
    email: 'log@example.com',
    password: 'secret123',
  });
  assert.equal(ok.status, 200);
  assert.ok(ok.data!.accessToken);

  const bad = await client.req('POST', '/api/auth/login', {
    email: 'log@example.com',
    password: 'wrongpass',
  });
  assert.equal(bad.status, 401);
});

test('protected route requires a valid token', async () => {
  const noToken = await client.req('GET', '/api/auth/me');
  assert.equal(noToken.status, 401);

  const reg = await client.req('POST', '/api/auth/register', {
    email: 'me@example.com',
    password: 'secret123',
    name: 'Me',
  });
  client.setToken((reg.data!.accessToken as string) ?? null);
  const me = await client.req('GET', '/api/auth/me');
  assert.equal(me.status, 200);
  assert.equal((me.data!.user as any).email, 'me@example.com');
  client.setToken(null);
});

test('refresh rotates tokens and revokes the old refresh token', async () => {
  const reg = await client.req('POST', '/api/auth/register', {
    email: 'refresh@example.com',
    password: 'secret123',
    name: 'Ref',
  });
  const oldRefresh = reg.data!.refreshToken as string;

  const rotated = await client.req('POST', '/api/auth/refresh', { refreshToken: oldRefresh });
  assert.equal(rotated.status, 200);
  assert.ok(rotated.data!.accessToken);
  assert.notEqual(rotated.data!.refreshToken, oldRefresh);

  // The old refresh token must no longer work.
  const reused = await client.req('POST', '/api/auth/refresh', { refreshToken: oldRefresh });
  assert.equal(reused.status, 401);
});
