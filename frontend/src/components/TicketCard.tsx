import React, { useState } from 'react';
import { updateTicketStatus } from '../api/tickets';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { EditTicketModal } from './EditTicketModal';
import type { Status, Ticket } from 'shared/types';

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'NEW', label: 'To Do' },
  { value: 'INVESTIGATING', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Done' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncate(str: string | undefined, max = 100) {
  if (!str) return '';
  return str.length <= max ? str : str.slice(0, max) + '…';
}

export interface TicketCardProps {
  ticket: Ticket;
  onUpdate?: () => void;
  onToast?: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export function TicketCard({ ticket, onUpdate, onToast }: TicketCardProps) {
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function handleStatusChange(newStatus: Status) {
    setMenuOpen(false);
    setBusy(true);
    try {
      await updateTicketStatus(ticket.id, newStatus);
      onUpdate?.();
      onToast?.('Status updated.', 'success');
    } catch (err) {
      onToast?.(err instanceof Error ? err.message : 'Failed to update status', 'error');
    } finally {
      setBusy(false);
    }
  }

  function openEdit() {
    setMenuOpen(false);
    setEditOpen(true);
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('ticketId', ticket.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ticket.id);
    try {
      const card = e.currentTarget.closest('.jira-card');
      if (card) e.dataTransfer.setDragImage(card, 0, 0);
    } catch (_) {}
    document.body.classList.add('board-dragging');
  }

  function handleDragEnd() {
    document.body.classList.remove('board-dragging');
  }

  const ticketKey = `TKT-${ticket.id}`;

  return (
    <>
      <div className="jira-card relative bg-surface border border-border rounded-lg pl-7 pr-2.5 py-2.5 sm:pl-8 sm:pr-3 sm:py-3 mb-2 shadow-sm transition-shadow hover:shadow-md [data-theme=light]:bg-white [data-theme=light]:shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div
          data-drag-handle
          className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 -left-1 mt-[-22px] sm:left-0 sm:mt-0 sm:w-5 sm:h-8 flex items-center justify-center text-text-muted cursor-grab rounded flex-shrink-0 active:cursor-grabbing sm:hover:bg-surface-hover sm:hover:text-text"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          title="Drag to move"
          aria-label="Drag to move card"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mb-2 sm:pl-[22px]">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value as Status)}
            disabled={busy}
            className="ml-auto text-[0.6875rem] font-medium py-1 px-2 rounded border border-border bg-surface text-text cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/30"
            aria-label="Update status"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <p className="m-0 mb-1.5 sm:pl-[22px] text-sm sm:text-[0.8125rem] font-semibold text-text leading-tight break-words" title={ticket.subject}>
          {truncate(ticket.subject, 60)}
        </p>
        {ticket.message && (
          <p className="m-0 mb-2.5 sm:pl-[22px] text-[0.8125rem] sm:text-[0.75rem] text-text-muted leading-snug break-words line-clamp-2" title={ticket.message}>
            {truncate(ticket.message, 80)}
          </p>
        )}
        <div className="flex justify-between items-center flex-wrap gap-1.5 sm:pl-[22px]">
          <span className="text-xs text-text-muted font-medium">{ticketKey}</span>
          <span className="text-xs text-text-muted">{formatDate(ticket.createdAt)}</span>
        </div>
        <div className="absolute top-2 right-2 sm:top-2 sm:right-2">
          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-center w-9 h-9 min-w-[44px] min-h-[44px] sm:w-7 sm:h-7 sm:min-w-0 sm:min-h-0 -m-1 sm:m-0 bg-transparent border-0 rounded-lg sm:rounded-md text-text-muted cursor-pointer transition-colors hover:bg-surface-hover hover:text-text disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => setMenuOpen((o) => !o)}
              disabled={busy}
              aria-label="Actions"
              aria-expanded={menuOpen}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
                <div className="absolute top-full right-0 mt-1 min-w-[160px] bg-surface border border-border rounded-lg shadow-lg z-20 py-1">
                  <button type="button" className="w-full flex items-center px-3.5 py-3 sm:py-2 sm:px-3 min-h-touch sm:min-h-0 text-left text-[0.8125rem] text-text bg-transparent border-0 cursor-pointer transition-colors hover:bg-surface-hover" onClick={openEdit}>
                    Edit
                  </button>
                  {STATUS_OPTIONS.filter((o) => o.value !== ticket.status).map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className="w-full flex items-center px-3.5 py-3 sm:py-2 sm:px-3 min-h-touch sm:min-h-0 text-left text-[0.8125rem] text-text bg-transparent border-0 cursor-pointer transition-colors hover:bg-surface-hover"
                      onClick={() => handleStatusChange(o.value)}
                    >
                      Move to {o.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <EditTicketModal ticket={ticket} isOpen={editOpen} onClose={() => setEditOpen(false)} onUpdated={onUpdate} onToast={onToast} />
    </>
  );
}
