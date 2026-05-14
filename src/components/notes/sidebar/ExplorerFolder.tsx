"use client";

import React, { useState, memo, useEffect } from "react";
import { ChevronRight, ChevronDown, Folder, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TreeFolder } from "@/utils/tree";
import { motion, AnimatePresence } from "framer-motion";
import NestedExplorer from "./NestedExplorer";

interface ExplorerFolderProps {
  folder: TreeFolder;
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onOpenToSide?: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onMoveNote?: (id: string, targetPath: string) => void;
  onMoveFolder?: (oldPath: string, targetPath: string) => void;
  onDeleteFolder?: (path: string) => void;
  level: number;
  parentPath: string;
  collapseTrigger?: number;
  selectedFolderPath?: string | null;
  onSelectFolder?: (path: string | null) => void;
  isCreatingFolder?: boolean;
  setIsCreatingFolder?: (isCreating: boolean) => void;
  onAddFolder?: (path: string) => void;
}

export const ExplorerFolder = memo(({
  folder,
  activeNoteId,
  onSelectNote,
  onOpenToSide,
  onDeleteNote,
  onMoveNote,
  onMoveFolder,
  onDeleteFolder,
  level,
  parentPath,
  collapseTrigger,
  selectedFolderPath,
  onSelectFolder,
  isCreatingFolder,
  setIsCreatingFolder,
  onAddFolder
}: ExplorerFolderProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const currentPath = parentPath ? `${parentPath}/${folder.name}` : folder.name;
  const isSelected = selectedFolderPath === currentPath;

  useEffect(() => {
    if (collapseTrigger && collapseTrigger > 0) {
      setIsOpen(false);
    }
  }, [collapseTrigger]);

  useEffect(() => {
    if (isCreatingFolder && selectedFolderPath === currentPath) {
      setIsOpen(true);
    }
  }, [isCreatingFolder, selectedFolderPath, currentPath]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("folderPath", currentPath);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const noteId = e.dataTransfer.getData("noteId");
    const draggedFolderPath = e.dataTransfer.getData("folderPath");
    
    if (noteId && onMoveNote) {
      onMoveNote(noteId, currentPath);
    } else if (draggedFolderPath && onMoveFolder) {
      if (currentPath === draggedFolderPath || currentPath.startsWith(draggedFolderPath + "/")) {
        return;
      }
      onMoveFolder(draggedFolderPath, currentPath);
    }
  };

  return (
    <div className="w-full">
      <div 
        draggable="true"
        onDragStart={handleDragStart}
        onClick={() => {
          setIsOpen(!isOpen);
          onSelectFolder?.(currentPath);
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-colors group relative border-l-2",
          isSelected ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-transparent",
          isDragOver && "bg-[var(--primary)]/10 border-l-[var(--primary)]",
          "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/30"
        )}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
      >
        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
          {isOpen ? <ChevronDown size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" /> : <ChevronRight size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />}
        </div>
        <Folder size={14} className={cn("text-[var(--accent)] fill-[var(--accent)]/5", isOpen ? "opacity-90" : "opacity-60")} />
        <span className={cn("text-[11px] font-mono uppercase tracking-tight truncate flex-1", isSelected && "text-[var(--primary)] font-bold")}>
          {folder.name}
        </span>
        {onDeleteFolder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFolder(currentPath);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all hover:bg-[var(--destructive)]/10 rounded-none"
            title="Delete Folder"
          >
            <Trash2 size={10} />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: "circOut" }}
            className="overflow-hidden relative"
          >
            <div 
              className={cn("absolute left-0 top-0 bottom-0 w-[1px]", isSelected ? "bg-[var(--primary)] opacity-40" : "bg-[var(--border)] opacity-60")} 
              style={{ marginLeft: `${(level * 12) + 15}px` }}
            />
            
            <NestedExplorer 
              items={folder.children} 
              activeNoteId={activeNoteId} 
              onSelectNote={onSelectNote} 
              onOpenToSide={onOpenToSide}
              onDeleteNote={onDeleteNote}
              onMoveNote={onMoveNote}
              onMoveFolder={onMoveFolder}
              onDeleteFolder={onDeleteFolder}
              level={level + 1}
              parentPath={currentPath}
              collapseTrigger={collapseTrigger}
              selectedFolderPath={selectedFolderPath}
              onSelectFolder={onSelectFolder}
              isCreatingFolder={isCreatingFolder}
              setIsCreatingFolder={setIsCreatingFolder}
              onAddFolder={onAddFolder}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ExplorerFolder.displayName = "ExplorerFolder";
