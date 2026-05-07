"use client";

import React, { useRef, memo, useState, useMemo } from "react";
import { Note } from "@/types/note";
import { cn } from "../../lib/utils";
import { Plus, Search, Trash2, X, Star, Upload, Download, Hash, Tag, Sun, Moon, HelpCircle, Terminal as TerminalIcon, Package, ShieldCheck, FileText, Calendar, Palette, Share2 } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { spring, softSpring, microSpring, staggerContainer, slideInLeft } from "@/lib/transitions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/DataDisplay";
import { useTheme } from "@/hooks/use-theme";
import { usePlugins } from "@/hooks/use-plugins";
import SidebarPlugins from "./SidebarPlugins";
import SidebarHelp from "./SidebarHelp";
import NexusGraphVisualizer from "./NexusGraphVisualizer";

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
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: spring },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const SidebarItem = memo(({ 
  note, 
  isActive, 
  onSelect, 
  onDelete 
}: { 
  note: Note; 
  isActive: boolean; 
  onSelect: (id: string) => void; 
  onDelete: (id: string) => void;
}) => (
  <motion.div
    layout
    variants={itemVariants}
    initial="hidden"
    animate="show"
    exit="exit"
    whileHover={{ x: 4, backgroundColor: "var(--card)" }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      "group relative px-6 py-4 cursor-pointer border-b border-dotted border-[var(--border)]/50 transition-colors",
      isActive 
        ? "bg-[var(--card)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[var(--primary)] shadow-[inset_4px_0_0_rgba(250,189,47,0.1)]" 
        : "hover:bg-[var(--card)]/40"
    )}
    onClick={() => onSelect(note.id)}
  >
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2 overflow-hidden">
        {note.isFavorite && <Star size={10} className="text-[var(--primary)] fill-[var(--primary)] flex-shrink-0" />}
        <span className={cn(
          "text-[11px] font-bold uppercase tracking-wider truncate",
          isActive ? "text-[var(--primary)]" : "text-[var(--foreground)]"
        )}>
          {String(note.title || "UNTITLED_DOC")}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all"
      >
        <Trash2 size={12} />
      </button>
    </div>
    
    <div className="flex items-center justify-between mb-2">
      <span className="text-[9px] font-mono text-[var(--muted-foreground)] truncate max-w-[80%]">
        {String(note.content || "").substring(0, 40) || "NO_CONTENT..."}
      </span>
      <span className="text-[8px] font-mono text-[var(--muted-foreground)] opacity-50">
        {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
      </span>
    </div>

    {(note.tags || []).length > 0 && (
      <div className="flex gap-1 overflow-hidden">
        {note.tags?.slice(0, 3).map(tag => (
          <span key={tag} className="text-[8px] font-mono px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] uppercase">
            {tag}
          </span>
        ))}
      </div>
    )}
  </motion.div>
));

SidebarItem.displayName = "SidebarItem";

const SidebarSkeleton = () => (
  <div className="space-y-0 animate-pulse">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="px-6 py-4 border-b border-dotted border-[var(--border)]/50">
        <div className="flex justify-between mb-2">
          <div className="h-3 w-2/3 bg-[var(--border)] rounded-sm opacity-50" />
          <div className="h-3 w-4 bg-[var(--border)] rounded-sm opacity-30" />
        </div>
        <div className="h-2 w-full bg-[var(--border)] rounded-sm opacity-20 mb-2" />
        <div className="flex gap-1">
          <div className="h-3 w-10 bg-[var(--border)] rounded-sm opacity-10" />
          <div className="h-3 w-12 bg-[var(--border)] rounded-sm opacity-10" />
        </div>
      </div>
    ))}
  </div>
);

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
  onOpenHelp,
  onOpenThemes,

  onToggleTerminal,
  onOpenPlugins,
  onOpenAuth,
  isLoggedIn,
  isLoading,
  activeView: externalActiveView = "explorer",
  onViewChange,
  onOpenGraph,
}: SidebarProps) => {
  const { theme, setTheme } = useTheme();
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
    if (!activeTag) return notes;
    return notes.filter(n => (n.tags || []).includes(activeTag));
  }, [notes, activeTag]);

  const pinnedNotes = useMemo(() => displayNotes.filter(n => n.isFavorite), [displayNotes]);
  const regularNotes = useMemo(() => displayNotes.filter(n => !n.isFavorite), [displayNotes]);

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
      {/* Activity Bar (VS Code Style) */}
      <div className="w-14 h-full border-r border-dotted border-[var(--border)] flex flex-col items-center py-6 gap-4 bg-[var(--card)]/30">
        <div className="flex-1 flex flex-col items-center gap-4">
          {/* Explorer Tab */}
          <Button
            onClick={() => setActiveView("explorer")}
            variant="ghost"
            size="icon"
            className={cn(
              "w-10 h-10 transition-all relative",
              activeView === "explorer" ? "text-[var(--primary)] bg-[var(--primary)]/10" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            )}
            title="Explorer (Notes)"
          >
            <FileText size={18} />
            {activeView === "explorer" && (
              <motion.div 
                layoutId="active-indicator" 
                transition={microSpring}
                className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--primary)] rounded-full" 
              />
            )}
          </Button>

          {/* Plugins Tab */}
          <Button
            onClick={() => setActiveView("plugins")}
            variant="ghost"
            size="icon"
            className={cn(
              "w-10 h-10 transition-all relative",
              activeView === "plugins" ? "text-[var(--primary)] bg-[var(--primary)]/10" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            )}
            title="Marketplace (Plugins)"
          >
            <Package size={18} />
            {activeView === "plugins" && (
              <motion.div layoutId="active-indicator" className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--primary)] rounded-full" />
            )}
          </Button>

          <Button
            onClick={onOpenGraph}
            variant="ghost"
            size="icon"
            className="w-10 h-10 transition-all relative text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            title="Nexus Graph (Visualizer)"
          >
            <Share2 size={18} />
          </Button>



          <div className="w-8 h-px bg-[var(--border)] my-2 opacity-50" />

          <Button 
            onClick={onOpenThemes} 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            title="Select Visual Interface Theme"
          >
            <Palette size={18} />
          </Button>
          
          <Button
            onClick={onToggleTerminal}
            variant="ghost"
            size="icon"
            className="w-10 h-10 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            title="Toggle Terminal Kernel (`)"
          >
            <TerminalIcon size={16} />
          </Button>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4">
          <Button
            onClick={onOpenAuth}
            variant="ghost"
            size="icon"
            className={cn(
              "w-10 h-10 transition-all",
              isLoggedIn ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            )}
            title={isLoggedIn ? "Identity Synchronized" : "Initialize Identity (Login)"}
          >
            <div className="relative">
              <ShieldCheck size={16} />
              {isLoggedIn && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-pulse shadow-[0_0_8px_var(--primary)]" />
              )}
            </div>
          </Button>

          <Button
            onClick={() => setActiveView("help")}
            variant="ghost"
            size="icon"
            className={cn(
              "w-10 h-10 transition-all relative",
              activeView === "help" ? "text-[var(--primary)] bg-[var(--primary)]/10" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            )}
            title="System Manual (Help)"
          >
            <HelpCircle size={18} />
            {activeView === "help" && (
              <motion.div layoutId="active-indicator" className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--primary)] rounded-full" />
            )}
          </Button>

        </div>
      </div>

      {/* Main Sidebar Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === "explorer" ? (
            <motion.div 
              key="explorer"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={slideInLeft}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* explorer content ... */}
              {/* Note: I need to be careful not to lose the explorer content */}
              <div className="p-6 border-b border-dotted border-[var(--border)]">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] mb-1">Directory</span>
                    <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight text-glow">EXPLORER</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" onClick={onClose} variant="ghost" className="lg:hidden">
                      <X size={18} />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full mb-6 gap-2">
                  <Button onClick={() => onAddNote()} variant="primary" className="flex-1 flex items-center justify-center gap-2 font-mono h-10 shadow-[4px_4px_0px_rgba(250,189,47,0.2)]">
                    <Plus size={16} /> <span>NEW_DOC</span>
                  </Button>
                  {isEnabled("daily-notes") && (
                    <Button 
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
                      variant="outline" 
                      size="icon" 
                      className="w-10 h-10 text-[var(--accent)] hover:text-[var(--primary)] border-[var(--border)]"
                      title="Create/Open Daily Note"
                    >
                      <Calendar size={16} />
                    </Button>
                  )}
                </div>

                <div className="relative group mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    placeholder="FILTER_SEARCH..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--card)] border border-[var(--border)] py-2 pl-9 pr-4 text-[11px] font-mono focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--muted-foreground)]"
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
                    {pinnedNotes.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2 text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest bg-[var(--card)]/50 flex items-center justify-between">
                           <span>Pinned Notes</span>
                           <Badge variant="warning">{pinnedNotes.length}</Badge>
                        </div>
                        <motion.div 
                          variants={staggerContainer}
                          initial="hidden"
                          animate="show"
                        >
                          <AnimatePresence mode="popLayout">
                            {pinnedNotes.map(note => (
                              <SidebarItem
                                key={note.id}
                                note={note}
                                isActive={activeNoteId === note.id}
                                onSelect={onSelectNote}
                                onDelete={onDeleteNote}
                              />
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    )}
                    <div>
                      <div className="px-4 py-2 text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest bg-[var(--card)]/50 flex items-center justify-between">
                         <span>All Notes</span>
                         <Badge>{regularNotes.length}</Badge>
                      </div>
                      <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                      >
                        <AnimatePresence mode="popLayout">
                          {regularNotes.map(note => (
                            <SidebarItem
                              key={note.id}
                              note={note}
                              isActive={activeNoteId === note.id}
                              onSelect={onSelectNote}
                              onDelete={onDeleteNote}
                            />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-dotted border-[var(--border)] bg-[var(--background)]">
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={exportAllNotes} size="sm">
                    <Download size={12} className="mr-2" /> Export
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} size="sm">
                    <Upload size={12} className="mr-2" /> Import
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".json" 
                    className="hidden" 
                  />
                </div>
              </div>
            </motion.div>
          ) : activeView === "plugins" ? (
            <motion.div 
              key="plugins"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <SidebarPlugins onClose={onClose} />
            </motion.div>
          ) : (
            <motion.div 
              key="help"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
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
