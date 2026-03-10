/**
 * Shared types for tickets API (used by backend and frontend).
 */

export const PRIORITIES = ['Low', 'Medium', 'High'] as const;
export const STATUSES = ['NEW', 'INVESTIGATING', 'RESOLVED'] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketBody {
  subject: string;
  message: string;
  priority: Priority;
}

export interface UpdateTicketBody {
  status?: Status;
  subject?: string;
  message?: string;
  priority?: Priority;
}

export interface ApiError {
  error: string;
}
