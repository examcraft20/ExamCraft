import Link from "next/link";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden">
      {/* Subtle animated mesh glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
          Build Better Exams. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Together.</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
          ExamCraft helps colleges, tuition centers and academic teams manage question banks, generate papers, and run approval workflows — all from one platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <Link href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
            Start for Free
          </Link>
          <Link href="#demo" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
            <Play className="w-5 h-5 fill-current" />
            See How It Works
          </Link>
        </div>

        {/* Dashboard Preview Presentation */}
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/[0.02] p-2 md:p-4 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a] opacity-50 rounded-2xl pointer-events-none" />
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1e293b]/80 aspect-video flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Fake Mac Header */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-[#0f172a]/50">
              <div className="w-3 h-3 rounded-full bg-slate-600" />
              <div className="w-3 h-3 rounded-full bg-slate-600" />
              <div className="w-3 h-3 rounded-full bg-slate-600" />
            </div>
            {/* Fake Dashboard Body - Refined SaaS Preview */}
            <div className="flex-1 p-0 flex">
              {/* Sidebar Preview */}
              <div className="hidden md:flex flex-col gap-3 w-56 border-r border-slate-700/50 bg-[#0f172a] p-4">
                <div className="flex items-center gap-2 mb-6 px-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">EX</div>
                  <span className="font-bold text-white tracking-widest text-sm">ExamCraft</span>
                </div>
                <div className="h-8 rounded-lg bg-white/5 w-full" />
                <div className="h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center px-3 text-xs w-full font-bold shadow-[0_0_15px_rgba(99,102,241,0.1)]">Manage Questions</div>
                <div className="h-8 rounded-lg bg-white/5 w-5/6" />
                <div className="h-8 rounded-lg bg-white/5 w-full mt-4" />
                <div className="h-8 rounded-lg bg-white/5 w-3/4" />
              </div>
              
              {/* Main Content Area Preview */}
              <div className="flex-1 flex flex-col p-6 bg-[#0b1221] gap-6 relative overflow-hidden">
                 {/* Header Mock */}
                 <div className="flex justify-between items-center">
                    <div className="h-6 w-48 bg-white/10 rounded-md" />
                    <div className="h-8 w-32 bg-indigo-600 rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.3)]" />
                 </div>
                 
                 {/* 4 Stat Cards Row Mock */}
                 <div className="grid grid-cols-4 gap-4">
                    <div className="h-20 bg-[#1e293b]/80 border border-slate-700/50 rounded-xl" />
                    <div className="h-20 bg-[#1e293b]/80 border border-slate-700/50 rounded-xl relative overflow-hidden">
                       <div className="absolute top-1/2 left-4 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                       <div className="absolute top-1/2 right-4 -translate-y-1/2 h-8 w-12 bg-white/10 rounded" />
                    </div>
                    <div className="h-20 bg-[#1e293b]/80 border border-slate-700/50 rounded-xl relative overflow-hidden">
                       <div className="absolute top-1/2 left-4 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                       <div className="absolute top-1/2 right-4 -translate-y-1/2 h-8 w-12 bg-white/10 rounded" />
                    </div>
                    <div className="h-20 bg-[#1e293b]/80 border border-slate-700/50 rounded-xl relative overflow-hidden">
                       <div className="absolute top-1/2 left-4 -translate-y-1/2 w-4 h-4 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                       <div className="absolute top-1/2 right-4 -translate-y-1/2 h-8 w-12 bg-white/10 rounded" />
                    </div>
                 </div>

                 {/* Table Block Mock */}
                 <div className="flex-1 bg-[#1e293b]/80 border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden">
                    <div className="h-12 border-b border-slate-700/50 flex items-center px-4 gap-4">
                       <div className="h-6 w-24 bg-white/5 rounded" />
                       <div className="h-6 w-24 bg-white/5 rounded" />
                       <div className="h-6 w-32 bg-white/5 rounded" />
                    </div>
                    <div className="flex-1 p-4 flex flex-col gap-3">
                       <div className="h-12 bg-slate-800/40 rounded-lg border border-white/5 flex items-center px-4">
                          <div className="w-1/2 h-4 bg-white/10 rounded" />
                          <div className="ml-auto w-16 h-6 bg-emerald-500/20 border border-emerald-500/30 rounded-full" />
                       </div>
                       <div className="h-12 bg-slate-800/40 rounded-lg border border-white/5 flex items-center px-4">
                          <div className="w-3/4 h-4 bg-white/10 rounded" />
                          <div className="ml-auto w-16 h-6 bg-red-500/20 border border-red-500/30 rounded-full" />
                       </div>
                       <div className="h-12 bg-slate-800/40 rounded-lg border border-white/5 flex items-center px-4">
                          <div className="w-2/3 h-4 bg-white/10 rounded" />
                          <div className="ml-auto w-16 h-6 bg-amber-500/20 border border-amber-500/30 rounded-full" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
