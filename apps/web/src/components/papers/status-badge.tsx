"use client";

import { Badge } from "@examcraft/ui";

type PaperStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "published";

interface StatusConfig {
  label: string;
  variant: "primary" | "secondary" | "success" | "warning" | "error" | "outline";
  dotColor: string;
}

export function PaperStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, StatusConfig> = {
    draft: { 
      label: "Draft", 
      variant: "secondary",
      dotColor: "bg-zinc-500"
    },
    submitted: { 
      label: "Submitted", 
      variant: "warning",
      dotColor: "bg-amber-500"
    },
    under_review: { 
      label: "Under Review", 
      variant: "warning",
      dotColor: "bg-amber-400 animate-pulse"
    },
    approved: { 
      label: "Approved", 
      variant: "success",
      dotColor: "bg-emerald-500"
    },
    rejected: { 
      label: "Returned", 
      variant: "error",
      dotColor: "bg-rose-500"
    },
    published: { 
      label: "Published", 
      variant: "primary",
      dotColor: "bg-blue-500"
    },
  };

  const normalizedStatus = status?.toLowerCase() || "unknown";
  const config = statusConfig[normalizedStatus] || {
    label: status || "Unknown",
    variant: "secondary",
    dotColor: "bg-zinc-700"
  };

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 w-fit">
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-300">
        {config.label}
      </span>
    </div>
  );
}
