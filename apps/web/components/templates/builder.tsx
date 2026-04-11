"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, FileText, Settings, Target } from "lucide-react";
import { Card, Input, Button } from "@examcraft/ui";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import Link from "next/link";

interface Section {
  id: string; // client-side only
  title: string;
  questionCount: number;
  marks: number;
  allowedDifficulty: string[];
  allowedBloomLevels: string[];
}

export function TemplateBuilder({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);

  // Template Meta
  const [name, setName] = useState("");
  const [examType, setExamType] = useState("Midterm");
  const [duration, setDuration] = useState<number>(120);
  
  // Sections
  const [sections, setSections] = useState<Section[]>([
    {
      id: crypto.randomUUID(),
      title: "Section A - Objective",
      questionCount: 10,
      marks: 10,
      allowedDifficulty: ["Easy", "Medium"],
      allowedBloomLevels: ["Remember", "Understand"]
    }
  ]);

  const totalMarks = sections.reduce((sum, s) => sum + (s.marks || 0), 0);
  const totalQuestions = sections.reduce((sum, s) => sum + (s.questionCount || 0), 0);

  useEffect(() => {
    let isMounted = true;
    async function loadQuestions() {
      try {
        const session = await getSupabaseBrowserSession();
        if (!session?.access_token || !isMounted) return;
        const res = await apiRequest<any[]>("/questions", {
          method: "GET",
          accessToken: session.access_token,
          institutionId
        });
        if (isMounted) setAvailableQuestions(res);
      } catch (e) {
        // silently fail for metadata scope
      }
    }
    void loadQuestions();
    return () => { isMounted = false; };
  }, [institutionId]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: crypto.randomUUID(),
        title: `Section ${String.fromCharCode(65 + sections.length)}`,
        questionCount: 5,
        marks: 20,
        allowedDifficulty: ["Medium"],
        allowedBloomLevels: ["Apply", "Analyze"]
      }
    ]);
  };

  const updateSection = (id: string, field: keyof Section, value: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const toggleArrayValue = (sectionId: string, field: 'allowedDifficulty' | 'allowedBloomLevels', value: string) => {
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s;
      const current = s[field];
      const next = current.includes(value) 
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...s, [field]: next };
    }));
  };

  const handleSave = async (status: "draft" | "published") => {
    // Validate scopes
    const hasInvalidScopes = sections.some(s => {
      const matchCount = availableQuestions.filter(q => 
        (s.allowedDifficulty.length === 0 || s.allowedDifficulty.includes(q.difficulty)) &&
        (s.allowedBloomLevels.length === 0 || s.allowedBloomLevels.includes(q.bloomLevel)) &&
        q.status === 'ready'
      ).length;
      return matchCount < s.questionCount;
    });

    if (hasInvalidScopes && status === "published") {
      setError("Cannot publish: Some sections exceed the current database scope. Consider lowering limits or adding more questions.");
      return;
    }

    if (!name.trim()) {
      setError("Template name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const session = await getSupabaseBrowserSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const payload = {
        name,
        examType,
        durationMinutes: duration,
        totalMarks: totalMarks,
        // Remove client-side ID
        sections: sections.map(({ id, ...rest }) => rest)
      };

      await apiRequest("/templates", {
        method: "POST",
        accessToken: session.access_token,
        institutionId,
        body: JSON.stringify(payload)
      });

      router.push(`/dashboard/faculty/templates?institutionId=${institutionId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
      setIsSubmitting(false);
    }
  };

  const examTypes = ["Unit Test", "Midterm", "Final Exam", "Mock Test", "Assignment", "Weekly Quiz"];
  const difficultyLevels = ["Easy", "Medium", "Hard"];
  const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/faculty/templates?institutionId=${institutionId}`}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-white tracking-tight">Template Builder</h2>
            <p className="text-sm font-medium text-slate-400">
              Create a reusable structural blueprint for exams
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="secondary"
            className="flex-1 md:flex-none border-white/10 hover:bg-white/5"
            onClick={() => handleSave("draft")}
            disabled={isSubmitting}
          >
            Save Draft
          </Button>
          <Button
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border-0"
            onClick={() => handleSave("published")}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><Save size={16} /> Publish Blueprint</span>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Sections Builder */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings size={18} className="text-indigo-400" />
              Exam Sections
            </h3>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-zinc-400">
              {sections.length} Section{sections.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {sections.map((section, index) => {
              // Calculate available matches
              const matchCount = availableQuestions.filter(q => 
                (section.allowedDifficulty.length === 0 || section.allowedDifficulty.includes(q.difficulty)) &&
                (section.allowedBloomLevels.length === 0 || section.allowedBloomLevels.includes(q.bloomLevel)) &&
                q.status === 'ready'
              ).length;
              const hasDeficit = matchCount < section.questionCount;

              return (
              <Card key={section.id} className={`!p-0 overflow-hidden group transition-all ${hasDeficit ? '!bg-red-950/20 border-red-500/20' : '!bg-zinc-900/50 border-white/5'}`}>
                <div className={`flex items-stretch border-b bg-black/20 ${hasDeficit ? 'border-red-500/20' : 'border-white/5'}`}>
                  <div className={`w-10 flex flex-col items-center justify-center border-r cursor-move hover:text-white transition-colors hover:bg-white/5 ${hasDeficit ? 'border-red-500/20 text-red-500/50' : 'border-white/5 text-zinc-600'}`}>
                    <GripVertical size={16} />
                  </div>
                  <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 flex items-center gap-3">
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(section.id, "title", e.target.value)}
                        placeholder="e.g. Section A - Multiple Choice"
                        className={`bg-transparent border-transparent hover:border-white/10 focus:bg-white/5 text-lg font-bold px-3 py-1.5 h-auto transition-all m-[-4px] ${hasDeficit ? 'text-red-400 focus:border-red-500/50' : 'focus:border-indigo-500/50'}`}
                      />
                      {hasDeficit && (
                        <div className="px-2 py-1 rounded-md bg-red-500/20 border border-red-500/30 text-[10px] font-black uppercase text-red-400 tracking-wider">
                          Scope Deficit: {matchCount}/{section.questionCount}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => removeSection(section.id)}
                        disabled={sections.length === 1}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
                        title="Remove section"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid sm:grid-cols-2 gap-8">
                  {/* Scope Controls */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className={`text-xs uppercase tracking-widest flex justify-between ${hasDeficit ? 'text-red-400/80' : 'text-zinc-500'}`}>
                        <span>Questions limits</span>
                        <span className={`font-bold ${hasDeficit ? 'text-red-400' : 'text-zinc-400'}`}>{section.questionCount} Qs (Max {matchCount})</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={section.questionCount}
                        onChange={(e) => updateSection(section.id, "questionCount", parseInt(e.target.value))}
                        className={`w-full ${hasDeficit ? 'accent-red-500' : 'accent-indigo-500'}`}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-2">
                      <label className="text-xs uppercase tracking-widest text-zinc-500 flex justify-between">
                        <span>Total marks allocation</span>
                        <span className="text-indigo-400 font-bold">{section.marks} Marks</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        step="1"
                        max="200"
                        value={section.marks}
                        onChange={(e) => updateSection(section.id, "marks", parseInt(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Coverage Rules */}
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-xs uppercase tracking-widest text-zinc-500">Allowed Difficulties</label>
                      <div className="flex flex-wrap gap-2">
                        {difficultyLevels.map(diff => {
                          const isActive = section.allowedDifficulty.includes(diff);
                          return (
                            <button
                              key={diff}
                              onClick={() => toggleArrayValue(section.id, 'allowedDifficulty', diff)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isActive 
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                                  : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'
                              }`}
                            >
                              {diff}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <label className="text-xs uppercase tracking-widest text-zinc-500">Allowed Cognitive Levels</label>
                      <div className="flex flex-wrap gap-2">
                        {bloomLevels.map(bloom => {
                          const isActive = section.allowedBloomLevels.includes(bloom);
                          return (
                            <button
                              key={bloom}
                              onClick={() => toggleArrayValue(section.id, 'allowedBloomLevels', bloom)}
                              className={`px-3 py-1 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                isActive 
                                  ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' 
                                  : 'bg-transparent text-zinc-500 border-white/5 hover:border-white/20'
                              }`}
                            >
                              {bloom}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              );
            })}
          </div>

          <button
            onClick={addSection}
            className="w-full py-4 rounded-xl border border-dashed border-white/10 text-zinc-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all font-bold text-sm flex items-center justify-center gap-2 group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform" /> 
            Add New Section
          </button>
        </div>

        {/* Right Column: Meta & Details */}
        <div className="flex flex-col gap-6">
          <Card className="!bg-zinc-950 border-white/5 shadow-2xl relative overflow-hidden flex flex-col gap-6">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500" />
            
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-violet-400" />
              Template Details
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-500">Template Name <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="e.g. Midterm Computer Science"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/50 border-white/10"
                />
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-xs uppercase tracking-widest text-zinc-500">Exam Type</label>
                 <select 
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="h-11 w-full rounded-xl bg-black/50 border border-white/10 text-white text-sm font-medium px-4 focus:outline-none focus:border-indigo-500/50 transition-colors"
                 >
                   {examTypes.map(t => (
                     <option key={t} value={t} className="bg-zinc-900">{t}</option>
                   ))}
                 </select>
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-xs uppercase tracking-widest text-zinc-500 flex justify-between">
                   <span>Duration</span>
                   <span className="text-white font-bold">{duration} mins</span>
                 </label>
                 <input
                    type="range"
                    min="15"
                    max="300"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-white"
                  />
              </div>
            </div>
          </Card>

          <Card className="!bg-zinc-900/50 border-white/5 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target size={18} className="text-emerald-400" />
              Blueprint Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1 items-center justify-center text-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="text-3xl font-black text-white">{totalQuestions}</span>
                 <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 group-hover:text-indigo-400 transition-colors">Questions</span>
              </div>
              
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1 items-center justify-center text-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="text-3xl font-black text-white">{totalMarks}</span>
                 <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 group-hover:text-emerald-400 transition-colors">Total Marks</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
