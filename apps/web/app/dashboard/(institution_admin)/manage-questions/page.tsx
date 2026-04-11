"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Layers, Search, RefreshCw, Trash2, Edit2, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { getSupabaseBrowserSession } from "../../../../lib/supabase-browser";
import { apiRequest } from "#api";
import { useInstitution } from "../../../../hooks/use-institution";
import { Spinner } from "@examcraft/ui";
import type { DepartmentRecord, CourseRecord, SubjectRecord } from "../../../../lib/academic";

import { useAdminContext } from "../../../../hooks/use-admin-context";
import { BulkImportModal } from "../../../../components/dashboard/shared/BulkImportModal";

type Question = {
  id: string;
  title: string;
  subject: string;
  bloomLevel: string;
  difficulty: string;
  tags: string[];
  courseOutcomes?: string[];
  unitNumber?: number | null;
  departmentId?: string | null;
  courseId?: string | null;
  status: string;
  createdAt: string;
  marks?: number;
};

export default function ManageQuestionsPage() {
  const { accessToken, institutionId, isReady } = useAdminContext();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const load = (token: string, instId: string) => {
    setIsLoading(true);
    Promise.all([
      apiRequest<Question[]>("/content/questions", { method: "GET", accessToken: token, institutionId: instId }),
      apiRequest<{ departments: DepartmentRecord[] }>("/academic/departments", { method: "GET", accessToken: token, institutionId: instId }),
      apiRequest<{ subjects: SubjectRecord[] }>("/academic/subjects", { method: "GET", accessToken: token, institutionId: instId }),
    ])
      .then(([q, d, s]) => {
        setQuestions(Array.isArray(q) ? q : []);
        setDepartments(d?.departments || []);
        setSubjects(s?.subjects || []);
      })
      .catch(() => setQuestions([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!isReady) return;
    if (!accessToken || !institutionId) {
      setIsLoading(false);
      return;
    }
    load(accessToken, institutionId);
  }, [accessToken, institutionId, isReady]);

  const handleDelete = async (questionId: string) => {
    if (!accessToken || !institutionId || !confirm("Are you sure you want to delete this question?")) return;
    setDeletingId(questionId);
    try {
      await apiRequest(`/content/questions/${questionId}`, { method: "DELETE", accessToken, institutionId });
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const needle = searchQuery.toLowerCase();
    return questions.filter((q) => {
      const matchSearch = !needle || [q.title, q.subject, q.bloomLevel].join(" ").toLowerCase().includes(needle);
      const matchDept = !filterDept || q.departmentId === filterDept;
      const matchSubj = !filterSubject || q.subject === filterSubject;
      const matchDiff = !filterDifficulty || q.difficulty === filterDifficulty;
      return matchSearch && matchDept && matchSubj && matchDiff;
    });
  }, [questions, searchQuery, filterDept, filterSubject, filterDifficulty]);

  const stats = {
    total: questions.length,
    easy: questions.filter((q) => q.difficulty === "easy").length,
    medium: questions.filter((q) => q.difficulty === "medium").length,
    difficult: questions.filter((q) => q.difficulty === "hard" || q.difficulty === "difficult").length,
  };

  const diffColor = (d: string) =>
    d === "hard" || d === "difficult"
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : d === "easy"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";

  const allSubjects = [...new Set(questions.map((q) => q.subject).filter(Boolean))];

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers size={20} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Manage Questions</h1>
          </div>
          <p className="text-[#8b9bb4] text-sm font-medium mt-1">
            View, edit or delete questions from the question bank.{" "}
            <span className="text-indigo-400 font-bold">({stats.total} total)</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Upload size={14} /> Bulk Import
          </button>
          <button
            onClick={() => accessToken && institutionId && load(accessToken, institutionId)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e293b] border border-white/10 text-sm font-bold text-[#8b9bb4] hover:text-white transition-all"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => { if (confirm("Remove ALL questions? This cannot be undone.")) { /* bulk delete */ } }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={14} /> Remove All
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Questions", value: stats.total, icon: "📝", color: "text-[#818cf8]" },
          { label: "Easy", value: stats.easy, icon: "🟢", color: "text-green-400" },
          { label: "Medium", value: stats.medium, icon: "🟡", color: "text-yellow-400" },
          { label: "Difficult", value: stats.difficult, icon: "🔴", color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1e293b] rounded-2xl p-6 flex flex-col gap-2 shadow-lg">
            <span className="text-[10px] text-[#8b9bb4] font-bold uppercase tracking-widest flex items-center justify-between">
              {s.label} <span className="text-lg">{s.icon}</span>
            </span>
            <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-[#1e293b] p-3 rounded-2xl">
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-[#2D3748] border-none rounded-xl px-4 py-2.5 text-sm text-[#cbd5e1] focus:outline-none min-w-[160px]">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="bg-[#2D3748] border-none rounded-xl px-4 py-2.5 text-sm text-[#cbd5e1] focus:outline-none min-w-[140px]">
          <option value="">All Subjects</option>
          {allSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="bg-[#2D3748] border-none rounded-xl px-4 py-2.5 text-sm text-[#cbd5e1] focus:outline-none">
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb4]" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2D3748] border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none"
          />
        </div>
        <div className="self-center text-xs text-[#8b9bb4] font-bold whitespace-nowrap px-2">{filtered.length} of {stats.total}</div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#1e293b] border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-20"><Spinner /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2D3748] text-[10px] uppercase font-black tracking-widest text-[#8b9bb4]">
              <tr>
                <th className="px-5 py-4 w-8">#</th>
                <th className="px-5 py-4">Question</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Dept</th>
                <th className="px-5 py-4">Sem</th>
                <th className="px-5 py-4">Marks</th>
                <th className="px-5 py-4">Level</th>
                <th className="px-5 py-4">CO</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((q, i) => (
                <tr key={q.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5 text-[#8b9bb4] text-xs">{i + 1}</td>
                  <td className="px-5 py-3.5 max-w-sm">
                    <p className="text-white font-medium text-[13px] line-clamp-2 leading-snug">{q.title}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold text-indigo-400">{q.subject}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#8b9bb4]">
                    {departments.find((d) => d.id === q.departmentId)?.name || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#8b9bb4]">{q.unitNumber ? `Unit ${q.unitNumber}` : "—"}</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-[#cbd5e1]">{q.marks ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded border capitalize ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#8b9bb4]">{q.courseOutcomes?.join(", ") || "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#2D3748] text-[#818cf8] border border-white/5 hover:border-indigo-500/30 transition-all">
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        disabled={deletingId === q.id}
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >
                        {deletingId === q.id ? <Spinner size="sm" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-[#8b9bb4]">No questions match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => accessToken && institutionId && load(accessToken, institutionId)}
        accessToken={accessToken}
        institutionId={institutionId ?? ""}
      />
    </div>
  );
}
