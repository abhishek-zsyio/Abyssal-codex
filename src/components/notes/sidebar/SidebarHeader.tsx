"use client";

import React from "react";
import { FilePlus, FolderPlus, Trash2, ChevronsDownUp, Search } from "lucide-react";

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
    <div className="p-5 border-b border-[var(--border)] bg-[var(--card)]/5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[var(--foreground)] tracking-tight uppercase leading-none flex items-baseline gap-2">
          Explorer
          <span className="text-[10px] font-mono text-[var(--muted-foreground)] font-normal tracking-normal lowercase opacity-40">/root</span>
        </h1>
        
        <div className="flex items-center gap-0.5">
          <button 
            onClick={() => {
              const title = selectedFolderPath ? `${selectedFolderPath}/Untitled` : "Untitled";
              onAddNote(title);
            }} 
            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
            title={selectedFolderPath ? `New File in ${selectedFolderPath}` : "New File"}
          >
            <FilePlus size={14} />
          </button>
          <button 
            onClick={onAddFolder} 
            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
          {selectedFolderPath && onDeleteFolder && (
            <button 
              onClick={() => onDeleteFolder(selectedFolderPath)} 
              className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
              title={`Delete ${selectedFolderPath}`}
            >
              <Trash2 size={14} />
            </button>
          )}
          <button 
            onClick={onCollapseAll} 
            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
            title="Collapse All"
          >
            <ChevronsDownUp size={14} />
          </button>
        </div>
      </div>

      <div className="relative group/search">
        <div className="absolute inset-y-0 left-0 w-8 flex items-center justify-center text-[var(--muted-foreground)] group-focus-within/search:text-[var(--primary)] transition-colors">
          <Search size={12} strokeWidth={3} />
        </div>
        <input
          type="text"
          placeholder="LOCATE_NODE..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--background)]/50 border border-[var(--border)] py-2 pl-8 pr-4 text-[10px] font-mono focus:outline-none focus:border-[var(--primary)]/50 transition-all placeholder:text-[var(--muted-foreground)]/30 uppercase tracking-widest"
        />
      </div>
    </div>
  );
};

SidebarHeader.displayName = "SidebarHeader";
