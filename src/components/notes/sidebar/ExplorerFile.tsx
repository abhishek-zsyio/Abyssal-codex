"use client";

import React, { useState, memo } from "react";
import { FileText, Trash2, Star, FileJson, FileCode, Settings, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TreeFile } from "@/utils/tree";

interface ExplorerFileProps {
  file: TreeFile;
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onOpenToSide?: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onMoveNote?: (id: string, targetPath: string) => void;
  onMoveFolder?: (oldPath: string, targetPath: string) => void;
  level: number;
  parentPath: string;
  onSelectFolder?: (path: string | null) => void;
}

const getFileIcon = (name: string, isActive: boolean) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconClass = cn("w-3.5 h-3.5", isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]");
  
  if (ext === 'json') return <FileJson className={iconClass} />;
  if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) return <FileCode className={iconClass} />;
  if (name.startsWith('.')) return <Settings className={iconClass} />;
  return <FileText className={iconClass} />;
};

export const ExplorerFile = memo(({ 
  file, 
  activeNoteId, 
  onSelectNote, 
  onOpenToSide,
  onDeleteNote, 
  onMoveNote,
  onMoveFolder,
  level,
  parentPath,
  onSelectFolder
}: ExplorerFileProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const isActive = activeNoteId === file.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("noteId", file.id);
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
    
    if (noteId && onMoveNote && noteId !== file.id) {
      onMoveNote(noteId, parentPath);
    } else if (draggedFolderPath && onMoveFolder) {
      if (parentPath === draggedFolderPath || parentPath.startsWith(draggedFolderPath + "/")) {
        return;
      }
      onMoveFolder(draggedFolderPath, parentPath);
    }
  };

  return (
    <div 
      draggable="true"
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => {
        if ((e.metaKey || e.ctrlKey) && onOpenToSide) {
          onOpenToSide(file.id);
        } else {
          onSelectNote(file.id);
        }
        onSelectFolder?.(parentPath || null);
      }}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-all group relative border-l-2",
        isActive 
          ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)] font-bold shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.05)]" 
          : "border-transparent text-[var(--foreground)]/70 hover:bg-[var(--card)]/40 hover:text-[var(--foreground)]",
        isDragOver && "bg-[var(--primary)]/5 ring-1 ring-inset ring-[var(--primary)]/20"
      )}
      style={{ paddingLeft: `${(level * 12) + 24}px` }}
    >
      <div className="flex-shrink-0">
        {getFileIcon(file.name, isActive)}
      </div>
      <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
        {file.note.isFavorite && <Star size={8} className="text-[var(--primary)] fill-[var(--primary)] flex-shrink-0" />}
        <span className="text-[11px] font-mono truncate tracking-tight uppercase">
          {file.name}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {onOpenToSide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenToSide(file.id);
            }}
            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all rounded-none"
            title="Open to Side"
          >
            <PanelRight size={12} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteNote(file.id);
          }}
          className="p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all hover:bg-[var(--destructive)]/10 rounded-none"
          title="Purge Node"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
});

ExplorerFile.displayName = "ExplorerFile";
