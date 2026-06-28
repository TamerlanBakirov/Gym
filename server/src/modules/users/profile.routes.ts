import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { profilesRepo } from './users.repo.js';

export const profileRouter = Router();
profileRouter.use(requireAuth);

const profileSchema = z.object({
  gender: z.enum(['male', 'female', 'other']).optional(),
  goal: z.enum(['lose_weight', 'build_muscle', 'get_shredded', 'stay_fit']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  bodyType: z.enum(['lean', 'average', 'heavy']).optional(),
  targetAreas: z.array(z.string()).optional(),
  equipment: z.enum(['none', 'minimal', 'full_gym']).optional(),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
  ageRange: z.string().optional(),
  heightCm: z.number().min(80).max(260).optional(),
  weightKg: z.number().min(20).max(400).optional(),
  targetWeightKg: z.number().min(20).max(400).optional(),
  hasOnboarded: z.boolean().optional(),
  reminders: z.boolean().optional(),
  units: z.enum(['metric', 'imperial']).optional(),
});

profileRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ profile: profilesRepo.get(req.userId!) });
  })
);

// Full/partial profile update — also used to complete onboarding (hasOnboarded: true).
profileRouter.put(
  '/',
  validate({ body: profileSchema }),
  asyncHandler(async (req, res) => {
    const profile = profilesRepo.update(req.userId!, req.body);
    res.json({ profile });
  })
);

profileRouter.patch(
  '/settings',
  validate({
    body: z.object({
      reminders: z.boolean().optional(),
      units: z.enum(['metric', 'imperial']).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const profile = profilesRepo.update(req.userId!, req.body);
    res.json({ profile });
  })
);
