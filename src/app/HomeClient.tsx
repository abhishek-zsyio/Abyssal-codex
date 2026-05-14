"use client";

import { useState, useMemo, useEffect, useDeferredValue, useTransition, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { useRouter, useSearchParams } from "next/navigation";

// Components
const Sidebar = dynamic(() => import("@/components/notes/Sidebar"), { ssr: false });
const EmptyState = dynamic(() => import("@/components/notes/EmptyState"), { ssr: false });
const SplashScreen = dynamic(() => import("@/components/notes/SplashScreen"), { ssr: false });
const GraphView = dynamic(() => import("@/components/notes/GraphView"), { ssr: false });
const NotesEditor = dynamic(() => import("@/components/notes/Editor"), { 
  ssr: false,
  loading: () => (
    <div className="flex-1 h-full flex items-center justify-center bg-[var(--background)]">
      <Spinner className="w-8 h-8" />
    </div>
  )
});

import { Spinner } from "@/components/ui/Feedback";
import { useNotes } from "@/hooks/use-notes";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

import { HomeTabs } from "@/components/home/HomeTabs";
import { WorkspaceHeader } from "@/components/home/WorkspaceHeader";
import { HomeModals } from "@/components/home/HomeModals";

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
    deleteAllNotes,
    folders,
    addFolder,
    renameFolder,
    deleteFolder,
    isLoading 
  } = useNotes();
  const { user } = useAuth();

  const [showSplash, setShowSplash] = useState(true);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [secondaryNoteId, setSecondaryNoteId] = useState<string | null>(null);
  const [focusedPane, setFocusedPane] = useState<"left" | "right">("left");
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOmniConsoleOpen, setIsOmniConsoleOpen] = useState(false);
  const [isSplitPane, setIsSplitPane] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<"explorer" | "plugins" | "help">("explorer");
  const [mainView, setMainView] = useState<"editor" | "graph">("editor");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  // Handlers
  const handleAddNote = useCallback(async (title?: string) => {
    const safeTitle = typeof title === 'string' ? title : undefined;
    const newNoteId = await addNote(safeTitle);
    
    startTransition(() => {
      router.push(`/?id=${newNoteId}`, { scroll: false });
      setOpenNoteIds(prev => Array.from(new Set([...prev, newNoteId])));
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
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
      
      if (isSplitPane) {
        if (focusedPane === "left") {
          setActiveNoteId(id);
        } else {
          setSecondaryNoteId(id);
        }
      } else {
        setActiveNoteId(id);
      }

      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    });
  }, [router, isSplitPane, focusedPane]);

  const handleOpenToSide = useCallback((id: string) => {
    startTransition(() => {
      setOpenNoteIds(prev => Array.from(new Set([...prev, id])));
      setMainView("editor");
      setIsSplitPane(true);
      setSecondaryNoteId(id);
      setFocusedPane("right");
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    });
  }, []);

  const handleCloseNote = useCallback((id: string) => {
    const remainingOpen = openNoteIds.filter(nid => nid !== id);
    setOpenNoteIds(remainingOpen);
    
    if (activeNoteId === id) {
      const nextActive = remainingOpen.find(nid => nid !== secondaryNoteId) || null;
      setActiveNoteId(nextActive);
      if (nextActive) router.push(`/?id=${nextActive}`, { scroll: false });
      else if (!secondaryNoteId) router.push(`/`, { scroll: false });
    } else if (secondaryNoteId === id) {
      const nextSecondary = remainingOpen.find(nid => nid !== activeNoteId) || null;
      setSecondaryNoteId(nextSecondary);
      if (!nextSecondary) setIsSplitPane(false);
    }

    if (remainingOpen.length === 0) {
      setIsSplitPane(false);
      router.push(`/`, { scroll: false });
    }
  }, [activeNoteId, secondaryNoteId, openNoteIds, router]);

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

  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOmniConsoleOpen(prev => !prev);
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
        setIsOmniConsoleOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    const handleResizeError = (e: ErrorEvent) => {
      if (e.message === "ResizeObserver loop completed with undelivered notifications." || 
          e.message === "ResizeObserver loop limit exceeded") {
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener("error", handleResizeError);

    const handleSidebarOpen = () => setIsSidebarOpen(true);
    window.addEventListener("abyssal-sidebar-open", handleSidebarOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("error", handleResizeError);
      window.removeEventListener("abyssal-sidebar-open", handleSidebarOpen);
    };
  }, [mounted, handleAddNote]);

  const fuse = useMemo(() => new Fuse(notes, {
    keys: ["title", "content"],
    threshold: 0.4,
  }), [notes]);

  const filteredNotes = useMemo(() => {
    if (!deferredSearchQuery) return notes;
    return fuse.search(deferredSearchQuery).map(result => result.item);
  }, [notes, deferredSearchQuery, fuse]);

  const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId) || null, [notes, activeNoteId]);
  const secondaryNote = useMemo(() => notes.find(n => n.id === secondaryNoteId) || null, [notes, secondaryNoteId]);

  // Sync split state with header
  const handleToggleSplit = useCallback((split: boolean) => {
    setIsSplitPane(split);
    if (split && !secondaryNoteId) {
      const otherNoteId = openNoteIds.find(id => id !== activeNoteId);
      if (otherNoteId) {
        setSecondaryNoteId(otherNoteId);
        setFocusedPane("right");
      }
    }
  }, [openNoteIds, activeNoteId, secondaryNoteId]);

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

      <main className="h-full w-full flex overflow-hidden bg-[var(--background)] text-[var(--foreground)] relative">
        {/* Subtle dot-grid — single very faint layer */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 opacity-[0.025] bg-[radial-gradient(circle,var(--foreground)_1px,transparent_1px)] bg-[length:28px_28px]" />

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/80 z-40 lg:hidden" />
          )}
        </AnimatePresence>

        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <Sidebar
            notes={filteredNotes}
            activeNoteId={activeNoteId}
            onSelectNote={handleSelectNote}
            onOpenToSide={handleOpenToSide}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onOpenThemes={() => setIsThemeModalOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenSecurity={() => setIsSecurityModalOpen(true)}
            isLoggedIn={!!user}
            isLoading={isLoading}
            onToggleTerminal={() => setIsOmniConsoleOpen(prev => !prev)}
            exportAllNotes={exportAllNotes}
            importNotes={importNotes}
            deleteAllNotes={deleteAllNotes}
            activeView={sidebarView}
            onViewChange={setSidebarView}
            onOpenGraph={() => setMainView("graph")}
            onUpdateNote={updateNote}
            folders={folders}
            onAddFolder={addFolder}
            onRenameFolder={renameFolder}
            onDeleteFolder={deleteFolder}
          />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0 relative bg-[var(--background)]">
          <WorkspaceHeader 
            mainView={mainView}
            setMainView={setMainView}
            activeNoteTitle={activeNote?.title}
            isSplitPane={isSplitPane}
            setIsSplitPane={handleToggleSplit}
            hasSecondaryNote={openNoteIds.length > 1}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          <div className="flex-1 overflow-hidden relative z-10">
            <AnimatePresence mode="wait">
              {mainView === "graph" ? (
                <div key="graph-view" className="absolute inset-0">
                  <GraphView isOpen={true} onClose={() => setMainView("editor")} notes={notes} variant="tab" onSelectNote={handleSelectNote} onUpdateNote={updateNote} folders={folders} />
                </div>
              ) : (
                <motion.div key="editor-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col">
                  <HomeTabs openNoteIds={openNoteIds} notes={notes} activeNoteId={activeNoteId} secondaryNoteId={secondaryNoteId} focusedPane={focusedPane} handleSelectNote={handleSelectNote} handleOpenToSide={handleOpenToSide} handleCloseNote={handleCloseNote} />
                  <div className="flex-1 flex min-h-0 relative">
                    <AnimatePresence mode="wait">
                      {activeNote ? (
                        <motion.div key="dual-core-layout" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="h-full w-full flex-1 min-h-0 flex">
                          <div 
                            onClick={() => setFocusedPane("left")}
                            className={cn(
                              "h-full min-w-0 transition-all duration-300", 
                              isSplitPane && secondaryNote ? "w-1/2 border-r border-[var(--border)]" : "w-full",
                              isSplitPane && focusedPane === "left" && "ring-1 ring-inset ring-[var(--primary)]/30 z-10 shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)]"
                            )}
                          >
                            <NotesEditor note={activeNote} onUpdate={updateNote} onDelete={handleDeleteNote} onToggleFavorite={toggleFavorite} onTogglePublic={togglePublic} allNotes={notes} onNavigate={handleSelectNote} showSidebar={!isSplitPane} />
                          </div>
                          {isSplitPane && secondaryNote && (
                            <div 
                              onClick={() => setFocusedPane("right")}
                              className={cn(
                                "h-full w-1/2 min-w-0 hidden md:block transition-all duration-300",
                                focusedPane === "right" && "ring-1 ring-inset ring-[var(--primary)]/30 z-10 shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)]"
                              )}
                            >
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
          
          {isPending && (
            <div className="absolute top-0 left-0 w-full h-px bg-[var(--border)] z-50 overflow-hidden">
              <motion.div
                className="h-full bg-[var(--primary)]"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          )}
        </div>

        <HomeModals 
          isOmniConsoleOpen={isOmniConsoleOpen}
          setIsOmniConsoleOpen={setIsOmniConsoleOpen}
          notes={notes}
          handleSelectNote={handleSelectNote}
          onOpenToSide={handleOpenToSide}
          handleAddNote={handleAddNote}
          exportAllNotes={exportAllNotes}
          setIsThemeModalOpen={setIsThemeModalOpen}
          setSidebarView={setSidebarView}
          setIsSidebarOpen={setIsSidebarOpen}
          handleDeleteNote={handleDeleteNote}
          isThemeModalOpen={isThemeModalOpen}
          isAuthModalOpen={isAuthModalOpen}
          setIsAuthModalOpen={setIsAuthModalOpen}
          isSecurityModalOpen={isSecurityModalOpen}
          setIsSecurityModalOpen={setIsSecurityModalOpen}
        />
      </main>
    </>
  );
}

export default function HomeClient() {
  return <HomeContent />;
}
