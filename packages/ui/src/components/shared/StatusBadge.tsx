'use client'

import { statusColors } from '../../lib/design-tokens'

interface Props {
  status: string
  label?: string  // override display text if needed
}

export function StatusBadge({ status, label }: Props) {
  const classes = statusColors[status] ??
    'bg-slate-500/10 border-slate-500/20 text-slate-400'
  const display = label ?? status.replace(/_/g, ' ')
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-full text-[9px]
      font-black uppercase tracking-widest border shadow-sm ${classes}
    `}>
      {display}
    </span>
  )
}
