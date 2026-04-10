"use client";

import { TrendingUp, Circle } from "lucide-react";
import { Button } from "@examcraft/ui";

interface CoverageCardProps {
  subject: string;
  current: number;
  target: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export function CoverageCard({ subject, current, target, difficulty }: CoverageCardProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.08] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-[30px] -z-10 group-hover:bg-indigo-500/10 transition-all" />

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex flex-col">
          <h3 className="text-lg font-black text-white tracking-tight">{subject}</h3>
          <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Subject Coverage</p>
        </div>
        <TrendingUp size={18} className="text-indigo-400" />
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden border border-white/5">
          <div
            className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400">{current} / {target} questions</span>
          <span className="text-xs font-black text-indigo-400">{Math.round(percentage)}%</span>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="flex items-center justify-between gap-3 mb-5 p-3 rounded-lg bg-white/[0.03] border border-white/5">
        {/* Easy */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <Circle size={6} className="fill-emerald-400 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              {difficulty.easy}
            </span>
          </div>
        </div>

        {/* Medium */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <Circle size={6} className="fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              {difficulty.medium}
            </span>
          </div>
        </div>

        {/* Hard */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <Circle size={6} className="fill-red-400 text-red-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
              {difficulty.hard}
            </span>
          </div>
        </div>
      </div>

      {/* View Questions Link */}
      <Button
        variant="ghost"
        className="w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/10 border-0"
      >
        View Questions →
      </Button>
    </div>
  );
}
