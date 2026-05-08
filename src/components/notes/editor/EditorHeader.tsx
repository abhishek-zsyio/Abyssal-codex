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
    <header className="h-auto md:h-14 border-b border-dotted border-[var(--border)] flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 md:px-6 bg-[var(--background)] py-2 md:py-0 gap-4 md:gap-0">
      <div className="flex items-center gap-4 md:gap-8 min-w-0 flex-1">
        <div className="hidden lg:flex flex-col flex-shrink-0">
          <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-0.5">Instance_ID</span>
          <span className="text-[10px] font-mono text-[var(--primary)] font-bold">{id.split('-')[0]}</span>
        </div>
        
        <div className="h-6 w-px bg-[var(--border)] hidden lg:block opacity-50" />

        <div className="flex flex-col min-w-0 flex-1 max-w-2xl">
          <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-0.5 hidden md:block">Document_Title</span>
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] md:text-[12px] font-bold text-[var(--foreground)] uppercase tracking-widest truncate">
              {String(title || "UNTITLED_CODEX")}
            </h2>
            <AnimatePresence>
              {isSaving && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-sm shrink-0"
                >
                  <div className="w-1 h-1 bg-[var(--primary)]" />
                  <span className="text-[7px] font-mono font-bold text-[var(--primary)] uppercase tracking-widest">Syncing</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 shrink-0">
        <div className="flex items-center gap-1 border-x border-[var(--border)] border-dotted px-4 h-10 hidden sm:flex">
          <Button variant="ghost" size="icon" onClick={onToggleFavorite} title="Toggle Favorite" className="h-8 w-8">
            <Star size={14} className={cn(isFavorite ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onTogglePublic} 
            title={isPublic ? "Public Fragment (Click to make Private)" : "Private Fragment (Click to Share & Copy)"} 
            className="h-8 w-8"
          >
            {copiedShareLink ? <Check size={14} className="text-[var(--accent)]" /> : <Globe size={14} className={cn(isPublic ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]")} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onDownload} title="Download Source" className="h-8 w-8">
            <Download size={14} className="text-[var(--muted-foreground)]" />
          </Button>
          {isEnabled("zen-mode") && (
            <Button variant="ghost" size="icon" onClick={onToggleZen} title="Zen Mode (Cmd+B)" className="h-8 w-8">
              <Maximize size={14} className="text-[var(--muted-foreground)]" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleRightSidebar} 
            className={cn("h-8 w-8 transition-colors hidden xl:flex", isRightSidebarOpen && "text-[var(--primary)] bg-[var(--primary)]/10")}
          >
            <PanelRight size={14} />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[var(--card)] border border-[var(--border)] p-0.5 rounded-sm overflow-hidden shadow-inner">
            <button 
              onClick={() => onToggleEdit(true)}
              title="Switch to Write Mode"
              className={cn(
                "px-3 py-1.5 transition-all rounded-sm flex items-center justify-center", 
                isEditing ? "bg-[var(--primary)] text-[var(--background)] shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/30"
              )}
            >
              <Edit3 size={14} />
            </button>
            <button 
              onClick={() => onToggleEdit(false)}
              title="Switch to Read Mode"
              className={cn(
                "px-3 py-1.5 transition-all rounded-sm flex items-center justify-center", 
                !isEditing ? "bg-[var(--primary)] text-[var(--background)] shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/30"
              )}
            >
              <Eye size={14} />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 border-l border-[var(--border)] border-dotted pl-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (!isEditing) return;
                const editor = (window as any).editorInstance;
                if (editor) {
                  const model = editor.getModel();
                  const selection = editor.getSelection();
                  const text = selection ? model.getValueInRange(selection) : "";
                  editor.executeEdits("insert-link", [{
                    range: selection || new (window as any).monaco.Range(1, 1, 1, 1),
                    text: `[[${text}]]`,
                    forceMoveMarkers: true
                  }]);
                  editor.focus();
                }
              }} 
              className={cn("h-8 w-8", !isEditing && "opacity-30 pointer-events-none")}
              title="Insert Wiki Link"
            >
              <Link size={14} className="text-[var(--muted-foreground)]" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8" title="Copy Content">
              {copiedContent ? <Check size={14} className="text-[var(--accent)]" /> : <Copy size={14} className="text-[var(--muted-foreground)]" />}
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                const link = `[[${title || "Untitled Note"}]]`;
                navigator.clipboard.writeText(link);
                onCopyWikiLink();
              }} 
              className="h-8 w-8"
              title="Copy Wiki Link"
            >
              {copiedLink ? <Check size={14} className="text-[var(--accent)]" /> : <Hash size={14} className="text-[var(--muted-foreground)]" />}
            </Button>
          </div>

          <Button variant="primary" onClick={onCommit} size="sm" className="h-8 px-5 ml-1 font-bold">
            Commit
          </Button>
        </div>
      </div>
    </header>
  );
};
