"use client";

import React from "react";
import { Download, Upload, Trash2, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  onExport: (() => void) | undefined;
  onImportClick: () => void;
  onWipe: (() => void) | undefined;
}

export const SidebarFooter = ({ onExport, onImportClick, onWipe }: SidebarFooterProps) => {
  return (
    <div className="border-t border-[var(--border)] bg-[var(--background)]">
      {/* Primary Actions */}
      <div className="flex border-b border-[var(--border)]/30">
        <button
          onClick={onExport}
          disabled={!onExport}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-[9px] font-mono font-bold uppercase tracking-widest transition-all border-r border-[var(--border)]/30",
            onExport
              ? "text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/[0.03]"
              : "text-[var(--muted-foreground)]/20 cursor-not-allowed"
          )}
        >
          <Download size={11} />
          Export
        </button>
        <button
          onClick={onImportClick}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/[0.03] transition-all"
        >
          <Upload size={11} />
          Import
        </button>
      </div>

      {/* Maintenance Row */}
      <button
        onClick={onWipe}
        disabled={!onWipe}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 text-[8px] font-mono uppercase tracking-[0.2em] transition-all",
          onWipe
            ? "text-[var(--destructive)]/50 hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/5"
            : "text-[var(--muted-foreground)]/10 cursor-not-allowed"
        )}
      >
        <Database size={10} />
        Wipe_Local_Cache
      </button>
    </div>
  );
};

SidebarFooter.displayName = "SidebarFooter";
