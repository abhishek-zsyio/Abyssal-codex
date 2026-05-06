"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Note } from "@/types/note";
import { Search, FileText, Plus, Download, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { Kbd } from "@/components/ui/DataDisplay";
import { useTheme } from "@/hooks/use-theme";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  exportAllNotes: () => void;
}

const CommandPalette = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onAddNote,
  exportAllNotes,
}: CommandPaletteProps) => {
  const { theme, toggleTheme } = useTheme();
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-[var(--background)] border border-[var(--border)] shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[80vh]"
          >
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
                <div className="mb-4">
                  <div className="px-2 py-1 text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Commands</div>
                  <button
                    onClick={() => { onAddNote(); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-mono text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <Plus size={14} className="text-[var(--accent)]" />
                    Create New Note
                  </button>
                  <button
                    onClick={() => { exportAllNotes(); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-mono text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <Download size={14} className="text-[var(--accent)]" />
                    Export Workspace Backup
                  </button>
                  <button
                    onClick={() => { toggleTheme(); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-mono text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    {theme === 'dark' ? <Sun size={14} className="text-[var(--accent)]" /> : <Moon size={14} className="text-[var(--accent)]" />}
                    Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </button>
                </div>
              )}

              <div>
                <div className="px-2 py-1 text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
                  {query === "" ? "Recent Notes" : "Search Results"}
                </div>
                {filteredNotes.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm font-mono text-[var(--muted-foreground)]">
                    No notes found.
                  </div>
                ) : (
                    filteredNotes.slice(0, 10).map((note) => (
                      <button
                        key={note.id}
                        onClick={() => { onSelectNote(note.id); onClose(); }}
                        className="w-full flex flex-col px-4 py-3 text-left hover:bg-[var(--card)]/50 transition-all border-l-2 border-transparent hover:border-[var(--primary)] group"
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
                      </button>
                    ))
                )}
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
