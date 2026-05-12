"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  setIsSidebarOpen
}: WorkspaceHeaderProps) => {
  return (
    <div className="h-14 border-b border-[var(--border)] bg-[var(--card)]/30 backdrop-blur-xl flex items-center justify-between px-6 relative overflow-hidden group">
      {/* Visual Accents */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent" />
      <div className="absolute top-0 left-8 w-px h-full bg-[var(--border)] opacity-20" />
      <div className="absolute top-0 right-8 w-px h-full bg-[var(--border)] opacity-20" />

      <div className="flex items-center gap-10 h-full relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-1 h-1 bg-[var(--primary)] animate-pulse" />
             <span className="text-[7px] font-mono text-[var(--primary)] uppercase tracking-[0.4em] font-black">Workspace_Protocol</span>
          </div>
          <div className="flex items-center p-0.5 bg-[var(--background)]/50 border border-[var(--border)] rounded-none gap-0.5">
            <button
              onClick={() => setMainView("editor")}
              className={cn(
                "text-[8px] font-mono font-bold uppercase tracking-[0.15em] transition-all px-3 py-1 relative overflow-hidden",
                mainView === "editor" 
                  ? "text-[var(--background)] z-10" 
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              {mainView === "editor" && (
                <motion.div 
                  layoutId="active-mode"
                  className="absolute inset-0 bg-[var(--primary)] -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              01 // EDITOR_CORE
            </button>
            <button
              onClick={() => setMainView("graph")}
              className={cn(
                "text-[8px] font-mono font-bold uppercase tracking-[0.15em] transition-all px-3 py-1 relative overflow-hidden",
                mainView === "graph" 
                  ? "text-[var(--background)] z-10" 
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              {mainView === "graph" && (
                <motion.div 
                  layoutId="active-mode"
                  className="absolute inset-0 bg-[var(--primary)] -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              02 // NEXUS_MAP
            </button>
          </div>
        </div>

      </div>

      <div className="flex items-center gap-8 relative z-10">
        {mainView === "editor" && hasSecondaryNote && (
          <button
            onClick={() => {
              const nextSplitState = !isSplitPane;
              setIsSplitPane(nextSplitState);
              if (nextSplitState) setIsSidebarOpen(false);
            }}
            className={cn(
              "h-8 px-4 text-[8px] font-mono font-black uppercase tracking-[0.2em] transition-all border flex items-center gap-2 group/btn",
              isSplitPane 
                ? "bg-[var(--destructive)]/10 border-[var(--destructive)] text-[var(--destructive)]" 
                : "bg-transparent border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
            )}
          >
            <div className={cn("w-1.5 h-1.5 border transition-colors", isSplitPane ? "border-[var(--destructive)] bg-[var(--destructive)]" : "border-[var(--muted-foreground)] group-hover/btn:border-[var(--primary)]")} />
            {isSplitPane ? "TERMINATE" : "SPLIT"}
          </button>
        )}
        
        <div className="flex flex-col items-end">
           <div className="flex items-center gap-2">
              <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">Network_Sync</span>
              <div className="w-1.5 h-1.5 rounded-none bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary)]" />
           </div>
           <span className="text-[9px] font-mono text-[var(--foreground)] font-bold tracking-tighter uppercase opacity-80 mt-0.5">0x7F_ACTIVE_NODE</span>
        </div>
      </div>
    </div>
  );
});
