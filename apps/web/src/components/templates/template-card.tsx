"use client";

import { Card } from "@examcraft/ui";
import { LayoutTemplate, Clock, User, ChevronRight } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
  usageCount?: number;
}

export function TemplateCard({ template }: { template: Template }) {
  return (
    <Card className="p-6 !bg-zinc-900 border-white/5 !rounded-[2rem] hover:border-indigo-500/30 transition-all group cursor-pointer shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] -z-10 group-hover:bg-indigo-500/10 transition-colors" />
      
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
          <LayoutTemplate size={24} />
        </div>
        <div className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
          Global
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors tracking-tight">
          {template.name}
        </h3>
        <p className="text-zinc-500 text-sm font-medium line-clamp-2">
          {template.description || "No description provided for this template."}
        </p>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <Clock size={12} />
            {new Date(template.createdAt).toLocaleDateString()}
          </div>
          {template.usageCount !== undefined && (
            <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <User size={12} />
              {template.usageCount} Uses
            </div>
          )}
        </div>
        <ChevronRight size={18} className="text-zinc-700 group-hover:text-white transition-colors" />
      </div>
    </Card>
  );
}
