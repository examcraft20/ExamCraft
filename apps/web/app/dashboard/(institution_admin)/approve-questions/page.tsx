"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { getSupabaseBrowserSession } from "../../../../lib/supabase-browser";
import { apiRequest } from "#api";
import { useAdminContext } from "../../../../hooks/use-admin-context";
import { Spinner } from "@examcraft/ui";

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
  reviewComment?: string;
};

export default function ApproveQuestionsPage() {
  const { accessToken, institutionId, isReady } = useAdminContext();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState<Record<string, string>>(
    {},
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDept, setFilterDept] = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (!accessToken || !institutionId) {
      setIsLoading(false);
      return;
    }
    let mounted = true;
    setIsLoading(true);
    apiRequest<Question[]>("/content/questions", {
      method: "GET",
      accessToken,
      institutionId,
    })
      .then((data) => {
        if (mounted) setQuestions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setQuestions([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [accessToken, institutionId, isReady]);

  const refresh = () => {
    if (!accessToken || !institutionId) return;
    setIsLoading(true);
    apiRequest<Question[]>("/content/questions", {
      method: "GET",
      accessToken,
      institutionId,
    })
      .then((data) => setQuestions(Array.isArray(data) ? data : []))
      .catch(() => setQuestions([]))
      .finally(() => setIsLoading(false));
  };

  const handleReview = async (
    questionId: string,
    action: "approve" | "reject",
  ) => {
    if (!accessToken || !institutionId) return;
    setActionLoadingId(questionId);
    try {
      await apiRequest<Question>(`/content/questions/${questionId}/review`, {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({
          action,
          comment: reviewComments[questionId] || "",
        }),
      });
      refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const statusMap = {
    pending: ["draft", "pending"],
    approved: ["ready", "approved"],
    rejected: ["rejected"],
  };
  const allSubjects = [
    ...new Set(questions.map((q) => q.subject).filter(Boolean)),
  ];
  const allDepts = [
    ...new Set(questions.map((q) => q.departmentId).filter(Boolean)),
  ] as string[];

  const filtered = useMemo(() => {
    const statuses = statusMap[activeTab];
    return questions.filter((q) => {
      const matchStatus = statuses.some((s) =>
        q.status?.toLowerCase().includes(s),
      );
      const matchSubj = !filterSubject || q.subject === filterSubject;
      const matchDept = !filterDept || q.departmentId === filterDept;
      return matchStatus && matchSubj && matchDept;
    });
  }, [questions, activeTab, filterSubject, filterDept]);

  const counts = {
    pending: questions.filter((q) =>
      statusMap.pending.some((s) => q.status?.toLowerCase().includes(s)),
    ).length,
    approved: questions.filter((q) =>
      statusMap.approved.some((s) => q.status?.toLowerCase().includes(s)),
    ).length,
    rejected: questions.filter((q) =>
      q.status?.toLowerCase().includes("rejected"),
    ).length,
  };

  const diffColor = (d: string) =>
    d === "hard" || d === "difficult"
      ? "bg-red-500/20 text-red-400"
      : d === "easy"
        ? "bg-green-500/20 text-green-400"
        : "bg-yellow-500/20 text-yellow-400";

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
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <CheckSquare size={20} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Approve Questions
            </h1>
          </div>
          <p className="text-[#8b9bb4] text-sm font-medium mt-1">
            Review faculty submissions before they enter the question bank.
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e293b] border border-white/10 text-sm font-bold text-[#8b9bb4] hover:text-white hover:border-white/20 transition-all"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {(["pending", "approved", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2.5 px-6 py-2 rounded-full text-sm font-bold transition-all capitalize ${
              activeTab === tab
                ? tab === "approved"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : tab === "rejected"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-[#544bc3] text-white"
                : "bg-[#1e293b] text-[#8b9bb4] border border-white/5 hover:text-white"
            }`}
          >
            {tab} <span className="text-[11px] font-black">{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="bg-[#1e293b] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Departments</option>
          {allDepts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="bg-[#1e293b] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Subjects</option>
          {allSubjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="ml-auto text-sm text-[#8b9bb4] self-center font-medium">
          {filtered.length} questions
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-[#1e293b] border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-20">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="text-5xl">🎉</div>
            <p className="text-[#8b9bb4] font-medium">
              {activeTab === "pending"
                ? "All caught up! No pending questions."
                : `No ${activeTab} questions found.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((q) => (
              <div
                key={q.id}
                className="p-5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-2">
                      {q.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                        {q.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${diffColor(q.difficulty)}`}
                      >
                        {q.difficulty}
                      </span>
                      {q.bloomLevel && (
                        <span className="text-[10px] text-[#8b9bb4] font-medium">
                          {q.bloomLevel}
                        </span>
                      )}
                      {q.unitNumber && (
                        <span className="text-[10px] text-[#8b9bb4]">
                          Unit {q.unitNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {activeTab === "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === q.id ? null : q.id)
                        }
                        className="p-2 rounded-lg hover:bg-white/5 text-[#8b9bb4] hover:text-white transition-colors"
                        title="Add comment"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button
                        disabled={actionLoadingId === q.id}
                        onClick={() => handleReview(q.id, "reject")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >
                        {actionLoadingId === q.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <XCircle size={14} />
                        )}{" "}
                        Reject
                      </button>
                      <button
                        disabled={actionLoadingId === q.id}
                        onClick={() => handleReview(q.id, "approve")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all disabled:opacity-50"
                      >
                        {actionLoadingId === q.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <CheckCircle size={14} />
                        )}{" "}
                        Approve
                      </button>
                    </div>
                  )}
                  {activeTab !== "pending" && (
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full shrink-0 ${
                        activeTab === "approved"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      } capitalize`}
                    >
                      {q.status}
                    </span>
                  )}
                </div>

                {expandedId === q.id && activeTab === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={reviewComments[q.id] || ""}
                      onChange={(e) =>
                        setReviewComments({
                          ...reviewComments,
                          [q.id]: e.target.value,
                        })
                      }
                      placeholder="Optional review comment..."
                      className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {q.reviewComment && (
                  <p className="mt-2 text-xs text-[#8b9bb4] italic">
                    &ldquo;{q.reviewComment}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
