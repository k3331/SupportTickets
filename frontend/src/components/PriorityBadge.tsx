import React from 'react';
import type { Priority } from 'shared/types';

/** Priority badges: High = red, Medium = yellow, Low = green (professional look) */
const PRIORITY_CLASSES: Record<Priority, string> = {
  High: 'bg-red-100 text-red-700 [data-theme=dark]:bg-red-900/40 [data-theme=dark]:text-red-300',
  Medium: 'bg-yellow-100 text-yellow-700 [data-theme=dark]:bg-amber-900/40 [data-theme=dark]:text-amber-300',
  Low: 'bg-green-100 text-green-700 [data-theme=dark]:bg-green-900/40 [data-theme=dark]:text-green-300',
};

export interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const className = PRIORITY_CLASSES[priority] ?? 'bg-gray-100 text-gray-700 [data-theme=dark]:bg-gray-800 [data-theme=dark]:text-gray-300';
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-[0.6875rem] font-semibold uppercase tracking-wide ${className}`}
      title={priority}
    >
      {priority}
    </span>
  );
}
