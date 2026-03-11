/**
 * Ticket Mongoose model (MongoDB).
 */

import mongoose from 'mongoose';
import type { Priority, Ticket as ITicket } from '../../shared/types.js';
import { PRIORITIES, STATUSES } from '../../shared/types.js';

interface TicketDoc {
  _id: mongoose.Types.ObjectId;
  __v?: number;
  subject: string;
  message: string;
  priority: Priority;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: { type: String, required: true, enum: PRIORITIES },
    status: { type: String, required: true, enum: STATUSES, default: 'NEW' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as mongoose.Types.ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ticketSchema.index({ createdAt: -1 });

export const Ticket = mongoose.model('Ticket', ticketSchema);

export async function createTicket(data: { subject: string; message: string; priority: Priority }): Promise<ITicket> {
  const doc = await Ticket.create(data);
  return doc.toJSON() as unknown as ITicket;
}

export async function getAllTickets(): Promise<ITicket[]> {
  const docs = await Ticket.find().sort({ createdAt: -1 }).lean();
  return (docs as unknown as TicketDoc[]).map(({ _id, __v, ...rest }) => ({
    ...rest,
    id: _id.toString(),
    createdAt: rest.createdAt.toISOString(),
    updatedAt: rest.updatedAt.toISOString(),
  })) as ITicket[];
}

export interface ListTicketsFilter {
  search?: string;
  status?: string;
  priority?: string;
  page: number;
  limit: number;
}

export async function listTicketsFiltered(filter: ListTicketsFilter): Promise<{ tickets: ITicket[]; total: number }> {
  const query: Record<string, unknown> = {};
  if (filter.status) query.status = filter.status;
  if (filter.priority) query.priority = filter.priority;
  if (filter.search && filter.search.trim()) {
    const term = filter.search.trim();
    query.$or = [
      { subject: new RegExp(term, 'i') },
      { message: new RegExp(term, 'i') },
    ];
  }
  const skip = (filter.page - 1) * filter.limit;
  const [docs, total] = await Promise.all([
    Ticket.find(query).sort({ createdAt: -1 }).skip(skip).limit(filter.limit).lean(),
    Ticket.countDocuments(query),
  ]);
  const tickets = (docs as unknown as TicketDoc[]).map(({ _id, __v, ...rest }) => ({
    ...rest,
    id: _id.toString(),
    createdAt: rest.createdAt.toISOString(),
    updatedAt: rest.updatedAt.toISOString(),
  })) as ITicket[];
  return { tickets, total };
}

export async function getTicketById(id: string): Promise<ITicket | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await Ticket.findById(id).lean();
  if (!doc) return null;
  const { _id, __v, ...rest } = doc as unknown as TicketDoc;
  return {
    ...rest,
    id: _id.toString(),
    createdAt: rest.createdAt.toISOString(),
    updatedAt: rest.updatedAt.toISOString(),
  } as ITicket;
}

export async function updateTicket(
  id: string,
  updates: Partial<Pick<ITicket, 'status' | 'subject' | 'message' | 'priority'>>
): Promise<ITicket | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await Ticket.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).lean();
  if (!doc) return null;
  const { _id, __v, ...rest } = doc as unknown as TicketDoc;
  return {
    ...rest,
    id: _id.toString(),
    createdAt: rest.createdAt.toISOString(),
    updatedAt: rest.updatedAt.toISOString(),
  } as ITicket;
}
