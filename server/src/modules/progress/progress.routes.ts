import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { weightsRepo } from './weights.repo.js';

export const progressRouter = Router();
progressRouter.use(requireAuth);

const weightSchema = z.object({
  weightKg: z.number().min(20).max(400),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

progressRouter.get(
  '/weight',
  asyncHandler(async (req, res) => {
    res.json({ entries: weightsRepo.list(req.userId!) });
  })
);

progressRouter.post(
  '/weight',
  validate({ body: weightSchema }),
  asyncHandler(async (req, res) => {
    const entry = weightsRepo.upsert(req.userId!, req.body.weightKg, req.body.date);
    res.status(201).json({ entry });
  })
);
