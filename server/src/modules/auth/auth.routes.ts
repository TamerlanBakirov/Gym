import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { authService } from './auth.service.js';
import { profilesRepo, usersRepo } from '../users/users.repo.js';

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
    const tokens = authService.refresh(req.body.refreshToken);
    res.json(tokens);
  })
);

authRouter.post(
  '/logout',
  validate({ body: refreshSchema.partial() }),
  asyncHandler(async (req, res) => {
    authService.logout(req.body.refreshToken ?? '');
    res.json({ ok: true });
  })
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = usersRepo.findById(req.userId!);
    if (!user) throw ApiError.unauthorized('Account no longer exists');
    res.json({ user, profile: profilesRepo.get(user.id) });
  })
);
