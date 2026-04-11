"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Input } from "@examcraft/ui";
import { Calendar, Building2, Filter, X } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { PlatformAuditEvent } from "@/lib/dashboard";

const actionTypeColors = {
  CREATE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  UPDATE: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  DELETE: "text-red-400 bg-red-500/10 border-red-500/20",
  LOGIN: "text-slate-400 bg-slate-500/10 border-slate-500/20"
};

const getActionType = (eventType: string): keyof typeof actionTypeColors => {
  if (eventType.includes("created") || eventType.includes("import")) return "CREATE";
  if (eventType.includes("status_changed")) return "UPDATE";
  if (eventType.includes("deleted") || eventType.includes("archived")) return "DELETE";
  return "LOGIN";
};

export function AuditLogsTable() {
  const [events, setEvents] = useState<PlatformAuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    institution: "",
    actionType: ""
  });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const token = localStorage.getItem("sb-tokens");
        const tokens = token ? JSON.parse(token) : null;
        const accessToken = tokens?.accessToken || "";

        const data = await apiRequest<PlatformAuditEvent[]>("/institution/platform-audit-feed", {
          method: "GET",
          accessToken
        });

        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit logs");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Date filtering
      if (filters.fromDate) {
        const eventDate = new Date(event.createdAt);
        const fromDate = new Date(filters.fromDate);
        if (eventDate < fromDate) return false;
      }
      if (filters.toDate) {
        const eventDate = new Date(event.createdAt);
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);
        if (eventDate > toDate) return false;
      }

      // Institution filtering
      if (filters.institution) {
        if (!event.institutionName.toLowerCase().includes(filters.institution.toLowerCase())) {
          return false;
        }
      }

      // Action type filtering
      if (filters.actionType) {
        const eventActionType = getActionType(event.eventType);
        if (eventActionType !== filters.actionType) return false;
      }

      return true;
    });
  }, [events, filters]);

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  const handleResetFilters = () => {
    setFilters({ fromDate: "", toDate: "", institution: "", actionType: "" });
  };

  if (error) {
    return (
      <div className="rounded-[2rem] bg-red-500/10 border border-red-500/20 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6">
          <X size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">System Error</h3>
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <Card className="!bg-[#080808] border-white/[0.05] !rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group/card">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#3b82f6]/10 via-[#4f46e5]/5 to-transparent blur-[120px] rounded-full pointer-events-none opacity-50 group-hover/card:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center justify-between mb-8 relative z-10 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter mb-2">Audit Trails</h2>
          <p className="text-slate-400 text-sm font-medium">Comprehensive immutable record of platform operations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 p-6 rounded-[2rem] bg-[#0c0c0c] border border-white/[0.05] relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/10">
            <Filter size={16} className="text-slate-400" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Filter parameters</h3>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="ml-auto text-[10px] text-[#818cf8] hover:text-[#a5b4fc] font-black uppercase tracking-widest bg-[#4f46e5]/10 px-3 py-1.5 rounded-lg border border-[#4f46e5]/20 flex items-center gap-1.5 transition-colors"
            >
              <X size={12} strokeWidth={3} />
              Clear All
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Start Date</label>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="w-full bg-[#050505] border-white/10 focus:border-[#4f46e5]/50 focus:ring-[#4f46e5]/20 rounded-xl"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">End Date</label>
            <Input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              className="w-full bg-[#050505] border-white/10 focus:border-[#4f46e5]/50 focus:ring-[#4f46e5]/20 rounded-xl"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Institution</label>
            <Input
              type="text"
              placeholder="Search tenant..."
              value={filters.institution}
              onChange={(e) => setFilters({ ...filters, institution: e.target.value })}
              className="w-full bg-[#050505] border-white/10 focus:border-[#4f46e5]/50 focus:ring-[#4f46e5]/20 rounded-xl"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Operation Type</label>
            <select
              value={filters.actionType}
              onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
              className="w-full px-4 py-[9px] bg-[#050505] border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]/50 transition-all"
            >
              <option value="">All Operations</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Auth/Login</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm font-bold text-slate-500 relative z-10 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] animate-pulse" />
        Showing <span className="text-white">{filteredEvents.length}</span> of{" "}
        <span className="text-white">{events.length}</span> total logs found
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative z-10 rounded-2xl border border-white/[0.05] bg-[#0c0c0c]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="py-4 px-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
              <th className="py-4 px-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Actor</th>
              <th className="py-4 px-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Tenant</th>
              <th className="py-4 px-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Operation</th>
              <th className="py-4 px-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Details</th>
              <th className="py-4 px-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#4f46e5] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#a5b4fc]">Loading Archive</span>
                  </div>
                </td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">No system operations matched the criteria</td>
              </tr>
            ) : (
              filteredEvents.map((event) => {
                const actionType = getActionType(event.eventType);
                const colorClass = actionTypeColors[actionType];

                return (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-5 font-mono text-xs text-slate-400 group-hover:text-slate-300">
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-5 text-slate-300 font-medium">
                      {event.status || "System"}
                    </td>
                    <td className="py-4 px-5 text-white font-bold tracking-tight">
                      {event.institutionName}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${colorClass}`}>
                        {actionType}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-300">
                      {event.title}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        200 OK
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
