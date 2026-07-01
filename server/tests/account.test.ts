import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { makeClient, startTestServer, type TestContext } from './helpers.js';

let ctx: TestContext;

before(async () => {
  ctx = await startTestServer();
});
after(async () => {
  await ctx.close();
});

test('email verification: request → confirm flips emailVerified', async () => {
  const c = makeClient(ctx.base);
  const reg = await c.req('POST', '/api/auth/register', {
    email: 'verify@example.com',
    password: 'secret123',
    name: 'Ver',
  });
  c.setToken(reg.data!.accessToken as string);
  assert.equal((reg.data!.user as any).emailVerified, false);

  const request = await c.req('POST', '/api/auth/verify/request');
  assert.equal(request.status, 200);
  const code = (request.data as any).devCode as string;
  assert.match(code, /^\d{6}$/);

  const wrong = await c.req('POST', '/api/auth/verify/confirm', { code: '000000' });
  // 000000 is almost certainly not the code; expect rejection unless it happens to match.
  if (code !== '000000') assert.equal(wrong.status, 400);

  const confirm = await c.req('POST', '/api/auth/verify/confirm', { code });
  assert.equal(confirm.status, 200);

  const me = await c.req('GET', '/api/auth/me');
  assert.equal((me.data!.user as any).emailVerified, true);
});

test('password reset: forgot → reset → login with new password', async () => {
  const c = makeClient(ctx.base);
  await c.req('POST', '/api/auth/register', {
    email: 'reset@example.com',
    password: 'oldpassword',
    name: 'Reset',
  });

  const forgot = await c.req('POST', '/api/auth/password/forgot', {
    email: 'reset@example.com',
  });
  assert.equal(forgot.status, 200);
  const code = (forgot.data as any).devCode as string;
  assert.match(code, /^\d{6}$/);

  const reset = await c.req('POST', '/api/auth/password/reset', {
    email: 'reset@example.com',
    code,
    password: 'newpassword',
  });
  assert.equal(reset.status, 200);

  const oldLogin = await c.req('POST', '/api/auth/login', {
    email: 'reset@example.com',
    password: 'oldpassword',
  });
  assert.equal(oldLogin.status, 401);

  const newLogin = await c.req('POST', '/api/auth/login', {
    email: 'reset@example.com',
    password: 'newpassword',
  });
  assert.equal(newLogin.status, 200);
});

test('forgot password for unknown email still returns 200 without a code', async () => {
  const c = makeClient(ctx.base);
  const res = await c.req('POST', '/api/auth/password/forgot', {
    email: 'nobody@example.com',
  });
  assert.equal(res.status, 200);
  assert.equal((res.data as any).devCode, undefined);
});
