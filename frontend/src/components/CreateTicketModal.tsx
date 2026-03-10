import React from 'react';
import { TicketForm } from './TicketForm';

export interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onToast?: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export function CreateTicketModal({ isOpen, onClose, onCreated, onToast }: CreateTicketModalProps) {
  if (!isOpen) return null;

  function handleCreated() {
    onCreated?.();
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-end z-[100] pt-[env(safe-area-inset-top,0)]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-[420px] h-screen max-h-[100dvh] bg-surface border-l border-border shadow-[-4px_0_24px_rgba(0,0,0,0.2)] [data-theme=light]:shadow-[-4px_0_24px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden animate-modal-slide sm:max-w-[420px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 px-5 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-2 border-b border-border relative">
          <h2 id="modal-title" className="m-0 mb-1 text-lg font-semibold text-text">
            New task
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0))] sm:p-5">
          <TicketForm onCreated={handleCreated} onToast={onToast} />
        </div>
      </div>
    </div>
  );
}
