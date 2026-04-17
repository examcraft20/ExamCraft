import { Suspense } from "react";
import { serverApiRequest } from "@/lib/api/server";
import { createClient } from "@/lib/supabase-server";
import { ReviewContent } from "@/components/approvals/review-content";
import type { PaperRecord } from "@/lib/dashboard";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@examcraft/ui";

interface PageProps {
  params: Promise<{ paperId: string }>;
  searchParams: Promise<{ institutionId?: string }>;
}

async function ReviewDetails({ paperId, institutionId, accessToken }: { 
  paperId: string; 
  institutionId: string;
  accessToken: string;
}) {
  try {
    const paper = await serverApiRequest<PaperRecord>(`/papers/${paperId}`, {
      accessToken,
      institutionId
    });

    return (
      <ReviewContent 
        paper={paper} 
        paperId={paperId}
        accessToken={accessToken}
        institutionId={institutionId}
      />
    );
  } catch (error) {
    throw error; // Let the error boundary handle it
  }
}

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const { paperId } = await params;
  const { institutionId } = await searchParams;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken || !institutionId) {
    return (
      <div className="p-12 text-center bg-zinc-900/50 border border-white/5 rounded-[2rem]">
         <p className="text-zinc-500 font-bold">Authentication or Context Missing</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto w-full">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-6">
          <Link
            href={`/dashboard/reviewer_approver/review?institutionId=${institutionId}`}
            className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all shadow-xl"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
              <ShieldCheck className="text-indigo-500" size={28} />
              Review Workspace
            </h1>
            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mt-1">
              Analyzing Paper ID: <span className="text-zinc-300 font-mono">{paperId.split('-')[0]}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
           <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
           Live Review Session
        </div>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-32 gap-6 bg-zinc-950/50 border border-white/5 rounded-[3rem]">
           <Spinner size="lg" className="text-indigo-500" />
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] animate-pulse">Initializing Component Tree...</p>
        </div>
      }>
        <ReviewDetails 
          paperId={paperId} 
          institutionId={institutionId} 
          accessToken={accessToken} 
        />
      </Suspense>
    </div>
  );
}
