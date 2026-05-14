"use client";

import React from "react";
import { Hash, X } from "lucide-react";
import { Badge } from "@/components/ui/DataDisplay";

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
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-6 mb-4">
      {tags.map(tag => (
        <Badge key={tag} variant="success" className="gap-1">
          <Hash size={8} /> {tag}
          <button onClick={() => onRemoveTag(tag)} className="hover:text-[var(--destructive)] ml-1">
            <X size={8} />
          </button>
        </Badge>
      ))}
      <input 
        type="text"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={onAddTag}
        placeholder="+ Add Tag..."
        className="bg-transparent border-none outline-none text-[10px] font-mono text-[var(--muted-foreground)] w-24"
      />
    </div>
  );
};

EditorTags.displayName = "EditorTags";
