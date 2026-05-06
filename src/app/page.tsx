"use client";

import { useState, useMemo, useEffect, useDeferredValue, useTransition, memo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Columns, FileText, Clock } from "lucide-react";
import Fuse from "fuse.js";

// Components
import Sidebar from "@/components/notes/Sidebar";
import EmptyState from "@/components/notes/EmptyState";
import CommandPalette from "@/components/notes/CommandPalette";
import SplashScreen from "@/components/notes/SplashScreen";
import HelpModal from "@/components/notes/HelpModal";
import { Terminal } from "@/components/notes/Terminal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Feedback";

// Hooks & Lib
import { useNotes } from "@/hooks/use-notes";
import { cn } from "@/lib/utils";

// Lazy Load Editor
const NotesEditor = dynamic(() => import("@/components/notes/Editor"), { 
  ssr: false,
  loading: () => (
    <div className="flex-1 h-full flex items-center justify-center bg-[var(--background)]">
      <Spinner className="w-8 h-8" />
    </div>
  )
});

const Tab = memo(({ 
  id, 
  title, 
  isActive, 
  onSelect, 
  onClose 
}: { 
  id: string; 
  title: string; 
  isActive: boolean; 
  onSelect: () => void; 
  onClose: (e: React.MouseEvent) => void;
}) => (
  <div 
    onClick={onSelect}
    className={cn(
      "flex items-center gap-2 md:gap-3 px-3 md:px-5 h-10 border-r border-[var(--border)] text-[10px] font-mono cursor-pointer transition-all whitespace-nowrap group relative min-w-[100px] md:min-w-[140px] max-w-[200px] md:max-w-[240px]",
      isActive 
        ? "bg-[var(--card)] text-[var(--primary)]" 
        : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--card)]/40 hover:text-[var(--foreground)]"
    )}
  >
    {isActive && (
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[var(--primary)]" />
    )}
    <FileText size={12} className={cn(isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />
    <span className="truncate flex-1 font-bold uppercase tracking-[0.15em] py-1">
      {title || "UNTITLED"}
    </span>
    <button 
      onClick={onClose} 
      className={cn(
        "p-1 rounded-sm hover:bg-[var(--border)] transition-colors ml-2", 
        isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100"
      )}
    >
      <X size={10} />
    </button>
  </div>
));

Tab.displayName = "Tab";

export default function Home() {
  const { 
    notes, 
    addNote, 
    updateNote, 
    deleteNote, 
    toggleFavorite, 
    exportAllNotes, 
    importNotes, 
    isLoading 
  } = useNotes();

  const [showSplash, setShowSplash] = useState(true);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSplitPane, setIsSplitPane] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleAddNote();
      }
      if (e.key === "?" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setIsHelpOpen(prev => !prev);
      }
      if (e.key === "`" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    // Suppress ResizeObserver loop limit exceeded errors (common with Monaco Editor)
    const handleResizeError = (e: ErrorEvent) => {
      if (e.message === "ResizeObserver loop completed with undelivered notifications." || 
          e.message === "ResizeObserver loop limit exceeded") {
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener("error", handleResizeError);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("error", handleResizeError);
    };
  }, [notes, openNoteIds]);

  // Search Logic
  const fuse = useMemo(() => new Fuse(notes, {
    keys: ["title", "content"],
    threshold: 0.4,
  }), [notes]);

  const filteredNotes = useMemo(() => {
    if (!deferredSearchQuery) return notes;
    return fuse.search(deferredSearchQuery).map(result => result.item);
  }, [notes, deferredSearchQuery, fuse]);

  // Computed State
  const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId) || null, [notes, activeNoteId]);
  const secondaryNote = useMemo(() => {
    const id = openNoteIds.find(id => id !== activeNoteId);
    return notes.find(n => n.id === id) || null;
  }, [notes, openNoteIds, activeNoteId]);

  // Handlers
  const handleAddNote = () => {
    startTransition(() => {
      const newNote = addNote();
      setActiveNoteId(newNote.id);
      setOpenNoteIds(prev => Array.from(new Set([...prev, newNote.id])));
      setIsSidebarOpen(false);
    });
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setOpenNoteIds(prev => prev.filter(nid => nid !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const handleSelectNote = (id: string) => {
    startTransition(() => {
      setActiveNoteId(id);
      setOpenNoteIds(prev => Array.from(new Set([...prev, id])));
      setIsSidebarOpen(false);
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--background)]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>

      <main className="h-full w-full flex overflow-hidden bg-[var(--background)] text-[#ebdbb2] relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Container */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <Sidebar
            notes={filteredNotes}
            activeNoteId={activeNoteId}
            onSelectNote={handleSelectNote}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onClose={() => setIsSidebarOpen(false)}
            onOpenHelp={() => setIsHelpOpen(true)}
            onToggleTerminal={() => setIsTerminalOpen(prev => !prev)}
            exportAllNotes={exportAllNotes}
            importNotes={importNotes}
          />
        </div>
        
        <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <header className="h-14 border-b border-[var(--border)] flex items-center px-4 lg:hidden bg-[var(--background)]">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </Button>
            <span className="ml-4 text-xs font-mono font-bold tracking-widest text-[var(--foreground)]">ABYSSAL_CODEX</span>
          </header>

          {/* Tabs Bar */}
          {openNoteIds.length > 0 && (
            <div className="flex bg-[var(--background)] border-b border-[var(--border)] overflow-x-auto no-scrollbar min-h-[40px] items-center justify-between pr-2">
              <div className="flex flex-1">
                {openNoteIds.map(id => {
                  const note = notes.find(n => n.id === id);
                  if (!note) return null;
                  return (
                    <Tab 
                      key={id}
                      id={id}
                      title={note.title}
                      isActive={activeNoteId === id}
                      onSelect={() => setActiveNoteId(id)}
                      onClose={(e) => {
                        e.stopPropagation();
                        setOpenNoteIds(prev => prev.filter(nid => nid !== id));
                        if (activeNoteId === id) setActiveNoteId(null);
                      }}
                    />
                  );
                })}
              </div>
              
              {openNoteIds.length > 1 && (
                <Button
                  variant={isSplitPane ? "warning" : "ghost"}
                  size="icon"
                  onClick={() => setIsSplitPane(!isSplitPane)}
                  className="mx-2"
                >
                  <Columns size={14} />
                </Button>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeNote ? (
              <motion.div
                key={activeNote.id + (isSplitPane ? "-split" : "")}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full w-full flex-1 min-h-0 flex"
              >
                <div className={cn("h-full min-w-0", isSplitPane && secondaryNote ? "w-1/2 border-r border-[var(--border)]" : "w-full")}>
                  <NotesEditor note={activeNote} onUpdate={updateNote} onDelete={handleDeleteNote} onToggleFavorite={toggleFavorite} allNotes={notes} onNavigate={handleSelectNote} />
                </div>
                {isSplitPane && secondaryNote && (
                  <div className="h-full w-1/2 min-w-0 hidden md:block">
                    <NotesEditor note={secondaryNote} onUpdate={updateNote} onDelete={handleDeleteNote} onToggleFavorite={toggleFavorite} allNotes={notes} onNavigate={handleSelectNote} />
                  </div>
                )}
              </motion.div>
            ) : (
              <EmptyState onAddNote={handleAddNote} />
            )}
          </AnimatePresence>
          
          {/* Transition Progress */}
          {isPending && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-[#282828] z-50 overflow-hidden">
              <motion.div 
                className="h-full bg-[#fabd2f]" 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </div>

        <CommandPalette 
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          notes={notes}
          onSelectNote={handleSelectNote}
          onAddNote={handleAddNote}
          exportAllNotes={exportAllNotes}
        />
        <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </main>
    </>
  );
}
