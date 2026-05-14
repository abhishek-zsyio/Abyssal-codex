"use client";

import React from "react";
import { Star, Globe, Download, Maximize2, PanelRight, Edit3, Eye, Copy, Check, Hash, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlugins } from "@/hooks/use-plugins";

interface EditorHeaderProps {
  title: string;
  id: string;
  isFavorite: boolean;
  isPublic: boolean;
  isEditing: boolean;
  isZenMode: boolean;
  copiedShareLink: boolean;
  onToggleFavorite: () => void;
  onTogglePublic: () => void;
  onDownload: () => void;
  onToggleEdit: (editing: boolean) => void;
  onToggleZen: () => void;
  onCopy: () => void;
  onCommit: () => void;
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
  onUpdateTitle?: (title: string) => void;
  isSaving: boolean;
}

export const EditorHeader = ({
  title,
  id,
  isFavorite,
  isPublic,
  isEditing,
  isZenMode,
  copiedShareLink,
  onToggleFavorite,
  onTogglePublic,
  onDownload,
  onToggleEdit,
  onToggleZen,
  onCopy,
  onCommit,
  isRightSidebarOpen,
  onToggleRightSidebar,
  onUpdateTitle,
  isSaving
}: EditorHeaderProps) => {
  const { isEnabled } = usePlugins();
  
  return (
    <header className="h-10 border-b border-[var(--border)] flex items-center justify-between px-3 bg-[var(--background)] select-none">
      {/* Left: Path / Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1 text-[9px] font-mono text-[var(--muted-foreground)] uppercase whitespace-nowrap opacity-40">
            <span>{title.split('/').slice(0, -1).join(' / ') || 'vault'}</span>
            <span className="mx-0.5 opacity-20">/</span>
          </div>
          <input
            type="text"
            value={title.split('/').pop() || ""}
            onChange={(e) => {
              const parts = title.split('/');
              parts[parts.length - 1] = e.target.value.replace(/\//g, '');
              onUpdateTitle?.(parts.join('/'));
            }}
            className="bg-transparent border-none outline-none text-[11px] font-bold text-[var(--foreground)] w-full focus:text-[var(--primary)] transition-colors placeholder:opacity-20 truncate uppercase tracking-tight"
            placeholder="Untitled"
          />
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-[var(--card)]/30 border border-[var(--border)]/50 shrink-0">
          <div className={cn("w-1 h-1 rounded-full", isSaving ? "bg-[var(--primary)] animate-pulse" : "bg-[var(--accent)]/40")} />
          <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">
            {isSaving ? "Syncing" : "Static"}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Favorite/Public */}
        <button 
          onClick={onToggleFavorite} 
          className={cn("w-8 h-8 flex items-center justify-center transition-colors", isFavorite ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
        >
          <Star size={13} className={cn(isFavorite && "fill-current")} />
        </button>
        
        <button 
          onClick={onTogglePublic} 
          className={cn("w-8 h-8 flex items-center justify-center transition-colors", isPublic ? "text-[var(--accent)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
        >
          {copiedShareLink ? <Check size={13} className="text-[var(--accent)]" /> : <Globe size={13} />}
        </button>

        <div className="w-px h-4 bg-[var(--border)]/40 mx-1" />

        {/* View Toggles */}
        <button 
          onClick={() => onToggleEdit(true)}
          className={cn(
            "w-8 h-8 flex items-center justify-center transition-all",
            isEditing ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          <Edit3 size={13} />
        </button>
        <button 
          onClick={() => onToggleEdit(false)}
          className={cn(
            "w-8 h-8 flex items-center justify-center transition-all",
            !isEditing ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          <Eye size={13} />
        </button>

        <div className="w-px h-4 bg-[var(--border)]/40 mx-1" />

        {/* Utilities */}
        {isEnabled("zen-mode") && (
          <button 
            onClick={onToggleZen}
            className={cn(
              "w-8 h-8 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)]",
              isZenMode && "text-[var(--primary)] bg-[var(--primary)]/10"
            )}
          >
            <Maximize2 size={13} />
          </button>
        )}

        <button 
          onClick={onToggleRightSidebar}
          className={cn(
            "w-8 h-8 flex items-center justify-center transition-all",
            isRightSidebarOpen ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          <PanelRight size={13} />
        </button>

        <div className="w-px h-4 bg-[var(--border)]/40 mx-1" />

        <button onClick={onDownload} className="w-8 h-8 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <Download size={13} />
        </button>

        <button 
          onClick={onCommit}
          className="ml-2 h-7 px-3 bg-[var(--primary)] text-[var(--background)] font-bold text-[9px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-1.5"
        >
          <Save size={10} /> Commit
        </button>
      </div>
    </header>
  );
};
