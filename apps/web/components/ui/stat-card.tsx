"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  number: string | number;
  label: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color?: "indigo" | "violet" | "emerald";
}

export function StatCard({
  icon: Icon,
  number,
  label,
  trend,
  color = "indigo"
}: StatCardProps) {
  const colorClasses = {
    indigo: "text-[#818cf8] border-[#4f46e5]/20",
    violet: "text-violet-400 border-violet-500/20",
    emerald: "text-emerald-400 border-emerald-500/20"
  };

  return (
    <div className="relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.5rem]" />
      <div className="bg-[#0c0c0c] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-2xl relative z-10 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className={`p-3 rounded-xl border flex items-center justify-center relative z-10 bg-[#050505] shadow-inner ${colorClasses[color]}`}>
              <Icon size={20} strokeWidth={2.5} />
            </div>
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-[10px] uppercase font-black tracking-widest px-2.5 py-1.5 rounded-lg border ${
                trend.direction === "up" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}%
            </div>
          )}
        </div>
        <div className="space-y-1 relative z-10">
          <p className="text-4xl font-black text-white tracking-tighter drop-shadow-sm">{number}</p>
          <p className="text-[13px] font-bold tracking-tight text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
