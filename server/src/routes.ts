import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { profileRouter } from './modules/users/profile.routes.js';
import { workoutsRouter } from './modules/workouts/workouts.routes.js';
import { logsRouter } from './modules/logs/logs.routes.js';
import { progressRouter } from './modules/progress/progress.routes.js';
import { planRouter } from './modules/plan/plan.routes.js';
import { statsRouter } from './modules/stats/stats.routes.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({
    name: 'Forge API',
    version: '1.0.0',
    endpoints: [
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      'POST   /api/auth/refresh',
      'POST   /api/auth/logout',
      'GET    /api/auth/me',
      'POST   /api/auth/verify/request',
      'POST   /api/auth/verify/confirm',
      'POST   /api/auth/password/forgot',
      'POST   /api/auth/password/reset',
      'GET    /api/profile',
      'PUT    /api/profile',
      'PATCH  /api/profile/settings',
      'POST   /api/profile/push-token',
      'GET    /api/workouts',
      'GET    /api/workouts/exercises',
      'GET    /api/workouts/:slug',
      'GET    /api/plan',
      'GET    /api/logs',
      'POST   /api/logs',
      'DELETE /api/logs/:id',
      'GET    /api/progress/weight',
      'POST   /api/progress/weight',
      'GET    /api/stats',
    ],
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/workouts', workoutsRouter);
apiRouter.use('/logs', logsRouter);
apiRouter.use('/progress', progressRouter);
apiRouter.use('/plan', planRouter);
apiRouter.use('/stats', statsRouter);
