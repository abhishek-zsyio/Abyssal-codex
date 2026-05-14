"use client";

import React from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SidebarFooterProps {
  onExport: (() => void) | undefined;
  onImportClick: () => void;
  onWipe: (() => void) | undefined;
}

export const SidebarFooter = ({
  onExport,
  onImportClick,
  onWipe,
}: SidebarFooterProps) => {
  return (
    <div className="p-6 border-t border-dotted border-[var(--border)] bg-[var(--background)]">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Button 
          onClick={onExport} 
          size="sm" 
          className="bg-[var(--card)]/50 hover:bg-[var(--card)] border-[var(--border)] rounded-none h-9"
          disabled={!onExport}
        >
          <Download size={12} className="mr-2" /> Export
        </Button>
        <Button 
          onClick={onImportClick} 
          size="sm" 
          className="bg-[var(--card)]/50 hover:bg-[var(--card)] border-[var(--border)] rounded-none h-9"
        >
          <Upload size={12} className="mr-2" /> Import
        </Button>
      </div>
      <Button 
        onClick={onWipe} 
        variant="destructive" 
        size="sm" 
        className="w-full bg-[var(--destructive)]/10 hover:bg-[var(--destructive)] text-[var(--destructive)] hover:text-white border-[var(--destructive)]/30 text-[10px] font-mono tracking-widest h-10 rounded-none"
        disabled={!onWipe}
      >
        <Trash2 size={12} className="mr-2" /> WIPE_ALL_BUFFERS
      </Button>
    </div>
  );
};

SidebarFooter.displayName = "SidebarFooter";
