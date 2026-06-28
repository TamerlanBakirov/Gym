import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { workoutsRepo } from './workouts.repo.js';

export const workoutsRouter = Router();

// Public catalog — no auth required to browse workouts.
workoutsRouter.get(
  '/',
  validate({ query: z.object({ muscle: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    const muscle = req.query.muscle as string | undefined;
    res.json({ workouts: workoutsRepo.list(muscle) });
  })
);

workoutsRouter.get(
  '/exercises',
  asyncHandler(async (_req, res) => {
    res.json({ exercises: workoutsRepo.listExercises() });
  })
);

workoutsRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const workout = workoutsRepo.bySlug(req.params.slug);
    if (!workout) throw ApiError.notFound('Workout not found');
    res.json({ workout });
  })
);
