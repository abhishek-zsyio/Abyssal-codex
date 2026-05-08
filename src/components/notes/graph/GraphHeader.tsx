"use client";

import React from "react";
import { Activity, Search, Hash, Zap, ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GraphHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLinkMode: boolean;
  setIsLinkMode: (mode: boolean) => void;
  showHUD: boolean;
  setShowHUD: (show: boolean) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onClose: () => void;
  variant?: "modal" | "tab";
}

export const GraphHeader = ({
  searchQuery,
  setSearchQuery,
  isLinkMode,
  setIsLinkMode,
  showHUD,
  setShowHUD,
  isPaused,
  setIsPaused,
  onZoomIn,
  onZoomOut,
  onReset,
  onClose,
  variant
}: GraphHeaderProps) => {
  return (
    <div className="px-8 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/80 relative z-20">
      <div className="flex items-center gap-10">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold font-mono tracking-tighter uppercase text-[var(--foreground)] flex items-center gap-3">
            Nexus_Neural_Map
            <Activity size={16} className="text-[var(--primary)]" />
          </h2>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input 
            type="text"
            placeholder="LOCATE_NODE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[var(--background)] border border-[var(--border)] py-1.5 pl-9 pr-4 text-[10px] font-mono focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--muted-foreground)] w-48"
          />
        </div>

        <div className="flex bg-[var(--background)] border border-[var(--border)] p-1 rounded-lg">
          <button 
            onClick={() => setIsLinkMode(!isLinkMode)} 
            className={cn("p-2 transition-all", isLinkMode ? "text-[var(--primary)] bg-[var(--primary)]/10" : "text-[var(--muted-foreground)]")}
            title="Neural Linkage Protocol (Connect Notes)"
          >
            <Hash size={16} />
          </button>
          <button 
            onClick={() => setShowHUD(!showHUD)} 
            className={cn("p-2 transition-all", showHUD ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}
            title="Toggle HUD Overlay"
          >
            <Activity size={16} />
          </button>
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className={cn("p-2 transition-all", isPaused ? "text-[var(--destructive)]" : "text-[var(--muted-foreground)]")}
            title="Toggle Animation"
          >
            <Zap size={16} />
          </button>
          <div className="w-px h-4 bg-[var(--border)] mx-1 self-center" />
          <button onClick={onZoomIn} className="p-2 hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">
            <ZoomIn size={16} />
          </button>
          <button onClick={onZoomOut} className="p-2 hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">
            <ZoomOut size={16} />
          </button>
          <button onClick={onReset} className="p-2 hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all border-l border-[var(--border)]">
            <Maximize2 size={16} />
          </button>
        </div>
        {variant === "modal" && (
          <button onClick={onClose} className="p-2.5 hover:bg-[var(--destructive)]/10 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all rounded-full border border-transparent hover:border-[var(--destructive)]/20">
            <X size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
