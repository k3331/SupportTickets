import React from 'react';
import type { Status } from 'shared/types';

const STATUS_STYLES: Record<Status, { bg: string; label: string }> = {
  NEW: { bg: 'var(--status-new)', label: 'New' },
  INVESTIGATING: { bg: 'var(--status-investigating)', label: 'Investigating' },
  RESOLVED: { bg: 'var(--status-resolved)', label: 'Resolved' },
};

export interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? { bg: 'var(--text-muted)', label: status };
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
