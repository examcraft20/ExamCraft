"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Rocket, FileText, CheckCircle2 } from "lucide-react";
import { Card, Input, Button, Spinner } from "@examcraft/ui";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  examType: string;
  durationMinutes: number;
  totalMarks: number;
  status: string;
}

export function PaperGenerator({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTemplates() {
      try {
        const session = await getSupabaseBrowserSession();
        if (!session?.access_token || !isMounted) return;

        const res = await apiRequest<Template[]>("/content/templates", {
          method: "GET",
          accessToken: session.access_token,
          institutionId
        });

        if (isMounted) {
          // Only show published templates for generation
          setTemplates(res.filter(t => t.status === "published"));
        }
      } catch (e) {
        if (isMounted) setError("Failed to load templates.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadTemplates();
    return () => { isMounted = false; };
  }, [institutionId]);

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      setError("Please select a blueprint template.");
      return;
    }
    if (!title.trim()) {
      setError("Please provide a title for the generated paper.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const session = await getSupabaseBrowserSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      await apiRequest("/content/papers/generate", {
        method: "POST",
        accessToken: session.access_token,
        institutionId,
        body: JSON.stringify({
          templateId: selectedTemplate,
          title: title.trim()
        })
      });

      router.push(`/dashboard/faculty/papers?institutionId=${institutionId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate paper. Re-check template tolerances.");
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  const activeTemplate = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/faculty/papers?institutionId=${institutionId}`}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-white tracking-tight">Generate Paper</h2>
          <p className="text-sm font-medium text-slate-400">
            Automate exam generation matching your exact blueprints
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {error}
        </div>
      )}

      {templates.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/30 border border-white/5 border-dashed flex flex-col items-center justify-center gap-4 text-center">
          <FileText size={32} className="text-zinc-500" />
          <div className="max-w-xs">
            <h3 className="text-white font-bold mb-1">No Published Blueprints</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              You need at least one 'Published' template before you can auto-generate a paper. Go back to Templates and build or publish one.
            </p>
          </div>
          <Link
            href={`/dashboard/faculty/templates/new?institutionId=${institutionId}`}
            className="mt-4 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all"
          >
            Create Base Blueprint
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500">Target Blueprint</label>
              <div className="flex flex-col gap-3">
                {templates.map(t => {
                  const isSelected = selectedTemplate === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                        isSelected 
                          ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                          : 'bg-zinc-900/50 border-white/5 hover:border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-indigo-400">
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                      <h4 className={`font-bold transition-colors ${isSelected ? 'text-indigo-300' : 'text-white'}`}>
                        {t.name}
                      </h4>
                      <p className="text-xs font-medium text-zinc-500 mt-1">
                        {t.examType} • {t.durationMinutes} mins • {t.totalMarks} marks
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-xs uppercase tracking-widest text-zinc-500">Instance Title</label>
               <Input 
                 placeholder="e.g. Midterm Set A - Fall 2026"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="bg-black/50 border-white/10"
               />
               <p className="text-[10px] text-zinc-500 font-medium ml-1">
                 This title will be printed on the final candidate paper.
               </p>
            </div>
          </div>

          <div className="relative">
             <Card className="!bg-zinc-950 border-white/5 shadow-2xl relative overflow-hidden flex flex-col gap-6 sticky top-24">
               <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
               
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Rocket size={18} className="text-emerald-400" />
                 Engine Execution
               </h3>

               {activeTemplate ? (
                 <div className="flex flex-col gap-6">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col">
                       <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Configured Time</span>
                       <span className="text-sm font-bold text-white mt-1">{activeTemplate.durationMinutes} minutes</span>
                     </div>
                     <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col">
                       <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Total Marks</span>
                       <span className="text-sm font-bold text-white mt-1">{activeTemplate.totalMarks} Marks</span>
                     </div>
                   </div>

                   <p className="text-sm text-slate-400 leading-relaxed font-medium">
                     ExamCraft will now query the Question Bank, select items matching your Blueprint rules (difficulty, taxonomy, scopes), and assemble a finalized exam randomly.
                   </p>

                   <Button
                     className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border-0 text-sm font-bold"
                     onClick={handleGenerate}
                     disabled={isGenerating || !title.trim()}
                   >
                     {isGenerating ? (
                       <span className="animate-pulse">Building Paper Arrays...</span>
                     ) : (
                       "Start Generation Sequence"
                     )}
                   </Button>
                 </div>
               ) : (
                 <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-600">
                      <FileText size={20} />
                    </div>
                    <p className="text-sm text-zinc-500 font-medium max-w-[200px]">
                      Select a Template Blueprint to configure the generation engine.
                    </p>
                 </div>
               )}
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
