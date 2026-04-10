"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  Building2,
  Users,
  Database,
  Layers,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  MonitorPlay
} from "lucide-react";
import { Spinner } from "@examcraft/ui";
import { InstitutionsTable } from "./InstitutionsTable";
import { PlatformActivityFeed } from "./PlatformActivityFeed";
import type {
  PlatformDashboardSummaryResponse,
  PlatformInstitutionRecord,
  PlatformAuditEvent
} from "@/lib/dashboard";

export function PlatformOverviewContent() {
  const [summary, setSummary] = useState<PlatformDashboardSummaryResponse | null>(null);
  const [institutions, setInstitutions] = useState<PlatformInstitutionRecord[]>([]);
  const [auditEvents, setAuditEvents] = useState<PlatformAuditEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const token = localStorage.getItem("sb-tokens");
        const tokens = token ? JSON.parse(token) : null;
        const accessToken = tokens?.accessToken || "";

        const [summaryData, institutionsData, auditData] = await Promise.all([
          apiRequest<PlatformDashboardSummaryResponse>("/tenant/platform-summary", {
            method: "GET",
            accessToken
          }),
          apiRequest<PlatformInstitutionRecord[]>("/tenant/platform-institutions", {
            method: "GET",
            accessToken
          }),
          apiRequest<PlatformAuditEvent[]>("/tenant/platform-audit-feed", {
            method: "GET",
            accessToken
          })
        ]);

        if (isMounted) {
          setSummary(summaryData);
          setInstitutions(institutionsData);
          setAuditEvents(auditData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load platform data");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Spinner size="lg" className="text-[#818cf8]" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-300 font-bold tracking-tight animate-pulse text-lg">Fetching Telemetry...</p>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Global Platform Node</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] bg-red-500/10 border border-red-500/20 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">System Error</h3>
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  const statCards = [
    { label: "Active Institutions", value: summary?.totals?.institutions || 0, icon: Building2, trend: "+12.5%", color: "from-[#4f46e5] to-[#7c3aed]", glow: "shadow-[0_0_30px_rgba(79,70,229,0.2)]" },
    { label: "Active Users", value: summary?.totals?.activeUsers || 0, icon: Users, trend: "+8.2%", color: "from-[#3b82f6] to-[#2dd4bf]", glow: "shadow-[0_0_30px_rgba(59,130,246,0.2)]" },
    { label: "Content Nodes", value: summary?.totals?.questions || 0, icon: Database, trend: "+24.1%", color: "from-[#ec4899] to-[#8b5cf6]", glow: "shadow-[0_0_30px_rgba(236,72,153,0.2)]" },
    { label: "Templates", value: summary?.totals?.templates || 0, icon: Layers, trend: "+15.3%", color: "from-[#f59e0b] to-[#ea580c]", glow: "shadow-[0_0_30px_rgba(245,158,11,0.2)]" },
    { label: "Pending Invites", value: summary?.totals?.pendingInvitations || 0, icon: Sparkles, trend: "+4.1%", color: "from-[#10b981] to-[#059669]", glow: "shadow-[0_0_30px_rgba(16,185,129,0.2)]" },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#818cf8] bg-[#4f46e5]/10 px-2.5 py-1 rounded-md border border-[#4f46e5]/20">Command Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tighter">
            Platform Overview
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium mt-3 max-w-2xl">
            Real-time telemetry and operational metrics across the ExamCraft global infrastructure grid.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300">
            <MonitorPlay size={16} className="text-[#a5b4fc]" />
            Live View
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-white px-5 py-2.5 rounded-xl border border-white/10 font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-300 transform hover:-translate-y-0.5">
            Export Report
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Redesigned Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 relative z-10">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="relative group overflow-hidden rounded-[2rem]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent group-hover:from-white/[0.05] transition-colors duration-500" />
              <div className={`bg-[#080808] border border-white/[0.05] rounded-[2rem] p-6 h-full relative z-10 transition-transform duration-500 ease-out group-hover:-translate-y-1 block ${stat.glow}`}>
                
                {/* Decorative Top Line */}
                <div className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${stat.color} opacity-50 rounded-b-full group-hover:opacity-100 transition-opacity`} />
                
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} p-[1px]`}>
                    <div className="w-full h-full bg-[#0a0a0a] rounded-[15px] flex items-center justify-center">
                      <Icon size={20} className="text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                    <ArrowUpRight size={12} strokeWidth={3} />
                    {stat.trend}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-4xl font-black text-white tracking-tighter mb-2">{stat.value.toLocaleString()}</h3>
                  <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10">
        {/* Institutions Table - Rendered directly to maintain composition */}
        <div className="flex flex-col h-full">
          <InstitutionsTable institutions={institutions} />
        </div>

        {/* Activity Feed Sidebar */}
        <div className="flex flex-col h-full">
          <PlatformActivityFeed events={auditEvents} />
        </div>
      </div>
    </div>
  );
}
