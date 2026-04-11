"use client";

import { Card, Button } from "@examcraft/ui";
import {
  Building2,
  UserPlus,
  FileText,
  CreditCard,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PlatformAuditEvent } from "@/lib/dashboard";

type PlatformActivityFeedProps = {
  events: PlatformAuditEvent[];
};

const eventConfig = {
  "institution.created": {
    icon: Building2,
    label: "New Institution",
    color: "text-indigo-400"
  },
  "invitation.created": {
    icon: UserPlus,
    label: "User Invited",
    color: "text-emerald-400"
  },
  "question.created": {
    icon: FileText,
    label: "Question Created",
    color: "text-amber-400"
  },
  "institution.status_changed": {
    icon: AlertTriangle,
    label: "Status Changed",
    color: "text-red-400"
  },
  "template.cloned": {
    icon: FileText,
    label: "Template Cloned",
    color: "text-violet-400"
  },
  "questions.bulk_imported": {
    icon: CreditCard,
    label: "Bulk Import",
    color: "text-cyan-400"
  }
};

export function PlatformActivityFeed({ events }: PlatformActivityFeedProps) {
  const limitedEvents = events.slice(0, 10);

  return (
    <Card className="!bg-[#080808] border-white/[0.05] !rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden h-full flex flex-col group/card">
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-bl from-[#7c3aed]/10 via-[#ec4899]/5 to-transparent blur-[80px] rounded-full pointer-events-none opacity-50 group-hover/card:opacity-100 transition-opacity duration-700" />

      <div className="flex items-center justify-between mb-8 relative z-10 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter mb-2">Live Stream</h2>
          <p className="text-slate-400 text-sm font-medium">Global operational events</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm self-start">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 relative z-10">
        {limitedEvents.map((event) => {
          const config = eventConfig[event.eventType as keyof typeof eventConfig] || {
            icon: AlertTriangle,
            label: "Event",
            color: "text-slate-400"
          };
          const Icon = config.icon;

          return (
            <div
              key={event.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.04] transition-all group flex items-start justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 shrink-0 rounded-[12px] bg-[#050505] border border-white/10 flex items-center justify-center ${config.color} shadow-inner`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="mt-0.5">
                  <p className="text-sm font-bold text-white tracking-tight group-hover:text-[#a5b4fc] transition-colors leading-none">
                    {config.label}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 line-clamp-1">
                    {event.institutionName}
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 mt-1 shrink-0">
                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
              </span>
            </div>
          );
        })}
      </div>

      <Button
        variant="ghost"
        className="mt-6 border border-white/5 py-4 rounded-xl relative z-10 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center justify-center w-full group/btn"
      >
        View All Logs 
        <ChevronRight size={16} className="ml-2 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
      </Button>
    </Card>
  );
}
