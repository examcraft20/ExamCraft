"use client";

import { useState } from "react";
import { Download, FileDown, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@examcraft/ui";
import { toast } from "sonner";

export function PaperExportButton({ paperId }: { paperId: string }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [lastFormat, setLastFormat] = useState<string | null>(null);

  const handleExport = async (format: "pdf" | "docx") => {
    if (isExporting) return;

    setIsExporting(true);
    setExportError(null);
    setLastFormat(format);

    try {
      // Logic for paper export would be triggered here
      // This is a placeholder for the actual export implementation
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Success case for now
          resolve(true);
        }, 2000);
      });

      toast.success(`Exam paper exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      const msg = error instanceof Error ? error.message : "Failed to generate export file.";
      setExportError(msg);
      toast.error(msg);
    } finally {
      setIsExporting(false);
      setTimeout(() => {
        setLastFormat(null);
        setExportError(null);
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => handleExport("pdf")}
          disabled={isExporting}
          variant="secondary"
          className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2.5 bg-zinc-900 border-white/5 hover:bg-zinc-800 transition-all disabled:opacity-50"
        >
          {isExporting && lastFormat === "pdf" ? (
            <Loader2 size={14} className="animate-spin text-indigo-400" />
          ) : lastFormat === "pdf" && !exportError ? (
            <Check size={14} className="text-emerald-400" />
          ) : (
            <FileDown size={14} />
          ) }
          {isExporting && lastFormat === "pdf" ? "Exporting..." : "Export PDF"}
        </Button>
        <Button
          onClick={() => handleExport("docx")}
          disabled={isExporting}
          variant="secondary"
          className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2.5 bg-zinc-900 border-white/5 hover:bg-zinc-800 transition-all disabled:opacity-50"
        >
          {isExporting && lastFormat === "docx" ? (
            <Loader2 size={14} className="animate-spin text-indigo-400" />
          ) : lastFormat === "docx" && !exportError ? (
            <Check size={14} className="text-emerald-400" />
          ) : (
            <Download size={14} />
          )}
          {isExporting && lastFormat === "docx" ? "Exporting..." : "Word (DOCX)"}
        </Button>
      </div>
      
      {exportError && (
        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={10} />
          {exportError}
        </p>
      )}
    </div>
  );
}
