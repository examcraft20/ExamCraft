"use client";

import { useState } from "react";
import { Plus, ShieldCheck, Search, Filter, Rocket, FileQuestion } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { Button } from "@examcraft/ui";

interface Paper {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export function PaperListClient({
  initialPapers,
  institutionId
}: {
  initialPapers: Paper[];
  institutionId: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [papers, setPapers] = useState(initialPapers);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const filtered = papers.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitPaper = async (paperId: string) => {
    setIsSubmitting(paperId);
    try {
      const session = await getSupabaseBrowserSession();
      if (!session?.access_token) return;

      await apiRequest(`/content/papers/${paperId}/actions`, {
        method: "POST",
        accessToken: session.access_token,
        institutionId,
        body: JSON.stringify({ action: "submit" })
      });

      // Update local state to show 'submitted'
      setPapers(papers.map(p => p.id === paperId ? { ...p, status: 'submitted' } : p));
    } catch (e) {
      console.error(e);
      alert("Failed to submit paper for review");
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-white tracking-tight">Ready Papers</h2>
          <p className="text-sm font-medium text-slate-400">
            Generate and submit exam papers from templates
          </p>
        </div>
        <button
          onClick={() => router.push(`/dashboard/faculty/papers/new?institutionId=${institutionId}`)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all inline-flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
        >
          <Plus size={18} /> GENERATE PAPER
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-medium"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
        </div>
        <button className="px-4 h-12 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all inline-flex items-center gap-2 text-sm font-bold">
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 rounded-2xl bg-zinc-900/30 border border-white/5 border-dashed flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
              <ShieldCheck size={32} />
            </div>
            <p className="text-zinc-400 font-medium">No papers generated yet.</p>
          </div>
        ) : (
          filtered.map((paper) => (
            <div
              key={paper.id}
              className="p-6 rounded-2xl bg-zinc-900/80 border border-white/5 hover:border-white/10 transition-all group flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
              
              <div className="flex justify-between items-start z-10">
                <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <FileQuestion size={12} /> Paper ID: {paper.id.split('-')[0]}
                </div>
                <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                  paper.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  paper.status === 'in_review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  paper.status === 'submitted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  paper.status === 'draft' ? 'bg-zinc-500/10 text-zinc-400 border border-white/10' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    paper.status === 'approved' ? 'bg-emerald-400' :
                    paper.status === 'in_review' ? 'bg-amber-400 animate-pulse' :
                    paper.status === 'submitted' ? 'bg-blue-400 animate-pulse' :
                    paper.status === 'draft' ? 'bg-zinc-500' :
                    'bg-red-400'
                  }`} />
                  {paper.status.replace("_", " ")}
                </div>
              </div>

              <div className="z-10">
                <h3 className="text-xl font-black text-white mb-1 group-hover:text-indigo-400 transition-colors truncate">
                  {paper.title}
                </h3>
                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  Generated {new Date(paper.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto z-10">
                <Button variant="secondary" className="flex-1 bg-white/5 hover:bg-white/10 text-xs h-9">
                  View Questions
                </Button>
                {paper.status === 'draft' && (
                  <Button 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-xs h-9 gap-2"
                    onClick={() => handleSubmitPaper(paper.id)}
                    disabled={isSubmitting === paper.id}
                  >
                    {isSubmitting === paper.id ? "Submitting..." : <><Rocket size={14} /> Submit for Review</>}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
