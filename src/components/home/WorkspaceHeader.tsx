"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface WorkspaceHeaderProps {
  mainView: "editor" | "graph";
  setMainView: (view: "editor" | "graph") => void;
  activeNoteTitle?: string;
  isSplitPane: boolean;
  setIsSplitPane: (split: boolean) => void;
  hasSecondaryNote: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const WorkspaceHeader = ({
  mainView,
  setMainView,
  activeNoteTitle,
  isSplitPane,
  setIsSplitPane,
  hasSecondaryNote,
  setIsSidebarOpen
}: WorkspaceHeaderProps) => {
  return (
    <div className="h-14 border-b border-[var(--border)] bg-[var(--card)]/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-6 h-full">
        <div className="flex flex-col">
          <span className="text-[7px] font-mono text-[var(--primary)] uppercase tracking-[0.4em] mb-0.5">Workspace_Mode</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMainView("editor")}
              className={cn(
                "text-[10px] font-mono font-bold uppercase tracking-widest transition-all px-3 py-1 border",
                mainView === "editor" 
                  ? "bg-[var(--primary)] text-[var(--background)] border-[var(--primary)] shadow-[0_0_15px_rgba(250,189,47,0.3)]" 
                  : "text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]/50"
              )}
            >
              01 // EDITOR_CORE
            </button>
            <button
              onClick={() => setMainView("graph")}
              className={cn(
                "text-[10px] font-mono font-bold uppercase tracking-widest transition-all px-3 py-1 border",
                mainView === "graph" 
                  ? "bg-[var(--primary)] text-[var(--background)] border-[var(--primary)] shadow-[0_0_15px_rgba(250,189,47,0.3)]" 
                  : "text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]/50"
              )}
            >
              02 // NEXUS_GRAPH
            </button>
          </div>
        </div>

        {mainView === "editor" && activeNoteTitle && (
          <div className="h-8 w-px bg-[var(--border)] mx-2 opacity-30" />
        )}

        {mainView === "editor" && activeNoteTitle && (
          <div className="hidden md:flex flex-col">
            <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-0.5">Active_Node</span>
            <span className="text-[10px] font-mono font-bold text-[var(--foreground)] uppercase truncate max-w-[200px]">
              {activeNoteTitle || "UNTITLED_SEGMENT"}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {mainView === "editor" && hasSecondaryNote && (
          <Button
            variant={isSplitPane ? "warning" : "ghost"}
            size="sm"
            onClick={() => {
              const nextSplitState = !isSplitPane;
              setIsSplitPane(nextSplitState);
              if (nextSplitState) setIsSidebarOpen(false);
            }}
            className="h-8 px-3 text-[9px] font-mono uppercase tracking-widest border border-[var(--border)]"
          >
            {isSplitPane ? "MERGE_PANES" : "SPLIT_STREAM"}
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
          <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-tighter">System_Live</span>
        </div>
      </div>
    </div>
  );
};
