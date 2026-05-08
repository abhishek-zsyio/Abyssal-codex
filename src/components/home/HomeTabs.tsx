"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { softSpring } from "@/lib/transitions";
import { Note } from "@/types/note";

interface TabProps {
  id: string;
  title: string;
  isActive: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent) => void;
}

const Tab = memo(({ 
  id, 
  title, 
  isActive, 
  onSelect, 
  onClose 
}: TabProps) => (
  <div 
    onClick={onSelect}
    className={cn(
      "flex items-center gap-2 md:gap-3 px-3 md:px-5 h-10 border-r border-[var(--border)] text-[10px] font-mono cursor-pointer transition-all whitespace-nowrap group relative min-w-[100px] md:min-w-[140px] max-w-[200px] md:max-w-[240px]",
      isActive 
        ? "bg-[var(--card)] text-[var(--primary)]" 
        : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--card)]/40 hover:text-[var(--foreground)]"
    )}
  >
    {isActive && (
      <motion.div 
        layoutId="active-tab"
        transition={softSpring}
        className="absolute top-0 left-0 right-0 h-[1.5px] bg-[var(--primary)] shadow-[0_0_8px_rgba(250,189,47,0.4)]" 
      />
    )}
    <FileText size={12} className={cn(isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />
    <span className="truncate flex-1 font-bold uppercase tracking-[0.15em] py-1">
      {title || "UNTITLED"}
    </span>
    <button 
      onClick={onClose} 
      className={cn(
        "p-1 rounded-sm hover:bg-[var(--border)] transition-colors ml-2", 
        isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100"
      )}
    >
      <X size={10} />
    </button>
  </div>
));

Tab.displayName = "Tab";

interface HomeTabsProps {
  openNoteIds: string[];
  notes: Note[];
  activeNoteId: string | null;
  handleSelectNote: (id: string) => void;
  handleCloseNote: (id: string) => void;
}

export const HomeTabs = ({
  openNoteIds,
  notes,
  activeNoteId,
  handleSelectNote,
  handleCloseNote
}: HomeTabsProps) => {
  if (openNoteIds.length === 0) return null;

  return (
    <div className="flex bg-[var(--background)] border-b border-[var(--border)] overflow-x-auto no-scrollbar min-h-[40px]">
      {openNoteIds.map(id => {
        const note = notes.find(n => n.id === id);
        if (!note) return null;
        return (
          <Tab 
            key={id}
            id={id}
            title={note.title || "UNTITLED"}
            isActive={activeNoteId === id}
            onSelect={() => handleSelectNote(id)}
            onClose={(e) => {
              e.stopPropagation();
              handleCloseNote(id);
            }}
          />
        );
      })}
    </div>
  );
};
