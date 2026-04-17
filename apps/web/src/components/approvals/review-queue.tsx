"use client";

import { useState } from "react";
import { Search, Filter, ShieldCheck, ArrowRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@examcraft/ui";

interface Paper {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export function ReviewQueueClient({
  initialPapers,
  institutionId
}: {
  initialPapers: Paper[];
  institutionId: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = initialPapers.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-white tracking-tight">Review Queue</h2>
        <p className="text-sm font-medium text-slate-400">
          Papers submitted by faculty requiring your approval
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search pending papers..."
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

      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/30 border border-white/5 border-dashed flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
              <ShieldCheck size={32} />
            </div>
            <p className="text-zinc-400 font-medium">Your queue is empty. Great job!</p>
          </div>
        ) : (
          filtered.map((paper) => (
            <div
              key={paper.id}
              className="p-6 rounded-2xl bg-zinc-900/80 border border-white/5 hover:border-white/10 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
              
              <div className="flex flex-col gap-2 z-10 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Action Required
                  </div>
                  <span className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                    <Clock size={12} /> {new Date(paper.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">
                  {paper.title}
                </h3>
                <p className="text-xs font-bold text-zinc-500 font-mono">
                  ID: {paper.id}
                </p>
              </div>

              <div className="z-10 w-full md:w-auto mt-2 md:mt-0">
                <Button 
                  className="w-full md:w-auto bg-white/10 hover:bg-indigo-600 text-white shadow-none hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] border-0 transition-all gap-2"
                  onClick={() => router.push(`/dashboard/reviewer/review/${paper.id}?institutionId=${institutionId}`)}
                >
                  Start Review <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
