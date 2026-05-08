"use client";

import { useState, useMemo, useEffect, useDeferredValue, useTransition, memo, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { softSpring } from "@/lib/transitions";
import { X, FileText } from "lucide-react";
import Fuse from "fuse.js";

// Components
// Lazy Components
const Sidebar = dynamic(() => import("@/components/notes/Sidebar"), { ssr: false });
const EmptyState = dynamic(() => import("@/components/notes/EmptyState"), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/notes/CommandPalette"), { ssr: false });
const SplashScreen = dynamic(() => import("@/components/notes/SplashScreen"), { ssr: false });
const ThemeModal = dynamic(() => import("@/components/notes/ThemeModal"), { ssr: false });
const GraphView = dynamic(() => import("@/components/notes/GraphView"), { ssr: false });

const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), { ssr: false });
const Terminal = dynamic(() => import("@/components/notes/Terminal").then(m => m.Terminal), { ssr: false });
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Feedback";


// Hooks & Lib
import { useNotes } from "@/hooks/use-notes";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";


import { useRouter, useSearchParams } from "next/navigation";


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
      <motion.div 
        layoutId="active-tab"
        transition={softSpring}
        className="absolute top-0 left-0 right-0 h-[1.5px] bg-[var(--primary)] shadow-[0_0_8px_rgba(250,189,47,0.4)]" 
      />
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

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlNoteId = searchParams.get("id");

  const { 
    notes, 
    addNote, 
    updateNote, 
    deleteNote, 
    toggleFavorite, 
    togglePublic,
    exportAllNotes, 
    importNotes, 
    isLoading 
  } = useNotes();
  const { user } = useAuth();

  const [showSplash, setShowSplash] = useState(true);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSplitPane, setIsSplitPane] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<"explorer" | "plugins" | "help">("explorer");
  const [mainView, setMainView] = useState<"editor" | "graph">("editor");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  // Handlers
  const handleAddNote = useCallback((title?: string) => {
    startTransition(() => {
      // Defensive check: if title is an event object or not a string, ignore it
      const safeTitle = typeof title === 'string' ? title : undefined;
      const newNote = addNote(safeTitle);
      router.push(`/?id=${newNote.id}`, { scroll: false });
      setOpenNoteIds(prev => Array.from(new Set([...prev, newNote.id])));
      setIsSidebarOpen(false);
    });
  }, [addNote, router]);

  const handleDeleteNote = useCallback((id: string) => {
    deleteNote(id);
    const remainingOpen = openNoteIds.filter(nid => nid !== id);
    setOpenNoteIds(remainingOpen);
    
    if (activeNoteId === id) {
      const nextActive = remainingOpen[remainingOpen.length - 1] || null;
      if (nextActive) {
        router.push(`/?id=${nextActive}`, { scroll: false });
      } else {
        router.push(`/`, { scroll: false });
        setActiveNoteId(null);
      }
    }
  }, [deleteNote, activeNoteId, openNoteIds, router]);

  const handleSelectNote = useCallback((id: string) => {
    startTransition(() => {
      router.push(`/?id=${id}`, { scroll: false });
      setOpenNoteIds(prev => Array.from(new Set([...prev, id])));
      setMainView("editor");
      setIsSplitPane(false);
      setIsSidebarOpen(false);
    });
  }, [router]);

  const handleCloseNote = useCallback((id: string) => {
    const remainingOpen = openNoteIds.filter(nid => nid !== id);
    setOpenNoteIds(remainingOpen);
    
    if (activeNoteId === id) {
      const nextActive = remainingOpen[remainingOpen.length - 1] || null;
      if (nextActive) {
        router.push(`/?id=${nextActive}`, { scroll: false });
      } else {
        router.push(`/`, { scroll: false });
        setActiveNoteId(null);
      }
    }
  }, [activeNoteId, openNoteIds, router]);

  // Sync URL ID to state
  useEffect(() => {
    if (urlNoteId && urlNoteId !== activeNoteId) {
      setActiveNoteId(urlNoteId);
      setOpenNoteIds(prev => Array.from(new Set([...prev, urlNoteId])));
      setMainView("editor");
    }
  }, [urlNoteId, activeNoteId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!mounted) return;
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
        setSidebarView("help");
        setIsSidebarOpen(true);
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
  }, [mounted, handleAddNote]);

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

  if (isLoading || !mounted) {
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
              className="fixed inset-0 bg-black/80 z-40 lg:hidden"
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
            onOpenHelp={() => {
              setSidebarView("help");
              setIsSidebarOpen(true);
            }}
            onOpenThemes={() => setIsThemeModalOpen(true)}

            onOpenPlugins={() => {
              setSidebarView("plugins");
              setIsSidebarOpen(true);
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            isLoggedIn={!!user}
            isLoading={isLoading}
            onToggleTerminal={() => setIsTerminalOpen(prev => !prev)}
            exportAllNotes={exportAllNotes}
            importNotes={importNotes}
            activeView={sidebarView}
            onViewChange={setSidebarView}
            onOpenGraph={() => setMainView("graph")}
          />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0 relative bg-[var(--background)]">
          {/* Industrial Mode Selector */}
          <div className="h-14 border-b border-[var(--border)] bg-[var(--card)]/10 flex items-center justify-between px-6">
            <div className="flex items-center gap-6 h-full">
              <div className="flex flex-col">
                <span className="text-[7px] font-mono text-[var(--primary)] uppercase tracking-[0.4em] mb-0.5">Workspace_Mode</span>
                <div className="flex items-center gap-3">
                   <button
                    onClick={() => setMainView("editor")}
                    className={cn(
                      "text-[10px] font-mono font-bold uppercase tracking-widest transition-all px-3 py-1 border",
                      mainView === "editor" 
                        ? "bg-[var(--primary)] text-[var(--background)] border-[var(--primary)] shadow-[0_0_15px_rgba(250,189,47,0.3)]" 
                        : "text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]/50"
                    )}
                  >
                    01 // EDITOR_CORE
                  </button>
                  <button
                    onClick={() => setMainView("graph")}
                    className={cn(
                      "text-[10px] font-mono font-bold uppercase tracking-widest transition-all px-3 py-1 border",
                      mainView === "graph" 
                        ? "bg-[var(--primary)] text-[var(--background)] border-[var(--primary)] shadow-[0_0_15px_rgba(250,189,47,0.3)]" 
                        : "text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]/50"
                    )}
                  >
                    02 // NEXUS_GRAPH
                  </button>
                </div>
              </div>

              {mainView === "editor" && activeNote && (
                <div className="h-8 w-px bg-[var(--border)] mx-2 opacity-30" />
              )}

              {mainView === "editor" && activeNote && (
                <div className="hidden md:flex flex-col">
                  <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-0.5">Active_Node</span>
                  <span className="text-[10px] font-mono font-bold text-[var(--foreground)] uppercase truncate max-w-[200px]">
                    {activeNote.title || "UNTITLED_SEGMENT"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
               {mainView === "editor" && openNoteIds.length > 1 && (
                <Button
                  variant={isSplitPane ? "warning" : "ghost"}
                  size="sm"
                  onClick={() => {
                    const nextSplitState = !isSplitPane;
                    setIsSplitPane(nextSplitState);
                    if (nextSplitState) setIsSidebarOpen(false);
                  }}
                  className="h-8 px-3 text-[9px] font-mono uppercase tracking-widest border border-[var(--border)]"
                >
                  {isSplitPane ? "MERGE_PANES" : "SPLIT_STREAM"}
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-tighter">System_Live</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {mainView === "graph" ? (
                <motion.div
                  key="graph-view"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: "circOut" }}
                  className="absolute inset-0"
                >
                  <GraphView 
                    isOpen={true} 
                    onClose={() => setMainView("editor")} 
                    notes={notes} 
                    variant="tab"
                    onSelectNote={handleSelectNote}
                    onUpdateNote={updateNote}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="editor-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex flex-col"
                >
                  {/* Internal Editor Tabs (Subtle) */}
                  {openNoteIds.length > 0 && (
                    <div className="flex bg-[var(--background)] border-b border-[var(--border)] overflow-x-auto no-scrollbar min-h-[40px]">
                      {openNoteIds.map(id => {
                        const note = notes.find(n => n.id === id);
                        if (!note) return null;
                        return (
                          <Tab 
                            key={id}
                            id={id}
                            title={note.title || "UNTITLED"}
                            isActive={activeNoteId === id}
                            onSelect={() => handleSelectNote(id)}
                            onClose={(e) => {
                              e.stopPropagation();
                              handleCloseNote(id);
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  <div className="flex-1 flex min-h-0 relative">
                    <AnimatePresence mode="wait">
                      {activeNote ? (
                        <motion.div
                          key={activeNote.id + (isSplitPane ? "-split" : "")}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="h-full w-full flex-1 min-h-0 flex"
                        >
                          <div className={cn("h-full min-w-0", isSplitPane && secondaryNote ? "w-1/2 border-r border-[var(--border)]" : "w-full")}>
                            <NotesEditor note={activeNote} onUpdate={updateNote} onDelete={handleDeleteNote} onToggleFavorite={toggleFavorite} onTogglePublic={togglePublic} allNotes={notes} onNavigate={handleSelectNote} showSidebar={!isSplitPane} />
                          </div>
                          {isSplitPane && secondaryNote && (
                            <div className="h-full w-1/2 min-w-0 hidden md:block">
                              <NotesEditor note={secondaryNote} onUpdate={updateNote} onDelete={handleDeleteNote} onToggleFavorite={toggleFavorite} onTogglePublic={togglePublic} allNotes={notes} onNavigate={handleSelectNote} showSidebar={!isSplitPane} />
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <EmptyState onAddNote={handleAddNote} />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
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
          onOpenThemes={() => setIsThemeModalOpen(true)}
          onOpenPlugins={() => {
            setSidebarView("plugins");
            setIsSidebarOpen(true);
            setIsCommandPaletteOpen(false);
          }}
        />
        <Terminal 
          isOpen={isTerminalOpen} 
          onClose={() => setIsTerminalOpen(false)} 
          notes={notes}
          onSelectNote={handleSelectNote}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />

        <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </main>
    </>
  );
}

export default function HomeClient() {
  return <HomeContent />;
}
