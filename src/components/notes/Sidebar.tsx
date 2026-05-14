"use client";

import React, { useRef, memo, useState, useMemo } from "react";
import { Note } from "@/types/note";
import { cn } from "../../lib/utils";
import { Search, X, Hash, Tag, Download, Upload, FolderPlus, FilePlus, ChevronsDownUp, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, slideInLeft } from "@/lib/transitions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/DataDisplay";
import { usePlugins } from "@/hooks/use-plugins";
import SidebarPlugins from "./SidebarPlugins";
import SidebarHelp from "./SidebarHelp";

import { SidebarSkeleton } from "./sidebar/SidebarSkeleton";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import NestedExplorer from "./sidebar/NestedExplorer";
import { buildNoteTree } from "@/utils/tree";

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
  const { isEnabled } = usePlugins();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [internalActiveView, setInternalActiveView] = useState<"explorer" | "plugins" | "help">("explorer");
  const activeView = onViewChange ? externalActiveView : internalActiveView;
  const setActiveView = (onViewChange || setInternalActiveView) as any;

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
            // If closed, always open it and set the view
            setActiveView(view);
            window.dispatchEvent(new CustomEvent('abyssal-sidebar-open'));
          } else if (view === activeView) {
            // If open and clicking the same view, toggle it closed
            onClose?.();
          } else {
            // If open and clicking a different view, just switch view
            setActiveView(view);
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
                      onClick={() => setIsCreatingFolder(true)} 
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
                      onClick={() => setCollapseTrigger(prev => prev + 1)} 
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

              <div className="flex-shrink-0 px-6 pt-4 empty:hidden">
                <AnimatePresence>
                  {activeTag && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 mb-3 overflow-hidden"
                    >
                      <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase">Filtered by:</span>
                      <button
                        onClick={() => setActiveTag(null)}
                        className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 bg-[var(--primary)] text-[var(--background)] font-bold"
                      >
                        <Hash size={8} /> {activeTag} <X size={8} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {allTags.length > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        className={cn(
                          "flex-shrink-0 flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 border transition-colors",
                          activeTag === tag
                            ? "bg-[var(--primary)] text-[var(--background)] border-[var(--primary)] font-bold"
                            : "text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--accent)] hover:border-[var(--accent)]"
                        )}
                      >
                        <Tag size={8} /> {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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

              <div className="p-6 border-t border-dotted border-[var(--border)] bg-[var(--background)]">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Button onClick={exportAllNotes} size="sm" className="bg-[var(--card)]/50 hover:bg-[var(--card)] border-[var(--border)] rounded-none h-9"><Download size={12} className="mr-2" /> Export</Button>
                  <Button onClick={() => fileInputRef.current?.click()} size="sm" className="bg-[var(--card)]/50 hover:bg-[var(--card)] border-[var(--border)] rounded-none h-9"><Upload size={12} className="mr-2" /> Import</Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
                <Button 
                  onClick={deleteAllNotes} 
                  variant="destructive" 
                  size="sm" 
                  className="w-full bg-[var(--destructive)]/10 hover:bg-[var(--destructive)] text-[var(--destructive)] hover:text-white border-[var(--destructive)]/30 text-[10px] font-mono tracking-widest h-10 rounded-none"
                >
                  <Trash2 size={12} className="mr-2" /> WIPE_ALL_BUFFERS
                </Button>
              </div>
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
