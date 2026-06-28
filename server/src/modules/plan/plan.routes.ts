import { Router } from 'express';
import { asyncHandler, ApiError } from '../../lib/http.js';
import { requireAuth } from '../../middleware/auth.js';
import { profilesRepo } from '../users/users.repo.js';
import { planService } from './plan.service.js';

export const planRouter = Router();
planRouter.use(requireAuth);

planRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const profile = await profilesRepo.get(req.userId!);
    if (!profile) throw ApiError.notFound('Profile not found');

    const schedule = await planService.recommend(profile);
    res.json({
      title: `Your ${planService.goalLabel(profile.goal)} Plan`,
      goalLabel: planService.goalLabel(profile.goal),
      projectedWeeks: planService.projectedWeeks(profile),
      estimatedDailyKcal: planService.estimatedDailyKcal(profile),
      daysPerWeek: profile.daysPerWeek,
      schedule,
    });
  })
);
