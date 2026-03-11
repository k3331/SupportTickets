/**
 * Ticket API routes. Validation via Joi (createTicketSchema, patchTicketSchema).
 */

import { Router } from 'express';
import * as ticketController from '../controllers/ticketController.js';
import { validateBody, validateParams } from '../middleware/validateJoi.js';
import {
  createTicketSchema,
  patchTicketSchema,
  ticketIdParamSchema,
} from '../schemas/ticketSchemas.js';

const router = Router();

router.post('/', validateBody(createTicketSchema), ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.patch('/:id', validateParams(ticketIdParamSchema), validateBody(patchTicketSchema), ticketController.patchTicket);

export default router;
