"use client";

import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@examcraft/ui";
import { DifficultyBadge, StatusBadge } from "@examcraft/ui";

interface Question {
  id: string;
  title: string;
  subject: string;
  bloomLevel: string;
  difficulty: string;
  tags: string[];
  status: string;
  createdAt: string;
}

interface QuestionCardProps {
  question: Question;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
}

export function QuestionCard({
  question,
  onEdit,
  onDelete,
  onPreview
}: QuestionCardProps) {
  const truncatedTitle =
    question.title.length > 120
      ? question.title.substring(0, 120) + "..."
      : question.title;

  return (
    <div className="group rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all shadow-lg relative overflow-hidden p-6 flex flex-col h-full hover:bg-zinc-900/70">
      {/* Ambient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -z-10 group-hover:bg-indigo-500/10 transition-all" />

      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <StatusBadge status={question.status} />
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white mb-4 pr-12 leading-tight">
        {truncatedTitle}
      </h3>

      {/* Tags Row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-white/5 border border-white/10 text-slate-400">
          {question.subject}
        </span>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>

      {/* Bloom Level */}
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-4">
        Bloom: {question.bloomLevel}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer Actions */}
      <div className="flex gap-2 pt-4 border-t border-white/5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(question.id)}
          className="flex-1 border-white/10 hover:border-white/20 text-xs"
        >
          <Edit size={14} />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPreview(question.id)}
          className="flex-1 border-white/10 hover:border-white/20 text-xs"
        >
          <Eye size={14} />
          Preview
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(question.id)}
          className="flex-1 border-white/10 hover:border-red-500/20 text-xs hover:text-red-400"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}
