/**
 * Joi validation schemas for ticket API (production-ready input validation).
 */

import Joi from 'joi';

const validPriorities = ['Low', 'Medium', 'High'];
const validStatuses = ['NEW', 'INVESTIGATING', 'RESOLVED'];

export const createTicketSchema = Joi.object({
  subject: Joi.string().min(5).required().messages({
    'string.min': 'subject must be at least 5 characters',
    'any.required': 'subject is required',
  }),
  message: Joi.string().min(10).required().messages({
    'string.min': 'message must be at least 10 characters',
    'any.required': 'message is required',
  }),
  priority: Joi.string()
    .valid(...validPriorities)
    .required()
    .messages({
      'any.only': `priority must be one of: ${validPriorities.join(', ')}`,
      'any.required': 'priority is required',
    }),
});

export const patchTicketSchema = Joi.object({
  status: Joi.string()
    .valid(...validStatuses)
    .optional(),
  subject: Joi.string().min(1).trim().optional(),
  message: Joi.string().min(1).trim().optional(),
  priority: Joi.string()
    .valid(...validPriorities)
    .optional(),
})
  .min(1)
  .messages({
    'object.min': 'at least one of status, subject, message, priority is required',
  });

export const listTicketsQuerySchema = Joi.object({
  search: Joi.string().trim().allow('').optional(),
  status: Joi.string()
    .valid(...validStatuses)
    .optional()
    .allow(''),
  priority: Joi.string()
    .valid(...validPriorities)
    .optional()
    .allow(''),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(50),
});

const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
export const ticketIdParamSchema = Joi.object({
  id: Joi.string().pattern(mongoIdPattern).required().messages({
    'string.pattern.base': 'invalid ticket id',
  }),
});
