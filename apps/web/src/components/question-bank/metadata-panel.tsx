"use client";

import { Button } from "@examcraft/ui";

interface MetadataPanelProps {
  difficulty: string;
  bloomLevel: string;
  unitNumber: number | null;
  courseOutcomes: string[];
  tags: string[];
  onDifficultyChange: (value: string) => void;
  onBloomLevelChange: (value: string) => void;
  onUnitNumberChange: (value: number | null) => void;
  onCourseOutcomesChange: (value: string[]) => void;
  onTagsChange: (value: string[]) => void;
  onSubmit: (e?: React.FormEvent) => void | Promise<void>;
  isSubmitting: boolean;
  isDraft?: boolean;
}

const difficultyOptions = ["Easy", "Medium", "Hard"];
const bloomLevels = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];

export function MetadataPanel({
  difficulty,
  bloomLevel,
  unitNumber,
  courseOutcomes,
  tags,
  onDifficultyChange,
  onBloomLevelChange,
  onUnitNumberChange,
  onCourseOutcomesChange,
  onTagsChange,
  onSubmit,
  isSubmitting,
  isDraft = false,
}: MetadataPanelProps) {
  const handleCourseOutcomesChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const values = e.target.value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);
    onCourseOutcomesChange(values);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const values = e.target.value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);
    onTagsChange(values);
  };

  return (
    <div className="h-fit sticky top-6 rounded-[2rem] bg-zinc-900/50 border border-white/5 backdrop-blur-xl p-6 shadow-lg space-y-6">
      {/* Difficulty Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
          Difficulty Level
        </label>
        <div className="flex gap-2">
          {difficultyOptions.map((level) => (
            <button
              key={level}
              onClick={() => onDifficultyChange(level.toLowerCase())}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border ${
                difficulty === level.toLowerCase()
                  ? level === "Easy"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : level === "Hard"
                      ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Bloom Level Dropdown */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
          Bloom&apos;s Taxonomy Level
        </label>
        <select
          value={bloomLevel}
          onChange={(e) => onBloomLevelChange(e.target.value)}
          className="w-full px-4 py-2 rounded-xl bg-slate-800/60 border border-white/20 text-white focus:border-indigo-500 focus:ring-indigo-500/30 focus:outline-none transition-all text-sm"
        >
          <option value="">Select level...</option>
          {bloomLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Unit Number */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
          Unit/Chapter Number
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={unitNumber || ""}
          onChange={(e) =>
            onUnitNumberChange(e.target.value ? parseInt(e.target.value) : null)
          }
          placeholder="e.g., 3"
          className="w-full px-4 py-2 rounded-xl bg-slate-800/60 border border-white/20 text-white focus:border-indigo-500 focus:ring-indigo-500/30 focus:outline-none transition-all text-sm"
        />
      </div>

      {/* Course Outcomes */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
          Course Outcomes (comma-separated)
        </label>
        <textarea
          value={courseOutcomes.join(", ")}
          onChange={handleCourseOutcomesChange}
          placeholder="e.g., CO1, CO2, CO3"
          rows={3}
          className="w-full px-4 py-2 rounded-xl bg-slate-800/60 border border-white/20 text-white focus:border-indigo-500 focus:ring-indigo-500/30 focus:outline-none transition-all text-sm"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tags.join(", ")}
          onChange={handleTagsChange}
          placeholder="e.g., important, review, final-exam"
          className="w-full px-4 py-2 rounded-xl bg-slate-800/60 border border-white/20 text-white focus:border-indigo-500 focus:ring-indigo-500/30 focus:outline-none transition-all text-sm"
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4 border-t border-white/5">
        <Button
          variant="ghost"
          onClick={() => {
            // TODO: Save draft
          }}
          fullWidth
          disabled={isSubmitting}
          className="border-white/10"
        >
          Save Draft
        </Button>
        <Button
          type="button"
          onClick={() => onSubmit()}
          loading={isSubmitting}
          fullWidth
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
        >
          {isDraft ? "Submit for Review" : "Update"}
        </Button>
      </div>
    </div>
  );
}
