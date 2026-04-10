"use client";

import { useState } from "react";
import {
  X,
  Printer,
  Download,
  Layout,
  Type,
  Maximize2,
  Minimize2,
  Settings2,
  Eye,
  FileText,
  Building2,
  Clock,
  Coins,
} from "lucide-react";
import { Button } from "@examcraft/ui";
import { PaperRecord } from "@/lib/dashboard";

type PaperPreviewModalProps = {
  paper: PaperRecord;
  isOpen: boolean;
  onClose: () => void;
  institutionName?: string;
};

export function PaperPreviewModal({
  paper,
  isOpen,
  onClose,
  institutionName,
}: PaperPreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [headerStyle, setHeaderStyle] = useState<"center" | "split">("center");
  const [showMetadata, setShowMetadata] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full h-full max-w-6xl flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
        {/* Controls Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6 bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Settings2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tighter text-white leading-none">
                Layout Engine
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1">
                Live Preview Tuning
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Header alignment
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                {["center", "split"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setHeaderStyle(style as any)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${headerStyle === style ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                View Controls
              </label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowMetadata(!showMetadata)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${showMetadata ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-white/5 text-zinc-500"}`}
                >
                  <span className="text-xs font-bold">Metadata Overlays</span>
                  <Eye size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-auto">
              <Button
                fullWidth
                className="bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Print Paper
              </Button>
              <Button
                variant="secondary"
                fullWidth
                className="py-4 border-white/5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Download size={16} /> Export DXF/PDF
              </Button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 lg:-right-3 lg:-top-3 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-20 border-4 border-zinc-900"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </aside>

        {/* Paper Canvas */}
        <main className="flex-1 overflow-auto p-4 flex justify-center custom-scrollbar animate-in zoom-in-95 duration-700 delay-150">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
            }}
            className="w-[850px] min-h-[1100px] bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] p-[60px] text-zinc-900 flex flex-col font-serif relative"
          >
            {/* Institutional Header */}
            <header
              className={`flex flex-col mb-12 pb-8 border-b-2 border-zinc-900 ${headerStyle === "center" ? "items-center text-center" : "items-start text-left"}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center text-white font-black text-2xl">
                  {institutionName?.charAt(0) || "E"}
                </div>
                <div className="flex flex-col items-start leading-none">
                  <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">
                    {institutionName || "ExamCraft Prestige Academy"}
                  </h1>
                  <p className="text-xs font-bold tracking-[0.3em] text-zinc-500 uppercase">
                    Center for Pedagogical Excellence
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2 w-full">
                <h2 className="text-2xl font-black tracking-tight">
                  {paper.title}
                </h2>
                <div className="flex items-center justify-center gap-8 text-xs font-black uppercase tracking-widest border-y border-zinc-100 py-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Clock size={14} /> Duration: 90 Minutes
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} /> Subject: {paper.subject}
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins size={14} /> Max Marks: {paper.totalMarks}
                  </div>
                </div>
              </div>
            </header>

            {/* Instructions */}
            <section className="mb-10 p-6 bg-zinc-50 border-l-4 border-zinc-900 leading-relaxed text-sm italic">
              <h4 className="font-black uppercase tracking-widest text-[10px] mb-2 not-italic">
                Institutional Instructions
              </h4>
              1. All questions are mandatory unless specified otherwise. 2.
              Diagrams should be drawn using a steady pencil. 3. Answers should
              be structured with clear pedagogical alignment.
            </section>

            {/* Dynamic Sections */}
            <div className="flex flex-col gap-12">
              {paper.sections.map((section, sIdx) => (
                <div key={sIdx} className="flex flex-col gap-6">
                  <div className="flex items-end justify-between border-b border-zinc-400 pb-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter shrink-0">
                      {section.title}
                    </h3>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      [{section.marks} Marks Total]
                    </div>
                  </div>

                  <div className="flex flex-col gap-8">
                    {section.questions.map((q, qIdx) => (
                      <div key={q.id} className="flex gap-4 group relative">
                        <span className="font-black text-sm shrink-0 w-6">
                          Q{qIdx + 1}.
                        </span>
                        <div className="flex flex-col gap-4 flex-1">
                          <p className="text-lg leading-relaxed font-medium whitespace-pre-wrap">
                            {q.title}
                          </p>

                          {(q as any).metadata?.questionType === "mcq" &&
                            (q as any).metadata?.mcqOptions?.length > 0 && (
                              <div className="grid grid-cols-2 gap-y-3 gap-x-8 mt-2">
                                {(q as any).metadata.mcqOptions.map(
                                  (opt: any, optIdx: number) => (
                                    <div
                                      key={opt.id || optIdx}
                                      className="flex gap-2 text-md font-medium"
                                    >
                                      <span>
                                        {String.fromCharCode(97 + optIdx)})
                                      </span>
                                      <span>{opt.text}</span>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                        <div className="shrink-0 font-bold text-sm">
                          ({q.marks})
                        </div>

                        {showMetadata && (
                          <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                            <div className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest w-fit">
                              {q.bloomLevel}
                            </div>
                            <div className="px-2 py-0.5 rounded bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest w-fit">
                              {q.difficulty}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <footer className="mt-auto pt-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 border-t border-dashed border-zinc-100 italic">
              Confidential Institutional Asset • Generated via ExamCraft Engine
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
