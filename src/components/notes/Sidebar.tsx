"use client";

import React, { useRef, memo, useState, useMemo } from "react";
import { Note } from "@/types/note";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { slideInLeft } from "@/lib/transitions";
import { Badge } from "@/components/ui/DataDisplay";
import SidebarPlugins from "./SidebarPlugins";
import SidebarHelp from "./SidebarHelp";

import { SidebarSkeleton } from "./sidebar/SidebarSkeleton";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import NestedExplorer from "./sidebar/NestedExplorer";
import { buildNoteTree } from "@/utils/tree";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarTags } from "./sidebar/SidebarTags";
import { SidebarFooter } from "./sidebar/SidebarFooter";

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: (title?: string) => void;
  onDeleteNote: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  exportAllNotes?: () => void;
  importNotes?: (notes: Note[]) => void;
  deleteAllNotes?: () => void;
  onOpenThemes?: () => void;
  onToggleTerminal?: () => void;
  onOpenAuth?: () => void;
  onOpenSecurity?: () => void;
  isLoggedIn?: boolean;
  isLoading?: boolean;
  activeView?: "explorer" | "plugins" | "help";
  onViewChange?: (view: "explorer" | "plugins" | "help") => void;
  onOpenGraph?: () => void;
  onUpdateNote?: (id: string, updates: Partial<Note>) => void;
  folders?: string[];
  onAddFolder?: (path: string) => void;
  onRenameFolder?: (oldPath: string, newPath: string) => void;
  onDeleteFolder?: (path: string) => void;
  onOpenToSide?: (id: string) => void;
}

const Sidebar = memo(({
  notes,
  activeNoteId,
  onSelectNote,
  onAddNote,
  onDeleteNote,
  searchQuery,
  setSearchQuery,
  isOpen = true,
  onClose,
  exportAllNotes,
  importNotes,
  deleteAllNotes,
  onOpenThemes,
  onToggleTerminal,
  onOpenAuth,
  onOpenSecurity,
  isLoggedIn,
  isLoading,
  activeView: externalActiveView = "explorer",
  onViewChange,
  onOpenGraph,
  onUpdateNote,
  folders = [],
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  onOpenToSide,
}: SidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [internalActiveView, setInternalActiveView] = useState<"explorer" | "plugins" | "help">("explorer");
  const activeView = onViewChange ? externalActiveView : internalActiveView;
  
  const handleViewChange = (view: "explorer" | "plugins" | "help") => {
    if (onViewChange) {
      onViewChange(view);
    } else {
      setInternalActiveView(view);
    }
  };

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(n => (n.tags || []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  const displayNotes = useMemo(() => {
    if (!activeTag) return notes;
    return notes.filter(n => (n.tags || []).includes(activeTag));
  }, [notes, activeTag]);

  const regularNotes = useMemo(() => displayNotes.filter(n => !n.isFavorite), [displayNotes]);

  const noteTree = useMemo(() => buildNoteTree(displayNotes, folders), [displayNotes, folders]);
  
  const isFiltering = !!activeTag;
  const [collapseTrigger, setCollapseTrigger] = useState(0);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null);

  const handleMoveNote = (id: string, targetPath: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    const parts = note.title.split("/");
    const fileName = parts[parts.length - 1];
    const newTitle = targetPath ? `${targetPath}/${fileName}` : fileName;
    
    if (onUpdateNote) {
      onUpdateNote(id, { title: newTitle });
      
      window.dispatchEvent(new CustomEvent('abyssal-log', { 
        detail: { message: `REALLOCATING_BUFFER: [${fileName}] -> [${targetPath || 'ROOT'}]`, type: 'system' } 
      }));
    }
  };

  const handleMoveFolder = (oldPath: string, targetParentPath: string) => {
    const folderParts = oldPath.split("/");
    const folderName = folderParts[folderParts.length - 1];
    const newFolderPath = targetParentPath ? `${targetParentPath}/${folderName}` : folderName;
    
    const notesToMove = notes.filter(n => n.title === oldPath || n.title.startsWith(oldPath + "/"));
    
    if (onUpdateNote) {
      notesToMove.forEach(note => {
        const relativePath = note.title.substring(oldPath.length);
        const newTitle = `${newFolderPath}${relativePath}`;
        onUpdateNote(note.id, { title: newTitle });
      });

      window.dispatchEvent(new CustomEvent('abyssal-log', { 
        detail: { message: `RELOCATING_CLUSTER: [${folderName}] -> [${targetParentPath || 'ROOT'}]`, type: 'system' } 
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && importNotes) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          importNotes(JSON.parse(event.target?.result as string));
        } catch (error) {
          console.error("Import failed", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <aside className={cn(
      "h-full flex border-r border-[var(--border)] bg-[var(--background)] relative transition-all duration-300 ease-in-out",
      isOpen ? "w-80" : "w-14"
    )}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      <SidebarNavigation 
        activeView={activeView}
        setActiveView={(view) => {
          if (!isOpen) {
            handleViewChange(view);
            window.dispatchEvent(new CustomEvent('abyssal-sidebar-open'));
          } else if (view === activeView) {
            onClose?.();
          } else {
            handleViewChange(view);
          }
        }}
        isOpen={isOpen}
        onOpenGraph={onOpenGraph}
        onOpenThemes={onOpenThemes}
        onToggleTerminal={onToggleTerminal}
        onOpenAuth={onOpenAuth}
        onOpenSecurity={onOpenSecurity}
        isLoggedIn={isLoggedIn}
      />

      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300",
        isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
      )}>
        <AnimatePresence mode="wait">
          {activeView === "explorer" ? (
            <motion.div 
              key="explorer"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={slideInLeft}
              className="flex-1 flex flex-col overflow-hidden relative"
            >
              <SidebarHeader 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedFolderPath={selectedFolderPath}
                onAddNote={onAddNote}
                onAddFolder={() => setIsCreatingFolder(true)}
                onDeleteFolder={onDeleteFolder}
                onCollapseAll={() => setCollapseTrigger(prev => prev + 1)}
              />

              <SidebarTags 
                allTags={allTags}
                activeTag={activeTag}
                setActiveTag={setActiveTag}
              />

              <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {isLoading ? (
                  <SidebarSkeleton />
                ) : (displayNotes.length === 0 && folders.length === 0 && !isCreatingFolder) ? (
                  <div className="p-8 text-center text-[10px] font-mono text-[var(--muted-foreground)]">
                    {activeTag ? `No notes tagged #${activeTag}` : "No notes found."}
                  </div>
                ) : (
                  <>
                    <div>
                      <div 
                        onClick={() => setSelectedFolderPath(null)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add("bg-[var(--primary)]/10");
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove("bg-[var(--primary)]/10");
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove("bg-[var(--primary)]/10", "border-[var(--primary)]");
                          const noteId = e.dataTransfer.getData("noteId");
                          const folderPath = e.dataTransfer.getData("folderPath");
                          
                          if (noteId) {
                            handleMoveNote(noteId, "");
                          } else if (folderPath) {
                            handleMoveFolder(folderPath, "");
                          }
                        }}
                        className="px-4 py-1.5 text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em] bg-[var(--card)]/30 flex items-center justify-between border-y border-dotted border-[var(--border)]/30 transition-all group"
                      >
                         <span className="group-hover:text-[var(--foreground)] transition-colors font-bold">Workspace</span>
                         <Badge variant="outline" className="text-[8px] h-4 px-1 opacity-50">{isFiltering ? displayNotes.length : regularNotes.length}</Badge>
                      </div>
                      
                      <div className="py-2 overflow-y-auto custom-scrollbar flex-1">
                        <NestedExplorer 
                          items={noteTree} 
                          activeNoteId={activeNoteId} 
                          onSelectNote={onSelectNote} 
                          onOpenToSide={onOpenToSide}
                          onDeleteNote={onDeleteNote} 
                          onMoveNote={handleMoveNote}
                          onMoveFolder={onRenameFolder || handleMoveFolder}
                          onDeleteFolder={onDeleteFolder}
                          collapseTrigger={collapseTrigger}
                          selectedFolderPath={selectedFolderPath}
                          onSelectFolder={setSelectedFolderPath}
                          isCreatingFolder={isCreatingFolder}
                          setIsCreatingFolder={setIsCreatingFolder}
                          onAddFolder={onAddFolder}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <SidebarFooter 
                onExport={exportAllNotes}
                onImportClick={() => fileInputRef.current?.click()}
                onWipe={deleteAllNotes}
              />
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            </motion.div>
          ) : activeView === "plugins" ? (
            <motion.div key="plugins" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }} className="flex-1 flex flex-col overflow-hidden">
              <SidebarPlugins onClose={onClose} />
            </motion.div>
          ) : (
            <motion.div key="help" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }} className="flex-1 flex flex-col overflow-hidden">
              <SidebarHelp onClose={onClose} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
});
Sidebar.displayName = "Sidebar";

export default Sidebar;
