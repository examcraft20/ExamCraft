"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, X, Loader2, Save, Trash2, ChevronRight, AlertCircle } from "lucide-react";
import { Button, Input, Textarea } from "@examcraft/ui";
import { MetadataPanel } from "./metadata-panel";
import { toast } from "sonner";

interface QuestionFormProps {
  initialData?: {
    id: string;
    title: string;
    questionType: "subjective" | "mcq" | "true_false";
    questionBody: string;
    mcqOptions?: Array<{ id: string; text: string; isCorrect: boolean }>;
    difficulty: string;
    bloomLevel: string;
    unitNumber: number | null;
    courseOutcomes: string[];
    tags: string[];
  };
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function QuestionForm({
  initialData,
  onSubmit,
  isLoading = false
}: QuestionFormProps) {
  const [questionType, setQuestionType] = useState<"subjective" | "mcq" | "true_false">(
    initialData?.questionType || "subjective"
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [questionBody, setQuestionBody] = useState(
    initialData?.questionBody || ""
  );
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "medium");
  const [bloomLevel, setBloomLevel] = useState(initialData?.bloomLevel || "");
  const [unitNumber, setUnitNumber] = useState(initialData?.unitNumber || null);
  const [courseOutcomes, setCourseOutcomes] = useState(
    initialData?.courseOutcomes || []
  );
  const [tags, setTags] = useState(initialData?.tags || []);

  const [mcqOptions, setMcqOptions] = useState(
    initialData?.mcqOptions || [
      { id: "1", text: "", isCorrect: true },
      { id: "2", text: "", isCorrect: false },
      { id: "3", text: "", isCorrect: false },
      { id: "4", text: "", isCorrect: false }
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Track dirty state
  useEffect(() => {
    const hasChanged = 
      title !== (initialData?.title || "") ||
      questionBody !== (initialData?.questionBody || "") ||
      questionType !== (initialData?.questionType || "subjective") ||
      difficulty !== (initialData?.difficulty || "medium") ||
      bloomLevel !== (initialData?.bloomLevel || "") ||
      unitNumber !== (initialData?.unitNumber || null);
    
    setIsDirty(hasChanged);
  }, [title, questionBody, questionType, difficulty, bloomLevel, unitNumber, initialData]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Question title required";
    if (!questionBody.trim()) newErrors.body = "Question body required";
    if (!bloomLevel) newErrors.bloomLevel = "Bloom level required";

    if (questionType === "mcq") {
      const filledOptions = mcqOptions.filter(o => o.text.trim());
      if (filledOptions.length < 2) {
        newErrors.options = "At least 2 options required";
      }
      if (!mcqOptions.some(o => o.isCorrect && o.text.trim())) {
        newErrors.options = "Mark at least one correct option";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, questionBody, bloomLevel, questionType, mcqOptions]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSubmitting || isLoading) return;

    if (!validateForm()) {
      toast.error("Form validation failed. Please review mandatory fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = {
        title,
        questionType,
        questionBody,
        difficulty,
        bloomLevel,
        unitNumber,
        courseOutcomes,
        tags,
        ...(questionType === "mcq" && {
          mcqOptions: mcqOptions.filter(o => o.text.trim())
        })
      };

      await onSubmit(formData);
      setIsDirty(false); // Reset dirty state on successful submit
      toast.success("Question successfully persisted to bank");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Persistence failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOption = () => {
    if (mcqOptions.length < 6) {
      setMcqOptions([
        ...mcqOptions,
        { id: Date.now().toString(), text: "", isCorrect: false }
      ]);
    }
  };

  const handleRemoveOption = (id: string) => {
    if (mcqOptions.length > 2) {
      setMcqOptions(mcqOptions.filter(o => o.id !== id));
    }
  };

  const handleOptionChange = (id: string, text: string) => {
    setMcqOptions(
      mcqOptions.map(o => (o.id === id ? { ...o, text } : o))
    );
  };

  const handleOptionToggleCorrect = (id: string) => {
    setMcqOptions(
      mcqOptions.map(o => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o))
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid xl:grid-cols-[1fr_340px] gap-10 animate-in fade-in duration-700 ${isSubmitting ? 'opacity-70 pointer-events-none' : ''}`}
    >
      {/* Left Column - Content Editor */}
      <div className="flex flex-col gap-8">
        {/* Title Input */}
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
              Semantic Header
           </label>
           <Input
             value={title}
             onChange={e => setTitle(e.target.value)}
             placeholder="Short identifier for the item bank..."
             className="bg-zinc-900/50 border-white/10 h-16 rounded-2xl px-6 text-base font-bold text-white focus:border-indigo-500/50 transition-all"
             error={errors.title}
             required
           />
        </div>

        {/* Question Type Tabs */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 mb-4">
            Structural Prototype
          </label>
          <div className="flex gap-2 p-2 rounded-2xl bg-zinc-950 border border-white/5">
            {(["subjective", "mcq", "true_false"] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setQuestionType(type)}
                className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  questionType === type
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {type === "subjective"
                  ? "Subjective"
                  : type === "mcq"
                    ? "MCQ"
                    : "True / False"}
              </button>
            ))}
          </div>
        </div>

        {/* Question Body */}
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
              Item Corpus
           </label>
           <Textarea
             value={questionBody}
             onChange={e => setQuestionBody(e.target.value)}
             placeholder="Orchestrate the core question text here... supports markdown."
             className="bg-zinc-900/50 border-white/10 rounded-[2rem] p-8 text-white focus:border-indigo-500/50 min-h-[300px] text-lg font-medium leading-relaxed"
             error={errors.body}
             rows={12}
           />
        </div>

        {/* MCQ Options Manager */}
        {questionType === "mcq" && (
          <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
                 Option Array
               </label>
               {errors.options && (
                 <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1">
                   <AlertCircle size={10} /> {errors.options}
                 </p>
               )}
            </div>
            <div className="space-y-4">
              {mcqOptions.map((option, idx) => (
                <div key={option.id} className="flex items-center gap-4 group">
                  <button
                    type="button"
                    onClick={() => handleOptionToggleCorrect(option.id)}
                    className={`w-12 h-12 rounded-2xl border transition-all flex items-center justify-center flex-shrink-0 ${
                       option.isCorrect 
                         ? "bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20" 
                         : "bg-zinc-950 border-white/5 text-zinc-700 hover:border-white/10"
                    }`}
                  >
                     {option.isCorrect ? <CheckCircle2 size={24} /> : <div className="w-2 h-2 rounded-full bg-zinc-800" />}
                  </button>
                  <input
                    type="text"
                    value={option.text}
                    onChange={e =>
                      handleOptionChange(option.id, e.target.value)
                    }
                    placeholder={`Response schema ${idx + 1}`}
                    className="flex-1 h-14 px-6 rounded-2xl bg-zinc-900/50 border border-white/10 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm font-medium"
                  />
                  {mcqOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(option.id)}
                      className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}

              {mcqOptions.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="w-full h-14 rounded-2xl bg-white/[0.02] border border-white/5 border-dashed text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <Plus size={16} />
                  Appended Option Slot
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Metadata Panel */}
      <MetadataPanel
        difficulty={difficulty}
        bloomLevel={bloomLevel}
        unitNumber={unitNumber}
        courseOutcomes={courseOutcomes}
        tags={tags}
        onDifficultyChange={setDifficulty}
        onBloomLevelChange={setBloomLevel}
        onUnitNumberChange={setUnitNumber}
        onCourseOutcomesChange={setCourseOutcomes}
        onTagsChange={setTags}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting || isLoading}
        isDraft={!initialData}
      />
    </form>
  );
}

// Helper icons for the custom design
function CheckCircle2({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
