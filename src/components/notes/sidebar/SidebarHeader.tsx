"use client";

import React from "react";
import { FilePlus, FolderPlus, Trash2, ChevronsDownUp, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFolderPath: string | null;
  onAddNote: (title?: string) => void;
  onAddFolder: () => void;
  onDeleteFolder?: (path: string) => void;
  onCollapseAll: () => void;
}

export const SidebarHeader = ({
  searchQuery,
  setSearchQuery,
  selectedFolderPath,
  onAddNote,
  onAddFolder,
  onDeleteFolder,
  onCollapseAll,
}: SidebarHeaderProps) => {
  return (
    <div className="flex flex-col border-b border-[var(--border)]">
      {/* title row */}
      <div className="flex flex-col px-3 py-2 border-b border-[var(--border)]/50 gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[var(--primary)] rotate-45" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              Explorer
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => {
                const title = selectedFolderPath ? `${selectedFolderPath}/Untitled` : "Untitled";
                onAddNote(title);
              }}
              title={selectedFolderPath ? `New file in ${selectedFolderPath}` : "New file"}
              className="w-6 h-6 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/8 transition-colors"
            >
              <FilePlus size={13} />
            </button>
            <button
              onClick={onAddFolder}
              title="New folder"
              className="w-6 h-6 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/8 transition-colors"
            >
              <FolderPlus size={13} />
            </button>
            {selectedFolderPath && onDeleteFolder && (
              <button
                onClick={() => onDeleteFolder(selectedFolderPath)}
                title={`Delete ${selectedFolderPath}`}
                className="w-6 h-6 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/8 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              onClick={onCollapseAll}
              title="Collapse all"
              className="w-6 h-6 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
            >
              <ChevronsDownUp size={13} />
            </button>
          </div>
        </div>

        {selectedFolderPath && (
          <div className="flex items-center gap-2 px-1 py-0.5 bg-[var(--primary)]/5 border-l-2 border-[var(--primary)]/30">
            <span className="text-[7px] font-mono text-[var(--primary)] uppercase opacity-40 shrink-0">PATH:</span>
            <span className="text-[8px] font-mono text-[var(--primary)] truncate uppercase tracking-tight">
              /{selectedFolderPath}
            </span>
          </div>
        )}
      </div>

      {/* search row */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-9 flex items-center justify-center text-[var(--muted-foreground)] pointer-events-none">
          <Search size={11} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          placeholder="Search…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-0 py-2 pl-9 pr-8 text-[11px] font-mono focus:outline-none placeholder:text-[var(--muted-foreground)]/30 text-[var(--foreground)]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-2 flex items-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={11} />
          </button>
        )}
      </div>
    </div>
  );
};

SidebarHeader.displayName = "SidebarHeader";
