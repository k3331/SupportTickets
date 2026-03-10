/**
 * HTTP request handlers for ticket endpoints. Pass errors to next() for centralized handling.
 */

import { Request, Response, NextFunction } from 'express';
import * as ticketService from '../services/ticketService.js';
import { AppError } from '../errors/AppError.js';

export async function createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
}

export async function getTickets(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tickets = await ticketService.listTickets();
    res.json(tickets);
  } catch (err) {
    next(err);
  }
}

export async function patchTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, subject, message, priority } = req.body || {};
    const ticket = await ticketService.updateTicket(id, { status, subject, message, priority });
    if (!ticket) {
      const err = new AppError('Ticket not found', 404);
      return next(err);
    }
    res.json(ticket);
  } catch (err) {
    next(err);
  }
}
