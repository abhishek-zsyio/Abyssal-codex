"use client";

import React from "react";
import { Hash, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorTagsProps {
  tags: string[];
  tagInput: string;
  setTagInput: (val: string) => void;
  onAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag: (tag: string) => void;
}

export const EditorTags = ({
  tags,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
}: EditorTagsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--border)] pb-6 mb-6">
      {tags.map(tag => (
        <div 
          key={tag} 
          className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[9px] font-mono font-bold text-[var(--primary)] uppercase tracking-tight"
        >
          <Hash size={8} /> {tag}
          <button 
            onClick={() => onRemoveTag(tag)} 
            className="hover:text-[var(--foreground)] transition-colors ml-0.5 opacity-50 hover:opacity-100"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-1 px-2 py-0.5 border border-dashed border-[var(--border)] opacity-40 hover:opacity-100 transition-opacity">
        <Plus size={10} />
        <input 
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={onAddTag}
          placeholder="ADD_METADATA…"
          className="bg-transparent border-none outline-none text-[9px] font-mono text-[var(--foreground)] w-24 placeholder:text-[var(--muted-foreground)]"
        />
      </div>
    </div>
  );
};

EditorTags.displayName = "EditorTags";
