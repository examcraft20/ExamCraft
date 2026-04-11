"use client";

import { useState } from "react";
import { Download, FileDown, Check } from "lucide-react";
import { Button, Spinner } from "@examcraft/ui";

export function PaperExportButton({ paperId }: { paperId: string }) {
  const [isExporting, setIsExporting] = useState(false);
  const [lastFormat, setLastFormat] = useState<string | null>(null);

  const handleExport = async (format: "pdf" | "docx") => {
    setIsExporting(true);
    setLastFormat(format);
    // Logic from content/paper-export.service would be called here
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExporting(false);
    setTimeout(() => setLastFormat(null), 3000);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleExport("pdf")}
        disabled={isExporting}
        variant="secondary"
        className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
      >
        {isExporting && lastFormat === "pdf" ? <Spinner size="sm" /> : lastFormat === "pdf" ? <Check size={14} className="text-emerald-400" /> : <FileDown size={14} />}
        Export PDF
      </Button>
      <Button
        onClick={() => handleExport("docx")}
        disabled={isExporting}
        variant="secondary"
        className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
      >
        {isExporting && lastFormat === "docx" ? <Spinner size="sm" /> : lastFormat === "docx" ? <Check size={14} className="text-emerald-400" /> : <Download size={14} />}
        Word (DOCX)
      </Button>
    </div>
  );
}
