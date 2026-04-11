"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PieChart, BarChart2, TrendingUp, Users, FileText, BookOpen, RefreshCw } from "lucide-react";
import { getSupabaseBrowserSession } from "../../../../lib/supabase-browser";
import { apiRequest } from "#api";
import { useInstitution } from "../../../../hooks/use-institution";
import { Spinner } from "@examcraft/ui";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

type AnalyticsSummary = {
  totalPapers?: number;
  totalQuestions?: number;
  staffMembers?: number;
  subjectsCovered?: number;
  departments?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  papersByMonth?: Array<{ month: string; papers: number; questions: number }>;
  difficultyDistribution?: Array<{ name: string; value: number }>;
};

type Question = { id: string; difficulty: string; status: string; subject: string; createdAt: string };
type Paper = { id: string; status: string; subject: string; createdAt: string; totalMarks: number };

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildMonthlyData(papers: Paper[], questions: Question[]) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, papers: 0, questions: 0 };
  });
  papers.forEach((p) => {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.papers++;
  });
  questions.filter((q) => q.status === "ready" || q.status === "approved").forEach((q) => {
    const d = new Date(q.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.questions++;
  });
  return months;
}

import { useAdminContext } from "../../../../hooks/use-admin-context";

export default function AnalyticsPage() {
  const { accessToken, institutionId, isReady } = useAdminContext();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [people, setPeople] = useState<{ users: any[]; invitations: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "qbank" | "papers" | "approvals">("overview");

  const load = (token: string, instId: string) => {
    setIsLoading(true);
    Promise.all([
      apiRequest<Question[]>("/content/questions", { method: "GET", accessToken: token, institutionId: instId }),
      apiRequest<Paper[]>("/content/papers", { method: "GET", accessToken: token, institutionId: instId }),
      apiRequest<{ users: any[]; invitations: any[] }>("/people/users", { method: "GET", accessToken: token, institutionId: instId }),
    ])
      .then(([q, p, ppl]) => {
        setQuestions(Array.isArray(q) ? q : []);
        setPapers(Array.isArray(p) ? p : []);
        setPeople(ppl);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!isReady) return;
    if (!accessToken || !institutionId) {
      setIsLoading(false);
      return;
    }
    load(accessToken, institutionId);
  }, [accessToken, institutionId, isReady]);

  const monthlyData = buildMonthlyData(papers, questions);

  const diffDist = [
    { name: "Easy", value: questions.filter((q) => q.difficulty === "easy").length },
    { name: "Medium", value: questions.filter((q) => q.difficulty === "medium").length },
    { name: "Hard", value: questions.filter((q) => q.difficulty === "hard" || q.difficulty === "difficult").length },
  ].filter((d) => d.value > 0);

  const subjectCount = questions.reduce((acc: Record<string, number>, q) => {
    if (q.subject) acc[q.subject] = (acc[q.subject] || 0) + 1;
    return acc;
  }, {});
  const topSubjects = Object.entries(subjectCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

  const stats = {
    papers: papers.length,
    questions: questions.length,
    staff: people?.users?.length ?? 0,
    subjects: Object.keys(subjectCount).length,
    pending: questions.filter((q) => q.status === "draft" || q.status === "pending").length,
    approved: questions.filter((q) => q.status === "ready" || q.status === "approved").length,
    rejected: questions.filter((q) => q.status === "rejected").length,
  };

  const TABS = ["overview", "qbank", "papers", "approvals"] as const;
  const TAB_LABELS: Record<string, string> = { overview: "Overview", qbank: "Question Bank", papers: "Papers", approvals: "Approvals" };

  if (!accessToken) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" className="w-12 h-12" /></div>;
  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" className="w-12 h-12" /></div>;

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <PieChart size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Analytics</h1>
            <p className="text-[#8b9bb4] text-sm font-medium">Detailed breakdown of question bank, papers, and system usage</p>
          </div>
        </div>
        <button onClick={() => accessToken && institutionId && load(accessToken, institutionId)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e293b] border border-white/10 text-sm font-bold text-[#8b9bb4] hover:text-white transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#1e293b] p-1.5 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? "bg-[#544bc3] text-white shadow" : "text-[#8b9bb4] hover:text-white"}`}>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Papers", value: stats.papers, icon: "📄", sub: "this month", color: "text-white" },
          { label: "Total Questions", value: stats.questions, icon: "❓", color: "text-[#818cf8]" },
          { label: "Staff Teachers", value: stats.staff, icon: "👩‍🏫", color: "text-[#10b981]" },
          { label: "Subjects Covered", value: stats.subjects, icon: "📚", sub: `${stats.staff} departments`, color: "text-[#fbbf24]" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1e293b] rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8b9bb4] font-bold uppercase tracking-widest">{s.label}</span>
              <span className="text-xl">{s.icon}</span>
            </div>
            <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
            {s.sub && <span className="text-[11px] text-[#8b9bb4]">{s.sub}</span>}
          </div>
        ))}
      </div>

      {/* 12-Month Activity Trend */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 size={16} className="text-[#8b9bb4]" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8b9bb4]">12-Month Activity Trend — Papers Generated vs Questions Approved</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPapers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill: "#8b9bb4", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8b9bb4", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
            <Area type="monotone" dataKey="papers" stroke="#6366f1" strokeWidth={2} fill="url(#colorPapers)" name="Papers Generated" />
            <Area type="monotone" dataKey="questions" stroke="#10b981" strokeWidth={2} fill="url(#colorQuestions)" name="Questions Approved" />
            <Legend wrapperStyle={{ color: "#8b9bb4", fontSize: 12 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Difficulty + Subject Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8b9bb4]">Question Bank Difficulty Mix</h3>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={160}>
              <RechartsPieChart>
                <Pie data={diffDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {diffDist.map((_, idx) => <Cell key={idx} fill={COLORS[idx]} />)}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {diffDist.map((d, idx) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[idx] }} />
                  <span className="text-xs text-white font-medium">{d.name}</span>
                  <span className="text-xs text-[#8b9bb4] ml-auto pl-4">{d.value} ({Math.round((d.value / (questions.length || 1)) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Subjects */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8b9bb4]">Questions by Subject</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topSubjects} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: "#8b9bb4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#8b9bb4", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Approval Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: stats.pending, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: "⏳" },
          { label: "Approved", value: stats.approved, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: "✅" },
          { label: "Rejected", value: stats.rejected, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: "❌" },
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
    </div>
  );
}
