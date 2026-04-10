"use client";

import { useState } from "react";
import { Card, Button, Select } from "@examcraft/ui";
import { Plus, MoreVertical, Eye, Pause } from "lucide-react";
import { StatusBadge } from "@examcraft/ui";
import { apiRequest } from "@/lib/api";
import type { PlatformInstitutionRecord } from "@/lib/dashboard";

type InstitutionsTableProps = {
  institutions: PlatformInstitutionRecord[];
};

const planBadgeColors = {
  free: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  starter: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  pro: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  enterprise: "bg-amber-500/10 text-amber-400 border-amber-500/20"
};

export function InstitutionsTable({ institutions }: InstitutionsTableProps) {
  const [suspendDropdownId, setSuspendDropdownId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (institutionId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("sb-tokens");
      const tokens = token ? JSON.parse(token) : null;
      const accessToken = tokens?.accessToken || "";

      await apiRequest(`/tenant/platform-institutions/${institutionId}/status`, {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ status: newStatus })
      });

      setSuspendDropdownId(null);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="!bg-[#080808] border-white/[0.05] !rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden h-full flex flex-col group/card">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#4f46e5]/10 via-[#7c3aed]/5 to-transparent blur-[100px] rounded-full pointer-events-none opacity-50 group-hover/card:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center justify-between mb-8 relative z-10 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-black text-white tracking-tighter relative inline-block">
              Network Topology
            </h2>
            <div className="px-2 py-1 rounded bg-[#4f46e5]/10 border border-[#4f46e5]/20 text-[10px] font-black uppercase tracking-widest text-[#a5b4fc]">
              {institutions.length} Nodes
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium">Manage institutional tenant integrations</p>
        </div>
        <Button className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-white flex items-center gap-2 rounded-xl px-5 py-2.5 shadow-[0_0_20px_rgba(79,70,229,0.3)] font-bold transition-all hover:-translate-y-0.5 border border-white/10">
          <Plus size={18} strokeWidth={3} /> Register Node
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative z-10 flex-1 scrollbar-hide">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Institution</th>
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Plan</th>
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Users</th>
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Questions</th>
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Templates</th>
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Joined</th>
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {institutions.map((institution) => (
              <tr key={institution.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                <td className="py-5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-black text-white text-xs shadow-inner">
                      {institution.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-[#a5b4fc] transition-colors">{institution.name}</p>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">{institution.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border text-indigo-400 bg-indigo-500/10 border-indigo-500/20`}>
                    Starter
                  </span>
                </td>
                <td className="py-5 px-4 text-sm font-bold text-white">
                  {institution.usage?.activeUsers || 0}
                </td>
                <td className="py-5 px-4 text-sm font-bold text-white">
                  {institution.usage?.questions || 0}
                </td>
                <td className="py-5 px-4 text-sm font-bold text-white">
                  {institution.usage?.templates || 0}
                </td>
                <td className="py-5 px-4">
                  <StatusBadge status={institution.status} />
                </td>
                <td className="py-5 px-4 text-sm text-slate-400 font-medium tracking-tight">
                  {new Date(institution.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="py-5 px-4">
                  <div className="flex items-center gap-2 relative">
                    <Button variant="ghost" size="sm" className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
                      <Eye size={16} />
                    </Button>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`px-2 py-1.5 rounded-lg transition-colors ${suspendDropdownId === institution.id ? 'text-white bg-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        onClick={() => setSuspendDropdownId(suspendDropdownId === institution.id ? null : institution.id)}
                      >
                        <MoreVertical size={16} />
                      </Button>
                      {suspendDropdownId === institution.id && (
                        <div className="absolute right-0 mt-2 bg-[#050505] border border-white/10 p-1.5 rounded-[1rem] shadow-[0_16px_40px_rgba(0,0,0,0.8)] z-50 min-w-40 ring-1 ring-[#a5b4fc]/10">
                          <button
                            onClick={() => handleStatusChange(institution.id, "suspended")}
                            disabled={isUpdating}
                            className="w-full px-3 py-2.5 text-left text-sm font-bold tracking-tight text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            Suspend Tenant
                          </button>
                          <button
                            onClick={() => handleStatusChange(institution.id, "active")}
                            disabled={isUpdating}
                            className="w-full px-3 py-2.5 text-left text-sm font-bold tracking-tight text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          >
                            Reactivate
                          </button>
                          <div className="h-px bg-white/5 my-1 mx-2" />
                          <button
                            onClick={() => handleStatusChange(institution.id, "archived")}
                            disabled={isUpdating}
                            className="w-full px-3 py-2.5 text-left text-sm font-bold tracking-tight text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
