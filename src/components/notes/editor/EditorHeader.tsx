"use client";

import React from "react";
import { Star, Globe, Download, Maximize2, PanelRight, Edit3, Eye, Link, Copy, Check, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { usePlugins } from "@/hooks/use-plugins";

interface EditorHeaderProps {
  title: string;
  id: string;
  isFavorite: boolean;
  isPublic: boolean;
  isEditing: boolean;
  isZenMode: boolean;
  copiedContent: boolean;
  copiedLink: boolean;
  copiedShareLink: boolean;
  onToggleFavorite: () => void;
  onTogglePublic: () => void;
  onDownload: () => void;
  onToggleEdit: (editing: boolean) => void;
  onToggleZen: () => void;
  onCopy: () => void;
  onCopyWikiLink: () => void;
  onCopyShareLink: () => void;
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
  copiedContent,
  copiedLink,
  copiedShareLink,
  onToggleFavorite,
  onTogglePublic,
  onDownload,
  onToggleEdit,
  onToggleZen,
  onCopy,
  onCopyWikiLink,
  onCopyShareLink,
  onCommit,
  isRightSidebarOpen,
  onToggleRightSidebar,
  onUpdateTitle,
  isSaving
}: EditorHeaderProps) => {
  const { isEnabled } = usePlugins();
  return (
    <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--background)] select-none">
      {/* Left: Identification & Path */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex items-center gap-2 px-2 py-1 bg-[var(--card)] border border-[var(--border)] rounded-sm shrink-0">
          <Hash size={10} className="text-[var(--primary)] opacity-50" />
          <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-tighter">
            {id.split('-')[0]}
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--muted-foreground)] uppercase whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">
            <span>{title.split('/').slice(0, -1).join(' / ') || 'root'}</span>
            {title.includes('/') && <span className="text-[var(--primary)] mx-0.5">/</span>}
          </div>
          <input
            type="text"
            value={title.split('/').pop() || ""}
            onChange={(e) => {
              const parts = title.split('/');
              parts[parts.length - 1] = e.target.value.replace(/\//g, '');
              onUpdateTitle?.(parts.join('/'));
            }}
            className="bg-transparent border-none outline-none text-[13px] font-bold text-[var(--foreground)] w-full focus:text-[var(--primary)] transition-colors placeholder:opacity-20 truncate"
            placeholder="Untitled"
          />
        </div>
      </div>

      {/* Right: Functional Groups */}
      <div className="flex items-center gap-6 shrink-0">
        {/* Status Indicators */}
        <div className="flex items-center gap-4 border-r border-[var(--border)] pr-6">
          <button 
            onClick={onToggleFavorite} 
            className={cn("transition-colors", isFavorite ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
          >
            <Star size={14} className={cn(isFavorite && "fill-current")} />
          </button>
          
          <button 
            onClick={onTogglePublic} 
            className={cn("transition-colors", isPublic ? "text-[var(--accent)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
          >
            {copiedShareLink ? <Check size={14} className="text-[var(--accent)]" /> : <Globe size={14} />}
          </button>

          <div className="flex items-center gap-2 px-2 py-1 bg-[var(--card)] border border-[var(--border)]">
             <div className={cn("w-1.5 h-1.5 rounded-full", isSaving ? "bg-[var(--primary)] animate-pulse" : "bg-[var(--accent)]/40")} />
             <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">
               {isSaving ? "Syncing" : "Saved"}
             </span>
          </div>
        </div>

        {/* View Switcher (Minimalist) */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onToggleEdit(true)}
            className={cn(
              "p-2 rounded-sm transition-all",
              isEditing ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <Edit3 size={14} />
          </button>
          <button 
            onClick={() => onToggleEdit(false)}
            className={cn(
              "p-2 rounded-sm transition-all",
              !isEditing ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <Eye size={14} />
          </button>
          
          {isEnabled("zen-mode") && (
            <button 
              onClick={onToggleZen}
              className={cn(
                "p-2 rounded-sm transition-all text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10",
                isZenMode && "text-[var(--primary)] bg-[var(--primary)]/10"
              )}
              title="Toggle Zen Mode (⌘+B)"
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 border-l border-[var(--border)] pl-6">
          <button onClick={onDownload} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <Download size={14} />
          </button>
          <button onClick={onCopy} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <Copy size={14} />
          </button>
          <button 
            onClick={onCommit}
            className="ml-2 px-4 py-1.5 bg-[var(--primary)] text-[var(--background)] font-bold text-[10px] uppercase tracking-wider hover:bg-[var(--primary)]/90 transition-colors"
          >
            Commit
          </button>
        </div>
      </div>
    </header>
  );
};
