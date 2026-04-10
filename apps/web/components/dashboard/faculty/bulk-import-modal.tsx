"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Table2,
  Download,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ParsedRow {
  title: string;
  subject: string;
  bloom_level: string;
  difficulty: string;
  tags: string;
  unit_number: string;
  // runtime validation
  _errors: string[];
  _rowIndex: number;
}

interface BulkImportModalProps {
  accessToken: string;
  institutionId: string;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

// ── Validation ─────────────────────────────────────────────────────────────────
const REQUIRED_COLUMNS = ["title", "subject", "bloom_level", "difficulty"];
const VALID_BLOOM = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const VALID_DIFFICULTY = ["Easy", "Medium", "Hard"];

function normaliseHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

function validateRow(raw: Record<string, string>, index: number): ParsedRow {
  const errors: string[] = [];

  const title = (raw["title"] || "").trim();
  const subject = (raw["subject"] || "").trim();
  const bloom = (raw["bloom_level"] || "").trim();
  const difficulty = (raw["difficulty"] || "").trim();
  const tags = (raw["tags"] || "").trim();
  const unit = (raw["unit_number"] || "").trim();

  if (!title) errors.push("title is required");
  if (!subject) errors.push("subject is required");
  if (!bloom) errors.push("bloom_level is required");
  else if (!VALID_BLOOM.map((b) => b.toLowerCase()).includes(bloom.toLowerCase()))
    errors.push(`bloom_level must be one of: ${VALID_BLOOM.join(", ")}`);
  if (!difficulty) errors.push("difficulty is required");
  else if (!VALID_DIFFICULTY.map((d) => d.toLowerCase()).includes(difficulty.toLowerCase()))
    errors.push(`difficulty must be one of: ${VALID_DIFFICULTY.join(", ")}`);

  return {
    title,
    subject,
    bloom_level: bloom,
    difficulty,
    tags,
    unit_number: unit,
    _errors: errors,
    _rowIndex: index,
  };
}

// ── CSV Template download ──────────────────────────────────────────────────────
function downloadTemplate() {
  const csv =
    "title,subject,bloom_level,difficulty,tags,unit_number\n" +
    '"Explain the concept of recursion","Data Structures","Understand","Medium","recursion,algorithms",2\n' +
    '"Define Big-O notation","Algorithms","Remember","Easy","complexity",1\n';
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "examcraft_bulk_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ──────────────────────────────────────────────────────────────────
export function BulkImportModal({
  accessToken,
  institutionId,
  onClose,
  onSuccess,
}: BulkImportModalProps) {
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const errorRows = rows.filter((r) => r._errors.length > 0);
  const validRows = rows.filter((r) => r._errors.length === 0);

  // ── File parsing ─────────────────────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "xlsx" || ext === "xls") {
      // Lazy-load xlsx
      try {
        const XLSX = await import("xlsx");
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
        // Normalise keys
        const normalised = raw.map((r) =>
          Object.fromEntries(Object.entries(r).map(([k, v]) => [normaliseHeader(k), String(v)]))
        );
        const parsed = normalised.map((r, i) => validateRow(r, i + 1));
        setRows(parsed);
        setStep("preview");
      } catch {
        toast.error("Failed to parse Excel file. Please use CSV or a valid .xlsx file.");
      }
    } else {
      // CSV via papaparse
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: normaliseHeader,
        complete: ({ data }) => {
          const parsed = data.map((r, i) => validateRow(r, i + 1));
          setRows(parsed);
          setStep("preview");
        },
        error: () => {
          toast.error("Failed to parse CSV file.");
        },
      });
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (validRows.length === 0) return;
    setIsSubmitting(true);

    const payload = validRows.map((r) => ({
      title: r.title,
      subject: r.subject,
      bloomLevel: r.bloom_level.charAt(0).toUpperCase() + r.bloom_level.slice(1),
      difficulty: r.difficulty.charAt(0).toUpperCase() + r.difficulty.slice(1),
      tags: r.tags ? r.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      unitNumber: r.unit_number ? parseInt(r.unit_number, 10) || null : null,
    }));

    try {
      const { productionApiRequest } = await import("../../../lib/api/production");
      await productionApiRequest("/content/questions/bulk", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({ questions: payload }),
      });
      setResult({ success: validRows.length, errors: errorRows.length });
      setStep("result");
      toast.success(`✅ ${validRows.length} questions imported successfully!`);
      onSuccess?.(validRows.length);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk import failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Rendering ────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl flex flex-col"
        style={{
          background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)",
          border: "1px solid rgba(139,92,246,0.25)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b shrink-0"
          style={{ borderColor: "rgba(139,92,246,0.15)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
            >
              <Upload size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg tracking-tight">Bulk Import Questions</h2>
              <p className="text-xs" style={{ color: "rgba(148,163,184,0.8)" }}>
                Upload CSV or Excel — up to 500 rows at once
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
          >
            <X size={16} style={{ color: "#94a3b8" }} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 px-6 pt-4 shrink-0">
          {(["upload", "preview", "result"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all"
                style={{
                  background:
                    step === s
                      ? "rgba(124,58,237,0.25)"
                      : i < ["upload", "preview", "result"].indexOf(step)
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(255,255,255,0.05)",
                  color:
                    step === s
                      ? "#a78bfa"
                      : i < ["upload", "preview", "result"].indexOf(step)
                      ? "#4ade80"
                      : "#475569",
                  border: `1px solid ${
                    step === s
                      ? "rgba(124,58,237,0.4)"
                      : i < ["upload", "preview", "result"].indexOf(step)
                      ? "rgba(34,197,94,0.3)"
                      : "rgba(255,255,255,0.06)"
                  }`,
                }}
              >
                {i < ["upload", "preview", "result"].indexOf(step) && (
                  <CheckCircle2 size={10} />
                )}
                {s}
              </div>
              {i < 2 && <ChevronRight size={12} style={{ color: "#334155" }} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ─── Step 1: Upload ─── */}
          {step === "upload" && (
            <div className="flex flex-col gap-5">
              {/* Template download */}
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 self-start text-xs font-semibold px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                <Download size={13} /> Download CSV Template
              </button>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4 rounded-2xl cursor-pointer transition-all duration-200 py-16"
                style={{
                  border: `2px dashed ${isDragging ? "#7c3aed" : "rgba(139,92,246,0.25)"}`,
                  background: isDragging
                    ? "rgba(124,58,237,0.08)"
                    : "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(79,70,229,0.2))",
                    border: "1px solid rgba(139,92,246,0.3)",
                  }}
                >
                  <FileText size={28} style={{ color: "#a78bfa" }} />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">
                    Drag & drop your file here
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                    or click to browse — .csv, .xlsx, .xls supported
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Column guide */}
              <div
                className="rounded-xl p-4 text-xs"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Table2 size={13} /> Expected columns
                </p>
                <div className="flex flex-wrap gap-2">
                  {["title*", "subject*", "bloom_level*", "difficulty*", "tags", "unit_number"].map((col) => (
                    <span
                      key={col}
                      className="px-2 py-0.5 rounded font-mono"
                      style={{
                        background: col.endsWith("*") ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)",
                        color: col.endsWith("*") ? "#a78bfa" : "#64748b",
                        border: `1px solid ${col.endsWith("*") ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      {col}
                    </span>
                  ))}
                </div>
                <p className="mt-2" style={{ color: "#475569" }}>
                  * required &nbsp;|&nbsp; bloom_level: Remember, Understand, Apply, Analyze, Evaluate, Create &nbsp;|&nbsp; difficulty: Easy, Medium, Hard
                </p>
              </div>
            </div>
          )}

          {/* ─── Step 2: Preview ─── */}
          {step === "preview" && (
            <div className="flex flex-col gap-4">
              {/* Summary bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  <CheckCircle2 size={12} /> {validRows.length} valid
                </div>
                {errorRows.length > 0 && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <AlertCircle size={12} /> {errorRows.length} with errors (will be skipped)
                  </div>
                )}
                <span className="text-xs ml-auto" style={{ color: "#475569" }}>
                  {fileName}
                </span>
              </div>

              {/* Preview table */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead
                      className="sticky top-0"
                      style={{ background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <tr>
                        <th className="px-3 py-3 text-left font-bold uppercase tracking-widest" style={{ color: "#475569", width: 40 }}>#</th>
                        <th className="px-3 py-3 text-left font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Title</th>
                        <th className="px-3 py-3 text-left font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Subject</th>
                        <th className="px-3 py-3 text-left font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Bloom</th>
                        <th className="px-3 py-3 text-left font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Difficulty</th>
                        <th className="px-3 py-3 text-left font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Unit</th>
                        <th className="px-3 py-3 text-left font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody style={{ background: "rgba(255,255,255,0.015)" }}>
                      {rows.map((row) => {
                        const hasError = row._errors.length > 0;
                        return (
                          <tr
                            key={row._rowIndex}
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.04)",
                              background: hasError ? "rgba(239,68,68,0.04)" : undefined,
                            }}
                          >
                            <td className="px-3 py-2.5 font-mono" style={{ color: "#334155" }}>{row._rowIndex}</td>
                            <td className="px-3 py-2.5 max-w-[240px]">
                              <span
                                className="line-clamp-1"
                                style={{ color: hasError ? "#f87171" : "#e2e8f0" }}
                              >
                                {row.title || <em style={{ color: "#ef4444" }}>missing</em>}
                              </span>
                            </td>
                            <td className="px-3 py-2.5" style={{ color: "#818cf8" }}>{row.subject || "—"}</td>
                            <td className="px-3 py-2.5" style={{ color: "#94a3b8" }}>{row.bloom_level || "—"}</td>
                            <td className="px-3 py-2.5">
                              <span
                                className="px-2 py-0.5 rounded-full font-bold"
                                style={{
                                  fontSize: 10,
                                  background:
                                    row.difficulty.toLowerCase() === "easy"
                                      ? "rgba(34,197,94,0.12)"
                                      : row.difficulty.toLowerCase() === "medium"
                                      ? "rgba(245,158,11,0.12)"
                                      : "rgba(239,68,68,0.12)",
                                  color:
                                    row.difficulty.toLowerCase() === "easy"
                                      ? "#4ade80"
                                      : row.difficulty.toLowerCase() === "medium"
                                      ? "#fbbf24"
                                      : "#f87171",
                                }}
                              >
                                {row.difficulty || "—"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5" style={{ color: "#475569" }}>{row.unit_number || "—"}</td>
                            <td className="px-3 py-2.5">
                              {hasError ? (
                                <span
                                  className="flex items-center gap-1 text-[10px] font-bold"
                                  title={row._errors.join("; ")}
                                  style={{ color: "#f87171" }}
                                >
                                  <AlertCircle size={10} /> {row._errors[0]}
                                  {row._errors.length > 1 && ` +${row._errors.length - 1}`}
                                </span>
                              ) : (
                                <span
                                  className="flex items-center gap-1 text-[10px] font-bold"
                                  style={{ color: "#4ade80" }}
                                >
                                  <CheckCircle2 size={10} /> OK
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 3: Result ─── */}
          {step === "result" && result && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,rgba(34,197,94,0.2),rgba(16,185,129,0.2))",
                  border: "2px solid rgba(34,197,94,0.4)",
                  boxShadow: "0 0 40px rgba(34,197,94,0.2)",
                }}
              >
                <CheckCircle2 size={36} style={{ color: "#4ade80" }} />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-white">{result.success} Questions Imported</p>
                <p className="text-sm mt-2" style={{ color: "#64748b" }}>
                  {result.errors > 0
                    ? `${result.errors} rows were skipped due to validation errors.`
                    : "All rows imported successfully."}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep("upload"); setRows([]); setFileName(null); setResult(null); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}
                >
                  Import More
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    boxShadow: "0 0 20px rgba(124,58,237,0.3)",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {step === "preview" && (
          <div
            className="flex items-center justify-between px-6 py-4 border-t shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.25)" }}
          >
            <button
              onClick={() => { setStep("upload"); setRows([]); setFileName(null); }}
              className="text-sm font-semibold transition-colors hover:text-white"
              style={{ color: "#64748b" }}
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "#475569" }}>
                {validRows.length} row{validRows.length !== 1 ? "s" : ""} will be submitted
              </span>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting || validRows.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  boxShadow: "0 0 20px rgba(124,58,237,0.3)",
                }}
              >
                {isSubmitting ? (
                  <><Loader2 size={14} className="animate-spin" /> Importing…</>
                ) : (
                  <><Upload size={14} /> Confirm Import</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
