"use client";

import { Card } from "@examcraft/ui";
import { ArrowRight, Building2, ShieldCheck, Sparkles, Globe, Database, UserCheck, Zap } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  brandTitle: ReactNode;
  brandSubtitle: string;
  features: string[];
  children: ReactNode;
  footerLinks?: Array<{ href: string; label: ReactNode }>;
};

const brandIcons = [ShieldCheck, Database, Zap, ArrowRight];

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  brandTitle,
  brandSubtitle,
  features,
  children,
  footerLinks = []
}: AuthShellProps) {
  return (
    <div className="auth-shell min-h-screen bg-zinc-950 flex flex-col lg:grid lg:grid-cols-[1fr_1.1fr] selection:bg-indigo-500/30">
      {/* Immersive Branding Side */}
      <aside className="relative hidden lg:flex flex-col justify-between p-16 overflow-hidden border-r border-white/5 bg-[#020308]">
        {/* Decorative elements */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12 group">
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-black font-black transition-transform group-hover:scale-110">
              <Building2 size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ExamCraft</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-8 animate-pulse">
            <Sparkles size={10} />
            Institutional Excellence
          </div>

          <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tighter text-white mb-6 drop-shadow-2xl">
            {brandTitle}
          </h2>
          <p className="text-lg text-zinc-400 font-medium leading-relaxed max-w-md mb-12">
            {brandSubtitle}
          </p>

          <ul className="flex flex-col gap-6">
            {features.map((feature, index) => {
              const Icon = brandIcons[index % brandIcons.length];
              return (
                <li key={feature} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-bold text-zinc-300 tracking-tight">{feature}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Visual Anchor */}
        <div className="relative z-10 pt-12 transform group hover:scale-105 transition-transform duration-700">
           <img 
            src="/auth-visual.png" 
            alt="Academy Crest Graphic" 
            className="w-full max-w-[400px] h-auto object-contain drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)] opacity-80"
           />
        </div>

        <div className="relative z-10 mt-auto pt-12 flex items-center gap-4 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
           <Globe size={12} /> Global Institutional Standard
        </div>
      </aside>

      {/* Form Side */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-16 relative overflow-hidden">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8">
           <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-black font-black text-xs">
              E
            </div>
            <span className="text-lg font-bold text-white">ExamCraft</span>
           </Link>
        </div>

        <div className="w-full max-w-[480px] relative z-10">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                 {eyebrow}
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white">{title}</h1>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-sm">
                {subtitle}
              </p>
            </div>

            <Card className="auth-card-surface !bg-zinc-900 border border-white/5 !rounded-[2rem] shadow-2xl overflow-hidden" glow padding="lg">
               <div className="relative z-10">
                  {children}
               </div>
               
               {/* Decorative subtle gradient inside card */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] pointer-events-none" />
            </Card>

            {footerLinks.length > 0 ? (
              <div className="flex flex-col gap-4 pt-4 text-center">
                {footerLinks.map((link) => (
                  <Link 
                    href={link.href} 
                    key={link.href}
                    className="text-sm font-bold text-zinc-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2 group"
                  >
                    {link.label}
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Ambient light for forms */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/5 blur-[100px] pointer-events-none" />
      </main>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
