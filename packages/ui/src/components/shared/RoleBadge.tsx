'use client'

import { roleColors, formatRoleName } from '../../lib/design-tokens'

interface Props {
  role: string
}

export function RoleBadge({ role }: Props) {
  const classes = roleColors[role] ??
    'bg-slate-500/10 border-slate-500/20 text-slate-400'
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-md text-[9px]
      font-black uppercase tracking-widest border shadow-sm transition-all duration-200 hover:scale-105 ${classes}
    `}>
      {formatRoleName(role)}
    </span>
  )
}
