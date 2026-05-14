"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Note } from "@/types/note";
import { 
  Search, 
  FileText, 
  Plus, 
  Download, 
  X, 
  Terminal as TerminalIcon, 
  ChevronRight, 
  Hash, 
  Activity, 
  Shield,
  Palette,
  Package,
  Calendar,
  Command,
  ArrowRight,
  Lock
} from "lucide-react";
import { spring, microSpring, fadeInScale } from "@/lib/transitions";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/DataDisplay";
import { useTheme } from "@/hooks/use-theme";
import { usePlugins } from "@/hooks/use-plugins";
import { useSearchWorker } from "@/hooks/use-search-worker";

interface Log {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "system";
  message: string;
}

interface OmniConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (id: string) => void;
  onAddNote: (title?: string) => void;
  onDeleteNote: (id: string) => void;
  exportAllNotes: () => void;
  onOpenPlugins: () => void;
  onOpenThemes: () => void;
  onOpenSecurity: () => void;
  onOpenToSide?: (id: string) => void;
}

const OmniConsole = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onAddNote,
  onDeleteNote,
  exportAllNotes,
  onOpenPlugins,
  onOpenThemes,
  onOpenSecurity,
  onOpenToSide,
}: OmniConsoleProps) => {
  const { theme } = useTheme();
  const { isEnabled } = usePlugins();
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState<Log[]>([
    { id: "1", timestamp: new Date().toLocaleTimeString(), type: "system", message: "OMNI_CONSOLE V1.0 INITIALIZED..." },
  ]);
  const [activeTab, setActiveTab] = useState<"search" | "terminal">("search");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: Log["type"] = "info") => {
    const newLog: Log = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [...prev, newLog].slice(-50));
  };

  const { results: filteredNotes, search, isSearching } = useSearchWorker(notes);

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleCommand = (cmdStr: string) => {
    const fullCommand = cmdStr.startsWith("/") ? cmdStr.slice(1) : cmdStr;
    const args = fullCommand.split(' ');
    const cmd = args[0].toLowerCase();
    const targetName = args.slice(1).join(' ');

    addLog(`> ${fullCommand}`, "system");
    setActiveTab("terminal");

    switch (cmd) {
      case "help":
        addLog("COMMANDS: LS, CAT, TOUCH, RM, PWD, CLEAR, THEMES, PLUGINS, VAULT, EXPORT, DATE, PING", "info");
        break;
      case "ls":
        if (notes.length === 0) addLog("DIRECTORY_EMPTY", "warning");
        else notes.forEach(n => addLog(`-rw-r--r--  1 abyssal  staff  ${n.content.length} ${n.title || 'UNTITLED'}.md`, "info"));
        break;
      case "cat":
        if (!targetName) addLog("USAGE: CAT [FILENAME]", "error");
        else {
          const note = notes.find(n => (n.title || '').toLowerCase() === targetName.toLowerCase() || n.id.startsWith(targetName));
          if (note) {
            addLog(`--- START OF ${note.title} ---`, "system");
            note.content.split('\n').forEach(line => addLog(line, "info"));
            addLog(`--- EOF ---`, "system");
            onSelectNote(note.id);
          } else addLog(`ERR: FILE_NOT_FOUND: ${targetName}`, "error");
        }
        break;
      case "touch":
        if (!targetName) addLog("USAGE: TOUCH [FILENAME]", "error");
        else {
          onAddNote(targetName);
          addLog(`FILE_CREATED: ${targetName}.md`, "success");
        }
        break;
      case "rm":
        if (!targetName) addLog("USAGE: RM [FILENAME]", "error");
        else {
          const noteToDelete = notes.find(n => (n.title || '').toLowerCase() === targetName.toLowerCase() || n.id.startsWith(targetName));
          if (noteToDelete) {
            onDeleteNote(noteToDelete.id);
            addLog(`FILE_DELETED: ${noteToDelete.title}.md`, "success");
          } else addLog(`ERR: FILE_NOT_FOUND: ${targetName}`, "error");
        }
        break;
      case "clear":
        setLogs([]);
        break;
      case "ping":
        addLog("PONG: LOCAL_BUFFER_RESPONSE (0.01ms)", "success");
        break;
      case "themes":
        onOpenThemes(); onClose(); break;
      case "plugins":
        onOpenPlugins(); onClose(); break;
      case "vault":
        onOpenSecurity(); onClose(); break;
      case "export":
        exportAllNotes(); addLog("EXPORT_STARTED", "success"); break;
      default:
        addLog(`UNKNOWN_COMMAND: ${cmd}`, "error");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (query.startsWith("/") || activeTab === "terminal") {
        handleCommand(query);
        setQuery("");
      } else if (filteredNotes.length > 0) {
        onSelectNote(filteredNotes[0].id);
        onClose();
      }
    }
    if (e.key === "Tab") {
      e.preventDefault();
      setActiveTab(prev => prev === "search" ? "terminal" : "search");
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative w-full max-w-xl bg-[var(--background)] border border-[var(--border)] shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[70vh] font-mono"
          >
            {/* Input Row */}
            <div className="flex items-center px-4 h-14 bg-[var(--card)]/40 border-b border-[var(--border)]">
              <div className="text-[var(--primary)] mr-3 opacity-60">
                {query.startsWith("/") ? <TerminalIcon size={16} /> : <Command size={16} />}
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={activeTab === "search" ? "Search for notes…" : "Enter system command…"}
                className="flex-1 bg-transparent border-none outline-none text-[var(--foreground)] text-[12px] font-mono placeholder:text-[var(--muted-foreground)]/30"
              />
              <div className="flex gap-1 ml-4">
                <button 
                  onClick={() => setActiveTab("search")}
                  className={cn(
                    "px-2 py-0.5 text-[8px] border transition-colors",
                    activeTab === "search" ? "bg-[var(--primary)]/10 border-[var(--primary)]/40 text-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)]/50"
                  )}
                >
                  SEARCH
                </button>
                <button 
                  onClick={() => setActiveTab("terminal")}
                  className={cn(
                    "px-2 py-0.5 text-[8px] border transition-colors",
                    activeTab === "terminal" ? "bg-[var(--primary)]/10 border-[var(--primary)]/40 text-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)]/50"
                  )}
                >
                  CONSOLE
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Terminal / Logs Area */}
              {activeTab === "terminal" && (
                <div className="flex-1 flex flex-col bg-black/10">
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar text-[10px]"
                  >
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-2 opacity-80">
                        <span className="text-[var(--muted-foreground)] opacity-20 text-[8px]">[{log.timestamp.split(' ')[0]}]</span>
                        <span className={cn(
                          "uppercase text-[9px] font-bold min-w-[50px]",
                          log.type === "system" && "text-[var(--primary)]",
                          log.type === "error" && "text-[var(--destructive)]",
                          log.type === "success" && "text-[var(--accent)]",
                          log.type === "info" && "text-[var(--muted-foreground)]"
                        )}>{log.type}</span>
                        <span className="text-[var(--foreground)]/80">{log.message}</span>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="text-[9px] text-[var(--muted-foreground)] opacity-30 text-center py-8">Buffer clear.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Search Results Area */}
              {activeTab === "search" && (
                <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                  {filteredNotes.length === 0 ? (
                    <div className="p-12 text-center text-[9px] text-[var(--muted-foreground)] uppercase tracking-widest opacity-30">
                       No index matches
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <button
                        key={note.id}
                        onClick={(e) => { 
                          if ((e.metaKey || e.ctrlKey) && onOpenToSide) {
                            onOpenToSide(note.id);
                          } else {
                            onSelectNote(note.id); 
                          }
                          onClose(); 
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[var(--primary)]/5 group transition-colors border-b border-[var(--border)]/30 last:border-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText size={12} className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] shrink-0" />
                          <div className="truncate">
                            <span className="text-[11px] font-bold text-[var(--foreground)] block uppercase tracking-tight truncate">
                              {note.title || "Untitled"}
                            </span>
                            <span className="text-[8px] text-[var(--muted-foreground)] opacity-40 block truncate">
                              {note.content.substring(0, 60)}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={10} className="text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 h-9 bg-[var(--card)]/20 border-t border-[var(--border)] text-[8px] text-[var(--muted-foreground)] flex justify-between items-center shrink-0 font-mono uppercase tracking-[0.2em]">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><Kbd>TAB</Kbd> MODAL_SWAP</span>
                <span className="flex items-center gap-1.5"><Kbd>ENTER</Kbd> COMMIT</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
                <span>SECURE_LINK</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OmniConsole;
