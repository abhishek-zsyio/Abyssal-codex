"use client";

import React, { memo } from "react";
import { Folder } from "lucide-react";
import { TreeItem } from "@/utils/tree";
import { ExplorerFolder } from "./ExplorerFolder";
import { ExplorerFile } from "./ExplorerFile";

interface NestedExplorerProps {
  items: TreeItem[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onOpenToSide?: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onMoveNote?: (id: string, targetPath: string) => void;
  onMoveFolder?: (oldPath: string, targetPath: string) => void;
  onDeleteFolder?: (path: string) => void;
  level?: number;
  parentPath?: string;
  collapseTrigger?: number;
  selectedFolderPath?: string | null;
  onSelectFolder?: (path: string | null) => void;
  isCreatingFolder?: boolean;
  setIsCreatingFolder?: (isCreating: boolean) => void;
  onAddFolder?: (path: string) => void;
}

const NestedExplorer = memo(({ 
  items, 
  activeNoteId, 
  onSelectNote, 
  onOpenToSide,
  onDeleteNote, 
  onMoveNote,
  onMoveFolder,
  onDeleteFolder,
  level = 0,
  parentPath = "",
  collapseTrigger,
  selectedFolderPath,
  onSelectFolder,
  isCreatingFolder,
  setIsCreatingFolder,
  onAddFolder
}: NestedExplorerProps) => {
  return (
    <div className="flex flex-col w-full">
      {isCreatingFolder && (parentPath === (selectedFolderPath || "")) && (
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 border-l-2 border-[var(--primary)] bg-[var(--primary)]/10"
          style={{ paddingLeft: `${(level * 12) + 8}px` }}
        >
          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            <Folder size={14} className="text-[var(--primary)] fill-[var(--primary)]/20" />
          </div>
          <input 
            autoFocus
            className="bg-transparent border-none outline-none text-[11px] font-mono uppercase tracking-tight w-full text-[var(--foreground)] placeholder:text-[var(--primary)]/30"
            placeholder="NEW_CLUSTER_NAME..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const name = e.currentTarget.value.trim();
                if (name && onAddFolder) {
                  const fullPath = parentPath ? `${parentPath}/${name}` : name;
                  onAddFolder(fullPath);
                  
                  window.dispatchEvent(new CustomEvent('abyssal-log', { 
                    detail: { message: `ALLOCATING_NEW_CLUSTER: [${fullPath}]`, type: 'system' } 
                  }));
                }
                setIsCreatingFolder?.(false);
              } else if (e.key === "Escape") {
                setIsCreatingFolder?.(false);
              }
            }}
            onBlur={() => {
              // Only cancel if we didn't just press Enter
              setTimeout(() => {
                setIsCreatingFolder?.(false);
              }, 200);
            }}
          />
        </div>
      )}
      {items.map((item) => (
        item.type === "folder" ? (
          <ExplorerFolder 
            key={item.id} 
            folder={item} 
            activeNoteId={activeNoteId} 
            onSelectNote={onSelectNote} 
            onOpenToSide={onOpenToSide}
            onDeleteNote={onDeleteNote}
            onMoveNote={onMoveNote}
            onMoveFolder={onMoveFolder}
            onDeleteFolder={onDeleteFolder}
            level={level}
            parentPath={parentPath}
            collapseTrigger={collapseTrigger}
            selectedFolderPath={selectedFolderPath}
            onSelectFolder={onSelectFolder}
            isCreatingFolder={isCreatingFolder}
            setIsCreatingFolder={setIsCreatingFolder}
            onAddFolder={onAddFolder}
          />
        ) : (
          <ExplorerFile 
            key={item.id} 
            file={item} 
            activeNoteId={activeNoteId} 
            onSelectNote={onSelectNote} 
            onOpenToSide={onOpenToSide}
            onDeleteNote={onDeleteNote} 
            onMoveNote={onMoveNote}
            onMoveFolder={onMoveFolder}
            level={level}
            parentPath={parentPath}
            onSelectFolder={onSelectFolder}
          />
        )
      ))}
    </div>
  );
});

NestedExplorer.displayName = "NestedExplorer";

export default NestedExplorer;
