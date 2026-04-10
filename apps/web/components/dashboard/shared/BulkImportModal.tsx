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
} from "lucide-react";
import { Button, Spinner } from "@examcraft/ui";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { apiRequest } from "#api";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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
    } else {
      toast.error("Unsupported file format. Please use CSV or XLSX.");
      setFile(null);
      setIsProcessing(false);
    }
  };

  const validateAndSetPreview = (data: any[]) => {
    const validatedData = data.map((row): PreviewRow => {
      const errors: string[] = [];

      const title = row.title || row.Question || row.text || "";
      const subject = row.subject || row.Subject || "";
      const difficulty = (
        row.difficulty ||
        row.Difficulty ||
        "medium"
      ).toLowerCase();
      const bloomLevel = row.bloom_level || row.BloomLevel || "Understand";

      if (!title) errors.push("Missing question title");
      if (!subject) errors.push("Missing subject");

      const validDiffs = ["easy", "medium", "hard", "difficult"];
      if (!validDiffs.includes(difficulty)) {
        errors.push(`Invalid difficulty: ${difficulty}`);
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
      toast.error("No valid rows to import.");
      return;
    }

    setIsUploading(true);
    try {
      const formattedQuestions = validRows.map((r) => ({
        title: r.title,
        subject: r.subject,
        difficulty: r.difficulty === "difficult" ? "hard" : r.difficulty,
        bloomLevel: r.bloomLevel,
        marks: r.marks,
        unitNumber: r.unitNumber,
        tags: r.tags ? r.tags.split(",").map((s) => s.trim()) : [],
        courseOutcomes: r.courseOutcomes
          ? r.courseOutcomes.split(",").map((s) => s.trim())
          : [],
        status: "draft",
      }));

      await apiRequest("/content/questions/bulk", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({ questions: formattedQuestions }),
      });

      toast.success(
        `Successfully imported ${formattedQuestions.length} questions.`,
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import questions.",
      );
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
        "What is the capital of France?",
        "General Knowledge",
        "easy",
        "Remember",
        "2",
        "1",
        "geography, europe",
        "CO1",
      ],
      [
        "Explain the process of photosynthesis.",
        "Biology",
        "medium",
        "Understand",
        "5",
        "2",
        "plants, science",
        "CO2",
      ],
    ];
    const csvContent = template.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "examcraft_bulk_import_template.csv");
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
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Upload size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Bulk Import Questions
              </h2>
              <p className="text-[#8b9bb4] text-sm font-medium">
                Upload CSV or XLSX to populate your question bank
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-xl hover:bg-white/5 text-[#8b9bb4] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {!file ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2rem] p-12 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform mb-6">
                <FileSpreadsheet size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Drag and drop your file here
              </h3>
              <p className="text-[#8b9bb4] text-center max-w-sm mb-8">
                Supported formats:{" "}
                <strong className="text-white">.csv, .xlsx, .xls</strong>. Max
                size 10MB.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv, .xlsx, .xls"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20"
                >
                  Choose File
                </Button>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-[#8b9bb4] hover:text-white transition-all"
                >
                  <Download size={16} /> Download Template
                </button>
              </div>

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                <div className="p-4 rounded-2xl bg-[#1e293b]/50 border border-white/5 flex gap-3">
                  <Info size={18} className="text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                      Requirements
                    </p>
                    <p className="text-[11px] text-[#8b9bb4] leading-relaxed">
                      Columns <code className="text-indigo-300">title</code> and{" "}
                      <code className="text-indigo-300">subject</code> are
                      mandatory.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#1e293b]/50 border border-white/5 flex gap-3">
                  <AlertCircle size={18} className="text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                      Formats
                    </p>
                    <p className="text-[11px] text-[#8b9bb4] leading-relaxed">
                      Difficulty should be easy, medium, or hard. Tags should be
                      comma-separated.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="h-full flex flex-col items-center justify-center p-20">
              <Spinner size="lg" className="mb-6 w-12 h-12" />
              <p className="text-white font-bold animate-pulse">
                Analyzing Spreadsheet Structure...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* File Info Card */}
              <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{file.name}</h4>
                    <p className="text-xs text-[#8b9bb4]">
                      {(file.size / 1024).toFixed(1)} KB • {preview.length} rows
                      detected
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                  }}
                  className="text-xs font-bold text-red-400 hover:text-red-300 px-4 py-2"
                >
                  Remove File
                </button>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#1e293b] rounded-2xl p-5 border border-white/5 shadow-xl">
                  <p className="text-[10px] font-black text-[#8b9bb4] uppercase tracking-widest mb-1">
                    Valid Rows
                  </p>
                  <p className="text-3xl font-black text-emerald-400">
                    {validCount}
                  </p>
                </div>
                <div className="bg-[#1e293b] rounded-2xl p-5 border border-white/5 shadow-xl">
                  <p className="text-[10px] font-black text-[#8b9bb4] uppercase tracking-widest mb-1">
                    Issues Found
                  </p>
                  <p className="text-3xl font-black text-amber-400">
                    {invalidCount}
                  </p>
                </div>
                <div className="bg-[#1e293b] rounded-2xl p-5 border border-white/5 shadow-xl">
                  <p className="text-[10px] font-black text-[#8b9bb4] uppercase tracking-widest mb-1">
                    Total Items
                  </p>
                  <p className="text-3xl font-black text-white">
                    {preview.length}
                  </p>
                </div>
              </div>

              {/* Preview Table */}
              <div className="rounded-[1.5rem] border border-white/5 bg-black/20 overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-[#1e293b] text-[#8b9bb4] font-black uppercase tracking-widest border-b border-white/5">
                      <tr>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Question</th>
                        <th className="px-5 py-4">Subject</th>
                        <th className="px-5 py-4">Difficulty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {preview.map((row, i) => (
                        <tr
                          key={i}
                          className={`hover:bg-white/[0.02] ${!row.isValid ? "bg-amber-500/5" : ""}`}
                        >
                          <td className="px-5 py-3">
                            {row.isValid ? (
                              <CheckCircle2
                                size={16}
                                className="text-emerald-500"
                              />
                            ) : (
                              <div className="group relative">
                                <AlertTriangle
                                  size={16}
                                  className="text-amber-500"
                                />
                                <div className="absolute left-6 top-0 hidden group-hover:block z-50 bg-[#0f172a] border border-white/10 p-2 rounded-lg shadow-2xl w-48 font-medium text-amber-200">
                                  {row.errors.map((e, ei) => (
                                    <div key={ei} className="mb-1">
                                      • {e}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 text-[#cbd5e1] font-medium max-w-[200px] truncate">
                            {row.title}
                          </td>
                          <td className="px-5 py-3 text-indigo-400 font-bold">
                            {row.subject}
                          </td>
                          <td className="px-5 py-3 text-[#8b9bb4] capitalize">
                            {row.difficulty || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-4 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
          <p className="text-xs text-[#8b9bb4] font-medium">
            {preview.length > 0 &&
              `${validCount} questions ready for ingestion`}
          </p>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || validCount === 0 || isUploading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-3 rounded-xl font-bold shadow-xl shadow-indigo-500/20 disabled:opacity-50"
            >
              {isUploading ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Sparkles size={16} className="mr-2" />
              )}
              Import {validCount > 0 ? validCount : ""} Questions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
