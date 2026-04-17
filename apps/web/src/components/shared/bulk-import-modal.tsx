"use client";

import { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Info,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button, Spinner } from "@examcraft/ui";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { apiRequest } from "@/lib/api/client";
import { toast } from "sonner";

type BulkImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accessToken: string;
  institutionId: string;
};

type PreviewRow = {
  title: string;
  subject: string;
  difficulty: string;
  bloomLevel: string;
  marks?: number;
  unitNumber?: number;
  tags?: string;
  courseOutcomes?: string;
  isValid: boolean;
  errors: string[];
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

export function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
  accessToken,
  institutionId,
}: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 5MB threshold.");
        return;
      }
      const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error("Unsupported file manifest. Use CSV or XLSX blueprints.");
        return;
      }
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    setIsProcessing(true);
    setPreview([]);

    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            validateAndSetPreview(results.data as any[]);
          },
        });
      };
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        validateAndSetPreview(jsonData as any[]);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const validateAndSetPreview = (data: any[]) => {
    const validatedData = data.map((row): PreviewRow => {
      const errors: string[] = [];

      const title = row.title || row.Question || row.text || "";
      const subject = row.subject || row.Subject || "";
      const difficulty = String(
        row.difficulty ||
        row.Difficulty ||
        "medium"
      ).toLowerCase().trim();
      const bloomLevel = row.bloom_level || row.BloomLevel || "Understand";

      if (!title) errors.push("Missing core question title");
      if (!subject) errors.push("Subject domain required");

      const validDiffs = ["easy", "medium", "hard", "difficult"];
      if (!validDiffs.includes(difficulty)) {
        errors.push(`Standardization error: difficulty '${difficulty}' unrecognized`);
      }

      return {
        title,
        subject,
        difficulty,
        bloomLevel,
        marks: Number(row.marks || row.Marks || 0),
        unitNumber:
          row.unit || row.Unit ? Number(row.unit || row.Unit) : undefined,
        tags: row.tags || row.Tags || "",
        courseOutcomes: row.co || row.CO || row.course_outcomes || "",
        isValid: errors.length === 0,
        errors,
      };
    });

    setPreview(validatedData);
    setIsProcessing(false);
  };

  const handleUpload = async () => {
    if (preview.length === 0) return;

    const validRows = preview.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("Manifest contains zero valid payload items.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    try {
      const formattedQuestions = validRows.map((r) => ({
        title: r.title,
        subject: r.subject,
        difficulty: r.difficulty === "difficult" ? "hard" : r.difficulty,
        bloomLevel: r.bloomLevel,
        marks: r.marks,
        unitNumber: r.unitNumber,
        tags: r.tags ? String(r.tags).split(",").map((s) => s.trim()) : [],
        courseOutcomes: r.courseOutcomes
          ? String(r.courseOutcomes).split(",").map((s) => s.trim())
          : [],
        status: "draft",
      }));

      setUploadProgress(40);
      await apiRequest("/questions/bulk", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({ questions: formattedQuestions }),
      });

      setUploadProgress(100);
      toast.success(
        `Bulk ingestion complete: ${formattedQuestions.length} items synchronized.`
      );
      onSuccess();
      setTimeout(onClose, 500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Infrastructure fault during bulk upload."
      );
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      [
        "title",
        "subject",
        "difficulty",
        "bloom_level",
        "marks",
        "unit",
        "tags",
        "course_outcomes",
      ],
      [
        "Identify the core components of zero-trust architecture.",
        "Computer Security",
        "medium",
        "Understand",
        "5",
        "1",
        "security, networking",
        "CO1, CO3",
      ],
    ];
    const csvContent = template.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "examcraft_bulk_import_manifest.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validCount = preview.filter((r) => r.isValid).length;
  const invalidCount = preview.length - validCount;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-950 border border-white/[0.08] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="p-10 pb-6 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Upload size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">
                Bulk Ingestion
              </h2>
              <p className="text-zinc-500 text-sm font-bold tracking-wide mt-1">
                Synchronize external dataset with item bank partitions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all shadow-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {!file ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] p-16 bg-white/[0.01] hover:bg-white/[0.03] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none" />
              
              <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform mb-8 shadow-2xl border border-indigo-500/10">
                <FileSpreadsheet size={48} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Select Manifest File
              </h3>
              <p className="text-zinc-500 text-center max-w-sm mb-10 font-medium">
                Upload your <strong className="text-indigo-400">CSV or XLSX</strong> structured data. 
                Payload must not exceed 5MB.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv, .xlsx, .xls"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-black hover:bg-zinc-200 px-10 py-5 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95"
                >
                  Browse Hardware
                </Button>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-8 py-5 rounded-[1.25rem] bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-all"
                >
                  <Download size={18} /> Blueprint Schema
                </button>
              </div>

              <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
                <div className="p-6 rounded-[1.5rem] bg-zinc-900/50 border border-white/5 flex gap-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                     <Info size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">
                      Mandatory Params
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Identifiers <code className="text-indigo-400">title</code> and{" "}
                      <code className="text-indigo-400">subject</code> must be present in row schemas.
                    </p>
                  </div>
                </div>
                <div className="p-6 rounded-[1.5rem] bg-zinc-900/50 border border-white/5 flex gap-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                     <AlertCircle size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">
                       Taxonomy Rules
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Difficulty must align with <code className="text-amber-500">easy</code>, <code className="text-amber-500">medium</code>, or <code className="text-amber-500">hard</code> tags.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="h-full flex flex-col items-center justify-center p-20 gap-6">
              <Loader2 size={64} className="text-indigo-500 animate-spin" />
              <div className="text-center">
                 <p className="text-xl font-black text-white uppercase tracking-widest animate-pulse">
                   Structural Analysis...
                 </p>
                 <p className="text-xs text-zinc-600 font-bold mt-2 uppercase tracking-widest">Verifying data integrity & row schemas</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* File Info Card */}
              <div className="flex items-center justify-between p-8 rounded-[2rem] bg-zinc-900/50 border border-white/10 shadow-inner">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight italic">{file.name}</h4>
                    <div className="flex items-center gap-4 mt-1.5">
                       <span className="text-xs font-bold text-zinc-500">{(file.size / 1024).toFixed(1)} KB TOTAL SIZE</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                       <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{preview.length} PAYLOAD RECORDS</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                  }}
                  className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/10 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
                >
                  Discard
                </button>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-zinc-900/80 rounded-[1.5rem] p-6 border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[40px] pointer-events-none" />
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Valid Units</p>
                  <p className="text-4xl font-black text-emerald-500 tabular-nums">{validCount}</p>
                </div>
                <div className="bg-zinc-900/80 rounded-[1.5rem] p-6 border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-[40px] pointer-events-none" />
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Faulty Lines</p>
                  <p className="text-4xl font-black text-rose-500 tabular-nums">{invalidCount}</p>
                </div>
                <div className="bg-zinc-900/80 rounded-[1.5rem] p-6 border border-white/5 relative overflow-hidden hidden lg:block">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Integrity Factor</p>
                  <p className="text-4xl font-black text-white tabular-nums">{Math.round((validCount / preview.length) * 100)}%</p>
                </div>
                <div className="bg-zinc-900/80 rounded-[1.5rem] p-6 border border-white/5 relative overflow-hidden hidden lg:block">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Total Load</p>
                  <p className="text-4xl font-black text-indigo-400 tabular-nums">{preview.length}</p>
                </div>
              </div>

              {/* Preview Table */}
              <div className="rounded-[2.5rem] border border-white/[0.08] bg-zinc-950 overflow-hidden shadow-inner">
                 <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2rem] text-zinc-500">Ingestion Preview</h5>
                    {invalidCount > 0 && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/10">
                        {invalidCount} Rows will be skipped
                      </span>
                    )}
                 </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-zinc-900 text-zinc-600 font-black uppercase tracking-widest border-b border-white/10 z-10">
                      <tr>
                        <th className="px-8 py-6">Health</th>
                        <th className="px-8 py-6">Question Identifier</th>
                        <th className="px-8 py-6">Branch</th>
                        <th className="px-8 py-6">Hierarchy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {preview.map((row, i) => (
                        <tr
                          key={i}
                          className={`transition-colors ${!row.isValid ? "bg-rose-500/[0.02] hover:bg-rose-500/[0.05]" : "hover:bg-white/[0.02]"}`}
                        >
                          <td className="px-8 py-5">
                            {row.isValid ? (
                              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 size={16} />
                              </div>
                            ) : (
                              <div className="group relative">
                                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 cursor-help">
                                  <AlertCircle size={16} />
                                </div>
                                <div className="absolute left-10 top-0 hidden group-hover:block z-50 bg-zinc-900 border border-white/10 p-5 rounded-[1.25rem] shadow-2xl w-64 pointer-events-none animate-in fade-in duration-200">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-3 ml-1">Logic Errors</p>
                                  <div className="space-y-2">
                                    {row.errors.map((e, ei) => (
                                      <div key={ei} className="text-[11px] text-zinc-300 font-medium leading-relaxed flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-zinc-700 mt-1.5" />
                                        {e}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-zinc-200 font-bold leading-relaxed line-clamp-1">{row.title}</p>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-indigo-400 font-black uppercase tracking-widest text-[10px]">{row.subject}</span>
                          </td>
                          <td className="px-8 py-5 capitalize">
                             <div className={`px-3 py-1 rounded-lg border w-fit text-[10px] font-black uppercase tracking-widest ${
                                row.difficulty === 'hard' || row.difficulty === 'difficult' 
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                                  : row.difficulty === 'medium'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                             }`}>
                                {row.difficulty}
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                         <Loader2 size={12} className="animate-spin" /> Transmission in Progress...
                      </span>
                      <span className="text-[10px] font-black text-indigo-400">{uploadProgress}%</span>
                   </div>
                   <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <div 
                         className="h-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 bg-[length:200%_100%] animate-shimmer rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                         style={{ width: `${uploadProgress}%` }}
                      />
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-10 pt-6 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2rem]">
            {preview.length > 0 &&
              `Awaiting Authorization for ${validCount} Operational Units`}
          </p>
          <div className="flex gap-6">
            <Button
              variant="secondary"
              onClick={onClose}
              className="h-14 px-10 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2rem] bg-zinc-900 border-white/5 text-zinc-500 hover:text-white transition-all shadow-lg"
            >
              Terminate
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || validCount === 0 || isUploading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white h-14 px-10 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2rem] shadow-[0_0_40px_rgba(79,70,229,0.2)] disabled:opacity-50 transition-all active:scale-95"
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} className="transition-transform group-hover:rotate-12" />
              )}
              {isUploading ? "Commencing Ingestion" : `Authorize Ingestion (${validCount})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
