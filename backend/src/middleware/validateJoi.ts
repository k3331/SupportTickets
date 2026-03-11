/**
 * Joi validation middleware. Returns 400 with error message when validation fails.
 */

import { Request, Response, NextFunction } from 'express';
import type { Schema } from 'joi';

export function validateBody(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body ?? {};
    const { error } = schema.validate(body, { abortEarly: true, stripUnknown: true });
    if (error) {
      const message = error.details[0]?.message ?? error.message;
      res.status(400).json({ error: message });
      return;
    }
    next();
  };
}

export function validateQuery(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, { abortEarly: true, stripUnknown: true });
    if (error) {
      const message = error.details[0]?.message ?? error.message;
      res.status(400).json({ error: message });
      return;
    }
    (req as Request & { query: Record<string, unknown> }).query = value;
    next();
  };
}

export function validateParams(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params, { abortEarly: true });
    if (error) {
      const message = error.details[0]?.message ?? error.message;
      res.status(400).json({ error: message });
      return;
    }
    next();
  };
}
