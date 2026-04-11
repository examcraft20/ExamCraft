"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, CheckCircle, XCircle, RefreshCw, Eye } from "lucide-react";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { apiRequest } from "#api";
import { useInstitution } from "@/hooks/use-institution";
import { Spinner } from "@examcraft/ui";
import type { PaperRecord } from "@/lib/dashboard";

import { useAdminContext } from "@/hooks/use-admin-context";

export default function ApprovePapersPage() {
  const { accessToken, institutionId, isReady } = useAdminContext();

  const [papers, setPapers] = useState<PaperRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const load = (token: string, instId: string) => {
    setIsLoading(true);
    apiRequest<PaperRecord[]>("/papers", { method: "GET", accessToken: token, institutionId: instId })
      .then((data) => setPapers(Array.isArray(data) ? data : []))
      .catch(() => setPapers([]))
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

  const handleReview = async (paperId: string, action: "approve" | "reject") => {
    if (!accessToken || !institutionId) return;
    setActionLoadingId(paperId);
    try {
      await apiRequest<PaperRecord>(`/approvals/papers/${paperId}/review`, {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({ action }),
      });
      if (accessToken && institutionId) load(accessToken, institutionId);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const statusMap = { pending: ["draft", "submitted", "pending"], approved: ["published", "approved"], rejected: ["rejected"] };

  const filtered = useMemo(() => {
    const statuses = statusMap[activeTab];
    return papers.filter((p) => statuses.some((s) => p.status?.toLowerCase().includes(s)));
  }, [papers, activeTab]);

  const counts = {
    pending: papers.filter((p) => statusMap.pending.some((s) => p.status?.toLowerCase().includes(s))).length,
    approved: papers.filter((p) => statusMap.approved.some((s) => p.status?.toLowerCase().includes(s))).length,
    rejected: papers.filter((p) => p.status?.toLowerCase().includes("rejected")).length,
  };

  const statusColor = (s: string) =>
    s === "published" || s === "approved" ? "text-green-400 bg-green-500/10 border-green-500/20" :
    s === "rejected" ? "text-red-400 bg-red-500/10 border-red-500/20" :
    s === "submitted" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
    "text-[#8b9bb4] bg-white/5 border-white/10";

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
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BookMarked size={20} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Approve Papers</h1>
          </div>
          <p className="text-[#8b9bb4] text-sm font-medium mt-1">Review faculty-generated exam papers before publishing.</p>
        </div>
        <button
          onClick={() => accessToken && institutionId && load(accessToken, institutionId)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e293b] border border-white/10 text-sm font-bold text-[#8b9bb4] hover:text-white hover:border-white/20 transition-all"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} /> Refresh
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
                ? tab === "approved" ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : tab === "rejected" ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-[#544bc3] text-white"
                : "bg-[#1e293b] text-[#8b9bb4] border border-white/5 hover:text-white"
            }`}
          >
            {tab} <span className="text-[11px] font-black">{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#1e293b] border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-20"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="text-5xl">📋</div>
            <p className="text-[#8b9bb4] font-medium">No {activeTab} papers found.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#2D3748] text-[10px] uppercase font-black tracking-widest text-[#8b9bb4]">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Paper Title</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Total Marks</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  {activeTab === "pending" && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((paper, i) => (
                  <tr key={paper.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-[#8b9bb4] text-xs font-bold">{i + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white line-clamp-1">{paper.title}</p>
                      {paper.templateName && <p className="text-xs text-[#8b9bb4] mt-0.5">{paper.templateName}</p>}
                    </td>
                    <td className="px-6 py-4 text-[#cbd5e1] text-xs font-medium">{paper.subject || "—"}</td>
                    <td className="px-6 py-4 text-[#cbd5e1] text-xs font-bold">{paper.totalMarks}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border capitalize ${statusColor(paper.status)}`}>
                        {paper.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#8b9bb4]">{new Date(paper.createdAt).toLocaleDateString()}</td>
                    {activeTab === "pending" && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            disabled={actionLoadingId === paper.id}
                            onClick={() => handleReview(paper.id, "reject")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                          >
                            {actionLoadingId === paper.id ? <Spinner size="sm" /> : <XCircle size={13} />} Reject
                          </button>
                          <button
                            disabled={actionLoadingId === paper.id}
                            onClick={() => handleReview(paper.id, "approve")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all disabled:opacity-50"
                          >
                            {actionLoadingId === paper.id ? <Spinner size="sm" /> : <CheckCircle size={13} />} Approve
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

