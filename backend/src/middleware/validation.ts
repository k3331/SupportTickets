/**
 * Request validation using express-validator.
 */

import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { VALID_PRIORITIES, VALID_STATUSES } from '../config/constants.js';

export const createTicketValidation = [
  body('subject').trim().notEmpty().withMessage('subject is required and must be a non-empty string'),
  body('message').trim().notEmpty().withMessage('message is required and must be a non-empty string'),
  body('priority')
    .isIn(VALID_PRIORITIES)
    .withMessage(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
];

export const patchTicketValidation = [
  param('id').isMongoId().withMessage('invalid ticket id'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('subject')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('subject must be a non-empty string'),
  body('message')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('message must be a non-empty string'),
  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
  body().custom((_value, { req }) => {
    const { status, subject, message, priority } = req.body || {};
    const hasAny = status !== undefined || subject !== undefined || message !== undefined || priority !== undefined;
    if (!hasAny) {
      throw new Error('at least one of status, subject, message, priority is required');
    }
    return true;
  }),
];

export function handleValidationErrors(req: Request, _res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const err = new Error(result.array().map((a) => a.msg).join('; ')) as Error & { statusCode?: number };
    err.statusCode = 400;
    return next(err);
  }
  next();
}
