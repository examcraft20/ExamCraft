"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Plus,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  Lock,
  Search,
  Layers,
  FileUp,
  Trash2,
} from "lucide-react";
import { Button, Card, Spinner } from "@examcraft/ui";
import { useRouter } from "next/navigation";
import { BulkImportModal } from "./bulk-import-modal";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";

interface Question {
  id: string;
  title: string;
  subject: string;
  bloomLevel: string;
  difficulty: string;
  tags: string[];
  status: string;
  createdAt: string;
}

interface QuestionListClientProps {
  initialQuestions: Question[];
  subjects: Array<{ id: string; name: string }>;
  accessToken?: string;
  institutionId?: string;
}

export function QuestionListClient({
  initialQuestions,
  subjects,
  accessToken,
  institutionId,
}: QuestionListClientProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    department: "All Departments",
    semester: "All Semesters",
    subject: "All Subjects",
  });

  const total = questions.length;
  const easy = questions.filter(
    (q) => q.difficulty === "Easy" || q.difficulty === "easy",
  ).length;
  const medium = questions.filter(
    (q) => q.difficulty === "Medium" || q.difficulty === "medium",
  ).length;
  const hard = questions.filter(
    (q) =>
      q.difficulty === "Hard" ||
      q.difficulty === "hard" ||
      q.difficulty === "Difficult",
  ).length;

  const assignedSubjects = Array.from(
    new Set(questions.map((q) => q.subject)),
  ).filter(Boolean);
  const assignedSubjectsText =
    assignedSubjects.length > 0 ? assignedSubjects.join(", ") : "None";

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const searchMatch =
        q.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        q.subject.toLowerCase().includes(filters.search.toLowerCase());

      const subjectMatch =
        filters.subject === "All Subjects" || q.subject === filters.subject;

      return searchMatch && subjectMatch;
    });
  }, [questions, filters]);

  const handleEdit = useCallback((id: string) => {
    window.location.href = `/dashboard/faculty/questions/${id}/edit`;
  }, []);

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this question?")) return;
    setIsDeleting(id);
    try {
      const session = await getSupabaseBrowserSession();
      if (!session?.access_token) {
        window.location.reload();
        return;
      }
      const instId =
        institutionId || localStorage.getItem("examcraft_institution_id");
      if (!instId) return;

      await apiRequest(`/content/questions/${id}`, {
        method: "DELETE",
        accessToken: session.access_token,
        institutionId: instId,
      });

      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Failed to archive question", err);
      alert("Failed to archive question");
    } finally {
      setIsDeleting(null);
    }
  };

  const getDifficultyColor = (diff: string) => {
    const d = diff.toLowerCase();
    if (d === "easy")
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        dot: "bg-emerald-400",
      };
    if (d === "medium")
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
        dot: "bg-amber-400",
      };
    return {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
      dot: "bg-red-400",
    };
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-20 mt-[-10px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-xs shadow-lg">
              <Layers size={16} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Manage Questions
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium mt-1">
            View and edit questions for your assigned subjects.{" "}
            <span className="text-white font-bold">({total} total)</span>
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-[#1e293b] border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          {accessToken && institutionId && (
            <button
              className="flex-1 md:flex-none px-4 py-2.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition-all"
              style={{
                background: "rgba(124,58,237,0.12)",
                borderColor: "rgba(124,58,237,0.3)",
                color: "#a78bfa",
              }}
              onClick={() => setShowBulkImport(true)}
            >
              <FileUp size={14} /> Bulk Import
            </button>
          )}
          <Button
            className="flex-1 md:flex-none bg-[#7c3aed] hover:bg-[#6d28d9] px-5 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 text-white border-0 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all"
            onClick={() => {
              window.location.href = `/dashboard/faculty/questions/new`;
            }}
          >
            <UploadCloud size={16} /> New Question
          </Button>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-bold w-full shadow-sm">
        <Lock size={14} className="shrink-0" />
        <span className="truncate">
          Showing questions for your assigned subjects only:{" "}
          {assignedSubjectsText}
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/[0.07] transition-all duration-200 flex flex-col justify-center gap-2 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 shrink-0 shadow-sm">
              <div className="w-5 h-5 rounded flex items-center justify-center bg-gradient-to-br from-indigo-400 via-blue-500 to-purple-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                Total Questions
              </span>
              <span className="text-3xl font-black text-white">{total}</span>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/[0.07] transition-all duration-200 flex flex-col justify-center gap-2 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 shrink-0">
              <div className="w-5 h-5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                Easy
              </span>
              <span className="text-3xl font-black text-white">{easy}</span>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/[0.07] transition-all duration-200 flex flex-col justify-center gap-2 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 shrink-0">
              <div className="w-5 h-5 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                Medium
              </span>
              <span className="text-3xl font-black text-white">{medium}</span>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/[0.07] transition-all duration-200 flex flex-col justify-center gap-2 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 shrink-0">
              <div className="w-5 h-5 rounded-full bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.5)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                Difficult
              </span>
              <span className="text-3xl font-black text-white">{hard}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex flex-col w-full rounded-2xl bg-[#1e293b]/80 border border-slate-700/50 shadow-xl overflow-hidden mt-2 flex-1">
        {/* Filters Top Bar */}
        <div className="flex flex-col md:flex-row items-center p-4 border-b border-white/5 gap-4 bg-[#1e293b]">
          <div className="flex items-center gap-4 w-full flex-wrap">
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters((f) => ({ ...f, department: e.target.value }))
              }
              className="h-10 px-3 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-sm font-medium focus:outline-none focus:border-indigo-500/50 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <option>All Departments</option>
              <option>Computer Science Engineering</option>
              <option>Computer Science</option>
            </select>

            <select
              value={filters.semester}
              onChange={(e) =>
                setFilters((f) => ({ ...f, semester: e.target.value }))
              }
              className="h-10 px-3 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-sm font-medium focus:outline-none focus:border-indigo-500/50 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <option>All Semesters</option>
              <option>Semester 1</option>
              <option>Semester 2</option>
              <option>Semester 4</option>
            </select>

            <select
              value={filters.subject}
              onChange={(e) =>
                setFilters((f) => ({ ...f, subject: e.target.value }))
              }
              className="h-10 px-3 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-sm font-medium focus:outline-none focus:border-indigo-500/50 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <option>All Subjects</option>
              {assignedSubjects.map((sub) => (
                <option key={sub}>{sub}</option>
              ))}
            </select>

            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <Search
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>

          <div className="shrink-0 text-xs font-bold text-slate-500 font-mono hidden lg:block">
            {filteredQuestions.length} of {total}
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/50 text-[#8e9cba] text-[10px] font-black uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4 min-w-[300px]">Question</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Dept</th>
                <th className="px-6 py-4 text-center">Sem</th>
                <th className="px-6 py-4 text-center">Marks</th>
                <th className="px-6 py-4 text-center">Level</th>
                <th className="px-6 py-4 text-center">CO</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 bg-[#1e293b]">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                      <AlertCircle size={32} className="opacity-50" />
                      <p className="font-bold">No questions found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q, i) => {
                  const diffColor = getDifficultyColor(q.difficulty);
                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-6 py-5 text-slate-600 text-xs font-mono text-center">
                        {i + 1}
                      </td>
                      <td className="px-6 py-5 whitespace-normal">
                        <p className="line-clamp-2 text-sm font-medium text-slate-200 leading-relaxed pr-8 max-w-lg">
                          {q.title}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-indigo-400 font-bold text-sm tracking-tight">
                          {q.subject}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-400 text-xs">CSE</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-slate-400 text-xs">4</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-bold text-white">8</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${diffColor.bg} ${diffColor.border} ${diffColor.text} text-[10px] font-black uppercase tracking-widest`}
                        >
                          {q.difficulty}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-slate-600 font-black">—</span>
                      </td>
                      <td className="px-6 py-5 text-right w-[150px]">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-white transition-colors"
                            onClick={() => handleEdit(q.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 px-0 flex items-center justify-center border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-white transition-colors"
                            onClick={() => handleArchive(q.id)}
                            disabled={isDeleting === q.id}
                          >
                            {isDeleting === q.id ? (
                              <div className="w-3 h-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showBulkImport && accessToken && institutionId && (
        <BulkImportModal
          accessToken={accessToken}
          institutionId={institutionId}
          onClose={() => setShowBulkImport(false)}
          onSuccess={(count) => {
            setShowBulkImport(false);
            // Brief delay then reload so Supabase propagates the new rows
            setTimeout(() => window.location.reload(), 800);
          }}
        />
      )}
    </div>
  );
}
