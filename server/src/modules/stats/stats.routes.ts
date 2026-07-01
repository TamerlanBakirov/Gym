import { Router } from 'express';
import { asyncHandler } from '../../lib/http.js';
import { requireAuth } from '../../middleware/auth.js';
import { statsService } from './stats.service.js';

export const statsRouter = Router();
statsRouter.use(requireAuth);

statsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await statsService.forUser(req.userId!));
  })
);
