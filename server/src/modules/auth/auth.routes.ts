import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { isProd } from '../../env.js';
import { authService } from './auth.service.js';
import { profilesRepo, usersRepo } from '../users/users.repo.js';

// Include the code in responses only outside production (no email provider wired up).
const withDevCode = (code: string | null) => (isProd || !code ? {} : { devCode: code });

export const authRouter = Router();

// Throttle credential endpoints to slow down brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' },
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(60),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({ refreshToken: z.string().min(10) });

authRouter.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
    res.status(201).json(result);
  })
);

authRouter.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  })
);

authRouter.post(
  '/refresh',
  validate({ body: refreshSchema }),
  asyncHandler(async (req, res) => {
    const tokens = await authService.refresh(req.body.refreshToken);
    res.json(tokens);
  })
);

authRouter.post(
  '/logout',
  validate({ body: refreshSchema.partial() }),
  asyncHandler(async (req, res) => {
    await authService.logout(req.body.refreshToken ?? '');
    res.json({ ok: true });
  })
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await usersRepo.findById(req.userId!);
    if (!user) throw ApiError.unauthorized('Account no longer exists');
    res.json({ user, profile: await profilesRepo.get(user.id) });
  })
);

// --- Email verification ---
authRouter.post(
  '/verify/request',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await usersRepo.findById(req.userId!);
    if (!user) throw ApiError.unauthorized('Account no longer exists');
    if (user.emailVerified) return res.json({ ok: true, alreadyVerified: true });
    const code = await authService.requestEmailVerification(user.id, user.email);
    res.json({ ok: true, ...withDevCode(code) });
  })
);

authRouter.post(
  '/verify/confirm',
  requireAuth,
  validate({ body: z.object({ code: z.string().length(6) }) }),
  asyncHandler(async (req, res) => {
    await authService.confirmEmailVerification(req.userId!, req.body.code);
    res.json({ ok: true });
  })
);

// --- Password reset ---
authRouter.post(
  '/password/forgot',
  authLimiter,
  validate({ body: z.object({ email: z.string().email() }) }),
  asyncHandler(async (req, res) => {
    const code = await authService.requestPasswordReset(req.body.email);
    // Always 200 to avoid revealing whether the email is registered.
    res.json({ ok: true, ...withDevCode(code) });
  })
);

authRouter.post(
  '/password/reset',
  authLimiter,
  validate({
    body: z.object({
      email: z.string().email(),
      code: z.string().length(6),
      password: z.string().min(6).max(100),
    }),
  }),
  asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body.email, req.body.code, req.body.password);
    res.json({ ok: true });
  })
);
