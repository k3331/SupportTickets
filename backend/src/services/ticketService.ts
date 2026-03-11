/**
 * Ticket business logic and validation.
 */

import type { CreateTicketBody, Ticket as ITicket, UpdateTicketBody } from '../../shared/types.js';
import * as ticketRepository from '../models/Ticket.js';
import { VALID_PRIORITIES, VALID_STATUSES } from '../config/constants.js';
import { AppError } from '../errors/AppError.js';

export async function createTicket(data: CreateTicketBody | undefined) {
  const { subject, message, priority } = data ?? {};
  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    throw new AppError('subject is required and must be a non-empty string', 400);
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new AppError('message is required and must be a non-empty string', 400);
  }
  if (!VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])) {
    throw new AppError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`, 400);
  }
  return ticketRepository.createTicket({
    subject: subject.trim(),
    message: message.trim(),
    priority: priority as (typeof VALID_PRIORITIES)[number],
  });
}

export async function listTickets(query?: { search?: string; status?: string; priority?: string; page?: number; limit?: number }): Promise<ITicket[] | { tickets: ITicket[]; total: number }> {
  const hasQuery = query && (query.search !== undefined || query.status !== undefined || query.priority !== undefined || query.page !== undefined || query.limit !== undefined);
  if (hasQuery && query) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 50));
    return ticketRepository.listTicketsFiltered({
      search: query.search,
      status: query.status,
      priority: query.priority,
      page,
      limit,
    });
  }
  return ticketRepository.getAllTickets();
}

export async function updateTicketStatus(id: string, status: string) {
  if (!id || typeof id !== 'string') {
    throw new AppError('ticket id is required', 400);
  }
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
  }
  return ticketRepository.updateTicket(id, { status: status as (typeof VALID_STATUSES)[number] });
}

export async function updateTicket(id: string, data: UpdateTicketBody) {
  if (!id || typeof id !== 'string') {
    throw new AppError('ticket id is required', 400);
  }
  const updates: UpdateTicketBody = {};
  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status)) {
      throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }
    updates.status = data.status;
  }
  if (data.subject !== undefined) {
    if (typeof data.subject !== 'string' || !data.subject.trim()) {
      throw new AppError('subject must be a non-empty string', 400);
    }
    updates.subject = data.subject.trim();
  }
  if (data.message !== undefined) {
    if (typeof data.message !== 'string' || !data.message.trim()) {
      throw new AppError('message must be a non-empty string', 400);
    }
    updates.message = data.message.trim();
  }
  if (data.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(data.priority)) {
      throw new AppError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`, 400);
    }
    updates.priority = data.priority;
  }
  if (Object.keys(updates).length === 0) {
    throw new AppError('at least one of status, subject, message, priority is required', 400);
  }
  return ticketRepository.updateTicket(id, updates);
}
