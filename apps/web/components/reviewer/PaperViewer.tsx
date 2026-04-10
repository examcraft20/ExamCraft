"use client";

import { Flag } from "lucide-react";
import { Card } from "@examcraft/ui";
import type { PaperRecord } from "@/lib/dashboard";

interface PaperViewerProps {
  paper: PaperRecord;
  flaggedQuestions: Set<string>;
  onToggleFlag: (questionId: string) => void;
}

export function PaperViewer({
  paper,
  flaggedQuestions,
  onToggleFlag,
}: PaperViewerProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Paper Header */}
      <Card className="!bg-zinc-900 border-white/5 !rounded-2xl p-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black tracking-tight text-white">
                {paper.title}
              </h1>
              <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">
                {paper.subject}
              </p>
            </div>
            <div className="px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-black uppercase tracking-widest text-indigo-400">
              {paper.status}
            </div>
          </div>

          {/* Metadata Bar */}
          <div className="flex items-center gap-6 pt-4 border-t border-white/10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                Total Marks
              </p>
              <p className="text-lg font-black text-white mt-1">
                {paper.totalMarks}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                Sections
              </p>
              <p className="text-lg font-black text-white mt-1">
                {paper.sections?.length || 0}
              </p>
            </div>
            <div className="ml-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                Created
              </p>
              <p className="text-sm font-bold text-white mt-1">
                {new Date(paper.createdAt).toLocaleDateString("en-US")}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Sections & Questions */}
      <div className="flex flex-col gap-8">
        {paper.sections?.map((section, sectionIdx) => (
          <div key={sectionIdx} className="flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-white/10">
              <h2 className="text-xl font-black tracking-tight text-white uppercase">
                {section.title}
              </h2>
              <span className="text-xs font-bold text-zinc-500 ml-auto">
                {section.marks} marks • {section.questions?.length || 0}{" "}
                questions
              </span>
            </div>

            {/* Questions */}
            <div className="flex flex-col gap-4">
              {section.questions?.map((question, qIdx) => (
                <div
                  key={question.id}
                  className={`group p-6 rounded-xl border transition-all ${
                    flaggedQuestions.has(question.id)
                      ? "bg-amber-500/10 border-l-4 border-l-amber-400 border-white/10"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-lg font-black text-zinc-600 min-w-fit">
                        Q{sectionIdx + 1}.{qIdx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-bold leading-relaxed">
                          {question.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs font-bold px-2 py-1 rounded bg-white/5 text-zinc-400">
                            {question.marks} marks
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              question.difficulty === "easy"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : question.difficulty === "medium"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {question.difficulty}
                          </span>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-400">
                            Bloom: {question.bloomLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Flag Button */}
                    <button
                      onClick={() => onToggleFlag(question.id)}
                      className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                        flaggedQuestions.has(question.id)
                          ? "bg-amber-500/20 text-amber-400"
                          : "opacity-0 group-hover:opacity-100 bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white"
                      }`}
                      title="Flag for revision"
                    >
                      <Flag size={18} />
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
