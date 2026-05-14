"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Link2, 
  Pause, 
  Play, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Filter, 
  FolderOpen, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GraphControlsProps {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLinkMode: boolean;
  setIsLinkMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean | ((prev: boolean) => boolean)) => void;
  hideOrphans: boolean;
  setHideOrphans: (hide: boolean | ((prev: boolean) => boolean)) => void;
  foldersOnly: boolean;
  setFoldersOnly: (foldersOnly: boolean | ((prev: boolean) => boolean)) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  variant: "modal" | "tab";
  onClose: () => void;
}

export function GraphControls({
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  isLinkMode,
  setIsLinkMode,
  isPaused,
  setIsPaused,
  hideOrphans,
  setHideOrphans,
  foldersOnly,
  setFoldersOnly,
  onZoomIn,
  onZoomOut,
  onFitToView,
  variant,
  onClose
}: GraphControlsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Search */}
      <AnimatePresence>
        {showSearch && (
          <motion.input
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 180, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            type="text"
            placeholder="FILTER_NODES..."
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 px-3 text-[10px] font-mono bg-[var(--background)] border border-[var(--border)] rounded-none focus:outline-none focus:border-[var(--primary)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/30 mr-1 uppercase"
          />
        )}
      </AnimatePresence>
      {[
        {
          icon: Search,
          action: () => {
            setShowSearch(!showSearch);
            if (showSearch) setSearchQuery("");
          },
          active: showSearch,
          tip: "Search",
        },
        {
          icon: Link2,
          action: () => setIsLinkMode((l: boolean) => !l),
          active: isLinkMode,
          tip: "Link mode",
        },
        {
          icon: isPaused ? Play : Pause,
          action: () => setIsPaused((p: boolean) => !p),
          active: isPaused,
          tip: isPaused ? "Resume" : "Pause",
        },
        {
          icon: ZoomIn,
          action: onZoomIn,
          tip: "Zoom in",
        },
        {
          icon: ZoomOut,
          action: onZoomOut,
          tip: "Zoom out",
        },
        {
          icon: Maximize2,
          action: onFitToView,
          tip: "Fit to view",
        },
      ].map(({ icon: Icon, action, active, tip }, i) => (
        <button
          key={i}
          onClick={action}
          title={tip}
          className={cn(
            "w-8 h-8 flex items-center justify-center transition-all border border-transparent",
            active
              ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5",
          )}
        >
          <Icon size={13} />
        </button>
      ))}
      {/* Filter toggles */}
      <div className="w-px h-4 bg-[var(--border)]/40 mx-1" />
      <button
        onClick={() => setHideOrphans((v: boolean) => !v)}
        title={hideOrphans ? "Show orphan nodes" : "Hide orphan nodes"}
        className={cn("w-8 h-8 flex items-center justify-center transition-all border border-transparent",
          hideOrphans ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
        )}
      >
        <Filter size={13} />
      </button>
      <button
        onClick={() => setFoldersOnly((v: boolean) => !v)}
        title={foldersOnly ? "Show all nodes" : "Folders only"}
        className={cn("w-8 h-8 flex items-center justify-center transition-all border border-transparent",
          foldersOnly ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
        )}
      >
        <FolderOpen size={13} />
      </button>
      {variant === "modal" && (
        <button
          onClick={onClose}
          title="Close"
          className="w-8 h-8 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all ml-1"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
