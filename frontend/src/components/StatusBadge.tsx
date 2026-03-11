import React from 'react';
import type { Status } from 'shared/types';

/** Visual status indicators: NEW = Blue, INVESTIGATING = Yellow/Orange, RESOLVED = Green */
const STATUS_CLASSES: Record<Status, string> = {
  NEW: 'bg-blue-100 text-blue-700 [data-theme=dark]:bg-blue-900/40 [data-theme=dark]:text-blue-300',
  INVESTIGATING: 'bg-amber-100 text-amber-800 [data-theme=dark]:bg-amber-900/40 [data-theme=dark]:text-amber-300',
  RESOLVED: 'bg-green-100 text-green-700 [data-theme=dark]:bg-green-900/40 [data-theme=dark]:text-green-300',
};

const STATUS_LABELS: Record<Status, string> = {
  NEW: 'New',
  INVESTIGATING: 'Investigating',
  RESOLVED: 'Resolved',
};

export interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] ?? status;
  const className = STATUS_CLASSES[status] ?? 'bg-gray-100 text-gray-700 [data-theme=dark]:bg-gray-800 [data-theme=dark]:text-gray-300';
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-[0.6875rem] font-semibold uppercase tracking-wide ${className}`}
      title={label}
    >
      {label}
    </span>
  );
}
