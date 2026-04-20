import { Suspense } from "react";
import { serverApiRequest } from "@/lib/api/server";
import { createClient } from "@/lib/supabase-server";
import type { PaperRecord } from "@/lib/dashboard";
import { FileText, ArrowLeft, Settings, History } from "lucide-react";
import Link from "next/link";
import { Spinner, Card } from "@examcraft/ui";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ institutionId?: string }>;
}

async function PaperDetails({ id, institutionId, accessToken }: { 
  id: string; 
  institutionId: string;
  accessToken: string;
}) {
  try {
    const paper = await serverApiRequest<PaperRecord>(`/papers/${id}`, {
      accessToken,
      institutionId
    });

    return (
      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="flex flex-col gap-8">
          <Card className="!bg-zinc-900/50 border-white/5 !rounded-[2.5rem] p-10 flex flex-col gap-6">
             <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h2 className="text-2xl font-black text-white uppercase italic">Draft Assembly</h2>
                <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                   {paper.status || "In Preparation"}
                </div>
             </div>
             
             <div className="space-y-4">
                <p className="text-zinc-400 font-medium leading-relaxed">
                   Paper content and question array preview will be rendered here. You can modify instructions, metadata, and re-order sections before submission.
                </p>
                <div className="p-6 rounded-2xl bg-zinc-950/50 border border-white/5 flex items-center justify-between">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Title</span>
                      <span className="text-sm font-bold text-white">{paper.title}</span>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Total Valuation</span>
                      <span className="text-sm font-black text-indigo-400">{paper.totalMarks} PTS</span>
                   </div>
                </div>
             </div>
          </Card>
          
          <div className="p-12 text-center rounded-[3rem] border-2 border-dashed border-white/5 opacity-50">
             <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs underline decoration-indigo-500 underline-offset-8">Editor Interface Initializing...</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <Card className="!bg-zinc-950 border-white/[0.08] !rounded-[2rem] p-8 shadow-2xl flex flex-col gap-8">
              <h3 className="text-lg font-black text-white uppercase italic flex items-center gap-3">
                 <Settings size={20} className="text-zinc-500" />
                 Controls
              </h3>
              
              <div className="flex flex-col gap-3">
                 <Link 
                   href={`/dashboard/faculty/papers/${id}/preview?institutionId=${institutionId}`}
                   className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest text-center shadow-lg shadow-indigo-600/20 transition-all"
                 >
                    Full Preview
                 </Link>
                 <Link 
                   href={`/dashboard/faculty/papers/${id}/submit?institutionId=${institutionId}`}
                   className="w-full py-4 rounded-xl bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest text-center transition-all"
                 >
                    Submit for Review
                 </Link>
              </div>

              <div className="pt-6 border-t border-white/5">
                 <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <History size={14} /> Audit History
                 </h4>
                 <div className="space-y-4">
                    {paper.reviewHistory?.map((h, i) => (
                      <div key={i} className="flex gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 mt-1.5" />
                         <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">{h.action}</span>
                            <span className="text-[10px] text-zinc-600">{new Date(h.reviewedAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                    )) || <p className="text-[10px] text-zinc-700 italic">No historical audit records found.</p>}
                 </div>
              </div>
           </Card>
        </div>
      </div>
    );
  } catch (error) {
    throw error;
  }
}

export default async function PaperPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { institutionId } = await searchParams;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken || !institutionId) {
    return (
      <div className="p-12 text-center bg-zinc-900/50 border border-white/5 rounded-[2rem]">
         <p className="text-zinc-500 font-bold">Session Context Unavailable</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto w-full px-4 md:px-6">
      <div className="flex items-center gap-6">
        <Link
          href={`/dashboard/faculty/papers?institutionId=${institutionId}`}
          className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all shadow-xl"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
            <FileText className="text-indigo-500" size={28} />
            Paper Manifest
          </h1>
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mt-1">
            System ID: <span className="text-zinc-300 font-mono">{id.split('-')[0]}</span>
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-32 gap-6 bg-zinc-950/50 border border-white/5 rounded-[3rem]">
           <Spinner size="lg" className="text-indigo-500" />
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] animate-pulse">Initializing Manifest Workspace...</p>
        </div>
      }>
        <PaperDetails 
          id={id} 
          institutionId={institutionId} 
          accessToken={accessToken} 
        />
      </Suspense>
    </div>
  );
}
