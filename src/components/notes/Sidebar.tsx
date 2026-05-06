"use client";

import React, { useRef, memo, useState, useMemo } from "react";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import { Plus, Search, Trash2, X, Star, Upload, Download, Hash, Tag, Sun, Moon, HelpCircle, Terminal as TerminalIcon } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/DataDisplay";
import { useTheme } from "@/hooks/use-theme";

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onClose?: () => void;
  exportAllNotes?: () => void;
  importNotes?: (notes: Note[]) => void;
  onOpenHelp?: () => void;
  onToggleTerminal?: () => void;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
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
    className={cn(
      "group relative px-6 py-4 cursor-pointer transition-all border-b border-dotted border-[var(--border)]/50",
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
          {note.title || "UNTITLED_DOC"}
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
        {note.content?.substring(0, 40) || "NO_CONTENT..."}
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
  onToggleTerminal,
}: SidebarProps) => {
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    <aside className="w-80 h-full flex flex-col border-r border-dotted border-[var(--border)] bg-[var(--background)]">
      <div className="p-6 border-b border-dotted border-[var(--border)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-sm grayscale group-hover:grayscale-0 transition-all" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] mb-1">Index</span>
              <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight text-glow">ABYSSAL_CODEX</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" onClick={onClose} variant="ghost" className="lg:hidden">
              <X size={18} />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between w-full mb-6 gap-2">
          <Button onClick={onAddNote} variant="primary" className="flex-1 flex items-center justify-center gap-2 font-mono h-10 shadow-[4px_4px_0px_rgba(250,189,47,0.2)]">
            <Plus size={16} /> <span>NEW_DOC</span>
          </Button>
          <Button 
            onClick={toggleTheme} 
            variant="outline" 
            size="icon" 
            className="w-10 h-10 text-[var(--muted-foreground)] hover:text-[var(--primary)] border-[var(--border)]"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button
            onClick={onOpenHelp}
            variant="outline"
            size="icon"
            className="w-10 h-10 text-[var(--muted-foreground)] hover:text-[var(--primary)] border-[var(--border)]"
            title="Help & Keyboard Shortcuts"
          >
            <HelpCircle size={16} />
          </Button>
          <Button
            onClick={onToggleTerminal}
            variant="outline"
            size="icon"
            className="w-10 h-10 text-[var(--muted-foreground)] hover:text-[var(--primary)] border-[var(--border)]"
            title="Toggle Terminal Kernel (`)"
          >
            <TerminalIcon size={16} />
          </Button>
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

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {displayNotes.length === 0 ? (
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
              </div>
            )}
            <div>
              <div className="px-4 py-2 text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest bg-[var(--card)]/50 flex items-center justify-between">
                 <span>All Notes</span>
                 <Badge>{regularNotes.length}</Badge>
              </div>
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
    </aside>
  );
});


Sidebar.displayName = "Sidebar";

export default Sidebar;
