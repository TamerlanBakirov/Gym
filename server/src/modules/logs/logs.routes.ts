import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { logsRepo } from './logs.repo.js';

export const logsRouter = Router();
logsRouter.use(requireAuth);

const createSchema = z.object({
  workoutId: z.string().nullish(),
  workoutTitle: z.string().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  durationMin: z.number().int().min(0).max(600),
  kcal: z.number().int().min(0).max(5000),
});

logsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ logs: await logsRepo.list(req.userId!) });
  })
);

logsRouter.post(
  '/',
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const log = await logsRepo.create(req.userId!, req.body);
    res.status(201).json({ log });
  })
);

logsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const ok = await logsRepo.remove(req.userId!, req.params.id);
    if (!ok) throw ApiError.notFound('Log not found');
    res.json({ ok: true });
  })
);
