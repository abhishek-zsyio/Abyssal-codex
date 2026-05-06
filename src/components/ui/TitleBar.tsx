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
      className="h-8 w-full bg-[var(--background)] border-b border-dotted border-[var(--border)] flex items-center justify-between px-3 select-none flex-shrink-0 z-[10000]"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <img src="/logo.png" alt="Logo" className="w-4 h-4 grayscale" />
        <span className="text-[10px] font-mono font-bold text-[var(--muted-foreground)] uppercase tracking-widest">
          Abyssal_Codex_v4.0.1
        </span>
      </div>

      <div className="flex items-center">
        <button
          onClick={() => appWindow.minimize()}
          className="p-2 hover:bg-[var(--card)] text-[var(--muted-foreground)] transition-colors"
          title="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="p-2 hover:bg-[var(--card)] text-[var(--muted-foreground)] transition-colors"
          title="Maximize"
        >
          <Square size={12} />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="p-2 hover:bg-[var(--destructive)] hover:text-white text-[var(--muted-foreground)] transition-colors"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
