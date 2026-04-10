"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, FileQuestion, MessageSquareDashed } from "lucide-react";
import { Card, Button, Spinner, Input } from "@examcraft/ui";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import Link from "next/link";

interface PaperPayload {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  metadata: {
    sections: {
      title: string;
      marks: number;
      questions: {
        id: string;
        title: string;
        difficulty: string;
        bloomLevel: string;
      }[];
    }[];
  };
}

export function PaperReviewPanel({ paperId, institutionId }: { paperId: string, institutionId: string }) {
  const router = useRouter();
  
  const [paper, setPaper] = useState<PaperPayload | null>(null);
  const [comment, setComment] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPaper() {
      try {
        const session = await getSupabaseBrowserSession();
        if (!session?.access_token || !isMounted) return;

        const res = await apiRequest<PaperPayload>(`/content/papers/${paperId}`, {
          method: "GET",
          accessToken: session.access_token,
          institutionId
        });

        if (isMounted) setPaper(res);
      } catch (e) {
        if (isMounted) setError("Failed to load paper details.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadPaper();
    return () => { isMounted = false; };
  }, [paperId, institutionId]);

  const handleReviewAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !comment.trim()) {
      setError("Please provide a reason for rejecting the paper.");
      return;
    }

    setIsSubmitting(action);
    setError(null);

    try {
      const session = await getSupabaseBrowserSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      await apiRequest(`/content/papers/${paperId}/review`, {
        method: "PATCH",
        accessToken: session.access_token,
        institutionId,
        body: JSON.stringify({
          action,
          comment: comment.trim() || undefined
        })
      });

      router.push(`/dashboard/reviewer/queue?institutionId=${institutionId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review.");
      setIsSubmitting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        {error || "Paper not found."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/reviewer/queue?institutionId=${institutionId}`}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-white tracking-tight">Review Paper</h2>
            <p className="text-sm font-medium text-slate-400">
              {paper.title} • ID: {paper.id.split('-')[0]}
            </p>
          </div>
        </div>
        
        <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Awaiting Approval
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {paper.metadata.sections.map((section, idx) => (
             <div key={idx} className="flex flex-col gap-4">
               <div className="flex items-center justify-between border-b border-white/10 pb-2">
                 <h3 className="text-lg font-bold text-white tracking-tight">{section.title}</h3>
                 <span className="text-emerald-400 font-bold text-sm">{section.marks} Marks</span>
               </div>
               
               <div className="flex flex-col gap-3">
                 {section.questions.map((q, qIdx) => (
                   <Card key={q.id} className="!bg-zinc-900/50 border-white/5 !p-4 flex flex-col gap-3">
                     <div className="flex items-start gap-3">
                       <span className="text-zinc-500 font-bold">{qIdx + 1}.</span>
                       <p className="text-zinc-200 text-sm leading-relaxed flex-1">
                         {q.title}
                       </p>
                     </div>
                     <div className="flex items-center gap-2 pl-6">
                       <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-white/10">
                         {q.difficulty}
                       </span>
                       <span className="px-2 py-0.5 rounded bg-violet-500/10 text-[10px] font-black uppercase tracking-widest text-violet-300 border border-violet-500/20">
                         {q.bloomLevel}
                       </span>
                     </div>
                   </Card>
                 ))}
               </div>
             </div>
          ))}
        </div>

        <div className="relative">
          <Card className="!bg-zinc-950 border-white/5 shadow-2xl relative overflow-hidden flex flex-col gap-6 sticky top-24">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
             
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <FileQuestion size={18} className="text-blue-400" />
               Validation Decisions
             </h3>

             <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-2">
                 <label className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                   <MessageSquareDashed size={14} /> Reviewer Comments
                 </label>
                 <textarea
                   placeholder="Leave instructions for revision or approval notes..."
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   className="w-full h-32 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 p-4 text-sm font-medium resize-none transition-colors"
                 />
                 <p className="text-[10px] text-red-400 font-medium ml-1">
                   * Required if rejecting the paper
                 </p>
               </div>

               <div className="flex flex-col gap-3 mt-4">
                 <Button
                   className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] border-0 text-sm font-bold gap-2"
                   onClick={() => handleReviewAction("approve")}
                   disabled={isSubmitting !== null}
                 >
                   {isSubmitting === "approve" ? "Signing..." : <><CheckCircle2 size={16} /> Approve & Sign Off</>}
                 </Button>
                 
                 <Button
                   variant="secondary"
                   className="w-full h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-bold gap-2"
                   onClick={() => handleReviewAction("reject")}
                   disabled={isSubmitting !== null}
                 >
                   {isSubmitting === "reject" ? "Rejecting..." : <><XCircle size={16} /> Reject & Return to Faculty</>}
                 </Button>
               </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
