import React from 'react';
import { CheckCircle2, Database, Building2 } from 'lucide-react';
import Link from 'next/link';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-600/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="flex-1 lg:grid lg:grid-cols-2 relative z-10 w-full">
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-between p-12 lg:p-24 relative overflow-hidden border-r border-white/5 bg-[#0f172a]/50">
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-16 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-xl text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
                E
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">ExamCraft</span>
            </Link>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-10 tracking-tight leading-[1.15]">
              Your institution&apos;s exam workflow, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 drop-shadow-sm">simplified.</span>
            </h1>
            
            <ul className="space-y-6 text-lg text-slate-300 font-light">
              <li className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong className="text-white font-medium">Multi-tenant</strong>, role-based access control</span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                <span>Question banks, blueprints & <strong className="text-white font-medium">approval workflows</strong></span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong className="text-white font-medium">PDF/DOCX export</strong> with institution branding</span>
              </li>
            </ul>
          </div>
          
          {/* Floating Stat Cards */}
          <div className="absolute right-[-10%] bottom-[20%] w-full max-w-xs space-y-4 z-0 pointer-events-none">
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-3 shadow-2xl transform hover:scale-105 transition-transform translate-x-12 -rotate-3">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-bold text-white">2,400+</div>
                  <div className="text-xs text-slate-400">Questions in bank</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-3 shadow-2xl transform hover:scale-105 transition-transform translate-x-4 rotate-2">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-bold text-white">14</div>
                  <div className="text-xs text-slate-400">Institutions onboarded</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-3 shadow-2xl transform hover:scale-105 transition-transform translate-x-20 -rotate-1">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-bold text-white">98%</div>
                  <div className="text-xs text-slate-400">Approval rate</div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-16 font-medium tracking-wider uppercase">
            Trusted by academic teams across institutions
          </p>
        </div>
        
        {/* Right Panel */}
        <div className="flex items-center justify-center p-6 sm:p-12 h-fit min-h-screen lg:min-h-0 lg:h-full">
          <div className="w-full max-w-md relative z-10">
            {/* Mobile Logo Fallback */}
            <div className="lg:hidden flex items-center justify-center mb-10">
               <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                  E
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">ExamCraft</span>
              </Link>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
