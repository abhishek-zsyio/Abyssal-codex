"use client";

import React, { useState, memo, useEffect } from "react";
import { ChevronRight, ChevronDown, FileText, Folder, Trash2, Star, FileJson, FileCode, Settings, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TreeItem, TreeFolder, TreeFile } from "@/utils/tree";
import { motion, AnimatePresence } from "framer-motion";

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

const getFileIcon = (name: string, isActive: boolean) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconClass = cn("w-3.5 h-3.5", isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]");
  
  if (ext === 'json') return <FileJson className={iconClass} />;
  if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) return <FileCode className={iconClass} />;
  if (name.startsWith('.')) return <Settings className={iconClass} />;
  return <FileText className={iconClass} />;
};

const FolderItem = memo(({ 
  folder, 
  activeNoteId, 
  onSelectNote, 
  onOpenToSide,
  onDeleteNote, 
  onMoveNote,
  onMoveFolder,
  level,
  parentPath,
  collapseTrigger,
  selectedFolderPath,
  onSelectFolder,
  onDeleteFolder,
  isCreatingFolder,
  setIsCreatingFolder,
  onAddFolder
}: { 
  folder: TreeFolder; 
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
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
}) => {
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

const FileItem = memo(({ 
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
}: { 
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
}) => {
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
            onBlur={(e) => {
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
          <FolderItem 
            key={item.id} 
            folder={item} 
            activeNoteId={activeNoteId} 
            onSelectNote={onSelectNote} 
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
          <FileItem 
            key={item.id} 
            file={item} 
            activeNoteId={activeNoteId} 
            onSelectNote={onSelectNote} 
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
