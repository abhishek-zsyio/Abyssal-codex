"use client";

import React, { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileText, Share2, Columns2, ChevronRight, Menu } from "lucide-react";

interface WorkspaceHeaderProps {
  mainView: "editor" | "graph";
  setMainView: (view: "editor" | "graph") => void;
  activeNoteTitle?: string;
  isSplitPane: boolean;
  setIsSplitPane: (split: boolean) => void;
  hasSecondaryNote: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const WorkspaceHeader = memo(({
  mainView,
  setMainView,
  activeNoteTitle,
  isSplitPane,
  setIsSplitPane,
  hasSecondaryNote,
  setIsSidebarOpen,
}: WorkspaceHeaderProps) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // parse breadcrumb parts from title like "folder/subfolder/note"
  const parts = activeNoteTitle ? activeNoteTitle.split("/") : [];

  return (
    <div className="h-10 border-b border-[var(--border)] bg-[var(--card)]/20 flex items-center px-3 gap-3 relative overflow-hidden shrink-0">
      {/* top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/15 to-transparent pointer-events-none" />

      {/* mobile menu trigger */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden w-7 h-7 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors shrink-0"
      >
        <Menu size={14} />
      </button>

      {/* view switcher */}
      <div className="flex items-center gap-0 border border-[var(--border)] bg-[var(--background)]/60 p-0.5 shrink-0">
        {([
          { key: "editor", label: "EDITOR" },
          { key: "graph",  label: "GRAPH"  },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMainView(key)}
            className={cn(
              "relative px-3 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest transition-all",
              mainView === key
                ? "text-[var(--background)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {mainView === key && (
              <motion.div
                layoutId="hdr-active-tab"
                className="absolute inset-0 bg-[var(--primary)]"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {/* breadcrumb */}
      {mainView === "editor" && (
        <div className="flex-1 flex items-center gap-1 min-w-0 overflow-hidden">
          {parts.length === 0 ? (
            <span className="text-[9px] font-mono text-[var(--muted-foreground)]/40 uppercase tracking-widest">
              no file open
            </span>
          ) : (
            parts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight size={10} className="text-[var(--muted-foreground)]/30 shrink-0" />}
                <span
                  className={cn(
                    "text-[9px] font-mono truncate",
                    i === parts.length - 1
                      ? "text-[var(--foreground)] font-semibold"
                      : "text-[var(--muted-foreground)]/50"
                  )}
                >
                  {part}
                </span>
              </React.Fragment>
            ))
          )}
        </div>
      )}
      {mainView === "graph" && (
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          <Share2 size={10} className="text-[var(--primary)]/60 shrink-0" />
          <span className="text-[9px] font-mono text-[var(--muted-foreground)]/50 uppercase tracking-widest">
            Knowledge Graph
          </span>
        </div>
      )}

      {/* right side actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* time */}
        <span className="hidden md:block text-[8px] font-mono text-[var(--muted-foreground)]/30 tabular-nums">
          {time}
        </span>

        {/* split toggle */}
        {mainView === "editor" && hasSecondaryNote && (
          <button
            onClick={() => {
              setIsSplitPane(!isSplitPane);
            }}
            title={isSplitPane ? "Close split" : "Split editor"}
            className={cn(
              "h-6 px-2 text-[8px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all",
              isSplitPane
                ? "border-[var(--destructive)]/60 text-[var(--destructive)] bg-[var(--destructive)]/5"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50 hover:text-[var(--foreground)]"
            )}
          >
            <Columns2 size={10} />
            {isSplitPane ? "UNSPLIT" : "SPLIT"}
          </button>
        )}

        {/* live dot */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-[var(--primary)] animate-pulse shadow-[0_0_6px_var(--primary)]" />
          <span className="hidden sm:block text-[7px] font-mono text-[var(--muted-foreground)]/40 uppercase tracking-widest">LIVE</span>
        </div>
      </div>
    </div>
  );
});

WorkspaceHeader.displayName = "WorkspaceHeader";
