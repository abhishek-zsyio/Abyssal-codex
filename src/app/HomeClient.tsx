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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("error", handleResizeError);
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
        {/* Global Immersive Layer */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
           <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
           <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-[length:32px_32px]" />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/50 to-[var(--background)]" />
        </div>

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
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
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
            setIsSplitPane={setIsSplitPane}
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
                  <HomeTabs openNoteIds={openNoteIds} notes={notes} activeNoteId={activeNoteId} handleSelectNote={handleSelectNote} handleCloseNote={handleCloseNote} />
                  <div className="flex-1 flex min-h-0 relative">
                    <AnimatePresence mode="wait">
                      {activeNote ? (
                        <motion.div key={activeNote.id + (isSplitPane ? "-split" : "")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="h-full w-full flex-1 min-h-0 flex">
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
          
          {isPending && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-[#282828] z-50 overflow-hidden">
              <motion.div className="h-full bg-[#fabd2f]" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            </div>
          )}
        </div>

        <HomeModals 
          isOmniConsoleOpen={isOmniConsoleOpen}
          setIsOmniConsoleOpen={setIsOmniConsoleOpen}
          notes={notes}
          handleSelectNote={handleSelectNote}
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
