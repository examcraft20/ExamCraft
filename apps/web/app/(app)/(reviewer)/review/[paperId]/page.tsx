"use client";

import { useParams } from "next/navigation";

export default function ReviewPage() {
  const params = useParams();
  const paperId = params.paperId as string;

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-tight">
        Review Paper
      </h1>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <p className="text-zinc-400 text-sm mb-1">Paper ID</p>
        <p className="text-white font-mono font-semibold">{paperId}</p>
        <p className="text-zinc-500 text-sm mt-4">
          Full reviewer workspace coming soon.
        </p>
      </div>
    </div>
  );
}
