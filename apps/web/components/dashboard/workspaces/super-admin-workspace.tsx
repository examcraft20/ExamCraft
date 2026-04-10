"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShieldAlert,
  Building2,
  Users,
  Mail,
  Database,
  Globe,
  Activity,
  ShieldCheck,
  Zap,
  TrendingUp,
  CircleDashed,
  LayoutGrid,
  History,
  Fingerprint,
  ChevronRight,
  Filter
} from "lucide-react";
import { Button, Card, Input, Select, Spinner, StatusMessage, Textarea } from "@examcraft/ui";
import { StatusBadge } from "@examcraft/ui";
import { apiRequest } from "#api";
import type {
  PlatformAuditEvent,
  PlatformDashboardSummaryResponse,
  PlatformInstitutionRecord
} from "../../../lib/dashboard";

type SuperAdminWorkspaceProps = {
  accessToken: string;
};

const statusOptions = [
  { label: "Operational Status: Active", value: "active" },
  { label: "Operational Status: Trial", value: "trial" },
  { label: "Operational Status: Suspended", value: "suspended" },
  { label: "Operational Status: Archived", value: "archived" }
];

export function SuperAdminWorkspace({ accessToken }: SuperAdminWorkspaceProps) {
  const [summary, setSummary] = useState<PlatformDashboardSummaryResponse | null>(null);
  const [institutions, setInstitutions] = useState<PlatformInstitutionRecord[]>([]);
  const [auditEvents, setAuditEvents] = useState<PlatformAuditEvent[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeInstitutionId, setActiveInstitutionId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadWorkspace() {
      try {
        const [summaryResponse, institutionsResponse, auditResponse] = await Promise.all([
          apiRequest<PlatformDashboardSummaryResponse>("/tenant/platform-summary", { method: "GET", accessToken }),
          apiRequest<PlatformInstitutionRecord[]>("/tenant/platform-institutions", { method: "GET", accessToken }),
          apiRequest<PlatformAuditEvent[]>("/tenant/platform-audit-feed", { method: "GET", accessToken })
        ]);

        if (isMounted) {
          setSummary(summaryResponse);
          setInstitutions(institutionsResponse);
          setAuditEvents(auditResponse);
          setStatusDrafts(Object.fromEntries(institutionsResponse.map((ins) => [ins.id, ins.status])));
        }
      } catch (error) {
        if (isMounted) setStatus(error instanceof Error ? error.message : "Unable to synchronize platform control.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadWorkspace();
    return () => { isMounted = false; };
  }, [accessToken]);

  const filteredInstitutions = useMemo(() => {
    const needle = searchValue.trim().toLowerCase();
    if (!needle) return institutions;
    return institutions.filter((ins) =>
      [ins.name, ins.slug, ins.institutionType, ins.status].join(" ").toLowerCase().includes(needle)
    );
  }, [institutions, searchValue]);

  async function updateInstitutionStatus(institutionId: string) {
    setActiveInstitutionId(institutionId);
    setStatus(null);
    try {
      const updatedInstitution = await apiRequest<PlatformInstitutionRecord>(
        `/tenant/platform-institutions/${institutionId}/status`,
        {
          method: "PATCH",
          accessToken,
          body: JSON.stringify({
            status: statusDrafts[institutionId],
            note: notes[institutionId]?.trim() || undefined
          })
        }
      );
      setInstitutions((current) => current.map((ins) => ins.id === institutionId ? { ...ins, status: updatedInstitution.status } : ins));
      setStatus(`Institutional lifecycle updated for "${updatedInstitution.name}".`);
      const refreshedAudit = await apiRequest<PlatformAuditEvent[]>("/tenant/platform-audit-feed", { method: "GET", accessToken });
      setAuditEvents(refreshedAudit);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Lifecycle transmission failed.");
    } finally {
      setActiveInstitutionId(null);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Platform Bento Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Global Shards", value: summary?.totals.institutions ?? 0, icon: Building2, color: "text-blue-400", sub: "Active Tenants" },
           { label: "Verified Identities", value: summary?.totals.activeUsers ?? 0, icon: Users, color: "text-emerald-400", sub: "User Base" },
           { label: "Pending Synchronization", value: summary?.totals.pendingInvitations ?? 0, icon: Mail, color: "text-amber-400", sub: "Open Invites" },
           { label: "Content Flux", value: (summary?.totals.questions ?? 0) + (summary?.totals.templates ?? 0), icon: Database, color: "text-indigo-400", sub: "Pedagogical Assets" }
         ].map((stat, i) => (
            <Card key={i} className="!bg-zinc-900 border-white/5 !rounded-3xl p-8 flex items-start gap-6 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl group-hover:bg-white/10 transition-all" />
               <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={26} strokeWidth={2.5} />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{stat.label}</span>
                  <span className="text-3xl font-black text-white leading-none">{stat.value}</span>
                  <span className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">{stat.sub}</span>
               </div>
            </Card>
         ))}
      </div>

      {status && <StatusMessage variant="info" className="shadow-2xl">{status}</StatusMessage>}

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 items-start">
         {/* Tenant Controls */}
         <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4">
               <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-black tracking-tighter text-white">Institutional Registry</h2>
                  <p className="text-zinc-500 text-sm font-medium">Coordinate lifecycle states for all platform shards.</p>
               </div>
               <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {filteredInstitutions.length} Tenancies Identified
               </div>
            </div>

            <div className="relative group">
               <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                  <Search size={18} />
               </div>
               <input 
                 type="text"
                 value={searchValue}
                 onChange={(e) => setSearchValue(e.target.value)}
                 placeholder="Locate tenant by name, shard slug, or operational status..."
                 className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xl placeholder:text-zinc-700"
               />
            </div>

            <div className="grid gap-6">
               {isLoading ? (
                  <div className="flex justify-center p-20 animate-pulse"><Spinner size="lg" /></div>
               ) : filteredInstitutions.length === 0 ? (
                  <div className="p-32 rounded-[2.5rem] bg-white/5 border border-white/5 border-dashed text-center flex flex-col items-center gap-6">
                     <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-800"><Building2 size={32} /></div>
                     <p className="text-zinc-500 font-bold tracking-tight">Zero matching tenancies identified.</p>
                  </div>
               ) : (
                  filteredInstitutions.map((ins) => (
                     <div key={ins.id} className="group p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[80px] -z-10 group-hover:bg-indigo-500/10 transition-all" />
                        
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 group-hover:bg-white/10 transition-all">
                                 <Fingerprint size={28} />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                 <h4 className="text-xl font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors uppercase">{ins.name}</h4>
                                 <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{ins.slug}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{ins.institutionType} Tenancy</span>
                                 </div>
                              </div>
                           </div>
                           <StatusBadge status={ins.status} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                           {[
                              { label: "Auth Users", value: ins.usage.activeUsers, icon: Users },
                              { label: "Sync Requests", value: ins.usage.pendingInvitations, icon: Mail },
                              { label: "Question Assets", value: ins.usage.questions, icon: Database },
                              { label: "Templates", value: ins.usage.templates, icon: LayoutGrid }
                           ].map((cube, i) => (
                              <div key={i} className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2 text-zinc-600 mb-1">
                                    <cube.icon size={10} />
                                    <span className="text-[8px] font-black uppercase tracking-widest leading-none">{cube.label}</span>
                                 </div>
                                 <span className="text-lg font-black text-white">{cube.value}</span>
                              </div>
                           ))}
                        </div>

                        <div className="flex flex-col md:flex-row items-end gap-6 border-t border-white/5 pt-8">
                           <div className="flex-1 flex flex-col gap-4 w-full">
                              <Select
                                 label="Lifecycle Override"
                                 value={statusDrafts[ins.id] ?? ins.status}
                                 onChange={(e) => setStatusDrafts((curr) => ({ ...curr, [ins.id]: e.target.value }))}
                                 options={statusOptions}
                                 leftIcon={<ShieldAlert size={16} />}
                              />
                              <Input
                                 label="Administrative Protocol Note"
                                 value={notes[ins.id] ?? ""}
                                 onChange={(e) => setNotes((curr) => ({ ...curr, [ins.id]: e.target.value }))}
                                 placeholder="Record reason for intervention..."
                                 leftIcon={<Zap size={16} />}
                              />
                           </div>
                           <Button 
                             onClick={() => updateInstitutionStatus(ins.id)} 
                             loading={activeInstitutionId === ins.id}
                             className="bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-glow"
                           >
                              Apply Lifecycle Change
                           </Button>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Audit Feed Sidebar */}
         <div className="flex flex-col gap-8 sticky top-6">
            <div className="flex flex-col gap-1">
               <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                  Infrastructure Feed
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               </h2>
               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Live Cross-Tenancy Activity Audit</p>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
               {isLoading ? (
                  <div className="flex justify-center p-20"><Spinner /></div>
               ) : auditEvents.length === 0 ? (
                  <p className="text-zinc-600 text-sm font-bold text-center py-20 italic">No global activity synchronized.</p>
               ) : (
                  auditEvents.map((event) => (
                     <div key={event.id} className="p-5 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all flex gap-4 relative overflow-hidden group">
                        <div className="flex shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 group-hover:bg-white/10 transition-all">
                           <Activity size={18} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                           <h5 className="text-sm font-black text-white group-hover:text-indigo-200 transition-colors">{event.title}</h5>
                           <div className="flex items-center gap-3">
                              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{event.institutionName}</span>
                              <div className="w-1 h-1 rounded-full bg-zinc-800" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{new Date(event.createdAt).toLocaleTimeString()}</span>
                           </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                           <div className="w-1 h-1 rounded-full bg-indigo-500/30" />
                           <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        </div>
                     </div>
                  ))
               )}
            </div>

            <Button variant="secondary" fullWidth className="py-4 border-white/5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
               <History size={16} /> Load Audit Archive
            </Button>
         </div>
      </div>
    </div>
  );
}
