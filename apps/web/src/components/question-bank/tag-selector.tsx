"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@examcraft/ui";

interface TagSelectorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

export function TagSelector({ tags, onChange, label = "Tags" }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold"
          >
            #{tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tags... (Enter or comma)"
          className="pr-10"
        />
        <button
          onClick={addTag}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
