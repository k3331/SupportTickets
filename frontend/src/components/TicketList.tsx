import React, { useState } from 'react';
import { updateTicketStatus } from '../api/tickets';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import type { Status, Ticket } from 'shared/types';

const STATUS_OPTIONS: Status[] = ['NEW', 'INVESTIGATING', 'RESOLVED'];
const NEXT_STATUS: Record<Status, Status | null> = { NEW: 'INVESTIGATING', INVESTIGATING: 'RESOLVED', RESOLVED: null };

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncate(str: string | undefined, max = 80) {
  if (!str) return '';
  return str.length <= max ? str : str.slice(0, max) + '…';
}

export interface TicketListProps {
  tickets: Ticket[] | undefined;
  loading: boolean;
  onUpdate?: () => void;
  onToast?: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export function TicketList({ tickets, loading, onUpdate, onToast }: TicketListProps) {
  const [patchingId, setPatchingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleStatusChange(id: string, newStatus: Status) {
    setError('');
    setPatchingId(id);
    try {
      await updateTicketStatus(id, newStatus);
      onUpdate?.();
      onToast?.('Status updated.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setError(msg);
      onToast?.(msg, 'error');
    } finally {
      setPatchingId(null);
    }
  }

  function handleAdvance(t: Ticket) {
    const next = NEXT_STATUS[t.status];
    if (next) handleStatusChange(t.id, next);
  }

  if (loading) {
    return (
      <div className="m-0">
        <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
          <div className="h-10 w-10 rounded-full border-[3px] border-border border-t-accent animate-spin" aria-hidden />
          <p className="m-0 text-text-muted text-[0.9375rem]">Loading tickets…</p>
        </div>
      </div>
    );
  }

  if (!tickets?.length) {
    return (
      <div className="m-0">
        <p className="m-0 py-8 text-text-muted text-[0.9375rem]">No tickets yet. Create your first support inquiry.</p>
      </div>
    );
  }

  return (
    <div className="m-0">
      {error && (
        <p className="m-0 mb-4 py-2 px-3 bg-red-500/15 rounded-lg text-danger text-sm">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left border-b border-border font-semibold text-text-muted uppercase tracking-wider text-xs">Subject</th>
              <th className="px-4 py-3 text-left border-b border-border font-semibold text-text-muted uppercase tracking-wider text-xs">Message</th>
              <th className="px-4 py-3 text-left border-b border-border font-semibold text-text-muted uppercase tracking-wider text-xs">Priority</th>
              <th className="px-4 py-3 text-left border-b border-border font-semibold text-text-muted uppercase tracking-wider text-xs">Status</th>
              <th className="px-4 py-3 text-left border-b border-border font-semibold text-text-muted uppercase tracking-wider text-xs">Created</th>
              <th className="px-4 py-3 text-center border-b border-border font-semibold text-text-muted uppercase tracking-wider text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => {
              const nextStatus = NEXT_STATUS[t.status];
              const isBusy = patchingId === t.id;
              return (
                <tr key={t.id} className="hover:bg-surface-hover">
                  <td className="px-4 py-3 max-w-[220px] truncate font-medium">{truncate(t.subject, 50)}</td>
                  <td className="px-4 py-3 max-w-[280px] truncate text-text-muted text-[0.8125rem]" title={t.message}>{truncate(t.message, 80)}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {nextStatus ? (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 p-0 bg-surface-hover border border-border rounded-lg text-text cursor-pointer transition-colors hover:bg-accent hover:border-accent hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => handleAdvance(t)}
                          disabled={isBusy}
                          title={`Mark as ${nextStatus}`}
                          aria-label={`Mark as ${nextStatus}`}
                        >
                          {nextStatus === 'INVESTIGATING' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </button>
                      ) : (
                        <span className="text-text-muted text-sm min-w-8">—</span>
                      )}
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value as Status)}
                        disabled={isBusy}
                        className="py-1.5 px-2.5 bg-bg border border-border rounded-md text-text font-[inherit] text-[0.8125rem] cursor-pointer focus:outline-none focus:border-accent"
                        aria-label="Change status"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
