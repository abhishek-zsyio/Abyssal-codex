"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Note } from "@/types/note";
import { Search, FileText, Plus, Download, X, Sun, Moon, Package, Calendar, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { spring, softSpring, microSpring, staggerContainer, fadeInScale } from "@/lib/transitions";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { Kbd } from "@/components/ui/DataDisplay";
import { useTheme } from "@/hooks/use-theme";
import { usePlugins } from "@/hooks/use-plugins";
import { CornerAccents } from "@/components/ui/Effects";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (id: string) => void;
  onAddNote: (title?: string) => void;
  exportAllNotes: () => void;
  onOpenPlugins: () => void;
  onOpenThemes: () => void;
}

const CommandPalette = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onAddNote,
  exportAllNotes,
  onOpenPlugins,
  onOpenThemes,
}: CommandPaletteProps) => {
  const { theme, toggleTheme } = useTheme();
  const { isEnabled } = usePlugins();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const fuse = useMemo(() => new Fuse(notes, {
    keys: ["title", "content"],
    threshold: 0.4,
  }), [notes]);

  const filteredNotes = useMemo(() => {
    if (!query) return notes;
    return fuse.search(query).map(result => result.item);
  }, [notes, query, fuse]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80"
          />
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative w-full max-w-xl bg-[var(--background)] border border-[var(--border)] shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[80vh]"
          >
            <CornerAccents />
            <div className="flex items-center px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]">
              <Search size={16} className="text-[var(--muted-foreground)] mr-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search notes..."
                className="flex-1 bg-transparent border-none outline-none text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--muted-foreground)]"
              />
              <button onClick={onClose} className="p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {query === "" && (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="mb-4"
                >
                  <div className="px-2 py-1 text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Commands</div>
                  {[
                    { icon: Plus, label: "Create New Note", action: onAddNote, color: "text-[var(--accent)]" },
                    ...(isEnabled("daily-notes") ? [{ 
                      icon: Calendar, 
                      label: "Create/Open Daily Note", 
                      action: () => {
                        const today = new Date().toLocaleDateString('en-CA');
                        const dailyNoteTitle = `Daily_${today}`;
                        const existing = notes.find(n => n.title === dailyNoteTitle);
                        if (existing) onSelectNote(existing.id);
                        else onAddNote(dailyNoteTitle);
                      },
                      color: "text-[var(--accent)]"
                    }] : []),
                    { icon: Palette, label: "Open Theme Library", action: onOpenThemes, color: "text-[var(--accent)]" },
                    { icon: Package, label: "Open Plugin Store", action: onOpenPlugins, color: "text-[var(--accent)]" },
                    { icon: Download, label: "Export Workspace Backup", action: exportAllNotes, color: "text-[var(--accent)]" },
                  ].map((cmd, i) => (
                    <motion.button
                      key={cmd.label}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        show: { opacity: 1, x: 0, transition: spring }
                      }}
                      whileHover={{ x: 4, backgroundColor: "var(--secondary)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { cmd.action(); onClose(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-mono text-[var(--foreground)] transition-colors"
                    >
                      <cmd.icon size={14} className={cmd.color} />
                      {cmd.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              <div>
                <div className="px-2 py-1 text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
                  {query === "" ? "Recent Notes" : "Search Results"}
                </div>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {filteredNotes.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm font-mono text-[var(--muted-foreground)]">
                      No notes found.
                    </div>
                  ) : (
                      filteredNotes.slice(0, 10).map((note) => (
                        <motion.button
                          key={note.id}
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            show: { opacity: 1, x: 0, transition: spring }
                          }}
                          whileHover={{ x: 4, backgroundColor: "var(--card)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { onSelectNote(note.id); onClose(); }}
                          className="w-full flex flex-col px-4 py-3 text-left transition-colors border-l-2 border-transparent hover:border-[var(--primary)] group"
                        >
                          <div className="flex items-center gap-3">
                            <FileText size={14} className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                            <span className="text-[11px] font-bold text-[var(--foreground)] truncate uppercase tracking-widest">{note.title || "UNTITLED_CODEX"}</span>
                          </div>
                          {query && note.content && (
                            <span className="text-[9px] font-mono text-[var(--muted-foreground)] truncate pl-[26px] mt-1 uppercase opacity-60">
                              {note.content.substring(0, 80)}...
                            </span>
                          )}
                        </motion.button>
                      ))
                  )}
                </motion.div>
              </div>
            </div>
            
            <div className="px-4 py-2 bg-[var(--card)] border-t border-[var(--border)] text-[10px] font-mono text-[var(--muted-foreground)] flex justify-between items-center">
              <span>Use arrows to navigate, Enter to select</span>
              <div className="flex gap-2">
                <Kbd>ESC</Kbd>
                <span className="text-[9px]">TO CLOSE</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
