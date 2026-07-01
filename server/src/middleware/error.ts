import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../lib/http.js';
import { isProd } from '../env.js';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(isProd ? {} : { message: err instanceof Error ? err.message : String(err) }),
  });
}
