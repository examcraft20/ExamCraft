"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ReviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Review Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-8 shadow-2xl">
        <AlertCircle size={48} />
      </div>
      
      <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tight italic">
        Workspace Fault
      </h2>
      
      <p className="text-zinc-500 max-w-md font-medium text-sm leading-relaxed mb-10">
        We encountered an infrastructure error while synchronizing the review workspace. This might be due to a transient network issue or invalid access parameters.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
        >
          <RotateCcw size={16} />
          Retry Protocol
        </button>
        
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-400 font-black text-xs uppercase tracking-widest hover:text-white hover:bg-zinc-800 transition-all"
        >
          <Home size={16} />
          Abandon Session
        </Link>
      </div>

      <div className="mt-16 p-4 rounded-xl bg-zinc-950/50 border border-white/[0.03]">
         <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
           Fault Digest: {error.digest || "UNSPECIFIED_FAILURE"}
         </p>
      </div>
    </div>
  );
}
