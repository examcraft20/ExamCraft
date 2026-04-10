import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, ShieldAlert, Activity, User, Monitor } from "lucide-react";
import { Card, Spinner } from "@examcraft/ui";
import { apiRequest } from "../../../lib/api/client";

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  actor: {
    role: string;
    users: {
      email: string;
    };
  };
}

export function AuditLogsClient({
  accessToken,
  institutionId
}: {
  accessToken: string;
  institutionId: string;
}) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await apiRequest<AuditLog[]>("/audit-logs", {
          method: "GET",
          accessToken,
          institutionId
        });
        setLogs(data);
      } catch (error) {
        console.error("Failed to load audit logs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    void loadLogs();
  }, [accessToken, institutionId]);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(search.toLowerCase()) ||
      log.actor?.users?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-lg">
                <ShieldAlert size={16} />
             </div>
             <h1 className="text-3xl font-black text-white tracking-tight">Audit Logs</h1>
          </div>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Immutable security and activity trail for your institution.
          </p>
        </div>
      </div>

      <div className="w-full relative group max-w-xl">
         <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
            <Search size={18} />
         </div>
         <input 
           type="text"
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           placeholder="Search by action, resource, or email..."
           className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/20 transition-all placeholder:text-zinc-600 shadow-xl"
         />
      </div>

      <Card className="!bg-[#0f152d]/50 border-white/5 !rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Actor</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Action</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Target Resource</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 w-[150px]">Meta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-500">
                    No activity found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold whitespace-nowrap">
                        <Activity size={12} className="text-indigo-400 opacity-50" />
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-bold tracking-tight">
                          {log.actor?.users?.email || 'System'}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-indigo-400 mt-0.5">
                          {log.actor?.role || 'Service'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/5 text-xs text-slate-300 font-mono tracking-tight">
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-300 text-sm font-medium">{log.resource_type}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">{log.resource_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex flex-col gap-1 w-full max-w-[150px] truncate">
                         <span title={log.ip_address} className="truncate">{log.ip_address}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
