"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Rocket, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, Input, Button, Spinner } from "@examcraft/ui";
import { apiRequest } from "@/lib/api/client";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import Link from "next/link";
import { toast } from "sonner";

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
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadTemplates() {
      try {
        const session = await getSupabaseBrowserSession();
        if (!session?.access_token || !isMounted) return;

        const res = await apiRequest<Template[]>("/templates", {
          method: "GET",
          accessToken: session.access_token,
          institutionId,
        });

        if (isMounted) {
          // Only show published templates for generation
          setTemplates(res.filter((t) => t.status === "published"));
        }
      } catch (e) {
        if (isMounted) {
          console.error("Templates load error:", e);
          setError("Failed to load valid blueprint templates.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadTemplates();
    return () => { isMounted = false; };
  }, [institutionId]);

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast.error("Template selection required");
      return;
    }
    if (!title.trim()) {
      toast.error("Paper title required");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(10);

    try {
      const session = await getSupabaseBrowserSession();
      if (!session?.access_token) throw new Error("No active authentication session found.");

      // Simulated steps for progress UI
      const progressSteps = [25, 50, 75, 90];
      for (const step of progressSteps) {
        await new Promise(r => setTimeout(r, 400));
        setGenerationProgress(step);
      }

      await apiRequest("/papers/generate", {
        method: "POST",
        accessToken: session.access_token,
        institutionId,
        body: JSON.stringify({
          templateId: selectedTemplate,
          title: title.trim(),
        }),
      });

      setGenerationProgress(100);
      toast.success("Exam paper generated successfully!");
      
      router.push(`/dashboard/faculty/papers?institutionId=${institutionId}`);
      router.refresh();
    } catch (err) {
      console.error("AI Generation failure:", err);
      const msg = err instanceof Error ? err.message : "Infrastructure error during AI generation.";
      setError(msg);
      toast.error(msg);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <Spinner size="lg" className="text-indigo-500" />
        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest animate-pulse">Initializing Blueprint Engine...</p>
      </div>
    );
  }

  const activeTemplate = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Link
          href={`/dashboard/faculty/papers?institutionId=${institutionId}`}
          className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 hover:bg-zinc-800 transition-all shadow-xl"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">
            Paper Generator
          </h2>
          <p className="text-sm font-bold text-zinc-500 tracking-wide mt-1">
            Transforming academic blueprints into finalized assessments
          </p>
        </div>
      </div>

      {error && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-start gap-4 shadow-2xl animate-in shake duration-500">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
             <span className="uppercase tracking-widest text-[10px] text-red-500/80">Generation Fault</span>
             {error}
          </div>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="p-20 rounded-[2.5rem] bg-zinc-950 border border-white/5 border-dashed flex flex-col items-center justify-center gap-6 text-center shadow-inner">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-700">
            <FileText size={40} />
          </div>
          <div className="max-w-sm">
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
              Blueprint Library Empty
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed font-medium">
              A published Blueprint is required to drive the generation engine. 
              Configure your curriculum requirements in the Templates module first.
            </p>
          </div>
          <Link
            href={`/dashboard/faculty/templates/new?institutionId=${institutionId}`}
            className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Engineer New Blueprint
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
                A. Select Operational Blueprint
              </label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {templates.map((t) => {
                  const isSelected = selectedTemplate === t.id;
                  return (
                    <button
                      key={t.id}
                      disabled={isGenerating}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`text-left p-6 rounded-[1.5rem] border transition-all relative overflow-hidden group ${
                        isSelected
                          ? "bg-indigo-600/10 border-indigo-500/50 shadow-2xl"
                          : "bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60 disabled:opacity-30"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-6 right-6 text-indigo-400">
                          <CheckCircle2 size={24} />
                        </div>
                      )}
                      <h4
                        className={`text-lg font-black transition-colors ${isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}
                      >
                        {t.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-3">
                         <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-zinc-500 border border-white/5">
                            {t.examType}
                         </span>
                         <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                            {t.totalMarks} Marks
                         </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
                B. Definition of Intent
              </label>
              <div className="relative group">
                <Input
                  placeholder="e.g. Advanced Calculus - Midterm B - Q3"
                  value={title}
                  disabled={isGenerating}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-900/50 border-white/10 h-16 rounded-2xl px-6 text-base font-bold text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-30"
                />
              </div>
              <p className="text-[10px] text-zinc-600 font-bold ml-1 uppercase tracking-widest">
                This identifier will be primary on all audit records and candidate exports.
              </p>
            </div>
          </div>

          <div className="relative">
            <Card className="!bg-zinc-950 border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col gap-8 sticky top-24 p-8 !rounded-[2rem]">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                   <Rocket size={20} />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase italic">
                  Run Engine
                </h3>
              </div>

              {activeTemplate ? (
                <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600 font-bold uppercase tracking-widest">Target Marks</span>
                      <span className="text-white font-black">{activeTemplate.totalMarks}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600 font-bold uppercase tracking-widest">Allocation Window</span>
                      <span className="text-white font-black">{activeTemplate.durationMinutes}m</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/5 text-xs text-zinc-500 leading-relaxed font-medium italic">
                    Engine will query item banks, optimize for Bloom complexity, and generate a randomized assessment instance.
                  </div>

                  {isGenerating && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        <span>Orchestrating Logic...</span>
                        <span>{generationProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300" 
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full h-16 bg-white text-black hover:bg-indigo-500 hover:text-white shadow-2xl border-0 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-30 disabled:scale-100"
                    onClick={handleGenerate}
                    disabled={isGenerating || !title.trim()}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Initiate Protocol"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4 opacity-40">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-zinc-600">
                    <FileText size={32} />
                  </div>
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] max-w-[180px]">
                    Awaiting Blueprint Selection
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
