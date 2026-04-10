"use client";

import { Activity, Sparkles, Command } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 bg-[#02040a]">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
      </div>

      <div className="relative flex flex-col items-center gap-12">
        {/* Loading core */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center relative">
             <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-[spin_1.5s_linear_infinite]" />
             <div className="absolute inset-2 rounded-full border-b-2 border-blue-500/50 animate-[spin_2s_linear_infinite_reverse]" />
             <Command size={32} className="text-zinc-700 animate-pulse" />
          </div>
          
          {/* Floating glimmers */}
          <Sparkles size={16} className="absolute -top-4 -right-4 text-indigo-400 animate-bounce" />
          <div className="absolute -bottom-4 -left-4 w-4 h-4 rounded-full bg-blue-500/20 blur-md animate-pulse" />
        </div>

        {/* Textual Feedback */}
        <div className="flex flex-col items-center text-center gap-3">
           <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] animate-in fade-in slide-in-from-bottom-2 duration-1000">
              Nexus Initialization
           </h3>
           <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              <span className="flex items-center gap-2">
                 <Activity size={10} className="text-indigo-500" /> Pedagogical Sync
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-800" />
              <span>Shard Loading</span>
           </div>
        </div>

        {/* Progress simulator */}
        <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden relative">
           <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-24 animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        body { background-color: #02040a !important; }
      `}</style>
    </div>
  );
}
