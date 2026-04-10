"use client";

import { Search, X } from "lucide-react";
import { Button, Input, Select } from "@examcraft/ui";

export interface QuestionFilters {
  search: string;
  difficulty: string[];
  status: string;
  subject: string;
  topic: string;
}

interface QuestionFiltersProps {
  filters: QuestionFilters;
  onFiltersChange: (filters: QuestionFilters) => void;
  subjects: Array<{ id: string; name: string }>;
  statuses?: Array<{ label: string; value: string }>;
}

const difficultyOptions = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" }
];

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Ready", value: "ready" },
  { label: "Archived", value: "archived" }
];

export function QuestionFilters({
  filters,
  onFiltersChange,
  subjects,
  statuses = statusOptions
}: QuestionFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleDifficultyToggle = (difficulty: string) => {
    const newDifficulties = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty];
    onFiltersChange({ ...filters, difficulty: newDifficulties });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, status: e.target.value });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, subject: e.target.value });
  };

  const handleReset = () => {
    onFiltersChange({
      search: "",
      difficulty: [],
      status: "",
      subject: "",
      topic: ""
    });
  };

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.difficulty.length +
    (filters.status ? 1 : 0) +
    (filters.subject ? 1 : 0) +
    (filters.topic ? 1 : 0);

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl shadow-lg">
      {/* Search Input */}
      <Input
        placeholder="Search by title..."
        value={filters.search}
        onChange={handleSearchChange}
        leftIcon={<Search size={18} />}
        className="bg-slate-800/60 border-white/20"
      />

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Subject Filter */}
        <Select
          label="Subject"
          value={filters.subject}
          onChange={handleSubjectChange}
          options={[
            { label: "All Subjects", value: "" },
            ...subjects.map(s => ({ label: s.name, value: s.id }))
          ]}
        />

        {/* Status Filter */}
        <Select
          label="Status"
          value={filters.status}
          onChange={handleStatusChange}
          options={statuses}
        />

        {/* Difficulty Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Difficulty
          </label>
          <div className="flex gap-2">
            {difficultyOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleDifficultyToggle(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  filters.difficulty.includes(opt.value)
                    ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-400"
                    : "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <Button
            variant="ghost"
            onClick={handleReset}
            fullWidth
            className="border-white/5 hover:border-white/10"
          >
            <X size={16} />
            Reset
          </Button>
        </div>
      </div>

      {/* Active Filter Count */}
      {activeFilterCount > 0 && (
        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
          {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
        </div>
      )}
    </div>
  );
}
