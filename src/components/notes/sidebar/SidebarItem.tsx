"use client";

import React, { memo } from "react";
import { Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Note } from "@/types/note";

interface SidebarItemProps {
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SidebarItem = memo(({ 
  note, 
  isActive, 
  onSelect, 
  onDelete 
}: SidebarItemProps) => (
  <div
    className={cn(
      "group relative px-6 py-4 cursor-pointer border-b border-dotted border-[var(--border)]/50 transition-colors",
      isActive 
        ? "bg-[var(--card)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[var(--primary)]" 
        : "hover:bg-[var(--card)]/40"
    )}
    onClick={() => onSelect(note.id)}
  >
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2 overflow-hidden">
        {note.isFavorite && <Star size={10} className="text-[var(--primary)] fill-[var(--primary)] flex-shrink-0" />}
        <span className={cn(
          "text-[11px] font-bold uppercase tracking-wider truncate",
          isActive ? "text-[var(--primary)]" : "text-[var(--foreground)]"
        )}>
          {String(note.title || "UNTITLED_DOC")}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all"
      >
        <Trash2 size={12} />
      </button>
    </div>
    
    <div className="flex items-center justify-between mb-2">
      <span className="text-[9px] font-mono text-[var(--muted-foreground)] truncate max-w-[80%]">
        {String(note.content || "").substring(0, 40) || "NO_CONTENT..."}
      </span>
      <span className="text-[8px] font-mono text-[var(--muted-foreground)] opacity-50">
        {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
      </span>
    </div>

    {(note.tags || []).length > 0 && (
      <div className="flex gap-1 overflow-hidden">
        {note.tags?.slice(0, 3).map(tag => (
          <span key={tag} className="text-[8px] font-mono px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] uppercase">
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
));

SidebarItem.displayName = "SidebarItem";
