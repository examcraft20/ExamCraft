"use client";

import { useEffect } from "react";
import { 
  AlertTriangle, 
  RotateCcw, 
  Home, 
  ShieldAlert, 
  Activity,
  Terminal
} from "lucide-react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical errors for monitoring and debugging
    console.error("Critical System Error:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#02040a] selection:bg-red-500/30">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="w-full max-w-2xl relative">
        {/* Error Card */}
        <div className="bg-zinc-950 border border-red-500/20 rounded-[2.5rem] p-12 shadow-[0_0_100px_rgba(239,68,68,0.1)] relative overflow-hidden backdrop-blur-xl">
           {/* Top Indicator */}
           <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
                 <ShieldAlert size={24} />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-sm font-black text-white uppercase tracking-[0.3em]">Protocol Violation</h1>
                 <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Shard Desynchronization Detected</span>
              </div>
           </div>

           {/* Content */}
           <div className="space-y-8 mb-12">
              <div className="space-y-4">
                 <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                    Something went <span className="text-red-500">catastrophic.</span>
                 </h2>
                 <p className="text-zinc-400 font-medium leading-relaxed max-w-lg">
                    The cognitive architecture has encountered a state paradox. This shard has been temporarily decoupled from the primary nexus to prevent data corruption.
                 </p>
              </div>

              {/* Error Detail */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 font-mono text-[11px] text-zinc-500 overflow-hidden group hover:border-red-500/20 transition-all">
                 <div className="flex items-center gap-2 mb-3 text-zinc-600 font-black uppercase tracking-widest text-[9px]">
                    <Terminal size={12} /> Diagnostic Trace
                 </div>
                 <div className="break-all leading-relaxed">
                    {error.message || "UNIDENTIFIED_STATE_EXCEPTION"}
                    {error.digest && <div className="mt-2 text-red-500/50">Digest: {error.digest}</div>}
                 </div>
              </div>
           </div>

           {/* Actions */}
           <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => reset()}
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-red-500 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_50px_rgba(239,68,68,0.5)] group"
              >
                 <RotateCcw size={16} className="group-active:rotate-180 transition-transform duration-500" />
                 Synchronize Shard
              </button>
              <Link 
                href="/"
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
              >
                 <Home size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
                 Return to Nexus
              </Link>
           </div>
        </div>

        {/* System Activity Footer */}
        <div className="mt-8 flex items-center justify-between px-6">
           <div className="flex items-center gap-8">
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Architecture</span>
                 <span className="text-[10px] font-bold text-zinc-500">EXAMCRAFT_V2</span>
              </div>
              <div className="flex flex-col text-right">
                 <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">State</span>
                 <span className="flex items-center gap-2 text-[10px] font-bold text-red-500/80 uppercase tracking-widest animate-pulse">
                    <Activity size={10} /> Reactive Reboot
                 </span>
              </div>
           </div>
           <div className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.3em]">
              Authorized Personnel Only
           </div>
        </div>
      </div>

      <style jsx global>{`
        body { background-color: #02040a !important; }
      `}</style>
    </div>
  );
}
