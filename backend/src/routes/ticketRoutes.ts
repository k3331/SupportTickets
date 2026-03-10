/**
 * Ticket API routes.
 */

import { Router } from 'express';
import * as ticketController from '../controllers/ticketController.js';
import {
  createTicketValidation,
  patchTicketValidation,
  handleValidationErrors,
} from '../middleware/validation.js';

const router = Router();

router.post('/', createTicketValidation, handleValidationErrors, ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.patch('/:id', patchTicketValidation, handleValidationErrors, ticketController.patchTicket);

export default router;
