import React, { useState } from 'react';
import { updateTicket } from '../api/tickets';
import type { Priority, Ticket } from 'shared/types';

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export interface EditTicketModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  onToast?: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export function EditTicketModal({ ticket, isOpen, onClose, onUpdated, onToast }: EditTicketModalProps) {
  const [subject, setSubject] = useState(ticket?.subject ?? '');
  const [message, setMessage] = useState(ticket?.message ?? '');
  const [priority, setPriority] = useState<Priority>(ticket?.priority ?? 'Medium');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (ticket) {
      setSubject(ticket.subject ?? '');
      setMessage(ticket.message ?? '');
      setPriority(ticket.priority ?? 'Medium');
      setError('');
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      onToast?.('Please fill in subject and message.', 'warning');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await updateTicket(ticket.id, { subject: subject.trim(), message: message.trim(), priority });
      onUpdated?.();
      onClose?.();
      onToast?.('Ticket updated.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update ticket';
      setError(msg);
      onToast?.(msg, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div
        className="max-w-[480px] w-full max-h-[calc(100vh-2rem)] max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)] rounded-xl overflow-hidden flex flex-col bg-surface border border-border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 px-5 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-2 border-b border-border relative">
          <h2 id="edit-modal-title" className="m-0 mb-1 text-lg font-semibold text-text">
            Edit task
          </h2>
          <p className="m-0 text-[0.8125rem] text-text-muted">Required fields are marked with an asterisk *</p>
          <button
            type="button"
            className="absolute top-3 right-3 w-11 h-11 min-w-[44px] min-h-[44px] sm:top-4 sm:right-4 sm:w-8 sm:h-8 sm:min-w-0 sm:min-h-0 flex items-center justify-center bg-transparent border-0 rounded-lg sm:rounded-md text-text-muted cursor-pointer transition-colors hover:bg-surface-hover hover:text-text"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form className="flex flex-col gap-4 p-4 overflow-y-auto sm:p-5" onSubmit={handleSubmit}>
          {error && (
            <p className="m-0 py-2 px-3 bg-red-500/15 rounded-lg text-danger text-sm">
              {error}
            </p>
          )}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-text-muted">
            Subject *
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
            Message *
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
            Priority *
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
          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              className="min-h-touch sm:min-h-0 py-3 px-5 sm:py-2.5 bg-surface-hover text-text border border-border rounded-lg font-[inherit] text-[0.9375rem] font-medium cursor-pointer transition-colors hover:bg-border"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-touch sm:min-h-0 py-3 px-5 sm:py-2.5 bg-accent text-white border-0 rounded-lg font-[inherit] text-[0.9375rem] font-semibold cursor-pointer transition-colors hover:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
