"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search, Zap, FileText, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@examcraft/ui";

interface Question {
  id: string;
  title: string;
  subject: string;
  bloomLevel: string;
  difficulty: string;
  departmentId?: string | null;
  courseId?: string | null;
}

interface SubjectStat {
  name: string;
  easy: number;
  medium: number;
  hard: number;
  total: number;
  questions: Question[];
}

export function SubjectsListClient({
  initialQuestions,
  institutionId
}: {
  initialQuestions: Question[];
  institutionId: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const subjects = useMemo(() => {
    const map = new Map<string, SubjectStat>();
    
    initialQuestions.forEach(q => {
      const sub = q.subject || "CSE";
      if (!map.has(sub)) {
        map.set(sub, { name: sub, easy: 0, medium: 0, hard: 0, total: 0, questions: [] });
      }
      
      const stat = map.get(sub)!;
      stat.total++;
      stat.questions.push(q);
      
      const d = q.difficulty?.toLowerCase();
      if (d === 'easy') stat.easy++;
      else if (d === 'medium') stat.medium++;
      else stat.hard++; /* difficult or hard */
    });
    
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [initialQuestions]);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full max-w-[1400px] gap-8 mx-auto pb-20 mt-[-10px]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BookOpen strokeWidth={2} size={30} className="text-[#3b82f6] shadow-sm ml-2" />
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black text-white tracking-tight">My Subjects</h1>
            <p className="text-slate-400 text-sm font-medium">
              {subjects.length} subjects · {initialQuestions.length} questions in bank
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:min-w-[240px]">
             <input
               type="text"
               placeholder="Search subjects..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full h-10 pl-10 pr-10 rounded-full bg-[#1e293b]/80 border border-[#2b3952] text-slate-300 placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors shadow-sm"
             />
             <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
             <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md bg-[#2b3952] hover:bg-[#334155] cursor-pointer transition-colors">
                <Search size={12} className="text-slate-400" /> {/* Simulating the filter block in image */}
             </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {filteredSubjects.length === 0 ? (
           <div className="col-span-full p-20 rounded-2xl bg-[#1e293b]/60 border border-slate-700/50 flex flex-col items-center justify-center gap-4 border-dashed">
             <BookOpen size={40} className="text-slate-600" />
             <p className="text-slate-400 font-bold text-lg">No subjects assigned yet.</p>
           </div>
        ) : (
          filteredSubjects.map(sub => {
            const easyPct = sub.total > 0 ? Math.round((sub.easy / sub.total) * 100) : 0;
            const medPct = sub.total > 0 ? Math.round((sub.medium / sub.total) * 100) : 0;
            const hardPct = sub.total > 0 ? Math.round((sub.hard / sub.total) * 100) : 0;

            return (
              <div key={sub.name} className="flex flex-col gap-5 p-6 rounded-2xl bg-[#1e293b]/90 border border-[#2b3952] shadow-xl hover:bg-[#1e293b] hover:border-slate-600/60 transition-all">
                 
                 {/* Card Header */}
                 <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-white text-lg tracking-tight leading-tight line-clamp-2">
                      {sub.name}
                    </h3>
                    <div className="shrink-0 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-[10px] font-black tracking-widest whitespace-nowrap">
                      {sub.total} Q
                    </div>
                 </div>

                 {/* Pills */}
                 <div className="flex items-center gap-2 mb-4">
                   <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded tracking-widest">
                     {sub.questions[0]?.departmentId || "CSE"}
                   </span>
                   <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded tracking-widest">
                     {sub.questions[0]?.courseId || "Semester 4"}
                   </span>
                 </div>

                 {/* Metrics Blocks */}
                 <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="flex flex-col items-center py-3 bg-[#131d2e]/80 border border-[#2b3952] rounded-xl text-center shadow-inner">
                       <span className="text-2xl font-black text-[#10b981]">{sub.easy}</span>
                       <span className="text-[9px] font-bold text-[#10b981]/70 uppercase tracking-widest mt-1">Easy</span>
                       <span className="text-[10px] font-medium text-emerald-500/40 mt-0.5">{easyPct}%</span>
                    </div>
                    <div className="flex flex-col items-center py-3 bg-[#131d2e]/80 border border-[#2b3952] rounded-xl text-center shadow-inner">
                       <span className="text-2xl font-black text-[#f59e0b]">{sub.medium}</span>
                       <span className="text-[9px] font-bold text-[#f59e0b]/70 uppercase tracking-widest mt-1">Medium</span>
                       <span className="text-[10px] font-medium text-amber-500/40 mt-0.5">{medPct}%</span>
                    </div>
                    <div className="flex flex-col items-center py-3 bg-[#131d2e]/80 border border-[#2b3952] rounded-xl text-center shadow-inner">
                       <span className="text-2xl font-black text-[#f43f5e]">{sub.hard}</span>
                       <span className="text-[9px] font-bold text-[#f43f5e]/70 uppercase tracking-widest mt-1">Difficult</span>
                       <span className="text-[10px] font-medium text-rose-500/40 mt-0.5">{hardPct}%</span>
                    </div>
                 </div>

                 {/* Progress Bar */}
                 <div className="h-1.5 w-full flex rounded-full overflow-hidden mt-1 gap-1 bg-[#131d2e]">
                    <div className="h-full bg-[#10b981]" style={{ width: `${easyPct}%` }} />
                    <div className="h-full bg-[#f59e0b]" style={{ width: `${medPct}%` }} />
                    <div className="h-full bg-[#f43f5e]" style={{ width: `${hardPct}%` }} />
                 </div>

                 {/* Actions */}
                 <div className="flex items-center gap-3 mt-4">
                    <Button 
                      className="flex-1 bg-[#4f46e5]/30 hover:bg-[#4f46e5]/50 border border-[#4f46e5]/40 text-[#c7d2fe] h-10 gap-2 font-bold text-[11px] shadow-none"
                      onClick={() => router.push(`/dashboard/faculty/templates/new?institutionId=${institutionId}&subject=${sub.name}`)}
                    >
                      <Zap size={14} fill="currentColor" className="text-[#a5b4fc]" /> Generate Paper
                    </Button>

                    <Button 
                      variant="secondary"
                      className="flex-1 bg-[#1e293b] hover:bg-[#2b3952] border border-[#2b3952] h-10 text-slate-300 gap-2 font-bold text-[11px]"
                      onClick={() => router.push(`/dashboard/faculty/questions?institutionId=${institutionId}&subject=${sub.name}`)}
                    >
                      <FileText size={14} className="text-[#94a3b8]" /> View
                    </Button>

                    <Button 
                      variant="secondary"
                      className="w-10 px-0 bg-[#1e293b] hover:bg-red-500/10 border border-[#2b3952] hover:border-red-500/20 h-10 text-slate-500 hover:text-red-400 transition-all group"
                    >
                      <Trash2 size={14} className="group-hover:scale-110 transition-transform text-[#64748b] group-hover:text-red-400" />
                    </Button>
                 </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
