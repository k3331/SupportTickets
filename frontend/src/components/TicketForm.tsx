import React, { useState } from 'react';
import { createTicket } from '../api/tickets';
import type { Priority } from 'shared/types';

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export interface TicketFormProps {
  onCreated?: () => void;
  onToast?: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export function TicketForm({ onCreated, onToast }: TicketFormProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<Priority>('Low');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      onToast?.('Please fill in subject and message.', 'warning');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createTicket({ subject, message, priority });
      setSubject('');
      setMessage('');
      setPriority('Low');
      onCreated?.();
      onToast?.('Ticket created.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create ticket';
      setError(msg);
      onToast?.(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="m-0">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <p className="m-0 py-2 px-3 bg-red-500/15 rounded-lg text-danger text-sm">
            {error}
          </p>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-medium text-text-muted">
          Subject
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Short summary"
            required
            maxLength={200}
            className="py-2.5 px-3 bg-bg border border-border rounded-lg text-text font-[inherit] text-[0.9375rem] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-text-muted">
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue in detail"
            required
            rows={4}
            className="py-2.5 px-3 bg-bg border border-border rounded-lg text-text font-[inherit] text-[0.9375rem] min-h-[100px] resize-y focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-text-muted">
          Priority
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="py-2.5 px-3 bg-bg border border-border rounded-lg text-text font-[inherit] text-[0.9375rem] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="self-start min-h-touch sm:min-h-0 py-3 px-5 sm:py-2.5 bg-accent text-white border-0 rounded-lg font-[inherit] text-[0.9375rem] font-semibold cursor-pointer transition-colors hover:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Submitting…' : 'Submit Ticket'}
        </button>
      </form>
    </section>
  );
}
