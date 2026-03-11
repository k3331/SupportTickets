import React, { useState } from 'react';
import { updateTicketStatus } from '../api/tickets';
import { TicketCard } from './TicketCard';
import type { Status, Ticket } from 'shared/types';

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'NEW', title: 'To Do' },
  { id: 'INVESTIGATING', title: 'In Progress' },
  { id: 'RESOLVED', title: 'Done' },
];

type BoardByStatus = Record<Status, Ticket[]>;

export interface BoardViewProps {
  tickets: Ticket[] | undefined;
  loading: boolean;
  error?: string | null;
  onUpdate?: () => void;
  onToast?: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
  onRetry?: () => void;
}

export function BoardView({ tickets, loading, error, onUpdate, onToast, onRetry }: BoardViewProps) {
  const [dragOverColumnId, setDragOverColumnId] = useState<Status | null>(null);

  const byStatus = React.useMemo((): BoardByStatus => {
    const map: BoardByStatus = { NEW: [], INVESTIGATING: [], RESOLVED: [] };
    for (const t of tickets || []) {
      if (map[t.status]) map[t.status].push(t);
    }
    return map;
  }, [tickets]);

  async function handleColumnDrop(e: React.DragEvent, columnStatus: Status) {
    e.preventDefault();
    setDragOverColumnId(null);
    const ticketId = e.dataTransfer.getData('ticketId');
    if (!ticketId) return;
    const ticket = tickets?.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === columnStatus) return;
    try {
      await updateTicketStatus(ticketId, columnStatus);
      onUpdate?.();
      onToast?.('Status updated.', 'success');
    } catch (err) {
      onToast?.(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  }

  function handleColumnDragOver(e: React.DragEvent, columnId: Status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumnId(columnId);
  }

  function handleColumnDragLeave(e: React.DragEvent) {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverColumnId(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 gap-4 text-text-muted text-[0.9375rem]">
        <div className="h-10 w-10 rounded-full border-[3px] border-border border-t-accent animate-spin" aria-hidden />
        <p>Loading tickets…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 gap-4 text-center">
        <p className="m-0 text-danger font-medium">Error fetching tickets</p>
        <p className="m-0 text-sm text-text-muted">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden pb-3 sm:pb-2 min-h-[320px] sm:min-h-[400px] snap-x snap-proximity">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          className={`flex flex-shrink-0 flex-col w-[260px] sm:w-[280px] min-w-[260px] sm:min-w-[280px] p-2.5 sm:p-3 rounded-lg max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-220px)] snap-start bg-surface-hover sm:bg-surface-hover ${dragOverColumnId === col.id ? 'board-column-drag-over' : ''}`}
          onDragOver={(e) => handleColumnDragOver(e, col.id)}
          onDragLeave={handleColumnDragLeave}
          onDrop={(e) => handleColumnDrop(e, col.id)}
        >
          <div className="flex items-center justify-between mb-3 py-1">
            <h3 className="m-0 text-[0.8125rem] font-semibold text-text uppercase tracking-wide">{col.title}</h3>
            <span className="text-xs text-text-muted bg-surface px-2 py-0.5 rounded-[10px] font-medium">{byStatus[col.id]?.length ?? 0}</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-[80px]">
            {(byStatus[col.id] || []).map((t) => (
              <TicketCard key={t.id} ticket={t} onUpdate={onUpdate} onToast={onToast} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
