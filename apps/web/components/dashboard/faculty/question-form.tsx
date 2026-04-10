"use client";

import { useState, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { Button, Input, Textarea } from "@examcraft/ui";
import { MetadataPanel } from "./metadata-panel";

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

  // MCQ state
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

    if (!validateForm()) return;

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
      className="grid xl:grid-cols-[1fr_320px] gap-8"
    >
      {/* Left Column - Content Editor (60%) */}
      <div className="flex flex-col gap-6">
        {/* Title Input */}
        <Input
          label="Question Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter question title..."
          error={errors.title}
          required
        />

        {/* Question Type Tabs */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
            Question Type
          </label>
          <div className="flex gap-2 p-1.5 rounded-xl bg-zinc-900/50 border border-white/5">
            {(["subjective", "mcq", "true_false"] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setQuestionType(type)}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  questionType === type
                    ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {type === "subjective"
                  ? "Subjective"
                  : type === "mcq"
                    ? "MCQ"
                    : "True/False"}
              </button>
            ))}
          </div>
        </div>

        {/* Question Body */}
        <Textarea
          label="Question Body"
          value={questionBody}
          onChange={e => setQuestionBody(e.target.value)}
          placeholder="Enter your question here..."
          error={errors.body}
          rows={8}
        />

        {/* MCQ Options Manager */}
        {questionType === "mcq" && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
              Options
            </label>
            <div className="space-y-3">
              {mcqOptions.map((option, idx) => (
                <div key={option.id} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={option.isCorrect}
                    onChange={() => handleOptionToggleCorrect(option.id)}
                    className="w-4 h-4 rounded-full cursor-pointer accent-indigo-500"
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={e =>
                      handleOptionChange(option.id, e.target.value)
                    }
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-800/60 border border-white/20 text-white focus:border-indigo-500 focus:ring-indigo-500/30 focus:outline-none transition-all text-sm"
                  />
                  {mcqOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(option.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}

              {mcqOptions.length < 6 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddOption}
                  className="w-full border-white/10 hover:border-indigo-500/20 text-indigo-400"
                >
                  <Plus size={16} />
                  Add Option
                </Button>
              )}
            </div>
            {errors.options && (
              <p className="text-xs text-red-400 mt-2">{errors.options}</p>
            )}
          </div>
        )}
      </div>

      {/* Right Column - Metadata Panel (40%) */}
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
