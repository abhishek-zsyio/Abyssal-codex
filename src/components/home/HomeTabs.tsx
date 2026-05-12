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
      "flex items-center gap-3 px-4 h-10 border-r border-[var(--border)] text-[8px] font-mono cursor-pointer transition-all whitespace-nowrap group relative min-w-[100px] md:min-w-[140px] max-w-[200px] md:max-w-[240px] overflow-hidden",
      isActive 
        ? "bg-[var(--card)]/40 text-[var(--primary)]" 
        : "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--card)]/20 hover:text-[var(--foreground)]"
    )}
  >
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    
    {isActive && (
      <>
        <motion.div 
          layoutId="active-tab-top"
          className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--primary)] shadow-[0_0_12px_var(--primary)]" 
        />
        <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-[var(--primary)]" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[var(--primary)]" />
      </>
    )}
    
    <div className={cn(
      "w-2 h-2 border transition-colors flex-shrink-0 rotate-45",
      isActive ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--muted-foreground)] opacity-50"
    )} />
    
    <div className="flex flex-col min-w-0 flex-1 py-1">
       <span className="text-[6px] opacity-40 uppercase tracking-[0.3em] leading-none mb-0.5">Stream_Ref</span>
       <span className="truncate font-black uppercase tracking-[0.1em]">
         {title || "UNTITLED"}
       </span>
    </div>

    <button 
      onClick={onClose} 
      className={cn(
        "p-1.5 hover:text-[var(--destructive)] transition-colors ml-2 relative z-10", 
        isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100"
      )}
    >
      <X size={11} />
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
    <div className="flex bg-[var(--background)] border-b border-[var(--border)] overflow-x-auto no-scrollbar min-h-[40px] relative z-20">
      <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none opacity-50" />
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
