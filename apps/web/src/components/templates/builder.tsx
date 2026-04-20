"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, FileText, Settings, Target, Zap } from "lucide-react";
import { Card, Input, Button } from "@examcraft/ui";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import Link from "next/link";
import { toast } from "sonner";

interface ChoiceGroup {
  label: string;
  subQuestions: number;
  marksPerSub: number;
}

interface Section {
  id: string; 
  title: string;
  isOrGroup: boolean;
  questionCount: number;
  marks: number;
  choiceA?: ChoiceGroup;
  choiceB?: ChoiceGroup;
  difficultyCount: {
    easy: number;
    medium: number;
    hard: number;
  };
  allowedDifficulty: string[];
  allowedBloomLevels: string[];
}

export function TemplateBuilder({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [dbDepartments, setDbDepartments] = useState<any[]>([]);
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);

  // Template Meta
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("Midterm");
  const [duration, setDuration] = useState<number>(120);
  const [topTotalMarks, setTopTotalMarks] = useState<number>(30);
  
  // Sections
  const [sections, setSections] = useState<Section[]>([
    {
      id: crypto.randomUUID(),
      title: "Section A - Objective",
      isOrGroup: false,
      questionCount: 10,
      marks: 10,
      difficultyCount: { easy: 5, medium: 3, hard: 2 },
      allowedDifficulty: ["Easy", "Medium"],
      allowedBloomLevels: ["Remember", "Understand"]
    }
  ]);

  const calculatedTotalMarks = sections.reduce((sum, s) => sum + (s.marks || 0), 0);

  const totalQuestions = sections.reduce((sum, s) => {
    if (s.isOrGroup) {
      return sum + (s.choiceA?.subQuestions || 0) + (s.choiceB?.subQuestions || 0);
    }
    return sum + (s.questionCount || 0);
  }, 0);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const session = await getSupabaseBrowserSession();
        if (!session?.access_token || !isMounted) return;
        
        const [questionsRes, deptsRes, subjsRes] = await Promise.all([
          apiRequest<any[]>("/questions", {
            method: "GET",
            accessToken: session.access_token,
            institutionId
          }).catch(() => []),
          apiRequest<{ departments: any[] }>("/academic/departments", {
            method: "GET",
            accessToken: session.access_token,
            institutionId
          }).catch(() => ({ departments: [] })),
          apiRequest<{ subjects: any[] }>("/academic/subjects", {
            method: "GET",
            accessToken: session.access_token,
            institutionId
          }).catch(() => ({ subjects: [] }))
        ]);
        
        if (isMounted) {
          setAvailableQuestions(questionsRes);
          setDbDepartments(deptsRes?.departments || []);
          setDbSubjects(subjsRes?.subjects || []);
        }
      } catch (e) {
        // silently fail for metadata scope
      }
    }
    void loadData();
    return () => { isMounted = false; };
  }, [institutionId]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: crypto.randomUUID(),
        title: `Section ${String.fromCharCode(65 + sections.length)}`,
        isOrGroup: false,
        questionCount: 5,
        marks: 20,
        difficultyCount: { easy: 2, medium: 2, hard: 1 },
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
        department,
        semester,
        subject,
        examType,
        durationMinutes: duration,
        totalMarks: topTotalMarks || calculatedTotalMarks,
        sections: sections.map(({ id, ...rest }) => rest)
      };

      await apiRequest("/templates", {
        method: "POST",
        accessToken: session.access_token,
        institutionId,
        body: JSON.stringify(payload)
      });

      toast.success("Template created successfully!");
      router.push(`/dashboard/faculty/templates?institutionId=${institutionId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
      setIsSubmitting(false);
    }
  };

  const semesters = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];
  const examTypes = ["Unit Test", "Midterm", "Final Exam", "Mock Test", "Assignment", "Weekly Quiz"];
  const difficultyLevels = ["Easy", "Medium", "Hard"];
  const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-20 mt-4">
      {/* Header Panel */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/faculty/templates?institutionId=${institutionId}`}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight">New Template</h1>
           </div>
           <button 
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-500 hover:text-white text-xs font-bold transition-all flex items-center gap-2"
           >
             <Trash2 size={14} /> Cancel
           </button>
        </div>

        <Card className="!bg-[#151b2d] border-white/5 p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
           
           <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Template Name *</label>
                <Input 
                   placeholder="e.g. IT Sem 8 Distributed Systems Insem"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="bg-black/20 border-white/10 h-14 text-lg font-bold"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Department</label>
                    <select 
                       value={department}
                       onChange={(e) => setDepartment(e.target.value)}
                       className="h-12 w-full rounded-xl bg-black/20 border border-white/10 text-white text-sm font-medium px-4 focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="">Select...</option>
                      {dbDepartments.map(d => <option key={d.id} value={d.name} className="bg-zinc-900">{d.name}</option>)}
                    </select>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Semester</label>
                    <select 
                       value={semester}
                       onChange={(e) => setSemester(e.target.value)}
                       className="h-12 w-full rounded-xl bg-black/20 border border-white/10 text-white text-sm font-medium px-4 focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="">Select...</option>
                      {semesters.map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
                    </select>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Exam Type</label>
                    <select 
                       value={examType}
                       onChange={(e) => setExamType(e.target.value)}
                       className="h-12 w-full rounded-xl bg-black/20 border border-white/10 text-white text-sm font-medium px-4 focus:outline-none focus:border-indigo-500/50"
                    >
                      {examTypes.map(t => <option key={t} value={t} className="bg-zinc-900">{t}</option>)}
                    </select>
                 </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Subject *</label>
                    <select 
                       value={subject}
                       onChange={(e) => setSubject(e.target.value)}
                       className="h-12 w-full rounded-xl bg-black/20 border border-white/10 text-white text-sm font-medium px-4 focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="">Select Subject...</option>
                      {dbSubjects.map(s => <option key={s.id} value={s.name} className="bg-zinc-900">{s.name}</option>)}
                    </select>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Duration (Mins)</label>
                    <Input 
                       type="number"
                       placeholder="e.g. 120"
                       value={duration}
                       onChange={(e) => setDuration(parseInt(e.target.value))}
                       className="bg-black/20 border-white/10 h-12"
                    />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Total Marks</label>
                    <Input 
                       type="number"
                       placeholder="e.g. 30"
                       value={topTotalMarks}
                       onChange={(e) => setTopTotalMarks(parseInt(e.target.value))}
                       className="bg-black/20 border-white/10 h-12"
                    />
                 </div>
              </div>
           </div>

           <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                 <span className="text-xl font-black text-white">OR Groups</span>
                 <p className="text-[10px] text-zinc-500 font-medium max-w-sm italic">Each OR group = one question pair (e.g. Q1 or Q2). Student attempts either one.</p>
              </div>
              <Button 
                onClick={addSection}
                variant="secondary"
                size="sm"
                className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black hover:bg-indigo-500/20"
              >
                + Add OR Group
              </Button>
           </div>

           {/* Dynamic Sections (OR Groups) */}
           <div className="flex flex-col gap-8">
              {sections.map((section, sIdx) => (
                <div key={section.id} className="flex flex-col gap-6 p-8 bg-[#1a1f2e] border border-white/5 rounded-2xl relative overflow-hidden group/card shadow-xl">
                  <div className="flex items-center justify-between">
                     <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-lg shadow-lg shadow-indigo-500/20">OR Group {sIdx + 1}</span>
                     <button 
                        onClick={() => removeSection(section.id)}
                        className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                     >
                       <Settings size={14} className="opacity-50" />
                     </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Question A Label</label>
                        <Input 
                           className="bg-black/20 border-white/5 h-12 font-bold focus:bg-black/40" 
                           value={section.choiceA?.label || 'Q1'} 
                           onChange={(e) => updateSection(section.id, 'choiceA', { ...section.choiceA, label: e.target.value })}
                        />
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Question B Label</label>
                        <Input 
                           className="bg-black/20 border-white/5 h-12 font-bold focus:bg-black/40" 
                           value={section.choiceB?.label || 'Q2'} 
                           onChange={(e) => updateSection(section.id, 'choiceB', { ...section.choiceB, label: e.target.value })}
                        />
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sub-Questions (A, B, C...)</label>
                        <Input 
                           type="number"
                           className="bg-black/20 border-white/5 h-12 font-bold text-center sm:text-left focus:bg-black/40" 
                           value={section.choiceA?.subQuestions || 1}
                           onChange={(e) => {
                             const val = parseInt(e.target.value);
                             updateSection(section.id, 'choiceA', { ...section.choiceA, subQuestions: val });
                             updateSection(section.id, 'choiceB', { ...section.choiceB, subQuestions: val });
                           }}
                        />
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Marks per Sub-Question</label>
                        <Input 
                           type="number"
                           className="bg-black/20 border-white/5 h-12 font-bold text-center sm:text-left focus:bg-black/40" 
                           value={section.choiceA?.marksPerSub || 5}
                           onChange={(e) => {
                             const val = parseInt(e.target.value);
                             updateSection(section.id, 'choiceA', { ...section.choiceA, marksPerSub: val });
                             updateSection(section.id, 'choiceB', { ...section.choiceB, marksPerSub: val });
                             updateSection(section.id, 'marks', val * (section.choiceA?.subQuestions || 1));
                           }}
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
                     <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Easy
                        </label>
                        <Input 
                           type="number"
                           className="bg-black/20 border-white/5 h-12 font-bold text-center focus:bg-black/40" 
                           value={section.difficultyCount.easy}
                           onChange={(e) => updateSection(section.id, 'difficultyCount', { ...section.difficultyCount, easy: parseInt(e.target.value) })}
                        />
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Medium
                        </label>
                        <Input 
                           type="number"
                           className="bg-black/20 border-white/5 h-12 font-bold text-center focus:bg-black/40" 
                           value={section.difficultyCount.medium}
                           onChange={(e) => updateSection(section.id, 'difficultyCount', { ...section.difficultyCount, medium: parseInt(e.target.value) })}
                        />
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Difficult
                        </label>
                        <Input 
                           type="number"
                           className="bg-black/20 border-white/5 h-12 font-bold text-center focus:bg-black/40" 
                           value={section.difficultyCount.hard}
                           onChange={(e) => updateSection(section.id, 'difficultyCount', { ...section.difficultyCount, hard: parseInt(e.target.value) })}
                        />
                     </div>
                  </div>
                </div>
              ))}
           </div>

           <div className="flex gap-4 mt-8">
              <Button 
                variant="secondary" 
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-white/10 hover:bg-white/5"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest bg-[#674ef3] hover:bg-[#553edb] shadow-[0_0_40px_rgba(103,78,243,0.3)] border-0"
                onClick={() => handleSave("published")}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Template"}
              </Button>
           </div>
        </Card>

        {/* Templates Grid Placeholder (Match the prototype bottom section) */}
        <div className="grid md:grid-cols-2 gap-6 mt-4">
           {/* We can show recent ones here if needed, but for now just match the scrollable area intent */}
        </div>
      </div>
    </div>
  );
}
