"use client";

import { Badge } from "@examcraft/ui";

type PaperStatus = "draft" | "submitted" | "approved" | "rejected" | "published";

export function PaperStatusBadge({ status }: { status: PaperStatus }) {
  const statusConfig: Record<PaperStatus, { label: string; variant: any }> = {
    draft: { label: "Draft", variant: "secondary" },
    submitted: { label: "In Review", variant: "warning" },
    approved: { label: "Approved", variant: "success" },
    rejected: { label: "Returned", variant: "error" },
    published: { label: "Published", variant: "primary" },
  };

  const { label, variant } = statusConfig[status] || statusConfig.draft;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${
        status === "published" || status === "approved" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
        status === "rejected" ? "bg-rose-500" : 
        status === "submitted" ? "bg-amber-500" : "bg-zinc-500"
      }`} />
      <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
        {label}
      </span>
    </div>
  );
}
