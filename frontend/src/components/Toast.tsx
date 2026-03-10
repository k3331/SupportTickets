import React, { useEffect } from 'react';

const typeClasses: Record<string, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  warning: 'bg-warning text-[#1a1a1a]',
  info: 'bg-accent text-white',
};

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onDismiss, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (!duration || !onDismiss) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [duration, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-[max(1rem,env(safe-area-inset-top))] right-4 left-4 sm:left-auto pr-10 sm:pr-4 flex items-center gap-3 py-3 px-4 rounded-card shadow-lg z-[1000] animate-toast-in max-w-[360px] ${typeClasses[type] ?? typeClasses.info}`}
      role="alert"
    >
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 sm:static sm:translate-y-0 opacity-80 hover:opacity-100 text-2xl sm:text-xl leading-none cursor-pointer p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
        onClick={onDismiss}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
