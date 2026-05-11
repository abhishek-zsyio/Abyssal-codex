"use client";

import React, { useState, memo, useEffect } from "react";
import { ChevronRight, ChevronDown, FileText, Folder, Trash2, Star, FileJson, FileCode, Settings, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { TreeItem, TreeFolder, TreeFile } from "@/utils/tree";
import { motion, AnimatePresence } from "framer-motion";

interface NestedExplorerProps {
  items: TreeItem[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onMoveNote?: (id: string, targetPath: string) => void;
  onMoveFolder?: (oldPath: string, targetPath: string) => void;
  level?: number;
  parentPath?: string;
  collapseTrigger?: number;
}

const getFileIcon = (name: string, isActive: boolean) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconClass = cn("w-3.5 h-3.5", isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]");
  
  if (ext === 'json') return <FileJson className={iconClass} />;
  if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) return <FileCode className={iconClass} />;
  if (name.startsWith('.')) return <Settings className={iconClass} />;
  return <FileText className={iconClass} />;
};

const FolderItem = ({ 
  folder, 
  activeNoteId, 
  onSelectNote, 
  onDeleteNote, 
  onMoveNote,
  onMoveFolder,
  level,
  parentPath,
  collapseTrigger
}: { 
  folder: TreeFolder; 
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onMoveNote?: (id: string, targetPath: string) => void;
  onMoveFolder?: (oldPath: string, targetPath: string) => void;
  level: number;
  parentPath: string;
  collapseTrigger?: number;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const currentPath = parentPath ? `${parentPath}/${folder.name}` : folder.name;

  // Handle Collapse All trigger
  useEffect(() => {
    if (collapseTrigger && collapseTrigger > 0) {
      setIsOpen(false);
    }
  }, [collapseTrigger]);

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
        onClick={() => setIsOpen(!isOpen)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1 cursor-pointer transition-colors group relative border-l-2 border-transparent",
          isDragOver && "bg-[var(--primary)]/10 border-l-[var(--primary)]",
          "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/30"
        )}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
      >
        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
          {isOpen ? <ChevronDown size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" /> : <ChevronRight size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />}
        </div>
        <Folder size={14} className={cn("text-[var(--accent)] fill-[var(--accent)]/5", isOpen ? "opacity-90" : "opacity-60")} />
        <span className="text-[11px] font-mono uppercase tracking-tight truncate flex-1">
          {folder.name}
        </span>
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
              className="absolute left-0 top-0 bottom-0 w-[1px] border-l border-dotted border-[var(--border)] opacity-30" 
              style={{ marginLeft: `${(level * 12) + 15}px` }}
            />
            
            <NestedExplorer 
              items={folder.children} 
              activeNoteId={activeNoteId} 
              onSelectNote={onSelectNote} 
              onDeleteNote={onDeleteNote}
              onMoveNote={onMoveNote}
              onMoveFolder={onMoveFolder}
              level={level + 1}
              parentPath={currentPath}
              collapseTrigger={collapseTrigger}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FileItem = ({ 
  file, 
  activeNoteId, 
  onSelectNote, 
  onDeleteNote, 
  level 
}: { 
  file: TreeFile; 
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  level: number;
}) => {
  const isActive = activeNoteId === file.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("noteId", file.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div 
      draggable="true"
      onDragStart={handleDragStart}
      onClick={() => onSelectNote(file.id)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 cursor-pointer transition-all group relative border-l-2",
        isActive 
          ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)] font-bold shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.05)]" 
          : "border-transparent text-[var(--foreground)]/70 hover:bg-[var(--card)]/40 hover:text-[var(--foreground)]"
      )}
      style={{ paddingLeft: `${(level * 12) + 24}px` }}
    >
      <div className="flex-shrink-0">
        {getFileIcon(file.name, isActive)}
      </div>
      <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
        {file.note.isFavorite && <Star size={8} className="text-[var(--primary)] fill-[var(--primary)] flex-shrink-0" />}
        <span className="text-[11px] font-mono truncate tracking-tight">
          {file.name}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteNote(file.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-0.5 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all hover:bg-[var(--destructive)]/10 rounded"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};

const NestedExplorer = memo(({ 
  items, 
  activeNoteId, 
  onSelectNote, 
  onDeleteNote, 
  onMoveNote,
  onMoveFolder,
  level = 0,
  parentPath = "",
  collapseTrigger
}: NestedExplorerProps) => {
  return (
    <div className="flex flex-col w-full">
      {items.map((item) => (
        item.type === "folder" ? (
          <FolderItem 
            key={item.id} 
            folder={item} 
            activeNoteId={activeNoteId} 
            onSelectNote={onSelectNote} 
            onDeleteNote={onDeleteNote}
            onMoveNote={onMoveNote}
            onMoveFolder={onMoveFolder}
            level={level}
            parentPath={parentPath}
            collapseTrigger={collapseTrigger}
          />
        ) : (
          <FileItem 
            key={item.id} 
            file={item} 
            activeNoteId={activeNoteId} 
            onSelectNote={onSelectNote} 
            onDeleteNote={onDeleteNote}
            level={level}
          />
        )
      ))}
    </div>
  );
});

NestedExplorer.displayName = "NestedExplorer";

export default NestedExplorer;
