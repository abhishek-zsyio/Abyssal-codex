"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { spring, softSpring, microSpring, staggerContainer } from "@/lib/transitions";
import { Terminal as TerminalIcon, X, ChevronRight, Hash, Activity, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Log {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "system";
  message: string;
}

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  notes?: any[];
  onSelectNote?: (id: string) => void;
  onAddNote?: (title: string, content: string) => void;
  onDeleteNote?: (id: string) => void;
}

export const Terminal = ({ isOpen, onClose, notes, onSelectNote, onAddNote, onDeleteNote }: TerminalProps) => {
  const [logs, setLogs] = useState<Log[]>([
    { id: "1", timestamp: new Date().toLocaleTimeString(), type: "system", message: "ABYSSAL_OS V1.4.2 INITIALIZED..." },
    { id: "2", timestamp: new Date().toLocaleTimeString(), type: "info", message: "CORE_KERNEL: READY" },
    { id: "3", timestamp: new Date().toLocaleTimeString(), type: "info", message: "NEURAL_LINK: STANDBY" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (isOpen) {
      // Use a smaller delay or requestAnimationFrame for snappier focus
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const addLog = (message: string, type: Log["type"] = "info") => {
    const newLog: Log = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [...prev, newLog].slice(-100));
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const fullCommand = input.trim();
    const args = fullCommand.split(' ');
    const cmd = args[0].toLowerCase();
    const targetName = args.slice(1).join(' ');

    addLog(`> ${fullCommand}`, "system");

    switch (cmd) {
      case "help":
        addLog("AVAILABLE_COMMANDS: LS, CAT, TOUCH, RM, PWD, WHOAMI, UNAME, DATE, NEOFETCH, CLEAR, EXIT", "info");
        break;
      case "ls":
        if (!notes || notes.length === 0) {
          addLog("DIRECTORY_EMPTY", "warning");
        } else {
          notes.forEach(note => {
            addLog(`-rw-r--r--  1 abyssal  staff  ${note.content.length} ${note.title || 'UNTITLED'}.md`, "info");
          });
        }
        break;
      case "cat":
        if (!targetName) {
          addLog("USAGE: CAT [FILENAME]", "error");
        } else {
          const note = notes?.find(n => (n.title || '').toLowerCase() === targetName.toLowerCase() || n.id.startsWith(targetName));
          if (note) {
            addLog(`--- START OF ${note.title} ---`, "system");
            const lines = note.content.split('\n');
            lines.forEach((line: string) => addLog(line, "info"));
            addLog(`--- EOF ---`, "system");
            if (onSelectNote) onSelectNote(note.id);
          } else {
            addLog(`ERR: FILE_NOT_FOUND: ${targetName}`, "error");
          }
        }
        break;
      case "touch":
        if (!targetName) {
          addLog("USAGE: TOUCH [FILENAME]", "error");
        } else {
          if (onAddNote) {
            onAddNote(targetName, "# New Note\nCreated via terminal.");
            addLog(`FILE_CREATED: ${targetName}.md`, "success");
          }
        }
        break;
      case "rm":
        if (!targetName) {
          addLog("USAGE: RM [FILENAME]", "error");
        } else {
          const noteToDelete = notes?.find(n => (n.title || '').toLowerCase() === targetName.toLowerCase() || n.id.startsWith(targetName));
          if (noteToDelete) {
            if (onDeleteNote) {
              onDeleteNote(noteToDelete.id);
              addLog(`FILE_DELETED: ${noteToDelete.title}.md`, "success");
            }
          } else {
            addLog(`ERR: FILE_NOT_FOUND: ${targetName}`, "error");
          }
        }
        break;
      case "pwd":
        addLog("/home/abyssal/documents/notes", "info");
        break;
      case "whoami":
        addLog("abyssal_operator_0xAF", "info");
        break;
      case "uname":
        if (args[1] === "-a") {
          addLog("AbyssalOS 1.4.2-generic #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux", "info");
        } else {
          addLog("AbyssalOS", "info");
        }
        break;
      case "date":
        addLog(new Date().toString(), "info");
        break;
      case "sudo":
        addLog("USER_NOT_IN_SUDOERS_FILE. THIS_INCIDENT_WILL_BE_REPORTED.", "error");
        break;
      case "neofetch":
        addLog("       .---.       OS: AbyssalOS 1.4.2", "system");
        addLog("      /     \\      Kernel: 5.15.0-abyssal", "system");
        addLog("      | (O) |      Uptime: 2 days, 4 hours", "system");
        addLog("      \\     /      Packages: 1024 (dpkg)", "system");
        addLog("       '---'       Shell: abyssh 1.0", "system");
        addLog("                   Resolution: 3840x2160", "system");
        addLog("                   WM: AbyssalManager", "system");
        addLog("                   Terminal: AbyssalTerm", "system");
        addLog("                   CPU: Neural Core i9 (16) @ 5.0GHz", "system");
        addLog("                   GPU: Abyssal Graphics G1", "system");
        addLog("                   Memory: 12GB / 32GB", "system");
        break;
      case "clear":
        setLogs([]);
        break;
      case "exit":
        onClose();
        break;
      case "ping":
        addLog("64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.042 ms", "success");
        break;
      default:
        addLog(`COMMAND_NOT_FOUND: ${cmd}`, "error");
    }

    setInput("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={spring}
          className="fixed bottom-0 left-0 lg:left-80 right-0 z-40 h-[280px] bg-[var(--background)] border-t border-[var(--border)] shadow-[0_-10px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden font-mono"
        >
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10 scanline" />
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.2em]">
                <TerminalIcon size={12} /> Terminal_Kernel_v1.0
              </span>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[8px] text-[var(--muted-foreground)] uppercase">
                  <Activity size={10} className="text-[var(--accent)]" /> Active
                </span>
                <span className="flex items-center gap-1 text-[8px] text-[var(--muted-foreground)] uppercase">
                  <Shield size={10} className="text-[var(--success)]" /> Secure
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Logs */}
          <motion.div 
            ref={scrollRef}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar selection:bg-[var(--primary)] selection:text-[var(--background)]"
          >
            {logs.map((log) => (
              <motion.div 
                key={log.id} 
                variants={{
                  hidden: { opacity: 0, x: -5 },
                  show: { opacity: 1, x: 0, transition: microSpring }
                }}
                className="flex gap-4 text-[11px] leading-relaxed group"
              >
                <span className="text-[var(--muted-foreground)] opacity-30 select-none group-hover:opacity-100 transition-opacity">
                  [{log.timestamp}]
                </span>
                <span className={cn(
                  "font-bold uppercase tracking-wider",
                  log.type === "info" && "text-[var(--muted-foreground)]",
                  log.type === "success" && "text-[var(--success)]",
                  log.type === "warning" && "text-[var(--warning)]",
                  log.type === "error" && "text-[var(--destructive)]",
                  log.type === "system" && "text-[var(--primary)]",
                )}>
                  {log.type}:
                </span>
                <span className="text-[var(--foreground)] opacity-90 break-all">
                  {log.message}
                </span>
              </motion.div>
            ))}
            {logs.length === 0 && (
              <div className="text-[10px] text-[var(--muted-foreground)] italic opacity-30">TERMINAL_BUFFER_EMPTY_EXPECTING_INPUT...</div>
            )}
          </motion.div>

          {/* Input Area */}
          <form onSubmit={handleCommand} className="px-4 py-2 border-t border-[var(--border)] bg-[var(--background)] opacity-90 flex items-center gap-2 shrink-0">
            <ChevronRight size={14} className="text-[var(--primary)]" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER_COMMAND..."
              className="flex-1 bg-transparent border-none outline-none text-[11px] font-mono text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] opacity-50 focus:opacity-100 transition-opacity uppercase"
            />
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-[var(--muted-foreground)] uppercase font-bold opacity-30">Prompt_Ready</span>
              <div className="w-1.5 h-3 bg-[var(--primary)] animate-pulse" />
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
