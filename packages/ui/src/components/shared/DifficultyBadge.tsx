'use client'

import { difficultyColors } from '../../lib/design-tokens'

interface Props {
  difficulty: string
  label?: string
}

export function DifficultyBadge({ difficulty, label }: Props) {
  const classes =
    difficultyColors[difficulty as keyof typeof difficultyColors] ??
    'bg-slate-500/10 border-slate-500/20 text-slate-400'
  const display =
    label ?? difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
        font-medium border capitalize ${classes}
      `}
    >
      {display}
    </span>
  )
}
