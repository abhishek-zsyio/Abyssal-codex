"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
}

export const Terminal = ({ isOpen, onClose }: TerminalProps) => {
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
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const addLog = (message: string, type: Log["type"] = "info") => {
    const newLog: Log = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    addLog(`> ${input}`, "system");

    switch (cmd) {
      case "help":
        addLog("AVAILABLE_COMMANDS: HELP, CLEAR, STATS, STATUS, PING, EXIT", "info");
        break;
      case "clear":
        setLogs([]);
        break;
      case "stats":
        addLog("Uptime: 01:48:01", "success");
        addLog("Memory_Buffer: 42MB", "success");
        addLog("IO_Operations: 1,402", "success");
        break;
      case "status":
        addLog("All systems nominal.", "success");
        break;
      case "ping":
        addLog("Pong! Latency: 14ms", "success");
        break;
      case "exit":
        onClose();
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
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 280, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="fixed bottom-0 left-0 lg:left-80 right-0 z-40 bg-[#0d0d0d] border-t border-[var(--border)] shadow-[0_-10px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden font-mono"
        >
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10 scanline" />
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[#111] shrink-0">
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
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar selection:bg-[var(--primary)] selection:text-[var(--background)]"
          >
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 text-[11px] leading-relaxed group">
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
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-[10px] text-[var(--muted-foreground)] italic opacity-30">TERMINAL_BUFFER_EMPTY_EXPECTING_INPUT...</div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleCommand} className="px-4 py-2 border-t border-[var(--border)] bg-[#0a0a0a] flex items-center gap-2 shrink-0">
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
