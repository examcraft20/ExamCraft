"use client";

import { Flag, AlertTriangle } from "lucide-react";
import { Card } from "@examcraft/ui";
import type { PaperRecord } from "@/lib/dashboard";

interface PaperViewerProps {
  paper?: PaperRecord | null;
  flaggedQuestions: Set<string>;
  onToggleFlag: (questionId: string) => void;
}

export function PaperViewer({
  paper,
  flaggedQuestions,
  onToggleFlag,
}: PaperViewerProps) {
  if (!paper) {
    return (
      <Card className="!bg-zinc-900 border-white/5 !rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-black text-white">Paper Unavailable</h3>
        <p className="text-zinc-500 text-sm max-w-xs font-medium">
          The paper content could not be retrieved. It may have been deleted or you may lack necessary permissions.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Paper Header */}
      <Card className="!bg-zinc-900 border-white/5 !rounded-2xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] -z-10 group-hover:bg-indigo-600/10 transition-all pointer-events-none" />
        
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black tracking-tight text-white">
                {paper.title || "Untitled Paper"}
              </h1>
              <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                {paper.subject || "No Subject Specified"}
              </p>
            </div>
            <div className="px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-black uppercase tracking-widest text-indigo-400">
              {paper.status?.replace('_', ' ') || "Status Unknown"}
            </div>
          </div>

          {/* Metadata Bar */}
          <div className="flex items-center gap-10 pt-6 border-t border-white/10 mt-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">
                Target Score
              </p>
              <p className="text-xl font-black text-white">
                {paper.totalMarks || 0}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">
                Complexity Units
              </p>
              <p className="text-xl font-black text-white">
                {paper.sections?.length || 0}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">
                Timestamp
              </p>
              <p className="text-sm font-bold text-white">
                {paper.createdAt ? new Date(paper.createdAt).toLocaleDateString("en-US", {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Sections & Questions */}
      <div className="flex flex-col gap-8">
        {(paper.sections || []).map((section, sectionIdx) => (
          <div key={sectionIdx} className="flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-white/10">
              <h2 className="text-xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                <span className="text-indigo-500 text-sm font-black w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center">
                  {sectionIdx + 1}
                </span>
                {section.title || `Section ${sectionIdx + 1}`}
              </h2>
              <span className="text-xs font-bold text-zinc-600 ml-auto uppercase tracking-widest">
                {section.marks || 0} marks • {(section.questions || []).length}{" "}
                questions
              </span>
            </div>

            {/* Questions */}
            <div className="flex flex-col gap-4">
              {(section.questions || []).map((question, qIdx) => (
                <div
                  key={question.id}
                  className={`group p-6 rounded-[1.5rem] border transition-all duration-300 ${
                    flaggedQuestions.has(question.id)
                      ? "bg-amber-500/5 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-6 mb-3">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-lg font-black text-zinc-700 min-w-[2.5rem]">
                        {sectionIdx + 1}.{qIdx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-zinc-100 font-bold leading-relaxed mb-4 text-base">
                          {question.title}
                        </div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/5 text-zinc-500">
                             {question.marks || 0} PTS
                          </span>
                          <span
                             className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                               question.difficulty === "easy"
                                 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10"
                                 : question.difficulty === "medium"
                                   ? "bg-amber-500/10 text-amber-400 border-amber-500/10"
                                   : "bg-red-500/10 text-red-400 border-red-500/10"
                             }`}
                          >
                             {question.difficulty || "medium"}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/10 text-violet-400">
                             Bloom: {question.bloomLevel || "Apply"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Flag Button */}
                    <button
                      onClick={() => onToggleFlag(question.id)}
                      className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center flex-shrink-0 ${
                        flaggedQuestions.has(question.id)
                          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                          : "opacity-0 group-hover:opacity-100 bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white"
                      }`}
                      title="Flag for revision"
                    >
                      <Flag size={18} fill={flaggedQuestions.has(question.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
