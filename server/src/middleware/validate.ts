import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import { ApiError } from '../lib/http.js';

type Schemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

/** Validate and coerce request parts against zod schemas. Replaces req parts with parsed data. */
export const validate =
  (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
      if (schemas.params) Object.assign(req.params, schemas.params.parse(req.params));
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(ApiError.badRequest('Validation failed', err.flatten().fieldErrors));
      } else {
        next(err);
      }
    }
  };
