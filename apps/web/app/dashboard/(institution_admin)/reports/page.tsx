"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Download, RefreshCw } from "lucide-react";
import { getSupabaseBrowserSession } from "../../../../lib/supabase-browser";
import { apiRequest } from "#api";
import { useInstitution } from "../../../../hooks/use-institution";
import { Spinner } from "@examcraft/ui";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

type Question = { id: string; difficulty: string; status: string; subject: string; createdAt: string; bloomLevel: string };
type Paper = { id: string; status: string; subject: string; createdAt: string; totalMarks: number; templateName?: string };

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function buildMonthlyPapers(papers: Paper[]) {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    const count = papers.filter((p) => {
      const pd = new Date(p.createdAt);
      return `${pd.getFullYear()}-${pd.getMonth()}` === key;
    }).length;
    return { label, papers: count };
  });
}

import { useAdminContext } from "../../../../hooks/use-admin-context";

export default function ReportsPage() {
  const { accessToken, institutionId, isReady } = useAdminContext();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [people, setPeople] = useState<{ users: any[] } | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "qbank" | "papers" | "activity">("overview");

  const load = (token: string, instId: string) => {
    setIsLoading(true);
    Promise.all([
      apiRequest<Question[]>("/content/questions", { method: "GET", accessToken: token, institutionId: instId }),
      apiRequest<Paper[]>("/content/papers", { method: "GET", accessToken: token, institutionId: instId }),
      apiRequest<{ users: any[] }>("/people/users", { method: "GET", accessToken: token, institutionId: instId }),
      apiRequest<{ departments: any[] }>("/academic/departments", { method: "GET", accessToken: token, institutionId: instId }),
    ])
      .then(([q, p, ppl, d]) => {
        setQuestions(Array.isArray(q) ? q : []);
        setPapers(Array.isArray(p) ? p : []);
        setPeople(ppl);
        setDepartments(d?.departments || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (accessToken && institutionId) load(accessToken, institutionId);
  }, [accessToken, institutionId]);

  const monthlyData = buildMonthlyPapers(papers);

  const papersByType = papers.reduce((acc: Record<string, number>, p) => {
    const key = p.templateName || "Uncategorized";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topPaperTypes = Object.entries(papersByType).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));

  const topTeachers = people?.users
    ? [...people.users].sort((a, b) => (b.paperCount || 0) - (a.paperCount || 0)).slice(0, 5)
    : [];

  const stats = {
    papers: papers.length,
    questions: questions.length,
    staff: people?.users?.length ?? 0,
    departments: departments.length,
    pending: questions.filter((q) => ["draft", "pending"].includes(q.status)).length,
    approved: questions.filter((q) => ["ready", "approved"].includes(q.status)).length,
    rejected: questions.filter((q) => q.status === "rejected").length,
  };

  const TABS = ["overview", "qbank", "papers", "activity"] as const;
  const TAB_LABELS: Record<string, string> = { overview: "Overview", qbank: "Question Bank", papers: "Papers", activity: "Recent Activity" };

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Papers", stats.papers],
      ["Total Questions", stats.questions],
      ["Staff Members", stats.staff],
      ["Departments", stats.departments],
      ["Pending Review", stats.pending],
      ["Approved", stats.approved],
      ["Rejected", stats.rejected],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "examcraft-report.csv"; a.click();
  };

  if (!accessToken || isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" className="w-12 h-12" /></div>;

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <LineChart size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Reports &amp; Analytics</h1>
            <p className="text-[#8b9bb4] text-sm font-medium">System-wide data overview for the institution</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => accessToken && institutionId && load(accessToken, institutionId)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e293b] border border-white/10 text-sm font-bold text-[#8b9bb4] hover:text-white transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-sm font-bold text-indigo-400 hover:bg-indigo-500/30 transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1e293b] p-1.5 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? "bg-[#544bc3] text-white shadow" : "text-[#8b9bb4] hover:text-white"}`}>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Papers", value: stats.papers, icon: "📄", color: "text-white" },
          { label: "Total Questions", value: stats.questions, icon: "❓", color: "text-[#818cf8]" },
          { label: "Staff Members", value: stats.staff, icon: "👩‍🏫", color: "text-[#10b981]" },
          { label: "Departments", value: stats.departments, icon: "🏫", color: "text-[#fbbf24]" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1e293b] rounded-2xl p-6 flex flex-col gap-2">
            <span className="text-[10px] text-[#8b9bb4] font-bold uppercase tracking-widest flex justify-between items-center">
              {s.label} <span className="text-lg">{s.icon}</span>
            </span>
            <span className={`text-4xl font-black ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Review Status Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: stats.pending, color: "text-yellow-400", bg: "border-yellow-500/20 bg-yellow-500/10", icon: "⏳" },
          { label: "Approved", value: stats.approved, color: "text-green-400", bg: "border-green-500/20 bg-green-500/10", icon: "✅" },
          { label: "Rejected", value: stats.rejected, color: "text-red-400", bg: "border-red-500/20 bg-red-500/10", icon: "❌" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-6 border ${s.bg} flex items-center gap-4`}>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-[11px] text-[#8b9bb4] font-bold uppercase tracking-widest">{s.label}</p>
              <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Papers Over Time */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8b9bb4]">Papers Generated — Last 12 Months</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="rColorPapers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill: "#8b9bb4", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8b9bb4", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
            <Area type="monotone" dataKey="papers" stroke="#6366f1" strokeWidth={2} fill="url(#rColorPapers)" name="Papers" dot={{ fill: "#6366f1", r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom 2-col charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Papers by Type */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8b9bb4] mb-6">Papers by Exam Type</h3>
          {topPaperTypes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {topPaperTypes.map((t, i) => (
                <div key={t.name} className="flex items-center gap-3">
                  <div className="text-xs text-[#8b9bb4] w-5 font-bold text-right">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-white truncate max-w-[160px]">{t.name}</span>
                      <span className="text-xs font-bold text-[#818cf8]">{t.value} papers</span>
                    </div>
                    <div className="h-2 bg-[#2D3748] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(t.value / (papers.length || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#8b9bb4] text-sm text-center py-8">No paper data yet.</p>
          )}
        </div>

        {/* Top Teachers */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8b9bb4] mb-6">Top Teachers by Papers Generated</h3>
          {people?.users && people.users.length > 0 ? (
            <div className="flex flex-col gap-4">
              {people.users.slice(0, 5).map((u, i) => (
                <div key={u.institutionUserId} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                    {(u.displayName || "U").charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{u.displayName || "Unknown"}</span>
                      <span className="text-xs font-bold text-[#818cf8] px-2 py-0.5 rounded bg-indigo-500/10">{papers.filter(() => true).length} papers</span>
                    </div>
                    <span className="text-xs text-[#8b9bb4]">{u.roleCodes?.join(", ") || "faculty"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#8b9bb4] text-sm text-center py-8">No staff data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
