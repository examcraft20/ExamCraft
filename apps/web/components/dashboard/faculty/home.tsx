"use client";

import { useEffect, useState } from "react";
import { Clock, FileText, HelpCircle, Layers, Plus, ArrowRight, FileQuestion, UploadCloud, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { Button } from "@examcraft/ui";
import { useInstitution } from "@/hooks/use-institution";

interface SubjectStat {
  name: string;
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

export function FacultyDashboardClient() {
  const { institutionId, isLoading: isInstLoading } = useInstitution();
  const router = useRouter();
  const [stats, setStats] = useState({
    papersCount: 0,
    questionsCount: 0,
    subjectsCount: 0
  });
  const [recentPapers, setRecentPapers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<SubjectStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const session = await getSupabaseBrowserSession();
        if (!session?.access_token || !isMounted) return;

        const [papersRes, questionsRes] = await Promise.all([
          apiRequest<any[]>("/content/papers", { method: "GET", accessToken: session.access_token, institutionId: institutionId || undefined }),
          apiRequest<any[]>("/content/questions", { method: "GET", accessToken: session.access_token, institutionId: institutionId || undefined })
        ]);

        if (!isMounted) return;

        // Group questions by subject for subject cards
        const subjectGroups = questionsRes.reduce((acc, q) => {
          const sub = q.subject || "General";
          if (!acc[sub]) acc[sub] = { name: sub, easy: 0, medium: 0, hard: 0, total: 0 };
          acc[sub].total++;
          if (q.difficulty === "Easy") acc[sub].easy++;
          if (q.difficulty === "Medium") acc[sub].medium++;
          if (q.difficulty === "Hard") acc[sub].hard++;
          return acc;
        }, {} as Record<string, SubjectStat>);

        const parsedSubjects = Object.values(subjectGroups) as SubjectStat[];

        setStats({
          papersCount: papersRes.length,
          questionsCount: questionsRes.length,
          subjectsCount: parsedSubjects.length
        });
        
        setSubjects(parsedSubjects);
        setRecentPapers(papersRes.slice(0, 5)); // First 5
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadStats();
    return () => { isMounted = false; };
  }, [institutionId]);

  const quickActions = [
    { label: "Generate Paper", icon: Plus, href: `/dashboard/faculty/papers/new`, color: "text-indigo-400" },
    { label: "View Questions", icon: HelpCircle, href: `/dashboard/faculty/questions`, color: "text-emerald-400" },
    { label: "My Papers", icon: FileText, href: `/dashboard/faculty/papers`, color: "text-amber-400" },
    { label: "Templates Hub", icon: Layers, href: `/dashboard/faculty/templates`, color: "text-violet-400" },
  ];

  const currentDate = new Date().toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-20 mt-[-10px]">
      
      {/* Top Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
          Welcome back, Faculty
        </h1>
        <p className="text-sm font-medium text-slate-400">
          Your personal question bank overview
        </p>
        
        <div className="flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-white/5 w-max">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-300">{currentDate}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <div className="p-6 rounded-2xl bg-[#1e293b]/60 border border-slate-700/50 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-white opacity-80"><FileText size={28} /></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">My Papers</span>
              <span className="text-3xl font-black text-white">{isLoading ? "-" : stats.papersCount}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#1e293b]/60 border border-slate-700/50 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-red-400 opacity-80"><HelpCircle size={28} /></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">My Questions</span>
              <span className="text-3xl font-black text-emerald-400">{isLoading ? "-" : stats.questionsCount}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#1e293b]/60 border border-slate-700/50 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-emerald-400 opacity-80"><Layers size={28} /></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">My Subjects</span>
              <span className="text-3xl font-black text-amber-400">{isLoading ? "-" : stats.subjectsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Subjects */}
      <div className="flex flex-col gap-4 mt-4">
        <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
          <Layers size={14} className="text-emerald-400" />
          My Assigned Subjects
        </h3>
        <div className="flex overflow-x-auto gap-4 custom-scrollbar pb-2">
          {isLoading ? (
            <div className="text-slate-500 text-sm">Loading subjects...</div>
          ) : subjects.length === 0 ? (
            <div className="text-slate-500 text-sm">No subjects associated with your questions yet.</div>
          ) : (
            subjects.map(sub => (
              <div key={sub.name} className="min-w-[280px] p-5 rounded-2xl bg-[#1e293b]/60 border border-slate-700/50 flex flex-col gap-4">
                <h4 className="font-bold text-white text-sm">{sub.name}</h4>
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-400">E:</span>
                    <span className="text-[10px] font-bold text-white">{sub.easy}</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-400">M:</span>
                    <span className="text-[10px] font-bold text-white">{sub.medium}</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-red-400">D:</span>
                    <span className="text-[10px] font-bold text-white">{sub.hard}</span>
                  </div>
                </div>
                <div className="mt-auto text-xs font-medium text-slate-400">
                  Total: <span className="text-white font-bold">{sub.total}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Grid Layout */}
      <div className="grid lg:grid-cols-4 gap-6 mt-4 items-start">
        {/* Quick Actions */}
        <div className="lg:col-span-1 rounded-2xl bg-[#1e293b]/60 border border-slate-700/50 p-5 flex flex-col gap-4">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-3">
            {quickActions.map(action => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="w-full h-12 px-4 rounded-xl bg-[#0f172a] border border-slate-700/50 hover:bg-slate-800 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <action.icon size={16} className={action.color} />
                  <span className="font-bold text-sm text-slate-200">{action.label}</span>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Papers */}
        <div className="lg:col-span-3 rounded-2xl bg-[#1e293b]/60 border border-slate-700/50 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">
              Recent Papers · Yours Only
            </h3>
            <button
              onClick={() => router.push(`/dashboard/faculty/papers`)}
              className="text-[10px] font-black text-slate-400 hover:text-white uppercase transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="w-full overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                  <th className="pb-3 font-medium px-2">Subject / Exam</th>
                  <th className="pb-3 font-medium px-2">Date</th>
                  <th className="pb-3 font-medium px-2">Status</th>
                  <th className="pb-3 font-medium px-2">ID</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500 text-sm">Loading papers...</td>
                  </tr>
                ) : recentPapers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500 text-sm">No recent papers directly under your name.</td>
                  </tr>
                ) : (
                  recentPapers.map((paper, idx) => (
                    <tr key={paper.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{paper.title}</span>
                          <span className="text-[10px] text-slate-500 font-medium">Exam Paper</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-slate-300 font-medium">
                        {new Date(paper.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-2">
                         <span className="px-2 py-1 rounded bg-[#0f172a] border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                           {paper.status.replace("_", " ")}
                         </span>
                      </td>
                      <td className="py-4 px-2">
                         <span className="text-slate-500 font-mono text-xs group-hover:text-indigo-400 transition-colors">#{paper.id.split('-')[0]}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
