"use client";

import React, { useRef, memo, useState, useMemo } from "react";
import { Note } from "@/types/note";
import { cn } from "../../lib/utils";
import { Plus, Search, X, Hash, Tag, Calendar, Download, Upload, FolderPlus, FilePlus, ChevronsDownUp, Star, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, slideInLeft } from "@/lib/transitions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/DataDisplay";
import { usePlugins } from "@/hooks/use-plugins";
import SidebarPlugins from "./SidebarPlugins";
import SidebarHelp from "./SidebarHelp";
import { SidebarItem } from "./sidebar/SidebarItem";
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
  onClose?: () => void;
  exportAllNotes?: () => void;
  importNotes?: (notes: Note[]) => void;
  deleteAllNotes?: () => void;
  onOpenHelp?: () => void;
  onOpenThemes?: () => void;

  onToggleTerminal?: () => void;
  onOpenPlugins?: () => void;
  onOpenAuth?: () => void;
  isLoggedIn?: boolean;
  isLoading?: boolean;
  activeView?: "explorer" | "plugins" | "help";
  onViewChange?: (view: "explorer" | "plugins" | "help") => void;
  onOpenGraph?: () => void;
  onUpdateNote?: (id: string, updates: Partial<Note>) => void;
  folders?: string[];
  onAddFolder?: (path: string) => void;
}

const Sidebar = memo(({
  notes,
  activeNoteId,
  onSelectNote,
  onAddNote,
  onDeleteNote,
  searchQuery,
  setSearchQuery,
  onClose,
  exportAllNotes,
  importNotes,
  deleteAllNotes,
  onOpenThemes,
  onToggleTerminal,
  onOpenAuth,
  isLoggedIn,
  isLoading,
  activeView: externalActiveView = "explorer",
  onViewChange,
  onOpenGraph,
  onUpdateNote,
  folders = [],
  onAddFolder,
}: SidebarProps) => {
  const { isEnabled } = usePlugins();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [internalActiveView, setInternalActiveView] = useState<"explorer" | "plugins" | "help">("explorer");
  const activeView = onViewChange ? externalActiveView : internalActiveView;
  const setActiveView = (onViewChange || setInternalActiveView) as any;

  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(n => (n.tags || []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  const displayNotes = useMemo(() => {
    let filtered = notes.filter(n => !n.title.endsWith("/.keep") && n.title !== ".keep");
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeTag) {
      filtered = filtered.filter(n => (n.tags || []).includes(activeTag));
    }
    return filtered;
  }, [notes, searchQuery, activeTag]);

  const pinnedNotes = useMemo(() => displayNotes.filter(n => n.isFavorite), [displayNotes]);
  const regularNotes = useMemo(() => displayNotes.filter(n => !n.isFavorite), [displayNotes]);

  const noteTree = useMemo(() => buildNoteTree(displayNotes, folders), [displayNotes, folders]);
  
  const isFiltering = !!searchQuery || !!activeTag;
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
    <aside className="w-80 h-full flex border-r border-dotted border-[var(--border)] bg-[var(--background)]">
      <SidebarNavigation 
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenGraph={onOpenGraph}
        onOpenThemes={onOpenThemes}
        onToggleTerminal={onToggleTerminal}
        onOpenAuth={onOpenAuth}
        isLoggedIn={isLoggedIn}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
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
              <div className="p-6 border-b border-dotted border-[var(--border)]">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.4em] mb-0.5 opacity-70">File System</span>
                    <h1 className="text-sm font-black text-[var(--foreground)] tracking-tighter uppercase">Explorer</h1>
                  </div>
                  <div className="flex items-center gap-0.5 self-end pb-0.5">
                    <button 
                      onClick={() => {
                        const title = selectedFolderPath ? `${selectedFolderPath}/Untitled` : "Untitled";
                        onAddNote(title);
                      }} 
                      className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--card)]/50 transition-colors rounded"
                      title={selectedFolderPath ? `New File in ${selectedFolderPath}` : "New File"}
                    >
                      <FilePlus size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        const folderName = window.prompt("Enter folder name:");
                        if (folderName && onAddFolder) {
                          onAddFolder(folderName);
                        }
                      }} 
                      className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--card)]/50 transition-colors rounded"
                      title="New Folder"
                    >
                      <FolderPlus size={14} />
                    </button>
                    {isEnabled("daily-notes") && (
                      <button 
                        onClick={() => {
                          const today = new Date().toLocaleDateString('en-CA');
                          const dailyNoteTitle = `Daily_${today}`;
                          const existing = notes.find(n => n.title === dailyNoteTitle);
                          
                          window.dispatchEvent(new CustomEvent('abyssal-log', { 
                            detail: { message: `INITIALIZING_DAILY_BUFFER: [${today}]`, type: 'system' } 
                          }));

                          if (existing) {
                            onSelectNote(existing.id);
                          } else {
                            onAddNote(dailyNoteTitle); 
                          }
                        }} 
                        className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--card)]/50 transition-colors rounded"
                        title="Daily Note"
                      >
                        <Calendar size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => setCollapseTrigger(prev => prev + 1)} 
                      className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--card)]/50 transition-colors rounded"
                      title="Collapse All"
                    >
                      <ChevronsDownUp size={14} />
                    </button>
                    <Button size="icon" onClick={onClose} variant="ghost" className="lg:hidden ml-1 h-8 w-8">
                      <X size={16} />
                    </Button>
                  </div>
                </div>

                <div className="relative group mb-4">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] opacity-50 group-focus-within:opacity-100 transition-opacity" />
                  <input
                    type="text"
                    placeholder="FILTER_SEARCH..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--card)]/30 border border-[var(--border)]/50 py-1.5 pl-9 pr-4 text-[10px] font-mono focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--card)]/50 transition-all placeholder:text-[var(--muted-foreground)]/50"
                  />
                </div>

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
                ) : displayNotes.length === 0 ? (
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
                      
                      {isFiltering ? (
                        <motion.div variants={staggerContainer} initial="hidden" animate="show">
                          <AnimatePresence mode="popLayout">
                            {displayNotes.map(note => (
                              <SidebarItem key={note.id} note={note} isActive={activeNoteId === note.id} onSelect={onSelectNote} onDelete={onDeleteNote} />
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      ) : (
                        <div className="py-2">
                          <NestedExplorer 
                            items={noteTree} 
                            activeNoteId={activeNoteId} 
                            onSelectNote={onSelectNote} 
                            onDeleteNote={onDeleteNote} 
                            onMoveNote={handleMoveNote}
                            onMoveFolder={handleMoveFolder}
                            collapseTrigger={collapseTrigger}
                            selectedFolderPath={selectedFolderPath}
                            onSelectFolder={setSelectedFolderPath}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-dotted border-[var(--border)] bg-[var(--background)]">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Button onClick={exportAllNotes} size="sm" className="bg-[var(--card)]/50 hover:bg-[var(--card)] border-[var(--border)]"><Download size={12} className="mr-2" /> Export</Button>
                  <Button onClick={() => fileInputRef.current?.click()} size="sm" className="bg-[var(--card)]/50 hover:bg-[var(--card)] border-[var(--border)]"><Upload size={12} className="mr-2" /> Import</Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
                <Button 
                  onClick={deleteAllNotes} 
                  variant="destructive" 
                  size="sm" 
                  className="w-full bg-[var(--destructive)]/10 hover:bg-[var(--destructive)] text-[var(--destructive)] hover:text-white border-[var(--destructive)]/30 text-[10px] font-mono tracking-widest h-8"
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
