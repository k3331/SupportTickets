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

export async function getTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query as { search?: string; status?: string; priority?: string; page?: string; limit?: string };
    const parsed = {
      search: query.search,
      status: query.status,
      priority: query.priority,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    };
    const result = await ticketService.listTickets(parsed);
    if (Array.isArray(result)) {
      res.json(result);
    } else {
      res.json(result);
    }
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
