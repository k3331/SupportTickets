import type { CreateTicketBody, Ticket, UpdateTicketBody } from 'shared/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/tickets`
  : '/api/tickets';

export interface GetTicketsParams {
  search?: string;
  status?: string;
  priority?: string;
}

export async function createTicket(data: CreateTicketBody): Promise<Ticket> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<Ticket>;
}

export async function getTickets(params?: GetTicketsParams): Promise<Ticket[]> {
  const url = new URL(API_BASE);
  if (params?.search?.trim()) url.searchParams.set('search', params.search.trim());
  if (params?.status) url.searchParams.set('status', params.status);
  if (params?.priority) url.searchParams.set('priority', params.priority);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch tickets');
  const data = await res.json();
  return Array.isArray(data) ? data : (data as { tickets: Ticket[] }).tickets;
}

export async function updateTicketStatus(id: string, status: UpdateTicketBody['status']): Promise<Ticket> {
  return updateTicket(id, { status });
}

export async function updateTicket(id: string, data: UpdateTicketBody): Promise<Ticket> {
  const body: Record<string, unknown> = {};
  if (data.status !== undefined) body.status = data.status;
  if (data.subject !== undefined) body.subject = data.subject;
  if (data.message !== undefined) body.message = data.message;
  if (data.priority !== undefined) body.priority = data.priority;
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<Ticket>;
}
