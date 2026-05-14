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
import { spring, microSpring, staggerContainer, fadeInScale } from "@/lib/transitions";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { Kbd } from "@/components/ui/DataDisplay";
import { useTheme } from "@/hooks/use-theme";
import { usePlugins } from "@/hooks/use-plugins";
import { CornerAccents } from "@/components/ui/Effects";

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
    { id: "1", timestamp: new Date().toLocaleTimeString(), type: "system", message: "ABYSSAL_OMNI_CONSOLE V1.0 INITIALIZED..." },
  ]);
  const [activeTab, setActiveTab] = useState<"search" | "terminal">("search");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalLog = (e: any) => {
      if (e.detail && e.detail.message) {
        addLog(e.detail.message, e.detail.type || "info");
      }
    };
    window.addEventListener("abyssal-log", handleGlobalLog);
    return () => window.removeEventListener("abyssal-log", handleGlobalLog);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Fuse search
  const fuse = useMemo(() => new Fuse(notes, {
    keys: ["title", "content"],
    threshold: 0.4,
  }), [notes]);

  const filteredNotes = useMemo(() => {
    if (!query || query.startsWith("/")) return notes.slice(0, 5);
    return fuse.search(query).map(result => result.item);
  }, [notes, query, fuse]);

  const addLog = (message: string, type: Log["type"] = "info") => {
    const newLog: Log = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [...prev, newLog].slice(-50));
  };

  const handleCommand = (cmdStr: string) => {
    const fullCommand = cmdStr.startsWith("/") ? cmdStr.slice(1) : cmdStr;
    const args = fullCommand.split(' ');
    const cmd = args[0].toLowerCase();
    const targetName = args.slice(1).join(' ');

    addLog(`> ${fullCommand}`, "system");
    setActiveTab("terminal");

    switch (cmd) {
      case "help":
        addLog("COMMANDS: LS, CAT, TOUCH, RM, PWD, CLEAR, THEMES, PLUGINS, VAULT, EXPORT, WHOAMI, UNAME, DATE, NEOFETCH, PING", "info");
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
      case "pwd":
        addLog("/home/abyssal/documents/notes", "info");
        break;
      case "whoami":
        addLog("abyssal_operator_0xAF", "info");
        break;
      case "uname":
        addLog(args[1] === "-a" ? "AbyssalOS 1.4.2-generic #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux" : "AbyssalOS", "info");
        break;
      case "date":
        addLog(new Date().toString(), "info");
        break;
      case "neofetch":
        addLog("       .---.       OS: AbyssalOS 1.4.2", "system");
        addLog("      /     \\      Kernel: 5.15.0-abyssal", "system");
        addLog("      | (O) |      Uptime: 2 days, 4 hours", "system");
        addLog("      \\     /      Shell: abyssh 1.0", "system");
        addLog("       '---'       CPU: Neural Core i9", "system");
        break;
      case "ping":
        addLog("64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.042 ms", "success");
        break;
      case "themes":
        onOpenThemes();
        onClose();
        break;
      case "plugins":
        onOpenPlugins();
        onClose();
        break;
      case "vault":
      case "security":
        onOpenSecurity();
        onClose();
        break;
      case "export":
        exportAllNotes();
        addLog("EXPORT_STARTED", "success");
        break;
      case "clear":
        setLogs([]);
        break;
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
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm"
          />
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative w-full max-w-2xl bg-[var(--background)] border border-[var(--border)] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] font-mono"
          >
            <CornerAccents />
            
            {/* Header / Input */}
            <div className="flex flex-col border-b border-[var(--border)]">
              <div className="flex items-center px-4 py-4 bg-[var(--card)]">
                <span className="text-[var(--primary)] mr-3 flex items-center gap-2">
                  {query.startsWith("/") ? <TerminalIcon size={18} /> : <Command size={18} />}
                  <span className="text-xs font-bold opacity-50">/</span>
                </span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={activeTab === "search" ? "Search notes or type '/' for commands..." : "Enter terminal command..."}
                  className="flex-1 bg-transparent border-none outline-none text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--muted-foreground)] uppercase tracking-wider"
                />
                <div className="flex gap-2 items-center">
                  <div className={cn(
                    "px-2 py-0.5 text-[8px] border transition-colors cursor-pointer",
                    activeTab === "search" ? "bg-[var(--primary)] text-[var(--background)] border-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)]"
                  )} onClick={() => setActiveTab("search")}>SEARCH</div>
                  <div className={cn(
                    "px-2 py-0.5 text-[8px] border transition-colors cursor-pointer",
                    activeTab === "terminal" ? "bg-[var(--primary)] text-[var(--background)] border-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)]"
                  )} onClick={() => setActiveTab("terminal")}>TERM</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Terminal / Logs Area (Always visible or toggleable) */}
              <div className={cn(
                "flex-1 flex flex-col border-r border-[var(--border)] bg-black/20",
                activeTab === "search" && "hidden md:flex"
              )}>
                <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--card)] flex justify-between items-center">
                  <span className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-tighter flex items-center gap-2">
                    <Activity size={10} className="text-[var(--accent)]" /> System_Logs
                  </span>
                </div>
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar text-[10px]"
                >
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 leading-relaxed opacity-80 hover:opacity-100 transition-opacity">
                      <span className="text-[var(--muted-foreground)] opacity-30">[{log.timestamp}]</span>
                      <span className={cn(
                        "font-bold uppercase",
                        log.type === "info" && "text-[var(--muted-foreground)]",
                        log.type === "success" && "text-[var(--success)]",
                        log.type === "error" && "text-[var(--destructive)]",
                        log.type === "system" && "text-[var(--primary)]",
                      )}>{log.type}:</span>
                      <span className="text-[var(--foreground)]">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Results Area */}
              <div className={cn(
                "w-full md:w-[300px] flex flex-col bg-[var(--background)]",
                activeTab === "terminal" && "hidden md:flex"
              )}>
                <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--card)] flex justify-between items-center">
                  <span className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-tighter">
                    {query ? "Search_Results" : "Recent_Files"}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                  {filteredNotes.length === 0 ? (
                    <div className="p-8 text-center text-[10px] text-[var(--muted-foreground)] uppercase">No matches found</div>
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
                        className="w-full flex flex-col px-3 py-3 text-left hover:bg-[var(--secondary)] border-b border-[var(--border)] group transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={12} className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)]" />
                          <span className="text-[10px] font-bold text-[var(--foreground)] truncate uppercase tracking-widest">{note.title || "UNTITLED"}</span>
                        </div>
                        {query && note.content && (
                          <span className="text-[8px] text-[var(--muted-foreground)] truncate mt-1 opacity-50 uppercase">
                            {note.content.substring(0, 40)}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer / Shortcut Info */}
            <div className="px-4 py-2 bg-[var(--card)] border-t border-[var(--border)] text-[9px] text-[var(--muted-foreground)] flex justify-between items-center shrink-0 uppercase tracking-widest">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><Kbd>TAB</Kbd> SWITCH_MODE</span>
                <span className="flex items-center gap-1"><Kbd>ENTER</Kbd> SELECT</span>
                <span className="flex items-center gap-1"><Kbd>CMD</Kbd>+<Kbd>ENTER</Kbd> SIDE_LANE</span>
              </div>
              <div className="flex gap-2">
                <Shield size={10} className="text-[var(--success)]" />
                <span>KERNEL_OK</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OmniConsole;
