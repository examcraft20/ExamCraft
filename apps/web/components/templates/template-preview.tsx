"use client";

import { Card } from "@examcraft/ui";
import { FileText, Eye, Download, Share2 } from "lucide-react";

export function TemplatePreview({ template }: { template: any }) {
  return (
    <Card className="!bg-zinc-950 border-white/10 !rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Eye size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Blueprint Preview</h3>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Visual structure validation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Download size={18} /></button>
          <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Share2 size={18} /></button>
        </div>
      </div>
      
      <div className="p-12 min-h-[400px] flex flex-col items-center justify-center text-center gap-6">
        <div className="w-24 h-32 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-white/5">
          <FileText size={48} />
        </div>
        <div>
          <h4 className="text-white font-bold">{template?.name || "Untitled Blueprint"}</h4>
          <p className="text-zinc-600 text-sm mt-2 max-w-xs mx-auto">This is a structural preview. Content mapping will be applied during paper generation.</p>
        </div>
      </div>
    </Card>
  );
}
