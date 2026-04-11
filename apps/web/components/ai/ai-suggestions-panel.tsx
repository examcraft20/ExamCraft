"use client";

import { Card } from "@examcraft/ui";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";

export function AiSuggestionsPanel() {
  const suggestions = [
    "Consider adding more Bloom Level 3 questions to Unit 2.",
    "The MCQ distribution for Subjective topics is slightly skewed.",
    "Recommended: Include a case study for Cognitive Domain validation."
  ];

  return (
    <Card className="p-8 !bg-zinc-900 border-white/5 !rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] -z-10 group-hover:bg-amber-500/10 transition-colors" />
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tighter">AI Curated Insights</h3>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Pedagogical optimization tips</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group/item">
            <div className="mt-1 text-amber-500/50 group-hover/item:text-amber-500">
               <Lightbulb size={16} />
            </div>
            <p className="text-sm text-zinc-400 group-hover/item:text-zinc-200 transition-colors leading-relaxed">
              {suggestion}
            </p>
            <ArrowRight size={14} className="ml-auto text-zinc-800 group-hover/item:text-white transition-all opacity-0 group-hover/item:opacity-100" />
          </div>
        ))}
      </div>
    </Card>
  );
}
