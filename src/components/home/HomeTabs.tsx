"use client";

import React, { memo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Note } from "@/types/note";

interface TabProps {
  id: string;
  title: string;
  isActive: boolean;
  isFocused?: boolean;
  isModified?: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent) => void;
  onOpenToSide?: (id: string) => void;
}

const Tab = memo(({
  id, title, isActive, isFocused, isModified,
  onSelect, onClose, onOpenToSide,
}: TabProps) => {
  const parts = title.split("/");
  const fileName = parts[parts.length - 1] || "Untitled";
  const folderPrefix = parts.length > 1 ? parts.slice(0, -1).join("/") + "/" : null;

  return (
    <div
      onClick={onSelect}
      onContextMenu={(e) => {
        if (onOpenToSide) { e.preventDefault(); onOpenToSide(id); }
      }}
      className={cn(
        "group relative flex items-center gap-2 px-3 h-9 border-r border-[var(--border)] cursor-pointer whitespace-nowrap select-none shrink-0",
        "min-w-[100px] max-w-[200px] overflow-hidden transition-colors duration-150",
        isActive
          ? "bg-[var(--background)] text-[var(--foreground)]"
          : "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--card)]/30 hover:text-[var(--foreground)]"
      )}
    >
      {/* active top bar */}
      {isActive && (
        <motion.div
          layoutId="tab-active-bar"
          className={cn(
            "absolute top-0 left-0 right-0 h-[2px]",
            isFocused ? "bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" : "bg-[var(--border)]"
          )}
          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
        />
      )}

      {/* modified dot */}
      {isModified && (
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
      )}
      {!isModified && (
        <div className={cn(
          "w-1.5 h-1.5 shrink-0 transition-colors",
          isActive ? "bg-[var(--primary)]/60" : "bg-[var(--muted-foreground)]/20"
        )} />
      )}

      {/* title */}
      <div className="flex items-baseline gap-0.5 min-w-0 flex-1">
        {folderPrefix && (
          <span className="text-[8px] font-mono text-[var(--muted-foreground)]/40 truncate hidden sm:block">
            {folderPrefix}
          </span>
        )}
        <span className={cn(
          "text-[9px] font-mono font-semibold uppercase tracking-wide truncate",
          isActive ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
        )}>
          {fileName || "UNTITLED"}
        </span>
      </div>

      {/* close */}
      <button
        onClick={onClose}
        className={cn(
          "w-4 h-4 flex items-center justify-center rounded-sm flex-shrink-0 transition-all",
          isActive
            ? "opacity-50 hover:opacity-100 hover:bg-[var(--foreground)]/10 hover:text-[var(--destructive)]"
            : "opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-[var(--destructive)]"
        )}
      >
        <X size={10} />
      </button>
    </div>
  );
});

Tab.displayName = "Tab";

interface HomeTabsProps {
  openNoteIds: string[];
  notes: Note[];
  activeNoteId: string | null;
  secondaryNoteId: string | null;
  focusedPane: "left" | "right";
  handleSelectNote: (id: string) => void;
  handleOpenToSide: (id: string) => void;
  handleCloseNote: (id: string) => void;
  onCloseAll?: () => void;
}

export const HomeTabs = ({
  openNoteIds, notes, activeNoteId, secondaryNoteId,
  focusedPane, handleSelectNote, handleOpenToSide, handleCloseNote, onCloseAll
}: HomeTabsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (openNoteIds.length === 0) return null;

  return (
    <div className="flex bg-[var(--card)]/10 border-b border-[var(--border)] min-h-[36px] max-h-[36px] relative z-20">
      <div
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto custom-scrollbar relative no-scrollbar"
      >
        {/* fade gradients for scroll indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />

        {openNoteIds.map((id) => {
          const note = notes.find((n) => n.id === id);
          if (!note) return null;
          const isPrimary = activeNoteId === id;
          const isSecondary = secondaryNoteId === id;
          const isFocused =
            (isPrimary && focusedPane === "left") ||
            (isSecondary && focusedPane === "right");
          return (
            <Tab
              key={id}
              id={id}
              title={note.title || "Untitled"}
              isActive={isPrimary || isSecondary}
              isFocused={isFocused}
              onSelect={() => handleSelectNote(id)}
              onClose={(e) => { e.stopPropagation(); handleCloseNote(id); }}
              onOpenToSide={handleOpenToSide}
            />
          );
        })}
      </div>

      {/* Close All Button (Fixed at end) */}
      {openNoteIds.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onCloseAll) onCloseAll();
          }}
          className="flex items-center gap-1.5 px-3 h-full border-l border-[var(--border)] bg-[var(--background)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] transition-all group shrink-0"
        >
          <X size={10} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100">Close_All</span>
        </button>
      )}
    </div>
  );
};
