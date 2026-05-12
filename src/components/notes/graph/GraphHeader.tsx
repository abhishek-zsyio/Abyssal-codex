"use client";

import React from "react";
import { Activity, Search, Hash, Zap, ZoomIn, ZoomOut, Maximize2, X, Play, Pause, Link2, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

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
    <div className="px-8 py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/40 backdrop-blur-xl relative z-20 select-none">
      <div className="flex items-center gap-12">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black font-mono tracking-tighter uppercase text-[var(--foreground)] flex items-center gap-4 group">
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--muted-foreground)]">
                Nexus_Neural_Map
             </span>
            <Activity size={20} className="text-[var(--primary)] group-hover:scale-110 transition-transform" />
          </h2>
          <div className="flex items-center gap-3 mt-1">
             <div className="h-0.5 w-8 bg-[var(--primary)] opacity-50" />
             <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em]">System_Visualization_v4.0.1</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="relative group">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
          <input 
            type="text"
            placeholder="LOCATE_NODE_STREAM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[var(--background)]/50 backdrop-blur-md border border-[var(--border)] py-2.5 pl-11 pr-5 text-[11px] font-mono focus:outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--muted-foreground)]/50 w-64 rounded-sm"
          />
        </div>

        <div className="flex bg-[var(--background)]/50 backdrop-blur-md border border-[var(--border)] p-1 rounded-sm">
          <Tooltip content="Neural Linkage Mode" shortcut="L">
            <button 
              onClick={() => setIsLinkMode(!isLinkMode)} 
              className={cn("p-2.5 transition-all rounded-sm", isLinkMode ? "text-[var(--primary)] bg-[var(--primary)]/10 shadow-[inset_0_0_10px_rgba(var(--primary-rgb),0.1)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
            >
              <Link2 size={18} />
            </button>
          </Tooltip>

          <Tooltip content="System HUD Overlay" shortcut="H">
            <button 
              onClick={() => setShowHUD(!showHUD)} 
              className={cn("p-2.5 transition-all rounded-sm", showHUD ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
            >
              <LayoutDashboard size={18} />
            </button>
          </Tooltip>

          <Tooltip content={isPaused ? "Resume Engine" : "Pause Engine"} shortcut="Space">
            <button 
              onClick={() => setIsPaused(!isPaused)} 
              className={cn("p-2.5 transition-all rounded-sm", isPaused ? "text-[var(--destructive)] bg-[var(--destructive)]/10" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>
          </Tooltip>
          
          <div className="w-px h-5 bg-[var(--border)] mx-2 self-center opacity-50" />
          
          <Tooltip content="Zoom In" shortcut="+">
            <button onClick={onZoomIn} className="p-2.5 hover:bg-[var(--primary)]/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all rounded-sm">
              <ZoomIn size={18} />
            </button>
          </Tooltip>

          <Tooltip content="Zoom Out" shortcut="-">
            <button onClick={onZoomOut} className="p-2.5 hover:bg-[var(--primary)]/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all rounded-sm">
              <ZoomOut size={18} />
            </button>
          </Tooltip>

          <div className="w-px h-5 bg-[var(--border)] mx-2 self-center opacity-50" />

          <Tooltip content="Reset Viewport" shortcut="R">
            <button onClick={onReset} className="p-2.5 hover:bg-[var(--primary)]/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all rounded-sm">
              <Maximize2 size={18} />
            </button>
          </Tooltip>
        </div>

        {variant === "modal" && (
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-[var(--destructive)] text-[var(--muted-foreground)] hover:text-white transition-all rounded-sm border border-[var(--border)] hover:border-[var(--destructive)] group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}
      </div>
    </div>
  );
};
