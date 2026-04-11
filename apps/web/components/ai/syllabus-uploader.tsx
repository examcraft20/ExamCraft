"use client";

import { useState } from "react";
import { Cloud, FileText, ClipboardPaste, Loader2 } from "lucide-react";
import { Button } from "@examcraft/ui";

interface SyllabusUploaderProps {
  onAnalyze: (text: string) => Promise<void>;
  isAnalyzing: boolean;
}

export function SyllabusUploader({ onAnalyze, isAnalyzing }: SyllabusUploaderProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [textInput, setTextInput] = useState("");

  return (
    <div className="flex flex-col w-full rounded-3xl bg-[#131d2e]/80 border border-[#2b3952] shadow-xl overflow-hidden p-6 md:p-10 gap-8">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === "upload" ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]" : "text-slate-400 hover:text-slate-300 hover:bg-white/5"
          }`}
        >
          <FileText size={16} /> Upload File
        </button>
        <button
          onClick={() => setActiveTab("paste")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === "paste" ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]" : "text-slate-400 hover:text-slate-300 hover:bg-white/5"
          }`}
        >
          <ClipboardPaste size={16} /> Paste Text
        </button>
      </div>

      {activeTab === "upload" ? (
        <div
          className="w-full h-80 rounded-2xl border-2 border-dashed border-slate-600/50 hover:border-indigo-500/50 transition-colors bg-[#0b1221]/50 flex flex-col items-center justify-center gap-4 cursor-pointer group"
          onClick={() => !isAnalyzing && onAnalyze("Dummy context from file")}
        >
          <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Cloud size={32} className="text-indigo-400" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-xl font-bold text-white tracking-tight">Drag & drop your syllabus here</span>
            <span className="text-sm font-medium text-slate-500">Supports PDF, DOCX, TXT - Max 5 MB</span>
          </div>
          <Button
            className="mt-4 bg-[#1e293b] hover:bg-[#2b3952] border border-[#2b3952] hover:border-indigo-500/30 text-indigo-300 transition-all text-sm font-bold shadow-none group-hover:shadow-[0_0_20px_rgba(79,70,229,0.2)]"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : "Browse File"}
          </Button>
        </div>
      ) : (
        <div className="w-full rounded-2xl border border-slate-700/50 bg-[#0b1221]/50 p-1 flex flex-col h-80">
          <textarea
            className="flex-1 w-full bg-transparent resize-none outline-none p-4 text-slate-300 placeholder:text-slate-600 font-medium"
            placeholder="Paste your syllabus unit content here... Ex: Process Synchronization, Critical Section Problem, Mutex Locks..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <div className="p-3 border-t border-slate-700/50 flex justify-end">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2"
              onClick={() => onAnalyze(textInput)}
              disabled={isAnalyzing || textInput.length < 10}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Analyzing...
                </>
              ) : (
                "Analyze Text"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
