"use client";

import React from "react";
import { Star, Globe, Download, Maximize, PanelRight, Edit3, Eye, Link, Copy, Check, Hash } from "lucide-react";
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
  isSaving
}: EditorHeaderProps) => {
  const { isEnabled } = usePlugins();
  
  return (
    <header className="h-14 border-b border-[var(--border)] flex items-stretch justify-between px-6 bg-[var(--card)]/40 backdrop-blur-xl relative overflow-hidden group">
      {/* Immersive Accents */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--primary)]/10 to-transparent" />

      <div className="flex items-center gap-10 min-w-0 flex-1 relative z-10">
        {/* Instance ID Removed */}

        <div className="flex flex-col min-w-0 flex-1 max-w-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-[13px] font-black text-[var(--foreground)] uppercase tracking-[0.1em] truncate">
              {String(title || "UNTITLED_CODEX")}
            </h2>
            <AnimatePresence>
              {isSaving && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 px-2 py-1 bg-[var(--primary)] text-[var(--background)] rounded-none"
                >
                  <div className="w-1.5 h-1.5 bg-[var(--background)] animate-pulse" />
                  <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em]">Syncing</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0 relative z-10">
        {/* Toolset A: Fragment Control */}
        <div className="flex items-center gap-1.5 border-x border-[var(--border)] px-6 h-full">
          <button 
            onClick={onToggleFavorite} 
            className={cn(
              "p-2.5 transition-all group/btn relative", 
              isFavorite ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <Star size={14} className={cn(isFavorite && "fill-current shadow-[0_0_10px_var(--primary)]")} />
            {isFavorite && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-[var(--primary)]" />}
          </button>
          
          <button 
            onClick={onTogglePublic} 
            className={cn(
              "p-2.5 transition-all relative", 
              isPublic ? "text-[var(--accent)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {copiedShareLink ? <Check size={14} className="text-[var(--accent)]" /> : <Globe size={14} />}
            {isPublic && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-[var(--accent)]" />}
          </button>

          <button onClick={onDownload} className="p-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">
            <Download size={14} />
          </button>

          <button 
            onClick={onToggleRightSidebar} 
            className={cn(
              "p-2.5 transition-all hidden xl:block", 
              isRightSidebarOpen ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <PanelRight size={14} />
          </button>
        </div>

        {/* Toolset B: View Switcher */}
        <div className="flex items-center p-1 bg-[var(--background)]/50 border border-[var(--border)] gap-0.5">
          <button 
            onClick={() => onToggleEdit(true)}
            className={cn(
              "px-3 py-1.5 transition-all relative overflow-hidden text-[8px] font-mono font-black uppercase tracking-widest", 
              isEditing ? "text-[var(--background)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {isEditing && <motion.div layoutId="editor-mode" className="absolute inset-0 bg-[var(--primary)] -z-10" />}
            Edit
          </button>
          <button 
            onClick={() => onToggleEdit(false)}
            className={cn(
              "px-3 py-1.5 transition-all relative overflow-hidden text-[8px] font-mono font-black uppercase tracking-widest", 
              !isEditing ? "text-[var(--background)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {!isEditing && <motion.div layoutId="editor-mode" className="absolute inset-0 bg-[var(--primary)] -z-10" />}
            Preview
          </button>
        </div>

        {/* Toolset C: Data Operations */}
        <div className="flex items-center gap-1 border-l border-[var(--border)] pl-6 h-full">
          <button onClick={onCopy} className="p-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">
            {copiedContent ? <Check size={14} className="text-[var(--accent)]" /> : <Copy size={14} />}
          </button>

          <button 
            onClick={onCommit} 
            className="h-8 px-6 ml-4 bg-[var(--primary)] text-[var(--background)] font-black text-[9px] uppercase tracking-[0.2em] relative group/commit overflow-hidden"
          >
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/commit:translate-y-0 transition-transform duration-300" />
             <div className="relative z-10 flex items-center gap-2">
                <Hash size={10} className="opacity-50" />
                Commit
             </div>
          </button>
        </div>
      </div>
    </header>
  );
};
