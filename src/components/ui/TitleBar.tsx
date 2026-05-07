"use client";

import React, { useEffect, useState } from "react";
import { X, Minus, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const TitleBar = () => {
  const [appWindow, setAppWindow] = useState<any>(null);

  useEffect(() => {
    // Only import and initialize window on client side if running in Tauri
    if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
      import("@tauri-apps/api/window").then((module) => {
        setAppWindow(module.getCurrentWindow());
      });
    }
  }, []);

  if (!appWindow) return null;

  return (
    <div 
      data-tauri-drag-region 
      className="h-9 w-full bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-4 select-none flex-shrink-0 z-[10000] relative group"
    >
      <div className="flex items-center gap-3 pointer-events-none">
        <div className="w-5 h-5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-3.5 h-3.5 grayscale brightness-150" />
        </div>
        <div className="flex flex-col -space-y-1">
          <span className="text-[10px] font-mono font-bold text-[var(--foreground)] uppercase tracking-[0.2em]">
            Abyssal_Codex
          </span>
          <span className="text-[7px] font-mono text-[var(--primary)] uppercase tracking-[0.3em] opacity-70">
            Secure_Environment // v4.0.1
          </span>
        </div>
      </div>

      <div className="flex items-center h-full">
        <button
          onClick={() => appWindow.minimize()}
          className="h-full px-4 hover:bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all flex items-center justify-center border-l border-[var(--border)]"
          title="Minimize"
        >
          <Minus size={14} strokeWidth={3} />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="h-full px-4 hover:bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all flex items-center justify-center border-l border-[var(--border)]"
          title="Maximize"
        >
          <Square size={10} strokeWidth={3} />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="h-full px-4 hover:bg-[var(--destructive)] hover:text-white text-[var(--muted-foreground)] transition-all flex items-center justify-center border-l border-[var(--border)] group/close"
          title="Close"
        >
          <X size={14} strokeWidth={3} className="group-hover/close:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
