"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Wifi, Shield } from "lucide-react";

interface EditorFooterProps {
  noteId: string;
}

export const EditorFooter = ({ noteId }: EditorFooterProps) => {
  return (
    <footer className="h-8 border-t border-[var(--border)] px-4 flex items-center justify-between text-[8px] font-mono text-[var(--muted-foreground)] bg-[var(--background)] select-none">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
           <div className="w-1 h-1 bg-[var(--primary)] rounded-full animate-pulse" />
           <span className="uppercase tracking-[0.2em] font-bold text-[var(--foreground)]">Kernel_Live</span>
        </div>
        <div className="flex items-center gap-4 opacity-40">
          <div className="flex items-center gap-1">
            <Cpu size={10} />
            <span className="uppercase">Core_Active</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi size={10} />
            <span className="uppercase">Local_Only</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
         <div className="flex items-center gap-2 opacity-30">
           <span className="uppercase">ID:{noteId.split('-')[0].toUpperCase()}</span>
           <span className="uppercase tracking-widest">UTF-8</span>
         </div>
         <div className="h-3 w-px bg-[var(--border)]" />
         <div className="flex items-center gap-1.5 text-[var(--accent)]">
            <Shield size={10} />
            <span className="uppercase tracking-widest font-bold">Secure</span>
         </div>
      </div>
    </footer>
  );
};

EditorFooter.displayName = "EditorFooter";
