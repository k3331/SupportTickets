import React from 'react';
import type { Priority } from 'shared/types';

const PRIORITY_STYLES: Record<Priority, { bg: string; label: string }> = {
  Low: { bg: 'var(--priority-low)', label: 'Low' },
  Medium: { bg: 'var(--priority-medium)', label: 'Medium' },
  High: { bg: 'var(--priority-high)', label: 'High' },
};

export interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const style = PRIORITY_STYLES[priority] ?? { bg: 'var(--text-muted)', label: priority };
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-md text-[0.6875rem] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: 'color-mix(in srgb, var(--badge-bg) 22%, transparent)', color: style.bg, ['--badge-bg' as string]: style.bg }}
      title={style.label}
    >
      {style.label}
    </span>
  );
}
