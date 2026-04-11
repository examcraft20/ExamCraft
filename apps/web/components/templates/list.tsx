"use client";

import { useState } from "react";
import { Plus, Search, FileText, Play, Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@examcraft/ui";

interface Subject {
  id: string;
  name: string;
}

interface TemplateSection {
  title: string;
  marks: number;
  questionCount: number;
}

interface Template {
  id: string;
  name: string;
  examType: string;
  durationMinutes: number;
  totalMarks: number;
  sections?: TemplateSection[];
  status: string;
  createdAt: string;
}

export function TemplateListClient({
  initialTemplates,
  institutionId
}: {
  initialTemplates: Template[];
  institutionId: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = initialTemplates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full max-w-[1400px] gap-8 mx-auto pb-20 mt-[-10px]">
      
      {/* Search Header (Absolute Top Right for Dashboard Layout matching) */}
      <div className="hidden md:flex justify-end mb-[-40px] z-10 w-full relative">
         <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-10 pl-10 pr-4 rounded-xl bg-[#1e293b]/80 border border-slate-700/50 text-slate-300 placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
         </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
             <FileText size={28} className="text-white" fill="white" fillOpacity={0.2} />
             <h1 className="text-3xl font-black text-white tracking-tight">My Templates</h1>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Save paper configurations and load them straight into Generate Paper.
          </p>
        </div>
        
        <Button
          className="bg-[#7c3aed] hover:bg-[#6d28d9] px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide flex items-center gap-2 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all shrink-0 border-0"
          onClick={() => router.push(`/dashboard/faculty/templates/new?institutionId=${institutionId}`)}
        >
          <Plus size={16} /> New Template
        </Button>
      </div>

      {/* Grid Layout for Templates */}
      <div className="grid lg:grid-cols-2 gap-6 mt-2">
        {filtered.length === 0 ? (
          <div className="col-span-full p-20 rounded-2xl bg-[#1e293b]/60 border border-slate-700/50 flex flex-col items-center justify-center gap-4 border-dashed">
            <FileText size={40} className="text-slate-600" />
            <p className="text-slate-400 font-bold text-lg">No templates created yet.</p>
          </div>
        ) : (
          filtered.map((template) => {
             const fallbackSubjectTags = [template.examType, "Information", "Semester 8"];
             const tags = fallbackSubjectTags.filter(Boolean); // fallback mock for visuals since full metadata isn't expanded right now

             return (
              <div
                key={template.id}
                className="p-6 rounded-2xl bg-[#1e293b]/90 border border-slate-700/50 hover:bg-[#1e293b] hover:border-slate-600/50 transition-all flex flex-col gap-6 shadow-xl"
              >
                
                {/* Card Header */}
                <div className="flex justify-between items-start">
                   <h3 className="text-xl font-bold text-white transition-colors">
                     {template.name}
                   </h3>
                   <span className="text-xs font-medium text-slate-500">
                     {new Date(template.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                   </span>
                </div>

                {/* Pills/Badges */}
                <div className="flex flex-wrap gap-2">
                   {tags.map((tag, idx) => (
                     <span key={idx} className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300">
                        {tag}
                     </span>
                   ))}
                   <span className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                     {template.totalMarks} marks
                   </span>
                   {template.status === 'published' && (
                     <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                       Published
                     </span>
                   )}
                </div>

                {/* Section Structure Summaries */}
                <div className="flex flex-col gap-2 min-h-[40px]">
                  {template.sections && template.sections.length > 0 ? (
                    template.sections.slice(0, 3).map((sec, idx) => (
                       <p key={idx} className="text-xs text-slate-300 font-medium">
                         <span className="font-bold text-white">{sec.title}</span> — {sec.questionCount} sub-Q × {(sec.marks / sec.questionCount).toFixed(0)}M <span className="text-emerald-400">({sec.marks} pts each side)</span>
                       </p>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 font-medium italic">Base configuration active.</p>
                  )}
                  {template.sections && template.sections.length > 3 && (
                     <p className="text-xs text-slate-500 italic">+{template.sections.length - 3} more sections...</p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center gap-3 mt-auto pt-2">
                   <Button 
                     className="flex-1 bg-[#4f46e5]/20 hover:bg-[#4f46e5]/40 text-[#a5b4fc] border border-[#4f46e5]/30 h-10 gap-2 transition-all shadow-none font-bold"
                     onClick={() => router.push(`/dashboard/faculty/papers/new?institutionId=${institutionId}&templateId=${template.id}`)}
                   >
                     <Play size={14} fill="currentColor" /> Load
                   </Button>

                   <Button 
                     variant="secondary"
                     className="px-6 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 h-10 text-slate-300 gap-2 font-bold transition-all"
                   >
                     <Edit3 size={14} /> Rename
                   </Button>

                   <Button 
                     variant="secondary"
                     className="px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 h-10 text-red-500 transition-all font-bold group"
                   >
                     <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
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
