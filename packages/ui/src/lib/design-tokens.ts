export const statusColors: Record<string, string> = {
  draft: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
  submitted: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  in_review: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  approved: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  ready: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  published: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/10 border-red-500/20 text-red-400',
  archived: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400',
  pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  active: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  inactive: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
  trial: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  suspended: 'bg-red-500/10 border-red-500/20 text-red-400',
}

export const roleColors: Record<string, string> = {
  super_admin: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  institution_admin: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  academic_head: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  faculty: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  reviewer_approver: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
}

export const difficultyColors: Record<string, string> = {
  easy: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  medium: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  hard: 'bg-red-500/10 border-red-500/20 text-red-400',
}

export const INPUT_FIELD_CLASSES = "w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"

export function formatRoleName(role: string): string {
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
