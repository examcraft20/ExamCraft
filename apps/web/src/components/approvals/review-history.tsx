"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@examcraft/ui";
import type { ReviewHistoryEntry } from "@/lib/dashboard";

interface ReviewHistoryProps {
  history: ReviewHistoryEntry[];
}

export function ReviewHistory({ history }: ReviewHistoryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      approve: "Approved",
      reject: "Rejected",
      comment: "Commented",
      archive: "Archived",
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "approve":
        return "text-emerald-400 bg-emerald-500/10";
      case "reject":
        return "text-red-400 bg-red-500/10";
      case "comment":
        return "text-amber-400 bg-amber-500/10";
      default:
        return "text-zinc-400 bg-zinc-500/10";
    }
  };

  if (history.length === 0) return null;

  return (
    <Card className="!bg-zinc-900/80 border-white/10 !rounded-2xl p-6 backdrop-blur-xl">
      <h3 className="text-lg font-black tracking-tight text-white mb-4">
        Review History
      </h3>

      <div className="flex flex-col gap-2">
        {history.map((entry, idx) => (
          <div
            key={idx}
            className="border border-white/10 rounded-lg overflow-hidden"
          >
            {/* Header - Always Visible */}
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === idx ? null : idx)
              }
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <div
                  className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${getActionColor(entry.action)}`}
                >
                  {getActionLabel(entry.action)}
                </div>
                <span className="text-xs text-zinc-500 font-bold">
                  {new Date(entry.reviewedAt).toLocaleDateString("en-US")} at{" "}
                  {new Date(entry.reviewedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-zinc-600 transition-transform ${
                  expandedIndex === idx ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Body - Expandable */}
            {expandedIndex === idx && entry.comment && (
              <div className="px-4 pb-4 bg-white/[0.02] border-t border-white/10">
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {entry.comment}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
