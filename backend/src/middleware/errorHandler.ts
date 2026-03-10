/**
 * Centralized error-handling middleware.
 * All errors should be passed via next(err). Response shape: { error: string }.
 */

import { Request, Response, NextFunction } from 'express';

interface ErrWithStatus extends Error {
  statusCode?: number;
  status?: number;
}

export function errorHandler(
  err: ErrWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode ?? err.status ?? 500;
  const message = err.message ?? 'Internal server error';
  res.status(status).json({ error: message });
}
